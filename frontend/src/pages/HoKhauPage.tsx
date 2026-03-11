import {
  Button, Typography, Box, Paper, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, CircularProgress, TextField, InputAdornment,
  TablePagination, Avatar, Chip
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import HoKhauForm from '../components/forms/HoKhauForm';
import type { HoKhauFormValues } from '../types/hoKhau';
import { createHoKhau, getDanhSachHoKhau, updateHoKhau, deleteHoKhau } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';


export default function HoKhauPage() {
  const { t } = useTranslation('hoKhau');
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [openForm, setOpenForm] = useState(false);
  const [hoKhauList, setHoKhauList] = useState<HoKhau[]>([]);
  const [filteredHoKhauList, setFilteredHoKhauList] = useState<HoKhau[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHoKhau, setEditingHoKhau] = useState<HoKhau | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHoKhauId, setSelectedHoKhauId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Phân trang client-side để đồng bộ UI với trang Nhân khẩu
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State để theo dõi tìm kiếm từ agent
  const [pendingAgentSearch, setPendingAgentSearch] = useState<{ query: string; triggeredAt: number; statusId?: string } | null>(null);
  const [lastFilteredAt, setLastFilteredAt] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDanhSachHoKhau();
        setHoKhauList(data);
        setFilteredHoKhauList(data);
        setPage(0); // reset page khi tải dữ liệu lần đầu
      } catch (error) {
        console.error('Failed to fetch ho khau list:', error);
        enqueueSnackbar(t('error_fetching'), { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar, t]);

  // Effect để lọc dữ liệu khi có thay đổi từ khóa tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHoKhauList(hoKhauList);
    } else {
      // Tách searchTerm thành các từ khóa
      const keywords = searchTerm.toLowerCase().trim().split(/\s+/).filter(k => k.length > 0);
      
      const filtered = hoKhauList.filter(hoKhau => {
        // Tạo một chuỗi kết hợp tất cả các trường để tìm kiếm
        const searchableText = [
          hoKhau.maHoKhau,
          hoKhau.chuHo?.hoTen || '',
          hoKhau.diaChi
        ].join(' ').toLowerCase();
        
        // Kiểm tra xem tất cả các từ khóa có xuất hiện trong chuỗi kết hợp không
        // Điều này cho phép tìm kiếm kết hợp như "Bùi Tiến Dũng HK055" hoặc "Bùi Tiến Dũng Mộ Lao"
        return keywords.every(keyword => searchableText.includes(keyword));
      });
      
      setFilteredHoKhauList(filtered);
      setLastFilteredAt(Date.now());
    }
    // reset về trang đầu khi filter thay đổi để tránh vượt quá tổng số trang
    setPage(0);
  }, [searchTerm, hoKhauList]);

  // Lắng nghe agent action từ router state
  useEffect(() => {
    const s = location.state as { agentAction?: { type: string; target: string; params?: { q?: string }; statusId?: string } } | null;
    if (s && s.agentAction) {
      const act = s.agentAction;
      if (act.type === 'search' && act.target === 'household_list' && act.params?.q) {
        const query = String(act.params.q).trim();
        if (query) {
          setSearchTerm(query);
          setPendingAgentSearch({ query, triggeredAt: Date.now(), statusId: act.statusId });
          enqueueSnackbar('Agent: Đang tìm kiếm hộ khẩu: ' + query, { variant: 'info' });
        }
      }
    }
    // Clear location state after processing
    navigate(location.pathname, { replace: true });
    // eslint-disable-next-line
  }, [location.state, navigate, enqueueSnackbar]);

  // Xử lý kết quả tìm kiếm từ agent sau khi filter hoàn thành
  useEffect(() => {
    if (!pendingAgentSearch) return;
    if (loading) return;
    if (lastFilteredAt < pendingAgentSearch.triggeredAt) return;
    
    const { query, statusId } = pendingAgentSearch;

    const notifySearchStatus = (text?: string) => {
      if (!statusId) return;
      window.dispatchEvent(
        new CustomEvent('agent-action-status', {
          detail: {
            statusId,
            text: text || `🔎 Đã tìm kiếm hộ khẩu: ${query}`,
            status: 'success',
          },
        })
      );
    };

    if (filteredHoKhauList.length === 0) {
      notifySearchStatus();
      window.dispatchEvent(new CustomEvent('agent-bot-message', {
        detail: `Không tìm thấy hộ khẩu phù hợp với từ khóa "${query}". Vui lòng cung cấp mã hộ khẩu hoặc địa chỉ cụ thể hơn.`,
      }));
      setPendingAgentSearch(null);
      return;
    }

    if (filteredHoKhauList.length === 1) {
      notifySearchStatus();
      const only = filteredHoKhauList[0];
      navigate(`/ho-khau/${encodeURIComponent(only.maHoKhau)}`);
      window.dispatchEvent(new CustomEvent('agent-bot-message', {
        detail: `Đã tìm thấy 1 hộ khẩu có tên chủ hộ là ${query}. Đang mở chi tiết hộ khẩu cho bạn.`,
      }));
      setPendingAgentSearch(null);
      return;
    }

    // Nếu có nhiều hộ khẩu, kiểm tra xem có bao nhiêu hộ khẩu có cùng tên chủ hộ
    const normalized = query.toLowerCase();
    const sameNameCount = filteredHoKhauList.filter(hk => 
      (hk.chuHo?.hoTen || '').toLowerCase() === normalized
    ).length;
    const totalDisplay = sameNameCount > 0 ? sameNameCount : filteredHoKhauList.length;
    
    const detailMessage = totalDisplay >= 2
      ? `Đã tìm thấy ${totalDisplay} hộ khẩu có tên chủ hộ là ${query}. Bạn vui lòng cung cấp thêm chi tiết thông tin như: mã hộ khẩu hay địa chỉ.`
      : `Đã tìm thấy ${totalDisplay} hộ khẩu có tên chủ hộ là ${query}.`;
    
    notifySearchStatus();
    window.dispatchEvent(new CustomEvent('agent-bot-message', { detail: detailMessage }));
    setPendingAgentSearch(null);
  }, [pendingAgentSearch, loading, filteredHoKhauList, navigate, lastFilteredAt]);

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
        const updatedHoKhau = await updateHoKhau(editingHoKhau.id, data);
        setHoKhauList(prevList => 
          prevList.map(item => item.id === updatedHoKhau.id ? updatedHoKhau : item)
        );
        setFilteredHoKhauList(prevList => 
          prevList.map(item => item.id === updatedHoKhau.id ? updatedHoKhau : item)
        );
        enqueueSnackbar(t('update_success'), { variant: 'success' });
      } else {
        const newHoKhau = await createHoKhau(data);
        setHoKhauList(prevList => [...prevList, newHoKhau]);
        setFilteredHoKhauList(prevList => [...prevList, newHoKhau]);
        enqueueSnackbar(t('add_success'), { variant: 'success' });
      }
      handleCloseForm();
    } catch (error) {
      console.error('Failed to submit HoKhau form:', error);
      enqueueSnackbar(editingHoKhau ? t('error_updating') : t('error_adding'), { variant: 'error' });
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
        setFilteredHoKhauList(prevList => prevList.filter(item => item.id !== selectedHoKhauId));
        enqueueSnackbar(t('delete_success'), { variant: 'success' });
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Failed to delete ho khau:', error);
        enqueueSnackbar(t('error_deleting'), { variant: 'error' });
      }
    }
  };

  return (
    <> 
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('title')}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
            {t('add_household')}
          </Button>
        </Box>

        {/* Thanh tìm kiếm - Modern Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Box sx={{ mb: 3, width: '100%' }}>
            <TextField
              fullWidth
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }
                }
              }}
            />
          </Box>
        </motion.div>

        <Paper 
          sx={{ 
            borderRadius: 3, 
            p: 0, 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ width: '100%' }}>
              <Table sx={{ width: '100%', tableLayout: 'fixed' }} size="medium">
                <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          width: '6%',
                          bgcolor: 'grey.50',
                          color: 'text.primary',
                          fontSize: '0.875rem',
                          py: 2,
                          borderBottom: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        {t('col_stt')}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          width: '16%',
                          bgcolor: 'grey.50',
                          color: 'text.primary',
                          fontSize: '0.875rem',
                          py: 2,
                          borderBottom: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        {t('col_household_id')}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          width: '28%',
                          bgcolor: 'grey.50',
                          color: 'text.primary',
                          fontSize: '0.875rem',
                          py: 2,
                          borderBottom: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        {t('col_holder_name')}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 700, 
                          width: '35%',
                          bgcolor: 'grey.50',
                          color: 'text.primary',
                          fontSize: '0.875rem',
                          py: 2,
                          borderBottom: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        {t('col_address')}
                      </TableCell>
                      <TableCell 
                        align="center" 
                        sx={{ 
                          fontWeight: 700, 
                          width: '15%',
                          bgcolor: 'grey.50',
                          color: 'text.primary',
                          fontSize: '0.875rem',
                          py: 2,
                          borderBottom: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        {t('col_actions')}
                      </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHoKhauList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                    <TableRow 
                      key={row.id} 
                      component={motion.tr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'scale(1.001)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          '& .action-buttons': {
                            opacity: 1,
                            transform: 'translateX(0)'
                          }
                        },
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          label={page * rowsPerPage + index + 1} 
                          size="small" 
                          sx={{ 
                            fontWeight: 600,
                            minWidth: 32
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          label={row.maHoKhau} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: 'primary.main',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          >
                            <HomeIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {row.chuHo?.hoTen}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {row.diaChi}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Box 
                          className="action-buttons"
                          sx={{ 
                            display: 'flex', 
                            gap: 0.5, 
                            justifyContent: 'center',
                            opacity: { xs: 1, md: 0.6 },
                            transform: { xs: 'translateX(0)', md: 'translateX(-5px)' },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <IconButton 
                            title={t('tooltip_view_details')} 
                            color="info" 
                            component={RouterLink} 
                            to={`/ho-khau/${row.maHoKhau}`}
                            size="small"
                            sx={{
                              bgcolor: 'info.main',
                              color: 'white',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                bgcolor: 'info.dark',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <InfoIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton 
                            title={t('tooltip_edit')} 
                            onClick={() => handleOpenEditForm(row)}
                            size="small"
                            sx={{
                              bgcolor: 'warning.main',
                              color: 'white',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                bgcolor: 'warning.dark',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton 
                            title={t('tooltip_delete')} 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(row.id)}
                            size="small"
                            sx={{
                              bgcolor: 'error.main',
                              color: 'white',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                bgcolor: 'error.dark',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredHoKhauList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <HomeIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                          <Typography variant="h6" color="text.secondary">
                            {t('no_households_found')}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
        {/* Phân trang - Modern Style */}
        <Paper
          sx={{
            mt: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredHoKhauList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage={t('rows_per_page')}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : to}`}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
                fontWeight: 500
              },
              '.MuiTablePagination-select': {
                fontWeight: 600
              },
              '.MuiTablePagination-actions button': {
                bgcolor: 'action.hover',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }
            }}
          />
        </Paper>
      </Box>

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
        title={t('confirm_delete_title')}
        message={t('confirm_delete_message')}
      />
    </>
  );
}