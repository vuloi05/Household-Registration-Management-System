// src/App.tsx

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import theme from './theme/index'; // Đảm bảo đường dẫn đến file theme là chính xác
import AppRouter from './routes/index'; // Đảm bảo đường dẫn đến file router là chính xác
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    // 1. Cung cấp theme cho toàn bộ ứng dụng
    <ThemeProvider theme={theme}>
      {/* 2. Chuẩn hóa CSS trên các trình duyệt */}
      <CssBaseline />
      
      {/* 3. Cung cấp SnackbarProvider cho toàn bộ ứng dụng */}
      <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        dense
        preventDuplicate
        style={{
          zIndex: 9999, // Đảm bảo popup hiển thị trên tất cả các element khác
        }}
      >
        {/* 4. Cung cấp AuthContext cho toàn bộ ứng dụng */}
        <AuthProvider>
          {/* 5. Render bộ định tuyến để xử lý việc hiển thị các trang */}
          <AppRouter />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;