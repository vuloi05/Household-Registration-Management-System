// src/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interface cho nhân khẩu
interface NhanKhau {
  id: number;
  hoTen: string;
  biDanh?: string;
  ngaySinh: string;
  gioiTinh?: string;
  noiSinh?: string;
  queQuan?: string;
  danToc?: string;
  ngheNghiep?: string;
  noiLamViec?: string;
  cmndCccd?: string;
  ngayCap?: string;
  noiCap?: string;
  quanHeVoiChuHo: string;
  maHoKhau?: string;
  diaChiHoKhau?: string;
}

// Tính tuổi từ ngày sinh
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Format ngày tháng
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

/**
 * Xuất dữ liệu ra file Excel
 */
export const exportToExcel = (data: NhanKhau[], filename: string = 'Danh_sach_nhan_khau') => {
  // Chuẩn bị dữ liệu cho Excel
  const excelData = data.map((nhanKhau, index) => ({
    'STT': index + 1,
    'Họ và Tên': nhanKhau.hoTen,
    'Bí danh': nhanKhau.biDanh || '',
    'Ngày sinh': formatDate(nhanKhau.ngaySinh),
    'Tuổi': calculateAge(nhanKhau.ngaySinh),
    'Giới tính': nhanKhau.gioiTinh || '',
    'Nơi sinh': nhanKhau.noiSinh || '',
    'Quê quán': nhanKhau.queQuan || '',
    'Dân tộc': nhanKhau.danToc || '',
    'Nghề nghiệp': nhanKhau.ngheNghiep || '',
    'Nơi làm việc': nhanKhau.noiLamViec || '',
    'CMND/CCCD': nhanKhau.cmndCccd || '',
    'Ngày cấp': nhanKhau.ngayCap ? formatDate(nhanKhau.ngayCap) : '',
    'Nơi cấp': nhanKhau.noiCap || '',
    'Quan hệ với chủ hộ': nhanKhau.quanHeVoiChuHo,
    'Mã hộ khẩu': nhanKhau.maHoKhau || '',
    'Địa chỉ hộ khẩu': nhanKhau.diaChiHoKhau || '',
  }));

  // Tạo worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Tự động điều chỉnh độ rộng cột
  const colWidths = [
    { wch: 5 },   // STT
    { wch: 25 },  // Họ và tên
    { wch: 15 },  // Bí danh
    { wch: 12 },  // Ngày sinh
    { wch: 8 },   // Tuổi
    { wch: 10 },  // Giới tính
    { wch: 20 },  // Nơi sinh
    { wch: 20 },  // Quê quán
    { wch: 12 },  // Dân tộc
    { wch: 20 },  // Nghề nghiệp
    { wch: 25 },  // Nơi làm việc
    { wch: 15 },  // CCCD
    { wch: 12 },  // Ngày cấp
    { wch: 20 },  // Nơi cấp
    { wch: 18 },  // Quan hệ
    { wch: 12 },  // Mã HK
    { wch: 30 },  // Địa chỉ
  ];
  ws['!cols'] = colWidths;

  // Tạo workbook và thêm worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhân khẩu');

  // Xuất file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
};

/**
 * Xuất dữ liệu ra file PDF
 */
export const exportToPDF = (data: NhanKhau[], title: string = 'Danh sach Nhan khau') => {
  // Khởi tạo jsPDF với orientation landscape để có nhiều không gian
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Tiêu đề - sử dụng font cơ bản không dấu
  doc.setFontSize(16);
  doc.text('DANH SACH NHAN KHAU', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
  // Ngày xuất
  doc.setFontSize(10);
  const today = new Date().toLocaleDateString('vi-VN');
  doc.text(`Ngay xuat: ${today}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
  doc.text(`Tong so: ${data.length} nguoi`, doc.internal.pageSize.getWidth() / 2, 27, { align: 'center' });

  // Chuẩn bị dữ liệu cho bảng - chuyển tất cả chữ có dấu
  const tableData = data.map((nhanKhau, index) => [
    (index + 1).toString(),
    removeVietnameseTones(nhanKhau.hoTen),
    formatDate(nhanKhau.ngaySinh),
    calculateAge(nhanKhau.ngaySinh).toString(),
    nhanKhau.gioiTinh ? removeVietnameseTones(nhanKhau.gioiTinh) : '',
    nhanKhau.cmndCccd || '',
    nhanKhau.ngheNghiep ? removeVietnameseTones(nhanKhau.ngheNghiep) : '',
    nhanKhau.queQuan ? removeVietnameseTones(nhanKhau.queQuan) : '',
    removeVietnameseTones(nhanKhau.quanHeVoiChuHo),
    nhanKhau.maHoKhau || '',
  ]);

  // Tạo bảng với autoTable
  autoTable(doc, {
    startY: 32,
    head: [
      [
        'STT',
        'Ho va Ten',
        'Ngay sinh',
        'Tuoi',
        'Gioi tinh',
        'CCCD',
        'Nghe nghiep',
        'Que quan',
        'Quan he',
        'Ma HK',
      ],
    ],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [211, 47, 47], // Màu đỏ primary
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 28 },
      6: { cellWidth: 28 },
      7: { cellWidth: 28 },
      8: { cellWidth: 22 },
      9: { cellWidth: 18, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 32 },
  });

  // Xuất file
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`${title.replace(/\s+/g, '_')}_${timestamp}.pdf`);
};

// Hàm bỏ dấu tiếng Việt
const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
  
  return str;
};
