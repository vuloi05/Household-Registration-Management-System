// src/pages/ThuPhiPage.tsx
import {
  Box, Typography, Paper, CircularProgress, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';

// Import API cho Khoản thu
import { getDanhSachKhoanThu, createKhoanThu, updateKhoanThu, deleteKhoanThu } from '../api/khoanThuApi';
import type { KhoanThu, KhoanThuFormValues } from '../api/khoanThuApi';

// Import API, Component và Type cho chức năng Nộp tiền
import { getDanhSachHoKhau } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';
import { ghiNhanNopTien } from '../api/nopTienApi';
import type { NopTienInput } from '../types/nopTien';
import type { NopTienPayLoad } from '../api/nopTienApi';
import NopTienForm from '../components/forms/NopTienForm';

// Import các Component dùng chung
import KhoanThuForm from '../components/forms/KhoanThuForm';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import { formatDateSlash } from '../utils/formatUtils';

import InfoIcon from '@mui/icons-material/Info'; // Import icon Xem chi tiết
import { Link as RouterLink } from 'react-router-dom'; 
import { useSnackbar } from 'notistack';

/**
 * Hàm helper để format số thành định dạng tiền tệ VNĐ.
 * @param value Số tiền cần format.
 * @returns Chuỗi đã được format hoặc 'N/A' nếu giá trị không hợp lệ.
 */
const formatCurrency = (value: number | null | undefined) => {
    if (value == null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

/**
 * Trang chính để quản lý các khoản thu phí và đóng góp.
 */
export default function ThuPhiPage() {
  const { t } = useTranslation('thuPhi');
  const { enqueueSnackbar } = useSnackbar();
  // === CÁC STATE QUẢN LÝ DỮ LIỆU VÀ GIAO DIỆN ===
  const [khoanThuList, setKhoanThuList] = useState<KhoanThu[]>([]);
  const [danhSachHoKhau, setDanhSachHoKhau] = useState<HoKhau[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Form Thêm/Sửa Khoản thu
  const [openForm, setOpenForm] = useState(false);
  const [editingKhoanThu, setEditingKhoanThu] = useState<KhoanThu | null>(null);

  // State quản lý Dialog xác nhận Xóa Khoản thu
  const [deletingKhoanThuId, setDeletingKhoanThuId] = useState<number | null>(null);

  // State quản lý Form Ghi nhận Nộp tiền
  const [openNopTienForm, setOpenNopTienForm] = useState(false);
  const [selectedKhoanThuId, setSelectedKhoanThuId] = useState<number | null>(null);

  // Hook useEffect để tải dữ liệu cần thiết cho trang khi được mở lần đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Tải đồng thời cả danh sách khoản thu và danh sách hộ khẩu
        const [khoanThuData, hoKhauData] = await Promise.all([
            getDanhSachKhoanThu(),
            getDanhSachHoKhau()
        ]);
        setKhoanThuList(khoanThuData);
        setDanhSachHoKhau(hoKhauData);
      } catch (error) { 
        console.error('Failed to fetch page data:', error); 
        // Có thể thêm state để hiển thị thông báo lỗi ra UI
      } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

  // === CÁC HÀM XỬ LÝ SỰ KIỆN ===

  // ---- Logic cho Form Khoản thu (Thêm & Sửa) ----
  const handleOpenCreateForm = () => { setEditingKhoanThu(null); setOpenForm(true); };
  const handleOpenEditForm = (khoanThu: KhoanThu) => { setEditingKhoanThu(khoanThu); setOpenForm(true); };
  const handleCloseForm = () => { setOpenForm(false); setEditingKhoanThu(null); };
  const handleFormSubmit = async (data: KhoanThuFormValues) => {
    try {
      if (editingKhoanThu) {
        const updated = await updateKhoanThu(editingKhoanThu.id, data);
        setKhoanThuList(list => list.map(item => item.id === updated.id ? updated : item));
      } else {
        const created = await createKhoanThu(data);
        setKhoanThuList(prevList => [...prevList, created]);
      }
      handleCloseForm();
    } catch (error) { console.error('Failed to submit KhoanThu form:', error); }
  };

  // ---- Logic cho Dialog Xóa Khoản thu ----
  const handleOpenDeleteDialog = (id: number) => setDeletingKhoanThuId(id);
  const handleCloseDeleteDialog = () => setDeletingKhoanThuId(null);
  const handleDeleteConfirm = async () => {
    if (!deletingKhoanThuId) return;
    try {
      await deleteKhoanThu(deletingKhoanThuId);
      setKhoanThuList(list => list.filter(item => item.id !== deletingKhoanThuId));
      handleCloseDeleteDialog();
    } catch (error) { console.error("Failed to delete KhoanThu:", error); }
  };

  // ---- Logic cho Form Ghi nhận Nộp tiền ----
  const handleOpenNopTienForm = (khoanThuId: number) => {
    setSelectedKhoanThuId(khoanThuId);
    setOpenNopTienForm(true);
  };
  const handleCloseNopTienForm = () => {
    setOpenNopTienForm(false);
    setSelectedKhoanThuId(null);
  };
  const handleNopTienSubmit = async (data: NopTienInput) => {
    if (!selectedKhoanThuId) return;
    try {
      // Lấy id từ object hoKhau
            const payload: NopTienPayLoad = {
                hoKhauId: data.hoKhau.id, 
                khoanThuId: selectedKhoanThuId,
                ngayNop: data.ngayNop,
                soTien: data.soTien,
                nguoiThu: data.nguoiThu,
            };
            await ghiNhanNopTien(payload);
            handleCloseNopTienForm();
            enqueueSnackbar(t('add_payment_success'), { variant: 'success' });
    } catch (error) {
      console.error("Failed to submit nop tien:", error);
      enqueueSnackbar(t('add_payment_error'), { variant: 'error' });
    }
  };


  return (
    <>
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        {/* Header của trang */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('title')}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
            {t('add_fee')}
          </Button>
        </Box>
        
        {/* Body của trang */}
        <Paper sx={{ borderRadius: 2, p: 2, width: '100%' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer sx={{ width: '100%' }}>
                    <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>{t('col_name')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>{t('col_type')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>{t('col_date')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', width: '20%' }}>{t('col_price_per_person')}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>{t('col_actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {khoanThuList.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>{row.tenKhoanThu}</TableCell>
                                <TableCell>{row.loaiKhoanThu === 'BAT_BUOC' ? t('type_mandatory') : t('type_voluntary')}</TableCell>
                                <TableCell>{formatDateSlash(row.ngayTao)}</TableCell>
                                <TableCell align="right">{formatCurrency(row.soTienTrenMotNhanKhau)}</TableCell>
                                

                                <TableCell align="center">
                                    <IconButton 
                                      title={t('tooltip_view_details')} color = "primary" size="small" component={RouterLink} to={`/thu-phi/${row.id}`}>
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton title={t('tooltip_record_payment')} size="small" color="success" onClick={() => handleOpenNopTienForm(row.id)}>
                                      <PaymentIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton title={t('tooltip_edit')} size="small" onClick={() => handleOpenEditForm(row)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton title={t('tooltip_delete')} size="small" color="error" onClick={() => handleOpenDeleteDialog(row.id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>

                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer> 
            )}
        </Paper>
      </Box>

      {/* Các component Dialog sẽ được render ở đây */}
      <KhoanThuForm 
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingKhoanThu} // TODO: Hoàn thiện logic Sửa
      />
      <ConfirmationDialog
        open={deletingKhoanThuId !== null}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title={t('delete_confirm_title')}
        message={t('delete_confirm_message')}
      />
      <NopTienForm
        open={openNopTienForm}
        onClose={handleCloseNopTienForm}
        onSubmit={handleNopTienSubmit}
        danhSachHoKhau={danhSachHoKhau}
      />
    </>
  );
}