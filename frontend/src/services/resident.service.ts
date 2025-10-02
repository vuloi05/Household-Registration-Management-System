import apiClient from './api.config';
import {
  Resident,
  ResidentFormData,
  ResidentChange,
  ResidentStatistics,
  TemporaryInfo,
} from '@types/resident.types';
import { PaginatedResponse, SearchParams } from '@types/common.types';

class ResidentService {
  private readonly BASE_URL = '/residents';

  async getAll(params?: SearchParams): Promise<PaginatedResponse<Resident>> {
    return apiClient.get(this.BASE_URL, { params });
  }

  async getById(id: number): Promise<Resident> {
    return apiClient.get(`${this.BASE_URL}/${id}`);
  }

  async create(data: ResidentFormData): Promise<Resident> {
    return apiClient.post(this.BASE_URL, data);
  }

  async update(id: number, data: Partial<ResidentFormData>): Promise<Resident> {
    return apiClient.put(`${this.BASE_URL}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  async getHistory(residentId: number): Promise<ResidentChange[]> {
    return apiClient.get(`${this.BASE_URL}/${residentId}/history`);
  }

  async registerTemporaryAbsence(data: {
    residentId: number;
    info: TemporaryInfo;
  }): Promise<void> {
    return apiClient.post(`${this.BASE_URL}/${data.residentId}/temporary-absence`, data.info);
  }

  async registerTemporaryResidence(data: {
    residentData: ResidentFormData;
    temporaryInfo: TemporaryInfo;
  }): Promise<Resident> {
    return apiClient.post(`${this.BASE_URL}/temporary-residence`, data);
  }

  async getStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ResidentStatistics> {
    return apiClient.get(`${this.BASE_URL}/statistics`, { params });
  }

  async searchByIdentityCard(cardNumber: string): Promise<Resident[]> {
    return apiClient.get(`${this.BASE_URL}/search/identity`, {
      params: { cardNumber },
    });
  }

  async exportExcel(params?: SearchParams): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/export`, {
      params,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }
}

export const residentService = new ResidentService();