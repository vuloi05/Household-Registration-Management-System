// src/pages/KhoanThuDetailPage.tsx
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import PeopleIcon from '@mui/icons-material/People';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StatCard from '../components/dashboard/StatCard';

import { getKhoanThuById, getLichSuNopTienByKhoanThuId, getThongKeKhoanThu } from '../api/khoanThuApi';
import { getDanhSachHoKhau } from '../api/hoKhauApi';
import type { HoKhau } from '../api/hoKhauApi';
import type { KhoanThu, ThongKeKhoanThu } from '../api/khoanThuApi';
import type { LichSuNopTien } from '../api/nopTienApi';
import { formatCurrency } from '../utils/khoanThuExportUtils';
import KhoanThuExportDialog from '../components/khoanThu/KhoanThuExportDialog';

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

export default function KhoanThuDetailPage() {
  const { t } = useTranslation('thuPhi');
  const { khoanThuId } = useParams<{ khoanThuId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
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
        } catch (error) { 
          console.error('Failed to fetch details:', error);
          enqueueSnackbar(t('error_fetching_details'), { variant: 'error' });
        } 
        finally { setLoading(false); }
      };
      fetchData();
    }
  }, [khoanThuId, enqueueSnackbar, t]);

  // Fetch all households once for UNPAID export
  useEffect(() => {
    (async () => {
      try {
        const all = await getDanhSachHoKhau();
        setAllHouseholds(all);
      } catch {
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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!khoanThu || !thongKe) {
    return <Typography>{t('fee_not_found')}</Typography>;
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
        {t('back_button')}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {t('detail_page_title', { name: khoanThu.tenKhoanThu })}
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
            {t('export_excel')}
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
            {t('export_pdf')}
          </Button>
        </Box>
      </Box>

      {/* Export Dialog */}
      {khoanThu && (
        <KhoanThuExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          exportType={exportType}
          khoanThu={khoanThu}
          lichSuList={lichSuList}
          allHouseholds={allHouseholds}
          makeSearchableText={makeSearchableText}
        />
      )}

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
            title={t('stat_paid_households')}
            value={`${thongKe.soHoDaNop} / ${thongKe.tongSoHo}`}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="info.main"
        />
        <StatCard 
            title={t('stat_total_collected')}
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
          placeholder={t('search_placeholder')}
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
          {t('search_helper')}
        </Typography>
      </Box>
      
      <Paper sx={{ p: 2, width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t('paid_list_title')}</Typography>
        <TableContainer sx={{ width: '100%' }}>
          <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>{t('col_holder_name')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>{t('col_address')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>{t('col_payment_date')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', width: '10%' }}>{t('col_amount')}</TableCell>
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
          {showUnpaid ? t('hide_unpaid_list') : t('show_unpaid_list')}
        </Button>
      </Box>

      {showUnpaid && (
        <Paper sx={{ p: 2, width: '100%', mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('unpaid_list_title')}</Typography>
          <TableContainer sx={{ width: '100%' }}>
            <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>{t('col_holder_name')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>{t('col_address')}</TableCell>
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