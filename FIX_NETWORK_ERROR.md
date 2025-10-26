# FIX: Network Error trong Mobile App

## Vấn đề
Mobile app báo "Network Error" khi đăng nhập.

## Nguyên nhân
Khi chạy trên Android emulator, `localhost` không trỏ đến máy host. Cần dùng IP thực của máy.

## Giải pháp

### 1. Tìm IP của máy
```bash
ipconfig | findstr "IPv4"
```

Kết quả ví dụ:
```
IPv4 Address. . . . . . . . . . . : 192.168.0.101
```

### 2. Cập nhật API Base URL

Đã cập nhật các file sau:
- `mobile/src/api/authApi.ts`
- `mobile/src/api/householdApi.ts` 
- `mobile/src/api/debugApi.ts`

Thay đổi từ:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

Thành:
```typescript
const API_BASE_URL = 'http://192.168.0.101:8080/api';
```

### 3. Test API với IP mới
```bash
curl -X POST http://192.168.0.101:8080/api/mobile/auth/login -H "Content-Type: application/json" -d "{""cccd"":""012345678901"",""password"":""123456""}"
```

### 4. Restart Mobile App
```bash
cd mobile
npm start -- --clear
```

## Lưu ý

### Khi test trên thiết bị thật
- Đảm bảo máy và điện thoại cùng mạng WiFi
- Dùng IP của máy (không phải localhost)

### Khi test trên emulator
- Android emulator: dùng IP máy host
- iOS simulator: có thể dùng localhost

### Khi deploy production
- Thay IP bằng domain thực
- Ví dụ: `https://your-domain.com/api`

## Test lại

1. Restart mobile app
2. Nhập CCCD: `012345678901`
3. Nhập Password: `123456`
4. Nhấn "Đăng nhập"

Bây giờ sẽ đăng nhập thành công!

