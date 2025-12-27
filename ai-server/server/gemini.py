import json
import time
import requests
from typing import Generator
from . import settings
from .logger import get_logger
from .exceptions import AIProviderError, CircuitBreakerOpenError
from .circuit_breaker import get_gemini_circuit_breaker

logger = get_logger(__name__)


def call_gemini_stream(message: str, context: str = "", history: list = None) -> Generator[str, None, None]:
    """
    Call Gemini API với streaming mode thật.
    
    Args:
        message: User message
        context: System context
        history: Conversation history [{'role': 'user'|'assistant', 'content': str}, ...]
    
    Yields:
        str: Chunks of text as they come from the model
    """
    if not settings.GOOGLE_GEMINI_API_KEY:
        logger.debug("Gemini API key not configured, skipping stream call")
        return
    
    try:
        logger.debug(f"Calling Gemini stream API (message length: {len(message)})")
        # Build conversation with history
        contents = []
        
        # Add system prompt/context as first message if provided
        if context:
            contents.append({"role": "user", "parts": [{"text": context}]})
            contents.append({"role": "model", "parts": [{"text": "Đã hiểu."}]})
        
        # Add conversation history if provided
        if history:
            for msg in history[-settings.MAX_HISTORY_MESSAGES:]:
                role = msg.get('role', 'user')
                content = msg.get('content', '').strip()
                if content:
                    if role == 'user':
                        contents.append({"role": "user", "parts": [{"text": content}]})
                    elif role == 'assistant':
                        contents.append({"role": "model", "parts": [{"text": content}]})
        
        # Add current message
        contents.append({"role": "user", "parts": [{"text": message}]})
        
        # Use streaming endpoint (v1beta with streamGenerateContent)
        url = f"{settings.GOOGLE_GEMINI_API_URL.replace('generateContent', 'streamGenerateContent')}?key={settings.GOOGLE_GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": contents}
        
        response = requests.post(url, headers=headers, json=payload, timeout=45, stream=True)
        
        if response.ok:
            for line in response.iter_lines():
                if line:
                    try:
                        # Remove 'data: ' prefix if present
                        line_text = line.decode('utf-8')
                        if line_text.startswith('data: '):
                            line_text = line_text[6:]
                        if line_text.strip() == '[DONE]':
                            break
                        
                        data = json.loads(line_text)
                        candidates = data.get('candidates', [])
                        if candidates:
                            content = candidates[0].get('content', {})
                            parts = content.get('parts', [])
                            if parts:
                                for part in parts:
                                    if 'text' in part:
                                        yield part['text']
                    except json.JSONDecodeError as e:
                        logger.debug(f"JSON decode error in Gemini stream: {e}")
                        continue
                    except Exception as e:
                        logger.debug(f"Error parsing Gemini stream chunk: {e}")
                        continue
        else:
            # Fallback to non-streaming if streaming fails
            logger.warning(f"Gemini stream failed with status {response.status_code}, falling back to non-streaming")
            yield from _call_gemini_fallback(message, context, history)
            
    except requests.exceptions.Timeout:
        logger.error("Gemini stream API timeout")
        yield from _call_gemini_fallback(message, context, history)
    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini stream API request error: {e}", exc_info=True)
        yield from _call_gemini_fallback(message, context, history)
    except Exception as e:
        logger.error(f"Unexpected error in Gemini stream: {e}", exc_info=True)
        yield from _call_gemini_fallback(message, context, history)


def _call_gemini_fallback(message: str, context: str = "", history: list = None) -> Generator[str, None, None]:
    """Fallback: call non-streaming and yield full response."""
    try:
        result = call_gemini(message, context, history)
        if result:
            # Chunk the result to simulate streaming
            chunk_size = 20
            for i in range(0, len(result), chunk_size):
                yield result[i:i+chunk_size]
    except (AIProviderError, CircuitBreakerOpenError) as e:
        # Nếu circuit breaker mở hoặc có lỗi, yield error message
        error_msg = "Xin lỗi, dịch vụ AI hiện đang không khả dụng. Vui lòng thử lại sau."
        yield error_msg


def _call_gemini_internal(message: str, context: str = "", history: list = None, retry_attempt: int = 0) -> str:
    """
    Internal function để gọi Gemini API (không có circuit breaker).
    """
    if not settings.GOOGLE_GEMINI_API_KEY:
        logger.debug("Gemini API key not configured")
        return ""
    
    try:
        logger.debug(f"Calling Gemini API (attempt {retry_attempt + 1}, message length: {len(message)})")
        # Build conversation with history
        contents = []
        
        # Add system prompt/context as first message if provided
        if context:
            contents.append({"role": "user", "parts": [{"text": context}]})
            # Add a model response to establish system context
            contents.append({"role": "model", "parts": [{"text": "Đã hiểu."}]})
        
        # Add conversation history if provided
        if history:
            for msg in history[-settings.MAX_HISTORY_MESSAGES:]:  # Lấy theo cấu hình
                role = msg.get('role', 'user')
                content = msg.get('content', '').strip()
                if content:
                    # Map roles: user -> user, assistant -> model
                    if role == 'user':
                        contents.append({"role": "user", "parts": [{"text": content}]})
                    elif role == 'assistant':
                        contents.append({"role": "model", "parts": [{"text": content}]})
        
        # Add current message
        contents.append({"role": "user", "parts": [{"text": message}]})
        
        payload = {"contents": contents}
        
        url = f"{settings.GOOGLE_GEMINI_API_URL}?key={settings.GOOGLE_GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        
        if response.ok:
            result = response.json()
            candidates = result.get('candidates', [])
            if candidates:
                content = candidates[0].get('content', {})
                parts = content.get('parts', [])
                if parts and 'text' in parts[0]:
                    text = parts[0]['text']
                    logger.debug(f"Gemini API call successful (response length: {len(text)})")
                    return text.strip()
            logger.warning("Gemini API returned no text in response")
            return json.dumps(result, ensure_ascii=False)
        else:
            error_msg = f"Gemini API request failed: {response.status_code}"
            error_details = response.text[:500] if response.text else "No error details"
            
            # Retry logic cho một số error codes
            if response.status_code in [429, 500, 502, 503, 504] and retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
                delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)  # Exponential backoff
                logger.warning(
                    f"Gemini API error {response.status_code}, retrying in {delay}s (attempt {retry_attempt + 1}/{settings.API_RETRY_MAX_ATTEMPTS})",
                    extra={'status_code': response.status_code, 'retry_attempt': retry_attempt + 1}
                )
                time.sleep(delay)
                return call_gemini(message, context, history, retry_attempt + 1)
            
            # Log error và raise exception
            logger.error(
                f"Gemini API error: {error_msg}",
                extra={'status_code': response.status_code, 'error_details': error_details}
            )
            
            if response.status_code == 503:
                raise AIProviderError(
                    "Dịch vụ AI của Google hiện đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau ít phút!",
                    provider='gemini',
                    status_code=503,
                    details={'response_status': response.status_code, 'error_details': error_details}
                )
            
            raise AIProviderError(
                f"Gemini API request failed: {response.status_code}",
                provider='gemini',
                status_code=response.status_code,
                details={'error_details': error_details}
            )
    except requests.exceptions.Timeout:
        # Retry on timeout
        if retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
            delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)
            logger.warning(f"Gemini API timeout, retrying in {delay}s (attempt {retry_attempt + 1}/{settings.API_RETRY_MAX_ATTEMPTS})")
            time.sleep(delay)
            return call_gemini(message, context, history, retry_attempt + 1)
        logger.error("Gemini API timeout after all retries")
        raise AIProviderError(
            "Kết nối đến dịch vụ AI quá thời gian chờ. Vui lòng thử lại sau!",
            provider='gemini',
            status_code=504,
            details={'timeout': True, 'retry_attempts': retry_attempt + 1}
        )
    except AIProviderError:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in Gemini API call: {e}", exc_info=True)
        raise AIProviderError(
            f"Gemini API call error: {str(e)}",
            provider='gemini',
            status_code=500,
            details={'exception_type': type(e).__name__}
        )


def call_gemini(message: str, context: str = "", history: list = None, retry_attempt: int = 0) -> str:
    """
    Call Gemini API với retry logic, conversation history support và circuit breaker.
    
    Args:
        message: User message
        context: System context
        history: Conversation history [{'role': 'user'|'assistant', 'content': str}, ...]
        retry_attempt: Current retry attempt (internal use)
    
    Returns:
        AI response string
    
    Raises:
        AIProviderError: Nếu có lỗi từ Gemini API
        CircuitBreakerOpenError: Nếu circuit breaker đang mở
    """
    if not settings.GOOGLE_GEMINI_API_KEY:
        logger.debug("Gemini API key not configured")
        return ""
    
    # Sử dụng circuit breaker
    circuit_breaker = get_gemini_circuit_breaker()
    
    try:
        return circuit_breaker.call(_call_gemini_internal, message, context, history, retry_attempt)
    except CircuitBreakerOpenError:
        # Circuit breaker đang mở, không retry
        logger.error(
            "Gemini API circuit breaker is OPEN, service may be down",
            extra={'circuit_state': circuit_breaker.get_state()}
        )
        raise AIProviderError(
            "Dịch vụ AI của Google hiện đang không khả dụng. Vui lòng thử lại sau ít phút!",
            provider='gemini',
            status_code=503,
            details={'circuit_breaker_open': True}
        )
    except AIProviderError:
        # Re-raise AIProviderError
        raise
    except Exception as e:
        # Wrap unexpected errors
        logger.error(f"Unexpected error in Gemini API call: {e}", exc_info=True)
        raise AIProviderError(
            f"Gemini API call error: {str(e)}",
            provider='gemini',
            status_code=500,
            details={'exception_type': type(e).__name__}
        )