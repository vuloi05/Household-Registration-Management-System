# Security Policy

## 🔒 Chính sách Bảo mật

Chúng tôi coi trọng bảo mật của hệ thống Quản lý Nhân khẩu. Tài liệu này mô tả các biện pháp bảo mật đã được triển khai và cách báo cáo các lỗ hổng bảo mật.

## 📋 Mục lục

- [Báo cáo lỗ hổng bảo mật](#báo-cáo-lỗ-hổng-bảo-mật)
- [Biện pháp bảo mật đã triển khai](#biện-pháp-bảo-mật-đã-triển-khai)
- [Best Practices cho Developers](#best-practices-cho-developers)
- [Quản lý thông tin nhạy cảm](#quản-lý-thông-tin-nhạy-cảm)
- [Cập nhật bảo mật](#cập-nhật-bảo-mật)

---

## 🚨 Báo cáo lỗ hổng bảo mật

Nếu bạn phát hiện một lỗ hổng bảo mật, **vui lòng không** tạo một issue công khai. Thay vào đó:

1. **Gửi email báo cáo** đến nhóm phát triển với tiêu đề `[SECURITY] Mô tả ngắn gọn về lỗ hổng`
2. **Mô tả chi tiết** về lỗ hổng, bao gồm:
   - Mô tả về lỗ hổng
   - Các bước để tái hiện lỗ hổng
   - Tác động tiềm ẩn
   - Đề xuất giải pháp (nếu có)
3. **Chờ phản hồi** - Chúng tôi sẽ phản hồi trong vòng 48 giờ
4. **Không tiết lộ công khai** cho đến khi lỗ hổng đã được xử lý

### Các loại lỗ hổng được quan tâm

- Xác thực và phân quyền không đúng
- Lộ lọt thông tin nhạy cảm (credentials, tokens, API keys)
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Lỗ hổng trong xử lý dữ liệu đầu vào
- Lỗ hổng trong quản lý session
- Các lỗ hổng khác có thể ảnh hưởng đến tính bảo mật của hệ thống

---

## 🛡️ Biện pháp bảo mật đã triển khai

### Backend (Spring Boot)

#### 1. Xác thực và Phân quyền
- **JWT (JSON Web Tokens)** cho xác thực người dùng
- Phân quyền dựa trên vai trò (Role-Based Access Control):
  - Tổ trưởng/Phó tổ
  - Kế toán
  - Người dùng thường
- Bảo vệ các endpoint API bằng Spring Security

#### 2. Bảo mật dữ liệu
- **Mã hóa mật khẩu** bằng BCrypt
- Sử dụng **Prepared Statements** để chống SQL Injection
- Validation đầu vào bằng Bean Validation (JSR-303)
- CORS được cấu hình để chỉ cho phép các domain được phép

#### 3. Quản lý thông tin nhạy cảm
- Thông tin nhạy cảm được lưu trong file `.env` (không commit vào Git)
- Database credentials được quản lý qua biến môi trường
- JWT secret key được lưu trữ an toàn

### Frontend (React)

#### 1. Quản lý Token
- JWT tokens được lưu trong `localStorage` hoặc `sessionStorage`
- Tự động refresh token khi hết hạn
- Xóa token khi đăng xuất

#### 2. Bảo vệ Routes
- Protected routes yêu cầu xác thực
- Kiểm tra quyền truy cập trước khi hiển thị nội dung

#### 3. Xử lý dữ liệu đầu vào
- Validation form bằng Zod schema
- Sanitization dữ liệu đầu vào
- Xử lý lỗi an toàn, không tiết lộ thông tin nhạy cảm

### AI Server (Flask)

#### 1. Bảo mật API
- Rate limiting để chống DDoS
- Validation đầu vào cho các request
- Xử lý lỗi an toàn

#### 2. Quản lý API Keys
- Google Gemini API key được lưu trong `.env`
- Không expose API keys trong code hoặc logs

### Mobile App (React Native)

#### 1. Bảo mật kết nối
- Sử dụng HTTPS cho tất cả API calls
- Certificate pinning (nên được triển khai trong production)

#### 2. Lưu trữ dữ liệu
- Tokens được lưu trữ an toàn
- Không lưu mật khẩu dạng plain text

### Database (PostgreSQL)

- Kết nối database được mã hóa
- User database có quyền hạn giới hạn
- Backup dữ liệu định kỳ
- Không expose database ra internet công cộng

---

## 💡 Best Practices cho Developers

### 1. Quản lý thông tin nhạy cảm

✅ **LÀM:**
- Sử dụng biến môi trường (`.env`) cho tất cả thông tin nhạy cảm
- Thêm `.env` vào `.gitignore`
- Sử dụng `.env.example` để document các biến môi trường cần thiết
- Rotate keys và credentials định kỳ

❌ **KHÔNG LÀM:**
- Commit file `.env` vào Git
- Hardcode credentials trong code
- Log thông tin nhạy cảm (passwords, tokens, API keys)
- Chia sẻ credentials qua email hoặc chat không mã hóa

### 2. Xử lý dữ liệu đầu vào

✅ **LÀM:**
- Validate tất cả dữ liệu đầu vào từ phía client
- Sanitize dữ liệu trước khi lưu vào database
- Sử dụng parameterized queries (Prepared Statements)
- Giới hạn độ dài và kiểu dữ liệu đầu vào

❌ **KHÔNG LÀM:**
- Tin tưởng dữ liệu từ phía client
- Nối chuỗi SQL trực tiếp
- Cho phép HTML/JavaScript không được sanitize

### 3. Xác thực và Phân quyền

✅ **LÀM:**
- Luôn kiểm tra xác thực trên server-side
- Sử dụng JWT với thời gian hết hạn hợp lý
- Implement refresh token mechanism
- Kiểm tra quyền truy cập cho mỗi request

❌ **KHÔNG LÀM:**
- Chỉ dựa vào client-side validation
- Sử dụng JWT không có expiration
- Bỏ qua kiểm tra quyền truy cập

### 4. Logging và Monitoring

✅ **LÀM:**
- Log các sự kiện bảo mật quan trọng (đăng nhập, thay đổi quyền, v.v.)
- Monitor các hoạt động đáng ngờ
- Sử dụng log rotation để tránh đầy disk

❌ **KHÔNG LÀM:**
- Log thông tin nhạy cảm (passwords, tokens, PII)
- Log quá nhiều thông tin không cần thiết

### 5. Dependencies

✅ **LÀM:**
- Cập nhật dependencies thường xuyên
- Sử dụng `npm audit` và `mvn dependency-check` để kiểm tra lỗ hổng
- Xóa các dependencies không sử dụng

❌ **KHÔNG LÀM:**
- Sử dụng các package không được maintain
- Bỏ qua các cảnh báo bảo mật từ package managers

---

## 🔐 Quản lý thông tin nhạy cảm

### Các thông tin nhạy cảm cần được bảo vệ:

1. **Database Credentials**
   - `DB_PASSWORD` trong `backend/api/.env`
   - Không commit file này vào Git

2. **JWT Secret Key**
   - Secret key để ký JWT tokens
   - Nên là một chuỗi ngẫu nhiên dài và phức tạp

3. **API Keys**
   - `GOOGLE_GEMINI_API_KEY` trong `ai-server/.env`
   - Google Service Account credentials (JSON file)

4. **Google Sheets Credentials**
   - Service Account JSON file
   - `GOOGLE_APPLICATION_CREDENTIALS` hoặc `GOOGLE_CREDENTIALS_BASE64`

### Checklist khi triển khai:

- [ ] Tất cả file `.env` đã được thêm vào `.gitignore`
- [ ] Không có credentials nào được hardcode trong code
- [ ] Tất cả API keys đã được rotate sau khi commit nhầm
- [ ] Database không expose ra internet công cộng
- [ ] HTTPS được sử dụng trong production
- [ ] CORS được cấu hình đúng cách

---

## 🔄 Cập nhật bảo mật

### Cập nhật định kỳ

1. **Dependencies**: Kiểm tra và cập nhật hàng tháng
   ```bash
   # Frontend
   npm audit fix
   
   # Backend
   mvn versions:display-dependency-updates
   
   # AI Server
   pip list --outdated
   ```

2. **Security patches**: Áp dụng ngay khi có bản vá bảo mật

3. **Credentials rotation**: Rotate keys và passwords định kỳ (mỗi 3-6 tháng)

### Monitoring

- Monitor các failed login attempts
- Theo dõi các API calls bất thường
- Kiểm tra logs định kỳ để phát hiện hoạt động đáng ngờ

---

## 📚 Tài liệu tham khảo

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

---

## 📝 Lịch sử cập nhật

- **2024**: Tài liệu Security Policy được tạo

---

## ⚠️ Disclaimer

Tài liệu này được cung cấp như một hướng dẫn chung. Bảo mật là một quá trình liên tục và cần được đánh giá thường xuyên. Hãy luôn cập nhật kiến thức về bảo mật và áp dụng các best practices mới nhất.

---

**Lưu ý**: Nếu bạn phát hiện bất kỳ lỗ hổng bảo mật nào, vui lòng báo cáo ngay lập tức theo quy trình đã nêu ở trên.

