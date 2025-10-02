export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface SearchParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum ResidentStatus {
  PERMANENT = 'PERMANENT',
  TEMPORARY_ABSENT = 'TEMPORARY_ABSENT',
  TEMPORARY_RESIDENCE = 'TEMPORARY_RESIDENCE',
  DECEASED = 'DECEASED',
  MOVED = 'MOVED'
}