// src/pages/LoginPage.tsx

import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Card sx={{ padding: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Bạn có thể thay logo ở đây */}
          <img src="/logo.svg" alt="logo" width="60" height="60" />

          <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
            Đăng nhập hệ thống
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Quản lý Nhân khẩu Tổ dân phố 7, La Khê
          </Typography>

          <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LockOutlinedIcon />}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Đăng nhập
            </Button>
            <Stack direction="row" justifyContent="flex-end">
              <MuiLink href="#" variant="body2">
                Quên mật khẩu?
              </MuiLink>
            </Stack>
          </Box>
        </Box>
      </Card>
    </Container>
  );
}