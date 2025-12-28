from __future__ import annotations

import json
import threading
import time
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from typing import Optional, TYPE_CHECKING
from .utils import normalize_text, tokenize_keywords

from . import settings

# Optional: sentence-transformers for semantic similarity
# Import type for type checking only
if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer
    import numpy as np

# Runtime import
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    _sentence_transformers_available = True
except ImportError:
    _sentence_transformers_available = False
    SentenceTransformer = None  # type: ignore[assignment,misc]
    np = None  # type: ignore


qa_knowledge_base: list[dict] = []  # List[{"q": str, "a": str}]
kb_lock = threading.Lock()
kb_last_reload_time: datetime = None  # Track lần cuối reload
kb_reload_count: int = 0  # Đếm số lần reload
auto_reload_thread: threading.Thread = None  # Background thread cho auto-reload

# Metrics
kb_queries: int = 0
kb_hits: int = 0

# Semantic similarity model (lazy loaded)
_similarity_model: Optional["SentenceTransformer"] = None  # type: ignore[assignment]
_embedding_cache: dict = {}  # Cache embeddings by question text
_embedding_cache_lock = threading.Lock()
_embedding_cache_generation: int = 0  # Increment when KB reloads to invalidate cache


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
        
        # Clear embedding cache when KB reloads
        _clear_embedding_cache()
        
        # Invalidate response cache when KB updates
        try:
            from .cache import invalidate_cache_by_version
            new_version = invalidate_cache_by_version()
            print(f"[KB] Cache invalidated (version: {new_version})")
        except ImportError:
            pass
        
        print(f"[KB] Reloaded: {old_count} -> {len(final_items)} QA items from AWS (reload #{kb_reload_count})")
        
        # Update metrics
        try:
            from .metrics import kb_reloads_total, update_kb_metrics
            kb_reloads_total.labels(status='success').inc()
            update_kb_metrics(size=len(final_items), is_hit=None, is_query=False)
        except ImportError:
            pass
        
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
        # Update metrics for error
        try:
            from .metrics import kb_reloads_total
            kb_reloads_total.labels(status='error').inc()
        except ImportError:
            pass
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


def get_similarity_model() -> Optional["SentenceTransformer"]: # type: ignore
    """
    Lazy load sentence-transformers model for semantic similarity.
    Returns None if sentence-transformers is not available or semantic similarity is disabled.
    """
    global _similarity_model
    
    if not settings.KB_USE_SEMANTIC_SIMILARITY:
        return None
    
    if not _sentence_transformers_available:
        if kb_reload_count == 0:  # Only warn once at startup
            print("[KB][WARN] sentence-transformers not available. Install with: pip install sentence-transformers")
        return None
    
    if _similarity_model is None:
        try:
            model_name = settings.KB_SEMANTIC_MODEL
            print(f"[KB] Loading semantic similarity model: {model_name}")
            _similarity_model = SentenceTransformer(model_name)
            print(f"[KB] Semantic similarity model loaded successfully")
        except Exception as e:
            print(f"[KB][WARN] Failed to load semantic similarity model: {e}")
            return None
    
    return _similarity_model


def _get_embedding_cached(text: str, cache_generation: int):
    """
    Get embedding for text with caching.
    Returns None if model is not available.
    """
    model = get_similarity_model()
    if model is None or np is None:
        return None
    
    # Check cache first
    cache_key = text.lower().strip()
    with _embedding_cache_lock:
        if cache_key in _embedding_cache and _embedding_cache_generation == cache_generation:
            return _embedding_cache[cache_key]
    
    # Compute embedding
    try:
        embedding = model.encode([text], show_progress_bar=False)[0]
        
        # Store in cache
        with _embedding_cache_lock:
            # Only cache if generation matches (cache not invalidated)
            if _embedding_cache_generation == cache_generation:
                _embedding_cache[cache_key] = embedding
        
        return embedding
    except Exception as e:
        print(f"[KB][WARN] Failed to compute embedding: {e}")
        return None


def _clear_embedding_cache():
    """Clear embedding cache (called when KB reloads)."""
    global _embedding_cache_generation
    with _embedding_cache_lock:
        _embedding_cache.clear()
        _embedding_cache_generation += 1


def _calculate_keyword_score(q: str, kb_q: str) -> float:
    """
    Calculate keyword-based similarity score using SequenceMatcher and Jaccard.
    Returns a score between 0.0 and 1.0.
    """
    norm_q = normalize_text(q)
    norm_kb_q = normalize_text(kb_q)
    q_tokens = set(tokenize_keywords(q))
    kb_tokens = set(tokenize_keywords(kb_q))
    
    seq_score = SequenceMatcher(None, norm_q, norm_kb_q).ratio()
    jacc = _jaccard(q_tokens, kb_tokens)
    # Use maximum of both signals
    return max(seq_score, jacc)


def _calculate_semantic_score(q: str, kb_q: str, cache_generation: int) -> Optional[float]:
    """
    Calculate semantic similarity score using embeddings.
    Returns a score between 0.0 and 1.0, or None if semantic similarity is not available.
    Uses cosine similarity: cos(θ) = (A · B) / (||A|| * ||B||)
    """
    q_embedding = _get_embedding_cached(q, cache_generation)
    kb_embedding = _get_embedding_cached(kb_q, cache_generation)
    
    if q_embedding is None or kb_embedding is None or np is None:
        return None
    
    try:
        # Calculate cosine similarity manually: (A · B) / (||A|| * ||B||)
        dot_product = np.dot(q_embedding, kb_embedding)
        norm_q = np.linalg.norm(q_embedding)
        norm_kb = np.linalg.norm(kb_embedding)
        
        if norm_q == 0 or norm_kb == 0:
            return 0.0
        
        similarity = dot_product / (norm_q * norm_kb)
        # Cosine similarity returns values between -1 and 1, but embeddings usually give 0-1
        # Clamp to [0, 1] for safety
        return max(0.0, min(1.0, float(similarity)))
    except Exception as e:
        print(f"[KB][WARN] Failed to calculate semantic similarity: {e}")
        return None


def find_best_local_answer(q: str, threshold: float = None):
    """
    Find best matching answer from knowledge base using hybrid approach:
    - Keyword matching (SequenceMatcher + Jaccard)
    - Semantic similarity (optional, if enabled and available)
    
    Args:
        q: Query question
        threshold: Optional custom threshold (overrides settings)
        
    Returns:
        Best matching answer string, or None if no match found
    """
    # Configurable thresholds
    similarity_threshold = threshold if threshold is not None else settings.KB_SIMILARITY_THRESHOLD
    jaccard_threshold = settings.KB_JACCARD_THRESHOLD
    semantic_threshold = settings.KB_SEMANTIC_THRESHOLD
    
    global kb_queries, kb_hits
    kb_queries += 1
    
    # Get current cache generation to ensure cache consistency
    with _embedding_cache_lock:
        cache_generation = _embedding_cache_generation
    
    best_score = 0.0
    best_ans = None
    use_semantic = settings.KB_USE_SEMANTIC_SIMILARITY and get_similarity_model() is not None
    
    with kb_lock:
        for item in qa_knowledge_base:
            qkb_raw = item['q']
            a_raw = item['a']
            
            # Calculate keyword-based score
            keyword_score = _calculate_keyword_score(q, qkb_raw)
            
            # Calculate semantic score (if enabled)
            semantic_score = None
            if use_semantic:
                semantic_score = _calculate_semantic_score(q, qkb_raw, cache_generation)
            
            # Hybrid approach: combine keyword and semantic scores
            if use_semantic and semantic_score is not None:
                # Weighted combination
                keyword_weight = settings.KB_HYBRID_WEIGHT_KEYWORD
                semantic_weight = settings.KB_HYBRID_WEIGHT_SEMANTIC
                # Normalize weights to sum to 1.0
                total_weight = keyword_weight + semantic_weight
                if total_weight > 0:
                    keyword_weight = keyword_weight / total_weight
                    semantic_weight = semantic_weight / total_weight
                else:
                    keyword_weight = 0.5
                    semantic_weight = 0.5
                
                hybrid_score = (keyword_weight * keyword_score) + (semantic_weight * semantic_score)
                
                # Accept if hybrid score meets threshold OR either individual score meets its threshold
                if (hybrid_score >= similarity_threshold or 
                    keyword_score >= similarity_threshold or 
                    keyword_score >= jaccard_threshold or
                    (semantic_score is not None and semantic_score >= semantic_threshold)):
                    if hybrid_score > best_score:
                        best_score = hybrid_score
                        best_ans = a_raw
            else:
                # Fallback to keyword-only matching
                combined = keyword_score
                # Accept if either signal clears its threshold
                if (keyword_score >= similarity_threshold) or (keyword_score >= jaccard_threshold):
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
        kb_size_count = len(qa_knowledge_base)
        # Update metrics
        try:
            from .metrics import update_kb_metrics
            update_kb_metrics(size=kb_size_count, is_hit=None, is_query=False)
        except ImportError:
            pass
        
        # Check semantic similarity status
        semantic_enabled = settings.KB_USE_SEMANTIC_SIMILARITY
        semantic_available = _sentence_transformers_available
        semantic_model_loaded = _similarity_model is not None
        
        with _embedding_cache_lock:
            embedding_cache_size = len(_embedding_cache)
        
        return {
            'items_count': kb_size_count,
            'last_reload_time': kb_last_reload_time.strftime("%Y-%m-%d %H:%M:%S") if kb_last_reload_time else None,
            'reload_count': kb_reload_count,
            'auto_reload_enabled': settings.LEARNING_AUTO_RELOAD_ENABLED,
            'auto_reload_interval': settings.LEARNING_AUTO_RELOAD_INTERVAL,
            'aws_configured': bool(settings.boto3 and (settings.s3_client or settings.ddb_client)),
            'semantic_similarity': {
                'enabled': semantic_enabled,
                'available': semantic_available,
                'model_loaded': semantic_model_loaded,
                'model_name': settings.KB_SEMANTIC_MODEL if semantic_enabled else None,
                'embedding_cache_size': embedding_cache_size
            },
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