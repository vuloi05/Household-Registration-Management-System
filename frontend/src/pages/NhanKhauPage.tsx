// src/pages/NhanKhauPage.tsx

import {
  Button, Typography, Box, Paper, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect } from 'react';
import HoKhauForm from '../components/forms/HoKhauForm';
import type { HoKhauFormValues } from '../types/hoKhau';
// Import các hàm API
import { createHoKhau, getDanhSachHoKhau, updateHoKhau, deleteHoKhau } from '../api/hoKhauApi';
// Import các type bằng cú pháp 'import type'
import type { HoKhau } from '../api/hoKhauApi';


export default function NhanKhauPage() {
  const [openForm, setOpenForm] = useState(false);
  const [hoKhauList, setHoKhauList] = useState<HoKhau[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHoKhau, setEditingHoKhau] = useState<HoKhau | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHoKhauId, setSelectedHoKhauId] = useState<number | null>(null);

  // useEffect để fetch dữ liệu khi component được mount (giữ nguyên)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDanhSachHoKhau();
        setHoKhauList(data);
      } catch (error) {
        console.error('Failed to fetch ho khau list:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Mảng rỗng [] nghĩa là effect này chỉ chạy 1 lần duy nhất

  // Các hàm xử lý sự kiện (giữ nguyên, không thay đổi)
  const handleOpenCreateForm = () => {
    setEditingHoKhau(null);
    setOpenForm(true);
  };
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingHoKhau(null);
  };
  const handleOpenEditForm = (hoKhau: HoKhau) => {
    setEditingHoKhau(hoKhau);
    setOpenForm(true);
  };
  const handleFormSubmit = async (data: HoKhauFormValues) => {
    try {
      if (editingHoKhau) {
        // --- Logic Sửa ---
        const updatedHoKhau = await updateHoKhau(editingHoKhau.id, data);
        setHoKhauList(prevList => 
          prevList.map(item => item.id === updatedHoKhau.id ? updatedHoKhau : item)
        );
      } else {
        // --- Logic Thêm mới ---
        const newHoKhau = await createHoKhau(data);
        setHoKhauList(prevList => [...prevList, newHoKhau]);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Failed to submit HoKhau form:', error);
    }
  };
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedHoKhauId(id);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setSelectedHoKhauId(null);
    setDeleteDialogOpen(false);
  };
  const handleDeleteConfirm = async () => {
    if (selectedHoKhauId) {
      try {
        await deleteHoKhau(selectedHoKhauId);
        setHoKhauList(prevList => prevList.filter(item => item.id !== selectedHoKhauId));
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Failed to delete ho khau:', error);
      }
    }
  };

  return (
    <> 
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Danh sách Hộ khẩu</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
            Thêm hộ khẩu mới
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
                  {/* === THAY ĐỔI 1: Cập nhật tiêu đề bảng === */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mã Hộ khẩu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tên Chủ hộ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {hoKhauList.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.maHoKhau}</TableCell>
                    
                    {/* === THAY ĐỔI 2 (QUAN TRỌNG): Sửa lỗi hiển thị === */}
                    {/* `row.chuHo` bây giờ là một object, chúng ta cần truy cập `row.chuHo.hoTen` */}
                    <TableCell>{row.chuHo?.hoTen}</TableCell>
                    
                    <TableCell>{row.diaChi}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" component={RouterLink} to={`/hokhau/${row.id}`}>
                        <InfoIcon />
                      </IconButton>
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

      {/* Các component Dialog (giữ nguyên) */}
      <HoKhauForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingHoKhau}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa hộ khẩu này không? Hành động này không thể hoàn tác."
      />
    </>
  );
}