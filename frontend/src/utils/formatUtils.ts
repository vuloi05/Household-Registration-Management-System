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

// Format số tiền thành định dạng VNĐ
export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};