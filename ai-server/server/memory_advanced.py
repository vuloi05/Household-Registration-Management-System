"""
Conversation Memory - Advanced features
Memory compression, search, và cleanup operations
"""

import json
import threading
import time
from datetime import datetime, timedelta
from typing import List, Dict

# Import shared state và functions từ memory.py
from .memory import (
    redis_client,
    conversation_sessions,
    session_last_activity,
    session_summaries,
    memory_lock,
    SESSION_TIMEOUT_HOURS,
    MEMORY_COMPRESSION_KEEP_RECENT,
    REDIS_KEY_MESSAGES,
    REDIS_KEY_SUMMARY,
    _get_redis_key,
    _create_summary,
    clear_session
)

# Config
CLEANUP_INTERVAL_SECONDS = int(__import__('os').getenv('MEMORY_CLEANUP_INTERVAL', '3600'))  # Cleanup mỗi giờ


def _compress_memory_redis(session_id: str) -> None:
    """Nén memory trong Redis bằng cách tóm tắt các messages cũ."""
    try:
        messages_key = _get_redis_key(REDIS_KEY_MESSAGES, session_id)
        summary_key = _get_redis_key(REDIS_KEY_SUMMARY, session_id)
        
        # Lấy tất cả messages
        all_messages_raw = redis_client.lrange(messages_key, 0, -1)
        all_messages = [json.loads(msg) for msg in all_messages_raw]
        
        if len(all_messages) <= MEMORY_COMPRESSION_KEEP_RECENT:
            return  # Không cần nén
        
        # Tách messages cũ và messages gần đây
        old_messages = all_messages[:-MEMORY_COMPRESSION_KEEP_RECENT]
        recent_messages = all_messages[-MEMORY_COMPRESSION_KEEP_RECENT:]
        
        # Tạo summary từ messages cũ
        existing_summary = redis_client.get(summary_key) or ""
        new_summary = _create_summary(old_messages)
        
        # Kết hợp summary cũ và mới
        if existing_summary:
            combined_summary = f"{existing_summary} | {new_summary}"
            if len(combined_summary) > 1000:  # Giới hạn độ dài summary
                combined_summary = combined_summary[:1000] + "..."
        else:
            combined_summary = new_summary
        
        # Lưu summary
        redis_client.setex(summary_key, SESSION_TIMEOUT_HOURS * 3600, combined_summary)
        
        # Xóa messages cũ và chỉ giữ lại messages gần đây
        redis_client.delete(messages_key)
        for msg in recent_messages:
            redis_client.rpush(messages_key, json.dumps(msg))
        
        redis_client.expire(messages_key, SESSION_TIMEOUT_HOURS * 3600)
        
        print(f"[Memory] Compressed memory for session {session_id}: {len(old_messages)} messages -> summary")
        
    except Exception as e:
        print(f"[Memory][WARN] Error compressing memory in Redis: {e}")


def _compress_memory_inmemory(session_id: str) -> None:
    """Nén memory trong in-memory storage."""
    with memory_lock:
        if session_id not in conversation_sessions:
            return
        
        messages = conversation_sessions[session_id]
        if len(messages) <= MEMORY_COMPRESSION_KEEP_RECENT:
            return
        
        # Tách messages cũ và messages gần đây
        old_messages = messages[:-MEMORY_COMPRESSION_KEEP_RECENT]
        recent_messages = messages[-MEMORY_COMPRESSION_KEEP_RECENT:]
        
        # Tạo summary từ messages cũ
        existing_summary = session_summaries.get(session_id, "")
        new_summary = _create_summary(old_messages)
        
        # Kết hợp summary
        if existing_summary:
            combined_summary = f"{existing_summary} | {new_summary}"
            if len(combined_summary) > 1000:
                combined_summary = combined_summary[:1000] + "..."
        else:
            combined_summary = new_summary
        
        # Lưu summary và chỉ giữ lại messages gần đây
        session_summaries[session_id] = combined_summary
        conversation_sessions[session_id] = recent_messages
        
        print(f"[Memory] Compressed memory for session {session_id}: {len(old_messages)} messages -> summary")


def search_conversation_history(session_id: str, query: str, max_results: int = 5) -> List[Dict]:
    """
    Tìm kiếm trong conversation history.
    
    Args:
        session_id: Session ID
        query: Từ khóa tìm kiếm
        max_results: Số kết quả tối đa
    
    Returns:
        List of messages chứa query, kèm theo score (relevance)
    """
    query_lower = query.lower()
    results = []
    
    if redis_client:
        # Sử dụng Redis
        try:
            messages_key = _get_redis_key(REDIS_KEY_MESSAGES, session_id)
            summary_key = _get_redis_key(REDIS_KEY_SUMMARY, session_id)
            
            # Lấy tất cả messages
            messages_raw = redis_client.lrange(messages_key, 0, -1)
            messages = [json.loads(msg) for msg in messages_raw]
            
            # Lấy summary nếu có
            summary = redis_client.get(summary_key)
            if summary and query_lower in summary.lower():
                results.append({
                    'role': 'system',
                    'content': f"[Summary] {summary}",
                    'timestamp': datetime.now().isoformat(),
                    'is_summary': True,
                    'score': 0.8  # Summary có điểm thấp hơn messages cụ thể
                })
            
            # Tìm kiếm trong messages
            for msg in messages:
                content = msg.get('content', '').lower()
                if query_lower in content:
                    # Tính score dựa trên vị trí và số lần xuất hiện
                    occurrences = content.count(query_lower)
                    score = min(1.0, 0.5 + (occurrences * 0.1))
                    
                    results.append({
                        **msg,
                        'score': score
                    })
            
            # Sắp xếp theo score và giới hạn kết quả
            results.sort(key=lambda x: x.get('score', 0), reverse=True)
            return results[:max_results]
            
        except Exception as e:
            print(f"[Memory][WARN] Redis error in search_conversation_history: {e}, falling back to memory")
            # Fallback to in-memory
            with memory_lock:
                if session_id not in conversation_sessions:
                    return []
                
                messages = conversation_sessions[session_id]
                summary = session_summaries.get(session_id, "")
                
                # Tìm trong summary
                if summary and query_lower in summary.lower():
                    results.append({
                        'role': 'system',
                        'content': f"[Summary] {summary}",
                        'timestamp': datetime.now().isoformat(),
                        'is_summary': True,
                        'score': 0.8
                    })
                
                # Tìm trong messages
                for msg in messages:
                    content = msg.get('content', '').lower()
                    if query_lower in content:
                        occurrences = content.count(query_lower)
                        score = min(1.0, 0.5 + (occurrences * 0.1))
                        results.append({
                            **msg,
                            'score': score
                        })
                
                results.sort(key=lambda x: x.get('score', 0), reverse=True)
                return results[:max_results]
    else:
        # Sử dụng in-memory
        with memory_lock:
            if session_id not in conversation_sessions:
                return []
            
            messages = conversation_sessions[session_id]
            summary = session_summaries.get(session_id, "")
            
            # Tìm trong summary
            if summary and query_lower in summary.lower():
                results.append({
                    'role': 'system',
                    'content': f"[Summary] {summary}",
                    'timestamp': datetime.now().isoformat(),
                    'is_summary': True,
                    'score': 0.8
                })
            
            # Tìm trong messages
            for msg in messages:
                content = msg.get('content', '').lower()
                if query_lower in content:
                    occurrences = content.count(query_lower)
                    score = min(1.0, 0.5 + (occurrences * 0.1))
                    results.append({
                        **msg,
                        'score': score
                    })
            
            results.sort(key=lambda x: x.get('score', 0), reverse=True)
            return results[:max_results]


def get_active_sessions_count() -> int:
    """Lấy số lượng active sessions."""
    if redis_client:
        # Sử dụng Redis
        try:
            # Tìm tất cả keys có pattern session:*:last_activity
            pattern = "session:*:last_activity"
            keys = redis_client.keys(pattern)
            return len(keys)
        except Exception as e:
            print(f"[Memory][WARN] Redis error in get_active_sessions_count: {e}, falling back to memory")
            # Fallback to in-memory
            with memory_lock:
                return len(session_last_activity)
    else:
        # Sử dụng in-memory
        with memory_lock:
            return len(session_last_activity)


def cleanup_expired_sessions() -> None:
    """Xóa các session đã hết hạn."""
    if redis_client:
        # Redis tự động xóa keys hết hạn, nhưng ta vẫn có thể cleanup thủ công
        try:
            pattern = "session:*:last_activity"
            keys = redis_client.keys(pattern)
            now = datetime.now()
            expired_count = 0
            
            for key in keys:
                last_activity_str = redis_client.get(key)
                if last_activity_str:
                    try:
                        last_activity = datetime.fromisoformat(last_activity_str)
                        if now - last_activity > timedelta(hours=SESSION_TIMEOUT_HOURS):
                            # Extract session_id từ key
                            session_id = key.split(':')[1]
                            clear_session(session_id)
                            expired_count += 1
                    except (ValueError, IndexError):
                        continue
            
            if expired_count > 0:
                print(f"[Memory] Cleaned up {expired_count} expired sessions from Redis")
        except Exception as e:
            print(f"[Memory][WARN] Redis error in cleanup_expired_sessions: {e}")
    else:
        # Sử dụng in-memory
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
                if session_id in session_summaries:
                    del session_summaries[session_id]
        
        # Update metrics với số active sessions sau cleanup
        try:
            from .metrics import update_session_metrics
            active_count = get_active_sessions_count()
            update_session_metrics(active_count)
        except ImportError:
            pass  # Metrics module chưa available
        
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