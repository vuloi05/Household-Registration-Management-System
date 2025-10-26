# Mobile App - Hệ thống quản lý hộ khẩu

Ứng dụng di động React Native cho phép người dân xem thông tin hộ khẩu và nhân khẩu của mình.

## Tính năng

- Đăng nhập với tài khoản người dùng
- Tìm kiếm thông tin hộ khẩu theo số CCCD
- Xem chi tiết thông tin hộ khẩu
- Xem danh sách nhân khẩu trong hộ
- Xem thông tin chủ hộ

## Cài đặt

### Yêu cầu

- Node.js (phiên bản 18 trở lên)
- Expo CLI
- Android Studio (cho Android)
- Xcode (cho iOS, chỉ trên macOS)

### Cài đặt dependencies

```bash
cd mobile
npm install
```

## Chạy ứng dụng

### Phát triển

```bash
# Khởi động Expo
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS (chỉ trên macOS)
npm run ios

# Chạy trên web
npm run web
```

### Sử dụng Expo Go

1. Cài đặt ứng dụng **Expo Go** từ App Store (iOS) hoặc Google Play (Android)
2. Chạy `npm start`
3. Quét mã QR code bằng Expo Go

## Cấu hình

### Cấu hình API endpoint

Chỉnh sửa file `src/api/householdApi.ts` và `src/api/authApi.ts` để thay đổi `API_BASE_URL`:

```typescript
const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';
```

**Lưu ý:**
- Khi chạy trên thiết bị thật (không phải emulator), thay `localhost` bằng địa chỉ IP của máy chạy backend
- Ví dụ: `http://192.168.1.100:8080/api`

## Cấu trúc thư mục

```
mobile/
├── src/
│   ├── api/           # API service layer
│   ├── context/       # React context (AuthContext)
│   ├── screens/       # Các màn hình
│   └── types/         # TypeScript type definitions
├── App.tsx           # Main app component
└── package.json
```

## Sử dụng

1. **Đăng nhập**: Nhập username và password để đăng nhập
2. **Tìm kiếm**: Nhập số CCCD để tìm thông tin hộ khẩu
3. **Xem thông tin**: 
   - Thông tin hộ khẩu (mã, địa chỉ, ngày lập)
   - Thông tin chủ hộ
   - Danh sách nhân khẩu trong hộ
4. **Đăng xuất**: Nhấn nút "Đăng xuất" ở góc phải trên cùng

## Xây dựng APK/IPA

### Android (APK)

```bash
eas build --platform android
```

### iOS (IPA)

```bash
eas build --platform ios
```

**Lưu ý:** Cần cài đặt EAS CLI và đăng ký tài khoản Expo:

```bash
npm install -g eas-cli
eas login
```

## Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)
