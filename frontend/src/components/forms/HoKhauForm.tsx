// src/components/forms/HoKhauForm.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import { hoKhauSchema } from '../../types/hoKhau'; // Import schema đã được cập nhật
import type { HoKhauFormValues } from '../../types/hoKhau'; // Import type đã được cập nhật
import { searchNhanKhauByCmndCccd } from '../../api/nhanKhauApi';

interface HoKhauFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HoKhauFormValues) => void;
  // Prop initialData tạm thời chưa dùng cho logic Sửa phức tạp, sẽ nâng cấp sau
  initialData?: unknown; 
}

export default function HoKhauForm({ open, onClose, onSubmit, initialData }: HoKhauFormProps) {
  const isEditMode = !!initialData; // Kiểm tra xem có phải chế độ sửa không
  const [isSearching, setIsSearching] = useState(false);

  // Khởi tạo react-hook-form với schema mới
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HoKhauFormValues>({
    resolver: zodResolver(hoKhauSchema),
    // Giá trị mặc định giờ bao gồm cả object lồng nhau chuHoInfo
    defaultValues: {
        maHoKhau: '',
        diaChi: '',
        ngayLap: '',
        chuHoInfo: {
            hoTen: '',
            ngaySinh: '',
            cmndCccd: ''
        }
    }
  });

  // Watch CCCD field để tự động tìm kiếm khi có thay đổi
  const cmndCccdValue = watch('chuHoInfo.cmndCccd');

  // Hàm tự động tìm kiếm và điền thông tin khi nhập CCCD
  const handleCmndCccdChange = async (cmndCccd: string) => {
    if (cmndCccd && cmndCccd.length >= 9) { // Chỉ tìm kiếm khi có ít nhất 9 ký tự
      setIsSearching(true);
      try {
        const nhanKhau = await searchNhanKhauByCmndCccd(cmndCccd);
        if (nhanKhau) {
          // Tự động điền thông tin nếu tìm thấy
          setValue('chuHoInfo.hoTen', nhanKhau.hoTen);
          setValue('chuHoInfo.ngaySinh', nhanKhau.ngaySinh);
        } else {
          // Nếu không tìm thấy, xóa thông tin đã tự động điền trước đó
          setValue('chuHoInfo.hoTen', '');
          setValue('chuHoInfo.ngaySinh', '');
        }
      } catch (error) {
        console.error('Lỗi khi tìm kiếm nhân khẩu:', error);
        // Nếu có lỗi, cũng xóa thông tin đã tự động điền
        setValue('chuHoInfo.hoTen', '');
        setValue('chuHoInfo.ngaySinh', '');
      } finally {
        setIsSearching(false);
      }
    } else {
      // Nếu CCCD rỗng hoặc không đủ 9 ký tự, xóa thông tin đã tự động điền
      setValue('chuHoInfo.hoTen', '');
      setValue('chuHoInfo.ngaySinh', '');
    }
  };

  // Sử dụng useEffect để reset form khi mở ra
  useEffect(() => {
    if (open) {
      if (isEditMode) {
        // TODO: Xử lý logic điền dữ liệu cho chế độ Sửa sau này
        // reset(initialData); 
      } else {
        // Reset về form trống hoàn toàn cho chế độ Thêm mới
        reset({
            maHoKhau: '', diaChi: '', ngayLap: '',
            chuHoInfo: { hoTen: '', ngaySinh: '', cmndCccd: '' }
        });
      }
    }
  }, [initialData, open, reset, isEditMode]);

  // useEffect để theo dõi thay đổi CCCD và tự động tìm kiếm
  useEffect(() => {
    if (!isEditMode) {
      const timeoutId = setTimeout(() => {
        handleCmndCccdChange(cmndCccdValue || '');
      }, 500); // Debounce 500ms để tránh gọi API quá nhiều

      return () => clearTimeout(timeoutId);
    }
  }, [cmndCccdValue, isEditMode]);

  return (
    // Mở rộng form (`maxWidth="md"`) để có thêm không gian
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEditMode ? 'Cập nhật Hộ khẩu' : 'Thêm Hộ khẩu mới'}
        </DialogTitle>

        <DialogContent>
            {/* === PHẦN THÔNG TIN CHUNG CỦA HỘ KHẨU === */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Thông tin chung</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <Controller name="maHoKhau" control={control} render={({ field }) => (
                    <TextField {...field} required label="Mã Hộ khẩu" error={!!errors.maHoKhau} helperText={errors.maHoKhau?.message} />
                )} />
                {/* Dùng gridColumn: 'span 2' để ô địa chỉ chiếm 2 cột */}
                <Controller name="diaChi" control={control} render={({ field }) => (
                    <TextField {...field} required label="Địa chỉ" error={!!errors.diaChi} helperText={errors.diaChi?.message} sx={{ gridColumn: 'span 2' }} />
                )} />
                <Controller name="ngayLap" control={control} render={({ field }) => (
                    <TextField {...field} required label="Ngày lập" type="date" InputLabelProps={{ shrink: true }} error={!!errors.ngayLap} helperText={errors.ngayLap?.message} />
                )} />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* === PHẦN THÔNG TIN CHỦ HỘ === */}
            {/* Phần này chỉ hiển thị khi ở chế độ Thêm mới */}
            {!isEditMode && (
                <>
                    <Typography variant="h6" sx={{ mb: 1 }}>Thông tin Chủ hộ</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                        {/* Lưu ý cách đặt tên cho các trường lồng nhau: "chuHoInfo.hoTen" */}
                        <Controller name="chuHoInfo.hoTen" control={control} render={({ field }) => (
                            <TextField {...field} required label="Họ tên Chủ hộ" error={!!errors.chuHoInfo?.hoTen} helperText={errors.chuHoInfo?.hoTen?.message} />
                        )} />
                        <Controller name="chuHoInfo.ngaySinh" control={control} render={({ field }) => (
                            <TextField {...field} required label="Ngày sinh Chủ hộ" type="date" InputLabelProps={{ shrink: true }} error={!!errors.chuHoInfo?.ngaySinh} helperText={errors.chuHoInfo?.ngaySinh?.message} />
                        )} />
                        <Controller name="chuHoInfo.cmndCccd" control={control} render={({ field }) => (
                            <TextField 
                                {...field} 
                                required 
                                label="CCCD Chủ hộ" 
                                error={!!errors.chuHoInfo?.cmndCccd} 
                                helperText={errors.chuHoInfo?.cmndCccd?.message || (isSearching ? "Đang tìm kiếm..." : "")}
                                InputProps={{
                                    endAdornment: isSearching ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Tìm kiếm...
                                            </Typography>
                                        </Box>
                                    ) : null
                                }}
                            />
                        )} />
                    </Box>
                </>
            )}
        </DialogContent>
        
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">Lưu</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}