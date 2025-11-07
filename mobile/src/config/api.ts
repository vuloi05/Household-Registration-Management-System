// src/config/api.ts

// Cấu hình API URL
// - Android Emulator: sử dụng 'http://10.0.2.2:8080/api'
// - iOS Simulator: sử dụng 'http://localhost:8080/api' hoặc IP thực tế
// - Thiết bị thật: sử dụng IP máy tính của bạn, ví dụ 'http://192.168.1.100:8080/api'

// Tự động detect platform
import { Platform } from 'react-native';

// ============================================
// QUAN TRỌNG: Thay đổi IP này thành IP máy tính của bạn!
// Để lấy IP trên Windows:
// 1. Mở PowerShell hoặc Command Prompt
// 2. Chạy lệnh: ipconfig
// 3. Tìm "IPv4 Address" (thường là 192.168.x.x hoặc 10.0.x.x)
// 4. Copy IP đó và paste vào biến LOCAL_IP bên dưới
// ============================================
const LOCAL_IP = '192.168.1.235'; // ✅ IP đã được tự động detect - Nếu không kết nối được, thử IP khác: 172.21.64.1

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

