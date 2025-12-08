// src/pages/NhanKhauPage.tsx

import {
  Button, Typography, Box, Paper, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, CircularProgress, TextField, InputAdornment,
  TablePagination
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import HoKhauForm from '../components/forms/HoKhauForm';
import type { HoKhauFormValues } from '../types/hoKhau';
import { createHoKhau, getDanhSachHoKhau, updateHoKhau, deleteHoKhau } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';
import { useSnackbar } from 'notistack';


export default function HoKhauPage() {
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      } else {
        const newHoKhau = await createHoKhau(data);
        setHoKhauList(prevList => [...prevList, newHoKhau]);
        setFilteredHoKhauList(prevList => [...prevList, newHoKhau]);
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
        setFilteredHoKhauList(prevList => prevList.filter(item => item.id !== selectedHoKhauId));
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Failed to delete ho khau:', error);
      }
    }
  };

  return (
    <> 
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Quản lý Hộ khẩu</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
            Thêm hộ khẩu mới
          </Button>
        </Box>

        {/* Thanh tìm kiếm */}
        <Box sx={{ mb: 3, width: '100%' }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo mã hộ khẩu, tên chủ hộ hoặc địa chỉ (ví dụ: Bùi Tiến Dũng HK055 hoặc Bùi Tiến Dũng Mộ Lao)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>

        <Paper sx={{ borderRadius: 2, p: 2, width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ width: '100%' }}>
              <Table sx={{ width: '100%', tableLayout: 'fixed' }} size="small">
                <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '6%' }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '16%' }}>Mã Hộ khẩu</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '28%' }}>Tên Chủ hộ</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Địa chỉ</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHoKhauList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{row.maHoKhau}</TableCell>
                      <TableCell>{row.chuHo?.hoTen}</TableCell>
                      <TableCell>{row.diaChi}</TableCell>
                      <TableCell align="center">
                        <IconButton title="Xem chi tiết" color="primary" component={RouterLink} to={`/ho-khau/${row.maHoKhau}`}>
                          <InfoIcon />
                        </IconButton>
                        <IconButton title="Chỉnh sửa" color="secondary" onClick={() => handleOpenEditForm(row)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton title="Xóa" color="error" onClick={() => handleOpenDeleteDialog(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredHoKhauList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Không tìm thấy hộ khẩu nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredHoKhauList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : to}`}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
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
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa hộ khẩu này không? Hành động này không thể hoàn tác."
      />
    </>
  );
}