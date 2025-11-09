# Hướng dẫn cấu hình VietQR

## ⚠️ Lưu ý quan trọng

**VietQR.io không có webhook trực tiếp!** 

Hệ thống hiện tại sử dụng **VietQR Quick Link** (không cần API key) để tạo QR code. Để tự động xác nhận thanh toán, bạn có 2 lựa chọn:

1. **Tích hợp với Casso** (khuyến nghị) - Có webhook tự động
2. **Tích hợp với payOS** - Có webhook tự động  
3. **Xác nhận thủ công** - Admin xác nhận sau khi kiểm tra tài khoản

## Bước 1: Tạo file .env

Tạo file `.env` trong thư mục `backend/api/` với nội dung:

```env
DB_PASSWORD=your_database_password

# Payment Receiver Account (BẮT BUỘC)
PAYMENT_RECEIVER_ACCOUNT_NO=1050566308
PAYMENT_RECEIVER_ACCOUNT_NAME=TRAN VAN MANH
PAYMENT_RECEIVER_BANK_BIN=970436
PAYMENT_RECEIVER_TEMPLATE_ID=compact2

# VietQR API (TÙY CHỌN - chỉ cần nếu dùng API v2/generate)
# Đăng ký tại my.vietqr.io để lấy Client ID và API Key
VIETQR_CLIENT_ID=
VIETQR_API_KEY=
```

**Giải thích các tham số:**
- `PAYMENT_RECEIVER_ACCOUNT_NO`: Số tài khoản đầy đủ (ví dụ: `1050566308`)
- `PAYMENT_RECEIVER_ACCOUNT_NAME`: Tên chủ tài khoản IN HOA không dấu (ví dụ: `TRAN VAN MANH`)
- `PAYMENT_RECEIVER_BANK_BIN`: Mã BIN của ngân hàng - 6 số (ví dụ: `970436` cho Vietcombank)
- `PAYMENT_RECEIVER_TEMPLATE_ID`: Template ID từ my.vietqr.io hoặc dùng `compact2` (mặc định)
  - Nếu có template custom từ my.vietqr.io, dùng template ID đó (ví dụ: `NrjAkzZ`)
  - Nếu không, dùng `compact2` (template mặc định)

**Lưu ý:** 
- VietQR Quick Link không cần API key, chỉ cần thông tin tài khoản
- Format QR code URL: `https://api.vietqr.io/image/{BANK_BIN}-{ACCOUNT_NO}-{TEMPLATE_ID}.jpg?amount={AMOUNT}&addInfo={DESCRIPTION}&accountName={ACCOUNT_NAME}`

## Bước 2: Cấu hình Webhook (nếu dùng Casso/payOS)

### Option 1: Tích hợp với Casso (khuyến nghị)

1. Đăng ký tài khoản tại https://casso.vn
2. Cấu hình webhook URL: `https://your-domain.com/api/payment/vietqr/webhook`
3. Casso sẽ gửi webhook khi có giao dịch vào tài khoản

### Option 2: Tích hợp với payOS

1. Đăng ký tài khoản tại https://payos.vn
2. Cấu hình webhook URL tương tự
3. payOS sẽ gửi webhook khi thanh toán thành công

### Option 3: Test webhook thủ công (local)

Nếu đang test local, có thể test webhook bằng Postman hoặc curl (xem phần Test bên dưới)

## Bước 3: Khởi động Backend

Backend sẽ tự động:
- Tạo các bảng `payments` và `payment_notifications` trong database
- Sẵn sàng nhận requests từ mobile app và webhook từ Casso/payOS

## Bước 4: Test

### Test tạo QR code:
1. Mở mobile app → chọn khoản thu → bấm "Thanh toán"
2. Kiểm tra QR code có hiển thị không
3. Quét QR code bằng app ngân hàng để kiểm tra thông tin

### Test webhook (local):
Sử dụng Postman hoặc curl để test webhook:

```bash
curl -X POST http://localhost:8080/api/payment/vietqr/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "test-payment-123",
    "status": "paid",
    "amount": "100000",
    "transactionId": "txn-test-123",
    "paidAt": "2024-01-01T10:00:00",
    "payerName": "NGUYEN VAN A",
    "payerAccount": "9704151234567890"
  }'
```

### Test notification:
Sau khi webhook được gọi, kiểm tra frontend có hiển thị thông báo không

## Lưu ý

- **Bảo mật:** Không commit file `.env` lên git
- **Webhook:** 
  - VietQR.io không có webhook, cần tích hợp với Casso/payOS
  - Nếu test local, dùng ngrok để expose webhook endpoint
- **hoKhauId:** Nếu mobile app không truyền `hoKhauId`, hệ thống vẫn hoạt động nhưng sẽ không tự động ghi nhận nộp tiền
- **Mã ngân hàng:** Hệ thống tự động detect mã ngân hàng từ 6 số đầu của số tài khoản

## Danh sách mã ngân hàng phổ biến

- `970415` - VietinBank
- `970422` - MB Bank
- `970436` - Vietcombank
- `970418` - BIDV
- `970403` - TPBank

Nếu ngân hàng của bạn không có trong danh sách, hệ thống sẽ dùng `vietinbank` làm mặc định.

## Troubleshooting

1. **QR code không hiển thị:**
   - Kiểm tra số tài khoản và tên chủ tài khoản có đúng không
   - Kiểm tra API response từ backend
   - Kiểm tra console log trong mobile app

2. **Webhook không nhận được:**
   - Kiểm tra đã tích hợp với Casso/payOS chưa
   - Kiểm tra URL webhook có đúng không
   - Kiểm tra firewall/network
   - Kiểm tra logs backend

3. **Thanh toán không tự động xác nhận:**
   - VietQR.io không có webhook, cần tích hợp với Casso/payOS
   - Hoặc xác nhận thủ công qua frontend

