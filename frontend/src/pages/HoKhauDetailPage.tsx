// src/pages/HoKhauDetailPage.tsx

import {
  Box, Typography, Paper, CircularProgress, Divider, Button,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import API
import type { HoKhau } from '../api/hoKhauApi';
import { getDanhSachNhanKhau, createNhanKhau, updateNhanKhau, deleteNhanKhau } from '../api/nhanKhauApi';
import type { NhanKhau } from '../api/nhanKhauApi';
import { getDanhSachHoKhau } from '../api/hoKhauApi';

// Import Component & Type
import NhanKhauForm from '../components/forms/NhanKhauForm';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import NhanKhauDetailModal from '../components/details/NhanKhauDetailModal';

/**
 * Component Bảng hiển thị danh sách Nhân khẩu.
 * Nhận vào dữ liệu và các hàm callback để xử lý sự kiện từ component cha.
 */
function NhanKhauTable({ data, onDetail, onEdit, onDelete }: { data: NhanKhau[], onDetail: (nhanKhau: NhanKhau) => void, onEdit: (nhanKhau: NhanKhau) => void, onDelete: (id: number) => void }) {
    if (data.length === 0) {
        return <Typography sx={{ mt: 2, fontStyle: 'italic' }}>Chưa có nhân khẩu nào trong hộ này.</Typography>;
    }
    return (
      <TableContainer sx={{ width: '100%' }}>
        <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Họ Tên</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Ngày Sinh</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Quan hệ với chủ hộ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', width: '25%' }}>Hành động</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map(nk => (
                    <TableRow key={nk.id} hover>
                        <TableCell>{nk.hoTen}</TableCell>
                        <TableCell>{nk.ngaySinh}</TableCell>
                        <TableCell>{nk.quanHeVoiChuHo}</TableCell>
                        <TableCell align="right">
                            <IconButton title="Xem chi tiết" size="small" color="primary" onClick={() => onDetail(nk)}><VisibilityIcon fontSize="small" /></IconButton>
                            <IconButton title="Chỉnh sửa" size="small" onClick={() => onEdit(nk)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton title="Xóa" size="small" color="error" onClick={() => onDelete(nk.id)}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </TableContainer>
    )
}

/**
 * Trang chính hiển thị thông tin chi tiết của một Hộ khẩu và quản lý các Nhân khẩu bên trong.
 */
export default function HoKhauDetailPage() {
  const { maHoKhau } = useParams<{ maHoKhau: string }>();
  const navigate = useNavigate();
  
  // State quản lý dữ liệu
  const [hoKhau, setHoKhau] = useState<HoKhau | null>(null);
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhau[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý trạng thái các Modal
  const [openNhanKhauForm, setOpenNhanKhauForm] = useState(false);
  const [editingNhanKhau, setEditingNhanKhau] = useState<NhanKhau | null>(null);
  const [deletingNhanKhauId, setDeletingNhanKhauId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNhanKhau, setSelectedNhanKhau] = useState<NhanKhau | null>(null);
  
  // Fetch dữ liệu Hộ khẩu và Nhân khẩu khi component được tải lần đầu hoặc khi hoKhauId thay đổi
  useEffect(() => {
    if (maHoKhau) {
      const fetchData = async () => {
        try {
          setLoading(true);
          // Gọi API lấy danh sách tất cả hộ khẩu và tìm đúng maHoKhau
          const danhSach = await getDanhSachHoKhau();
          const hoKhauData = danhSach.find(hk => hk.maHoKhau === maHoKhau);
          if (!hoKhauData) {
            setHoKhau(null);
            setNhanKhauList([]);
          } else {
            setHoKhau(hoKhauData);
            const nhanKhauData = await getDanhSachNhanKhau(hoKhauData.id);
            setNhanKhauList(nhanKhauData);
          }
        } catch (error) {
          console.error('Failed to fetch details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [maHoKhau]);
  
  // ---- Logic cho Form (Thêm & Sửa) ----
  const handleOpenCreateForm = () => { setEditingNhanKhau(null); setOpenNhanKhauForm(true); };
  const handleOpenEditForm = (nhanKhau: NhanKhau) => { setEditingNhanKhau(nhanKhau); setOpenNhanKhauForm(true); };
  const handleCloseForm = () => { setOpenNhanKhauForm(false); setEditingNhanKhau(null); };
  const handleNhanKhauFormSubmit = async (data: NhanKhauFormValues) => {
      if (!hoKhau) return;
      const currentHoKhauId = hoKhau.id;
      try {
        if (editingNhanKhau) {
          const updated = await updateNhanKhau(currentHoKhauId, editingNhanKhau.id, data);
          setNhanKhauList(list => list.map(item => item.id === updated.id ? updated : item));
        } else {
          const created = await createNhanKhau(currentHoKhauId, data);
          setNhanKhauList(list => [...list, created]);
        }
        handleCloseForm();
      } catch (error) { console.error("Failed to submit NhanKhau form:", error); }
  };

  // ---- Logic cho Dialog Xóa ----
  const handleOpenDeleteDialog = (id: number) => setDeletingNhanKhauId(id);
  const handleCloseDeleteDialog = () => setDeletingNhanKhauId(null);
  const handleDeleteConfirm = async () => {
      if (!hoKhau || deletingNhanKhauId === null) return;
      const currentHoKhauId = hoKhau.id;
      try {
        await deleteNhanKhau(currentHoKhauId, deletingNhanKhauId);
        setNhanKhauList(list => list.filter(item => item.id !== deletingNhanKhauId));
        handleCloseDeleteDialog();
      } catch (error) { console.error("Failed to delete NhanKhau:", error); }
  };

  // ---- Logic cho Modal Chi tiết ----
  const handleOpenDetailModal = (nhanKhau: NhanKhau) => { setSelectedNhanKhau(nhanKhau); setDetailModalOpen(true); };
  const handleCloseDetailModal = () => { setDetailModalOpen(false); };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!hoKhau) {
    return <Typography>Không tìm thấy thông tin hộ khẩu.</Typography>;
  }

  return (
    <>
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        {/* Nút quay lại */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/ho-khau')}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Quay lại
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          Chi tiết Hộ khẩu: {hoKhau.maHoKhau}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}>
        {/* Cột thông tin Hộ khẩu */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Thông tin Chung</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Mã Hộ khẩu:</strong> {hoKhau.maHoKhau}</Typography>
            <Typography><strong>Chủ hộ:</strong> {hoKhau.chuHo?.hoTen}</Typography>
            <Typography><strong>Địa chỉ:</strong> {hoKhau.diaChi}</Typography>
            <Typography><strong>Ngày lập:</strong> {hoKhau.ngayLap}</Typography>
            <Typography><strong>Số thành viên:</strong> {nhanKhauList.length}</Typography>
            <Button 
              variant="text" 
              onClick={() => navigate(`/ho-khau/${hoKhau.id}/lich-su-bien-dong`)} 
              sx={{ mt: 2 }}
            >
              Xem lịch sử biến động
            </Button>
          </Paper>
        </Box>
      
        {/* Cột danh sách Nhân khẩu */}
        <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
          <Paper sx={{ p: 2, height: '100%', width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6">Danh sách Thành viên</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
                    Thêm Thành viên
                  </Button> 
              </Box>
              <Divider sx={{ my: 2 }} />
              <NhanKhauTable 
                data={nhanKhauList} 
                onDetail={handleOpenDetailModal}
                onEdit={handleOpenEditForm}
                onDelete={handleOpenDeleteDialog}
              />
          </Paper>
        </Box>
        </Box>
      </Box>

      {/* Các component Dialog sẽ được render ở đây */}
      <NhanKhauForm 
        open={openNhanKhauForm}
        onClose={handleCloseForm}
        onSubmit={handleNhanKhauFormSubmit}
        initialData={editingNhanKhau ? {
          ...editingNhanKhau,
          ngayCap: editingNhanKhau.ngayCap || '',
          noiCap: editingNhanKhau.noiCap || '',
          maHoKhau: editingNhanKhau.maHoKhau || '',
        } : null}
        showMaHoKhauField={false} // Không hiển thị ô nhập mã hộ khẩu cho trang chi tiết hộ khẩu
      />
      <ConfirmationDialog
        open={!!deletingNhanKhauId}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận Xóa Nhân khẩu"
        message="Bạn có chắc chắn muốn xóa nhân khẩu này không? Hành động này không thể hoàn tác."
      />
      <NhanKhauDetailModal 
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        nhanKhau={selectedNhanKhau}
      />
    </>
  );
}