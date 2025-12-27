import json
import time
import requests
from typing import Generator
from . import settings
from .logger import get_logger
from .exceptions import AIProviderError, CircuitBreakerOpenError
from .circuit_breaker import get_ollama_circuit_breaker

logger = get_logger(__name__)


def call_ollama_stream(message: str, context: str = "", history: list = None) -> Generator[str, None, None]:
    """
    Call Ollama API với streaming mode thật.
    
    Args:
        message: User message
        context: System context
        history: Conversation history [{'role': 'user'|'assistant', 'content': str}, ...]
    
    Yields:
        str: Chunks of text as they come from the model
    """
    host = (settings.OLLAMA_HOST or "").strip()
    model = (settings.OLLAMA_MODEL or "").strip()
    if not host or not model:
        logger.debug("Ollama host or model not configured, skipping stream call")
        return
    
    try:
        logger.debug(f"Calling Ollama stream API (host: {host}, model: {model}, message length: {len(message)})")
        url = host.rstrip("/") + "/api/chat"
        messages = []
        
        if context:
            messages.append({"role": "system", "content": context})
        
        # Add conversation history
        if history:
            for msg in history[-settings.MAX_HISTORY_MESSAGES:]:
                role = msg.get('role', 'user')
                content = msg.get('content', '').strip()
                if content:
                    messages.append({"role": role, "content": content})
        
        messages.append({"role": "user", "content": message})
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, headers=headers, json=payload, timeout=45, stream=True)
        
        if response.ok:
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if 'message' in data:
                            content = data['message'].get('content', '')
                            if content:
                                yield content
                        elif 'response' in data:
                            content = data.get('response', '')
                            if content:
                                yield content
                        # Check if done
                        if data.get('done', False):
                            break
                    except json.JSONDecodeError as e:
                        logger.debug(f"JSON decode error in Ollama stream: {e}")
                        continue
        else:
            # Fallback to non-streaming if streaming fails
            logger.warning(f"Ollama stream failed with status {response.status_code}, falling back to non-streaming")
            yield from _call_ollama_fallback(message, context, history)
            
    except requests.exceptions.Timeout:
        logger.error("Ollama stream API timeout")
        yield from _call_ollama_fallback(message, context, history)
    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama stream API request error: {e}", exc_info=True)
        yield from _call_ollama_fallback(message, context, history)
    except Exception as e:
        logger.error(f"Unexpected error in Ollama stream: {e}", exc_info=True)
        yield from _call_ollama_fallback(message, context, history)


def _call_ollama_fallback(message: str, context: str = "", history: list = None) -> Generator[str, None, None]:
    """Fallback: call non-streaming and yield full response."""
    try:
        result = call_ollama(message, context, history)
        if result:
            # Chunk the result to simulate streaming
            chunk_size = 20
            for i in range(0, len(result), chunk_size):
                yield result[i:i+chunk_size]
    except Exception as e:
        # Nếu có lỗi, yield empty để cho phép fallback
        logger.debug(f"Ollama fallback failed: {e}")
        return


def _call_ollama_internal(message: str, context: str = "", history: list = None, retry_attempt: int = 0) -> str:
    """
    Internal function để gọi Ollama API (không có circuit breaker).
    """
    host = (settings.OLLAMA_HOST or "").strip()
    model = (settings.OLLAMA_MODEL or "").strip()
    if not host or not model:
        logger.debug("Ollama host or model not configured")
        return ""
    
    try:
        logger.debug(f"Calling Ollama API (attempt {retry_attempt + 1}, host: {host}, model: {model}, message length: {len(message)})")
        # Build conversation history if provided
        full_prompt = ""
        if context:
            full_prompt = context + "\n\n"
        
        # Add conversation history
        if history:
            for msg in history[-settings.MAX_HISTORY_MESSAGES:]:  # Lấy theo cấu hình
                role = msg.get('role', 'user')
                content = msg.get('content', '').strip()
                if content:
                    if role == 'user':
                        full_prompt += f"Người dùng: {content}\n"
                    elif role == 'assistant':
                        full_prompt += f"Trợ lý: {content}\n"
            full_prompt += "\n"
        
        full_prompt += f"Người dùng: {message}\nTrợ lý:"
        
        # Use chat endpoint nếu có history, generate endpoint nếu không
        if history and len(history) > 0:
            # Try chat endpoint first (better for conversations)
            try:
                url = host.rstrip("/") + "/api/chat"
                messages = []
                if context:
                    messages.append({"role": "system", "content": context})
                
                for msg in history[-settings.MAX_HISTORY_MESSAGES:]:
                    role = msg.get('role', 'user')
                    content = msg.get('content', '').strip()
                    if content:
                        messages.append({"role": role, "content": content})
                
                messages.append({"role": "user", "content": message})
                
                payload = {
                    "model": model,
                    "messages": messages,
                    "stream": False,
                }
                headers = {"Content-Type": "application/json"}
                response = requests.post(url, headers=headers, json=payload, timeout=45)
                if response.ok:
                    data = response.json()
                    text = data.get("message", {}).get("content", "") or data.get("response", "")
                    result = (text or "").strip()
                    if result:
                        logger.debug(f"Ollama API call successful via chat endpoint (response length: {len(result)})")
                        return result
            except Exception as e:
                logger.debug(f"Ollama chat endpoint failed, falling back to generate endpoint: {e}")
                pass  # Fallback to generate endpoint
        
        # Use generate endpoint
        url = host.rstrip("/") + "/api/generate"
        payload = {
            "model": model,
            "prompt": full_prompt,
            "stream": False,
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        if response.ok:
            data = response.json()
            text = data.get("response", "")
            result = (text or "").strip()
            if result:
                logger.debug(f"Ollama API call successful via generate endpoint (response length: {len(result)})")
                return result
            logger.warning("Ollama API returned empty response")
            return ""
        
        error_msg = f"Ollama API request failed: {response.status_code}"
        error_details = response.text[:500] if response.text else "No error details"
        
        # Retry logic
        if response.status_code in [429, 500, 502, 503, 504] and retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
            delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)
            logger.warning(
                f"Ollama API error {response.status_code}, retrying in {delay}s (attempt {retry_attempt + 1}/{settings.API_RETRY_MAX_ATTEMPTS})",
                extra={'status_code': response.status_code, 'retry_attempt': retry_attempt + 1}
            )
            time.sleep(delay)
            return call_ollama(message, context, history, retry_attempt + 1)
        
        # Log error nhưng không raise exception để cho phép fallback
        logger.error(
            f"Ollama API error: {error_msg}",
            extra={'status_code': response.status_code, 'error_details': error_details}
        )
        return ""
    except requests.exceptions.Timeout:
        # Retry on timeout
        if retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
            delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)
            logger.warning(f"Ollama API timeout, retrying in {delay}s (attempt {retry_attempt + 1}/{settings.API_RETRY_MAX_ATTEMPTS})")
            time.sleep(delay)
            return call_ollama(message, context, history, retry_attempt + 1)
        logger.error("Ollama API timeout after all retries")
        return ""  # Return empty để cho phép fallback
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Ollama API connection error: {e}")
        return ""  # Return empty để cho phép fallback
    except Exception as e:
        logger.error(f"Unexpected error in Ollama API call: {e}", exc_info=True)
        return ""  # Return empty để cho phép fallback


def call_ollama(message: str, context: str = "", history: list = None, retry_attempt: int = 0) -> str:
    """
    Call local Ollama server với retry logic, conversation history support và circuit breaker.
    
    Args:
        message: User message
        context: System context
        history: Conversation history [{'role': 'user'|'assistant', 'content': str}, ...]
        retry_attempt: Current retry attempt (internal use)
    
    Returns:
        AI response string (empty string on failure to allow fallback)
    
    Raises:
        AIProviderError: Nếu có lỗi nghiêm trọng từ Ollama API
        CircuitBreakerOpenError: Nếu circuit breaker đang mở (nhưng sẽ return "" để cho phép fallback)
    """
    host = (settings.OLLAMA_HOST or "").strip()
    model = (settings.OLLAMA_MODEL or "").strip()
    if not host or not model:
        logger.debug("Ollama host or model not configured")
        return ""
    
    # Sử dụng circuit breaker
    circuit_breaker = get_ollama_circuit_breaker()
    
    try:
        result = circuit_breaker.call(_call_ollama_internal, message, context, history, retry_attempt)
        return result
    except CircuitBreakerOpenError:
        # Circuit breaker đang mở, log và return empty để cho phép fallback
        logger.warning(
            "Ollama API circuit breaker is OPEN, allowing fallback to Gemini",
            extra={'circuit_state': circuit_breaker.get_state()}
        )
        return ""  # Return empty để cho phép fallback sang Gemini
    except Exception as e:
        # Log và return empty để cho phép fallback
        logger.error(f"Error in Ollama API call: {e}", exc_info=True)
        return ""  # Return empty để cho phép fallback