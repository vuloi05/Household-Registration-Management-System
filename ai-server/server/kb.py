import json
import threading
import time
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from .utils import normalize_text, tokenize_keywords

from . import settings


qa_knowledge_base: list[dict] = []  # List[{"q": str, "a": str}]
kb_lock = threading.Lock()
kb_last_reload_time: datetime = None  # Track lần cuối reload
kb_reload_count: int = 0  # Đếm số lần reload
auto_reload_thread: threading.Thread = None  # Background thread cho auto-reload

# Metrics
kb_queries: int = 0
kb_hits: int = 0


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
        
        # Add from S3 - load toàn bộ database để tự học từ tất cả lịch sử
        if settings.s3_client and settings.AWS_S3_BUCKET:
            try:
                # List tất cả các files trong S3 với prefix LEARNING_S3_PREFIX
                prefix = f"{settings.LEARNING_S3_PREFIX}/"
                paginator = settings.s3_client.get_paginator('list_objects_v2')
                pages = paginator.paginate(Bucket=settings.AWS_S3_BUCKET, Prefix=prefix)
                
                all_keys = []
                for page in pages:
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            key = obj['Key']
                            # Chỉ lấy các file .ndjson
                            if key.endswith('.ndjson'):
                                all_keys.append(key)
                
                print(f"[KB] Found {len(all_keys)} files in S3, loading all data...")
                
                # Load tất cả các files
                for key in all_keys:
                    try:
                        obj = settings.s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
                        body = obj['Body'].read().decode('utf-8')
                        lines = [ln for ln in body.strip().split('\n') if ln.strip()]
                        # Load tất cả dòng từ mỗi file (không giới hạn)
                        for ln in lines:
                            try:
                                ev = json.loads(ln)
                            except Exception:
                                continue
                            msg = ev.get('message', '').strip()
                            ans = ev.get('response', '').strip()
                            source = ev.get('source', '').strip().lower()
                            if msg and ans and len(msg) > 3 and len(ans) > 2:
                                # Ưu tiên các response từ feedback
                                if 'feedback' in source or 'corrected' in source or 'confirm' in source:
                                    items.append({'q': msg, 'a': ans, 'priority': 2})
                                else:
                                    items.append({'q': msg, 'a': ans, 'priority': 1})
                    except Exception as e:
                        # Tiếp tục với file tiếp theo nếu có lỗi
                        print(f"[WARN][KB-load-S3] Error loading {key}: {e}")
                        continue
                        
            except Exception as e:
                print(f"[WARN][KB-load-S3] Error listing S3 objects: {e}")
                # Fallback: thử load 30 ngày gần nhất nếu không list được
                days_to_check = 30
                for offset in range(0, days_to_check):
                    date = datetime.now() - timedelta(days=offset)
                    key = f"{settings.LEARNING_S3_PREFIX}/{date.strftime('%Y/%m/%d')}.ndjson"
                    try:
                        obj = settings.s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
                        body = obj['Body'].read().decode('utf-8')
                        lines = [ln for ln in body.strip().split('\n') if ln.strip()]
                        for ln in lines:
                            try:
                                ev = json.loads(ln)
                            except Exception:
                                continue
                            msg = ev.get('message', '').strip()
                            ans = ev.get('response', '').strip()
                            source = ev.get('source', '').strip().lower()
                            if msg and ans and len(msg) > 3 and len(ans) > 2:
                                if 'feedback' in source or 'corrected' in source or 'confirm' in source:
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


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / max(union, 1)


def find_best_local_answer(q: str, threshold: float = None):
    # Configurable thresholds
    similarity_threshold = threshold if threshold is not None else settings.KB_SIMILARITY_THRESHOLD
    jaccard_threshold = settings.KB_JACCARD_THRESHOLD

    global kb_queries, kb_hits
    kb_queries += 1

    norm_q = normalize_text(q)
    q_tokens = set(tokenize_keywords(q))
    best_score = 0.0
    best_ans = None

    with kb_lock:
        for item in qa_knowledge_base:
            qkb_raw = item['q']
            a_raw = item['a']
            norm_kb_q = normalize_text(qkb_raw)
            kb_tokens = set(tokenize_keywords(qkb_raw))
            # Two signals
            seq_score = SequenceMatcher(None, norm_q, norm_kb_q).ratio()
            jacc = _jaccard(q_tokens, kb_tokens)
            combined = max(seq_score, jacc)
            # Accept if either signal clears its threshold
            if (seq_score >= similarity_threshold) or (jacc >= jaccard_threshold):
                if combined > best_score:
                    best_score = combined
                    best_ans = a_raw

    if best_ans is not None:
        kb_hits += 1
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
            'aws_configured': bool(settings.boto3 and (settings.s3_client or settings.ddb_client)),
            'metrics': {
                'kb_queries': kb_queries,
                'kb_hits': kb_hits,
                'kb_hit_rate': (kb_hits / kb_queries) if kb_queries else 0.0
            }
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


