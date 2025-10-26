import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.101:8080/api';

interface LoginRequest {
  cccd: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/mobile/auth/login`, data);
  return response.data;
};

