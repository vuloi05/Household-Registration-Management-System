"""
Response Caching - Cache các câu trả lời để giảm API calls
"""

import hashlib
import threading
import time
from datetime import datetime, timedelta
from typing import Optional, Dict
from collections import OrderedDict
from .utils import normalize_text

# LRU Cache in-memory
response_cache: OrderedDict[str, Dict] = OrderedDict()
cache_lock = threading.Lock()

# Config
CACHE_MAX_SIZE = 1000  # Tối đa 1000 cached responses
CACHE_TTL_SECONDS = 3600  # Cache valid trong 1 giờ


def _generate_cache_key(message: str, context: str = "") -> str:
    """Tạo cache key từ message và context."""
    normalized_message = normalize_text(message)
    normalized_context = normalize_text(context)
    combined = f"{normalized_message}|{normalized_context}"
    return hashlib.md5(combined.encode('utf-8')).hexdigest()


def get_cached_response(message: str, context: str = "") -> Optional[str]:
    """
    Lấy cached response nếu có.
    
    Returns:
        Cached response hoặc None nếu không có/đã hết hạn
    """
    cache_key = _generate_cache_key(message, context)
    
    with cache_lock:
        if cache_key in response_cache:
            cached_item = response_cache[cache_key]
            
            # Kiểm tra TTL
            if datetime.now() - cached_item['timestamp'] < timedelta(seconds=CACHE_TTL_SECONDS):
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
                # Expired, remove
                del response_cache[cache_key]
    
    # Cache miss
    try:
        from .metrics import update_cache_metrics
        with cache_lock:
            update_cache_metrics(size=len(response_cache), is_hit=False)
    except ImportError:
        pass
    
    return None


def cache_response(message: str, context: str, response: str) -> None:
    """
    Cache response.
    
    Args:
        message: User message
        context: Context
        response: AI response
    """
    cache_key = _generate_cache_key(message, context)
    
    with cache_lock:
        # Remove nếu đã tồn tại
        if cache_key in response_cache:
            del response_cache[cache_key]
        
        # Thêm mới
        response_cache[cache_key] = {
            'response': response,
            'timestamp': datetime.now()
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


def clear_cache() -> int:
    """
    Xóa toàn bộ cache.
    
    Returns:
        Số lượng items đã xóa
    """
    with cache_lock:
        count = len(response_cache)
        response_cache.clear()
    return count


def get_cache_stats() -> Dict:
    """Lấy thống kê cache."""
    with cache_lock:
        now = datetime.now()
        valid_count = sum(
            1 for item in response_cache.values()
            if now - item['timestamp'] < timedelta(seconds=CACHE_TTL_SECONDS)
        )
        expired_count = len(response_cache) - valid_count
        
        return {
            'total_items': len(response_cache),
            'valid_items': valid_count,
            'expired_items': expired_count,
            'max_size': CACHE_MAX_SIZE,
            'ttl_seconds': CACHE_TTL_SECONDS
        }