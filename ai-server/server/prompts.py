"""
System prompts và context templates cho AI
"""

# System prompt chuẩn cho AI
SYSTEM_PROMPT = """Bạn là trợ lý AI chuyên nghiệp của hệ thống Quản lý Nhân khẩu và Hộ khẩu.

VAI TRÒ:
- Hỗ trợ người dùng sử dụng hệ thống một cách hiệu quả
- Trả lời câu hỏi về các tính năng của hệ thống
- Hướng dẫn cách thao tác với hệ thống
- Cung cấp thông tin về quản lý hộ khẩu và nhân khẩu

CÁC TÍNH NĂNG CHÍNH CỦA HỆ THỐNG:
1. Quản lý Hộ khẩu:
   - Xem danh sách hộ khẩu
   - Xem chi tiết hộ khẩu theo mã hộ khẩu (HK-XX)
   - Tìm kiếm hộ khẩu

2. Quản lý Nhân khẩu:
   - Xem danh sách nhân khẩu
   - Xem chi tiết nhân khẩu theo CCCD/CMND hoặc tên
   - Tìm kiếm nhân khẩu

3. Thu phí và Khoản thu:
   - Xem danh sách các khoản thu
   - Quản lý việc nộp tiền
   - Xem lịch sử nộp tiền

4. Thống kê:
   - Dashboard với các thống kê tổng quan
   - Biểu đồ phân bố độ tuổi
   - Thống kê theo các tiêu chí khác nhau

NGUYÊN TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Trả lời ngắn gọn, rõ ràng, dễ hiểu
- Nếu không chắc chắn, hãy hướng dẫn người dùng đến đúng chức năng
- Không tạo ra thông tin giả mạo
- Nếu được hỏi về dữ liệu cụ thể, hướng dẫn người dùng xem trong hệ thống

CÁCH SỬ DỤNG:
- Khi người dùng hỏi về hộ khẩu/nhân khẩu cụ thể, hướng dẫn họ tìm kiếm trong hệ thống
- Khi người dùng cần thực hiện thao tác, hướng dẫn họ đến đúng trang chức năng
- Luôn sẵn sàng giải thích các tính năng và cách sử dụng hệ thống
"""


def get_system_context() -> str:
    """Tạo system context để gửi kèm với mỗi message."""
    return SYSTEM_PROMPT


def enrich_context(base_context: str, system_info: dict = None) -> str:
    """
    Làm phong phú context với thông tin hệ thống.
    
    Args:
        base_context: Context ban đầu
        system_info: Thông tin hệ thống (stats, metadata)
    
    Returns:
        Context đã được enrich
    """
    enriched_parts = [SYSTEM_PROMPT]
    
    if system_info:
        # Thêm thông tin thống kê nếu có
        if system_info.get('stats'):
            stats = system_info['stats']
            stats_text = "THÔNG TIN HỆ THỐNG:\n"
            if 'total_households' in stats:
                stats_text += f"- Tổng số hộ khẩu: {stats['total_households']}\n"
            if 'total_people' in stats:
                stats_text += f"- Tổng số nhân khẩu: {stats['total_people']}\n"
            if stats_text != "THÔNG TIN HỆ THỐNG:\n":
                enriched_parts.append(stats_text)
    
    if base_context:
        enriched_parts.append(f"\nCONTEXT THÊM:\n{base_context}")
    
    return "\n\n".join(enriched_parts)


def format_conversation_history(messages: list) -> str:
    """
    Format conversation history để gửi cho AI.
    
    Args:
        messages: List of dict với keys: 'role' ('user'|'assistant'), 'content'
    
    Returns:
        Formatted conversation history string
    """
    if not messages:
        return ""
    
    formatted = []
    for msg in messages[-10:]:  # Chỉ lấy 10 messages gần nhất
        role = msg.get('role', 'user')
        content = msg.get('content', '').strip()
        if content:
            if role == 'user':
                formatted.append(f"Người dùng: {content}")
            elif role == 'assistant':
                formatted.append(f"Trợ lý: {content}")
    
    if formatted:
        return "\n".join(formatted)
    return ""

