// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// 1. Import AuthProvider từ file context bạn vừa tạo
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 
      2. Bọc toàn bộ ứng dụng (<App />) trong <AuthProvider>.
      Điều này đảm bảo rằng tất cả các component con bên trong App 
      (bao gồm các trang, layout, component...) đều có thể truy cập 
      vào trạng thái đăng nhập thông qua hook `useAuth()`.
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);