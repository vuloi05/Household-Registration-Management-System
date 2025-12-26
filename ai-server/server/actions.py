import json
import re
from typing import Optional, List, Dict, Any
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


def infer_actions(message: str, history: Optional[List[Dict]] = None) -> list[dict]:
    text = (message or "").strip()
    lower = text.lower()

    actions: list[dict] = []

    # Heuristic entity extraction
    household_id = extract_household_id(text)
    person_id = extract_person_id(text)
    name_query = extract_name_query(text)
    owner_name = extract_owner_name(text)
    address_query = extract_address(text)
    
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
            # Gọi backend API để tìm kiếm thực tế
            results: List[Dict[str, Any]] = []
            # Chỉ kết hợp tên nếu tên thực sự có trong câu hiện tại (không phải từ context trước)
            # Kiểm tra xem có tên trong câu không (không chỉ là từ "nào")
            has_name_in_current_message = bool(name_query and name_query.strip() and name_query.lower() not in {"nào", "nao"})
            
            if has_name_in_current_message:
                # Tìm theo tên + địa chỉ
                results = search_nhan_khau_by_name_and_address(name_query, address_query)
            else:
                # Chỉ tìm theo địa chỉ (không kết hợp với tên từ context trước)
                results = search_nhan_khau_by_address(address_query)
            
            if results:
                if len(results) == 1:
                    # Chỉ có 1 kết quả -> mở chi tiết trực tiếp
                    person = results[0]
                    person_id = person.get("cmndCccd") or str(person.get("id", ""))
                    actions.append({"type": "navigate", "target": "person_list"})
                    actions.append({
                        "type": "navigate",
                        "target": "person_detail",
                        "params": {"personId": person_id}
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

    unique: list[dict] = []
    seen: set[tuple] = set()
    for act in actions:
        key = (act.get("type"), act.get("target"), json.dumps(act.get("params", {}), sort_keys=True, ensure_ascii=False))
        if key not in seen:
            unique.append(act)
            seen.add(key)
    return unique