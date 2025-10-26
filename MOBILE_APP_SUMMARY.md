# Mobile App Summary

## Tổng quan

Đã tạo thành công ứng dụng di động React Native để người dân tra cứu thông tin hộ khẩu và nhân khẩu.

## Cấu trúc dự án

```
mobile/
├── src/
│   ├── api/                      # API calls
│   │   ├── authApi.ts            # Authentication API
│   │   └── householdApi.ts       # Household data API
│   ├── context/
│   │   └── AuthContext.tsx       # Auth context provider
│   ├── screens/
│   │   ├── LoginScreen.tsx       # Màn hình đăng nhập
│   │   └── HouseholdInfoScreen.tsx # Màn hình tra cứu hộ khẩu
│   └── types/
│       └── household.ts          # TypeScript types
├── App.tsx                       # Main app component
├── package.json
├── README.md                      # Hướng dẫn cơ bản
└── HUONG_DAN.md                  # Hướng dẫn chi tiết tiếng Việt
```

## Backend Changes

### 1. MobileController.java

File mới: `backend/api/src/main/java/com/quanlynhankhau/api/controller/MobileController.java`

Controller mới cung cấp API công khai cho mobile app:

- `GET /api/mobile/household?cmndCccd={cccd}` - Lấy thông tin hộ khẩu
- `GET /api/mobile/person?cmndCccd={cccd}` - Lấy thông tin nhân khẩu

### 2. SecurityConfig.java

File đã cập nhật: `backend/api/src/main/java/com/quanlynhankhau/api/config/SecurityConfig.java`

Thêm quyền truy cập công khai cho `/api/mobile/**` để mobile app có thể gọi API mà không cần authentication.

## Tính năng

### 1. Đăng nhập
- Yêu cầu username và password
- Token được lưu trữ trong AsyncStorage
- Token tự động gửi trong header cho các API yêu cầu auth

### 2. Tra cứu hộ khẩu
- Nhập số CCCD để tìm kiếm
- Hiển thị thông tin:
  - Mã hộ khẩu
  - Địa chỉ
  - Ngày lập hộ khẩu
  - Thông tin chủ hộ
  - Danh sách tất cả nhân khẩu trong hộ

### 3. Đăng xuất
- Xóa token khỏi local storage
- Quay về màn hình đăng nhập

## Cài đặt

### Dependencies đã cài đặt
- `@react-native-async-storage/async-storage` - Lưu trữ local
- `@react-navigation/native` - Navigation
- `@react-navigation/native-stack` - Stack navigation
- `axios` - HTTP client
- `expo` - Expo framework
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screens

### Cách chạy

```bash
cd mobile
npm install
npm start
```

Sau đó chọn `a` cho Android hoặc `i` cho iOS.

## Cấu hình

### API Base URL

Chỉnh sửa trong file:
- `src/api/authApi.ts` - Dòng 4
- `src/api/householdApi.ts` - Dòng 5

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

**Lưu ý:** Khi test trên thiết bị thật, thay `localhost` bằng IP của máy backend.

## Cách sử dụng

1. **Khởi động backend**: `cd backend/api && mvn spring-boot:run`
2. **Khởi động mobile**: `cd mobile && npm start`
3. **Đăng nhập** với tài khoản có sẵn
4. **Tra cứu** thông tin hộ khẩu bằng số CCCD

## API Endpoints

### Public APIs (không cần authentication)

#### 1. Get Household Info
```
GET /api/mobile/household?cmndCccd={cccd}
```

Response:
```json
{
  "id": 1,
  "maHoKhau": "HK001",
  "diaChi": "123 Đường ABC",
  "ngayLap": "2024-01-01",
  "chuHo": {
    "id": 1,
    "hoTen": "Nguyễn Văn A",
    "ngaySinh": "1980-01-01",
    "cmndCccd": "123456789012",
    "quanHeVoiChuHo": "Chủ hộ"
  },
  "danhSachNhanKhau": [
    {
      "id": 1,
      "hoTen": "Nguyễn Văn A",
      "ngaySinh": "1980-01-01",
      "cmndCccd": "123456789012",
      "quanHeVoiChuHo": "Chủ hộ"
    }
  ]
}
```

#### 2. Get Person Info
```
GET /api/mobile/person?cmndCccd={cccd}
```

### Protected APIs (cần authentication)

Đăng nhập qua web app hoặc dùng API `POST /api/auth/login` để lấy token.

## Next Steps

### 1. Cải thiện UX
- Thêm loading states chi tiết hơn
- Thêm pull-to-refresh
- Thêm error handling tốt hơn
- Thêm skeleton loading

### 2. Thêm tính năng
- Lịch sử tra cứu
- Lưu thông tin yêu thích
- Export thông tin ra PDF
- Push notifications

### 3. Bảo mật
- Thêm rate limiting cho API public
- Thêm validation cho CCCD input
- Encrypt local storage data

### 4. Performance
- Add caching cho API calls
- Optimize image loading
- Add pagination cho list lớn

### 5. Testing
- Unit tests cho components
- Integration tests cho API calls
- E2E tests cho user flows

## Troubleshooting

### Không kết nối được API
- Kiểm tra backend đang chạy
- Kiểm tra IP address trong code
- Đảm bảo thiết bị và backend cùng mạng

### Ứng dụng crash
- Xóa cache: `npm start -- --clear`
- Xóa node_modules và cài lại: `rm -rf node_modules && npm install`

### Build error
- Đảm bảo đã cài đặt dependencies: `npm install`
- Kiểm tra version Node.js phù hợp: `node --version`

## Documentation

- [Mobile App README](./mobile/README.md) - English
- [Hướng dẫn Mobile App](./mobile/HUONG_DAN.md) - Tiếng Việt

