import axios from 'axios';
import type { HoKhau, NhanKhau } from '../types/household';

// Base URL - thay đổi khi deploy production
const API_BASE_URL = 'http://192.168.0.101:8080/api';

// Lấy thông tin hộ khẩu theo CCCD (API công khai cho mobile)
export const getHouseholdByCmndCccd = async (cmndCccd: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/mobile/household?cmndCccd=${cmndCccd}`);
  return response.data;
};

// Lấy thông tin nhân khẩu theo CCCD (API công khai cho mobile)
export const getPersonByCmndCccd = async (cmndCccd: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/mobile/person?cmndCccd=${cmndCccd}`);
  return response.data;
};

