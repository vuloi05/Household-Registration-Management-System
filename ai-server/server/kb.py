import json
import threading
import time
from datetime import datetime, timedelta
from difflib import SequenceMatcher

from . import settings


qa_knowledge_base: list[dict] = []  # List[{"q": str, "a": str}]
kb_lock = threading.Lock()
kb_last_reload_time: datetime = None  # Track lần cuối reload
kb_reload_count: int = 0  # Đếm số lần reload
auto_reload_thread: threading.Thread = None  # Background thread cho auto-reload


def load_qa_knowledge_base(force_reload: bool = False) -> dict:
    """
    Load knowledge base từ AWS (DynamoDB và S3).
    
    Args:
        force_reload: Nếu True, reload ngay cả khi không có thay đổi
        
    Returns:
        dict với thông tin về quá trình reload: {
            'success': bool,
            'items_count': int,
            'previous_count': int,
            'timestamp': str,
            'error': str (nếu có)
        }
    """
    global qa_knowledge_base, kb_last_reload_time, kb_reload_count
    items: list[dict] = []
    previous_count = 0
    
    try:
        with kb_lock:
            previous_count = len(qa_knowledge_base)
        
        # Prefer DynamoDB - tăng limit để lấy nhiều hơn
        if settings.ddb_client and settings.AWS_DDB_TABLE:
            try:
                # Scan với pagination để lấy tất cả items
                scan_kwargs = {'TableName': settings.AWS_DDB_TABLE}
                while True:
                    resp = settings.ddb_client.scan(**scan_kwargs)
                    for it in resp.get('Items', []):
                        msg = it.get('message', {}).get('S', '').strip()
                        ans = it.get('response', {}).get('S', '').strip()
                        # Chỉ lấy các items có source là user-feedback hoặc confirmed
                        source = it.get('source', {}).get('S', '').strip().lower()
                        if msg and ans and len(msg) > 3 and len(ans) > 2:
                            # Ưu tiên các response từ feedback hoặc auto-corrected
                            if 'feedback' in source or 'corrected' in source or 'confirm' in source:
                                items.append({'q': msg, 'a': ans, 'priority': 2})
                            else:
                                items.append({'q': msg, 'a': ans, 'priority': 1})
                    
                    # Pagination
                    if 'LastEvaluatedKey' not in resp:
                        break
                    scan_kwargs['ExclusiveStartKey'] = resp['LastEvaluatedKey']
            except Exception as e:
                print(f"[WARN][KB-load-DDB] {e}")
        
        # Add from S3 - lấy nhiều ngày hơn để học từ lịch sử
        if settings.s3_client and settings.AWS_S3_BUCKET:
            days_to_check = 3  # Tăng từ 2 lên 3 ngày
            for offset in range(0, days_to_check):
                date = datetime.now() - timedelta(days=offset)
                key = f"{settings.LEARNING_S3_PREFIX}/{date.strftime('%Y/%m/%d')}.ndjson"
                try:
                    obj = settings.s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
                    body = obj['Body'].read().decode('utf-8')
                    lines = [ln for ln in body.strip().split('\n') if ln.strip()]
                    # Lấy nhiều dòng hơn từ mỗi file
                    for ln in lines[-200:]:  # Tăng từ 100 lên 200
                        try:
                            ev = json.loads(ln)
                        except Exception:
                            continue
                        msg = ev.get('message', '').strip()
                        ans = ev.get('response', '').strip()
                        source = ev.get('source', '').strip().lower()
                        if msg and ans and len(msg) > 3 and len(ans) > 2:
                            # Ưu tiên các response từ feedback
                            if 'feedback' in source or 'corrected' in source:
                                items.append({'q': msg, 'a': ans, 'priority': 2})
                            else:
                                items.append({'q': msg, 'a': ans, 'priority': 1})
                except Exception:
                    continue
        
        # Deduplicate (ưu tiên items có priority cao hơn và mới hơn)
        dedup: dict[str, dict] = {}
        for it in reversed(items):  # Reverse để ưu tiên items mới
            k = it['q'].strip().lower()
            if len(k) > 3:
                # Nếu chưa có hoặc priority thấp hơn, cập nhật
                if k not in dedup or dedup[k].get('priority', 1) < it.get('priority', 1):
                    dedup[k] = it
        
        final_items = [{'q': it['q'], 'a': it['a']} for it in dedup.values()]
        
        with kb_lock:
            old_count = len(qa_knowledge_base)
            qa_knowledge_base = final_items
            kb_last_reload_time = datetime.now()
            kb_reload_count += 1
        
        print(f"[KB] Reloaded: {old_count} -> {len(final_items)} QA items from AWS (reload #{kb_reload_count})")
        
        return {
            'success': True,
            'items_count': len(final_items),
            'previous_count': previous_count,
            'timestamp': kb_last_reload_time.strftime("%Y-%m-%d %H:%M:%S"),
            'error': None
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"[WARN][KB-load] {error_msg}")
        return {
            'success': False,
            'items_count': previous_count,
            'previous_count': previous_count,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'error': error_msg
        }


def find_best_local_answer(q: str, threshold: float = 0.85):
    q = q.strip().lower()
    best_score = 0
    best_ans = None
    with kb_lock:
        for item in qa_knowledge_base:
            qkb = item['q'].strip().lower()
            if q == qkb:
                return item['a']
            score = SequenceMatcher(None, q, qkb).ratio()
            if score > best_score and score >= threshold:
                best_score = score
                best_ans = item['a']
    return best_ans


def start_auto_reload_background_thread():
    """Khởi động background thread để tự động reload knowledge base định kỳ."""
    global auto_reload_thread
    
    if not settings.LEARNING_AUTO_RELOAD_ENABLED:
        print("[KB] Auto-reload disabled in settings")
        return
    
    if not settings.boto3 or (not settings.s3_client and not settings.ddb_client):
        print("[KB] AWS not configured, skipping auto-reload")
        return
    
    interval = settings.LEARNING_AUTO_RELOAD_INTERVAL
    if interval <= 0:
        print("[KB] Auto-reload interval is 0, skipping auto-reload")
        return
    
    def auto_reload_worker():
        """Worker thread để reload định kỳ."""
        print(f"[KB] Auto-reload thread started, interval: {interval} seconds")
        while True:
            try:
                time.sleep(interval)
                if settings.LEARNING_AUTO_RELOAD_ENABLED and interval > 0:
                    result = load_qa_knowledge_base()
                    if result['success']:
                        print(f"[KB][Auto-reload] Success: {result['items_count']} items at {result['timestamp']}")
                    else:
                        print(f"[KB][Auto-reload] Failed: {result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"[WARN][KB][Auto-reload] Error in worker thread: {e}")
                # Tiếp tục chạy ngay cả khi có lỗi
    
    auto_reload_thread = threading.Thread(target=auto_reload_worker, daemon=True, name="KB-AutoReload")
    auto_reload_thread.start()
    print(f"[KB] Auto-reload background thread started")


def get_kb_status() -> dict:
    """Lấy thông tin trạng thái của knowledge base."""
    with kb_lock:
        return {
            'items_count': len(qa_knowledge_base),
            'last_reload_time': kb_last_reload_time.strftime("%Y-%m-%d %H:%M:%S") if kb_last_reload_time else None,
            'reload_count': kb_reload_count,
            'auto_reload_enabled': settings.LEARNING_AUTO_RELOAD_ENABLED,
            'auto_reload_interval': settings.LEARNING_AUTO_RELOAD_INTERVAL,
            'aws_configured': bool(settings.boto3 and (settings.s3_client or settings.ddb_client))
        }


def trigger_reload() -> dict:
    """Trigger reload knowledge base ngay lập tức."""
    print("[KB] Manual reload triggered")
    return load_qa_knowledge_base(force_reload=True)


# Background load at startup if AWS configured
if settings.boto3 and (settings.s3_client or settings.ddb_client):
    # Load ngay lập tức khi startup
    threading.Thread(target=lambda: load_qa_knowledge_base(), daemon=True).start()
    # Khởi động auto-reload thread
    start_auto_reload_background_thread()
    # Khởi động auto-learning thread (tự học chủ động)
    try:
        from .auto_learning import start_auto_learning_background_thread
        start_auto_learning_background_thread()
    except Exception as e:
        print(f"[WARN] Failed to start auto-learning: {e}")


