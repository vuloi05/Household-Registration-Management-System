// src/components/nhanKhau/NhanKhauTable.tsx

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Button,
  Skeleton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import type { NhanKhau } from '../../api/nhanKhauApi';

interface NhanKhauTableProps {
  nhanKhauList: NhanKhau[];
  displayedNhanKhau: NhanKhau[];
  loading: boolean;
  isMobile: boolean;
  page: number;
  rowsPerPage: number;
  calculateAge: (birthDate: string) => number;
  handleViewDetail: (nhanKhau: NhanKhau) => void;
  handleOpenEditForm: (nhanKhau: NhanKhau) => void;
  handleOpenDeleteDialog: (nhanKhau: NhanKhau) => void;
  handleMenuClick: (event: React.MouseEvent<HTMLElement>, nhanKhau: NhanKhau) => void;
}

export default function NhanKhauTable({
  nhanKhauList,
  displayedNhanKhau,
  loading,
  isMobile,
  page,
  rowsPerPage,
  calculateAge,
  handleViewDetail,
  handleOpenEditForm,
  handleOpenDeleteDialog,
  handleMenuClick,
}: NhanKhauTableProps) {
  if (isMobile) {
    // Mobile: Card view
    return (
      <Box sx={{ width: '100%' }}>
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={30} />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : displayedNhanKhau.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy nhân khẩu nào
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {displayedNhanKhau.map((nhanKhau) => (
              <Card key={nhanKhau.id} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {nhanKhau.hoTen}
                    </Typography>
                    <Chip
                      label={nhanKhau.gioiTinh || 'N/A'}
                      size="small"
                      color={nhanKhau.gioiTinh === 'Nam' ? 'primary' : 'secondary'}
                    />
                  </Box>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>CCCD:</strong> {nhanKhau.cmndCccd || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Ngày sinh:</strong> {new Date(nhanKhau.ngaySinh).toLocaleDateString('vi-VN')} ({calculateAge(nhanKhau.ngaySinh)} tuổi)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Nghề nghiệp:</strong> {nhanKhau.ngheNghiep || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Quan hệ:</strong> {nhanKhau.quanHeVoiChuHo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Mã HK:</strong> {nhanKhau.maHoKhau || 'N/A'}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewDetail(nhanKhau)}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenEditForm(nhanKhau)}
                  >
                    Sửa
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleOpenDeleteDialog(nhanKhau)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  // Desktop: Table view
  return (
    <Paper sx={{ borderRadius: 2, width: '100%' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
          <Table sx={{ width: '100%', tableLayout: 'fixed' }} size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '5%', bgcolor: 'background.paper', zIndex: 1 }}>STT</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '18%', bgcolor: 'background.paper', zIndex: 1 }}>Họ và Tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '11%', bgcolor: 'background.paper', zIndex: 1 }}>Ngày sinh</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '6%', bgcolor: 'background.paper', zIndex: 1 }}>Tuổi</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '9%', bgcolor: 'background.paper', zIndex: 1 }}>Giới tính</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '12%', bgcolor: 'background.paper', zIndex: 1 }}>CCCD</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '14%', bgcolor: 'background.paper', zIndex: 1 }}>Nghề nghiệp</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '11%', bgcolor: 'background.paper', zIndex: 1 }}>Quan hệ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '10%', bgcolor: 'background.paper', zIndex: 1 }}>Mã HK</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: '14%', bgcolor: 'background.paper', zIndex: 1 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nhanKhauList.map((nhanKhau, index) => (
                <TableRow key={nhanKhau.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <Tooltip title={nhanKhau.hoTen}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {nhanKhau.hoTen}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {new Date(nhanKhau.ngaySinh).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>{calculateAge(nhanKhau.ngaySinh)}</TableCell>
                  <TableCell>
                    <Chip
                      label={nhanKhau.gioiTinh || 'N/A'}
                      size="small"
                      color={nhanKhau.gioiTinh === 'Nam' ? 'primary' : 'secondary'}
                      sx={{ fontSize: '0.75rem', height: 24 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{nhanKhau.cmndCccd || 'N/A'}</TableCell>
                  <TableCell sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <Tooltip title={nhanKhau.ngheNghiep || 'N/A'}>
                      <span>{nhanKhau.ngheNghiep || 'N/A'}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={nhanKhau.quanHeVoiChuHo}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 24 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{nhanKhau.maHoKhau || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewDetail(nhanKhau)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditForm(nhanKhau)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(nhanKhau)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Thao tác khác">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, nhanKhau)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {nhanKhauList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không tìm thấy nhân khẩu nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

