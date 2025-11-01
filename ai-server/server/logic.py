import re
from .gemini import call_gemini
from .ollama import call_ollama
from .kb import find_best_local_answer
from .prompts import enrich_context, get_system_context
from .cache import get_cached_response, cache_response
from .validation import validate_response, sanitize_response
from . import settings


def process_message(
    message: str, 
    context: str = "", 
    bypass_kb: bool = False,
    session_id: str = None,
    history: list = None,
    system_info: dict = None
) -> dict:
    """
    Process message với các tính năng nâng cao.
    
    Returns:
        dict: {
            'response': str,
            'from_cache': bool,
            'validation': dict,
            'source': str ('kb'|'cache'|'ollama'|'gemini'|'fallback')
        }
    """
    message_lower = message.lower().strip()
    message_clean = re.sub(r"[!?.]", "", message_lower)

    # 1. Kiểm tra cache trước
    if settings.ENABLE_RESPONSE_CACHE and not bypass_kb:
        cached = get_cached_response(message, context)
        if cached:
            return {
                'response': cached,
                'from_cache': True,
                'validation': {'valid': True, 'score': 1.0},
                'source': 'cache'
            }

    # 2. Kiểm tra knowledge base
    if not bypass_kb:
        kb_ans = find_best_local_answer(message)
        if kb_ans:
            # Cache KB answer
            if settings.ENABLE_RESPONSE_CACHE:
                cache_response(message, context, kb_ans)
            return {
                'response': kb_ans,
                'from_cache': False,
                'validation': {'valid': True, 'score': 1.0},
                'source': 'kb'
            }

    # 3. Xử lý các pattern chung chung
    if re.fullmatch(r"(xin chào|chào|chào bạn|hello|hi)", message_clean):
        response = "Xin chào! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Tôi có thể giúp bạn tìm hiểu về các tính năng của hệ thống."
        return {
            'response': response,
            'from_cache': False,
            'validation': {'valid': True, 'score': 1.0},
            'source': 'fallback'
        }
    elif any(w in message_clean for w in ['giúp', 'help', 'hướng dẫn', 'huong dan']) and len(message_clean.split()) <= 4:
        response = '''Tôi có thể giúp bạn với:
        
        - Quản lý Hộ khẩu
        - Quản lý Nhân khẩu
        - Thu phí và Khoản thu
        - Xem Thống kê
        - Hướng dẫn Đăng nhập
        
        Hãy hỏi tôi về bất kỳ chức năng nào!'''
        return {
            'response': response,
            'from_cache': False,
            'validation': {'valid': True, 'score': 1.0},
            'source': 'fallback'
        }

    # 4. Enrich context với system prompt và system info
    enriched_context = enrich_context(context or get_system_context(), system_info)

    # 5. Gọi AI với conversation history
    response_text = ""
    source = "fallback"
    
    # Prefer local Ollama first if configured
    if settings.OLLAMA_HOST and settings.OLLAMA_MODEL:
        response_text = call_ollama(message, enriched_context, history)
        if response_text:
            source = "ollama"
    
    # Fallback to Gemini
    if not response_text and settings.GOOGLE_GEMINI_API_KEY:
        response_text = call_gemini(message, enriched_context, history)
        if response_text:
            source = "gemini"

    # 6. Sanitize và validate response
    if response_text:
        response_text = sanitize_response(response_text)
    
    # Validate response
    validation = {'valid': True, 'score': 1.0}
    if settings.ENABLE_RESPONSE_VALIDATION and response_text:
        validation = validate_response(response_text, message)
        if not validation['valid']:
            # Nếu response không hợp lệ, trả về fallback message
            response_text = "Xin lỗi, tôi gặp khó khăn trong việc trả lời câu hỏi này. Vui lòng thử lại hoặc hỏi câu hỏi khác."
            source = "fallback"
    elif not response_text:
        response_text = "Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Bạn có thể hỏi tôi về bất kỳ tính năng nào của hệ thống."
        source = "fallback"

    # 7. Cache response nếu hợp lệ
    if settings.ENABLE_RESPONSE_CACHE and validation.get('valid', False) and source in ['ollama', 'gemini']:
        cache_response(message, context, response_text)

    return {
        'response': response_text,
        'from_cache': False,
        'validation': validation,
        'source': source
    }


