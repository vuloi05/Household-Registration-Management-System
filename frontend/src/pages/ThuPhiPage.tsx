// src/pages/ThuPhiPage.tsx

import {
  Button, Typography, Box, Paper, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, CircularProgress, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';
import ThuPhiForm from '../components/forms/ThuPhiForm';
import type { ThuPhiFormValues } from '../types/thuPhi';
import { LoaiPhi, TrangThaiPhi } from '../types/thuPhi';
// Import các hàm API
import { createThuPhi, getDanhSachThuPhi, updateThuPhi, deleteThuPhi } from '../api/thuPhiApi';
// Import type
import type { ThuPhi } from '../api/thuPhiApi';

export default function ThuPhiPage() {
  const [openForm, setOpenForm] = useState(false);
  const [thuPhiList, setThuPhiList] = useState<ThuPhi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingThuPhi, setEditingThuPhi] = useState<ThuPhi | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedThuPhiId, setSelectedThuPhiId] = useState<number | null>(null);

  // Fetch dữ liệu khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDanhSachThuPhi();
        setThuPhiList(data);
      } catch (error) {
        console.error('Failed to fetch thu phi list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hàm để mở form thêm mới
  const handleOpenCreateForm = () => {
    setEditingThuPhi(null);
    setOpenForm(true);
  };

  // Hàm để đóng form và reset trạng thái sửa
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingThuPhi(null);
  };

  // Hàm để mở form sửa
  const handleOpenEditForm = (thuPhi: ThuPhi) => {
    setEditingThuPhi(thuPhi);
    setOpenForm(true);
  };

  // Hàm submit form (thêm và sửa)
  const handleFormSubmit = async (data: ThuPhiFormValues) => {
    try {
      if (editingThuPhi) {
        // Logic Sửa
        const updatedThuPhi = await updateThuPhi(editingThuPhi.id, data);
        setThuPhiList(prevList => 
          prevList.map(item => item.id === updatedThuPhi.id ? updatedThuPhi : item)
        );
      } else {
        // Logic Thêm mới
        const newThuPhi = await createThuPhi(data);
        setThuPhiList(prevList => [...prevList, newThuPhi]);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save thu phi:', error);
    }
  };

  // Các hàm để quản lý dialog xóa
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedThuPhiId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedThuPhiId(null);
    setDeleteDialogOpen(false);
  };

  // Hàm xử lý khi người dùng xác nhận xóa
  const handleDeleteConfirm = async () => {
    if (selectedThuPhiId) {
      try {
        await deleteThuPhi(selectedThuPhiId);
        setThuPhiList(prevList => prevList.filter(item => item.id !== selectedThuPhiId));
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Failed to delete thu phi:', error);
      }
    }
  };

  // Hàm để format số tiền
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm để lấy màu cho chip trạng thái
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'DA_THU':
        return 'success';
      case 'CHUA_THU':
        return 'warning';
      case 'QUA_HAN':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <> 
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Danh sách Thu phí</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
            Thêm khoản thu phí mới
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên phí</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại phí</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày thu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {thuPhiList.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.tenPhi}</TableCell>
                    <TableCell>{LoaiPhi[row.loaiPhi as keyof typeof LoaiPhi]}</TableCell>
                    <TableCell>{formatCurrency(row.soTien)}</TableCell>
                    <TableCell>{new Date(row.ngayThu).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={TrangThaiPhi[row.trangThai as keyof typeof TrangThaiPhi]} 
                        color={getStatusColor(row.trangThai)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.moTa}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="secondary" onClick={() => handleOpenEditForm(row)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog(row.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Form thêm/sửa thu phí */}
      <ThuPhiForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingThuPhi}
      />

      {/* Dialog xác nhận xóa */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa khoản thu phí này không? Hành động này không thể hoàn tác."
      />
    </>
  );
}