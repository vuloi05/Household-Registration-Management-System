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

**QUAN TRỌNG:** Sau khi copy, bạn **PHẢI** chỉnh sửa file `.env` và thay thế các giá trị:
- `AWS_ACCESS_KEY_ID`: Thay bằng Access Key ID thực tế của bạn
- `AWS_SECRET_ACCESS_KEY`: Thay bằng Secret Access Key thực tế của bạn
- `GOOGLE_GEMINI_API_KEY`: Thay bằng API key thực tế của bạn
- Các giá trị AWS khác (region, bucket, table) nếu cần

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
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=ai-training-data-bucket-kirito
AWS_DDB_TABLE=ai_agent_conversations

# Google Gemini (bắt buộc để AI hoạt động)
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key

# Tự học từ log AWS (nâng cao, có thể bỏ qua)
LEARNING_FROM_AWS=true
LEARNING_MAX_ITEMS=16
LEARNING_S3_PREFIX=chat-logs

# Tự động reload knowledge base từ AWS (tự học liên tục)
LEARNING_AUTO_RELOAD_ENABLED=true  # Bật/tắt tự động reload
LEARNING_AUTO_RELOAD_INTERVAL=300  # Interval reload (giây), mặc định 5 phút (300s)

# Tự học chủ động - Tự động phân tích và học từ conversations (không cần feedback)
LEARNING_AUTO_LEARN_ENABLED=true  # Bật/tắt tự học chủ động
LEARNING_AUTO_LEARN_INTERVAL=600  # Interval tự học (giây), mặc định 10 phút (600s)
LEARNING_MIN_SCORE_THRESHOLD=0.5  # Điểm tối thiểu để học (0.0-1.0), mặc định 0.5
LEARNING_MAX_AUTO_LEARN_ITEMS=10  # Số Q&A tối đa học mỗi lần chạy, mặc định 10

# Response caching và conversation memory
ENABLE_RESPONSE_CACHE=true  # Bật/tắt response caching
RESPONSE_CACHE_TTL=3600  # Cache TTL (giây), mặc định 1 giờ
ENABLE_CONVERSATION_MEMORY=true  # Bật/tắt conversation memory
SESSION_TIMEOUT_HOURS=24  # Session timeout (giờ), mặc định 24h

# Response validation và API retry
ENABLE_RESPONSE_VALIDATION=true  # Bật/tắt response validation
API_RETRY_MAX_ATTEMPTS=3  # Số lần retry tối đa, mặc định 3
API_RETRY_DELAY_SECONDS=1.0  # Delay giữa các lần retry (giây), mặc định 1s
```
**Lưu ý:**
- KHÔNG upload file `.env` chứa key thực lên repository/public.
- Nếu chỉ muốn chat AI (không lưu log, không cần tự học), chỉ khai báo PORT, DEBUG, GOOGLE_GEMINI_API_KEY.
- Key lấy tại Google AI Studio hoặc Google Cloud Console.

### Kiểm tra cấu hình .env

Nếu AWS không hoạt động, chạy script kiểm tra:
```bash
python check-env.py
```

Script này sẽ:
- Kiểm tra xem file `.env` có tồn tại không
- Kiểm tra xem các biến AWS có được load đúng không
- Hiển thị các biến còn thiếu (nếu có)

**Lưu ý khi copy file .env sang máy khác:**
1. Đảm bảo file `.env` nằm trong thư mục `ai-server/` (cùng cấp với `main.py`)
2. Kiểm tra encoding của file (phải là UTF-8, không có BOM)
3. Đảm bảo không có khoảng trắng thừa hoặc ký tự đặc biệt
4. Mỗi dòng phải có format: `KEY=value` (không có khoảng trắng quanh dấu `=`)
5. Không cần đăng nhập AWS trên web, chỉ cần Access Key và Secret Key là đủ

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
  "actions": [],
  "timestamp": "2025-01-20 10:30:00"
}
```

### POST /kb/reload
Reload knowledge base từ AWS ngay lập tức (manual trigger)

**Response:**
```json
{
  "success": true,
  "message": "Knowledge base reloaded successfully",
  "items_count": 150,
  "previous_count": 145,
  "timestamp": "2025-01-20 10:30:00"
}
```

### GET /kb/status
Xem trạng thái knowledge base và cấu hình tự học

**Response:**
```json
{
  "success": true,
  "status": {
    "items_count": 150,
    "last_reload_time": "2025-01-20 10:30:00",
    "reload_count": 5,
    "auto_reload_enabled": true,
    "auto_reload_interval": 300,
    "aws_configured": true,
    "auto_learning": {
      "enabled": true,
      "interval": 600,
      "min_score_threshold": 0.5,
      "max_learn_items_per_run": 10,
      "last_analysis_time": "2025-01-20 10:35:00",
      "total_learned_count": 45,
      "last_processed_timestamp": "2025-01-20 10:35:00"
    }
  }
}
```

### POST /kb/auto-learn
Trigger tự học chủ động ngay lập tức (phân tích và học từ conversations)

**Response:**
```json
{
  "success": true,
  "message": "Auto-learning completed successfully",
  "analyzed_count": 150,
  "learned_count": 8,
  "total_score": 6.5,
  "timestamp": "2025-01-20 10:40:00"
}
```

### GET /kb/auto-learn/status
Xem trạng thái tự học chủ động

**Response:**
```json
{
  "success": true,
  "status": {
    "enabled": true,
    "interval": 600,
    "min_score_threshold": 0.5,
    "max_learn_items_per_run": 10,
    "last_analysis_time": "2025-01-20 10:35:00",
    "total_learned_count": 45,
    "last_processed_timestamp": "2025-01-20 10:35:00",
    "aws_configured": true
  }
}
```

### POST /qa-feedback
Gửi feedback về câu trả lời của AI (để AI tự học)

**Request:**
```json
{
  "question": "Câu hỏi của người dùng",
  "answer": "Câu trả lời đúng (cho feedback confirm/correct)",
  "feedback_type": "confirm|correct|wrong",
  "context": "optional context"
}
```

**Response:**
```json
{
  "success": true,
  "new_answer": "Câu trả lời mới (nếu feedback_type là wrong)"
}
```

## Tự học liên tục (Continuous Learning)

Hệ thống AI có khả năng **tự học liên tục** từ AWS với 2 cơ chế:

### 1. Auto-Reload (Tải lại kiến thức)
Tự động tải lại knowledge base từ AWS định kỳ.

#### Cơ chế Auto-Reload:

1. **Auto-reload định kỳ**: Background thread tự động reload knowledge base từ AWS theo interval cấu hình (mặc định 5 phút)
2. **Auto-reload sau feedback**: Tự động reload sau 2 giây khi người dùng gửi feedback (để cập nhật dữ liệu mới từ AWS)
3. **Manual reload**: Có thể trigger reload thủ công qua API endpoint `/kb/reload`
4. **Ưu tiên dữ liệu**: Hệ thống ưu tiên các Q&A từ user feedback và auto-corrected responses

### 2. Auto-Learning (Tự học chủ động) ⭐ MỚI

**Tự động phân tích conversations và học mà không cần feedback từ người dùng!**

AI sẽ tự động:
- Phân tích tất cả conversations từ AWS (DynamoDB và S3)
- Đánh giá chất lượng Q&A bằng scoring algorithm
- Tự động học các Q&A chất lượng cao vào knowledge base
- Loại bỏ các Q&A không hữu ích (chào hỏi chung chung, help tổng quát)
- Tránh duplicate với knowledge base hiện có

#### Scoring Algorithm:

Hệ thống đánh giá Q&A dựa trên nhiều tiêu chí:
- **Độ dài và chi tiết của answer** (50-500 ký tự là optimal)
- **Câu hỏi có từ khóa cụ thể** (làm sao, cách, tại sao, mã, id, ...)
- **Answer chứa thông tin cụ thể** (số, mã, tên, địa chỉ, ...)
- **Answer không lặp lại câu hỏi**
- **Answer có cấu trúc** (có dấu chấm, xuống dòng, danh sách)
- **Ưu tiên source đã được confirm**

Q&A chỉ được học nếu có điểm >= `LEARNING_MIN_SCORE_THRESHOLD` (mặc định 0.5)

#### Cơ chế Auto-Learning:

1. **Auto-learn định kỳ**: Background thread tự động phân tích và học mỗi 10 phút (có thể cấu hình)
2. **Manual trigger**: Có thể trigger tự học thủ công qua API endpoint `/kb/auto-learn`
3. **Smart filtering**: Tự động loại bỏ:
   - Câu chào hỏi chung chung
   - Câu hỏi help tổng quát (không cụ thể)
   - Câu trả lời quá ngắn hoặc quá dài
   - Q&A trùng lặp với knowledge base hiện có
4. **Top selection**: Chỉ học top N Q&A có điểm cao nhất mỗi lần chạy

### Cấu hình tự học:

#### Auto-Reload:
- `LEARNING_AUTO_RELOAD_ENABLED`: Bật/tắt tự động reload (mặc định: `true`)
- `LEARNING_AUTO_RELOAD_INTERVAL`: Khoảng thời gian reload (giây), mặc định 300 giây (5 phút)

#### Auto-Learning:
- `LEARNING_AUTO_LEARN_ENABLED`: Bật/tắt tự học chủ động (mặc định: `true`)
- `LEARNING_AUTO_LEARN_INTERVAL`: Khoảng thời gian tự học (giây), mặc định 600 giây (10 phút)
- `LEARNING_MIN_SCORE_THRESHOLD`: Điểm tối thiểu để học (0.0-1.0), mặc định 0.5
- `LEARNING_MAX_AUTO_LEARN_ITEMS`: Số Q&A tối đa học mỗi lần chạy, mặc định 10

### Lưu dữ liệu lên AWS (tự học thụ động)

Khi cấu hình AWS, mỗi tin nhắn sẽ được lưu lên:
- S3: `s3://$AWS_S3_BUCKET/chat-logs/YYYY/MM/DD.ndjson`
- DynamoDB: bảng `$AWS_DDB_TABLE` với partition key `pk` và sort key `sk`

Knowledge base sẽ tự động học từ:
- DynamoDB: Tất cả các conversations (với pagination)
- S3: Chat logs từ 3 ngày gần nhất (mỗi file lấy 200 dòng cuối)
- Ưu tiên các items có `source` chứa "feedback", "corrected", hoặc "confirm"

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
      "Action": ["dynamodb:PutItem", "dynamodb:Scan"],
      "Resource": "arn:aws:dynamodb:ap-southeast-1:YOUR_ACCOUNT_ID:table/ai_agent_conversations"
    }
  ]
}
```

> **Lưu ý:** Bạn có thể cấu hình AWS credentials trực tiếp trong file `.env` bằng cách thêm `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`. Không cần dùng `aws configure` nữa.

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

