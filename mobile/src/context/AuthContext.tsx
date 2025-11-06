// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { loginWithRefreshApi, mobileLoginApi } from '../api/authApi';
import type { TokenPair } from '../api/authApi';
import axiosClient from '../api/axiosClient';
import { checkAndClearExpiredTokens, clearTokens } from '../utils/tokenUtils';

// 1. Định nghĩa kiểu dữ liệu cho thông tin người dùng và context
interface User {
  sub: string; // 'sub' (subject) trong JWT thường là username
  role: string; // Ví dụ: "ROLE_ADMIN", "ROLE_ACCOUNTANT"
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  loginWithRefresh: (username: string, password: string) => Promise<void>;
  mobileLogin: (cccd: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Tạo Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect để kiểm tra token trong AsyncStorage khi ứng dụng được tải lần đầu
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Kiểm tra và xóa token expired trước
        const hasExpiredTokens = await checkAndClearExpiredTokens();
        
        // Nếu không có token hết hạn, kiểm tra token hiện tại
        if (!hasExpiredTokens) {
          const token = await AsyncStorage.getItem('jwt_token');
          
          if (token) {
            try {
              const decodedUser = jwtDecode<User>(token);
              
              // Kiểm tra xem token có role và sub không
              if(decodedUser && decodedUser.sub && decodedUser.role){
                setUser(decodedUser);
                axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('User authenticated on app load:', decodedUser.sub);
              } else {
                console.log('Token missing required claims, clearing tokens');
                await clearTokens();
              }
            } catch (error) {
              console.error("Invalid token:", error);
              await clearTokens();
            }
          } else {
            console.log('No token found in AsyncStorage');
          }
        } else {
          console.log('Expired tokens found and cleared');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        // Luôn set loading = false sau khi kiểm tra xong
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Hàm để xử lý đăng nhập
  const login = async (token: string) => {
    await AsyncStorage.setItem('jwt_token', token);
    const decodedUser = jwtDecode<User>(token);
    if(decodedUser.sub && decodedUser.role) {
      setUser(decodedUser);
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Nếu token không hợp lệ, xóa nó khỏi AsyncStorage
      console.error("Token is missing required claims (sub, role)");
      await AsyncStorage.removeItem('jwt_token');
    }
  };

  // Hàm để xử lý đăng nhập với refresh token
  const loginWithRefresh = async (username: string, password: string) => {
    try {
      const tokens: TokenPair = await loginWithRefreshApi({ username, password });
      
      // Lưu cả access token và refresh token
      await AsyncStorage.setItem('jwt_token', tokens.accessToken);
      await AsyncStorage.setItem('refresh_token', tokens.refreshToken);
      
      const decodedUser = jwtDecode<User>(tokens.accessToken);
      if(decodedUser.sub && decodedUser.role) {
        setUser(decodedUser);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      } else {
        throw new Error("Token is missing required claims (sub, role)");
      }
    } catch (error) {
      console.error("Login failed:", error);
      await AsyncStorage.multiRemove(['jwt_token', 'refresh_token']);
      throw error;
    }
  };
  
  // Hàm để xử lý đăng nhập cho mobile app (sử dụng CCCD)
  const mobileLogin = async (cccd: string, password: string) => {
    try {
      const tokens: TokenPair = await mobileLoginApi({ cccd, password });
      
      // Lưu cả access token và refresh token
      await AsyncStorage.setItem('jwt_token', tokens.accessToken);
      await AsyncStorage.setItem('refresh_token', tokens.refreshToken);
      
      const decodedUser = jwtDecode<User>(tokens.accessToken);
      if(decodedUser.sub && decodedUser.role) {
        setUser(decodedUser);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
      } else {
        throw new Error("Token is missing required claims (sub, role)");
      }
    } catch (error) {
      console.error("Mobile login failed:", error);
      await AsyncStorage.multiRemove(['jwt_token', 'refresh_token']);
      throw error;
    }
  };

  // Hàm để xử lý đăng xuất
  const logout = async () => {
    await clearTokens();
    setUser(null);
    delete axiosClient.defaults.headers.common['Authorization'];
  };

  // 4. Cung cấp giá trị cho các component con
  const value = {
    isAuthenticated: !!user, // Chuyển object user thành boolean
    user,
    isLoading,
    login,
    loginWithRefresh,
    mobileLogin,
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

