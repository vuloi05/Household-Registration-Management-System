import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (cccd: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  };

  const login = async (cccd: string, password: string) => {
    const { loginApi } = await import('../api/authApi');
    const response = await loginApi({ cccd, password });
    
    // Kiểm tra response từ API
    if (!response.success) {
      throw new Error(response.message || 'Đăng nhập thất bại');
    }
    
    // Không dùng JWT cho mobile app, chỉ lưu thông tin đăng nhập
    await AsyncStorage.setItem('cccd', cccd);
    setToken('mobile_user');
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('cccd');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

