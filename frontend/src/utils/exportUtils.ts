// src/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVietnameseFont } from './fonts/setupFonts';

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
 * Tạo PDF document từ dữ liệu nhân khẩu (dùng chung cho export và preview)
 */
const createPDFDocument = (data: NhanKhau[], title: string = 'Danh sách Nhân khẩu'): jsPDF => {
  // Khởi tạo jsPDF với orientation landscape để có nhiều không gian
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Thêm font tiếng Việt
  setupVietnameseFont(doc);

  // Tiêu đề - GIỮ NGUYÊN TIẾNG VIỆT CÓ DẤU
  doc.setFontSize(16);
  doc.setFont('Roboto', 'bold');
  doc.text(title.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
  // Ngày xuất
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  const today = new Date().toLocaleDateString('vi-VN');
  doc.text(`Ngày xuất: ${today}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
  doc.text(`Tổng số: ${data.length} người`, doc.internal.pageSize.getWidth() / 2, 27, { align: 'center' });

  // Chuẩn bị dữ liệu cho bảng - GIỮ NGUYÊN TIẾNG VIỆT CÓ DẤU
  const tableData = data.map((nhanKhau, index) => [
    (index + 1).toString(),
    nhanKhau.hoTen, // Giữ nguyên tiếng Việt
    formatDate(nhanKhau.ngaySinh),
    calculateAge(nhanKhau.ngaySinh).toString(),
    nhanKhau.gioiTinh || '', // Giữ nguyên tiếng Việt
    nhanKhau.cmndCccd || '',
    nhanKhau.ngheNghiep || '', // Giữ nguyên tiếng Việt
    nhanKhau.queQuan || '', // Giữ nguyên tiếng Việt
    nhanKhau.quanHeVoiChuHo, // Giữ nguyên tiếng Việt
    nhanKhau.maHoKhau || '',
  ]);

  // Tạo bảng với autoTable
  autoTable(doc, {
    startY: 32,
    head: [
      [
        'STT',
        'Họ và Tên',
        'Ngày sinh',
        'Tuổi',
        'Giới tính',
        'CCCD',
        'Nghề nghiệp',
        'Quê quán',
        'Quan hệ',
        'Mã HK',
      ],
    ],
    body: tableData,
    styles: {
      font: 'Roboto', // Sử dụng font Roboto
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

  return doc;
};

/**
 * Tạo PDF và trả về blob URL để preview
 */
export const generatePDFBlobUrl = (data: NhanKhau[], title: string = 'Danh sách Nhân khẩu'): string => {
  const doc = createPDFDocument(data, title);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return pdfUrl;
};

/**
 * Xuất dữ liệu ra file PDF với font tiếng Việt có dấu
 */
export const exportToPDF = (data: NhanKhau[], title: string = 'Danh sách Nhân khẩu') => {
  const doc = createPDFDocument(data, title);
  // Xuất file
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`${title.replace(/\s+/g, '_')}_${timestamp}.pdf`);
};
