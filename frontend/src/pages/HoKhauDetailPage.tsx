// src/pages/HoKhauDetailPage.tsx
import {
  Box, Typography, Paper, CircularProgress, Divider, Button,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tab
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import API
import { getDanhSachHoKhau, getLichSuThayDoi } from '../api/hoKhauApi';
import type { HoKhau, HoKhauLichSu } from '../api/hoKhauApi';
import { createNhanKhau, updateNhanKhau, deleteNhanKhau, getNhanKhauById } from '../api/nhanKhauApi';
import type { NhanKhau } from '../api/nhanKhauApi';

// Import Component & Type
import NhanKhauForm from '../components/forms/NhanKhauForm';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import NhanKhauDetailModal from '../components/details/NhanKhauDetailModal';

// Component Bảng hiển thị danh sách Nhân khẩu
function NhanKhauTable({ data, onDetail, onEdit, onDelete }: { data: NhanKhau[], onDetail: (nhanKhau: NhanKhau) => void, onEdit: (nhanKhau: NhanKhau) => void, onDelete: (id: number) => void }) {
    if (data.length === 0) {
        return <Typography sx={{ mt: 2, fontStyle: 'italic' }}>Chưa có nhân khẩu nào trong hộ này.</Typography>;
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
    );
}

// Component Bảng hiển thị lịch sử thay đổi
function LichSuTable({ data }: { data: HoKhauLichSu[] }) {
    if (data.length === 0) {
        return <Typography sx={{ mt: 2, fontStyle: 'italic' }}>Chưa có lịch sử thay đổi nào.</Typography>;
    }
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Ngày thay đổi</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Loại thay đổi</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Nội dung</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index} hover>
                            <TableCell>{new Date(item.ngay).toLocaleString('vi-VN')}</TableCell>
                            <TableCell>{item.loai}</TableCell>
                            <TableCell>{item.noiDung}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}


export default function HoKhauDetailPage() {
  const { maHoKhau } = useParams<{ maHoKhau: string }>();
  const navigate = useNavigate();
  
  const [hoKhau, setHoKhau] = useState<HoKhau | null>(null);
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhau[]>([]);
  const [lichSuList, setLichSuList] = useState<HoKhauLichSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('1');
  
  const [openNhanKhauForm, setOpenNhanKhauForm] = useState(false);
  const [editingNhanKhau, setEditingNhanKhau] = useState<NhanKhau | null>(null);
  const [deletingNhanKhauId, setDeletingNhanKhauId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNhanKhau, setSelectedNhanKhau] = useState<NhanKhau | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  useEffect(() => {
    if (maHoKhau) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const danhSach = await getDanhSachHoKhau();
          const hoKhauData = danhSach.find(hk => hk.maHoKhau === maHoKhau);
          
          if (hoKhauData) {
            setHoKhau(hoKhauData);
            // Lấy danh sách thành viên trực tiếp từ object hộ khẩu
            setNhanKhauList(hoKhauData.thanhVien || []); 

            // Lấy lịch sử thay đổi
            const lichSuData = await getLichSuThayDoi(hoKhauData.id);
            setLichSuList(lichSuData);
          } else {
            setHoKhau(null);
            setNhanKhauList([]);
            setLichSuList([]);
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
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleOpenCreateForm = () => { setEditingNhanKhau(null); setOpenNhanKhauForm(true); };
  const handleOpenEditForm = (nhanKhau: NhanKhau) => { setEditingNhanKhau(nhanKhau); setOpenNhanKhauForm(true); };
  const handleCloseForm = () => { setOpenNhanKhauForm(false); setEditingNhanKhau(null); };
  const handleNhanKhauFormSubmit = async (data: NhanKhauFormValues) => {
      if (!hoKhau) return;
      try {
        if (editingNhanKhau) {
          const updated = await updateNhanKhau(hoKhau.id, editingNhanKhau.id, data);
          setNhanKhauList(list => list.map(item => item.id === updated.id ? updated : item));
        } else {
          const created = await createNhanKhau(hoKhau.id, data);
          setNhanKhauList(list => [...list, created]);
        }
        handleCloseForm();
      } catch (error) { console.error("Failed to submit NhanKhau form:", error); }
  };

  const handleOpenDeleteDialog = (id: number) => setDeletingNhanKhauId(id);
  const handleCloseDeleteDialog = () => setDeletingNhanKhauId(null);
  const handleDeleteConfirm = async () => {
      if (!hoKhau || deletingNhanKhauId === null) return;
      try {
        await deleteNhanKhau(hoKhau.id, deletingNhanKhauId);
        setNhanKhauList(list => list.filter(item => item.id !== deletingNhanKhauId));
        handleCloseDeleteDialog();
      } catch (error) { console.error("Failed to delete NhanKhau:", error); }
  };

  const handleOpenDetailModal = async (nhanKhau: NhanKhau) => {
    try {
      setDetailLoading(true);
      setDetailModalOpen(true);
      const fullDetail = await getNhanKhauById(nhanKhau.id);
      setSelectedNhanKhau(fullDetail);
    } catch (error) {
      console.error("Failed to fetch NhanKhau details:", error);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    } finally {
      setDetailLoading(false);
    }
  };
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedNhanKhau(null); // Reset state khi đóng modal
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (!hoKhau) {
    return <Typography>Không tìm thấy thông tin hộ khẩu.</Typography>;
  }

  return (
    <>
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ho-khau')} sx={{ mb: 2 }} variant="outlined">
          Quay lại
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          Chi tiết Hộ khẩu: {hoKhau.maHoKhau}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Paper sx={{ p: 2, width: { xs: '100%', md: '33.33%' }, alignSelf: 'flex-start' }}>
            <Typography variant="h6" gutterBottom>Thông tin Chung</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Mã Hộ khẩu:</strong> {hoKhau.maHoKhau}</Typography>
            <Typography><strong>Chủ hộ:</strong> {hoKhau.chuHo?.hoTen}</Typography>
            <Typography><strong>Địa chỉ:</strong> {hoKhau.diaChi}</Typography>
            <Typography><strong>Ngày lập:</strong> {hoKhau.ngayLap}</Typography>
            <Typography><strong>Số thành viên:</strong> {nhanKhauList.length}</Typography>
          </Paper>
      
          <Paper sx={{ p: 2, width: { xs: '100%', md: '66.67%' } }}>
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange} aria-label="household details tabs">
                  <Tab label="Danh sách Thành viên" value="1" />
                  <Tab label="Lịch sử thay đổi" value="2" />
                </TabList>
              </Box>
              <TabPanel value="1" sx={{ p: 0, pt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Thành viên trong hộ</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
                      Thêm Thành viên
                    </Button> 
                </Box>
                <NhanKhauTable 
                  data={nhanKhauList} 
                  onDetail={handleOpenDetailModal}
                  onEdit={handleOpenEditForm}
                  onDelete={handleOpenDeleteDialog}
                />
              </TabPanel>
              <TabPanel value="2" sx={{ p: 0, pt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Lịch sử thay đổi của hộ khẩu</Typography>
                <LichSuTable data={lichSuList} />
              </TabPanel>
            </TabContext>
          </Paper>
        </Box>
      </Box>

      {/* Dialogs and Modals */}
      <NhanKhauForm 
        open={openNhanKhauForm}
        onClose={handleCloseForm}
        onSubmit={handleNhanKhauFormSubmit}
        initialData={editingNhanKhau ? {
          ...editingNhanKhau,
          ngayCap: editingNhanKhau.ngayCap || '',
          noiCap: editingNhanKhau.noiCap || '',
        } : null}
        showMaHoKhauField={false}
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
        loading={detailLoading}
      />
    </>
  );
}