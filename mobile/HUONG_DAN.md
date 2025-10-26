# Hướng dẫn sử dụng Mobile App

## Tổng quan

Ứng dụng di động React Native cho phép người dân tra cứu thông tin hộ khẩu và nhân khẩu của mình thông qua số CCCD.

## Tính năng chính

1. **Đăng nhập**: Người dân cần đăng nhập bằng tài khoản (tài khoản được cấp bởi admin)
2. **Tra cứu hộ khẩu**: Nhập số CCCD để xem thông tin hộ khẩu
3. **Xem thông tin chi tiết**:
   - Thông tin hộ khẩu (mã, địa chỉ, ngày lập)
   - Thông tin chủ hộ
   - Danh sách tất cả nhân khẩu trong hộ
4. **Đăng xuất**: Thoát khỏi ứng dụng

## Cài đặt và chạy ứng dụng

### Yêu cầu hệ thống

- Node.js 18+
- Expo CLI (được cài tự động với npm install)
- Android Studio (để chạy Android emulator)
- Xcode (để chạy iOS, chỉ trên macOS)

### Cài đặt dependencies

```bash
cd mobile
npm install
```

### Chạy ứng dụng

#### Trên emulator/Simulator

```bash
# Khởi động Expo development server
npm start

# Sau đó chọn:
# - a: để chạy trên Android emulator
# - i: để chạy trên iOS simulator (chỉ trên macOS)
# - w: để chạy trên web browser
```

#### Trên thiết bị thật với Expo Go

1. Cài đặt ứng dụng **Expo Go** từ App Store hoặc Google Play
2. Chạy `npm start`
3. Quét mã QR code bằng Expo Go
4. Ứng dụng sẽ tải xuống và chạy trên điện thoại

### Cấu hình API

Chỉnh sửa file `src/api/householdApi.ts` và `src/api/authApi.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

**Quan trọng khi test trên thiết bị thật:**

1. Tìm địa chỉ IP của máy chạy backend:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. Thay `localhost` bằng IP thực (ví dụ: `http://192.168.1.100:8080/api`)

3. Đảm bảo máy backend và thiết bị mobile cùng mạng WiFi

## Quy trình sử dụng

### Bước 1: Đăng nhập

1. Mở ứng dụng
2. Nhập username và password
3. Nhấn "Đăng nhập"

### Bước 2: Tra cứu thông tin hộ khẩu

1. Nhập số CCCD (CMND/CCCD) của bất kỳ thành viên nào trong hộ
2. Nhấn "Tìm kiếm"
3. Ứng dụng hiển thị:
   - Mã hộ khẩu
   - Địa chỉ
   - Ngày lập hộ khẩu
   - Thông tin chủ hộ
   - Danh sách tất cả nhân khẩu trong hộ

### Bước 3: Đăng xuất

Nhấn nút "Đăng xuất" ở góc phải trên cùng

## Kiến trúc ứng dụng

```
mobile/
├── src/
│   ├── api/                    # API calls
│   │   ├── authApi.ts          # Authentication API
│   │   └── householdApi.ts     # Household data API
│   ├── context/
│   │   └── AuthContext.tsx     # Auth context provider
│   ├── screens/
│   │   ├── LoginScreen.tsx     # Màn hình đăng nhập
│   │   └── HouseholdInfoScreen.tsx  # Màn hình tra cứu
│   └── types/
│       └── household.ts        # TypeScript types
├── App.tsx                      # Main app component
└── package.json
```

## API Backend

Backend cung cấp các API công khai cho mobile app:

### 1. Lấy thông tin hộ khẩu

**Endpoint:** `GET /api/mobile/household?cmndCccd={cccd}`

**Response:**
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
    },
    {
      "id": 2,
      "hoTen": "Nguyễn Thị B",
      "ngaySinh": "1985-05-15",
      "cmndCccd": "123456789013",
      "quanHeVoiChuHo": "Vợ/Chồng"
    }
  ]
}
```

### 2. Lấy thông tin nhân khẩu

**Endpoint:** `GET /api/mobile/person?cmndCccd={cccd}`

## Xây dựng APK/IPA (Production)

### Yêu cầu

1. Cài đặt EAS CLI:
```bash
npm install -g eas-cli
```

2. Đăng ký tài khoản Expo:
```bash
eas login
```

3. Cấu hình dự án:
```bash
eas build:configure
```

### Build Android APK

```bash
eas build --platform android
```

### Build iOS IPA

```bash
eas build --platform ios
```

**Lưu ý:** Build iOS chỉ có thể thực hiện trên macOS với Apple Developer account.

## Khắc phục sự cố

### Lỗi kết nối API

1. Kiểm tra backend đang chạy: `http://localhost:8080`
2. Kiểm tra địa chỉ IP trong code
3. Đảm bảo thiết bị và backend cùng mạng

### Lỗi không tìm thấy hộ khẩu

1. Kiểm tra số CCCD có đúng không
2. Kiểm tra dữ liệu trong database
3. Xem log backend để biết lỗi chi tiết

### Ứng dụng không khởi động

1. Xóa cache: `npm start -- --clear`
2. Xóa node_modules và cài lại: `rm -rf node_modules && npm install`

## Bảo mật

- API mobile cho phép công khai tra cứu thông tin hộ khẩu
- Đăng nhập vẫn cần username/password hợp lệ
- Dữ liệu chỉ hiển thị, không thể chỉnh sửa qua mobile app
- Chỉ có admin mới có thể thêm/sửa/xóa dữ liệu từ web app

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log trong terminal
2. Kiểm tra log backend
3. Xem file README.md trong root project

