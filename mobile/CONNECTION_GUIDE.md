# Hướng dẫn kết nối Mobile App với Backend

## Vấn đề: Network Error khi đăng nhập

Nếu bạn gặp lỗi "Network Error" khi đăng nhập, hãy làm theo các bước sau:

## Bước 1: Kiểm tra IP máy tính

1. Mở PowerShell hoặc Command Prompt
2. Chạy lệnh: `ipconfig`
3. Tìm "IPv4 Address" (thường là 192.168.x.x)
4. Copy IP đó

## Bước 2: Cập nhật IP trong mobile app

1. Mở file: `mobile/src/config/api.ts`
2. Tìm dòng: `const LOCAL_IP = '192.168.1.235';`
3. Thay đổi IP thành IP của máy tính bạn (từ bước 1)

## Bước 3: Đảm bảo Backend đang chạy

1. Kiểm tra backend đã được khởi động chưa
2. Backend phải chạy trên port 8080
3. Kiểm tra bằng cách mở trình duyệt và truy cập: `http://localhost:8080/api/auth/encode/test`

## Bước 4: Kiểm tra cùng mạng Wi-Fi

- Thiết bị mobile (hoặc simulator) và máy tính phải cùng một mạng Wi-Fi
- Nếu dùng Android emulator: không cần cùng Wi-Fi (sử dụng 10.0.2.2)
- Nếu dùng iOS simulator trên Mac: có thể dùng localhost
- Nếu dùng thiết bị thật: BẮT BUỘC phải cùng Wi-Fi

## Bước 5: Test kết nối

1. Trên thiết bị mobile/simulator, mở trình duyệt
2. Truy cập: `http://[IP_CỦA_BẠN]:8080/api/auth/encode/test`
   - Ví dụ: `http://192.168.1.235:8080/api/auth/encode/test`
3. Nếu thấy trả về chuỗi hash → Kết nối thành công!
4. Nếu không kết nối được → Kiểm tra lại firewall và IP

## Bước 6: Kiểm tra Firewall

Trên Windows:
1. Mở Windows Defender Firewall
2. Cho phép port 8080 hoặc tạm thời tắt firewall để test

## Thông tin đăng nhập

- **Số CCCD**: Sử dụng số CCCD của nhân khẩu trong database
- **Mật khẩu**: `quanlydancu@123` (mật khẩu mặc định cho tất cả nhân khẩu)
- **Lưu ý**: Admin và kế toán không thể đăng nhập qua mobile app

## Debug

Kiểm tra console log để xem:
- API Base URL đang được sử dụng
- Platform (iOS/Android)
- Chi tiết lỗi nếu có

