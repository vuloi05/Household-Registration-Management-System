// src/config/api.ts

// Cấu hình API URL
// - Android Emulator: sử dụng 'http://10.0.2.2:8080/api'
// - iOS Simulator: sử dụng 'http://localhost:8080/api' hoặc IP thực tế
// - Thiết bị thật: sử dụng IP máy tính của bạn, ví dụ 'http://192.168.1.100:8080/api'

// Tự động detect platform + host IP của Metro để dùng cho API
import { NativeModules, Platform } from 'react-native';

// Đọc IP từ file config (được tạo bởi script setup-ip.js)
let configIP: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ipConfig = require('./ip-config.json');
  configIP = ipConfig?.localIP || null;
} catch (error) {
  // File chưa tồn tại hoặc lỗi đọc file - sẽ dùng fallback
}

// Hàm lấy host IP từ Metro bundler (tự động khi chạy `npm start`)
const getHostIpFromBundle = (): string | null => {
  // React Native dev mode cung cấp scriptURL, chứa host IP/port của bundler
  const scriptURL: string | undefined =
    (NativeModules as any)?.SourceCode?.scriptURL;
  if (!scriptURL) return null;

  const match = scriptURL.match(/https?:\/\/([^/:]+)/);
  if (match?.[1]) {
    // Nếu đang chạy trên Android emulator, host thường đã là 10.0.2.2
    return match[1];
  }
  return null;
};

// Ưu tiên: IP từ file config > IP từ Metro bundler > Fallback
const FALLBACK_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const LOCAL_IP = configIP || getHostIpFromBundle() || FALLBACK_HOST;

const getBaseURL = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator sử dụng 10.0.2.2 để truy cập localhost của máy host
      return `http://${LOCAL_IP}:8080/api`;
    } else {
      // iOS simulator hoặc thiết bị thật: sử dụng IP thực tế
      // Nếu bạn đang dùng iOS simulator trên Mac và backend chạy trên Mac,
      // có thể thử 'http://localhost:8080/api' thay vì IP
      return `http://${LOCAL_IP}:8080/api`;
    }
  } else {
    // Production mode - thay đổi thành URL server thực tế
    return 'https://your-production-server.com/api';
  }
};

export const API_BASE_URL = getBaseURL();

// Log để debug - kiểm tra console để xem URL đang được sử dụng
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);

