import json
import requests
from . import settings


def call_ollama(message: str, context: str = "") -> str:
    """Call local Ollama server. Returns empty string on failure to allow fallback."""
    host = (settings.OLLAMA_HOST or "").strip()
    model = (settings.OLLAMA_MODEL or "").strip()
    if not host or not model:
        return ""
    try:
        # Use generate endpoint for simplicity
        url = host.rstrip("/") + "/api/generate"
        prompt = ((context + "\n") if context else "") + message
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        if response.ok:
            data = response.json()
            text = data.get("response", "")
            return (text or "").strip()
        return ""
    except Exception:
        return ""


