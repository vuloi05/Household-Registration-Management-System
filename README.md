# Hệ thống Quản lý Nhân khẩu

Dự án phần mềm quản lý thông tin khu dân cư / tổ dân phố, giúp Ban quản lý thực hiện các nghiệp vụ quản lý nhân khẩu, hộ khẩu, và các công tác đoàn thể khác một cách hiệu quả.

## Giới thiệu bài toán

Phần mềm được xây dựng cho Ban quản lý tổ dân phố 7, phường La Khê, nhằm giải quyết các khó khăn trong việc quản lý thông tin của hơn 400 hộ gia đình với 1700+ nhân khẩu.

## Công nghệ sử dụng

*   **Backend:**
    *   Ngôn ngữ: **Java 17**
    *   Framework: **Spring Boot 3**
    *   Cơ sở dữ liệu: **PostgreSQL**
    *   Build tool: **Maven**
*   **Frontend:**
    *   Framework: **React** (với **TypeScript**)
    *   Build tool: **Vite**
    *   Thư viện UI: **Material-UI (MUI)**
    *   Quản lý Form: **React Hook Form** & **Zod**
*   **AI Agent Server:**
    *   Framework: **Flask (Python 3.11+)**
    *   Chức năng: Chatbot AI Assistant

---

## Hướng dẫn cài đặt và chạy dự án

### Yêu cầu tiên quyết

1.  **Java JDK 17** hoặc cao hơn.
2.  **Node.js 18** hoặc cao hơn.
3.  **PostgreSQL** đã được cài đặt và đang chạy.
4.  **Maven** (thường đã được tích hợp trong các IDE như IntelliJ, VS Code).
5.  **Python 3.11+** (cho AI Agent Server).
6. **.env** đặt cùng cấp với file pom.xml (copy nội dung bên dưới vào file .env và cấu hình theo của bạn)

#### Nội dung file .env:

 ```bash
    # Database Configuration
    # Copy this file to .env and update the values
    DB_PASSWORD=your_database_password_here
 ```

6.  **Tạo file cấu hình .env cho AI Server (bắt buộc)**
    - Vào thư mục `ai-server`, tạo file `.env` với các biến sau:

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
    - Nếu bạn không dùng AWS, chỉ cần các dòng: `PORT`, `DEBUG`, `OLLAMA_HOST`, `OLLAMA_MODEL`.
    - `GOOGLE_GEMINI_API_KEY` là tuỳ chọn để dự phòng (fallback) khi Ollama không sẵn sàng.
    - **KHÔNG đưa file .env thật lên git để tránh lộ khoá bí mật!**

### Các bước cài đặt

1.  **Clone repository:**
    ```bash
    git clone <URL_CUA_REPOSITORY>
    cd <TEN_THU_MUC_DU_AN>
    ```

2.  **Cấu hình Backend:**
    *   Mở file `backend/api/src/main/resources/application.properties`.
    *   Tạo một cơ sở dữ liệu rỗng trong PostgreSQL với tên là `quan_ly_nhan_khau`.
    *   Cập nhật lại thông tin `spring.datasource.username` và `spring.datasource.password` cho phù hợp với CSDL của bạn.

3.  **Cài đặt thư viện Frontend:**
    ```bash
    cd frontend
    npm install
    ```

### Chạy dự án

Bạn cần mở 3 cửa sổ terminal riêng biệt để chạy song song backend, frontend và AI server.

1.  **Chạy Backend:**
    *   Mở terminal 1, di chuyển vào thư mục backend:
        ```bash
        cd backend/api
        ```
    *   Chạy lệnh:
        ```bash
        ./mvnw spring-boot:run
        ```
    *   Backend sẽ khởi động và chạy tại `http://localhost:8080`.

2.  **Chạy Frontend:**
    *   Mở terminal 2, di chuyển vào thư mục frontend:
        ```bash
        cd frontend
        ```
    *   Chạy lệnh:
        ```bash
        npm run dev
        ```
    *   Frontend sẽ khởi động và chạy tại `http://localhost:5173`.

3.  **Chạy AI Agent Server (local):**
    *   Mở terminal 3, di chuyển vào thư mục `ai-server`:
        ```bash
        cd ai-server
        ```
    *   Tạo virtual environment (nếu chưa có):
        ```bash
        python -m venv venv
        ```
    *   Activate virtual environment:
        - Windows: `venv\Scripts\activate`
        - Linux/Mac: `source venv/bin/activate`
    *   Cài đặt dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Cài đặt Ollama (Local AI):
        - Windows (PowerShell):
          ```powershell
          winget install Ollama.Ollama
          ```
        - macOS (Homebrew):
          ```bash
          brew install --cask ollama
          ```
        - Linux:
          ```bash
          curl -fsSL https://ollama.com/install.sh | sh
          ```
        - Kéo model (ví dụ `llama3.1`):
          ```bash
          ollama pull llama3.1
          ```
        - Kiểm tra nhanh dịch vụ Ollama:
          ```bash
          curl http://localhost:11434/api/generate \
            -H "Content-Type: application/json" \
            -d '{"model":"llama3.1","prompt":"Say hello"}'
          ```
    *   (Tuỳ chọn) Cấu hình file `.env` để bật ghi dữ liệu lên AWS:
        ```bash
        # ai-server/.env
        PORT=5000
        DEBUG=True
        
        # Ghi dữ liệu chat lên AWS (tuỳ chọn)
        AWS_REGION=us-east-1
        AWS_S3_BUCKET=your-s3-bucket-name
        AWS_DDB_TABLE=your_name_ddb_table
        ```
        - Yêu cầu có AWS credentials trên máy: `aws configure` (lưu ở `~/.aws/credentials`).
        - Khi bật, mỗi tin nhắn/response sẽ ghi vào:
          - S3: `s3://$AWS_S3_BUCKET/chat-logs/YYYY/MM/DD.ndjson`
          - DynamoDB: bảng `$AWS_DDB_TABLE` (PK: `pk`, SK: `sk`).
    *   Chạy lệnh:
        ```bash
        python main.py
        ```
    *   AI Server sẽ khởi động và chạy tại `http://localhost:5000`.
    *   Luồng gọi model: Server sẽ gọi Ollama trước (`OLLAMA_MODEL`). Nếu Ollama không phản hồi, hệ thống sẽ tự động fallback sang Gemini (cần `GOOGLE_GEMINI_API_KEY`).

4.  **Khai báo URL AI server cho Frontend:**
    - Tạo file `frontend/.env` (hoặc cập nhật)
      ```bash
      VITE_AI_SERVER_URL=http://localhost:5000
      ```
    - Frontend sẽ gọi AI server theo biến này. Khi chuyển sang dùng server trên AWS, đổi sang `http(s)://<domain-hoặc-ip-aws>`.

Bây giờ, hãy mở trình duyệt và truy cập vào `http://localhost:5173` để sử dụng ứng dụng. Chatbot AI sẽ xuất hiện ở góc dưới bên phải.

---

## Các chức năng chính

*   Quản lý thông tin Hộ khẩu (Thêm, Sửa, Xóa, Tách hộ).
*   Quản lý thông tin Nhân khẩu.
*   Quản lý các khoản thu phí, đóng góp.
*   Thống kê, báo cáo.
*   Phân quyền người dùng (Tổ trưởng/Phó, Kế toán).
*   **AI Chatbot Assistant** - Trợ giúp người dùng tìm hiểu về hệ thống.

---

## AI Chatbot Assistant

Hệ thống tích hợp chatbot AI để hỗ trợ người dùng:
- Tư vấn về các tính năng hệ thống
- Hướng dẫn sử dụng các chức năng
- Trả lời câu hỏi về quản lý hộ khẩu, nhân khẩu
- Thống kê và báo cáo

Chatbot xuất hiện ở góc dưới bên phải màn hình. Click vào icon để mở và bắt đầu trò chuyện.
