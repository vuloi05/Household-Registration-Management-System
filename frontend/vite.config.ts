import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // Cho phép truy cập từ mạng LAN (nếu cần)
    port: 3000,       // Đặt cổng mặc định là 3000
    open: true,       // Tự động mở trình duyệt khi chạy
  },
})