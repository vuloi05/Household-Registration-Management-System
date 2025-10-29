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

4. Copy `.env.example` thành `.env`:
```bash
copy .env.example .env  # Windows
cp .env.example .env   # Linux/Mac
```

5. Chạy server:
```bash
python main.py
```

Server sẽ chạy tại: http://localhost:5000

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

## Tích hợp với AI Models

Để tích hợp AI models như OpenAI, thêm vào file `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

Và uncomment code trong `process_message()` để sử dụng.

## Docker (Optional)

Có thể chạy bằng Docker:
```bash
docker build -t ai-agent-server .
docker run -p 5000:5000 ai-agent-server
```

