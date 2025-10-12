// src/context/AuthContext.tsx

import { createContext, useState, useEffect, useContext} from 'react';
import type { ReactNode } from 'react';
import axiosClient from '../api/axiosClient';
import { jwtDecode } from 'jwt-decode'; // Cần cài đặt thư viện này

// 1. Định nghĩa kiểu dữ liệu cho thông tin người dùng và context
interface User {
  sub: string; // 'sub' (subject) trong JWT thường là username
  // Thêm các trường khác nếu bạn đưa vào JWT, ví dụ: role
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
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
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedUser: User = jwtDecode(token);
        // Kiểm tra token hết hạn (tùy chọn nhưng nên có)
        // const isExpired = decodedUser.exp * 1000 < Date.now();
        // if (!isExpired) {
          setUser(decodedUser);
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // } else {
        //   localStorage.removeItem('jwt_token');
        // }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('jwt_token');
      }
    }
  }, []);

  // Hàm để xử lý đăng nhập
  const login = (token: string) => {
    localStorage.setItem('jwt_token', token);
    const decodedUser: User = jwtDecode(token);
    setUser(decodedUser);
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Hàm để xử lý đăng xuất
  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    delete axiosClient.defaults.headers.common['Authorization'];
  };

  // 4. Cung cấp giá trị cho các component con
  const value = {
    isAuthenticated: !!user, // Chuyển object user thành boolean
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. Tạo một custom hook để sử dụng AuthContext dễ dàng hơn
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}