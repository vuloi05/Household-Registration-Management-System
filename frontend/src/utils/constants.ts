export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  HOUSEHOLDS: '/households',
  RESIDENTS: '/residents',
  FEES: '/fees',
  STATISTICS: '/statistics',
};

export const DATE_FORMAT = {
  DATE: 'DD/MM/YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
  MONTH_YEAR: 'MM/YYYY',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

export const REGEX_PATTERNS = {
  PHONE: /^(0|\+84)[0-9]{9,10}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  IDENTITY_CARD: /^[0-9]{9,12}$/,
  HOUSEHOLD_CODE: /^HK[0-9]{6}$/,
};

export const RESIDENT_STATUS_LABELS = {
  PERMANENT: 'Thường trú',
  TEMPORARY_ABSENT: 'Tạm vắng',
  TEMPORARY_RESIDENCE: 'Tạm trú',
  DECEASED: 'Đã qua đời',
  MOVED: 'Đã chuyển đi',
};

export const FEE_FREQUENCY_LABELS = {
  MONTHLY: 'Hàng tháng',
  QUARTERLY: 'Hàng quý',
  ANNUALLY: 'Hàng năm',
  ONE_TIME: 'Một lần',
};

export const USER_ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  LEADER: 'Tổ trưởng',
  DEPUTY_LEADER: 'Tổ phó',
  ACCOUNTANT: 'Kế toán',
  STAFF: 'Cán bộ',
};