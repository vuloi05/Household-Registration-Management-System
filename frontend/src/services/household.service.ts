import apiClient from './api.config';
import { 
  Household, 
  HouseholdFormData, 
  HouseholdChange,
  SplitHouseholdRequest 
} from '@types/household.types';
import { PaginatedResponse, SearchParams } from '@types/common.types';

class HouseholdService {
  private readonly BASE_URL = '/households';

  async getAll(params?: SearchParams): Promise<PaginatedResponse<Household>> {
    return apiClient.get(this.BASE_URL, { params });
  }

  async getById(id: number): Promise<Household> {
    return apiClient.get(`${this.BASE_URL}/${id}`);
  }

  async create(data: HouseholdFormData): Promise<Household> {
    return apiClient.post(this.BASE_URL, data);
  }

  async update(id: number, data: Partial<HouseholdFormData>): Promise<Household> {
    return apiClient.put(`${this.BASE_URL}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  async getMembers(householdId: number): Promise<any[]> {
    return apiClient.get(`${this.BASE_URL}/${householdId}/members`);
  }

  async splitHousehold(data: SplitHouseholdRequest): Promise<Household> {
    return apiClient.post(`${this.BASE_URL}/split`, data);
  }

  async getHistory(householdId: number): Promise<HouseholdChange[]> {
    return apiClient.get(`${this.BASE_URL}/${householdId}/history`);
  }

  async searchByCode(code: string): Promise<Household[]> {
    return apiClient.get(`${this.BASE_URL}/search`, { params: { code } });
  }

  async exportExcel(params?: SearchParams): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/export`, {
      params,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }
}

export const householdService = new HouseholdService();