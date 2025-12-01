// src/pages/UserPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  InputAdornment,
  Stack,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from '../api/userApi';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function UserPage() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State cho dữ liệu người dùng
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State cho form dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'ROLE_ACCOUNTANT' as 'ROLE_ADMIN' | 'ROLE_ACCOUNTANT',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // State cho delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Load users data
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers(page, rowsPerPage, debouncedSearchTerm);
      setUserList(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error loading users:', error);
      enqueueSnackbar('Không thể tải danh sách người dùng', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchTerm, enqueueSnackbar]);

  // Load data when dependencies change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: 'ROLE_ACCOUNTANT',
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't show password
      fullName: user.fullName,
      role: user.role,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: 'ROLE_ACCOUNTANT',
    });
    setFormErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống';
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = 'Mật khẩu không được để trống';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.role) {
      errors.role = 'Vui lòng chọn vai trò';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input change
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingUser) {
        // Update user
        await updateUser(editingUser.id!, formData);
        enqueueSnackbar('Cập nhật người dùng thành công', { variant: 'success' });
      } else {
        // Create user
        await createUser(formData);
        enqueueSnackbar('Thêm người dùng thành công', { variant: 'success' });
      }
      handleCloseDialog();
      loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error?.response?.data?.message || 
                          (editingUser ? 'Không thể cập nhật người dùng' : 'Không thể thêm người dùng');
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Open delete confirmation
  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!userToDelete?.id) return;

    try {
      await deleteUser(userToDelete.id);
      enqueueSnackbar('Xóa người dùng thành công', { variant: 'success' });
      handleCloseDeleteDialog();
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể xóa người dùng';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    return role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Kế toán';
  };

  // Get role color
  const getRoleColor = (role: string): 'error' | 'primary' => {
    return role === 'ROLE_ADMIN' ? 'error' : 'primary';
  };

  // Memoized displayed data
  const displayedUsers = useMemo(() => userList, [userList]);

  // Render mobile card view
  const renderMobileCard = (user: User) => (
    <Card key={user.id} sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {user.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tên đăng nhập: {user.username}
              </Typography>
            </Box>
            <Chip 
              label={getRoleLabel(user.role)} 
              color={getRoleColor(user.role)}
              size="small"
            />
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => handleOpenEditDialog(user)}
        >
          Sửa
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleOpenDeleteDialog(user)}
        >
          Xóa
        </Button>
      </CardActions>
    </Card>
  );

  // Render skeleton loading
  const renderSkeletonCards = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="40%" />
          </CardContent>
        </Card>
      ))}
    </>
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'stretch' : 'center'}
        spacing={2}
        mb={3}
      >
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
          Quản lý người dùng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          fullWidth={isMobile}
        >
          Thêm người dùng
        </Button>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Tìm kiếm theo tên đăng nhập, họ tên, vai trò..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Content */}
      {loading ? (
        isMobile ? (
          renderSkeletonCards()
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )
      ) : isMobile ? (
        /* Mobile card view */
        <>
          {displayedUsers.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Không tìm thấy người dùng
              </Typography>
            </Paper>
          ) : (
            displayedUsers.map(renderMobileCard)
          )}
        </>
      ) : (
        /* Desktop table view */
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên đăng nhập</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vai trò</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">
                      Không tìm thấy người dùng
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage={isMobile ? 'Số dòng:' : 'Số dòng mỗi trang:'}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} trong ${count}`
        }
        sx={{
          mt: 2,
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
          },
        }}
      />

      {/* User Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Tên đăng nhập"
              value={formData.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              error={!!formErrors.username}
              helperText={formErrors.username}
              fullWidth
              required
            />
            <TextField
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              error={!!formErrors.password}
              helperText={
                formErrors.password ||
                (editingUser ? 'Để trống nếu không muốn thay đổi' : '')
              }
              fullWidth
              required={!editingUser}
            />
            <TextField
              label="Họ tên"
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              fullWidth
              required
            />
            <FormControl fullWidth required error={!!formErrors.role}>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
                label="Vai trò"
              >
                <MenuItem value="ROLE_ADMIN">Quản trị viên</MenuItem>
                <MenuItem value="ROLE_ACCOUNTANT">Kế toán</MenuItem>
              </Select>
              {formErrors.role && (
                <FormHelperText>{formErrors.role}</FormHelperText>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingUser ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.fullName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
