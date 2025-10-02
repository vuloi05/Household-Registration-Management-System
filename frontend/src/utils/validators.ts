import { REGEX_PATTERNS } from './constants';

export const validatePhone = (phone: string): boolean => {
  return REGEX_PATTERNS.PHONE.test(phone);
};

export const validateEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

export const validateIdentityCard = (cardNumber: string): boolean => {
  return REGEX_PATTERNS.IDENTITY_CARD.test(cardNumber);
};

export const validateHouseholdCode = (code: string): boolean => {
  return REGEX_PATTERNS.HOUSEHOLD_CODE.test(code);
};

export const validateAge = (birthDate: string, minAge = 0, maxAge = 150): boolean => {
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  return age >= minAge && age <= maxAge;
};

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  return new Date(startDate) <= new Date(endDate);
};