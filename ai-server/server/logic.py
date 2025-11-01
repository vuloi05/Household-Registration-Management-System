import re
from .gemini import call_gemini
from .ollama import call_ollama
from .kb import find_best_local_answer
from . import settings


def process_message(message: str, context: str = "", bypass_kb: bool = False) -> str:
    message_lower = message.lower().strip()
    message_clean = re.sub(r"[!?.]", "", message_lower)

    if not bypass_kb:
        kb_ans = find_best_local_answer(message)
        if kb_ans:
            return kb_ans

    # Chỉ giữ lại các pattern chung chung (chào hỏi, help tổng quát)
    # Các câu hỏi cụ thể sẽ được xử lý bởi Ollama/Gemini
    if re.fullmatch(r"(xin chào|chào|chào bạn|hello|hi)", message_clean):
        return "Xin chào! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Tôi có thể giúp bạn tìm hiểu về các tính năng của hệ thống."
    elif any(w in message_clean for w in ['giúp', 'help', 'hướng dẫn', 'huong dan']) and len(message_clean.split()) <= 4:
        # Chỉ match câu hỏi help ngắn gọn, câu hỏi cụ thể hơn sẽ gọi AI
        return '''Tôi có thể giúp bạn với:
        
        - Quản lý Hộ khẩu
        - Quản lý Nhân khẩu
        - Thu phí và Khoản thu
        - Xem Thống kê
        - Hướng dẫn Đăng nhập
        
        Hãy hỏi tôi về bất kỳ chức năng nào!'''

    # Với các câu hỏi khác (bao gồm các câu hỏi cụ thể), gọi Ollama/Gemini
    # Prefer local Ollama first if configured
    if settings.OLLAMA_HOST and settings.OLLAMA_MODEL:
        text_ollama = call_ollama(message, context)
        if text_ollama:
            return text_ollama

    # Fallback to Gemini
    if settings.GOOGLE_GEMINI_API_KEY:
        text_gemini = call_gemini(message, context)
        if text_gemini:
            return text_gemini
    return "Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Bạn có thể hỏi tôi về bất kỳ tính năng nào của hệ thống."


