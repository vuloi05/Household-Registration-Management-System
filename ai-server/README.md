# AI Agent Server

AI Chatbot Assistant cho hệ thống Quản lý Nhân khẩu.

## Cài đặt

1. Tạo virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env` mẫu và chỉnh sửa:
```bash
# Windows
copy .env.example .env
# Linux/Mac
cp .env.example .env
```

5. Chạy server:
```bash
python main.py
```

Server sẽ chạy tại: http://localhost:5000

## Cấu hình môi trường (.env)

```env
# Cấu hình server
PORT=5000
DEBUG=True

# Ghi dữ liệu chat lên AWS (tùy chọn, để trống nếu không dùng)
AWS_REGION=us-east-1
AWS_S3_BUCKET=ai-training-data-bucket-kirito
AWS_DDB_TABLE=ai_agent_conversations

# Google Gemini (bắt buộc để AI hoạt động)
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key

# Tự học từ log AWS (nâng cao, có thể bỏ qua)
LEARNING_FROM_AWS=true
LEARNING_MAX_ITEMS=16
LEARNING_S3_PREFIX=chat-logs
```
**Lưu ý:**
- KHÔNG upload file `.env` chứa key thực lên repository/public.
- Nếu chỉ muốn chat AI (không lưu log, không cần tự học), chỉ khai báo PORT, DEBUG, GOOGLE_GEMINI_API_KEY.
- Key lấy tại Google AI Studio hoặc Google Cloud Console.

### Hướng dẫn tạo file .env nhanh:
```bash
cd ai-server
cp .env.example .env
# Sau đó sửa lại các giá trị trong .env cho phù hợp
```

## API Endpoints

### GET /health
Health check endpoint

### POST /chat
Gửi tin nhắn cho chatbot

**Request:**
```json
{
  "message": "Xin chào",
  "context": "optional context"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Phản hồi từ AI",
  "timestamp": "2025-01-20 10:30:00"
}
```

## Lưu dữ liệu lên AWS (tự học thụ động)

Khi cấu hình AWS, mỗi tin nhắn sẽ được lưu lên:
- S3: `s3://$AWS_S3_BUCKET/chat-logs/YYYY/MM/DD.ndjson`
- DynamoDB: bảng `$AWS_DDB_TABLE` với partition key `pk` và sort key `sk`

### Tạo tài nguyên AWS tối thiểu

1) S3 bucket
- Tạo bucket (ví dụ: `your-s3-bucket-name`)
- Bật Block Public Access (mặc định)

2) DynamoDB table
- Tên: `ai_agent_conversations`
- Partition key (String): `pk`
- Sort key (String): `sk`
- On-demand capacity

3) IAM user/role (máy local dùng profile AWS CLI)
- Quyền tối thiểu (policy mẫu):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::your-s3-bucket-name",
        "arn:aws:s3:::your-s3-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem"],
      "Resource": "arn:aws:dynamodb:ap-southeast-1:YOUR_ACCOUNT_ID:table/ai_agent_conversations"
    }
  ]
}
```

> Gợi ý: cấu hình AWS CLI bằng `aws configure` để lưu credentials ở `~/.aws/credentials`.

## Tích hợp với AI Models

Để tích hợp AI models như OpenAI, thêm vào file `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

Và mở rộng `process_message()` để gọi API.

## Docker (Optional)

Có thể chạy bằng Docker:
```bash
docker build -t ai-agent-server .
docker run -p 5000:5000 ai-agent-server
```

