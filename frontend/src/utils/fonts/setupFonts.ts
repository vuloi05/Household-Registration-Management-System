import { jsPDF } from 'jspdf';
import { RobotoRegular } from './Roboto-Regular';
import { RobotoBold } from './Roboto-Bold';
import { RobotoItalic } from './Roboto-Italic';
import { RobotoMedium } from './Roboto-Medium';

/**
 * Thêm font Roboto vào jsPDF để hỗ trợ tiếng Việt có dấu
 */
export const setupVietnameseFont = (doc: jsPDF) => {
  // Thêm font Roboto-Regular
  doc.addFileToVFS('Roboto-Regular.ttf', RobotoRegular);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

  // Thêm font Roboto-Bold
  doc.addFileToVFS('Roboto-Bold.ttf', RobotoBold);
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

  // Thêm font Roboto-Italic
  doc.addFileToVFS('Roboto-Italic.ttf', RobotoItalic);
  doc.addFont('Roboto-Italic.ttf', 'Roboto', 'italic');

  // Thêm font Roboto-Medium
  doc.addFileToVFS('Roboto-Medium.ttf', RobotoMedium);
  doc.addFont('Roboto-Medium.ttf', 'Roboto', 'medium');

  // Set font mặc định
  doc.setFont('Roboto', 'normal');

  return doc;
};
