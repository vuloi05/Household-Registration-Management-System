// src/pages/HoKhauDetailPage.tsx

import {
  Box, Typography, Paper, CircularProgress, Divider, Button,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// === CẬP NHẬT PHẦN IMPORT ===
// API Hộ khẩu
import { getHoKhauById } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';
// API Nhân khẩu: import thêm updateNhanKhau và deleteNhanKhau
import { getDanhSachNhanKhau, createNhanKhau, updateNhanKhau, deleteNhanKhau } from '../api/nhanKhauApi';
import type { NhanKhau } from '../api/nhanKhauApi';
// Component và Type cần thiết
import NhanKhauForm from '../components/forms/NhanKhauForm';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';


// === CẬP NHẬT COMPONENT BẢNG NHÂN KHẨU ===
// Nâng cấp component NhanKhauTable để nhận thêm các hàm xử lý sự kiện Sửa và Xóa
function NhanKhauTable({
  data,
  onEdit,
  onDelete
}: {
  data: NhanKhau[],
  onEdit: (nhanKhau: NhanKhau) => void,
  onDelete: (id: number) => void
}) {
    if (data.length === 0) {
        return <Typography sx={{ mt: 2 }}>Chưa có nhân khẩu nào trong hộ này.</Typography>;
    }
    return (
      <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Họ Tên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ngày Sinh</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quan hệ với chủ hộ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map(nk => (
                    <TableRow key={nk.id}>
                        <TableCell>{nk.hoTen}</TableCell>
                        <TableCell>{nk.ngaySinh}</TableCell>
                        <TableCell>{nk.quanHeVoiChuHo}</TableCell>
                        <TableCell align="right">
                            {/* Nút Sửa và Xóa gọi các hàm được truyền từ component cha */}
                            <IconButton size="small" onClick={() => onEdit(nk)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => onDelete(nk.id)}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </TableContainer>
    )
}

export default function HoKhauDetailPage() {
  const { hoKhauId } = useParams<{ hoKhauId: string }>();
  const [hoKhau, setHoKhau] = useState<HoKhau | null>(null);
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhau[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Form (cho cả Thêm và Sửa)
  const [openNhanKhauForm, setOpenNhanKhauForm] = useState(false);
  const [editingNhanKhau, setEditingNhanKhau] = useState<NhanKhau | null>(null);

  // === CẬP NHẬT STATE: Thêm state cho dialog Xóa ===
  const [deletingNhanKhauId, setDeletingNhanKhauId] = useState<number | null>(null);

  // Hook useEffect để fetch dữ liệu ban đầu (giữ nguyên, không thay đổi)
  useEffect(() => {
    if (hoKhauId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const id = parseInt(hoKhauId, 10);
          const [hoKhauData, nhanKhauData] = await Promise.all([
            getHoKhauById(id),
            getDanhSachNhanKhau(id)
          ]);
          setHoKhau(hoKhauData);
          setNhanKhauList(nhanKhauData);
        } catch (error) {
          console.error('Failed to fetch details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [hoKhauId]);

  // === CẬP NHẬT LOGIC: Các hàm xử lý sự kiện cho Form và Dialog ===

  // ---- Logic cho Form (Thêm & Sửa) ----
  const handleOpenCreateForm = () => {
    setEditingNhanKhau(null); // Đặt editingNhanKhau là null để form biết đây là chế độ Thêm mới
    setOpenNhanKhauForm(true);
  };
  const handleOpenEditForm = (nhanKhau: NhanKhau) => {
    setEditingNhanKhau(nhanKhau); // Truyền dữ liệu của nhân khẩu cần sửa vào state
    setOpenNhanKhauForm(true);
  };
  const handleCloseForm = () => {
    setOpenNhanKhauForm(false);
    setEditingNhanKhau(null); // Luôn reset state khi đóng form
  };

  // Hàm này xử lý logic cho cả Thêm và Sửa
  const handleNhanKhauFormSubmit = async (data: NhanKhauFormValues) => {
    if (!hoKhauId) return;
    const currentHoKhauId = parseInt(hoKhauId, 10);

    try {
      // Nếu có editingNhanKhau, nghĩa là đang ở chế độ Sửa
      if (editingNhanKhau) {
        const updated = await updateNhanKhau(currentHoKhauId, editingNhanKhau.id, data);
        // Cập nhật lại nhân khẩu trong danh sách
        setNhanKhauList(list => list.map(item => item.id === updated.id ? updated : item));
      } else { // Ngược lại, là chế độ Thêm mới
        const created = await createNhanKhau(currentHoKhauId, data);
        // Thêm nhân khẩu mới vào cuối danh sách
        setNhanKhauList(list => [...list, created]);
      }
      handleCloseForm(); // Đóng form sau khi thành công
    } catch (error) { 
      console.error("Failed to submit NhanKhau form:", error); 
    }
  };

  // ---- Logic cho Dialog Xóa ----
  const handleOpenDeleteDialog = (id: number) => setDeletingNhanKhauId(id);
  const handleCloseDeleteDialog = () => setDeletingNhanKhauId(null);
  const handleDeleteConfirm = async () => {
    if (!hoKhauId || !deletingNhanKhauId) return;
    const currentHoKhauId = parseInt(hoKhauId, 10);

    try {
      await deleteNhanKhau(currentHoKhauId, deletingNhanKhauId);
      // Lọc ra và xóa nhân khẩu khỏi danh sách
      setNhanKhauList(list => list.filter(item => item.id !== deletingNhanKhauId));
      handleCloseDeleteDialog(); // Đóng dialog
    } catch (error) { 
      console.error("Failed to delete NhanKhau:", error); 
    }
  };

  // Các phần render loading và báo lỗi (giữ nguyên)
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!hoKhau) {
    return <Typography>Không tìm thấy thông tin hộ khẩu.</Typography>;
  }

  // === CẬP NHẬT PHẦN RENDER ===
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Cột thông tin Hộ khẩu (giữ nguyên) */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Thông tin Hộ khẩu</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Mã Hộ khẩu:</strong> {hoKhau.maHoKhau}</Typography>
            <Typography><strong>Chủ hộ:</strong> {hoKhau.chuHo?.hoTen}</Typography>
            <Typography><strong>Địa chỉ:</strong> {hoKhau.diaChi}</Typography>
            <Typography><strong>Ngày lập:</strong> {hoKhau.ngayLap}</Typography>
            <Typography><strong>Số thành viên:</strong> {nhanKhauList.length}</Typography>
          </Paper>
        </Box>
      
        {/* Cột danh sách Nhân khẩu */}
        <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Danh sách Nhân khẩu</Typography>
                  {/* Nút "Thêm Nhân khẩu" bây giờ gọi hàm handleOpenCreateForm */}
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
                    Thêm Nhân khẩu
                  </Button> 
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* Truyền các hàm onEdit và onDelete vào NhanKhauTable */}
              <NhanKhauTable 
                data={nhanKhauList} 
                onEdit={handleOpenEditForm}
                onDelete={handleOpenDeleteDialog}
              />
          </Paper>
        </Box>
      </Box>

      {/* Render Form (thêm prop initialData) */}
      <NhanKhauForm 
        open={openNhanKhauForm}
        onClose={handleCloseForm}
        onSubmit={handleNhanKhauFormSubmit}
        initialData={editingNhanKhau}
      />
      
      {/* Render Dialog xác nhận xóa */}
      <ConfirmationDialog
        open={!!deletingNhanKhauId} // Chuyển số sang boolean (nếu id != null thì open = true)
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận Xóa Nhân khẩu"
        message="Bạn có chắc chắn muốn xóa nhân khẩu này không? Hành động này không thể hoàn tác."
      />
    </>
  );
}