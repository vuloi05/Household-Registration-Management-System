# HƯỚNG DẪN TEST MOBILE APP

## ✅ Đã cập nhật

Mobile app giờ là dành cho **người dân** (không phải admin):

- Đăng nhập bằng **số CCCD** thay vì username
- Tất cả mật khẩu: **123456**

## 📱 Tài khoản test

Bạn có thể đăng nhập với bất kỳ số CCCD nào sau đây:

| CCCD | Tên | Vai trò trong hộ |
|------|-----|------------------|
| 012345678901 | Nguyễn Văn An | Chủ hộ |
| 012345678902 | Trần Thị Bích | Vợ |
| 111222333444 | Trần Văn Cường | Chủ hộ |
| 111222333666 | Trần Gia Bảo | Con |
| 999888777666 | Phạm Thị Mai | Chủ hộ |
| 999888777555 | Lê Minh Tuấn | Chồng |
| 456789012345 | Lê Văn Đức | Chủ hộ |
| 456789012346 | Nguyễn Thị Lan | Vợ |
| 789012345678 | Nguyễn Thanh Hùng | Chủ hộ |
| 789012345679 | Hoàng Thị Mai | Vợ |

**Mật khẩu cho tất cả:** `123456`

## 🔑 Cách đăng nhập

1. Mở mobile app
2. Nhập **số CCCD** (ví dụ: `012345678901`)
3. Nhập **mật khẩu**: `123456`
4. Nhấn "Đăng nhập"

Sau khi đăng nhập thành công, bạn sẽ vào màn hình tra cứu.

## 🔍 Tra cứu thông tin

Trong màn hình tra cứu, nhập **bất kỳ số CCCD** nào (không cần phải của chính bạn) để xem thông tin hộ khẩu của người đó.

Ví dụ:
- Nhập `012345678901` → Xem hộ khẩu HK001
- Nhập `456789012345` → Xem hộ khẩu HK004 (4 thành viên)
- Nhập `789012345678` → Xem hộ khẩu HK005 (3 thành viên)

## 📋 Dữ liệu mẫu đã thêm

### Hộ khẩu 4: Gia đình ông Lê Văn Đức
- **Mã hộ khẩu:** HK004
- **Địa chỉ:** Số 15, Phố Hà Tây, Phường La Khê
- **4 thành viên:**
  - Lê Văn Đức (Chủ hộ) - CCCD: **456789012345** - Bác sĩ
  - Nguyễn Thị Lan (Vợ) - CCCD: **456789012346** - Y tá
  - Lê Quang Minh (Con) - CCCD: (chưa có) - Học sinh
  - Lê Thị Linh (Con) - CCCD: (chưa có) - Học sinh

### Hộ khẩu 5: Gia đình ông Nguyễn Thanh Hùng
- **Mã hộ khẩu:** HK005
- **Địa chỉ:** Số 8, Tổ dân phố 12, Phường La Khê
- **3 thành viên:**
  - Nguyễn Thanh Hùng (Chủ hộ) - CCCD: **789012345678** - Kỹ sư xây dựng
  - Hoàng Thị Mai (Vợ) - CCCD: **789012345679** - Giáo viên mầm non
  - Nguyễn Huy Thành (Con) - CCCD: (chưa có) - Học sinh

## 🧪 Test nhanh

### Test 1: Đăng nhập
```
CCCD: 012345678901
Password: 123456
```
→ Đăng nhập thành công

### Test 2: Tra cứu hộ khẩu
Đăng nhập → Nhập CCCD: `456789012345` → Xem thông tin hộ khẩu HK004 với 4 thành viên

### Test 3: Tra cứu hộ khẩu khác
Trong màn hình tra cứu, nhập CCCD: `789012345678` → Xem thông tin hộ khẩu HK005

## 🚀 Chạy ứng dụng

```bash
# Backend
cd backend/api
mvn spring-boot:run

# Mobile (terminal khác)
cd mobile
npm start
```

Sau đó chọn `a` cho Android hoặc quét QR code bằng Expo Go.

## ⚙️ Thay đổi so với bản cũ

### Trước đây (Admin app):
- Đăng nhập: Username + Password
- Username: `admin`, `ketoan`
- Dùng cho người quản lý

### Bây giờ (Citizen app):
- Đăng nhập: **CCCD** + Password
- Password: `123456` cho tất cả
- Dùng cho người dân

## 🔐 API mới

### Mobile Login
```
POST /api/mobile/auth/login
Body: {
  "cccd": "012345678901",
  "password": "123456"
}
```

### Mobile Household Info
```
GET /api/mobile/household?cmndCccd=012345678901
```

Cả hai API đều **công khai** (không cần authentication).

## ✅ Hoàn thành

- ✅ Thêm trường `password` vào entity `NhanKhau`
- ✅ Thêm trường `password` vào schema SQL
- ✅ Thêm password cho tất cả dữ liệu mẫu
- ✅ Tạo API đăng nhập mới cho mobile (`/api/mobile/auth/login`)
- ✅ Cập nhật mobile app để đăng nhập bằng CCCD
- ✅ Thêm thêm 2 hộ khẩu mới (HK004, HK005) với nhiều thành viên hơn
- ✅ Cập nhật tài khoản test trong database

