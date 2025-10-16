// src/pages/LoginPage.tsx

import {
  Box, Button, Card, TextField, Typography,
  IconButton, InputAdornment, Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import type { AuthRequest } from '../api/authApi';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { loginWithRefresh } = useAuth();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthRequest>();

  const onSubmit = async (data: AuthRequest) => {
    setLoginError(null);
    try {
      await loginWithRefresh(data.username!, data.password!);
      navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  };

  return (
    // Box ngoài cùng làm nhiệm vụ căn giữa
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw', // Chiếm 100% chiều rộng viewport
        height: '100vh', // Chiếm 100% chiều cao viewport
        backgroundColor: 'grey.100'
      }}
    >
      {/* Box thứ hai để giới hạn độ rộng của form */}
      <Box sx={{ maxWidth: 400, width: '100%', p: 2 }}>
        <Card sx={{ padding: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <img src="vite1.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Typography component="h1" variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
              Đăng nhập hệ thống
            </Typography>

            {loginError && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{loginError}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
              <Controller
                name="username"
                control={control}
                defaultValue=""
                rules={{ required: 'Tên đăng nhập là bắt buộc' }}
                render={({ field }) => (
                  <TextField {...field} margin="normal" required fullWidth label="Tên đăng nhập" autoFocus error={!!errors.username} helperText={errors.username?.message as string} />
                )}
              />
              <Controller
                name="password"
                control={control}
                defaultValue=""
                rules={{ required: 'Mật khẩu là bắt buộc' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message as string}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Button type="submit" fullWidth variant="contained" size="large" startIcon={<LockOutlinedIcon />} sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={isSubmitting} >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}