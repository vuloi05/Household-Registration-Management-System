# Hệ thống Quản lý Nhân khẩu

Dự án phần mềm quản lý thông tin khu dân cư / tổ dân phố, giúp Ban quản lý thực hiện các nghiệp vụ quản lý nhân khẩu, hộ khẩu, và các công tác đoàn thể khác một cách hiệu quả.

## Kiến trúc hệ thống

Dự án bao gồm 4 thành phần chính hoạt động độc lập:

1.  **`backend`**: Một API server xây dựng bằng **Java Spring Boot** để xử lý toàn bộ logic nghiệp vụ và tương tác với cơ sở dữ liệu.
2.  **`frontend`**: Một ứng dụng giao diện người dùng (SPA) xây dựng bằng **React & TypeScript** để người dùng tương tác.
3.  **`mobile`**: Một ứng dụng mobile xây dựng bằng **React Native & Expo** để người dùng truy cập hệ thống trên thiết bị di động.
4.  **`ai-server`**: Một server **Python Flask** cung cấp chức năng Chatbot AI, tích hợp với các mô hình ngôn ngữ lớn (LLM) như Ollama và Gemini.

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
*   **Mobile:**
    *   Framework: **React Native** với **Expo**
    *   Ngôn ngữ: **TypeScript**
    *   Navigation: **React Navigation**
    *   UI Library: **React Native Paper**
*   **AI Agent Server:**
    *   Framework: **Flask (Python 3.11+)**
    *   Chức năng: Chatbot AI Assistant (Ollama & Google Gemini)

---

## Hướng dẫn cài đặt và chạy dự án

### 1. Yêu cầu tiên quyết

- **Java JDK 17** hoặc cao hơn.
- **Node.js 18** hoặc cao hơn.
- **PostgreSQL** đã được cài đặt và đang chạy.
- **Python 3.11+** (cho AI Agent Server).
- **Maven** và **Git** (thường đã có sẵn hoặc tích hợp trong IDE).
- **Expo CLI** (sẽ được cài đặt tự động qua npm).
- **Expo Go app** trên thiết bị di động (tùy chọn, để test trên thiết bị thật).

### 2. Cấu hình môi trường

#### a. Backend & Cơ sở dữ liệu

1.  **Tạo cơ sở dữ liệu:**
    *   Mở công cụ quản lý PostgreSQL của bạn (ví dụ: `psql`, pgAdmin).
    *   Tạo một database mới với tên `quan_ly_nhan_khau`.
        ```sql
        CREATE DATABASE quan_ly_nhan_khau;
        ```
    *   **Lưu ý:** Backend được cấu hình mặc định để kết nối với user `postgres`. Hãy đảm bảo user này tồn tại và có quyền truy cập database `quan_ly_nhan_khau`.

2.  **Tạo file cấu hình `.env` cho Backend:**
    *   Di chuyển đến thư mục `backend/api`.
    *   Tạo một file mới tên là `.env`.
    *   Thêm nội dung sau vào file và thay `your_password_here` bằng mật khẩu của user `postgres` trong PostgreSQL của bạn.
        ```env
        # Mật khẩu cho user 'postgres' của PostgreSQL
        DB_PASSWORD=your_password_here
        ```
    *   **Quan trọng:** Backend được lập trình để **tự động khởi tạo schema và nạp dữ liệu mẫu** từ các file trong `src/main/resources/data/`. Bạn **không** cần chạy bất kỳ file `.sql` nào thủ công.

### Tích hợp quét QR qua AppSheet + Google Sheets (Polling)

Chức năng này cho phép bạn quét QR bằng AppSheet. AppSheet ghi dữ liệu vào Google Sheet, còn website (localhost) sẽ tự động "polling" Google Sheets để lấy `qr_code`, tự nhập vào thanh tìm kiếm của trang Quản lý Nhân khẩu, rồi xóa dòng đó khỏi Sheet.

1.  Tạo Service Account và chia sẻ Google Sheet:
    - Tạo Service Account trên GCP, tải về file khóa JSON.
    - Chia sẻ Google Sheet (Share) cho `client_email` trong file khóa JSON với quyền Editor.

2.  Lấy `spreadsheetId` của Google Sheet:
    - `spreadsheetId` là phần nằm giữa URL: `https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit`.

3.  Cấu hình biến môi trường trong `frontend/.env`:
    ```bash
    # Băt buộc cho frontend (Vite)
    VITE_SHEETS_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
    VITE_SHEETS_SHEET_NAME=Sheet1

    # Cho proxy server cục bộ (Node Express)
    SHEETS_PROXY_PORT=5175

    # CHỌN 1 TRONG 2 CÁCH CUNG CẤP CREDENTIALS CHO PROXY (KHÔNG LỘ RA TRÌNH DUYỆT)
    # Cách A: Trỏ tới file JSON trên máy (không commit file này lên git)
    GOOGLE_APPLICATION_CREDENTIALS=D:\path\to\service-account.json

    # Cách B: Dán nội dung JSON ở dạng base64 (không cần lưu file)
    # GOOGLE_CREDENTIALS_BASE64=BASE64_OF_YOUR_JSON
    ```

    Ghi chú bảo mật:
    - Không commit file khóa bí mật vào repository.
    - `frontend/.gitignore` đã được cấu hình để bỏ qua các file khóa thông dụng. Nếu lỡ commit, hãy xóa khỏi lịch sử git.

4.  Cài dependencies và chạy proxy + frontend:
    ```bash
    # Trong thư mục frontend (lần đầu nếu chưa cài)
    npm install

    # Chạy proxy Google Sheets (đọc .env tự động)
    npm run sheets-proxy

    # Mở một terminal khác trong frontend và chạy ứng dụng
    npm run dev
    ```

5.  Sử dụng:
    - Vào trang Quản lý Nhân khẩu.
    - Nhấn biểu tượng QR trong ô tìm kiếm (tooltip: "Quét từ AppSheet").
    - Mở AppSheet để quét QR. Trong vài giây, `qr_code` sẽ tự nhập vào ô tìm kiếm và dòng tương ứng trong Google Sheet sẽ bị xóa để dọn hộp thư.

#### b. AI Server

1.  **Tạo file cấu hình `.env` cho AI Server:**
    *   Di chuyển đến thư mục `ai-server`.
    *   Tạo một file mới tên là `.env`.
    *   Sao chép nội dung dưới đây vào file. Cấu hình tối thiểu để chạy local đã được cung cấp.
        ```env
        # Cấu hình server
        PORT=5000
        DEBUG=True

        # Cấu hình cho Ollama (chạy AI cục bộ)
        # Mặc định, không cần thay đổi nếu bạn cài Ollama trên máy
        OLLAMA_HOST=http://localhost:11434
        OLLAMA_MODEL=llama3.1

        # (Tùy chọn) Cấu hình Google Gemini để dự phòng khi Ollama lỗi
        # GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key

        # (Tùy chọn) Cấu hình lưu trữ log chat trên AWS
        # AWS_REGION=us-east-1
        # AWS_S3_BUCKET=your-s3-bucket-name
        # AWS_DDB_TABLE=your-dynamodb-table-name
        ```
    *   **Lưu ý:** `GOOGLE_GEMINI_API_KEY` là tùy chọn. Nếu được cung cấp, hệ thống sẽ tự động dùng Gemini khi không thể kết nối với Ollama.

#### c. Frontend

1.  **Tạo file cấu hình `.env` cho Frontend:**
    *   Di chuyển đến thư mục `frontend`.
    *   Tạo một file mới tên là `.env`.
    *   Thêm nội dung sau để khai báo địa chỉ của AI Server:
        ```env
        VITE_AI_SERVER_URL=http://localhost:5000
        ```

#### d. Mobile

1.  **Cấu hình kết nối Backend:**
    *   Di chuyển đến thư mục `mobile/src/config`.
    *   Mở file `api.ts`.
    *   Tìm dòng `const LOCAL_IP = '192.168.1.235';` và thay đổi IP thành địa chỉ IP của máy tính bạn.
    *   **Lưu ý:** 
        - Để tìm IP của máy tính, chạy lệnh `ipconfig` (Windows) hoặc `ifconfig` (macOS/Linux) và tìm "IPv4 Address".
        - Nếu sử dụng Android Emulator, có thể sử dụng `10.0.2.2` thay vì IP thực.
        - Nếu sử dụng iOS Simulator trên Mac, có thể sử dụng `localhost`.
        - Thiết bị mobile và máy tính phải cùng một mạng Wi-Fi để kết nối được.
    *   Xem thêm hướng dẫn chi tiết trong file `mobile/CONNECTION_GUIDE.md`.

### 3. Cài đặt và Chạy

Bạn cần mở **4 cửa sổ terminal** riêng biệt, mỗi cửa sổ cho một thành phần của hệ thống.

#### Terminal 1: Chạy Backend

```bash
# Di chuyển đến thư mục backend
cd backend/api

# Chạy ứng dụng Spring Boot
./mvnw spring-boot:run
```
> Backend sẽ khởi động và chạy tại `http://localhost:8080`.

---

#### Terminal 2: Chạy Frontend

```bash
# Di chuyển đến thư mục frontend
cd frontend

# Cài đặt các thư viện cần thiết
npm install
npm install @mui/lab

# Khởi động server phát triển
npm run dev
```
> Frontend sẽ khởi động và chạy tại `http://localhost:5173`. Mở địa chỉ này trên trình duyệt để sử dụng.

---

#### Terminal 3: Chạy AI Server

```bash
# Di chuyển đến thư mục ai-server
cd ai-server

# Tạo và kích hoạt môi trường ảo Python
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Cài đặt các thư viện Python
pip install -r requirements.txt

# Cài đặt Ollama và tải model (nếu chưa có)
# Truy cập https://ollama.com/ để cài đặt, sau đó chạy lệnh:
ollama pull llama3.1

# Khởi động AI server
python main.py
```
> AI Server sẽ khởi động và chạy tại `http://localhost:5000`.

---

#### Terminal 4: Chạy Mobile App

```bash
# Di chuyển đến thư mục mobile
cd mobile

# Cài đặt các thư viện cần thiết (chỉ cần chạy lần đầu)
npm install

# Khởi động Expo development server
npm start
# hoặc
npx expo start

# Để xóa cache và khởi động lại (nếu gặp vấn đề)
npx expo start --clear
```
> Expo sẽ khởi động và hiển thị QR code. Bạn có thể:
> - Quét QR code bằng **Expo Go** app trên thiết bị di động (iOS/Android) để chạy app trên thiết bị thật.
> - Nhấn `a` để mở trên Android Emulator (nếu đã cài đặt).
> - Nhấn `i` để mở trên iOS Simulator (chỉ trên macOS).
> - Nhấn `w` để mở trên trình duyệt web.

**Lưu ý quan trọng:**
- Đảm bảo Backend đang chạy trước khi sử dụng Mobile app.
- Nếu gặp lỗi "Network Error", hãy kiểm tra lại cấu hình IP trong `mobile/src/config/api.ts` và đảm bảo thiết bị mobile cùng mạng Wi-Fi với máy tính chạy Backend.
- Xem thêm hướng dẫn kết nối trong file `mobile/CONNECTION_GUIDE.md`.

### 4. Truy cập ứng dụng

- **Web Frontend:** Mở trình duyệt và truy cập `http://localhost:5173`. Chatbot AI sẽ xuất hiện ở góc dưới bên phải màn hình.
- **Mobile App:** Sử dụng Expo Go app để quét QR code hoặc mở trên emulator/simulator như hướng dẫn ở Terminal 4.

---

## Các chức năng chính

*   Quản lý thông tin Hộ khẩu (Thêm, Sửa, Xóa, Tách hộ).
*   Quản lý thông tin Nhân khẩu.
*   Quản lý các khoản thu phí, đóng góp.
*   Thống kê, báo cáo.
*   Phân quyền người dùng (Tổ trưởng/Phó, Kế toán).
*   **AI Chatbot Assistant** - Trợ giúp người dùng tìm hiểu về hệ thống.