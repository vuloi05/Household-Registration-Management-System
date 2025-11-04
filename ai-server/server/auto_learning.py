"""
Tự học chủ động - Tự động phân tích và học từ conversations
Không cần feedback từ người dùng, AI tự phân tích để cải thiện
"""

import json
import re
import threading
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from difflib import SequenceMatcher

from . import settings
from .kb import qa_knowledge_base, kb_lock, load_qa_knowledge_base
from .utils import normalize_text


# Tracking
auto_learning_enabled = False
auto_learning_thread: Optional[threading.Thread] = None
last_analysis_time: Optional[datetime] = None
auto_learned_count = 0  # Số Q&A đã tự động học được
last_processed_timestamp: Optional[str] = None


# Patterns để loại bỏ các Q&A không hữu ích
GENERIC_GREETING_PATTERNS = [
    r'^(xin chào|chào|chào bạn|hello|hi|hey)(\s|$|!|\.)',
    r'^(cảm ơn|thank you|thanks)(\s|$|!|\.)',
    r'^(tạm biệt|goodbye|bye)(\s|$|!|\.)',
]

GENERIC_HELP_PATTERNS = [
    r'^(giúp|help|hướng dẫn|huong dan)(\s|$)',
    r'^(bạn có thể|can you|có thể)(\s|$)',
]

GENERIC_RESPONSE_PATTERNS = [
    r'^tôi (là|có thể|sẽ)',
    r'^bạn có thể (hỏi|liên hệ|tìm)',
    r'^cảm ơn bạn đã',
    r'^(xin chào|chào)!.*trợ lý',
]


def calculate_qa_score(question: str, answer: str, source: str = '') -> float:
    """
    Tính điểm chất lượng cho một Q&A pair.
    Điểm từ 0.0 đến 1.0, càng cao càng tốt.
    
    Returns:
        float: Điểm từ 0.0 đến 1.0, hoặc -1 nếu nên loại bỏ
    """
    q = question.strip().lower()
    a = answer.strip()
    
    # Loại bỏ các câu quá ngắn
    if len(q) < 5 or len(a) < 10:
        return -1.0
    
    # Loại bỏ các câu chào hỏi chung chung
    for pattern in GENERIC_GREETING_PATTERNS:
        if re.match(pattern, q, re.IGNORECASE):
            return -1.0
    
    # Loại bỏ các câu hỏi help tổng quát (không cụ thể)
    for pattern in GENERIC_HELP_PATTERNS:
        if re.match(pattern, q, re.IGNORECASE):
            # Nếu câu hỏi quá ngắn sau pattern -> help tổng quát
            q_without_pattern = re.sub(pattern, '', q, flags=re.IGNORECASE).strip()
            if len(q_without_pattern.split()) <= 3:
                return -1.0
    
    # Loại bỏ các câu trả lời chung chung
    a_lower = a.lower()
    for pattern in GENERIC_RESPONSE_PATTERNS:
        if re.match(pattern, a_lower):
            # Nếu response quá ngắn sau pattern -> chung chung
            a_without_pattern = re.sub(pattern, '', a_lower, flags=re.IGNORECASE).strip()
            if len(a_without_pattern) < 50:  # Response quá ngắn
                return -1.0
    
    score = 0.0
    
    # 1. Độ dài answer (answer càng dài và chi tiết càng tốt, nhưng không quá dài)
    # Optimal: 50-500 ký tự
    if 50 <= len(a) <= 500:
        score += 0.3
    elif 30 <= len(a) < 50:
        score += 0.2
    elif 500 < len(a) <= 1000:
        score += 0.25  # Hơi dài nhưng vẫn OK
    elif len(a) > 1000:
        score += 0.15  # Quá dài, có thể là lỗi
    
    # 2. Câu hỏi có chứa từ khóa cụ thể (không phải chung chung)
    question_keywords = ['làm sao', 'như thế nào', 'cách', 'tại sao', 'khi nào', 'ở đâu',
                        'mã', 'id', 'tìm', 'xem', 'chi tiết', 'thông tin', 'hướng dẫn',
                        'là gì', 'có thể', 'bao nhiêu', 'ai', 'nào']
    has_specific_keyword = any(kw in q for kw in question_keywords)
    if has_specific_keyword:
        score += 0.2
    
    # 3. Answer chứa thông tin cụ thể (số, mã, tên, ...)
    has_numbers = bool(re.search(r'\d+', a))
    has_specific_terms = bool(re.search(r'(mã|id|số|tên|địa chỉ|email|phone)', a, re.IGNORECASE))
    if has_numbers or has_specific_terms:
        score += 0.15
    
    # 4. Answer không phải là câu trả lời lặp lại câu hỏi
    if len(set(q.split()) & set(a.lower().split())) / max(len(q.split()), 1) < 0.5:
        score += 0.15  # Answer có nội dung khác với question
    
    # 5. Answer có cấu trúc (có dấu chấm, xuống dòng, hoặc danh sách)
    has_structure = bool(re.search(r'[\.\!\?]|\\n|- |\d+\.', a))
    if has_structure:
        score += 0.1
    
    # 6. Ưu tiên các source đã được confirm
    source_lower = source.lower()
    if 'feedback' in source_lower or 'confirm' in source_lower or 'correct' in source_lower:
        score += 0.2
    elif 'corrected' in source_lower:
        score += 0.15
    
    # 7. Trừ điểm nếu quá giống với Q&A hiện có (duplicate)
    with kb_lock:
        for existing in qa_knowledge_base[:50]:  # Chỉ check 50 câu đầu
            q_sim = SequenceMatcher(None, q, existing['q'].strip().lower()).ratio()
            a_sim = SequenceMatcher(None, a.lower(), existing['a'].lower()).ratio()
            if q_sim > 0.9 and a_sim > 0.8:  # Quá giống
                return -1.0
            elif q_sim > 0.85:  # Hơi giống
                score -= 0.1
    
    return min(1.0, max(0.0, score))


def is_duplicate(question: str, answer: str, threshold: float = 0.85) -> bool:
    """Kiểm tra xem Q&A có trùng với knowledge base hiện có không."""
    q = normalize_text(question)
    a = normalize_text(answer)
    
    with kb_lock:
        for item in qa_knowledge_base:
            q_existing = normalize_text(item['q'])
            a_existing = normalize_text(item['a'])
            
            q_sim = SequenceMatcher(None, q, q_existing).ratio()
            a_sim = SequenceMatcher(None, a, a_existing).ratio()
            
            if q_sim >= threshold and a_sim >= threshold:
                return True
    
    return False


def analyze_and_learn_from_conversations() -> Dict:
    """
    Tự động phân tích conversations từ AWS và học các Q&A chất lượng cao.
    
    Returns:
        dict: {
            'success': bool,
            'analyzed_count': int,
            'learned_count': int,
            'total_score': float,
            'timestamp': str,
            'error': str (nếu có)
        }
    """
    global last_analysis_time, auto_learned_count, last_processed_timestamp
    
    analyzed_count = 0
    learned_count = 0
    total_score = 0.0
    new_items: List[Dict] = []
    
    try:
        if not settings.boto3 or (not settings.s3_client and not settings.ddb_client):
            return {
                'success': False,
                'analyzed_count': 0,
                'learned_count': 0,
                'total_score': 0.0,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'error': 'AWS not configured'
            }
        
        # Lấy conversations từ DynamoDB (chỉ lấy các conversations mới)
        conversations_to_analyze = []
        
        if settings.ddb_client and settings.AWS_DDB_TABLE:
            try:
                # Lấy conversations từ 24h qua (hoặc từ last_processed_timestamp)
                scan_kwargs = {
                    'TableName': settings.AWS_DDB_TABLE,
                    'Limit': 500  # Giới hạn để không quá tải
                }
                
                # Nếu có last_processed_timestamp, có thể filter (nhưng DynamoDB scan không support filter timestamp dễ dàng)
                # Nên lấy tất cả và filter trong code
                
                resp = settings.ddb_client.scan(**scan_kwargs)
                for it in resp.get('Items', []):
                    timestamp_str = it.get('timestamp', {}).get('S', '')
                    msg = it.get('message', {}).get('S', '').strip()
                    ans = it.get('response', {}).get('S', '').strip()
                    source = it.get('source', {}).get('S', '').strip()
                    
                    if msg and ans:
                        # Chỉ phân tích các conversations không phải từ feedback hoặc auto-learned (để tránh duplicate)
                        # Các conversations từ feedback đã được xử lý rồi
                        source_lower = source.lower()
                        if ('feedback' not in source_lower and 
                            'corrected' not in source_lower and
                            'auto-learned' not in source_lower):
                            conversations_to_analyze.append({
                                'message': msg,
                                'response': ans,
                                'source': source,
                                'timestamp': timestamp_str
                            })
            except Exception as e:
                print(f"[WARN][Auto-learning][DDB] {e}")
        
        # Lấy conversations từ S3 (toàn bộ file để học đầy đủ)
        if settings.s3_client and settings.AWS_S3_BUCKET:
            try:
                prefix = f"{settings.LEARNING_S3_PREFIX}/"
                paginator = settings.s3_client.get_paginator('list_objects_v2')
                pages = paginator.paginate(Bucket=settings.AWS_S3_BUCKET, Prefix=prefix)
                for page in pages:
                    for obj in page.get('Contents', []):
                        key = obj.get('Key', '')
                        if not key.endswith('.ndjson'):
                            continue
                        try:
                            s3_obj = settings.s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
                            body = s3_obj['Body'].read().decode('utf-8')
                            lines = [ln for ln in body.strip().split('\n') if ln.strip()]
                            for ln in lines:
                                try:
                                    ev = json.loads(ln)
                                    msg = ev.get('message', '').strip()
                                    ans = ev.get('response', '').strip()
                                    source = ev.get('source', '').strip()
                                    if msg and ans:
                                        source_lower = (source or '').lower()
                                        if ('feedback' not in source_lower and 
                                            'corrected' not in source_lower and
                                            'auto-learned' not in source_lower):
                                            conversations_to_analyze.append({
                                                'message': msg,
                                                'response': ans,
                                                'source': source,
                                                'timestamp': ev.get('timestamp', '')
                                            })
                                except Exception:
                                    continue
                        except Exception:
                            continue
            except Exception:
                pass
        
        # Phân tích và scoring
        scored_items = []
        for conv in conversations_to_analyze:
            analyzed_count += 1
            score = calculate_qa_score(conv['message'], conv['response'], conv.get('source', ''))
            
            if score > 0 and score >= settings.LEARNING_MIN_SCORE_THRESHOLD:
                # Kiểm tra duplicate
                if not is_duplicate(conv['message'], conv['response']):
                    scored_items.append({
                        'q': conv['message'],
                        'a': conv['response'],
                        'score': score,
                        'source': f"auto-learned/{conv.get('source', 'local-ai-server')}"
                    })
                    total_score += score
        
        # Sắp xếp theo score và lấy top items
        scored_items.sort(key=lambda x: x['score'], reverse=True)
        top_items = scored_items[:settings.LEARNING_MAX_AUTO_LEARN_ITEMS]
        
        # Thêm vào knowledge base
        if top_items:
            with kb_lock:
                existing_questions = {item['q'].strip().lower() for item in qa_knowledge_base}
                for item in top_items:
                    q_key = item['q'].strip().lower()
                    if q_key not in existing_questions:
                        qa_knowledge_base.append({'q': item['q'], 'a': item['a']})
                        learned_count += 1
                        existing_questions.add(q_key)
        
        auto_learned_count += learned_count
        last_analysis_time = datetime.now()
        last_processed_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        print(f"[Auto-learning] Analyzed {analyzed_count} conversations, learned {learned_count} new Q&A (avg score: {total_score/max(learned_count, 1):.2f})")
        
        return {
            'success': True,
            'analyzed_count': analyzed_count,
            'learned_count': learned_count,
            'total_score': total_score,
            'timestamp': last_analysis_time.strftime("%Y-%m-%d %H:%M:%S"),
            'error': None
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"[WARN][Auto-learning] Error: {error_msg}")
        return {
            'success': False,
            'analyzed_count': analyzed_count,
            'learned_count': learned_count,
            'total_score': total_score,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'error': error_msg
        }


def start_auto_learning_background_thread():
    """Khởi động background thread để tự động phân tích và học định kỳ."""
    global auto_learning_thread, auto_learning_enabled
    
    if not settings.LEARNING_AUTO_LEARN_ENABLED:
        print("[Auto-learning] Auto-learning disabled in settings")
        return
    
    if not settings.boto3 or (not settings.s3_client and not settings.ddb_client):
        print("[Auto-learning] AWS not configured, skipping auto-learning")
        return
    
    interval = settings.LEARNING_AUTO_LEARN_INTERVAL
    if interval <= 0:
        print("[Auto-learning] Auto-learn interval is 0, skipping auto-learning")
        return
    
    def auto_learn_worker():
        """Worker thread để tự động học định kỳ."""
        global auto_learning_enabled
        auto_learning_enabled = True
        print(f"[Auto-learning] Auto-learn thread started, interval: {interval} seconds")
        
        # Đợi một chút khi startup để đảm bảo các services đã sẵn sàng
        time.sleep(30)
        
        while auto_learning_enabled:
            try:
                if settings.LEARNING_AUTO_LEARN_ENABLED and interval > 0:
                    result = analyze_and_learn_from_conversations()
                    if result['success']:
                        print(f"[Auto-learning][Success] Analyzed {result['analyzed_count']}, learned {result['learned_count']} Q&A at {result['timestamp']}")
                    else:
                        print(f"[Auto-learning][Failed] {result.get('error', 'Unknown error')}")
                
                time.sleep(interval)
            except Exception as e:
                print(f"[WARN][Auto-learning] Error in worker thread: {e}")
                time.sleep(60)  # Đợi 1 phút trước khi retry
    
    auto_learning_thread = threading.Thread(target=auto_learn_worker, daemon=True, name="AutoLearning")
    auto_learning_thread.start()
    print(f"[Auto-learning] Auto-learning background thread started")


def stop_auto_learning():
    """Dừng auto-learning thread."""
    global auto_learning_enabled
    auto_learning_enabled = False


def get_auto_learning_status() -> Dict:
    """Lấy thông tin trạng thái auto-learning."""
    return {
        'enabled': settings.LEARNING_AUTO_LEARN_ENABLED and auto_learning_enabled,
        'interval': settings.LEARNING_AUTO_LEARN_INTERVAL,
        'min_score_threshold': settings.LEARNING_MIN_SCORE_THRESHOLD,
        'max_learn_items_per_run': settings.LEARNING_MAX_AUTO_LEARN_ITEMS,
        'last_analysis_time': last_analysis_time.strftime("%Y-%m-%d %H:%M:%S") if last_analysis_time else None,
        'total_learned_count': auto_learned_count,
        'last_processed_timestamp': last_processed_timestamp,
        'aws_configured': bool(settings.boto3 and (settings.s3_client or settings.ddb_client))
    }

