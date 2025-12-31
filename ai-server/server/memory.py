"""
Conversation Memory - Lưu trữ và quản lý conversation history
"""

import threading
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from collections import defaultdict

# In-memory storage (có thể nâng cấp lên Redis/DB sau)
conversation_sessions: Dict[str, List[Dict]] = defaultdict(list)  # session_id -> list of messages
session_last_activity: Dict[str, datetime] = {}  # session_id -> last activity time
memory_lock = threading.Lock()

# Config
SESSION_TIMEOUT_HOURS = 24  # Session timeout sau 24h không hoạt động
MAX_MESSAGES_PER_SESSION = 50  # Giới hạn số messages trong 1 session
CLEANUP_INTERVAL_SECONDS = 3600  # Cleanup mỗi giờ


def get_or_create_session(session_id: Optional[str] = None) -> str:
    """Tạo hoặc lấy session ID."""
    if not session_id:
        # Tạo session ID mới dựa trên timestamp
        session_id = f"session_{int(time.time() * 1000)}"
    
    with memory_lock:
        if session_id not in session_last_activity:
            conversation_sessions[session_id] = []
        session_last_activity[session_id] = datetime.now()
    
    return session_id


def add_message(session_id: str, role: str, content: str) -> None:
    """
    Thêm message vào conversation history.
    
    Args:
        session_id: Session ID
        role: 'user' hoặc 'assistant'
        content: Nội dung message
    """
    with memory_lock:
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = []
        
        # Giới hạn số lượng messages
        if len(conversation_sessions[session_id]) >= MAX_MESSAGES_PER_SESSION:
            # Giữ lại các messages gần nhất
            conversation_sessions[session_id] = conversation_sessions[session_id][-MAX_MESSAGES_PER_SESSION+1:]
        
        conversation_sessions[session_id].append({
            'role': role,
            'content': content,
            'timestamp': datetime.now().isoformat()
        })
        session_last_activity[session_id] = datetime.now()


def get_conversation_history(session_id: str, max_messages: int = 10) -> List[Dict]:
    """
    Lấy conversation history của session.
    
    Args:
        session_id: Session ID
        max_messages: Số messages tối đa (lấy từ cuối)
    
    Returns:
        List of messages: [{'role': str, 'content': str, 'timestamp': str}, ...]
    """
    with memory_lock:
        if session_id not in conversation_sessions:
            return []
        
        messages = conversation_sessions[session_id]
        # Trả về các messages gần nhất
        return messages[-max_messages:] if len(messages) > max_messages else messages


def clear_session(session_id: str) -> None:
    """Xóa conversation history của session."""
    with memory_lock:
        if session_id in conversation_sessions:
            del conversation_sessions[session_id]
        if session_id in session_last_activity:
            del session_last_activity[session_id]


def cleanup_expired_sessions() -> None:
    """Xóa các session đã hết hạn."""
    now = datetime.now()
    expired_sessions = []
    
    with memory_lock:
        for session_id, last_activity in list(session_last_activity.items()):
            if now - last_activity > timedelta(hours=SESSION_TIMEOUT_HOURS):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            if session_id in conversation_sessions:
                del conversation_sessions[session_id]
            if session_id in session_last_activity:
                del session_last_activity[session_id]
    
    if expired_sessions:
        print(f"[Memory] Cleaned up {len(expired_sessions)} expired sessions")


def start_cleanup_thread():
    """Khởi động background thread để cleanup expired sessions."""
    def cleanup_worker():
        while True:
            try:
                time.sleep(CLEANUP_INTERVAL_SECONDS)
                cleanup_expired_sessions()
            except Exception as e:
                print(f"[WARN][Memory][Cleanup] Error: {e}")
    
    thread = threading.Thread(target=cleanup_worker, daemon=True, name="MemoryCleanup")
    thread.start()
    print("[Memory] Cleanup thread started")


# Auto-start cleanup thread
import threading as _threading
_threading.Thread(target=start_cleanup_thread, daemon=True).start()

