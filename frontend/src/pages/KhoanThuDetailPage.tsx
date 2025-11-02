// src/pages/KhoanThuDetailPage.tsx

import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Stack, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVietnameseFont } from '../utils/fonts/setupFonts';
import StatCard from '../components/dashboard/StatCard';

import { getKhoanThuById, getLichSuNopTienByKhoanThuId, getThongKeKhoanThu } from '../api/khoanThuApi';
import { getDanhSachHoKhau } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';
import type { KhoanThu, ThongKeKhoanThu } from '../api/khoanThuApi';
import type { LichSuNopTien } from '../api/nopTienApi';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const makeSearchableText = (item: LichSuNopTien): string => {
      const plainAmount = (item.soTien ?? 0).toString();
      return [
        item.hoKhau.chuHo?.hoTen || '',
        item.hoKhau.diaChi || '',
        item.ngayNop || '',
        formatCurrency(item.soTien || 0),
        plainAmount
      ]
        .join(' ')
        .toLowerCase();
    };

type ExportRow = {
  hoTen: string;
  diaChi: string;
  ngayNop?: string | '';
  soTien?: number | 0;
};

// Hàm xuất Excel
const exportToExcel = (rows: ExportRow[]) => {
  const worksheetData = rows.map((item, index) => ({
    'STT': index + 1,
    'Họ tên Chủ hộ': item.hoTen || '',
    'Địa chỉ': item.diaChi || '',
    'Ngày nộp': item.ngayNop || '',
    'Số tiền': item.soTien || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách các hộ');
  
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Danh_sach_cac_ho_${timestamp}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Hàm xuất PDF
const exportToPDF = (rows: ExportRow[], khoanThu: KhoanThu) => {
  const doc = new jsPDF();
  // Embed Vietnamese-capable font (Roboto) so accents render correctly
  setupVietnameseFont(doc);
  
  // Tiêu đề
  doc.setFontSize(16);
  doc.setFont('Roboto', 'bold');
  doc.text('DANH SÁCH CÁC HỘ', 105, 20, { align: 'center' });
  
  // Thông tin khoản thu
  doc.setFontSize(12);
  doc.setFont('Roboto', 'normal');
  doc.text(`Khoản thu: ${khoanThu.tenKhoanThu}`, 20, 35);
  doc.text(`Loại: ${khoanThu.loaiKhoanThu === 'BAT_BUOC' ? 'Bắt buộc' : 'Đóng góp'}`, 20, 42);
  doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 49);
  doc.text(`Tổng số: ${rows.length} hộ`, 20, 56);
  
  // Chuẩn bị dữ liệu cho bảng
  const tableData = rows.map((item, index) => [
    index + 1,
    item.hoTen || '',
    item.diaChi || '',
    item.ngayNop || '',
    formatCurrency(item.soTien || 0)
  ]);
  
  // Tạo bảng với font chuẩn
  autoTable(doc, {
    head: [['STT', 'Họ tên Chủ hộ', 'Địa chỉ', 'Ngày nộp', 'Số tiền']],
    body: tableData,
    startY: 65,
    styles: { 
      fontSize: 9,
      font: 'Roboto',
      fontStyle: 'normal'
    },
    headStyles: { 
      fillColor: [220, 53, 47],
      font: 'Roboto',
      fontStyle: 'bold',
      textColor: [255, 255, 255]
    },
    bodyStyles: {
      font: 'Roboto',
      fontStyle: 'normal'
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 40, halign: 'left' },
      2: { cellWidth: 50, halign: 'left' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Danh_sach_cac_ho_${timestamp}.pdf`;
  doc.save(fileName);
};

export default function KhoanThuDetailPage() {
  const { khoanThuId } = useParams<{ khoanThuId: string }>();
  const navigate = useNavigate();
  const [khoanThu, setKhoanThu] = useState<KhoanThu | null>(null);
  const [lichSuList, setLichSuList] = useState<LichSuNopTien[]>([]);
  const [thongKe, setThongKe] = useState<ThongKeKhoanThu | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredList, setFilteredList] = useState<LichSuNopTien[]>([]);
  const [allHouseholds, setAllHouseholds] = useState<HoKhau[]>([]);
  const [unpaidHouseholds, setUnpaidHouseholds] = useState<HoKhau[]>([]);
  const [showUnpaid, setShowUnpaid] = useState(false);

  // Export dialog state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [exportStatus, setExportStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('PAID');
  const [exportSearchTerm, setExportSearchTerm] = useState('');
  const [exportFrom, setExportFrom] = useState<string>('');
  const [exportTo, setExportTo] = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    if (khoanThuId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const id = parseInt(khoanThuId, 10);
          const [khoanThuData, lichSuData, thongKeData] = await Promise.all([
            getKhoanThuById(id),
            getLichSuNopTienByKhoanThuId(id),
            getThongKeKhoanThu(id)
          ]);
          setKhoanThu(khoanThuData);
          setLichSuList(lichSuData);
          setThongKe(thongKeData);

          const paidHouseholdIds = new Set(lichSuData.map(item => item.hoKhau.id));
          const allHouseholds = await getDanhSachHoKhau();
          setAllHouseholds(allHouseholds);
          setUnpaidHouseholds(allHouseholds.filter(h => !paidHouseholdIds.has(h.id)));
        } catch (error) { console.error('Failed to fetch details:', error); } 
        finally { setLoading(false); }
      };
      fetchData();
    }
  }, [khoanThuId]);

  // Fetch all households once for UNPAID export
  useEffect(() => {
    (async () => {
      try {
        const all = await getDanhSachHoKhau();
        setAllHouseholds(all);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Logic tìm kiếm nâng cao
  // - Nếu có hàng thỏa tất cả từ khóa (AND) => hiển thị các hàng đó (tìm chính xác)
  // - Nếu không có hàng thỏa AND => hiển thị các hàng khớp bất kỳ từ khóa nào (OR) để hỗ trợ tìm bao trùm nhiều thực thể
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredList(lichSuList);
      return;
    }

    const searchKeywords = searchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(keyword => keyword.length > 0);

    // Ưu tiên khớp theo cụm từ (n-gram) dài để hỗ trợ tìm "bao trùm" nhiều thực thể
    const buildPhrases = (tokens: string[]): string[] => {
      const phrases: string[] = [];
      // trigrams trước
      for (let i = 0; i <= tokens.length - 3; i++) {
        phrases.push([tokens[i], tokens[i + 1], tokens[i + 2]].join(' '));
      }
      // rồi bigrams
      for (let i = 0; i <= tokens.length - 2; i++) {
        phrases.push([tokens[i], tokens[i + 1]].join(' '));
      }
      // loại trùng lặp, bỏ cụm 1 từ vì gây nhiễu (ví dụ: "Nguyễn")
      return Array.from(new Set(phrases)).filter(p => p.trim().length > 0);
    };

    const numericTokens = searchKeywords.filter(k => /[0-9]/.test(k));
    const wordTokens = searchKeywords.filter(k => !/[0-9]/.test(k));

    const phrases = buildPhrases(wordTokens);

    // 0) Thử khớp theo cụm từ (ít nhất 2 từ)
    if (phrases.length > 0) {
      const phraseMatches = lichSuList.filter(item => {
        const searchableText = makeSearchableText(item);
        const phraseOk = phrases.some(phrase => searchableText.includes(phrase));
        if (!phraseOk) return false;
        // Nếu có số (tiền/ngày), yêu cầu tất cả số xuất hiện trong cùng hàng
        if (numericTokens.length > 0) {
          return numericTokens.every(num => searchableText.includes(num));
        }
        return true;
      });
      if (phraseMatches.length > 0) {
        setFilteredList(phraseMatches);
        return;
      }
    }

    // 1) Exact (AND) matches
    const exactMatches = lichSuList.filter(item => {
      const searchableText = makeSearchableText(item);
      return searchKeywords.every(keyword => searchableText.includes(keyword));
    });

    if (exactMatches.length > 0) {
      setFilteredList(exactMatches);
      return;
    }

    // 2) Fallback to inclusive (OR) matches to allow multiple entities (e.g., two names)
    const inclusiveMatches = lichSuList.filter(item => {
      const searchableText = makeSearchableText(item);
      return searchKeywords.some(keyword => searchableText.includes(keyword));
    });

    setFilteredList(inclusiveMatches);
  }, [searchTerm, lichSuList]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Build export rows based on dialog options
  const buildExportRows = (): ExportRow[] => {
    // Helper compare date within range (inclusive)
    const inRange = (ngay: string | undefined): boolean => {
      if (!ngay) return false;
      if (exportFrom && ngay < exportFrom) return false;
      if (exportTo && ngay > exportTo) return false;
      return true;
    };

    if (exportStatus === 'PAID') {
      const paid = lichSuList.filter(r => {
        if (!exportFrom && !exportTo) return true;
        return inRange(r.ngayNop);
      });
      return paid.filter(item => {
        if (!exportSearchTerm) return true;
        const searchableText = makeSearchableText(item);
        return searchableText.includes(exportSearchTerm.toLowerCase());
      }).map(r => ({
        hoTen: r.hoKhau.chuHo?.hoTen || '',
        diaChi: r.hoKhau.diaChi || '',
        ngayNop: r.ngayNop || '',
        soTien: r.soTien || 0,
      }));
    }

    const hoDaNopIds = new Set(lichSuList.map(r => r.hoKhau.id));

    if (exportStatus === 'UNPAID') {
      return allHouseholds
        .filter(h => !hoDaNopIds.has(h.id))
        .map(h => ({
          hoTen: h.chuHo?.hoTen || '',
          diaChi: h.diaChi || '',
          ngayNop: '',
          soTien: 0,
        }));
    }

    // ALL
    const rowsPaid = lichSuList.filter(r => {
      if (!exportFrom && !exportTo) return true;
      return inRange(r.ngayNop);
    }).map(r => ({
      hoTen: r.hoKhau.chuHo?.hoTen || '',
      diaChi: r.hoKhau.diaChi || '',
      ngayNop: r.ngayNop || '',
      soTien: r.soTien || 0,
    }));

    const rowsUnpaid = allHouseholds
      .filter(h => !hoDaNopIds.has(h.id))
      .map(h => ({
        hoTen: h.chuHo?.hoTen || '',
        diaChi: h.diaChi || '',
        ngayNop: '',
        soTien: 0,
      }));

    return [...rowsPaid, ...rowsUnpaid];
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!khoanThu || !thongKe) {
    return <Typography>Không tìm thấy thông tin khoản thu.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Nút quay lại */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/thu-phi')}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Quay lại
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Chi tiết Khoản thu: {khoanThu.tenKhoanThu}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Nút xuất Excel và PDF - hiển thị cho cả Bắt buộc và Đóng góp */}
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => { setExportType('excel'); setExportOpen(true); }}
            sx={{
              borderColor: '#d32f2f',
              color: '#d32f2f',
              fontWeight: 'bold',
              '&:hover': {
                borderColor: '#b71c1c',
                backgroundColor: '#ffebee'
              }
            }}
          >
            Xuất Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => { setExportType('pdf'); setExportOpen(true); }}
            sx={{
              borderColor: '#d32f2f',
              color: '#d32f2f',
              fontWeight: 'bold',
              '&:hover': {
                borderColor: '#b71c1c',
                backgroundColor: '#ffebee'
              }
            }}
          >
            Xuất PDF
          </Button>
        </Box>
      </Box>

      {/* Export options dialog */}
      <Dialog open={exportOpen} onClose={() => setExportOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tùy chọn xuất {exportType === 'excel' ? 'Excel' : 'PDF'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Đối tượng</InputLabel>
              <Select
                label="Đối tượng"
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value as any)}
              >
                <MenuItem value="PAID">Chỉ hộ đã nộp</MenuItem>
                <MenuItem value="UNPAID">Chỉ hộ chưa nộp</MenuItem>
                <MenuItem value="ALL">Tất cả</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Lọc theo họ tên, địa chỉ..."
              value={exportSearchTerm}
              onChange={(e) => setExportSearchTerm(e.target.value)}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="date"
                label="Từ ngày"
                InputLabelProps={{ shrink: true }}
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                fullWidth
              />
              <TextField
                type="date"
                label="Đến ngày"
                InputLabelProps={{ shrink: true }}
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => {
            // validate date range is required per request
            if (!exportFrom || !exportTo) {
              setToastSeverity('error');
              setToastMsg(`Xuất ${exportType === 'excel' ? 'Excel' : 'PDF'} thất bại: vui lòng chọn Từ ngày và Đến ngày`);
              setToastOpen(true);
              return;
            }
            try {
              const rows = buildExportRows();
              if (exportType === 'excel') {
                exportToExcel(rows);
                setToastSeverity('success');
                setToastMsg('Xuất Excel thành công');
              } else {
                exportToPDF(rows, khoanThu!);
                setToastSeverity('success');
                setToastMsg('Xuất PDF thành công');
              }
              setToastOpen(true);
              setExportOpen(false);
            } catch (e) {
              console.error('Export failed', e);
              setToastSeverity('error');
              setToastMsg(`Xuất ${exportType === 'excel' ? 'Excel' : 'PDF'} thất bại`);
              setToastOpen(true);
            }
          }}>Xuất</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert elevation={6} variant="filled" onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>

      {/* <<<< SỬA LỖI Ở ĐÂY: Dùng Box với CSS Grid thay cho component Grid >>>> */}
      <Box 
        sx={{
          display: 'grid',
          gap: 3,
          mb: 3,
          width: '100%',
          gridTemplateColumns: {
            xs: '1fr', // 1 cột trên màn hình nhỏ
            sm: '1fr 1fr', // 2 cột trên màn hình vừa
          }
        }}
      >
        <StatCard 
            title="Số hộ đã nộp" 
            value={`${thongKe.soHoDaNop} / ${thongKe.tongSoHo}`}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="info.main"
        />
        <StatCard 
            title="Tổng số tiền đã thu" 
            value={formatCurrency(thongKe.tongSoTien)}
            icon={<PaidIcon sx={{ fontSize: 40 }} />}
            color="success.main"
        />
      </Box>
      
      {/* Thanh tìm kiếm */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm theo họ tên, địa chỉ, ngày nộp, số tiền..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#d32f2f',
              },
              '&:hover fieldset': {
                borderColor: '#b71c1c',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#d32f2f',
              },
            },
          }}
        />
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Bạn có thể nhập cả Họ tên và Địa chỉ để tìm kiếm : Nguyễn Đức Trung Hà Nội
        </Typography>
      </Box>
      
      <Paper sx={{ p: 2, width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Danh sách các hộ đã nộp</Typography>
        <TableContainer sx={{ width: '100%' }}>
          <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Họ tên Chủ hộ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Địa chỉ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Ngày nộp</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', width: '10%' }}>Số tiền</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredList.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.hoKhau.chuHo?.hoTen}</TableCell>
                        <TableCell>{item.hoKhau.diaChi}</TableCell> 
                        <TableCell>{item.ngayNop}</TableCell>
                        <TableCell align="right">{formatCurrency(item.soTien)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" onClick={() => setShowUnpaid(!showUnpaid)}>
          {showUnpaid ? 'Ẩn danh sách hộ chưa nộp' : 'Hiển thị danh sách hộ chưa nộp'}
        </Button>
      </Box>

      {showUnpaid && (
        <Paper sx={{ p: 2, width: '100%', mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Danh sách các hộ chưa nộp</Typography>
          <TableContainer sx={{ width: '100%' }}>
            <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Họ tên Chủ hộ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>Địa chỉ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unpaidHouseholds.map((hoKhau) => (
                  <TableRow key={hoKhau.id}>
                    <TableCell>{hoKhau.chuHo?.hoTen}</TableCell>
                    <TableCell>{hoKhau.diaChi}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}