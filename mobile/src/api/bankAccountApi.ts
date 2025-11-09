// src/api/bankAccountApi.ts
import axiosClient from './axiosClient';

export interface BankAccount {
  id: number;
  userId: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode?: string;
  branchName?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountRequest {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode?: string;
  branchName?: string;
  isDefault?: boolean;
}

// Lấy danh sách tài khoản ngân hàng của user hiện tại
export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const response = await axiosClient.get('/bank-accounts');
  return response.data;
};

// Lấy tài khoản ngân hàng theo ID
export const getBankAccountById = async (id: number): Promise<BankAccount> => {
  const response = await axiosClient.get(`/bank-accounts/${id}`);
  return response.data;
};

// Tạo tài khoản ngân hàng mới
export const createBankAccount = async (
  data: BankAccountRequest
): Promise<BankAccount> => {
  const response = await axiosClient.post('/bank-accounts', data);
  return response.data;
};

// Cập nhật tài khoản ngân hàng
export const updateBankAccount = async (
  id: number,
  data: BankAccountRequest
): Promise<BankAccount> => {
  const response = await axiosClient.put(`/bank-accounts/${id}`, data);
  return response.data;
};

// Xóa tài khoản ngân hàng
export const deleteBankAccount = async (id: number): Promise<void> => {
  await axiosClient.delete(`/bank-accounts/${id}`);
};

// Đặt tài khoản làm mặc định
export const setDefaultBankAccount = async (id: number): Promise<BankAccount> => {
  const response = await axiosClient.put(`/bank-accounts/${id}/set-default`);
  return response.data;
};

