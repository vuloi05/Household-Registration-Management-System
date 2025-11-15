import json
import re
from typing import Optional, List, Dict, Any
from .backend_api import search_nhan_khau_by_address, search_nhan_khau_by_name_and_address


def infer_actions(message: str) -> list[dict]:
    text = (message or "").strip()
    lower = text.lower()

    actions: list[dict] = []

    # Heuristic entity extraction
    household_id = extract_household_id(text)
    person_id = extract_person_id(text)
    name_query = extract_name_query(text)
    owner_name = extract_owner_name(text)
    address_query = extract_address(text)

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
                # Nếu người dùng đề cập tên chủ hộ, thực hiện tìm kiếm theo tên
                if owner_name or name_query:
                    actions.append({
                        "type": "search",
                        "target": "household_list",
                        "params": {"q": owner_name or name_query}
                    })
        else:
            actions.append({"type": "navigate", "target": "household_list"})
            if owner_name or name_query:
                actions.append({
                    "type": "search",
                    "target": "household_list",
                    "params": {"q": owner_name or name_query}
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
            if household_id or name_query:
                actions.append({"type": "navigate", "target": "household_list"})
                actions.append({
                    "type": "search",
                    "target": "household_list",
                    "params": {"q": household_id or name_query}
                })

    # Xử lý địa chỉ - khi người dùng cung cấp địa chỉ để refine search
    if address_query:
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


def extract_household_id(text: str) -> Optional[str]:
    m = re.search(r"\b(HK[-_ ]?\d{2,})\b", text, flags=re.IGNORECASE)
    if m:
        return m.group(1).replace(" ", "").upper()
    m2 = re.search(r"mã\s*hộ\s*khẩu\s*[:#]?\s*([A-Z]{1,3}[-_]?\d{2,})", text, flags=re.IGNORECASE)
    if m2:
        return m2.group(1).replace(" ", "").upper()
    return None


def extract_person_id(text: str) -> Optional[str]:
    m = re.search(r"\b(?:CCCD|CMND)\s*[:#]?\s*(\d{9,12})\b", text, flags=re.IGNORECASE)
    if m:
        return m.group(1)
    m2 = re.search(r"\b(\d{12})\b", text)
    if m2:
        return m2.group(1)
    return None


def extract_name_query(text: str) -> Optional[str]:
    m = re.search(r"(?:tên|ten|name)\s*[:#]?\s*\"([^\"]+)\"", text, flags=re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m2 = re.search(r"\"([^\"]+)\"", text)
    if m2:
        return m2.group(1).strip()
    m3 = re.search(r"(?:tìm|tim|search)\s+(.+)$", text, flags=re.IGNORECASE)
    if m3:
        return m3.group(1).strip()
    m4 = re.search(
        r"(?:nhân\s*khẩu|nhan\s*khau|người|nguoi|person|thành\s*viên|thanh\s*vien)\s+(?:tên\s+|ten\s+|là\s+|la\s+)?([A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐ][^\n,.;!?]+)",
        text,
        flags=re.IGNORECASE,
    )
    if m4:
        candidate = m4.group(1).strip()
        stop_words = {"vào", "vao", "ở", "o", "thuộc", "thuoc", "tại", "tai", "trong", "trên", "tren", "nào", "nao"}
        tokens = candidate.split()
        cleaned_tokens: list[str] = []
        for token in tokens:
            if token.lower() in stop_words:
                break
            cleaned_tokens.append(token)
        candidate = " ".join(cleaned_tokens).strip()
        # Loại bỏ các từ mô tả ở cuối như 'này', 'đó', 'nào'
        trailing_tokens = {"này", "nay", "đó", "do", "kia", "nào", "nao"}
        tokens = candidate.split()
        while tokens and tokens[-1].lower() in trailing_tokens:
            tokens.pop()
        # Loại bỏ "nào" nếu có ở đầu
        while tokens and tokens[0].lower() in {"nào", "nao"}:
            tokens.pop(0)
        candidate = " ".join(tokens).strip()
        # Không trả về nếu chỉ còn "nào" hoặc rỗng
        if candidate and candidate.lower() not in {"nào", "nao"}:
            return candidate
    return None


def extract_owner_name(text: str) -> Optional[str]:
    """Trích xuất tên sau cụm 'chủ hộ' hoặc 'chu ho'.
    Ví dụ: 'xem hộ khẩu của chủ hộ Bùi Tiến Dũng' -> 'Bùi Tiến Dũng'
    """
    m = re.search(r"ch[uư]\s*h[ôo]\s*(?:[:#]?\s*)?(?:tên\s*)?(?:là\s*)?([A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐ][^\d\n,.;!?]+)$",
                  text, flags=re.IGNORECASE)
    if m:
        return m.group(1).strip()
    # Bắt cụm 'của chủ hộ <tên>' phổ biến
    m2 = re.search(r"của\s+ch[uư]\s*h[ôo]\s+([^\d\n,.;!?]+)$", text, flags=re.IGNORECASE)
    if m2:
        return m2.group(1).strip()
    return None


def extract_address(text: str) -> Optional[str]:
    """Trích xuất địa chỉ từ câu hỏi.
    Ví dụ: 'có người nào ở Biệt thự The Vesta không' -> 'Biệt thự The Vesta'
    """
    # Pattern cho "có người nào ở <địa chỉ>" - ưu tiên pattern này
    m2 = re.search(r"có\s+người\s+nào\s+ở\s+([A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐa-zàáâãäåāăąæçèéêëēĕėęěìíîïīįıñòóôõöøōŏőùúûüūŭůűųỳýỷỹỵđ][^\n,.;!?]+?)(?:\s+không|\s+ko|\s+khong|\s+hãy|\s+hay|\s+mở|\s+mo|\s+giúp|\s+giup|\s+tôi|\s+toi|$)", text, flags=re.IGNORECASE)
    if m2:
        addr = m2.group(1).strip()
        stop_words = {"không", "khong", "ko", "hãy", "hay", "mở", "mo", "giúp", "giup", "tôi", "toi", "nào", "nao"}
        tokens = addr.split()
        # Loại bỏ từ "nào" nếu có ở đầu hoặc cuối
        tokens = [t for t in tokens if t.lower() not in {"nào", "nao"}]
        while tokens and tokens[-1].lower() in stop_words:
            tokens.pop()
        if tokens:
            return " ".join(tokens).strip()
    
    # Pattern cho "ở <địa chỉ>" - cải thiện để bắt cả chữ thường và chữ hoa
    m = re.search(r"(?:ở|o|tại|tai|thuộc|thuoc)\s+([A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐa-zàáâãäåāăąæçèéêëēĕėęěìíîïīįıñòóôõöøōŏőùúûüūŭůűųỳýỷỹỵđ][^\n,.;!?]+?)(?:\s+không|\s+ko|\s+khong|\s+hãy|\s+hay|\s+mở|\s+mo|\s+giúp|\s+giup|\s+tôi|\s+toi|$)", text, flags=re.IGNORECASE)
    if m:
        addr = m.group(1).strip()
        # Loại bỏ các từ thừa ở cuối
        stop_words = {"không", "khong", "ko", "hãy", "hay", "mở", "mo", "giúp", "giup", "tôi", "toi", "không hãy", "khong hay", "nào", "nao"}
        tokens = addr.split()
        # Loại bỏ từ "nào" nếu có
        tokens = [t for t in tokens if t.lower() not in {"nào", "nao"}]
        # Loại bỏ từ cuối nếu là stop word
        while tokens and tokens[-1].lower() in stop_words:
            tokens.pop()
        if tokens:
            return " ".join(tokens).strip()
    return None


