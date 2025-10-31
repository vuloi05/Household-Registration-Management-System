import json
import threading
from datetime import datetime, timedelta
from difflib import SequenceMatcher

from . import settings


qa_knowledge_base: list[dict] = []  # List[{"q": str, "a": str}]
kb_lock = threading.Lock()


def load_qa_knowledge_base() -> None:
    global qa_knowledge_base
    items: list[dict] = []
    try:
        # Prefer DynamoDB
        if settings.ddb_client and settings.AWS_DDB_TABLE:
            resp = settings.ddb_client.scan(TableName=settings.AWS_DDB_TABLE, Limit=360)
            for it in resp.get('Items', []):
                msg = it.get('message', {}).get('S', '').strip()
                ans = it.get('response', {}).get('S', '').strip()
                if msg and ans and len(msg) > 3 and len(ans) > 2:
                    items.append({'q': msg, 'a': ans})
        # Add from S3 if any
        if settings.s3_client and settings.AWS_S3_BUCKET:
            for offset in range(0, 2):
                date = datetime.now() if offset == 0 else datetime.now() - timedelta(days=1)
                key = f"{settings.LEARNING_S3_PREFIX}/{date.strftime('%Y/%m/%d')}.ndjson"
                try:
                    obj = settings.s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
                    body = obj['Body'].read().decode('utf-8')
                    lines = [ln for ln in body.strip().split('\n') if ln.strip()]
                    for ln in lines[-100:]:
                        try:
                            ev = json.loads(ln)
                        except Exception:
                            continue
                        msg = ev.get('message', '').strip()
                        ans = ev.get('response', '').strip()
                        if msg and ans and len(msg) > 3 and len(ans) > 2:
                            items.append({'q': msg, 'a': ans})
                except Exception:
                    continue
    except Exception as e:
        print(f"[WARN][KB-load] {e}")
    # Deduplicate (prefer later occurrences)
    dedup: dict[str, dict] = {}
    for it in reversed(items):
        k = it['q'].strip().lower()
        if len(k) > 3:
            dedup[k] = it
    with kb_lock:
        qa_knowledge_base = list(dedup.values())
    print(f"[KB] Loaded {len(qa_knowledge_base)} QA items from AWS")


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


# Background load at startup if AWS configured
if settings.boto3 and (settings.s3_client or settings.ddb_client):
    threading.Thread(target=load_qa_knowledge_base, daemon=True).start()


