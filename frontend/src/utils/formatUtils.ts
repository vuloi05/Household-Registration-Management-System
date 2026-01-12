// src/utils/formatUtils.ts
import i18n from '../i18n';

// Format ngày theo dd-MM-yyyy. Trả về chuỗi gốc nếu không parse được.
export const formatDate = (value?: string | null): string => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Format ngày theo dd/mm/yyyy. Trả về chuỗi gốc nếu không parse được.
export const formatDateSlash = (value?: string | null): string => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Format số tiền thành định dạng VNĐ
export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

// NEW language-aware function
export const formatDateByLang = (value: string | null | undefined): string => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const targetLang = i18n.language === 'ja' ? 'ja-JP' : 'vi-VN';

    return new Intl.DateTimeFormat(targetLang, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}


