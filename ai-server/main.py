"""
AI Agent Server - Household Registration Management System
Backend server để xử lý các yêu cầu AI chatbot
"""

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
import requests
import re
import threading
import time
from difflib import SequenceMatcher

# Optional AWS SDK
try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except Exception:  # boto3 optional for local-only mode
    boto3 = None

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configuration
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# AWS Config (optional)
AWS_REGION = os.getenv('AWS_REGION')
AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET')  # where raw chat logs are stored
AWS_DDB_TABLE = os.getenv('AWS_DDB_TABLE')  # DynamoDB table for structured conversations

# Bedrock & Learning Config (optional)
LEARNING_FROM_AWS = os.getenv('LEARNING_FROM_AWS', 'false').lower() == 'true'
LEARNING_MAX_ITEMS = int(os.getenv('LEARNING_MAX_ITEMS', '16'))
LEARNING_S3_PREFIX = os.getenv('LEARNING_S3_PREFIX', 'chat-logs')

# Google Gemini Config (optional)
GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')
# GOOGLE_GEMINI_API_URL cập nhật sang model mới nhất Google khuyến nghị
GOOGLE_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# Initialize AWS clients if configured
s3_client = None
ddb_client = None
if boto3 and AWS_REGION and (AWS_S3_BUCKET or AWS_DDB_TABLE):
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION)
    except Exception:
        s3_client = None
    try:
        ddb_client = boto3.client('dynamodb', region_name=AWS_REGION)
    except Exception:
        ddb_client = None

# === Q&A Knowledge Base ===
qa_knowledge_base = [] # List[{'q': str, 'a': str}]

# Load KB từ log AWS về - dùng lúc khởi động hoặc có thể tự động chạy lặp lại
kb_lock = threading.Lock()
def load_qa_knowledge_base():
    global qa_knowledge_base
    items = []
    try:
        # Ưu tiên DynamoDB
        if ddb_client and AWS_DDB_TABLE:
            resp = ddb_client.scan(TableName=AWS_DDB_TABLE, Limit=360)
            for it in resp.get('Items', []):
                msg = it.get('message', {}).get('S', '')
                ans = it.get('response', {}).get('S', '')
                msg = msg.strip()
                ans = ans.strip()
                if msg and ans and len(msg) > 3 and len(ans) > 2:
                    items.append({'q': msg, 'a': ans})
        # Thêm từ S3 nếu có
        if s3_client and AWS_S3_BUCKET:
            # Lấy 2 ngày gần nhất làm demo, có thể mở rộng ra nhiều ngày
            for offset in range(0, 2):
                date = datetime.now() if offset == 0 else datetime.now() - timedelta(days=1)
                key = f"{LEARNING_S3_PREFIX}/{date.strftime('%Y/%m/%d')}.ndjson"
                try:
                    obj = s3_client.get_object(Bucket=AWS_S3_BUCKET, Key=key)
                    body = obj['Body'].read().decode('utf-8')
                    lines = [ln for ln in body.strip().split('\n') if ln.strip()]
                    for ln in lines[-100:]:
                        try:
                            ev = json.loads(ln)
                        except Exception:
                            continue
                        msg = ev.get('message', '').strip()
                        ans = ev.get('response', '').strip()
                        if msg and ans and len(msg)>3 and len(ans)>2:
                            items.append({'q': msg, 'a': ans})
                except Exception:
                    continue
    except Exception as e:
        print(f"[WARN][KB-load] {e}")
    # Loại bỏ trùng (ưu tiên xuất hiện cuối), remove blank
    dedup = {}
    for it in reversed(items):
        k = it['q'].strip().lower()
        if len(k)>3: dedup[k] = it
    with kb_lock:
        qa_knowledge_base = list(dedup.values())
    print(f"[KB] Loaded {len(qa_knowledge_base)} QA items from AWS")

# Tải KB khi khởi động
if boto3 and (s3_client or ddb_client):
    threading.Thread(target=load_qa_knowledge_base, daemon=True).start()

# Hàm tra cứu KB nội bộ bằng matching
# (cho production có thể dùng embedding/vector search)
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

# Helper: gọi Gemini API trực tiếp (bỏ qua KB, rule)
def call_gemini(message: str, context: str = "") -> str:
    if not GOOGLE_GEMINI_API_KEY:
        return ""
    try:
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": (context + "\n" if context else "") + message}]}
            ],
        }
        url = f"{GOOGLE_GEMINI_API_URL}?key={GOOGLE_GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        if response.ok:
            result = response.json()
            candidates = result.get('candidates', [])
            if candidates:
                content = candidates[0].get('content', {})
                parts = content.get('parts', [])
                if parts and 'text' in parts[0]:
                    text = parts[0]['text']
                    return text.strip()
            return json.dumps(result, ensure_ascii=False)
        else:
            if response.status_code == 503:
                return "Dịch vụ AI của Google hiện đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau ít phút!"
            return f"Gemini API request failed: {response.status_code} {response.text}"
    except Exception as e:
        return f"Gemini API call error: {str(e)}"


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AI Agent Server"
    })


@app.route('/health/aws', methods=['GET'])
def health_aws():
    """AWS configuration health: indicates whether AWS logging is active."""
    return jsonify({
        "boto3_available": bool(boto3),
        "aws_region": AWS_REGION or "",
        "s3_bucket": AWS_S3_BUCKET or "",
        "ddb_table": AWS_DDB_TABLE or "",
        "s3_enabled": bool(s3_client and AWS_S3_BUCKET),
        "ddb_enabled": bool(ddb_client and AWS_DDB_TABLE)
    })


@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint để xử lý tin nhắn từ chatbot (hỗ trợ streaming nếu cần).
    POST /chat
    Body: {"message": "user message", "context": "optional context"}
    Query param: stream=true để enable streaming (mặc định stream=false)
    """
    stream_mode = str(request.args.get('stream', 'false')).lower() == 'true'
    try:
        data = request.json
        user_message = data.get('message', '')
        context = data.get('context', '')
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # --- TRA CỨU Q&A LOCAL TRƯỚC (ưu tiên) ---
        kb_ans = find_best_local_answer(user_message)
        if kb_ans:
            persist_chat_event({
                "timestamp": get_timestamp(),
                "message": user_message,
                "response": kb_ans,
                "context": context,
                "source": "local-ai-server",
            })
            return jsonify({
                "success": True,
                "response": kb_ans,
                "actions": infer_actions(user_message),
                "timestamp": get_timestamp()
            })

        # Xử lý luật trả lời ngắn (không cần stream)
        response = process_message(user_message, context)
        actions = infer_actions(user_message)

        # Nếu không phải gọi Gemini API hoặc câu trả lời rất ngắn (rule), trả về như cũ
        if not stream_mode or len(response) < 200 or ('GOOGLE_GEMINI_API_KEY' not in os.environ):
            persist_chat_event({
                "timestamp": get_timestamp(),
                "message": user_message,
                "response": response,
                "context": context,
                "source": "local-ai-server",
            })
            return jsonify({
                "success": True,
                "response": response,
                "actions": actions,
                "timestamp": get_timestamp()
            })

        # Nếu là trả lời rất dài (từ AI), phải stream từng chunk
        def generate_streamed_response(full_response: str):
            import time
            # Cắt thành từng dòng hoặc đoạn ngắn (có thể chia nhỏ ký tự nếu muốn mượt)
            chunk_len = 24  # Số ký tự mỗi chunk
            for i in range(0, len(full_response), chunk_len):
                chunk = full_response[i:i+chunk_len]
                yield f"data: {chunk}\n\n"
                time.sleep(0.04)  # delay nhẹ như typing effect
            # Thông báo kết thúc, trả cả actions nếu có
            yield f"data: [END] \n\n"
            if actions:
                yield f"agent_actions: {json.dumps(actions, ensure_ascii=False)}\n\n"

        persist_chat_event({
            "timestamp": get_timestamp(),
            "message": user_message,
            "response": response,
            "context": context,
            "source": "local-ai-server",
        })
        return Response(stream_with_context(generate_streamed_response(response)), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def process_message(message: str, context: str = "", bypass_kb: bool = False) -> str:
    message_lower = message.lower().strip()
    message_clean = re.sub(r"[!?.]", "", message_lower)

    # --- TRA CỨU Q&A LOCAL TRƯỚC (ưu tiên) ---
    if not bypass_kb:
        kb_ans = find_best_local_answer(message)
        if kb_ans:
            return kb_ans

    # Chào hỏi và các rule ngắn
    if re.fullmatch(r"(xin chào|chào|chào bạn|hello|hi)", message_clean):
        return "Xin chào! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Tôi có thể giúp bạn tìm hiểu về các tính năng của hệ thống."
    elif any(w in message_clean for w in ['hộ khẩu', 'ho khau', 'household']):
        return '''Để quản lý hộ khẩu, bạn có thể:
        
        1. **Xem danh sách hộ khẩu**: Vào trang "Quản lý Hộ khẩu" để xem tất cả hộ khẩu
        2. **Tạo hộ khẩu mới**: Click nút "Thêm hộ khẩu" và điền thông tin
        3. **Chỉnh sửa hộ khẩu**: Click icon "Sửa" trên từng hộ khẩu
        4. **Xem chi tiết**: Click vào mã hộ khẩu để xem thông tin chi tiết
        
        Mỗi hộ khẩu bao gồm: Mã hộ khẩu, Địa chỉ, Chủ hộ và các thành viên trong hộ.'''
    elif any(w in message_clean for w in ['nhân khẩu', 'nhan khau', 'person', 'thành viên']):
        return '''Để quản lý nhân khẩu:
        
        1. **Xem danh sách**: Vào "Quản lý Nhân khẩu" để xem tất cả nhân khẩu
        2. **Thêm nhân khẩu**: Có thể thêm từ trang "Nhân khẩu" hoặc từ chi tiết hộ khẩu
        3. **Tìm kiếm**: Sử dụng thanh tìm kiếm theo tên, CCCD, nghề nghiệp
        4. **Lọc**: Lọc theo độ tuổi, giới tính, địa chỉ
        5. **Xuất dữ liệu**: Export Excel hoặc PDF
        
        Mỗi nhân khẩu cần thông tin: Họ tên, Ngày sinh, CCCD, Quê quán, Nghề nghiệp.'''
    elif any(w in message_clean for w in ['thu phí', 'khoản thu', 'khoan thu', 'payment', 'fee']):
        return '''Quản lý thu phí bao gồm:
        
        1. **Khoản thu bắt buộc**: Phí vệ sinh, phí an ninh,...
        2. **Khoản thu đóng góp**: Ủng hộ, từ thiện,...
        
        Các chức năng:
        - Tạo khoản thu mới
        - Xem chi tiết khoản thu và danh sách đã nộp
        - Xem thống kê: Số hộ đã nộp, Tổng số tiền
        - Ghi nhận nộp tiền cho hộ khẩu'''
    elif any(w in message_clean for w in ['thống kê', 'thong ke', 'dashboard', 'statistics']):
        return '''Bảng thống kê cung cấp:
        
        1. **Tổng quan**: Số hộ khẩu, số nhân khẩu
        2. **Phân bố độ tuổi**: Mầm non, Tiểu học, THCS, THPT, Lao động, Nghỉ hưu
        3. **Biểu đồ**: Visualize dữ liệu độ tuổi
        
        Vào trang "Dashboard" để xem tất cả thống kê.'''
    elif any(w in message_clean for w in ['đăng nhập', 'dang nhap', 'login']):
        return '''Để đăng nhập hệ thống:
        
        1. Nhập Username (ví dụ: admin, ketoan)
        2. Nhập Password (mật khẩu đã được cấp)
        3. Click "Đăng nhập"
        
        Có 2 loại tài khoản:
        - **ADMIN**: Toàn quyền quản lý
        - **ACCOUNTANT**: Quản lý khoản thu và thu phí'''
    elif any(w in message_clean for w in ['giúp', 'help', 'hướng dẫn', 'huong dan']):
        return '''Tôi có thể giúp bạn với:
        
        - Quản lý Hộ khẩu
        - Quản lý Nhân khẩu
        - Thu phí và Khoản thu
        - Xem Thống kê
        - Hướng dẫn Đăng nhập
        
        Hãy hỏi tôi về bất kỳ chức năng nào!'''

    # Nếu không khớp luật nào - gọi Gemini
    if GOOGLE_GEMINI_API_KEY:
        text = call_gemini(message, context)
        if text:
            return text
    return f"Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Bạn có thể hỏi tôi về bất kỳ tính năng nào của hệ thống."


def infer_actions(message: str) -> list[dict]:
    """Suy luận các hành động UI (agent actions) từ câu tiếng Việt của người dùng.
    Kết quả trả về là danh sách action để frontend thực thi.

    Action format gợi ý:
    - {"type": "navigate", "target": "household_list"}
    - {"type": "navigate", "target": "household_detail", "params": {"householdId": "HK123"}}
    - {"type": "navigate", "target": "person_list"}
    - {"type": "navigate", "target": "person_detail", "params": {"personId": "012345678901"}}
    - {"type": "search", "target": "person_list", "params": {"q": "Nguyen Van A"}}
    """
    text = (message or "").strip()
    lower = text.lower()

    actions: list[dict] = []

    # Heuristic entity extraction
    household_id = extract_household_id(text)
    person_id = extract_person_id(text)
    name_query = extract_name_query(text)

    # Điều hướng hộ khẩu
    if any(k in lower for k in ["hộ khẩu", "ho khau", "household"]):
        if any(k in lower for k in ["danh sách", "danh sach", "list"]):
            actions.append({"type": "navigate", "target": "household_list"})
        elif any(k in lower for k in ["chi tiết", "chi tiet", "detail", "mở", "mo", "xem"]):
            if household_id:
                actions.append({
                    "type": "navigate",
                    "target": "household_detail",
                    "params": {"householdId": household_id}
                })
            else:
                # Nếu không có mã, mở danh sách để người dùng chọn
                actions.append({"type": "navigate", "target": "household_list"})
        else:
            actions.append({"type": "navigate", "target": "household_list"})

    # Điều hướng nhân khẩu
    if any(k in lower for k in ["nhân khẩu", "nhan khau", "person", "thành viên", "thanh vien"]):
        if any(k in lower for k in ["danh sách", "danh sach", "list"]):
            actions.append({"type": "navigate", "target": "person_list"})
            if name_query:
                actions.append({
                    "type": "search",
                    "target": "person_list",
                    "params": {"q": name_query}
                })
        elif any(k in lower for k in ["chi tiết", "chi tiet", "detail", "xem", "mở", "mo"]):
            if person_id:
                actions.append({
                    "type": "navigate",
                    "target": "person_detail",
                    "params": {"personId": person_id}
                })
            elif name_query:
                actions.append({"type": "navigate", "target": "person_list"})
                actions.append({
                    "type": "search",
                    "target": "person_list",
                    "params": {"q": name_query}
                })
            else:
                actions.append({"type": "navigate", "target": "person_list"})

    # Thu phí / khoản thu
    if any(k in lower for k in ["thu phí", "thu phi", "khoản thu", "khoan thu", "fees", "fee", "payment"]):
        actions.append({"type": "navigate", "target": "fees"})

    # Dashboard thống kê
    if any(k in lower for k in ["thống kê", "thong ke", "dashboard", "statistics"]):
        actions.append({"type": "navigate", "target": "dashboard"})

    # Đăng nhập
    if any(k in lower for k in ["đăng nhập", "dang nhap", "login"]):
        actions.append({"type": "navigate", "target": "login"})

    # Tìm kiếm chung theo từ khóa nếu có chỉ thị 'tìm', 'search'
    if any(k in lower for k in ["tìm", "tim", "search"]):
        if any(k in lower for k in ["nhân khẩu", "nhan khau", "person", "thành viên", "thanh vien"]):
            if name_query or person_id:
                actions.append({
                    "type": "navigate",
                    "target": "person_list"
                })
                actions.append({
                    "type": "search",
                    "target": "person_list",
                    "params": {"q": person_id or name_query}
                })
        elif any(k in lower for k in ["hộ khẩu", "ho khau", "household"]):
            if household_id or name_query:
                actions.append({"type": "navigate", "target": "household_list"})
                actions.append({
                    "type": "search",
                    "target": "household_list",
                    "params": {"q": household_id or name_query}
                })

    # Loại bỏ trùng lặp đơn giản theo tuple hóa
    unique = []
    seen = set()
    for act in actions:
        key = (act.get("type"), act.get("target"), json.dumps(act.get("params", {}), sort_keys=True, ensure_ascii=False))
        if key not in seen:
            unique.append(act)
            seen.add(key)
    return unique


def extract_household_id(text: str) -> str | None:
    """Trích mã hộ khẩu kiểu thường gặp: HK123, HK-00123, hoặc số sau 'mã hộ khẩu'."""
    m = re.search(r"\b(HK[-_ ]?\d{2,})\b", text, flags=re.IGNORECASE)
    if m:
        return m.group(1).replace(" ", "").upper()
    m2 = re.search(r"mã\s*hộ\s*khẩu\s*[:#]?\s*([A-Z]{1,3}[-_]?\d{2,})", text, flags=re.IGNORECASE)
    if m2:
        return m2.group(1).replace(" ", "").upper()
    return None


def extract_person_id(text: str) -> str | None:
    """Trích CCCD/CMND: 9-12 chữ số; ưu tiên cụm theo sau 'CCCD' hoặc 'CMND'."""
    m = re.search(r"\b(?:CCCD|CMND)\s*[:#]?\s*(\d{9,12})\b", text, flags=re.IGNORECASE)
    if m:
        return m.group(1)
    m2 = re.search(r"\b(\d{12})\b", text)  # CCCD 12 số
    if m2:
        return m2.group(1)
    return None


def extract_name_query(text: str) -> str | None:
    """Thử trích tên người đơn giản: sau từ khóa 'tên', 'name' hoặc nội dung trong dấu ngoặc kép."""
    m = re.search(r"(?:tên|ten|name)\s*[:#]?\s*\"([^\"]+)\"", text, flags=re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m2 = re.search(r"\"([^\"]+)\"", text)
    if m2:
        return m2.group(1).strip()
    # fallback: từ sau 'tìm' cho đến hết câu (rất heuristic)
    m3 = re.search(r"(?:tìm|tim|search)\s+(.+)$", text, flags=re.IGNORECASE)
    if m3:
        return m3.group(1).strip()
    return None


@app.route('/agent/plan', methods=['POST'])
def agent_plan():
    """Endpoint chỉ trả về danh sách actions (không trả lời văn bản)."""
    try:
        data = request.json or {}
        user_message = data.get('message', '')
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        actions = infer_actions(user_message)
        return jsonify({
            "success": True,
            "actions": actions,
            "timestamp": get_timestamp()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def fetch_recent_context_from_aws(max_items: int = 16) -> str:
    """Lấy một số đoạn hội thoại gần nhất từ DynamoDB hoặc S3 làm ngữ cảnh.
    Trả về một chuỗi văn bản ngắn gọn.
    """
    snippets: list[str] = []

    # Ưu tiên DynamoDB nếu có
    try:
        if ddb_client and AWS_DDB_TABLE:
            # thử truy vấn theo pk của hôm nay, nếu thiếu thì lùi 1 ngày
            for days_back in range(0, 2):
                pk = f"chat#{datetime.now().strftime('%Y%m%d')}" if days_back == 0 else \
                     f"chat#{(datetime.now()).strftime('%Y%m%d')}"
                resp = ddb_client.query(
                    TableName=AWS_DDB_TABLE,
                    KeyConditionExpression='pk = :pk',
                    ExpressionAttributeValues={':pk': {'S': pk}},
                    ScanIndexForward=False,
                    Limit=max_items,
                )
                items = resp.get('Items', [])
                for it in items:
                    msg = it.get('message', {}).get('S', '')
                    ans = it.get('response', {}).get('S', '')
                    if msg and ans:
                        snippets.append(f"Hỏi: {msg}\nĐáp: {ans}")
                if snippets:
                    break
    except Exception:
        pass

    # Nếu chưa có hoặc không cấu hình DDB, thử S3 (lấy log của hôm nay)
    try:
        if not snippets and s3_client and AWS_S3_BUCKET:
            key = f"{LEARNING_S3_PREFIX}/{datetime.now().strftime('%Y/%m/%d')}.ndjson"
            obj = s3_client.get_object(Bucket=AWS_S3_BUCKET, Key=key)
            body = obj['Body'].read().decode('utf-8')
            lines = [ln for ln in body.strip().split('\n') if ln.strip()][-max_items:]
            for ln in lines:
                try:
                    ev = json.loads(ln)
                except Exception:
                    continue
                msg = ev.get('message', '')
                ans = ev.get('response', '')
                if msg and ans:
                    snippets.append(f"Hỏi: {msg}\nĐáp: {ans}")
    except Exception:
        pass

    if not snippets:
        return ""
    # giới hạn chiều dài để tránh vượt token
    joined = "\n\n".join(snippets[:max_items])
    return joined[:4000]


def get_timestamp():
    """Get current timestamp"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def persist_chat_event(event: dict) -> None:
    """Persist a chat event to AWS S3 (raw ndjson) and DynamoDB (structured) if configured.
    Safe no-op when AWS is not configured.
    """
    # S3: append-style by day (object per day). We'll upload as PutObject with newline JSON content (append emulation via get+put is omitted for simplicity).
    try:
        if s3_client and AWS_S3_BUCKET:
            key = f"chat-logs/{datetime.now().strftime('%Y/%m/%d')}.ndjson"
            line = json.dumps(event, ensure_ascii=False) + "\n"
            # Try to get existing object then append; if not exists, create
            try:
                existing = s3_client.get_object(Bucket=AWS_S3_BUCKET, Key=key)
                body = existing['Body'].read().decode('utf-8') + line
            except s3_client.exceptions.NoSuchKey:  # type: ignore[attr-defined]
                body = line
            except Exception:
                body = line
            s3_client.put_object(Bucket=AWS_S3_BUCKET, Key=key, Body=body.encode('utf-8'), ContentType='application/x-ndjson')
    except (BotoCoreError, ClientError, Exception):
        pass

    # DynamoDB: write one item per message
    try:
        if ddb_client and AWS_DDB_TABLE:
            ddb_client.put_item(
                TableName=AWS_DDB_TABLE,
                Item={
                    'pk': {'S': f"chat#{datetime.now().strftime('%Y%m%d')}"},
                    'sk': {'S': f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}"},
                    'timestamp': {'S': event.get('timestamp', '')},
                    'message': {'S': event.get('message', '')[:2000]},
                    'response': {'S': event.get('response', '')[:2000]},
                    'context': {'S': event.get('context', '')[:1000]},
                    'source': {'S': event.get('source', 'local-ai-server')},
                }
            )
    except (BotoCoreError, ClientError, Exception):
        pass


@app.route('/qa-feedback', methods=['POST'])
def qa_feedback():
    global qa_knowledge_base
    """Nhận feedback/sửa đáp án từ người dùng: {question, answer, feedback_type, context?} -> cập nhật KB nội bộ & log AWS. Nếu 'wrong' thì xoá khỏi KB và gọi Gemini để lấy đáp án mới, trả về new_answer."""
    try:
        data = request.json or {}
        question = (data.get('question') or '').strip()
        answer = (data.get('answer') or '').strip()
        feedback_type = (data.get('feedback_type') or 'confirm').strip()  # confirm, correct, wrong
        context = (data.get('context') or '').strip()
        if not question:
            return jsonify({"error": "question is required"}), 400

        new_answer = None

        if feedback_type == 'wrong':
            # 1) Xoá khỏi KB local
            with kb_lock:
                qa_knowledge_base = [it for it in qa_knowledge_base if it['q'].strip().lower() != question.strip().lower()]
            # 2) Gọi Gemini để lấy đáp án mới
            generated = call_gemini(question, context)
            if generated:
                new_answer = generated
                # 3) Cập nhật KB local bằng câu trả lời mới
                with kb_lock:
                    qa_knowledge_base.append({'q': question, 'a': new_answer})
                # 4) Log lại lên AWS
                persist_chat_event({
                    'timestamp': get_timestamp(),
                    'message': question,
                    'response': new_answer,
                    'context': context,
                    'source': 'auto-corrected',
                })
        elif feedback_type in ('confirm', 'correct'):
            if not answer:
                return jsonify({"error": "answer is required for confirm/correct"}), 400
            new_item = {'q': question, 'a': answer}
            with kb_lock:
                found = False
                for idx, it in enumerate(qa_knowledge_base):
                    if it['q'].strip().lower() == question.strip().lower():
                        qa_knowledge_base[idx] = new_item
                        found = True
                        break
                if not found:
                    qa_knowledge_base.append(new_item)
            persist_chat_event({
                'timestamp': get_timestamp(),
                'message': question,
                'response': answer,
                'context': context,
                'source': f'user-feedback/{feedback_type}',
            })
        else:
            return jsonify({"error": "invalid feedback_type"}), 400

        print(f"[KB][feedback] {feedback_type} - {question[:30]} => {(new_answer or answer)[:40] if (new_answer or answer) else ''}")
        return jsonify({"success": True, "new_answer": new_answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Avoid non-ASCII characters in Windows consoles that may not support UTF-8
    print(f"Starting AI Agent Server on port {PORT}")
    print(f"Debug mode: {DEBUG}")
    # Print concise AWS summary so operators can verify quickly
    print(
        "AWS config => boto3:%s region:%s s3:%s ddb:%s | enabled s3:%s ddb:%s | bedrock:%s model:%s"
        % (
            bool(boto3),
            AWS_REGION or "",
            AWS_S3_BUCKET or "",
            AWS_DDB_TABLE or "",
            bool(s3_client and AWS_S3_BUCKET),
            bool(ddb_client and AWS_DDB_TABLE),
            False, # Removed Bedrock related print
            "", # Removed Bedrock related print
        )
    )
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

