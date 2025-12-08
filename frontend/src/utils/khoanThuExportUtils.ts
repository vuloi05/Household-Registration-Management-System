// src/utils/khoanThuExportUtils.ts

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { setupVietnameseFont } from './fonts/setupFonts';
import type { KhoanThu } from '../api/khoanThuApi';

export const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export type ExportRow = {
  hoTen: string;
  diaChi: string;
  ngayNop?: string | '';
  soTien?: number | 0;
};

// Hàm xuất Excel
export const exportToExcel = (rows: ExportRow[]) => {
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

// Tạo PDF document (dùng chung cho export và preview)
const createPDFDocument = (rows: ExportRow[], khoanThu: KhoanThu): jsPDF => {
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
  
  return doc;
};

// Hàm tạo PDF và trả về blob URL để preview
export const generatePDFBlobUrl = (rows: ExportRow[], khoanThu: KhoanThu): string => {
  const doc = createPDFDocument(rows, khoanThu);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return pdfUrl;
};

// Hàm xuất PDF
export const exportToPDF = (rows: ExportRow[], khoanThu: KhoanThu) => {
  const doc = createPDFDocument(rows, khoanThu);
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Danh_sach_cac_ho_${timestamp}.pdf`;
  doc.save(fileName);
};

