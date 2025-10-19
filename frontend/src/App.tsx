// src/App.tsx

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/index'; // Đảm bảo đường dẫn đến file theme là chính xác
import AppRouter from './routes/index'; // Đảm bảo đường dẫn đến file router là chính xác
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    // 1. Cung cấp theme cho toàn bộ ứng dụng
    <ThemeProvider theme={theme}>
      {/* 2. Chuẩn hóa CSS trên các trình duyệt */}
      <CssBaseline />
      
      {/* 3. Cung cấp AuthContext cho toàn bộ ứng dụng */}
      <AuthProvider>
        {/* 4. Render bộ định tuyến để xử lý việc hiển thị các trang */}
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;