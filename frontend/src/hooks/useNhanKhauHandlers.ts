// src/hooks/useNhanKhauHandlers.ts

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import {
  createNhanKhauManagement,
  updateNhanKhauManagement,
  deleteNhanKhauManagement,
  type NhanKhau,
} from '../api/nhanKhauApi';
import { ghiNhanBienDong } from '../api/bienDongApi';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import type { BienDongNhanKhauFormValues } from '../types/bienDong';

interface UseNhanKhauHandlersProps {
  loadNhanKhauData: () => Promise<void>;
  setFormOpen: (open: boolean) => void;
  setBienDongFormOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setSelectedNhanKhau: (nhanKhau: NhanKhau | null) => void;
  setEditingNhanKhau: (data: NhanKhauFormValues | null) => void;
  handleMenuClose: () => void;
  selectedNhanKhau: NhanKhau | null;
}

export function useNhanKhauHandlers({
  loadNhanKhauData,
  setFormOpen,
  setBienDongFormOpen,
  setDeleteDialogOpen,
  setSelectedNhanKhau,
  setEditingNhanKhau,
  handleMenuClose,
  selectedNhanKhau,
}: UseNhanKhauHandlersProps) {
  const { enqueueSnackbar } = useSnackbar();

  // Xử lý thêm nhân khẩu
  const handleAddNhanKhau = useCallback(async (data: NhanKhauFormValues) => {
    try {
      await createNhanKhauManagement(data);
      enqueueSnackbar('Thêm nhân khẩu thành công', { variant: 'success' });
      setFormOpen(false);
      loadNhanKhauData(); // Reload data
    } catch (error: unknown) {
      console.error('Error creating nhan khau:', error);
      
      // Xử lý lỗi từ backend
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          enqueueSnackbar(axiosError.response.data.error, { variant: 'error' });
        } else {
          enqueueSnackbar('Không thể thêm nhân khẩu', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Không thể thêm nhân khẩu', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, setFormOpen, loadNhanKhauData]);

  // Xử lý cập nhật nhân khẩu
  const handleUpdateNhanKhau = useCallback(async (data: NhanKhauFormValues) => {
    if (!selectedNhanKhau) return;

    try {
      await updateNhanKhauManagement(selectedNhanKhau.id, data);
      enqueueSnackbar('Cập nhật nhân khẩu thành công', { variant: 'success' });
      setFormOpen(false);
      setSelectedNhanKhau(null);
      setEditingNhanKhau(null);
      loadNhanKhauData(); // Reload data
    } catch (error) {
      console.error('Error updating nhan khau:', error);
      enqueueSnackbar('Không thể cập nhật nhân khẩu', { variant: 'error' });
    }
  }, [selectedNhanKhau, enqueueSnackbar, setFormOpen, setSelectedNhanKhau, setEditingNhanKhau, loadNhanKhauData]);

  // Xử lý xóa nhân khẩu
  const handleDeleteNhanKhau = useCallback(async () => {
    if (!selectedNhanKhau) return;

    try {
      await deleteNhanKhauManagement(selectedNhanKhau.id);
      enqueueSnackbar('Xóa nhân khẩu thành công', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedNhanKhau(null);
      loadNhanKhauData(); // Reload data
    } catch (error) {
      console.error('Error deleting nhan khau:', error);
      enqueueSnackbar('Không thể xóa nhân khẩu', { variant: 'error' });
    }
  }, [selectedNhanKhau, enqueueSnackbar, setDeleteDialogOpen, setSelectedNhanKhau, loadNhanKhauData]);

  // Xử lý ghi nhận biến động
  const handleBienDongSubmit = useCallback(async (data: BienDongNhanKhauFormValues) => {
    try {
      await ghiNhanBienDong(data);
      enqueueSnackbar('Ghi nhận biến động thành công', { variant: 'success' });
      setBienDongFormOpen(false);
      loadNhanKhauData();
    } catch (error: unknown) {
      console.error('Error recording bien dong:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          enqueueSnackbar(axiosError.response.data.error, { variant: 'error' });
        } else {
          enqueueSnackbar('Không thể ghi nhận biến động', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Không thể ghi nhận biến động', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, setBienDongFormOpen, loadNhanKhauData]);

  // Xử lý mở form thêm mới
  const handleOpenAddForm = useCallback(() => {
    setSelectedNhanKhau(null);
    setEditingNhanKhau(null);
    setFormOpen(true);
  }, [setSelectedNhanKhau, setEditingNhanKhau, setFormOpen]);

  // Xử lý mở form chỉnh sửa
  const handleOpenEditForm = useCallback((nhanKhau: NhanKhau) => {
    handleMenuClose();
    setSelectedNhanKhau(nhanKhau);
    // Đảm bảo maHoKhau được map đúng từ dữ liệu nhân khẩu
    const formData: NhanKhauFormValues = {
      ...nhanKhau,
      ngayCap: nhanKhau.ngayCap || '',
      noiCap: nhanKhau.noiCap || '',
      maHoKhau: nhanKhau.maHoKhau || '',
    };
    setEditingNhanKhau(formData);
    setFormOpen(true);
  }, [handleMenuClose, setSelectedNhanKhau, setEditingNhanKhau, setFormOpen]);

  // Xử lý mở dialog xóa
  const handleOpenDeleteDialog = useCallback((nhanKhau: NhanKhau) => {
    handleMenuClose();
    setSelectedNhanKhau(nhanKhau);
    setDeleteDialogOpen(true);
  }, [handleMenuClose, setSelectedNhanKhau, setDeleteDialogOpen]);

  // Xử lý mở form biến động
  const handleOpenBienDongForm = useCallback((nhanKhau: NhanKhau) => {
    handleMenuClose();
    setSelectedNhanKhau(nhanKhau);
    setBienDongFormOpen(true);
  }, [handleMenuClose, setSelectedNhanKhau, setBienDongFormOpen]);

  return {
    handleAddNhanKhau,
    handleUpdateNhanKhau,
    handleDeleteNhanKhau,
    handleBienDongSubmit,
    handleOpenAddForm,
    handleOpenEditForm,
    handleOpenDeleteDialog,
    handleOpenBienDongForm,
  };
}

