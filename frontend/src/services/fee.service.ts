import apiClient from './api.config';
import {
  FeeType,
  FeeCollection,
  FeePayment,
  Contribution,
  FeeStatistics,
} from '@types/fee.types';
import { PaginatedResponse, SearchParams } from '@types/common.types';

class FeeService {
  private readonly BASE_URL = '/fees';

  // Fee Types
  async getFeeTypes(): Promise<FeeType[]> {
    return apiClient.get(`${this.BASE_URL}/types`);
  }

  async createFeeType(data: Partial<FeeType>): Promise<FeeType> {
    return apiClient.post(`${this.BASE_URL}/types`, data);
  }

  async updateFeeType(id: number, data: Partial<FeeType>): Promise<FeeType> {
    return apiClient.put(`${this.BASE_URL}/types/${id}`, data);
  }

  // Fee Collections
  async getCollections(params?: SearchParams): Promise<PaginatedResponse<FeeCollection>> {
    return apiClient.get(`${this.BASE_URL}/collections`, { params });
  }

  async createCollection(data: Partial<FeeCollection>): Promise<FeeCollection> {
    return apiClient.post(`${this.BASE_URL}/collections`, data);
  }

  async getCollectionById(id: number): Promise<FeeCollection> {
    return apiClient.get(`${this.BASE_URL}/collections/${id}`);
  }

  // Fee Payments
  async getPayments(collectionId: number): Promise<FeePayment[]> {
    return apiClient.get(`${this.BASE_URL}/collections/${collectionId}/payments`);
  }

  async createPayment(data: Partial<FeePayment>): Promise<FeePayment> {
    return apiClient.post(`${this.BASE_URL}/payments`, data);
  }

  async updatePayment(id: number, data: Partial<FeePayment>): Promise<FeePayment> {
    return apiClient.put(`${this.BASE_URL}/payments/${id}`, data);
  }

  async deletePayment(id: number): Promise<void> {
    return apiClient.delete(`${this.BASE_URL}/payments/${id}`);
  }

  // Contributions
  async getContributions(params?: SearchParams): Promise<PaginatedResponse<Contribution>> {
    return apiClient.get(`${this.BASE_URL}/contributions`, { params });
  }

  async createContribution(data: Partial<Contribution>): Promise<Contribution> {
    return apiClient.post(`${this.BASE_URL}/contributions`, data);
  }

  // Statistics
  async getStatistics(params?: {
    startDate?: string;
    endDate?: string;
    feeTypeId?: number;
  }): Promise<FeeStatistics> {
    return apiClient.get(`${this.BASE_URL}/statistics`, { params });
  }

  async exportPaymentReport(collectionId: number): Promise<Blob> {
    const response = await apiClient.get(
      `${this.BASE_URL}/collections/${collectionId}/export`,
      { responseType: 'blob' }
    );
    return response as unknown as Blob;
  }
}

export const feeService = new FeeService();