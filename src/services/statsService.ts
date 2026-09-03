import { API_BASE_URL, fetchWithTimeout } from './apiClient';

export interface DashboardStats {
  cameras_total: number;
  cameras_online: number;
  cameras_offline: number;
  active_alerts: number;
  high_severity_alerts: number;
  persons_count: number;
  vehicles_count: number;
  cases_active: number;
  events_today: number;
  events_total: number;
  relationships_count: number;
  investigations_count: number;
  is_demo_fallback: boolean;
}

const FALLBACK_STATS: DashboardStats = {
  cameras_total: 0,
  cameras_online: 0,
  cameras_offline: 0,
  active_alerts: 0,
  high_severity_alerts: 0,
  persons_count: 0,
  vehicles_count: 0,
  cases_active: 0,
  events_today: 0,
  events_total: 0,
  relationships_count: 0,
  investigations_count: 0,
  is_demo_fallback: true,
};

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/stats/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }, 8000);

      if (!response.ok) {
        return FALLBACK_STATS;
      }
      return await response.json();
    } catch {
      return FALLBACK_STATS;
    }
  },
};
