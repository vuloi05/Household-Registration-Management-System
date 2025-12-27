import re
from typing import Generator
from .gemini import call_gemini, call_gemini_stream
from .ollama import call_ollama, call_ollama_stream
from .kb import find_best_local_answer
from .prompts import enrich_context, get_system_context
from .cache import get_cached_response, cache_response
from .validation import validate_response, sanitize_response
from . import settings
from .logger import get_logger
from .exceptions import AIProviderError, CircuitBreakerOpenError

logger = get_logger(__name__)

# Simple metrics
_metrics = {
    'cache_hits': 0,
    'kb_hits': 0,
    'ollama_calls': 0,
    'gemini_calls': 0,
    'fallbacks': 0,
}


def get_logic_metrics() -> dict:
    return dict(_metrics)


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
            _metrics['cache_hits'] += 1
            return {
                'response': cached,
                'from_cache': True,
                'validation': {'valid': True, 'score': 1.0},
                'source': 'cache'
            }

    # 2. Kiểm tra knowledge base
    if not bypass_kb:
        try:
            from .kb import qa_knowledge_base
            kb_size = len(qa_knowledge_base)
            from .metrics import update_kb_metrics
            update_kb_metrics(size=kb_size, is_query=True)
        except (ImportError, AttributeError):
            pass
        kb_ans = find_best_local_answer(message)
        if kb_ans:
            _metrics['kb_hits'] += 1
            try:
                from .metrics import update_kb_metrics
                from .kb import qa_knowledge_base
                update_kb_metrics(size=len(qa_knowledge_base), is_hit=True, is_query=False)
            except (ImportError, AttributeError):
                pass
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
        try:
            import time
            call_start = time.time()
            response_text = call_ollama(message, enriched_context, history)
            call_latency = time.time() - call_start
            if response_text:
                _metrics['ollama_calls'] += 1
                source = "ollama"
                # Track Prometheus metrics
                try:
                    from .metrics import update_ai_provider_metrics
                    update_ai_provider_metrics(provider='ollama', latency=call_latency)
                except ImportError:
                    pass
                logger.debug(f"Ollama response received (length: {len(response_text)})")
        except (AIProviderError, CircuitBreakerOpenError) as e:
            try:
                from .metrics import update_ai_provider_metrics
                update_ai_provider_metrics(provider='ollama', error=e)
            except ImportError:
                pass
            logger.warning(f"Ollama API error: {e.message if hasattr(e, 'message') else str(e)}, falling back to Gemini")
            # Fallback to Gemini
        except Exception as e:
            try:
                from .metrics import update_ai_provider_metrics
                update_ai_provider_metrics(provider='ollama', error=e)
            except ImportError:
                pass
            logger.error(f"Unexpected error calling Ollama: {e}", exc_info=True)
            # Fallback to Gemini
    
    # Fallback to Gemini
    if not response_text and settings.GOOGLE_GEMINI_API_KEY:
        try:
            import time
            call_start = time.time()
            response_text = call_gemini(message, enriched_context, history)
            call_latency = time.time() - call_start
            if response_text:
                _metrics['gemini_calls'] += 1
                source = "gemini"
                # Track Prometheus metrics
                try:
                    from .metrics import update_ai_provider_metrics
                    update_ai_provider_metrics(provider='gemini', latency=call_latency)
                except ImportError:
                    pass
                logger.debug(f"Gemini response received (length: {len(response_text)})")
        except (AIProviderError, CircuitBreakerOpenError) as e:
            try:
                from .metrics import update_ai_provider_metrics
                update_ai_provider_metrics(provider='gemini', error=e)
            except ImportError:
                pass
            logger.error(f"Gemini API error: {e.message if hasattr(e, 'message') else str(e)}")
            # Will use fallback message below
        except Exception as e:
            try:
                from .metrics import update_ai_provider_metrics
                update_ai_provider_metrics(provider='gemini', error=e)
            except ImportError:
                pass
            logger.error(f"Unexpected error calling Gemini: {e}", exc_info=True)
            # Will use fallback message below

    # 6. Sanitize và validate response
    if response_text:
        response_text = sanitize_response(response_text)
    
    # Validate response
    validation = {'valid': True, 'score': 1.0}
    if settings.ENABLE_RESPONSE_VALIDATION and response_text:
        validation = validate_response(response_text, message)
        # Track validation metrics
        try:
            from .metrics import update_validation_metrics
            update_validation_metrics(
                is_valid=validation.get('valid', True),
                score=validation.get('score', 1.0)
            )
        except ImportError:
            pass
        if not validation['valid']:
            # Nếu response không hợp lệ, trả về fallback message
            response_text = "Xin lỗi, tôi gặp khó khăn trong việc trả lời câu hỏi này. Vui lòng thử lại hoặc hỏi câu hỏi khác."
            source = "fallback"
            _metrics['fallbacks'] += 1
    elif not response_text:
        response_text = "Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Bạn có thể hỏi tôi về bất kỳ tính năng nào của hệ thống."
        source = "fallback"
        _metrics['fallbacks'] += 1

    # 7. Cache response nếu hợp lệ
    if settings.ENABLE_RESPONSE_CACHE and validation.get('valid', False) and source in ['ollama', 'gemini']:
        cache_response(message, context, response_text)

    return {
        'response': response_text,
        'from_cache': False,
        'validation': validation,
        'source': source
    }


def process_message_stream(
    message: str, 
    context: str = "", 
    bypass_kb: bool = False,
    session_id: str = None,
    history: list = None,
    system_info: dict = None
) -> Generator[str, None, None]:
    """
    Process message với streaming mode - trả về generator để stream trực tiếp từ AI.
    
    Args:
        message: User message
        context: System context
        bypass_kb: Bypass knowledge base check
        session_id: Session ID for memory
        history: Conversation history
        system_info: System info/metadata
    
    Yields:
        str: Chunks of text as they come from the AI model
    """
    message_lower = message.lower().strip()
    message_clean = re.sub(r"[!?.]", "", message_lower)
    
    # 1. Kiểm tra cache (không stream cache, trả về ngay)
    if settings.ENABLE_RESPONSE_CACHE and not bypass_kb:
        cached = get_cached_response(message, context)
        if cached:
            _metrics['cache_hits'] += 1
            # Yield cached response in chunks to maintain streaming behavior
            chunk_size = 20
            for i in range(0, len(cached), chunk_size):
                yield cached[i:i+chunk_size]
            return
    
    # 2. Kiểm tra knowledge base (không stream KB, trả về ngay)
    if not bypass_kb:
        kb_ans = find_best_local_answer(message)
        if kb_ans:
            _metrics['kb_hits'] += 1
            # Yield KB answer in chunks
            chunk_size = 20
            for i in range(0, len(kb_ans), chunk_size):
                yield kb_ans[i:i+chunk_size]
            # Cache KB answer
            if settings.ENABLE_RESPONSE_CACHE:
                cache_response(message, context, kb_ans)
            return
    
    # 3. Xử lý các pattern chung chung (fallback patterns)
    if re.fullmatch(r"(xin chào|chào|chào bạn|hello|hi)", message_clean):
        response = "Xin chào! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Tôi có thể giúp bạn tìm hiểu về các tính năng của hệ thống."
        chunk_size = 20
        for i in range(0, len(response), chunk_size):
            yield response[i:i+chunk_size]
        return
    elif any(w in message_clean for w in ['giúp', 'help', 'hướng dẫn', 'huong dan']) and len(message_clean.split()) <= 4:
        response = '''Tôi có thể giúp bạn với:
        
        - Quản lý Hộ khẩu
        - Quản lý Nhân khẩu
        - Thu phí và Khoản thu
        - Xem Thống kê
        - Hướng dẫn Đăng nhập
        
        Hãy hỏi tôi về bất kỳ chức năng nào!'''
        chunk_size = 20
        for i in range(0, len(response), chunk_size):
            yield response[i:i+chunk_size]
        return
    
    # 4. Enrich context với system prompt và system info
    enriched_context = enrich_context(context or get_system_context(), system_info)
    
    # 5. Stream từ AI models
    stream_generator = None
    source = "fallback"
    
    # Prefer local Ollama first if configured
    if settings.OLLAMA_HOST and settings.OLLAMA_MODEL:
        try:
            stream_generator = call_ollama_stream(message, enriched_context, history)
            source = "ollama"
            _metrics['ollama_calls'] += 1
            logger.debug("Ollama stream generator created")
        except (AIProviderError, CircuitBreakerOpenError) as e:
            logger.warning(f"Ollama stream error: {e.message if hasattr(e, 'message') else str(e)}, falling back to Gemini")
            # Fallback to Gemini
        except Exception as e:
            logger.error(f"Unexpected error creating Ollama stream: {e}", exc_info=True)
            # Fallback to Gemini
    
    # Fallback to Gemini
    if not stream_generator and settings.GOOGLE_GEMINI_API_KEY:
        try:
            stream_generator = call_gemini_stream(message, enriched_context, history)
            source = "gemini"
            _metrics['gemini_calls'] += 1
            logger.debug("Gemini stream generator created")
        except (AIProviderError, CircuitBreakerOpenError) as e:
            logger.error(f"Gemini stream error: {e.message if hasattr(e, 'message') else str(e)}")
            # Will use fallback message below
        except Exception as e:
            logger.error(f"Unexpected error creating Gemini stream: {e}", exc_info=True)
            # Will use fallback message below
    
    # Stream từ generator nếu có
    if stream_generator:
        full_response = ""
        for chunk in stream_generator:
            full_response += chunk
            yield chunk
        
        # Sanitize full response after streaming
        if full_response:
            sanitized = sanitize_response(full_response)
            # Nếu sanitized khác với full_response, cần validate
            if settings.ENABLE_RESPONSE_CACHE and source in ['ollama', 'gemini']:
                cache_response(message, context, sanitized)
    else:
        # Fallback message nếu không có AI nào available
        response_text = "Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Bạn có thể hỏi tôi về bất kỳ tính năng nào của hệ thống."
        _metrics['fallbacks'] += 1
        chunk_size = 20
        for i in range(0, len(response_text), chunk_size):
            yield response_text[i:i+chunk_size]