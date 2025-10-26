# HƯỚNG DẪN NHANH - MOBILE APP

## Bước 1: Khởi động Backend

```bash
cd backend/api
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

## Bước 2: Khởi động Mobile App

```bash
cd mobile
npm install
npm start
```

## Bước 3: Chạy trên thiết bị

### Option 1: Expo Go (Nhanh nhất)
1. Cài đặt **Expo Go** từ App Store (iOS) hoặc Google Play (Android)
2. Quét mã QR code hiển thị trong terminal

### Option 2: Emulator
- Nhấn `a` cho Android emulator
- Nhấn `i` cho iOS simulator (chỉ Mac)

## Bước 4: Sử dụng

1. **Đăng nhập** với tài khoản có sẵn
2. Nhập **số CCCD** để tra cứu thông tin hộ khẩu
3. Xem thông tin hiển thị:
   - Mã hộ khẩu
   - Địa chỉ
   - Ngày lập
   - Thông tin chủ hộ
   - Danh sách nhân khẩu

## Quan trọng

### Cấu hình IP cho thiết bị thật

Nếu test trên thiết bị thật (không phải emulator):

1. Tìm IP của máy chạy backend:
   - Windows: `ipconfig` → tìm IPv4 Address
   - Mac/Linux: `ifconfig` → tìm inet

2. Sửa trong file `mobile/src/api/householdApi.ts` và `mobile/src/api/authApi.ts`:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:8080/api'; // Thay bằng IP thực
   ```

3. Đảm bảo máy backend và điện thoại cùng mạng WiFi

## Troubleshooting

### Backend không chạy
```bash
cd backend/api
mvn clean install
mvn spring-boot:run
```

### Mobile app không kết nối được
- Kiểm tra backend đang chạy: mở `http://localhost:8080/api/mobile/household?cmndCccd=123` trong browser
- Kiểm tra IP trong code
- Kiểm tra cùng mạng WiFi

### Clear cache
```bash
npm start -- --clear
```

## Cấu trúc Files

```
mobile/
├── src/
│   ├── api/              # API calls
│   ├── context/          # Auth context
│   ├── screens/          # UI screens
│   └── types/            # TypeScript types
├── App.tsx               # Main app
└── README.md             # Documentation
```

## API Endpoints

### Backend (mới thêm)
- `GET /api/mobile/household?cmndCccd={cccd}` - Lấy thông tin hộ khẩu
- `GET /api/mobile/person?cmndCccd{cccd}` - Lấy thông tin nhân khẩu

Các API này **công khai** (không cần authentication).

## Tài liệu đầy đủ

- Xem [README.md](./mobile/README.md) cho hướng dẫn chi tiết
- Xem [HUONG_DAN.md](./mobile/HUONG_DAN.md) cho hướng dẫn tiếng Việt
- Xem [MOBILE_APP_SUMMARY.md](./MOBILE_APP_SUMMARY.md) cho tóm tắt toàn bộ

