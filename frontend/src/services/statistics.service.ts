import apiClient from './api.config';

interface DashboardStats {
  totalHouseholds: number;
  totalResidents: number;
  temporaryAbsent: number;
  temporaryResidence: number;
  monthlyFeeCollection: number;
  maleCount: number;
  femaleCount: number;
  monthlyTrend: Array<{
    month: string;
    category: string;
    value: number;
  }>;
}

class StatisticsService {
  private readonly BASE_URL = '/statistics';

  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get(`${this.BASE_URL}/dashboard`);
  }

  async getPopulationByAge(): Promise<any> {
    return apiClient.get(`${this.BASE_URL}/population/age`);
  }

  async getPopulationByGender(): Promise<any> {
    return apiClient.get(`${this.BASE_URL}/population/gender`);
  }

  async getHouseholdStatistics(): Promise<any> {
    return apiClient.get(`${this.BASE_URL}/households`);
  }

  async getFeeStatistics(year: number): Promise<any> {
    return apiClient.get(`${this.BASE_URL}/fees`, { params: { year } });
  }

  async exportStatisticsReport(type: string, params?: any): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/export/${type}`, {
      params,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }
}

export const statisticsService = new StatisticsService();