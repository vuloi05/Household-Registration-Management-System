import json
import time
import requests
from . import settings


def call_gemini(message: str, context: str = "", history: list = None, retry_attempt: int = 0) -> str:
    """
    Call Gemini API với retry logic và conversation history support.
    
    Args:
        message: User message
        context: System context
        history: Conversation history [{'role': 'user'|'assistant', 'content': str}, ...]
        retry_attempt: Current retry attempt (internal use)
    
    Returns:
        AI response string
    """
    if not settings.GOOGLE_GEMINI_API_KEY:
        return ""
    
    try:
        # Build conversation with history
        contents = []
        
        # Add system prompt/context as first message if provided
        if context:
            contents.append({"role": "user", "parts": [{"text": context}]})
            # Add a model response to establish system context
            contents.append({"role": "model", "parts": [{"text": "Đã hiểu."}]})
        
        # Add conversation history if provided
        if history:
            for msg in history[-10:]:  # Chỉ lấy 10 messages gần nhất
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
                    return text.strip()
            return json.dumps(result, ensure_ascii=False)
        else:
            # Retry logic cho một số error codes
            if response.status_code in [429, 500, 502, 503, 504] and retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
                delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)  # Exponential backoff
                time.sleep(delay)
                return call_gemini(message, context, history, retry_attempt + 1)
            
            if response.status_code == 503:
                return "Dịch vụ AI của Google hiện đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau ít phút!"
            return f"Gemini API request failed: {response.status_code} {response.text}"
    except requests.exceptions.Timeout:
        # Retry on timeout
        if retry_attempt < settings.API_RETRY_MAX_ATTEMPTS:
            delay = settings.API_RETRY_DELAY_SECONDS * (2 ** retry_attempt)
            time.sleep(delay)
            return call_gemini(message, context, history, retry_attempt + 1)
        return "Kết nối đến dịch vụ AI quá thời gian chờ. Vui lòng thử lại sau!"
    except Exception as e:
        return f"Gemini API call error: {str(e)}"


