import json
import time
import requests
from . import settings


def call_ollama(message: str, context: str = "", history: list = None, retry_attempt: int = 0) -> str:
    """
    Call local Ollama server với retry logic và conversation history support.
    
    Args:
        message: User message
        context: System context
        history: Conversation history [{'role': 'user'|'assistant', 'content': str}, ...]
        retry_attempt: Current retry attempt (internal use)
    
    Returns:
        AI response string (empty string on failure to allow fallback)
    """
    host = (settings.OLLAMA_HOST or "").strip()
    model = (settings.OLLAMA_MODEL or "").strip()
    if not host or not model:
        return ""
    
    try:
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
                    return (text or "").strip()
            except Exception:
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
            return (text or "").strip()
        
        # Retry logic
        if response.status_code in [429, 500, 502, 503, 504] and retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
            delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)
            time.sleep(delay)
            return call_ollama(message, context, history, retry_attempt + 1)
        
        return ""
    except requests.exceptions.Timeout:
        # Retry on timeout
        if retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
            delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)
            time.sleep(delay)
            return call_ollama(message, context, history, retry_attempt + 1)
        return ""
    except Exception:
        return ""


