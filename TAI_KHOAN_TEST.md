# Tài khoản test

## Tài khoản đăng nhập Mobile App

Có 2 tài khoản có sẵn trong database:

### 1. Tài khoản Admin
- **Username:** `admin`
- **Password:** `123456`
- **Role:** ROLE_ADMIN

### 2. Tài khoản Kế toán
- **Username:** `ketoan`
- **Password:** `123456`
- **Role:** ROLE_ACCOUNTANT

## Dữ liệu mẫu để tra cứu

Trong database đã có 3 hộ khẩu mẫu với các số CCCD sau:

### Hộ khẩu 1: Gia đình ông Nguyễn Văn An
- **Mã hộ khẩu:** HK001
- **Địa chỉ:** Số 1, Ngõ ABC, Phường La Khê
- **Thành viên:**
  - Nguyễn Văn An (Chủ hộ) - CCCD: **012345678901**
  - Trần Thị Bích (Vợ) - CCCD: **012345678902**
  - Nguyễn Hoàng Minh (Con) - Chưa có CCCD

### Hộ khẩu 2: Gia đình ông Trần Văn Cường
- **Mã hộ khẩu:** HK002
- **Địa chỉ:** Số 25, Đường XYZ, Phường La Khê
- **Thành viên:**
  - Trần Văn Cường (Chủ hộ) - CCCD: **111222333444**
  - Trần Gia Bảo (Con) - CCCD: **111222333666**

### Hộ khẩu 3: Gia đình bà Phạm Thị Mai
- **Mã hộ khẩu:** HK003
- **Địa chỉ:** Số 10, Ngõ Tự Do, Phường La Khê
- **Thành viên:**
  - Phạm Thị Mai (Chủ hộ) - CCCD: **999888777666**
  - Lê Minh Tuấn (Chồng) - CCCD: **999888777555**

## Cách test

### 1. Đăng nhập Mobile App
- Dùng username: `admin` hoặc `ketoan`
- Password: `123456`

### 2. Tra cứu hộ khẩu
Nhập một trong các số CCCD sau vào màn hình tìm kiếm:
- `012345678901` - Gia đình Nguyễn Văn An
- `012345678902` - Gia đình Nguyễn Văn An (vợ)
- `111222333444` - Gia đình Trần Văn Cường
- `111222333666` - Gia đình Trần Văn Cường (con)
- `999888777666` - Gia đình Phạm Thị Mai
- `999888777555` - Gia đình Phạm Thị Mai (chồng)

Bất kỳ số CCCD nào trên sẽ hiển thị thông tin của hộ khẩu tương ứng.

## Tạo tài khoản mới

Nếu muốn tạo tài khoản mới, có thể:

1. **Qua Backend API:**
```bash
# Encode password
curl http://localhost:8080/api/auth/encode/123456

# Sau đó insert vào database
INSERT INTO users(username, password, full_name, role) 
VALUES('username', 'encoded_password', 'Tên đầy đủ', 'ROLE_ADMIN');
```

2. **Hoặc tạo endpoint mới** để register từ web/mobile app

## Lưu ý

- Tất cả các mật khẩu mẫu đều là: `123456`
- Mật khẩu được hash bằng BCrypt
- Mobile app API công khai không cần authentication để tra cứu

