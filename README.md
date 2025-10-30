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
    PORT=5000
    DEBUG=True
    # AWS lưu chat (nếu có)
    AWS_REGION=us-east-1
    AWS_S3_BUCKET=your_name_bucket
    AWS_DDB_TABLE=your_name_ddb_table
    # Google Gemini API Key (bắt buộc)
    GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
    # Tuỳ chọn - học từ lịch sử log
    LEARNING_FROM_AWS=true
    LEARNING_MAX_ITEMS=16
    LEARNING_S3_PREFIX=chat-logs
    ```
    - Nếu bạn không dùng AWS, chỉ cần dòng PORT, DEBUG, GOOGLE_GEMINI_API_KEY.
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