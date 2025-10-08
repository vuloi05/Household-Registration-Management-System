// src/pages/HoKhauDetailPage.tsx

import { Box, Typography, Paper, CircularProgress, Divider, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

import { getHoKhauById } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';
import { getDanhSachNhanKhau } from '../api/nhanKhauApi';
import type { NhanKhau } from '../api/nhanKhauApi';

import NhanKhauForm from '../components/forms/NhanKhauForm'; // 1. Import NhanKhauForm
import type { NhanKhauFormValues } from '../types/nhanKhau'; // 2. Import type cho form
import { createNhanKhau } from '../api/nhanKhauApi'; // 3. Import API tạo nhân khẩu

// Component NhanKhauTable giữ nguyên
function NhanKhauTable({ data }: { data: NhanKhau[] }) {
    if (data.length === 0) {
        return <Typography sx={{ mt: 2 }}>Chưa có nhân khẩu nào trong hộ này.</Typography>;
    }
    return (
        <table width="100%" style={{ borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th align="left" style={{ padding: '8px' }}>Họ Tên</th>
                    <th align="left" style={{ padding: '8px' }}>Ngày Sinh</th>
                    <th align="left" style={{ padding: '8px' }}>Quan hệ với chủ hộ</th>
                </tr>
            </thead>
            <tbody>
                {data.map(nk => (
                    <tr key={nk.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>{nk.hoTen}</td>
                        <td style={{ padding: '8px' }}>{nk.ngaySinh}</td>
                        <td style={{ padding: '8px' }}>{nk.quanHeVoiChuHo}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default function HoKhauDetailPage() {
  const { hoKhauId } = useParams<{ hoKhauId: string }>();
  const [hoKhau, setHoKhau] = useState<HoKhau | null>(null);
  const [nhanKhauList, setNhanKhauList] = useState<NhanKhau[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNhanKhauForm, setOpenNhanKhauForm] = useState(false); // 4. State mới cho form nhân khẩu

  useEffect(() => {
    if (hoKhauId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const id = parseInt(hoKhauId, 10);
          const [hoKhauData, nhanKhauData] = await Promise.all([
            getHoKhauById(id),
            getDanhSachNhanKhau(id)
          ]);
          setHoKhau(hoKhauData);
          setNhanKhauList(nhanKhauData);
        } catch (error) {
          console.error('Failed to fetch details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [hoKhauId]);

  // 5. Hàm xử lý submit form nhân khẩu
  const handleNhanKhauFormSubmit = async (data: NhanKhauFormValues) => {
    if (!hoKhauId) return;

    try {
      const id = parseInt(hoKhauId, 10);
      const newNhanKhau = await createNhanKhau(id, data);
      // Cập nhật lại danh sách trên UI
      setNhanKhauList(prevList => [...prevList, newNhanKhau]);
      setOpenNhanKhauForm(false); // Đóng form
    } catch (error) {
      console.error("Failed to create nhan khau:", error);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!hoKhau) {
    return <Typography>Không tìm thấy thông tin hộ khẩu.</Typography>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Cột thông tin Hộ khẩu */}
        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Thông tin Hộ khẩu</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Mã Hộ khẩu:</strong> {hoKhau.maHoKhau}</Typography>
            <Typography><strong>Chủ hộ:</strong> {hoKhau.chuHo}</Typography>
            <Typography><strong>Địa chỉ:</strong> {hoKhau.diaChi}</Typography>
          </Paper>
        </Box>
      
        {/* Cột danh sách Nhân khẩu */}
        <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
          <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Danh sách Nhân khẩu</Typography>

                  {/* 6. Gán sự kiện onClick cho nút */}
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNhanKhauForm(true)}>
                    Thêm Nhân khẩu
                  </Button> 
              </Box>
              <Divider sx={{ my: 2 }} />
              <NhanKhauTable data={nhanKhauList} />
          </Paper>
        </Box>
      </Box>

      {/* 7. Render component NhanKhauForm */}
      <NhanKhauForm 
        open={openNhanKhauForm}
        onClose={() => setOpenNhanKhauForm(false)}
        onSubmit={handleNhanKhauFormSubmit}
      />

    </>
  );
}