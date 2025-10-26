# DEBUG MOBILE APP LOGIN

## Vấn đề: Đăng nhập thất bại

### Nguyên nhân có thể:

1. **Backend chưa chạy**
2. **API endpoint không đúng**
3. **Dữ liệu trong database chưa có**
4. **Network connection issue**

## Cách debug:

### 1. Kiểm tra Backend

```bash
cd backend/api
mvn spring-boot:run
```

Backend phải chạy tại: `http://localhost:8080`

### 2. Test API bằng curl

```bash
curl -X POST http://localhost:8080/api/mobile/auth/login -H "Content-Type: application/json" -d "{""cccd"":""012345678901"",""password"":""123456""}"
```

Kết quả mong đợi:
```json
{
  "data": {
    "quanHeVoiChuHo": "Chủ hộ",
    "hoTen": "Nguyễn Văn An",
    "cmndCccd": "012345678901",
    "ngaySinh": "1980-05-20"
  },
  "success": true,
  "message": "Đăng nhập thành công"
}
```

### 3. Kiểm tra Database

Backend sẽ tự động tạo database và insert dữ liệu mẫu khi khởi động.

Kiểm tra trong database:
```sql
SELECT cmnd_cccd, password FROM nhan_khau WHERE cmnd_cccd = '012345678901';
```

### 4. Test Mobile App

1. Mở mobile app
2. Nhập CCCD: `012345678901`
3. Nhập Password: `123456`
4. Nhấn "Đăng nhập"

### 5. Xem Console Log

Trong mobile app, mở Developer Tools để xem console log:
- Metro bundler sẽ hiển thị log
- Hoặc dùng React Native Debugger

### 6. Debug Code đã thêm

File `mobile/src/api/debugApi.ts` có function test API trực tiếp.

File `mobile/src/screens/LoginScreen.tsx` đã thêm debug log.

## Tài khoản test:

| CCCD | Password | Tên |
|------|----------|-----|
| 012345678901 | 123456 | Nguyễn Văn An |
| 456789012345 | 123456 | Lê Văn Đức |
| 789012345678 | 123456 | Nguyễn Thanh Hùng |

## Troubleshooting:

### Lỗi "Network Error"
- Kiểm tra backend có chạy không
- Kiểm tra IP address trong mobile app code
- Đảm bảo cùng mạng WiFi

### Lỗi "Không tìm thấy người dùng"
- Kiểm tra CCCD có đúng không
- Kiểm tra database có dữ liệu không

### Lỗi "Mật khẩu không đúng"
- Kiểm tra password có đúng `123456` không
- Kiểm tra database có lưu password đúng không

## Quick Fix:

1. Restart backend: `mvn spring-boot:run`
2. Clear mobile cache: `npm start -- --clear`
3. Test với CCCD: `012345678901`, Password: `123456`

