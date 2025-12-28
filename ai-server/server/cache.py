"""
Response Caching - Cache các câu trả lời để giảm API calls
Hỗ trợ Redis backend với fallback về memory cache
"""

import hashlib
import json
import threading
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from collections import OrderedDict
from .utils import normalize_text
from . import settings
from .logger import get_logger

logger = get_logger(__name__)

# LRU Cache in-memory (fallback)
response_cache: OrderedDict[str, Dict] = OrderedDict()
cache_lock = threading.Lock()

# Cache versioning - increment when KB updates
_cache_version_lock = threading.Lock()

# Initialize cache version from settings (with fallback)
# Always initialize with a default value first
_cache_version = 1

# Then try to get from settings if available
def _init_cache_version():
    """Initialize cache version from settings."""
    global _cache_version
    try:
        cache_version_value = getattr(settings, 'CACHE_VERSION', None)
        if cache_version_value is not None:
            _cache_version = int(cache_version_value)
    except (AttributeError, ValueError, TypeError):
        _cache_version = 1

# Initialize on module load
_init_cache_version()

# Popular queries tracking for cache warming
_popular_queries: Dict[str, int] = {}  # query_key -> hit_count
_popular_queries_lock = threading.Lock()
_POPULAR_QUERIES_MAX_SIZE = 100  # Track top 100 popular queries

# Config
CACHE_MAX_SIZE = settings.RESPONSE_CACHE_MAX_SIZE
CACHE_TTL_SECONDS = settings.RESPONSE_CACHE_TTL

# Redis client (initialized from settings)
redis_client = getattr(settings, 'redis_client', None)


def get_cache_version() -> int:
    """Lấy cache version hiện tại."""
    global _cache_version
    with _cache_version_lock:
        # Ensure _cache_version is initialized
        if '_cache_version' not in globals() or _cache_version is None:
            _init_cache_version()
        return _cache_version


def increment_cache_version() -> int:
    """
    Tăng cache version (gọi khi KB update để invalidate cache).
    
    Returns:
        Cache version mới
    """
    global _cache_version
    with _cache_version_lock:
        # Ensure _cache_version is initialized
        if '_cache_version' not in globals() or _cache_version is None:
            _init_cache_version()
        _cache_version += 1
        logger.info(f"Cache version incremented to {_cache_version}")
        return _cache_version


def _generate_cache_key(
    message: str, 
    context: str = "", 
    history: Optional[List[Dict]] = None,
    system_info: Optional[Dict] = None
) -> str:
    """
    Tạo cache key từ message, context, history và system_info.
    Cải thiện để tính đến conversation context đầy đủ.
    """
    # Normalize message và context
    normalized_message = normalize_text(message)
    normalized_context = normalize_text(context)
    
    # Include recent history (last 3 messages for context)
    history_str = ""
    if history:
        # Lấy 3 messages gần nhất
        recent_history = history[-3:] if len(history) > 3 else history
        history_parts = []
        for msg in recent_history:
            role = msg.get('role', '')
            content = msg.get('content', '')
            if content:
                history_parts.append(f"{role}:{normalize_text(content)}")
        history_str = "|".join(history_parts)
    
    # Include system_info nếu có (user_id, session_id, etc.)
    system_str = ""
    if system_info:
        # Chỉ include các fields quan trọng
        relevant_fields = ['user_id', 'session_id']
        system_parts = [f"{k}:{v}" for k, v in system_info.items() if k in relevant_fields and v]
        system_str = "|".join(system_parts)
    
    # Combine tất cả
    combined = f"v{get_cache_version()}|{normalized_message}|{normalized_context}|{history_str}|{system_str}"
    
    # Hash để tạo key ngắn gọn
    return hashlib.md5(combined.encode('utf-8')).hexdigest()


def _get_cached_response_redis(cache_key: str) -> Optional[str]:
    """
    Lấy cached response từ Redis.
    
    Returns:
        Cached response hoặc None
    """
    if not redis_client:
        return None
    
    try:
        redis_key = f"response:{cache_key}"
        cached_data = redis_client.get(redis_key)
        if cached_data:
            data = json.loads(cached_data)
            # Kiểm tra TTL
            timestamp = datetime.fromisoformat(data['timestamp'])
            if datetime.now() - timestamp < timedelta(seconds=CACHE_TTL_SECONDS):
                # Update metrics
                try:
                    from .metrics import update_cache_metrics
                    update_cache_metrics(size=_get_redis_cache_size(), is_hit=True)
                except ImportError:
                    pass
                return data['response']
            else:
                # Expired, remove
                redis_client.delete(redis_key)
    except Exception as e:
        logger.warning(f"Redis cache get error: {e}, falling back to memory cache")
    
    return None


def _cache_response_redis(cache_key: str, response: str) -> bool:
    """
    Cache response vào Redis.
    
    Returns:
        True nếu thành công, False nếu không
    """
    if not redis_client:
        return False
    
    try:
        redis_key = f"response:{cache_key}"
        data = {
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'version': get_cache_version()
        }
        # Set với TTL
        redis_client.setex(
            redis_key,
            CACHE_TTL_SECONDS,
            json.dumps(data)
        )
        return True
    except Exception as e:
        logger.warning(f"Redis cache set error: {e}, falling back to memory cache")
        return False


def _get_redis_cache_size() -> int:
    """Lấy số lượng items trong Redis cache."""
    if not redis_client:
        return 0
    try:
        # Count keys matching pattern
        keys = redis_client.keys("response:*")
        return len(keys)
    except Exception:
        return 0


def _get_cached_response_memory(cache_key: str) -> Optional[str]:
    """
    Lấy cached response từ memory cache.
    
    Returns:
        Cached response hoặc None
    """
    with cache_lock:
        if cache_key in response_cache:
            cached_item = response_cache[cache_key]
            
            # Kiểm tra TTL
            if datetime.now() - cached_item['timestamp'] < timedelta(seconds=CACHE_TTL_SECONDS):
                # Kiểm tra version
                if cached_item.get('version', 0) == get_cache_version():
                    # Move to end (LRU)
                    response_cache.move_to_end(cache_key)
                    # Update metrics
                    try:
                        from .metrics import update_cache_metrics
                        update_cache_metrics(size=len(response_cache), is_hit=True)
                    except ImportError:
                        pass
                    return cached_item['response']
                else:
                    # Version mismatch, remove
                    del response_cache[cache_key]
            else:
                # Expired, remove
                del response_cache[cache_key]
    
    return None


def _cache_response_memory(cache_key: str, response: str) -> None:
    """Cache response vào memory."""
    with cache_lock:
        # Remove nếu đã tồn tại
        if cache_key in response_cache:
            del response_cache[cache_key]
        
        # Thêm mới
        response_cache[cache_key] = {
            'response': response,
            'timestamp': datetime.now(),
            'version': get_cache_version()
        }
        
        # LRU: Xóa oldest nếu quá max size
        while len(response_cache) > CACHE_MAX_SIZE:
            response_cache.popitem(last=False)  # Remove oldest
        
        # Update metrics
        try:
            from .metrics import update_cache_metrics
            update_cache_metrics(size=len(response_cache), is_hit=None)
        except ImportError:
            pass


def get_cached_response(
    message: str, 
    context: str = "",
    history: Optional[List[Dict]] = None,
    system_info: Optional[Dict] = None
) -> Optional[str]:
    """
    Lấy cached response nếu có.
    Ưu tiên Redis, fallback về memory.
    
    Args:
        message: User message
        context: Context string
        history: Conversation history (list of dicts with 'role' and 'content')
        system_info: System info/metadata (dict)
    
    Returns:
        Cached response hoặc None nếu không có/đã hết hạn
    """
    cache_key = _generate_cache_key(message, context, history, system_info)
    
    # Try Redis first
    if redis_client:
        cached = _get_cached_response_redis(cache_key)
        if cached:
            # Track popular queries
            _track_popular_query(cache_key)
            return cached
    
    # Fallback to memory
    cached = _get_cached_response_memory(cache_key)
    if cached:
        # Track popular queries
        _track_popular_query(cache_key)
        return cached
    
    # Cache miss
    try:
        from .metrics import update_cache_metrics
        cache_size = _get_redis_cache_size() if redis_client else len(response_cache)
        update_cache_metrics(size=cache_size, is_hit=False)
    except ImportError:
        pass
    
    return None


def cache_response(
    message: str, 
    context: str, 
    response: str,
    history: Optional[List[Dict]] = None,
    system_info: Optional[Dict] = None
) -> None:
    """
    Cache response.
    Ưu tiên Redis, fallback về memory.
    
    Args:
        message: User message
        context: Context
        response: AI response
        history: Conversation history
        system_info: System info/metadata
    """
    cache_key = _generate_cache_key(message, context, history, system_info)
    
    # Try Redis first
    if redis_client:
        if _cache_response_redis(cache_key, response):
            return
    
    # Fallback to memory
    _cache_response_memory(cache_key, response)


def clear_cache() -> int:
    """
    Xóa toàn bộ cache (cả Redis và memory).
    
    Returns:
        Số lượng items đã xóa
    """
    count = 0
    
    # Clear Redis
    if redis_client:
        try:
            keys = redis_client.keys("response:*")
            if keys:
                redis_client.delete(*keys)
                count += len(keys)
        except Exception as e:
            logger.warning(f"Error clearing Redis cache: {e}")
    
    # Clear memory
    with cache_lock:
        count += len(response_cache)
        response_cache.clear()
    
    logger.info(f"Cache cleared: {count} items")
    return count


def invalidate_cache_by_version() -> int:
    """
    Invalidate cache bằng cách tăng version.
    Cache cũ sẽ tự động bị ignore khi check version.
    
    Returns:
        Cache version mới
    """
    return increment_cache_version()


def _track_popular_query(cache_key: str) -> None:
    """Track popular queries để warm cache sau."""
    with _popular_queries_lock:
        _popular_queries[cache_key] = _popular_queries.get(cache_key, 0) + 1
        
        # Giữ chỉ top N queries
        if len(_popular_queries) > _POPULAR_QUERIES_MAX_SIZE:
            # Remove least popular
            sorted_queries = sorted(_popular_queries.items(), key=lambda x: x[1])
            for key, _ in sorted_queries[:len(_popular_queries) - _POPULAR_QUERIES_MAX_SIZE]:
                del _popular_queries[key]


def get_popular_queries(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Lấy danh sách popular queries.
    
    Args:
        limit: Số lượng queries trả về
    
    Returns:
        List of dicts với 'key' và 'hit_count'
    """
    with _popular_queries_lock:
        sorted_queries = sorted(
            _popular_queries.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [
            {'key': key, 'hit_count': count}
            for key, count in sorted_queries[:limit]
        ]


def warm_cache(queries: List[Dict[str, str]]) -> int:
    """
    Warm cache với danh sách queries phổ biến.
    Sử dụng để pre-load cache khi server start hoặc sau KB update.
    
    Args:
        queries: List of dicts với 'message', 'context', 'response'
                 Optional: 'history', 'system_info'
    
    Returns:
        Số lượng queries đã cache thành công
    """
    count = 0
    for query in queries:
        try:
            message = query.get('message', '')
            context = query.get('context', '')
            response = query.get('response', '')
            history = query.get('history')
            system_info = query.get('system_info')
            
            if message and response:
                cache_response(message, context, response, history, system_info)
                count += 1
        except Exception as e:
            logger.warning(f"Error warming cache for query: {e}")
    
    logger.info(f"Cache warmed: {count}/{len(queries)} queries")
    return count


def get_cache_stats() -> Dict:
    """
    Lấy thống kê cache.
    
    Returns:
        Dict với thống kê cache
    """
    with cache_lock:
        now = datetime.now()
        valid_count = sum(
            1 for item in response_cache.values()
            if (now - item['timestamp'] < timedelta(seconds=CACHE_TTL_SECONDS) and
                item.get('version', 0) == get_cache_version())
        )
        expired_count = len(response_cache) - valid_count
    
    # Redis stats
    redis_size = 0
    redis_valid = 0
    if redis_client:
        try:
            redis_size = _get_redis_cache_size()
            # Note: Redis TTL được handle tự động, không cần check manual
            redis_valid = redis_size
        except Exception:
            pass
    
    # Popular queries stats
    with _popular_queries_lock:
        popular_count = len(_popular_queries)
        total_hits = sum(_popular_queries.values())
    
    return {
        'backend': 'redis' if redis_client else 'memory',
        'version': get_cache_version(),
        'memory': {
            'total_items': len(response_cache),
            'valid_items': valid_count,
            'expired_items': expired_count,
            'max_size': CACHE_MAX_SIZE,
        },
        'redis': {
            'enabled': bool(redis_client),
            'total_items': redis_size,
            'valid_items': redis_valid,
        },
        'ttl_seconds': CACHE_TTL_SECONDS,
        'popular_queries': {
            'tracked_count': popular_count,
            'total_hits': total_hits,
        }
    }