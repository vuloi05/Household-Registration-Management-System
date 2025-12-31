"""
Conversation Memory - Core operations
Lưu trữ và quản lý conversation history cơ bản
Hỗ trợ Redis backend cho persistence
"""

import json
import os
import threading
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from collections import defaultdict

# Redis client (optional)
redis_client = None
try:
    import redis
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        redis_client = redis.from_url(redis_url, decode_responses=True)
        print(f"[Memory] Redis connected: {redis_url}")
    else:
        print("[Memory] Redis not configured (REDIS_URL not set), using in-memory storage")
except ImportError:
    print("[Memory] Redis package not installed, using in-memory storage")
except Exception as e:
    print(f"[Memory] Failed to connect to Redis: {e}, falling back to in-memory storage")
    redis_client = None

# In-memory storage (fallback khi không có Redis)
conversation_sessions: Dict[str, List[Dict]] = defaultdict(list)  # session_id -> list of messages
session_last_activity: Dict[str, datetime] = {}  # session_id -> last activity time
session_summaries: Dict[str, str] = {}  # session_id -> summary của conversation cũ
memory_lock = threading.Lock()

# Config
SESSION_TIMEOUT_HOURS = int(os.getenv('SESSION_TIMEOUT_HOURS', '24'))  # Session timeout sau 24h không hoạt động
MAX_MESSAGES_PER_SESSION = int(os.getenv('MAX_MESSAGES_PER_SESSION', '50'))  # Giới hạn số messages trong 1 session

# Memory compression config
MEMORY_COMPRESSION_ENABLED = os.getenv('MEMORY_COMPRESSION_ENABLED', 'true').lower() == 'true'
MEMORY_COMPRESSION_THRESHOLD = int(os.getenv('MEMORY_COMPRESSION_THRESHOLD', '30'))  # Nén khi có >= 30 messages
MEMORY_COMPRESSION_KEEP_RECENT = int(os.getenv('MEMORY_COMPRESSION_KEEP_RECENT', '10'))  # Giữ lại 10 messages gần nhất

# Redis keys pattern
REDIS_KEY_MESSAGES = "session:{session_id}:messages"
REDIS_KEY_SUMMARY = "session:{session_id}:summary"
REDIS_KEY_LAST_ACTIVITY = "session:{session_id}:last_activity"
REDIS_KEY_METADATA = "session:{session_id}:metadata"


def _get_redis_key(key_template: str, session_id: str) -> str:
    """Helper để tạo Redis key từ template."""
    return key_template.format(session_id=session_id)


def _create_summary(messages: List[Dict]) -> str:
    """
    Tạo summary từ danh sách messages.
    Sử dụng heuristic đơn giản để tóm tắt conversation.
    """
    if not messages:
        return ""
    
    # Lấy các messages quan trọng (user questions và assistant answers chính)
    important_parts = []
    for msg in messages:
        role = msg.get('role', '')
        content = msg.get('content', '')
        if role == 'user' and len(content) > 20:  # Câu hỏi có ý nghĩa
            important_parts.append(f"User: {content[:200]}")  # Giới hạn độ dài
        elif role == 'assistant' and len(content) > 50:
            # Lấy phần đầu của câu trả lời
            important_parts.append(f"Assistant: {content[:300]}")
    
    # Tạo summary từ các phần quan trọng
    if important_parts:
        summary = " | ".join(important_parts[:5])  # Giới hạn 5 phần
        if len(summary) > 500:
            summary = summary[:500] + "..."
        return summary
    
    return f"Conversation with {len(messages)} messages"


def get_or_create_session(session_id: Optional[str] = None) -> str:
    """Tạo hoặc lấy session ID."""
    if not session_id:
        # Tạo session ID mới dựa trên timestamp
        session_id = f"session_{int(time.time() * 1000)}"
    
    is_new_session = False
    
    if redis_client:
        # Sử dụng Redis
        try:
            last_activity_key = _get_redis_key(REDIS_KEY_LAST_ACTIVITY, session_id)
            exists = redis_client.exists(last_activity_key)
            
            if not exists:
                is_new_session = True
                # Tạo metadata
                metadata = {
                    'created_at': datetime.now().isoformat(),
                    'message_count': 0
                }
                redis_client.setex(
                    _get_redis_key(REDIS_KEY_METADATA, session_id),
                    SESSION_TIMEOUT_HOURS * 3600,
                    json.dumps(metadata)
                )
            
            # Update last activity
            redis_client.setex(
                last_activity_key,
                SESSION_TIMEOUT_HOURS * 3600,
                datetime.now().isoformat()
            )
        except Exception as e:
            print(f"[Memory][WARN] Redis error in get_or_create_session: {e}, falling back to memory")
            # Fallback to in-memory
            with memory_lock:
                if session_id not in session_last_activity:
                    conversation_sessions[session_id] = []
                    is_new_session = True
                session_last_activity[session_id] = datetime.now()
    else:
        # Sử dụng in-memory
        with memory_lock:
            if session_id not in session_last_activity:
                conversation_sessions[session_id] = []
                is_new_session = True
            session_last_activity[session_id] = datetime.now()
    
    # Update metrics nếu session mới được tạo
    if is_new_session:
        try:
            from .memory_advanced import get_active_sessions_count
            from .metrics import update_session_metrics
            active_count = get_active_sessions_count()
            update_session_metrics(active_count)
        except ImportError:
            pass  # Metrics module chưa available
    
    return session_id


def add_message(session_id: str, role: str, content: str) -> None:
    """
    Thêm message vào conversation history.
    
    Args:
        session_id: Session ID
        role: 'user' hoặc 'assistant'
        content: Nội dung message
    """
    message = {
        'role': role,
        'content': content,
        'timestamp': datetime.now().isoformat()
    }
    
    if redis_client:
        # Sử dụng Redis
        try:
            messages_key = _get_redis_key(REDIS_KEY_MESSAGES, session_id)
            last_activity_key = _get_redis_key(REDIS_KEY_LAST_ACTIVITY, session_id)
            
            # Thêm message vào list
            redis_client.rpush(messages_key, json.dumps(message))
            
            # Set TTL cho messages list
            redis_client.expire(messages_key, SESSION_TIMEOUT_HOURS * 3600)
            
            # Update last activity
            redis_client.setex(
                last_activity_key,
                SESSION_TIMEOUT_HOURS * 3600,
                datetime.now().isoformat()
            )
            
            # Kiểm tra và nén memory nếu cần
            message_count = redis_client.llen(messages_key)
            if MEMORY_COMPRESSION_ENABLED and message_count >= MEMORY_COMPRESSION_THRESHOLD:
                from .memory_advanced import _compress_memory_redis
                _compress_memory_redis(session_id)
            
            # Update metadata
            try:
                metadata_key = _get_redis_key(REDIS_KEY_METADATA, session_id)
                metadata_str = redis_client.get(metadata_key)
                if metadata_str:
                    metadata = json.loads(metadata_str)
                    metadata['message_count'] = message_count
                    metadata['last_updated'] = datetime.now().isoformat()
                    redis_client.setex(metadata_key, SESSION_TIMEOUT_HOURS * 3600, json.dumps(metadata))
            except Exception:
                pass  # Metadata update không bắt buộc
                
        except Exception as e:
            print(f"[Memory][WARN] Redis error in add_message: {e}, falling back to memory")
            # Fallback to in-memory
            with memory_lock:
                if session_id not in conversation_sessions:
                    conversation_sessions[session_id] = []
                
                if len(conversation_sessions[session_id]) >= MAX_MESSAGES_PER_SESSION:
                    conversation_sessions[session_id] = conversation_sessions[session_id][-MAX_MESSAGES_PER_SESSION+1:]
                
                conversation_sessions[session_id].append(message)
                session_last_activity[session_id] = datetime.now()
                
                # Memory compression cho in-memory
                if MEMORY_COMPRESSION_ENABLED and len(conversation_sessions[session_id]) >= MEMORY_COMPRESSION_THRESHOLD:
                    from .memory_advanced import _compress_memory_inmemory
                    _compress_memory_inmemory(session_id)
    else:
        # Sử dụng in-memory
        with memory_lock:
            if session_id not in conversation_sessions:
                conversation_sessions[session_id] = []
            
            if len(conversation_sessions[session_id]) >= MAX_MESSAGES_PER_SESSION:
                conversation_sessions[session_id] = conversation_sessions[session_id][-MAX_MESSAGES_PER_SESSION+1:]
            
            conversation_sessions[session_id].append(message)
            session_last_activity[session_id] = datetime.now()
            
            # Memory compression
            if MEMORY_COMPRESSION_ENABLED and len(conversation_sessions[session_id]) >= MEMORY_COMPRESSION_THRESHOLD:
                from .memory_advanced import _compress_memory_inmemory
                _compress_memory_inmemory(session_id)


def get_conversation_history(session_id: str, max_messages: int = 10) -> List[Dict]:
    """
    Lấy conversation history của session.
    Bao gồm cả summary nếu có.
    
    Args:
        session_id: Session ID
        max_messages: Số messages tối đa (lấy từ cuối)
    
    Returns:
        List of messages: [{'role': str, 'content': str, 'timestamp': str}, ...]
        Nếu có summary, sẽ thêm một message summary ở đầu
    """
    if redis_client:
        # Sử dụng Redis
        try:
            messages_key = _get_redis_key(REDIS_KEY_MESSAGES, session_id)
            summary_key = _get_redis_key(REDIS_KEY_SUMMARY, session_id)
            
            # Lấy summary nếu có
            summary = redis_client.get(summary_key)
            
            # Lấy messages
            messages_raw = redis_client.lrange(messages_key, -max_messages, -1)
            messages = [json.loads(msg) for msg in messages_raw]
            
            # Thêm summary vào đầu nếu có
            if summary:
                messages.insert(0, {
                    'role': 'system',
                    'content': f"[Previous conversation summary] {summary}",
                    'timestamp': datetime.now().isoformat(),
                    'is_summary': True
                })
            
            return messages
            
        except Exception as e:
            print(f"[Memory][WARN] Redis error in get_conversation_history: {e}, falling back to memory")
            # Fallback to in-memory
            with memory_lock:
                if session_id not in conversation_sessions:
                    return []
                
                messages = conversation_sessions[session_id]
                result = messages[-max_messages:] if len(messages) > max_messages else messages
                
                # Thêm summary nếu có
                summary = session_summaries.get(session_id)
                if summary:
                    result.insert(0, {
                        'role': 'system',
                        'content': f"[Previous conversation summary] {summary}",
                        'timestamp': datetime.now().isoformat(),
                        'is_summary': True
                    })
                
                return result
    else:
        # Sử dụng in-memory
        with memory_lock:
            if session_id not in conversation_sessions:
                return []
            
            messages = conversation_sessions[session_id]
            result = messages[-max_messages:] if len(messages) > max_messages else messages
            
            # Thêm summary nếu có
            summary = session_summaries.get(session_id)
            if summary:
                result.insert(0, {
                    'role': 'system',
                    'content': f"[Previous conversation summary] {summary}",
                    'timestamp': datetime.now().isoformat(),
                    'is_summary': True
                })
            
            return result


def clear_session(session_id: str) -> None:
    """Xóa conversation history của session."""
    if redis_client:
        # Sử dụng Redis
        try:
            messages_key = _get_redis_key(REDIS_KEY_MESSAGES, session_id)
            summary_key = _get_redis_key(REDIS_KEY_SUMMARY, session_id)
            last_activity_key = _get_redis_key(REDIS_KEY_LAST_ACTIVITY, session_id)
            metadata_key = _get_redis_key(REDIS_KEY_METADATA, session_id)
            
            redis_client.delete(messages_key, summary_key, last_activity_key, metadata_key)
        except Exception as e:
            print(f"[Memory][WARN] Redis error in clear_session: {e}, falling back to memory")
            # Fallback to in-memory
            with memory_lock:
                if session_id in conversation_sessions:
                    del conversation_sessions[session_id]
                if session_id in session_last_activity:
                    del session_last_activity[session_id]
                if session_id in session_summaries:
                    del session_summaries[session_id]
    else:
        # Sử dụng in-memory
        with memory_lock:
            if session_id in conversation_sessions:
                del conversation_sessions[session_id]
            if session_id in session_last_activity:
                del session_last_activity[session_id]
            if session_id in session_summaries:
                del session_summaries[session_id]