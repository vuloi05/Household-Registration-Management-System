// src/pages/HoKhauDetailPage.tsx
import {
  Box, Typography, Paper, CircularProgress, Divider, Button,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tab
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
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
import { formatDateByLang } from '../utils/formatUtils';

// Import Component & Type
import NhanKhauForm from '../components/forms/NhanKhauForm';
import type { NhanKhauFormValues } from '../types/nhanKhau';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import NhanKhauDetailModal from '../components/details/NhanKhauDetailModal';

// Component Bảng hiển thị danh sách Nhân khẩu
function NhanKhauTable({ data, onDetail, onEdit, onDelete }: { data: NhanKhau[], onDetail: (nhanKhau: NhanKhau) => void, onEdit: (nhanKhau: NhanKhau) => void, onDelete: (id: number) => void }) {
    const { t } = useTranslation(['hoKhau', 'nhanKhau']);
    if (data.length === 0) {
        return <Typography sx={{ mt: 2, fontStyle: 'italic' }}>{t('hoKhau:no_members')}</Typography>;
    }
    return (
      <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('nhanKhau:col_fullname')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('nhanKhau:col_dob')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('nhanKhau:col_relationship')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('nhanKhau:col_actions')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map(nk => (
                    <TableRow key={nk.id} hover>
                        <TableCell>{nk.hoTen}</TableCell>
                        <TableCell>{formatDateByLang(nk.ngaySinh)}</TableCell>
                        <TableCell>{nk.quanHeVoiChuHo}</TableCell>
                        <TableCell align="right">
                            <IconButton title={t('nhanKhau:tooltip_view_details')} size="small" color="primary" onClick={() => onDetail(nk)}><VisibilityIcon fontSize="small" /></IconButton>
                            <IconButton title={t('nhanKhau:tooltip_edit')} size="small" onClick={() => onEdit(nk)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton title={t('nhanKhau:tooltip_delete')} size="small" color="error" onClick={() => onDelete(nk.id)}><DeleteIcon fontSize="small" /></IconButton>
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
    const { t } = useTranslation('hoKhau');
    if (data.length === 0) {
        return <Typography sx={{ mt: 2, fontStyle: 'italic' }}>{t('no_change_history')}</Typography>;
    }
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('history_col_date')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('history_col_type')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('history_col_content')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index} hover>
                            <TableCell>{formatDateByLang(item.ngay)}</TableCell>
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
  const { t } = useTranslation('hoKhau');
  const { enqueueSnackbar } = useSnackbar();
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
            setNhanKhauList(hoKhauData.thanhVien || []); 
            const lichSuData = await getLichSuThayDoi(hoKhauData.id);
            setLichSuList(lichSuData);
          } else {
            setHoKhau(null);
            setNhanKhauList([]);
            setLichSuList([]);
          }
        } catch (error) {
          console.error('Failed to fetch details:', error);
          enqueueSnackbar(t('error_fetching_details'), { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [maHoKhau, enqueueSnackbar, t]);
  
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
          enqueueSnackbar(t('update_member_success'), { variant: 'success' });
        } else {
          const created = await createNhanKhau(hoKhau.id, data);
          setNhanKhauList(list => [...list, created]);
          enqueueSnackbar(t('add_member_success'), { variant: 'success' });
        }
        handleCloseForm();
      } catch (error) {
        console.error("Failed to submit NhanKhau form:", error);
        enqueueSnackbar(editingNhanKhau ? t('error_updating_member') : t('error_adding_member'), { variant: 'error' });
      }
  };

  const handleOpenDeleteDialog = (id: number) => setDeletingNhanKhauId(id);
  const handleCloseDeleteDialog = () => setDeletingNhanKhauId(null);
  const handleDeleteConfirm = async () => {
      if (!hoKhau || deletingNhanKhauId === null) return;
      try {
        await deleteNhanKhau(hoKhau.id, deletingNhanKhauId);
        setNhanKhauList(list => list.filter(item => item.id !== deletingNhanKhauId));
        enqueueSnackbar(t('delete_member_success'), { variant: 'success' });
        handleCloseDeleteDialog();
      } catch (error) {
        console.error("Failed to delete NhanKhau:", error);
        enqueueSnackbar(t('error_deleting_member'), { variant: 'error' });
      }
  };

  const handleOpenDetailModal = async (nhanKhau: NhanKhau) => {
    try {
      setDetailLoading(true);
      setDetailModalOpen(true);
      const fullDetail = await getNhanKhauById(nhanKhau.id);
      setSelectedNhanKhau(fullDetail);
    } catch (error) {
      console.error("Failed to fetch NhanKhau details:", error);
      enqueueSnackbar(t('error_fetching_member_details'), { variant: 'error' });
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
    return <Typography>{t('household_not_found')}</Typography>;
  }

  return (
    <>
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ho-khau')} sx={{ mb: 2 }} variant="outlined">
          {t('back_button')}
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          {t('detail_page_title', { id: hoKhau.maHoKhau })}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Paper sx={{ p: 2, width: { xs: '100%', md: '33.33%' }, alignSelf: 'flex-start' }}>
            <Typography variant="h6" gutterBottom>{t('info_title')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>{t('col_household_id')}:</strong> {hoKhau.maHoKhau}</Typography>
            <Typography><strong>{t('col_holder_name')}:</strong> {hoKhau.chuHo?.hoTen}</Typography>
            <Typography><strong>{t('col_address')}:</strong> {hoKhau.diaChi}</Typography>
            <Typography><strong>{t('form_label_creation_date')}:</strong> {formatDateByLang(hoKhau.ngayLap)}</Typography>
            <Typography><strong>{t('member_count')}:</strong> {nhanKhauList.length}</Typography>
          </Paper>
      
          <Paper sx={{ p: 2, width: { xs: '100%', md: '66.67%' } }}>
            <TabContext value={tabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange} aria-label="household details tabs">
                  <Tab label={t('members_tab')} value="1" />
                  <Tab label={t('history_tab')} value="2" />
                </TabList>
              </Box>
              <TabPanel value="1" sx={{ p: 0, pt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{t('members_list_title')}</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
                      {t('add_member_button')}
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
                <Typography variant="h6" sx={{ mb: 2 }}>{t('history_list_title')}</Typography>
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
        title={t('nhanKhau:delete_confirm_title')}
        message={t('nhanKhau:delete_confirm_message', { name: selectedNhanKhau?.hoTen })}
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