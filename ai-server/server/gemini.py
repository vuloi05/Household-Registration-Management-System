import json
import requests
from . import settings


def call_gemini(message: str, context: str = "") -> str:
    if not settings.GOOGLE_GEMINI_API_KEY:
        return ""
    try:
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": (context + "\n" if context else "") + message}]}
            ],
        }
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
            if response.status_code == 503:
                return "Dịch vụ AI của Google hiện đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau ít phút!"
            return f"Gemini API request failed: {response.status_code} {response.text}"
    except Exception as e:
        return f"Gemini API call error: {str(e)}"


