import { useTranslation } from 'react-i18next';
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

// Helper function to extract error message from unknown error
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response;
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
        return data.message;
      }
    }
  }
  return defaultMessage;
}

export default function UserPage() {
  const { t } = useTranslation('user');
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
    role: 'ROLE_ACCOUNTANT' as 'ROLE_ADMIN' | 'ROLE_ACCOUNTANT' | 'ROLE_RESIDENT',
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
      enqueueSnackbar(t('error_loading_users'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchTerm, enqueueSnackbar, t]);

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
      errors.username = t('validation_username_required');
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = t('validation_password_required');
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = t('validation_password_min_length');
    }

    if (!formData.fullName.trim()) {
      errors.fullName = t('validation_fullname_required');
    }

    if (!formData.role) {
      errors.role = t('validation_role_required');
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
        enqueueSnackbar(t('update_user_success'), { variant: 'success' });
      } else {
        // Create user
        await createUser(formData);
        enqueueSnackbar(t('add_user_success'), { variant: 'success' });
      }
      handleCloseDialog();
      loadUsers();
    } catch (error: unknown) {
      console.error('Error saving user:', error);
      const defaultMessage = editingUser ? t('update_user_error') : t('add_user_error');
      const errorMessage = getErrorMessage(error, defaultMessage);
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
      enqueueSnackbar(t('delete_user_success'), { variant: 'success' });
      handleCloseDeleteDialog();
      loadUsers();
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const errorMessage = getErrorMessage(error, t('delete_user_error'));
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return t('role_admin');
      case 'ROLE_ACCOUNTANT':
        return t('role_accountant');
      case 'ROLE_RESIDENT':
        return t('role_resident');
      default:
        return role;
    }
  };

  // Get role color
  const getRoleColor = (role: string): 'error' | 'primary' | 'default' => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'error';
      case 'ROLE_ACCOUNTANT':
        return 'primary';
      default:
        return 'default';
    }
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
                {t('username')}: {user.username}
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
          {t('edit')}
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleOpenDeleteDialog(user)}
        >
          {t('delete')}
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
          {t('title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          fullWidth={isMobile}
        >
          {t('add_user')}
        </Button>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        placeholder={t('search_placeholder')}
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
                {t('no_users_found')}
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
                <TableCell sx={{ fontWeight: 'bold' }}>{t('username')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('full_name')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('role')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {t('actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">
                      {t('no_users_found')}
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
        labelRowsPerPage={t('rows_per_page')}
        labelDisplayedRows={({ from, to, count }) =>
          t('pagination_display', { from, to, count })
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
          {editingUser ? t('edit_user_title') : t('add_user_title')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label={t('username')}
              value={formData.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              error={!!formErrors.username}
              helperText={formErrors.username}
              fullWidth
              required
            />
            <TextField
              label={t('password')}
              type="password"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
              error={!!formErrors.password}
              helperText={
                formErrors.password ||
                (editingUser ? t('password_edit_helper') : '')
              }
              fullWidth
              required={!editingUser}
            />
            <TextField
              label={t('full_name')}
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              fullWidth
              required
            />
            <FormControl fullWidth required error={!!formErrors.role}>
              <InputLabel>{t('role')}</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
                label={t('role')}
              >
                <MenuItem value="ROLE_ADMIN">{t('role_admin')}</MenuItem>
                <MenuItem value="ROLE_ACCOUNTANT">{t('role_accountant')}</MenuItem>
                <MenuItem value="ROLE_RESIDENT">{t('role_resident')}</MenuItem>
              </Select>
              {formErrors.role && (
                <FormHelperText>{formErrors.role}</FormHelperText>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingUser ? t('update') : t('add')}
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
        <DialogTitle>{t('confirm_delete_title')}</DialogTitle>
        <DialogContent>
          <Typography dangerouslySetInnerHTML={{ __html: t('confirm_delete_message', { name: userToDelete?.fullName }) }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog}>{t('cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
