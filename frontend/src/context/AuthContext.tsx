// src/context/AuthContext.tsx

import { createContext, useState, useEffect, useContext} from 'react';
import type { ReactNode } from 'react';
import axiosClient from '../api/axiosClient';
import { jwtDecode } from 'jwt-decode';
import { loginWithRefreshApi } from '../api/authApi';
import type { TokenPair } from '../api/authApi';
import { checkAndClearExpiredTokens, clearTokens } from '../utils/tokenUtils';

// 1. Định nghĩa kiểu dữ liệu cho thông tin người dùng và context
interface User {
  sub: string; // 'sub' (subject) trong JWT thường là username
  // Thêm các trường khác nếu bạn đưa vào JWT, ví dụ: role
  role: string; // Ví dụ: "ROLE_ADMIN", "ROLE_ACCOUNTANT"
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  loginWithRefresh: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// 2. Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// 3. Tạo Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // useEffect để kiểm tra token trong localStorage khi ứng dụng được tải lần đầu
  useEffect(() => {
    // Kiểm tra và xóa token expired trước
    const hasExpiredTokens = checkAndClearExpiredTokens();
    
    if (!hasExpiredTokens) {
      const token = localStorage.getItem('jwt_token');
      
      if (token) {
        try {
          const decodedUser: User = jwtDecode(token);
          
          // 2. Kiểm tra xem token có role không
          if(decodedUser && decodedUser.sub){
            setUser(decodedUser);
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            clearTokens();
          }
        } catch (error) {
          console.error("Invalid token:", error);
          clearTokens();
        }
      }
    }
  }, []);

  // Hàm để xử lý đăng nhập
  const login = (token: string) => {
    localStorage.setItem('jwt_token', token);
    const decodedUser: User = jwtDecode(token);
    if(decodedUser.sub && decodedUser.role  ){
      setUser(decodedUser);
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Nếu token không hợp lệ, xóa nó khỏi localStorage
      console.error("Token is missing required claims (sub, role)");
      localStorage.removeItem('jwt_token');
    }
  };

  // Hàm để xử lý đăng nhập với refresh token
  const loginWithRefresh = async (username: string, password: string) => {
    try {
      const tokens: TokenPair = await loginWithRefreshApi({ username, password });
      
      // Lưu cả access token và refresh token
      localStorage.setItem('jwt_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      
      const decodedUser: User = jwtDecode(tokens.accessToken);
      if(decodedUser.sub && decodedUser.role) {
        setUser(decodedUser);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      } else {
        throw new Error("Token is missing required claims (sub, role)");
      }
    } catch (error) {
      console.error("Login failed:", error);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  };

  // Hàm để xử lý đăng xuất
  const logout = () => {
    clearTokens();
    setUser(null);
    delete axiosClient.defaults.headers.common['Authorization'];
  };

  // 4. Cung cấp giá trị cho các component con
  const value = {
    isAuthenticated: !!user, // Chuyển object user thành boolean
    user,
    login,
    loginWithRefresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. Tạo một custom hook để sử dụng AuthContext dễ dàng hơn
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}