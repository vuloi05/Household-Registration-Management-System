import json
import re
from typing import Optional


def infer_actions(message: str) -> list[dict]:
    text = (message or "").strip()
    lower = text.lower()

    actions: list[dict] = []

    # Heuristic entity extraction
    household_id = extract_household_id(text)
    person_id = extract_person_id(text)
    name_query = extract_name_query(text)

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
        else:
            actions.append({"type": "navigate", "target": "household_list"})

    # Điều hướng nhân khẩu
    if any(k in lower for k in ["nhân khẩu", "nhan khau", "person", "thành viên", "thanh vien"]):
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

    # Deduplicate
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
    return None


