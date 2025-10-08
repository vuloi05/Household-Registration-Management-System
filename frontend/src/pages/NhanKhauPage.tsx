// src/pages/NhanKhauPage.tsx

import {
  Button, Typography, Box, Paper, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, CircularProgress // Import CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete'; // Import thêm icon Xóa
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import { /* ..., */ deleteHoKhau } from '../api/hoKhauApi'; // 2. Import hàm delete
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect } from 'react'; // Import useEffect
import HoKhauForm from '../components/forms/HoKhauForm';
import type { HoKhauFormValues } from '../types/hoKhau';
// Import các hàm (giá trị)
import { createHoKhau, getDanhSachHoKhau, updateHoKhau } from '../api/hoKhauApi';
// Import các type bằng cú pháp 'import type'
import type { HoKhau } from '../api/hoKhauApi';


export default function NhanKhauPage() {
  const [openForm, setOpenForm] = useState(false);
  const [hoKhauList, setHoKhauList] = useState<HoKhau[]>([]); // State giờ sẽ được quản lý với kiểu HoKhau
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái loading
  // 2. State mới để lưu thông tin hộ khẩu đang được sửa
  const [editingHoKhau, setEditingHoKhau] = useState<HoKhau | null>(null);
  // 3. State mới để quản lý dialog xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHoKhauId, setSelectedHoKhauId] = useState<number | null>(null);

  // 1. Sử dụng useEffect để fetch dữ liệu khi component được mount
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

  // 1. Hàm để mở form thêm mới
  const handleOpenCreateForm = () => {
    setEditingHoKhau(null); // Đảm bảo không có dữ liệu cũ khi thêm mới
    setOpenForm(true);
  };

  // 3. Hàm để đóng form và reset trạng thái sửa
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingHoKhau(null); // Reset thông tin hộ khẩu đang sửa khi đóng form
  };

  // <<<< SỬA 2: ĐỊNH NGHĨA HÀM handleOpenEditForm
  const handleOpenEditForm = (hoKhau: HoKhau) => {
    setEditingHoKhau(hoKhau);
    setOpenForm(true);
  };

  // 4. Cập nhật hàm submit để xử lý cả Thêm và Sửa
  const handleFormSubmit = async (data: HoKhauFormValues) => {
    try {
      if (editingHoKhau) {
        // --- Logic Sửa ---
        const updatedHoKhau = await updateHoKhau(editingHoKhau.id, data);
        setHoKhauList(prevList => 
          prevList.map(item => item.id === updatedHoKhau.id ? updatedHoKhau : item)
        );
      }else {
        // --- Logic Thêm mới ---
        const newHoKhau = await createHoKhau(data);
        // Cập nhật lại danh sách trên UI mà không cần gọi lại API GET
        setHoKhauList(prevList => [...prevList, newHoKhau]);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Failed to create ho khau:', error);
      // (Nâng cao) Hiển thị thông báo lỗi cho người dùng ở đây
    }
  };

  // 4. Các hàm để quản lý dialog xóa
  const handleOpenDeleteDialog = (id: number) => {
    setSelectedHoKhauId(id);
    setDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setSelectedHoKhauId(null);
    setDeleteDialogOpen(false);
  };

  // 5. Hàm xử lý khi người dùng xác nhận xóa
  const handleDeleteConfirm = async () => {
    if (selectedHoKhauId) {
      try {
        await deleteHoKhau(selectedHoKhauId);
        // Xóa hộ khẩu khỏi danh sách trên UI
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
          {/* 5. Nút Thêm mới gọi hàm handleOpenCreateForm */}
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
            Thêm hộ khẩu mới
          </Button>
        </Box>

        {/* 3. Hiển thị loading spinner khi đang tải dữ liệu */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                {/* ... (TableHead giữ nguyên) ... */}
              </TableHead>
              <TableBody>
                {hoKhauList.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.maHoKhau}</TableCell>
                    <TableCell>{row.chuHo}</TableCell>
                    <TableCell>{row.diaChi}</TableCell>
                    {/* <TableCell align="center">{row.soThanhVien}</TableCell>  // Tạm ẩn cột này vì backend chưa có */}
                    
                    <TableCell align="center">
                      <IconButton
                       color="primary"
                       component={RouterLink}
                       to={`/hokhau/${row.id}`}
                       >
                        <InfoIcon />
                      </IconButton>

                       {/* 6. Nút Sửa gọi hàm handleOpenEditForm */}
                      <IconButton color="secondary" onClick={() => handleOpenEditForm(row)}>
                        <EditIcon />
                      </IconButton>

                      {/* 7. Nút Xóa gọi hàm handleOpenDeleteDialog */}
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

      {/* 7. Truyền initialData vào Form */}
      <HoKhauForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingHoKhau} // 6. Truyền dữ liệu hộ khẩu đang sửa (nếu có)
      />

      {/* 8. Dialog xác nhận xóa */}
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