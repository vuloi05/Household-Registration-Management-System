import re
from typing import Optional, List, Dict, Any


def extract_owner_name_from_history(history: Optional[List[Dict]] = None) -> Optional[str]:
    """
    Trích xuất tên chủ hộ từ conversation history.
    Tìm trong các message trước đó các pattern như "chủ hộ Bùi Tiến Dũng" hoặc "hộ khẩu Bùi Tiến Dũng".
    
    Args:
        history: Conversation history [{'role': str, 'content': str}, ...]
    
    Returns:
        Tên chủ hộ nếu tìm thấy, None nếu không
    """
    if not history:
        return None
    
    # Tìm trong các message gần nhất (từ cuối lên đầu)
    # Ưu tiên tìm trong message của user trước
    for msg in reversed(history):
        content = msg.get('content', '')
        role = msg.get('role', '')
        if not content:
            continue
        
        # Ưu tiên tìm trong message của user (không phải assistant)
        if role == 'user':
            # Thử extract từ message này
            owner_name = extract_owner_name(content)
            if owner_name:
                return owner_name
            
            # Cũng thử extract từ name_query
            name_query = extract_name_query(content)
            if name_query:
                # Kiểm tra xem có phải là tên người không (có chữ cái đầu viết hoa)
                if re.match(r'^[A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐ]', name_query):
                    # Loại bỏ các từ không phải tên
                    cleaned = clean_query_text(name_query)
                    if cleaned and len(cleaned.split()) >= 2:  # Ít nhất 2 từ (họ và tên)
                        return cleaned
    
    # Nếu không tìm thấy trong user messages, thử tìm trong tất cả messages
    for msg in reversed(history):
        content = msg.get('content', '')
        if not content:
            continue
        
        # Thử extract từ message này
        owner_name = extract_owner_name(content)
        if owner_name:
            return owner_name
        
        # Cũng thử extract từ name_query
        name_query = extract_name_query(content)
        if name_query:
            # Kiểm tra xem có phải là tên người không (có chữ cái đầu viết hoa)
            if re.match(r'^[A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐ]', name_query):
                # Loại bỏ các từ không phải tên
                cleaned = clean_query_text(name_query)
                if cleaned and len(cleaned.split()) >= 2:  # Ít nhất 2 từ (họ và tên)
                    return cleaned
    
    return None


def build_search_query(name: Optional[str] = None, address: Optional[str] = None, name_query: Optional[str] = None) -> Optional[str]:
    """
    Xây dựng query tìm kiếm từ tên và địa chỉ, loại bỏ các từ không cần thiết.
    
    Args:
        name: Tên chủ hộ hoặc tên người
        address: Địa chỉ
        name_query: Query tên từ extract_name_query (fallback)
    
    Returns:
        Query đã được làm sạch, hoặc None nếu không có thông tin
    """
    parts = []
    
    # Ưu tiên name (owner_name) hơn name_query
    if name:
        parts.append(name.strip())
    elif name_query:
        # Làm sạch name_query - loại bỏ các từ không cần thiết
        cleaned_name = clean_query_text(name_query)
        if cleaned_name:
            parts.append(cleaned_name)
    
    if address:
        parts.append(address.strip())
    
    if not parts:
        return None
    
    # Kết hợp và làm sạch toàn bộ query
    combined = " ".join(parts)
    return clean_query_text(combined)


def clean_query_text(text: str) -> str:
    """
    Làm sạch text query, loại bỏ các từ không cần thiết.
    
    Args:
        text: Text cần làm sạch
    
    Returns:
        Text đã được làm sạch
    """
    if not text:
        return ""
    
    # Các từ cần loại bỏ
    stop_words = {
        "tôi", "toi", "muốn", "muon", "tìm", "tim", "kiếm", "kiem",
        "hộ khẩu", "ho khau", "household",
        "nhân khẩu", "nhan khau", "person",
        "của", "cua", "chủ hộ", "chu ho",
        "ở", "o", "tại", "tai", "thuộc", "thuoc",
        "về", "ve", "cho", "giúp", "giup",
        "nào", "nao", "này", "nay", "đó", "do",
        "đấy", "day", "ấy", "ay", "đó", "do", "kia"
    }
    
    # Chuyển thành lowercase để so sánh
    text_lower = text.lower()
    
    # Loại bỏ các cụm từ không cần thiết ở đầu
    prefixes_to_remove = [
        r"^tôi\s+muốn\s+tìm\s+",
        r"^tôi\s+muốn\s+",
        r"^muốn\s+tìm\s+",
        r"^tìm\s+",
        r"^hộ\s+khẩu\s+",
        r"^ho\s+khau\s+",
        r"^nhân\s+khẩu\s+",
        r"^nhan\s+khau\s+",
    ]
    
    cleaned = text
    for prefix in prefixes_to_remove:
        cleaned = re.sub(prefix, "", cleaned, flags=re.IGNORECASE)
    
    # Loại bỏ các từ stop words đứng riêng lẻ
    tokens = cleaned.split()
    filtered_tokens = []
    for token in tokens:
        token_lower = token.lower().strip()
        # Giữ lại token nếu không phải stop word hoặc là một phần của từ ghép
        if token_lower not in stop_words:
            filtered_tokens.append(token)
    
    result = " ".join(filtered_tokens).strip()
    
    # Loại bỏ các từ thừa ở cuối
    trailing_words = {"này", "nay", "đó", "do", "kia", "nào", "nao", "ở", "o"}
    tokens = result.split()
    while tokens and tokens[-1].lower() in trailing_words:
        tokens.pop()
    
    return " ".join(tokens).strip()


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
    # Pattern m3: Bắt text sau "tìm" nhưng dừng lại khi gặp "hộ khẩu", "nhân khẩu", "ở", "tại"
    # Chỉ dùng pattern này nếu không có "hộ khẩu" hoặc "nhân khẩu" trong câu (để tránh conflict)
    if not re.search(r"(?:hộ\s*khẩu|ho\s*khau|nhân\s*khẩu|nhan\s*khau)", text, flags=re.IGNORECASE):
        m3 = re.search(r"(?:tìm|tim|search)\s+([^\n,.;!?]+?)(?:\s+(?:hộ\s*khẩu|ho\s*khau|nhân\s*khẩu|nhan\s*khau|ở|o|tại|tai)|$)", text, flags=re.IGNORECASE)
        if m3:
            candidate = m3.group(1).strip()
            # Loại bỏ các từ không cần thiết
            if candidate and candidate.lower() not in {"hộ khẩu", "ho khau", "nhân khẩu", "nhan khau"}:
                return candidate
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
    """Trích xuất tên sau cụm 'chủ hộ' hoặc 'chu ho', hoặc sau 'hộ khẩu'.
    Ví dụ: 
    - 'xem hộ khẩu của chủ hộ Bùi Tiến Dũng' -> 'Bùi Tiến Dũng'
    - 'tìm hộ khẩu Bùi Tiến Dũng ở Đường Ao Sen' -> 'Bùi Tiến Dũng'
    """
    # Pattern 1: Bắt cụm 'của chủ hộ <tên>' - ưu tiên pattern này vì phổ biến nhất
    # Bắt tất cả các từ sau "của chủ hộ" cho đến cuối câu hoặc dấu câu
    # Sử dụng pattern đơn giản: bắt trực tiếp "chủ hộ" (không dùng character class vì có vấn đề với Unicode)
    pattern1 = r"của\s+ch(?:ủ|u)\s*h(?:ộ|o)\s+([^\d\n,.;!?]+?)(?:\s+(?:ở|o|tại|tai|thuộc|thuoc)|\s*$|\s*[.!?]|$)"
    m2 = re.search(pattern1, text, flags=re.IGNORECASE)
    if m2:
        name = m2.group(1).strip()
        # Loại bỏ các từ thừa ở cuối như "này", "đó", "kia"
        trailing_words = {"này", "nay", "đó", "do", "kia", "nào", "nao", "ở", "o", "tại", "tai", "thuộc", "thuoc"}
        tokens = name.split()
        while tokens and tokens[-1].lower() in trailing_words:
            tokens.pop()
        # Chỉ trả về nếu có ít nhất 1 từ
        if len(tokens) >= 1 and all(len(t) > 0 for t in tokens):
            return " ".join(tokens).strip()
    
    # Pattern 2: Bắt 'chủ hộ' ở bất kỳ đâu trong câu, tên sau đó
    # Sử dụng alternation thay vì character class để tránh vấn đề với Unicode
    pattern2 = r"ch(?:ủ|u)\s*h(?:ộ|o)\s+(?:[:#]?\s*)?(?:tên\s*)?(?:là\s*)?([^\d\n,.;!?]+?)(?:\s+(?:ở|o|tại|tai|thuộc|thuoc)|\s*$|\s*[.!?]|$)"
    m = re.search(pattern2, text, flags=re.IGNORECASE)
    if m:
        name = m.group(1).strip()
        # Loại bỏ các từ thừa ở cuối
        trailing_words = {"này", "nay", "đó", "do", "kia", "nào", "nao", "ở", "o", "tại", "tai", "thuộc", "thuoc"}
        tokens = name.split()
        while tokens and tokens[-1].lower() in trailing_words:
            tokens.pop()
        # Chỉ trả về nếu có ít nhất 1 từ
        if len(tokens) >= 1 and all(len(t) > 0 for t in tokens):
            return " ".join(tokens).strip()
    
    # Pattern 3: Bắt tên sau 'hộ khẩu' (khi không có "chủ hộ")
    # Ví dụ: "tìm hộ khẩu Bùi Tiến Dũng ở Đường Ao Sen"
    pattern3 = r"h(?:ộ|o)\s*kh(?:ẩu|au)\s+([A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐ][^\d\n,.;!?]+?)(?:\s+(?:ở|o|tại|tai|thuộc|thuoc)|\s*$|\s*[.!?]|$)"
    m3 = re.search(pattern3, text, flags=re.IGNORECASE)
    if m3:
        name = m3.group(1).strip()
        # Loại bỏ các từ thừa ở cuối
        trailing_words = {"này", "nay", "đó", "do", "kia", "nào", "nao", "ở", "o", "tại", "tai", "thuộc", "thuoc"}
        tokens = name.split()
        while tokens and tokens[-1].lower() in trailing_words:
            tokens.pop()
        # Chỉ trả về nếu có ít nhất 1 từ và không phải là "hộ khẩu" hoặc "ho khau"
        if len(tokens) >= 1 and all(len(t) > 0 for t in tokens):
            candidate = " ".join(tokens).strip()
            if candidate.lower() not in {"hộ khẩu", "ho khau"}:
                return candidate
    
    return None


def extract_address(text: str) -> Optional[str]:
    """Trích xuất địa chỉ từ câu hỏi.
    Ví dụ: 
    - 'có người nào ở Biệt thự The Vesta không' -> 'Biệt thự The Vesta'
    - 'hộ khẩu đấy ở Đường Ao Sen' -> 'Đường Ao Sen'
    """
    # Pattern cho "hộ khẩu đấy/đó/này ở <địa chỉ>" - xử lý các từ thay thế
    m3 = re.search(r"h(?:ộ|o)\s*kh(?:ẩu|au)\s+(?:đấy|day|đó|do|này|nay|ấy|ay)\s+(?:ở|o|tại|tai|thuộc|thuoc)\s+([A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐa-zàáâãäåāăąæçèéêëēĕėęěìíîïīįıñòóôõöøōŏőùúûüūŭůűųỳýỷỹỵđ][^\n,.;!?]+?)(?:\s+không|\s+ko|\s+khong|\s+hãy|\s+hay|\s+mở|\s+mo|\s+giúp|\s+giup|\s+tôi|\s+toi|$)", text, flags=re.IGNORECASE)
    if m3:
        addr = m3.group(1).strip()
        stop_words = {"không", "khong", "ko", "hãy", "hay", "mở", "mo", "giúp", "giup", "tôi", "toi", "nào", "nao"}
        tokens = addr.split()
        tokens = [t for t in tokens if t.lower() not in {"nào", "nao"}]
        while tokens and tokens[-1].lower() in stop_words:
            tokens.pop()
        if tokens:
            return " ".join(tokens).strip()
    
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
    # Cũng xử lý trường hợp "đấy ở", "đó ở", "này ở"
    m = re.search(r"(?:đấy|day|đó|do|này|nay|ấy|ay)?\s*(?:ở|o|tại|tai|thuộc|thuoc)\s+([A-ZÀÁÂÃÄÅĀĂĄÆÇÈÉÊËĒĔĖĘĚÌÍÎÏĪĮİÑÒÓÔÕÖØŌŎŐÙÚÛÜŪŬŮŰŲỲÝỶỸỴĐa-zàáâãåāăąæçèéêëēĕėęěìíîïīįıñòóôõöøōŏőùúûüūŭůűųỳýỷỹỵđ][^\n,.;!?]+?)(?:\s+không|\s+ko|\s+khong|\s+hãy|\s+hay|\s+mở|\s+mo|\s+giúp|\s+giup|\s+tôi|\s+toi|$)", text, flags=re.IGNORECASE)
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