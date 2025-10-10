// src/pages/NhanKhauPage.tsx

import {
  Button, Typography, Box, Paper, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect } from 'react';
import HoKhauForm from '../components/forms/HoKhauForm';
import type { HoKhauFormValues } from '../types/hoKhau';
import { createHoKhau, getDanhSachHoKhau, updateHoKhau, deleteHoKhau } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';


export default function NhanKhauPage() {
  const [openForm, setOpenForm] = useState(false);
  const [hoKhauList, setHoKhauList] = useState<HoKhau[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHoKhau, setEditingHoKhau] = useState<HoKhau | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHoKhauId, setSelectedHoKhauId] = useState<number | null>(null);

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
  }, []);

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
      } else {
        const newHoKhau = await createHoKhau(data);
        setHoKhauList(prevList => [...prevList, newHoKhau]);
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
        handleCloseDeleteDialog();
      } catch (error) {
        console.error('Failed to delete ho khau:', error);
      }
    }
  };

  return (
    <> 
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Quản lý Hộ khẩu</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateForm}>
            Thêm hộ khẩu mới
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 2, p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Mã Hộ khẩu</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tên Chủ hộ</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {hoKhauList.map((row) => (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>{row.maHoKhau}</TableCell>
                      <TableCell>{row.chuHo?.hoTen}</TableCell>
                      <TableCell>{row.diaChi}</TableCell>
                      <TableCell align="center">
                        <IconButton title="Xem chi tiết" color="primary" component={RouterLink} to={`/hokhau/${row.id}`}>
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
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa hộ khẩu này không? Hành động này không thể hoàn tác."
      />
    </>
  );
}