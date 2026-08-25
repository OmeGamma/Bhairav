import { simulateApiCall } from './apiClient';
import type { Alert, DashboardStats } from '../types';
import { mockAlerts, mockDashboardStats } from '../data/mockData';

export const alertService = {
  getAlerts: async (): Promise<Alert[]> => {
    return simulateApiCall(mockAlerts, 800);
  },
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    return simulateApiCall(mockDashboardStats, 600);
  }
};
