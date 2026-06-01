# Hệ thống Quản lý Nhân khẩu（住民登録管理システム）

Dự án phần mềm quản lý thông tin khu dân cư / tổ dân phố, giúp Ban quản lý thực hiện các nghiệp vụ quản lý nhân khẩu, hộ khẩu, và các công tác đoàn thể khác một cách hiệu quả.

居住区・自治会の住民情報を管理するソフトウェアプロジェクト。管理委員会が住民・世帯管理業務やその他の組織活動を効率的に実施できるよう支援します。

## Kiến trúc hệ thống（システムアーキテクチャ）

Dự án bao gồm 4 thành phần chính hoạt động độc lập:

本プロジェクトは、独立して動作する4つの主要コンポーネントで構成されています。

1.  **`backend`**: Một API server xây dựng bằng **Java Spring Boot** để xử lý toàn bộ logic nghiệp vụ và tương tác với cơ sở dữ liệu.
    （**Java Spring Boot** で構築されたAPIサーバー。ビジネスロジック全般とデータベース操作を担当。）
2.  **`frontend`**: Một ứng dụng giao diện người dùng (SPA) xây dựng bằng **React & TypeScript** để người dùng tương tác.
    （**React & TypeScript** で構築されたSPAフロントエンドアプリケーション。）
3.  **`mobile`**: Một ứng dụng mobile xây dựng bằng **React Native & Expo** để người dùng truy cập hệ thống trên thiết bị di động.
    （**React Native & Expo** で構築されたモバイルアプリ。スマートフォンからシステムにアクセス可能。）
4.  **`ai-server`**: Một server **Python Flask** cung cấp chức năng Chatbot AI, tích hợp với các mô hình ngôn ngữ lớn (LLM) như Ollama và Gemini.
    （**Python Flask** サーバー。OllamaおよびGeminiなどの大規模言語モデルと連携したAIチャットボット機能を提供。）

## Công nghệ sử dụng（使用技術）

*   **Backend:**
    *   Ngôn ngữ（言語）: **Java 17**
    *   Framework: **Spring Boot 3**
    *   Cơ sở dữ liệu（データベース）: **PostgreSQL**
    *   Build tool: **Maven**
*   **Frontend:**
    *   Framework: **React** (với **TypeScript**)
    *   Build tool: **Vite**
    *   Thư viện UI（UIライブラリ）: **Material-UI (MUI)**
    *   Quản lý Form（フォーム管理）: **React Hook Form** & **Zod**
*   **Mobile:**
    *   Framework: **React Native** với **Expo**
    *   Ngôn ngữ（言語）: **TypeScript**
    *   Navigation（ナビゲーション）: **React Navigation**
    *   UI Library: **React Native Paper**
*   **AI Agent Server:**
    *   Framework: **Flask (Python 3.11+)**
    *   Chức năng（機能）: Chatbot AI Assistant (Ollama & Google Gemini)

---

## Hướng dẫn cài đặt và chạy dự án（セットアップガイド）

### 1. Yêu cầu tiên quyết（事前要件）

- **Java JDK 17** hoặc cao hơn（以上）.
- **Node.js 18** hoặc cao hơn（以上）.
- **PostgreSQL** đã được cài đặt và đang chạy（インストール済みで起動中であること）.
- **Python 3.11+** (cho AI Agent Server / AIサーバー用).
- **Maven** và **Git** (thường đã có sẵn hoặc tích hợp trong IDE / 通常IDEに統合済み).
- **Expo CLI** (sẽ được cài đặt tự động qua npm / npmで自動インストール).
- **Expo Go app** trên thiết bị di động (tùy chọn / 任意 — để test trên thiết bị thật / 実機テスト用).

### 2. Cấu hình môi trường（環境設定）

#### a. Backend & Cơ sở dữ liệu（データベース設定）

1.  **Tạo cơ sở dữ liệu（データベース作成）:**
    *   Mở công cụ quản lý PostgreSQL của bạn（PostgreSQLの管理ツールを開く）(ví dụ: `psql`, pgAdmin).
    *   Tạo một database mới với tên `quan_ly_nhan_khau`（`quan_ly_nhan_khau` という名前のデータベースを作成）:
        ```sql
        CREATE DATABASE quan_ly_nhan_khau;
        ```
    *   **Lưu ý（注意）:** Backend được cấu hình mặc định để kết nối với user `postgres`. Hãy đảm bảo user này tồn tại và có quyền truy cập database `quan_ly_nhan_khau`.
        （バックエンドはデフォルトで `postgres` ユーザーに接続します。このユーザーが存在し、データベースへのアクセス権を持っていることを確認してください。）

2.  **Tạo file cấu hình `.env` cho Backend（バックエンド用 `.env` ファイルの作成）:**
    *   Di chuyển đến thư mục `backend/api`（`backend/api` フォルダに移動）.
    *   Tạo một file mới tên là `.env`（`.env` ファイルを新規作成）.
    *   Thêm nội dung sau vào file và thay `your_password_here` bằng mật khẩu của user `postgres`（`your_password_here` をPostgreSQLのパスワードに置き換えてください）:
        ```env
        # Mật khẩu cho user 'postgres' của PostgreSQL（PostgreSQLパスワード）
        DB_PASSWORD=your_password_here
        ```
    *   **Quan trọng（重要）:** Backend được lập trình để **tự động khởi tạo schema và nạp dữ liệu mẫu** từ các file trong `src/main/resources/data/`. Bạn **không** cần chạy bất kỳ file `.sql` nào thủ công.
        （バックエンドは `src/main/resources/data/` 内のファイルから**スキーマの自動初期化とサンプルデータの投入**を行います。`.sql` ファイルを手動で実行する必要はありません。）

### Tích hợp quét QR qua AppSheet + Google Sheets (Polling)（AppSheet + Google Sheets QRスキャン連携）

Chức năng này cho phép bạn quét QR bằng AppSheet. AppSheet ghi dữ liệu vào Google Sheet, còn website (localhost) sẽ tự động "polling" Google Sheets để lấy `qr_code`, tự nhập vào thanh tìm kiếm của trang Quản lý Nhân khẩu, rồi xóa dòng đó khỏi Sheet.

この機能はAppSheetでQRコードをスキャンするためのものです。AppSheetがGoogle Sheetにデータを書き込み、Webサイト（localhost）が自動的にGoogle Sheetsをポーリングして `qr_code` を取得し、住民管理ページの検索欄に自動入力した後、該当行をSheetから削除します。

1.  Tạo Service Account và chia sẻ Google Sheet（Service Accountの作成とGoogle Sheetの共有）:
    - Tạo Service Account trên GCP, tải về file khóa JSON.（GCPでService Accountを作成し、JSONキーファイルをダウンロード。）
    - Chia sẻ Google Sheet (Share) cho `client_email` trong file khóa JSON với quyền Editor.（JSONキーファイル内の `client_email` にGoogle Sheetを編集者権限で共有。）

2.  Lấy `spreadsheetId` của Google Sheet（Google SheetのspreadsheetId取得）:
    - `spreadsheetId` là phần nằm giữa URL: `https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit`.（URLの中間部分が `spreadsheetId` です。）

3.  Cấu hình biến môi trường trong `frontend/.env`（`frontend/.env` 環境変数の設定）:
    ```bash
    # Băt buộc cho frontend (Vite)（フロントエンド必須）
    VITE_SHEETS_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
    VITE_SHEETS_SHEET_NAME=Sheet1

    # Cho proxy server cục bộ (Node Express)（ローカルプロキシサーバー用）
    SHEETS_PROXY_PORT=5175

    # CHỌN 1 TRONG 2 CÁCH CUNG CẤP CREDENTIALS CHO PROXY（認証情報の提供方法：以下2通りから1つ選択）
    # Cách A（方法A）: Trỏ tới file JSON trên máy (không commit file này lên git)（ローカルJSONファイルを指定 — gitにコミットしないこと）
    GOOGLE_APPLICATION_CREDENTIALS=D:\path\to\service-account.json

    # Cách B（方法B）: Dán nội dung JSON ở dạng base64 (không cần lưu file)（base64エンコードされたJSONを貼り付け — ファイル不要）
    # GOOGLE_CREDENTIALS_BASE64=BASE64_OF_YOUR_JSON
    ```

    Ghi chú bảo mật（セキュリティ注意事項）:
    - Không commit file khóa bí mật vào repository.（秘密鍵ファイルをリポジトリにコミットしないこと。）
    - `frontend/.gitignore` đã được cấu hình để bỏ qua các file khóa thông dụng. Nếu lỡ commit, hãy xóa khỏi lịch sử git.（`frontend/.gitignore` は一般的なキーファイルを除外するよう設定済みです。誤ってコミットした場合はgit履歴から削除してください。）

4.  Cài dependencies và chạy proxy + frontend（依存関係のインストールとプロキシ・フロントエンドの起動）:
    ```bash
    # Trong thư mục frontend（frontendフォルダ内で）— lần đầu nếu chưa cài（初回のみ）
    npm install

    # Chạy proxy Google Sheets（Google Sheetsプロキシの起動）— đọc .env tự động（.envを自動読み込み）
    npm run sheets-proxy

    # Mở một terminal khác trong frontend và chạy ứng dụng（別のターミナルでアプリを起動）
    npm run dev
    ```

5.  Sử dụng（使用方法）:
    - Vào trang Quản lý Nhân khẩu.（住民管理ページに移動。）
    - Nhấn biểu tượng QR trong ô tìm kiếm (tooltip: "Quét từ AppSheet").（検索欄のQRアイコンをクリック — ツールチップ: "Quét từ AppSheet"。）
    - Mở AppSheet để quét QR. Trong vài giây, `qr_code` sẽ tự nhập vào ô tìm kiếm và dòng tương ứng trong Google Sheet sẽ bị xóa để dọn hộp thư.（AppSheetでQRコードをスキャン。数秒後、`qr_code` が検索欄に自動入力され、Google Sheetの該当行が削除されます。）

#### b. AI Server（AIサーバー設定）

1.  **Tạo file cấu hình `.env` cho AI Server（AIサーバー用 `.env` ファイルの作成）:**
    *   Di chuyển đến thư mục `ai-server`（`ai-server` フォルダに移動）.
    *   Tạo một file mới tên là `.env`（`.env` ファイルを新規作成）.
    *   Sao chép nội dung dưới đây vào file. Cấu hình tối thiểu để chạy local đã được cung cấp.（以下の内容をファイルにコピーしてください。ローカル実行に必要な最小設定が含まれています。）
        ```env
        # Cấu hình server（サーバー設定）
        PORT=5000
        DEBUG=True

        # Cấu hình cho Ollama（Ollama設定 — ローカルAI実行）
        # Mặc định, không cần thay đổi nếu bạn cài Ollama trên máy（Ollamaをローカルにインストールした場合、変更不要）
        OLLAMA_HOST=http://localhost:11434
        OLLAMA_MODEL=llama3.1

        # (Tùy chọn / 任意) Cấu hình Google Gemini để dự phòng khi Ollama lỗi（OllamaエラーのフォールバックとしてGeminiを使用）
        # GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key

        # (Tùy chọn / 任意) Cấu hình lưu trữ log chat trên AWS（AWSへのチャットログ保存設定）
        # AWS_REGION=us-east-1
        # AWS_S3_BUCKET=your-s3-bucket-name
        # AWS_DDB_TABLE=your-dynamodb-table-name
        ```
    *   **Lưu ý（注意）:** `GOOGLE_GEMINI_API_KEY` là tùy chọn. Nếu được cung cấp, hệ thống sẽ tự động dùng Gemini khi không thể kết nối với Ollama.（`GOOGLE_GEMINI_API_KEY` は任意項目です。設定した場合、Ollamaへの接続に失敗した際にGeminiが自動的に使用されます。）

#### c. Frontend（フロントエンド設定）

1.  **Tạo file cấu hình `.env` cho Frontend（フロントエンド用 `.env` ファイルの作成）:**
    *   Di chuyển đến thư mục `frontend`（`frontend` フォルダに移動）.
    *   Tạo một file mới tên là `.env`（`.env` ファイルを新規作成）.
    *   Thêm nội dung sau để khai báo địa chỉ của AI Server（AIサーバーのアドレスを指定）:
        ```env
        VITE_AI_SERVER_URL=http://localhost:5000
        ```

#### d. Mobile（モバイル設定）

1.  **Cấu hình kết nối Backend（バックエンド接続設定）:**
    *   Di chuyển đến thư mục `mobile/src/config`（`mobile/src/config` フォルダに移動）.
    *   Mở file `api.ts`（`api.ts` ファイルを開く）.
    *   Tìm dòng `const LOCAL_IP = '192.168.1.235';` và thay đổi IP thành địa chỉ IP của máy tính bạn.（`const LOCAL_IP = '192.168.1.235';` の行を自分のPCのIPアドレスに変更してください。）
    *   **Lưu ý（注意）:**
        - Để tìm IP của máy tính, chạy lệnh `ipconfig` (Windows) hoặc `ifconfig` (macOS/Linux).（PCのIPアドレスは `ipconfig`（Windows）または `ifconfig`（macOS/Linux）で確認できます。）
        - Nếu sử dụng Android Emulator, có thể sử dụng `10.0.2.2` thay vì IP thực.（Androidエミュレータの場合は `10.0.2.2` を使用可能。）
        - Nếu sử dụng iOS Simulator trên Mac, có thể sử dụng `localhost`.（MacのiOSシミュレータの場合は `localhost` を使用可能。）
        - Thiết bị mobile và máy tính phải cùng một mạng Wi-Fi để kết nối được.（モバイルデバイスとPCは同一Wi-Fiネットワーク上にある必要があります。）
    *   Xem thêm hướng dẫn chi tiết trong file `mobile/CONNECTION_GUIDE.md`.（詳細は `mobile/CONNECTION_GUIDE.md` を参照してください。）

### 3. Cài đặt và Chạy（インストールと起動）

Bạn cần mở **4 cửa sổ terminal** riêng biệt, mỗi cửa sổ cho một thành phần của hệ thống.

システムの各コンポーネントに対して、**4つのターミナルウィンドウ**を個別に開いて実行します。

#### Terminal 1: Chạy Backend（バックエンド起動）

```bash
# Di chuyển đến thư mục backend（backendフォルダに移動）
cd backend/api

# Chạy ứng dụng Spring Boot（Spring Bootアプリを起動）
./mvnw spring-boot:run
```
> Backend sẽ khởi động và chạy tại `http://localhost:8080`.
> （バックエンドが起動し、`http://localhost:8080` で動作します。）

---

#### Terminal 2: Chạy Frontend（フロントエンド起動）

```bash
# Di chuyển đến thư mục frontend（frontendフォルダに移動）
cd frontend

# Cài đặt các thư viện cần thiết（依存関係のインストール）
npm install
npm install @mui/lab

# Khởi động server phát triển（開発サーバーの起動）
npm run dev
```
> Frontend sẽ khởi động và chạy tại `http://localhost:5173`. Mở địa chỉ này trên trình duyệt để sử dụng.
> （フロントエンドが起動し、`http://localhost:5173` で動作します。ブラウザでこのURLを開いてください。）

---

#### Terminal 3: Chạy AI Server（AIサーバー起動）

```bash
# Di chuyển đến thư mục ai-server（ai-serverフォルダに移動）
cd ai-server

# Tạo và kích hoạt môi trường ảo Python（Python仮想環境の作成と有効化）
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Cài đặt các thư viện Python（Pythonパッケージのインストール）
pip install -r requirements.txt

# Cài đặt Ollama và tải model（Ollamaのインストールとモデルのダウンロード）
# Truy cập https://ollama.com/ để cài đặt（https://ollama.com/ からインストール後）, sau đó chạy lệnh（以下を実行）:
ollama pull llama3.1

# Khởi động AI server（AIサーバーの起動）
python main.py
```
> AI Server sẽ khởi động và chạy tại `http://localhost:5000`.
> （AIサーバーが起動し、`http://localhost:5000` で動作します。）

---

#### Terminal 4: Chạy Mobile App（モバイルアプリ起動）

```bash
# Di chuyển đến thư mục mobile（mobileフォルダに移動）
cd mobile

# Cài đặt các thư viện cần thiết（依存関係のインストール — 初回のみ）
npm install

# Khởi động Expo development server（Expo開発サーバーの起動）
npm start
# hoặc / または
npx expo start

# Để xóa cache và khởi động lại（キャッシュをクリアして再起動する場合）
npx expo start --clear
```
> Expo sẽ khởi động và hiển thị QR code. Bạn có thể:
> （Expoサーバーが起動し、QRコードが表示されます。以下の方法で起動できます。）
> - Quét QR code bằng **Expo Go** app trên thiết bị di động (iOS/Android) để chạy app trên thiết bị thật.（**Expo Go** アプリでQRコードをスキャンすると実機で動作します。）
> - Nhấn `a` để mở trên Android Emulator (nếu đã cài đặt).（`a` キーでAndroidエミュレータで起動。）
> - Nhấn `i` để mở trên iOS Simulator (chỉ trên macOS).（`i` キーでiOSシミュレータで起動 — macOSのみ。）
> - Nhấn `w` để mở trên trình duyệt web.（`w` キーでブラウザで起動。）

**Lưu ý quan trọng（重要事項）:**
- Đảm bảo Backend đang chạy trước khi sử dụng Mobile app.（モバイルアプリを使用する前に、バックエンドが起動していることを確認してください。）
- Nếu gặp lỗi "Network Error", hãy kiểm tra lại cấu hình IP trong `mobile/src/config/api.ts` và đảm bảo thiết bị mobile cùng mạng Wi-Fi với máy tính chạy Backend.（「Network Error」が発生した場合は、`mobile/src/config/api.ts` のIP設定を確認し、モバイルデバイスとバックエンドが同一Wi-Fi上にあることを確認してください。）
- Xem thêm hướng dẫn kết nối trong file `mobile/CONNECTION_GUIDE.md`.（詳細な接続ガイドは `mobile/CONNECTION_GUIDE.md` を参照してください。）

### 4. Truy cập ứng dụng（アプリへのアクセス）

- **Web Frontend:** Mở trình duyệt và truy cập `http://localhost:5173`. Chatbot AI sẽ xuất hiện ở góc dưới bên phải màn hình.
  （ブラウザで `http://localhost:5173` にアクセスしてください。AIチャットボットは画面右下に表示されます。）
- **Mobile App:** Sử dụng Expo Go app để quét QR code hoặc mở trên emulator/simulator như hướng dẫn ở Terminal 4.
  （Expo Goアプリでターミナル4に表示されたQRコードをスキャンするか、エミュレータ/シミュレータで起動してください。）

---

## Các chức năng chính（主な機能）

*   Quản lý thông tin Hộ khẩu (Thêm, Sửa, Xóa, Tách hộ).（世帯情報の管理 — 追加・編集・削除・世帯分離。）
*   Quản lý thông tin Nhân khẩu.（住民情報の管理。）
*   Quản lý các khoản thu phí, đóng góp.（各種費用・会費の徴収管理。）
*   Thống kê, báo cáo.（統計・レポート出力。）
*   Phân quyền người dùng (Tổ trưởng/Phó, Kế toán).（ユーザー権限管理 — 班長・副班長・会計担当。）
*   **AI Chatbot Assistant** - Trợ giúp người dùng tìm hiểu về hệ thống.（**AIチャットボットアシスタント** — システムに関する自然言語での問い合わせ対応。）
