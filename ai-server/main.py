"""
AI Agent Server - Household Registration Management System
Backend server để xử lý các yêu cầu AI chatbot
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import requests
import re

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
    Chat endpoint để xử lý tin nhắn từ chatbot
    POST /chat
    Body: {"message": "user message", "context": "optional context"}
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        context = data.get('context', '')
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Process the message with AI
        response = process_message(user_message, context)

        # Persist conversation to AWS (optional)
        persist_chat_event(
            {
                "timestamp": get_timestamp(),
                "message": user_message,
                "response": response,
                "context": context,
                "source": "local-ai-server",
            }
        )
        
        return jsonify({
            "success": True,
            "response": response,
            "timestamp": get_timestamp()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def process_message(message: str, context: str = "") -> str:
    message_lower = message.lower().strip()
    message_clean = re.sub(r"[!?.]", "", message_lower)

    # Chào hỏi: chỉ regex các cụm cực kỳ phổ biến, bắt đầu hoặc nguyên câu
    if re.fullmatch(r"(xin chào|chào|chào bạn|hello|hi)", message_clean):
        return "Xin chào! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Tôi có thể giúp bạn tìm hiểu về các tính năng của hệ thống."
    # Trợ giúp về hộ khẩu
    elif any(w in message_clean for w in ['hộ khẩu', 'ho khau', 'household']):
        return '''Để quản lý hộ khẩu, bạn có thể:
        
        1. **Xem danh sách hộ khẩu**: Vào trang "Quản lý Hộ khẩu" để xem tất cả hộ khẩu
        2. **Tạo hộ khẩu mới**: Click nút "Thêm hộ khẩu" và điền thông tin
        3. **Chỉnh sửa hộ khẩu**: Click icon "Sửa" trên từng hộ khẩu
        4. **Xem chi tiết**: Click vào mã hộ khẩu để xem thông tin chi tiết
        
        Mỗi hộ khẩu bao gồm: Mã hộ khẩu, Địa chỉ, Chủ hộ và các thành viên trong hộ.'''
    # Trợ giúp về nhân khẩu
    elif any(w in message_clean for w in ['nhân khẩu', 'nhan khau', 'person', 'thành viên']):
        return '''Để quản lý nhân khẩu:
        
        1. **Xem danh sách**: Vào "Quản lý Nhân khẩu" để xem tất cả nhân khẩu
        2. **Thêm nhân khẩu**: Có thể thêm từ trang "Nhân khẩu" hoặc từ chi tiết hộ khẩu
        3. **Tìm kiếm**: Sử dụng thanh tìm kiếm theo tên, CCCD, nghề nghiệp
        4. **Lọc**: Lọc theo độ tuổi, giới tính, địa chỉ
        5. **Xuất dữ liệu**: Export Excel hoặc PDF
        
        Mỗi nhân khẩu cần thông tin: Họ tên, Ngày sinh, CCCD, Quê quán, Nghề nghiệp.'''
    # Trợ giúp về thu phí
    elif any(w in message_clean for w in ['thu phí', 'khoản thu', 'khoan thu', 'payment', 'fee']):
        return '''Quản lý thu phí bao gồm:
        
        1. **Khoản thu bắt buộc**: Phí vệ sinh, phí an ninh,...
        2. **Khoản thu đóng góp**: Ủng hộ, từ thiện,...
        
        Các chức năng:
        - Tạo khoản thu mới
        - Xem chi tiết khoản thu và danh sách đã nộp
        - Xem thống kê: Số hộ đã nộp, Tổng số tiền
        - Ghi nhận nộp tiền cho hộ khẩu'''
    # Trợ giúp về thống kê
    elif any(w in message_clean for w in ['thống kê', 'thong ke', 'dashboard', 'statistics']):
        return '''Bảng thống kê cung cấp:
        
        1. **Tổng quan**: Số hộ khẩu, số nhân khẩu
        2. **Phân bố độ tuổi**: Mầm non, Tiểu học, THCS, THPT, Lao động, Nghỉ hưu
        3. **Biểu đồ**: Visualize dữ liệu độ tuổi
        
        Vào trang "Dashboard" để xem tất cả thống kê.'''
    # Trợ giúp về đăng nhập
    elif any(w in message_clean for w in ['đăng nhập', 'dang nhap', 'login']):
        return '''Để đăng nhập hệ thống:
        
        1. Nhập Username (ví dụ: admin, ketoan)
        2. Nhập Password (mật khẩu đã được cấp)
        3. Click "Đăng nhập"
        
        Có 2 loại tài khoản:
        - **ADMIN**: Toàn quyền quản lý
        - **ACCOUNTANT**: Quản lý khoản thu và thu phí'''
    # Trợ giúp chung
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
        try:
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": (context + "\n" if context else "") + message}]}
                ],
            }
            url = f"{GOOGLE_GEMINI_API_URL}?key={GOOGLE_GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, headers=headers, json=payload, timeout=15)
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
                return f"Gemini API request failed: {response.status_code} {response.text}"
        except Exception as e:
            return f"Gemini API call error: {str(e)}"
    # Fallback cực cuối (không có key Gemini): trả lời hệ thống
    return f"Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Bạn có thể hỏi tôi về bất kỳ tính năng nào của hệ thống."


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

