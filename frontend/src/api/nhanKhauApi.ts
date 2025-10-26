// src/api/nhanKhauApi.ts
import type { NhanKhauFormValues } from '../types/nhanKhau';
import axiosClient from './axiosClient';

// Kiểu dữ liệu cho nhân khẩu, có thể mở rộng sau
export interface NhanKhau extends Partial<NhanKhauFormValues> {
  id: number;
  hoTen: string;
  ngaySinh: string;
  cmndCccd: string;
  quanHeVoiChuHo: string;
  // Thông tin hộ khẩu
  hoKhauId?: number;
  maHoKhau?: string;
  diaChiHoKhau?: string;
  // ... các trường khác
}

// Interface cho response phân trang
export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Hàm gọi API lấy TẤT CẢ nhân khẩu với phân trang, tìm kiếm và lọc
export const getAllNhanKhau = async (params: {
  page?: number;
  size?: number;
  search?: string;
  ageFilter?: string;
  genderFilter?: string;
  locationFilter?: string;
}): Promise<PaginatedResponse<NhanKhau>> => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.ageFilter) queryParams.append('ageFilter', params.ageFilter);
  if (params.genderFilter) queryParams.append('genderFilter', params.genderFilter);
  if (params.locationFilter) queryParams.append('locationFilter', params.locationFilter);

  const response = await axiosClient.get(`/nhankhau-management?${queryParams.toString()}`);
  return response.data;
};

// Hàm gọi API lấy chi tiết nhân khẩu theo ID
export const getNhanKhauById = async (id: number): Promise<NhanKhau> => {
  const response = await axiosClient.get(`/nhankhau-management/${id}`);
  return response.data;
};

// Hàm gọi API tạo nhân khẩu mới
export const createNhanKhauManagement = async (data: NhanKhauFormValues): Promise<NhanKhau> => {
  const response = await axiosClient.post('/nhankhau-management', data);
  return response.data;
};

// Hàm gọi API cập nhật nhân khẩu
export const updateNhanKhauManagement = async (id: number, data: NhanKhauFormValues): Promise<NhanKhau> => {
  const response = await axiosClient.put(`/nhankhau-management/${id}`, data);
  return response.data;
};

// Hàm gọi API xóa nhân khẩu
export const deleteNhanKhauManagement = async (id: number): Promise<void> => {
  await axiosClient.delete(`/nhankhau-management/${id}`);
};

// ============= API theo Hộ Khẩu (giữ nguyên) =============

// Hàm gọi API lấy danh sách nhân khẩu của một hộ
export const getDanhSachNhanKhau = async (hoKhauId: number): Promise<NhanKhau[]> => {
  const response = await axiosClient.get(`/hokhau/${hoKhauId}/nhankhau`);
  return response.data;
};

// Hàm gọi API tạo nhân khẩu mới cho một hộ
export const createNhanKhau = async (hoKhauId: number, data: NhanKhauFormValues): Promise<NhanKhau> => {
    const response = await axiosClient.post(`/hokhau/${hoKhauId}/nhankhau`, data);
    return response.data;
};

// Hàm gọi API cập nhật nhân khẩu
export const updateNhanKhau = async (hoKhauId: number, nhanKhauId: number, data: NhanKhauFormValues): Promise<NhanKhau> => {
    const response = await axiosClient.put(`/hokhau/${hoKhauId}/nhankhau/${nhanKhauId}`, data);
    return response.data;
};

// Hàm gọi API xóa nhân khẩu
export const deleteNhanKhau = async (hoKhauId: number, nhanKhauId: number): Promise<void> => {
    await axiosClient.delete(`/hokhau/${hoKhauId}/nhankhau/${nhanKhauId}`);
};

// Hàm gọi API tìm kiếm nhân khẩu theo số CCCD
export const searchNhanKhauByCmndCccd = async (cmndCccd: string): Promise<NhanKhau | null> => {
    try {
        const response = await axiosClient.get(`/nhankhau/search?cmndCccd=${cmndCccd}`);
        return response.data;
    } catch (error: any) {
        // Nếu không tìm thấy (404), trả về null
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

// Interface cho thông tin kiểm tra hộ khẩu
export interface HouseholdCheckResult {
    found: boolean;
    isChuHo: boolean;
    currentHousehold: {
        id: number;
        maHoKhau: string;
        diaChi: string;
    };
    personInfo: {
        id: number;
        hoTen: string;
        ngaySinh: string;
        cmndCccd: string;
        quanHeVoiChuHo: string;
    };
}

// Hàm gọi API kiểm tra thông tin hộ khẩu hiện tại
export const checkHouseholdInfo = async (cmndCccd: string): Promise<HouseholdCheckResult | null> => {
    try {
        const response = await axiosClient.get(`/nhankhau/check-household?cmndCccd=${cmndCccd}`);
        return response.data;
    } catch (error: any) {
        // Nếu không tìm thấy (404), trả về null
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};