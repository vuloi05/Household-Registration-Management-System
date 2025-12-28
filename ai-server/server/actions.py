import json
import re
from typing import Optional, List, Dict, Any, Tuple
from .backend_api import search_nhan_khau_by_address, search_nhan_khau_by_name_and_address
from .query_utils import (
    extract_owner_name_from_history,
    build_search_query,
    clean_query_text,
    extract_household_id,
    extract_person_id,
    extract_name_query,
    extract_owner_name,
    extract_address,
)
from .exceptions import ValidationError
try:
    from .app import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


# Configuration
DEFAULT_CONFIDENCE_THRESHOLD = 0.5
USE_LLM_FOR_ENTITIES = False  # Có thể bật nếu muốn dùng LLM cho entity extraction


def calculate_action_confidence(message: str, action: Dict[str, Any], entities: Dict[str, Any]) -> float:
    """
    Tính confidence score cho một action dựa trên:
    - Keyword matching strength
    - Entity extraction quality
    - Context relevance
    - Action type specificity
    
    Args:
        message: User message
        action: Action dict với type, target, params
        entities: Dict chứa các entities đã extract (household_id, person_id, name_query, etc.)
    
    Returns:
        Confidence score từ 0.0 đến 1.0
    """
    confidence = 0.0
    text = (message or "").strip()
    lower = text.lower()
    action_type = action.get("type", "")
    target = action.get("target", "")
    params = action.get("params", {})
    
    # Base confidence từ action type
    type_weights = {
        "navigate": 0.3,
        "search": 0.4,
    }
    confidence += type_weights.get(action_type, 0.2)
    
    # Keyword matching strength (0.0 - 0.4)
    keyword_scores = {
        "household_list": {
            "keywords": ["hộ khẩu", "ho khau", "household", "danh sách", "danh sach", "list"],
            "weight": 0.4
        },
        "household_detail": {
            "keywords": ["chi tiết", "chi tiet", "detail", "mở", "mo", "xem"],
            "weight": 0.4
        },
        "person_list": {
            "keywords": ["nhân khẩu", "nhan khau", "person", "thành viên", "thanh vien", "người", "nguoi"],
            "weight": 0.4
        },
        "person_detail": {
            "keywords": ["chi tiết", "chi tiet", "detail", "xem", "mở", "mo"],
            "weight": 0.4
        },
        "fees": {
            "keywords": ["thu phí", "thu phi", "khoản thu", "khoan thu", "fees", "fee", "payment"],
            "weight": 0.5
        },
        "dashboard": {
            "keywords": ["thống kê", "thong ke", "dashboard", "statistics"],
            "weight": 0.5
        },
        "login": {
            "keywords": ["đăng nhập", "dang nhap", "login"],
            "weight": 0.6
        },
    }
    
    if target in keyword_scores:
        config = keyword_scores[target]
        matched_keywords = sum(1 for kw in config["keywords"] if kw in lower)
        if matched_keywords > 0:
            keyword_match_score = min(matched_keywords / len(config["keywords"]), 1.0)
            confidence += keyword_match_score * config["weight"]
    
    # Entity extraction quality (0.0 - 0.3)
    entity_score = 0.0
    if target in ("household_detail", "person_detail"):
        # Chi tiết cần có ID rõ ràng
        if target == "household_detail" and entities.get("household_id"):
            entity_score += 0.3
        elif target == "person_detail" and entities.get("person_id"):
            entity_score += 0.3
        elif target == "person_detail" and entities.get("name_query"):
            entity_score += 0.2  # Tên có độ chính xác thấp hơn ID
    elif target.endswith("_list") and action_type == "search":
        # Search cần có query parameters
        if params.get("q"):
            query = params.get("q", "").strip()
            # Query càng dài và có ý nghĩa thì confidence càng cao
            if len(query) >= 3:
                entity_score += 0.2
            if len(query) >= 6:
                entity_score += 0.1
    elif action_type == "navigate" and not params:
        # Navigate không cần params -> confidence cao hơn
        entity_score += 0.15
    
    confidence += entity_score
    
    # Context relevance (0.0 - 0.1)
    # Nếu có nhiều entities liên quan, confidence cao hơn
    relevant_entities = [
        entities.get("household_id"),
        entities.get("person_id"),
        entities.get("owner_name"),
        entities.get("address_query"),
        entities.get("name_query"),
    ]
    entity_count = sum(1 for e in relevant_entities if e)
    if entity_count > 0:
        confidence += min(entity_count * 0.03, 0.1)
    
    # Action specificity boost
    # Một số actions rất cụ thể -> confidence cao
    if target == "login" and "đăng nhập" in lower or "login" in lower:
        confidence = max(confidence, 0.9)
    if target == "dashboard" and any(k in lower for k in ["thống kê", "dashboard"]):
        confidence = max(confidence, 0.85)
    
    # Normalize về range [0.0, 1.0]
    confidence = min(max(confidence, 0.0), 1.0)
    
    return confidence


def validate_action(action: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate action parameters và structure.
    
    Args:
        action: Action dict cần validate
    
    Returns:
        Tuple (is_valid, error_message)
    """
    if not isinstance(action, dict):
        return False, "Action must be a dictionary"
    
    action_type = action.get("type")
    if not action_type or not isinstance(action_type, str):
        return False, "Action must have 'type' field"
    
    if action_type not in ("navigate", "search", "update", "delete", "create"):
        return False, f"Invalid action type: {action_type}"
    
    target = action.get("target")
    if not target or not isinstance(target, str):
        return False, "Action must have 'target' field"
    
    # Validate params nếu có
    params = action.get("params")
    if params is not None:
        if not isinstance(params, dict):
            return False, "Action params must be a dictionary"
        
        # Validate specific target params
        if target == "household_detail":
            if "householdId" not in params:
                return False, "household_detail action requires 'householdId' in params"
            household_id = params.get("householdId")
            if not household_id or not isinstance(household_id, str):
                return False, "householdId must be a non-empty string"
        
        elif target == "person_detail":
            if "personId" not in params:
                return False, "person_detail action requires 'personId' in params"
            person_id = params.get("personId")
            if not person_id or not isinstance(person_id, (str, int)):
                return False, "personId must be a non-empty string or integer"
        
        elif action_type == "search":
            if "q" not in params:
                return False, "search action requires 'q' (query) in params"
            query = params.get("q")
            if not query or not isinstance(query, str) or not query.strip():
                return False, "search query 'q' must be a non-empty string"
    
    return True, None


def extract_entities_with_llm(message: str, history: Optional[List[Dict]] = None) -> Dict[str, Any]:
    """
    Extract entities sử dụng LLM (optional enhancement).
    Fallback về heuristic extraction nếu LLM không available.
    
    Args:
        message: User message
        history: Conversation history
    
    Returns:
        Dict chứa các entities đã extract
    """
    # Fallback về heuristic extraction
    household_id = extract_household_id(message)
    person_id = extract_person_id(message)
    name_query = extract_name_query(message)
    owner_name = extract_owner_name(message)
    address_query = extract_address(message)
    
    # Nếu bật LLM và có thể sử dụng
    if USE_LLM_FOR_ENTITIES:
        try:
            # Thử gọi LLM để extract entities chính xác hơn
            # TODO: Implement LLM-based extraction khi cần
            # Ví dụ: sử dụng structured output từ Gemini/Ollama
            pass
        except Exception as e:
            logger.warning(f"LLM entity extraction failed, using heuristic: {e}")
    
    # Xử lý owner_name từ history (giữ nguyên logic cũ)
    if address_query and not owner_name and history:
        owner_name_from_history = extract_owner_name_from_history(history)
        if owner_name_from_history:
            owner_name = owner_name_from_history
    
    if not owner_name and history:
        owner_name_from_history = extract_owner_name_from_history(history)
        if owner_name_from_history:
            owner_name = owner_name_from_history
    
    return {
        "household_id": household_id,
        "person_id": person_id,
        "name_query": name_query,
        "owner_name": owner_name,
        "address_query": address_query,
    }


def infer_actions_with_confidence(
    message: str, 
    history: Optional[List[Dict]] = None,
    confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Infer actions với confidence scoring và validation.
    
    Args:
        message: User message
        history: Conversation history
        confidence_threshold: Minimum confidence score (default 0.5)
    
    Returns:
        List of actions với confidence scores, đã được filter và validate
    """
    try:
        # Extract entities
        entities = extract_entities_with_llm(message, history)
        
        # Infer actions (giữ nguyên logic cũ)
        raw_actions = infer_actions(message, history)
        
        # Thêm confidence scores và validate
        validated_actions: List[Dict[str, Any]] = []
        
        for action in raw_actions:
            # Validate action
            is_valid, error_msg = validate_action(action)
            if not is_valid:
                logger.warning(
                    f"Invalid action filtered out: {error_msg}",
                    extra={"action": action, "message": message[:100]}
                )
                continue
            
            # Tính confidence score
            confidence = calculate_action_confidence(message, action, entities)
            action["confidence"] = confidence
            
            # Filter actions với confidence thấp
            if confidence >= confidence_threshold:
                validated_actions.append(action)
            else:
                logger.debug(
                    f"Action filtered due to low confidence: {confidence:.2f} < {confidence_threshold}",
                    extra={"action": action, "confidence": confidence}
                )
        
        # Sort theo confidence (cao -> thấp)
        validated_actions.sort(key=lambda a: a.get("confidence", 0.0), reverse=True)
        
        return validated_actions
        
    except Exception as e:
        logger.error(
            f"Error in infer_actions_with_confidence: {str(e)}",
            exc_info=True,
            extra={"message": message[:100] if message else None}
        )
        # Fallback: return empty list hoặc actions cơ bản
        return []


def infer_actions(message: str, history: Optional[List[Dict]] = None) -> list[dict]:
    """
    Infer actions từ user message (core logic, không có confidence scoring).
    Function này được dùng bởi infer_actions_with_confidence().
    
    Args:
        message: User message
        history: Conversation history
    
    Returns:
        List of actions (chưa có confidence scores)
    """
    try:
        text = (message or "").strip()
        lower = text.lower()

        actions: list[dict] = []

        # Heuristic entity extraction với error handling
        try:
            household_id = extract_household_id(text)
            person_id = extract_person_id(text)
            name_query = extract_name_query(text)
            owner_name = extract_owner_name(text)
            address_query = extract_address(text)
        except Exception as e:
            logger.warning(f"Error in entity extraction: {e}", exc_info=True)
            # Fallback values
            household_id = None
            person_id = None
            name_query = None
            owner_name = None
            address_query = None
        
        # QUAN TRỌNG: Nếu có address_query nhưng không có owner_name trong message hiện tại,
        # LUÔN tìm owner_name từ history để kết hợp (không chỉ khi owner_name rỗng)
        # Điều này đảm bảo khi người dùng nói "hộ khẩu ấy ở Đường Ao Sen", 
        # hệ thống sẽ tìm "Bùi Tiến Dũng" từ history và kết hợp thành "Bùi Tiến Dũng Đường Ao Sen"
        # ƯU TIÊN: Tìm owner_name từ history TRƯỚC khi xử lý các nhánh logic khác
        if address_query and not owner_name and history:
            owner_name_from_history = extract_owner_name_from_history(history)
            if owner_name_from_history:
                owner_name = owner_name_from_history
        
        # Nếu vẫn không có owner_name và có history, thử tìm lại (fallback)
        if not owner_name and history:
            owner_name_from_history = extract_owner_name_from_history(history)
            if owner_name_from_history:
                owner_name = owner_name_from_history

        # Điều hướng hộ khẩu
        if any(k in lower for k in ["hộ khẩu", "ho khau", "household"]):
            if any(k in lower for k in ["danh sách", "danh sach", "list"]):
                actions.append({"type": "navigate", "target": "household_list"})
        elif any(k in lower for k in ["chi tiết", "chi tiet", "detail", "mở", "mo", "xem"]):
            if household_id:
                actions.append({
                    "type": "navigate",
                    "target": "household_detail",
                    "params": {"householdId": household_id}
                })
            else:
                actions.append({"type": "navigate", "target": "household_list"})
                # Kết hợp tên chủ hộ và địa chỉ nếu có
                # QUAN TRỌNG: Nếu có address_query nhưng chưa có owner_name, tìm lại từ history
                # (đảm bảo không bị miss trong trường hợp đặc biệt)
                if address_query and not owner_name and history:
                    owner_name_from_history = extract_owner_name_from_history(history)
                    if owner_name_from_history:
                        owner_name = owner_name_from_history
                search_query = build_search_query(name=owner_name, address=address_query, name_query=name_query)
                if search_query:
                    actions.append({
                        "type": "search",
                        "target": "household_list",
                        "params": {"q": search_query}
                    })
        else:
            actions.append({"type": "navigate", "target": "household_list"})
            # Kết hợp tên chủ hộ và địa chỉ nếu có
            # QUAN TRỌNG: Nếu có address_query nhưng chưa có owner_name, tìm lại từ history
            # (đảm bảo không bị miss trong trường hợp đặc biệt)
            if address_query and not owner_name and history:
                owner_name_from_history = extract_owner_name_from_history(history)
                if owner_name_from_history:
                    owner_name = owner_name_from_history
            
            search_query = build_search_query(name=owner_name, address=address_query, name_query=name_query)
            if search_query:
                actions.append({
                    "type": "search",
                    "target": "household_list",
                    "params": {"q": search_query}
                })

        # Điều hướng nhân khẩu
        if any(k in lower for k in ["nhân khẩu", "nhan khau", "person", "thành viên", "thanh vien", "người", "nguoi"]):
            if any(k in lower for k in ["danh sách", "danh sach", "list"]):
                actions.append({"type": "navigate", "target": "person_list"})
                if name_query:
                    actions.append({
                        "type": "search",
                        "target": "person_list",
                        "params": {"q": name_query}
                    })
            elif any(k in lower for k in ["chi tiết", "chi tiet", "detail", "xem", "mở", "mo"]):
                if person_id:
                    actions.append({
                        "type": "navigate",
                        "target": "person_detail",
                        "params": {"personId": person_id}
                    })
                elif name_query:
                    actions.append({"type": "navigate", "target": "person_list"})
                    actions.append({
                        "type": "search",
                        "target": "person_list",
                        "params": {"q": name_query}
                    })
                else:
                    actions.append({"type": "navigate", "target": "person_list"})

        # Thu phí / khoản thu
        if any(k in lower for k in ["thu phí", "thu phi", "khoản thu", "khoan thu", "fees", "fee", "payment"]):
            actions.append({"type": "navigate", "target": "fees"})

        # Dashboard thống kê
        if any(k in lower for k in ["thống kê", "thong ke", "dashboard", "statistics"]):
            actions.append({"type": "navigate", "target": "dashboard"})

        # Đăng nhập
        if any(k in lower for k in ["đăng nhập", "dang nhap", "login"]):
            actions.append({"type": "navigate", "target": "login"})

        # Tìm kiếm chung
        if any(k in lower for k in ["tìm", "tim", "search"]):
            if any(k in lower for k in ["nhân khẩu", "nhan khau", "person", "thành viên", "thanh vien"]):
                if name_query or person_id:
                    actions.append({"type": "navigate", "target": "person_list"})
                    actions.append({
                        "type": "search",
                        "target": "person_list",
                        "params": {"q": person_id or name_query}
                    })
            elif any(k in lower for k in ["hộ khẩu", "ho khau", "household"]):
                if household_id:
                    actions.append({"type": "navigate", "target": "household_list"})
                    actions.append({
                        "type": "search",
                        "target": "household_list",
                        "params": {"q": household_id}
                    })
            else:
                # Kết hợp tên chủ hộ và địa chỉ nếu có
                # QUAN TRỌNG: Nếu có address_query nhưng chưa có owner_name, tìm lại từ history
                # (đảm bảo không bị miss trong trường hợp đặc biệt)
                if address_query and not owner_name and history:
                    owner_name_from_history = extract_owner_name_from_history(history)
                    if owner_name_from_history:
                        owner_name = owner_name_from_history
                search_query = build_search_query(name=owner_name, address=address_query, name_query=name_query)
                if search_query:
                    actions.append({"type": "navigate", "target": "household_list"})
                    actions.append({
                        "type": "search",
                        "target": "household_list",
                        "params": {"q": search_query}
                    })

        # Xử lý địa chỉ - khi người dùng cung cấp địa chỉ để refine search
        # QUAN TRỌNG: Chỉ xử lý nếu chưa có action search cho household_list (để tránh override)
        has_household_search = any(
            act.get("type") == "search" and act.get("target") == "household_list" 
            for act in actions
        )
        
        if address_query and not has_household_search:
            # Nếu có từ "có người nào ở", "mở", "xem" và có địa chỉ -> tìm kiếm nhân khẩu
            if any(k in lower for k in ["có người nào", "co nguoi nao", "mở", "mo", "xem", "mở giúp", "mo giup"]):
                # Gọi backend API để tìm kiếm thực tế với error handling
                results: List[Dict[str, Any]] = []
                try:
                    # Chỉ kết hợp tên nếu tên thực sự có trong câu hiện tại (không phải từ context trước)
                    # Kiểm tra xem có tên trong câu không (không chỉ là từ "nào")
                    has_name_in_current_message = bool(name_query and name_query.strip() and name_query.lower() not in {"nào", "nao"})
                    
                    if has_name_in_current_message:
                        # Tìm theo tên + địa chỉ
                        results = search_nhan_khau_by_name_and_address(name_query, address_query)
                    else:
                        # Chỉ tìm theo địa chỉ (không kết hợp với tên từ context trước)
                        results = search_nhan_khau_by_address(address_query)
                except Exception as e:
                    logger.error(f"Error calling backend API for person search: {e}", exc_info=True)
                    # Fallback: chỉ tìm kiếm với địa chỉ
                    results = []
                
                if results:
                    if len(results) == 1:
                        # Chỉ có 1 kết quả -> mở chi tiết trực tiếp
                        try:
                            person = results[0]
                            person_id = person.get("cmndCccd") or str(person.get("id", ""))
                            if person_id:
                                actions.append({"type": "navigate", "target": "person_list"})
                                actions.append({
                                    "type": "navigate",
                                    "target": "person_detail",
                                    "params": {"personId": person_id}
                                })
                        except Exception as e:
                            logger.warning(f"Error processing person result: {e}", exc_info=True)
                            # Fallback: search với địa chỉ
                            actions.append({"type": "navigate", "target": "person_list"})
                            actions.append({
                                "type": "search",
                                "target": "person_list",
                                "params": {"q": address_query}
                            })
                    else:
                        # Có nhiều kết quả -> chỉ tìm kiếm với địa chỉ (không kết hợp tên)
                        actions.append({"type": "navigate", "target": "person_list"})
                        actions.append({
                            "type": "search",
                            "target": "person_list",
                            "params": {"q": address_query}
                        })
                else:
                    # Không tìm thấy -> chỉ tìm kiếm với địa chỉ
                    actions.append({"type": "navigate", "target": "person_list"})
                    actions.append({
                        "type": "search",
                        "target": "person_list",
                        "params": {"q": address_query}
                    })

        # Deduplicate
        if person_id:
            has_person_action = any(act.get("target") in {"person_list", "person_detail"} for act in actions)
            if not has_person_action:
                actions.append({"type": "navigate", "target": "person_list"})
                actions.append({
                    "type": "search",
                    "target": "person_list",
                    "params": {"q": person_id}
                })
                actions.append({
                    "type": "navigate",
                    "target": "person_detail",
                    "params": {"personId": person_id}
                })

        # Deduplicate actions
        unique: list[dict] = []
        seen: set[tuple] = set()
        for act in actions:
            try:
                key = (act.get("type"), act.get("target"), json.dumps(act.get("params", {}), sort_keys=True, ensure_ascii=False))
                if key not in seen:
                    unique.append(act)
                    seen.add(key)
            except Exception as e:
                logger.warning(f"Error processing action for deduplication: {e}", exc_info=True, extra={"action": act})
                # Skip invalid actions
                continue
        
        return unique
        
    except Exception as e:
        logger.error(
            f"Error in infer_actions: {str(e)}",
            exc_info=True,
            extra={"message": message[:100] if message else None}
        )
        # Return empty list on error để không break application
        return []