// src/components/forms/NopTienForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Autocomplete
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { nopTienSchema } from '../../types/nopTien';
import type { NopTienInput } from '../../types/nopTien';
import type { HoKhau } from '../../api/hoKhauApi'; // Import kiểu HoKhau để dùng trong Autocomplete

interface NopTienFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NopTienInput) => void;
  danhSachHoKhau: HoKhau[]; // Nhận vào danh sách hộ khẩu để hiển thị trong ô tìm kiếm
}

export default function NopTienForm({ open, onClose, onSubmit, danhSachHoKhau }: NopTienFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NopTienInput>({
    resolver: zodResolver(nopTienSchema),
  });

  // useEffect để reset form với các giá trị mặc định khi modal được mở
  useEffect(() => {
    if (open) {
      reset({ 
        hoKhau: undefined, // Bắt đầu với giá trị rỗng
        soTien: undefined,   // Bắt đầu với giá trị rỗng
        ngayNop: new Date().toISOString().split('T')[0], // Mặc định là ngày hôm nay
        nguoiThu: 'Kế toán A', // Tạm thời, sau này có thể lấy từ thông tin user đăng nhập
      });
    }
  }, [open, reset]);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Ghi nhận Nộp tiền</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            
            {/* --- Ô tìm kiếm và chọn Hộ khẩu --- */}
            <Controller
              name="hoKhau"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field} // Truyền thẳng field vào Autocomplete
                  // `options` là danh sách các lựa chọn
                  options={danhSachHoKhau}
                  // `getOptionLabel` định nghĩa cách hiển thị mỗi lựa chọn
                  getOptionLabel={(option) => `${option.chuHo?.hoTen} - ${option.diaChi}`}
                  // `onChange` được kích hoạt khi người dùng chọn một mục
                  // `newValue` là object HoKhau được chọn, chúng ta chỉ lấy `id` của nó
                  onChange={(_, newValue) => field.onChange(newValue)}
                  // `isOptionEqualToValue` giúp Autocomplete biết lựa chọn nào đang được chọn
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Chọn Hộ khẩu" 
                      required
                      error={!!errors.hoKhau}
                      // Sửa lỗi: Ép kiểu message thành string để tương thích với prop helperText
                      helperText={errors.hoKhau?.message as string}
                    />
                  )}
                />
              )}
            />

            {/* --- Ô nhập Số tiền --- */}
            <Controller
              name="soTien"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field}
                  // Chuyển giá trị từ chuỗi của input sang number
                  // Nếu input rỗng, gửi giá trị null để Zod xử lý
                  onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  // Đảm bảo value của input không bao giờ là null/undefined, tránh warning của React
                  value={field.value ?? ''}
                  required 
                  type="number" 
                  label="Số tiền (VNĐ)"
                  error={!!errors.soTien}
                  helperText={errors.soTien?.message as string}
                />
              )}
            />

            {/* --- Ô chọn Ngày nộp --- */}
            <Controller
              name="ngayNop"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  required 
                  label="Ngày nộp" 
                  type="date" 
                  InputLabelProps={{ shrink: true }} 
                  error={!!errors.ngayNop} 
                  helperText={errors.ngayNop?.message as string} 
                />
              )}
            />

            {/* --- Ô nhập Người thu --- */}
             <Controller
              name="nguoiThu"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  required 
                  label="Người thu" 
                  error={!!errors.nguoiThu} 
                  helperText={errors.nguoiThu?.message as string} 
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">Xác nhận</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}