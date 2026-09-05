import { API_BASE_URL, fetchWithTimeout } from './apiClient';
import type { WelfareCheckIn, SupportRequest, WelfareIndicators } from '../types/welfare';

const FALLBACK: WelfareIndicators = {
  workloadTrend: 'INCREASING',
  restTrend: 'DECREASING',
  fatigueLevel: 'MEDIUM',
  recentCheckIns: [
    { id: 'CHK-1', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Tired', factors: ['Sleep / Rest', 'Workload'] },
    { id: 'CHK-2', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'Okay', factors: ['Operational Pressure'] },
  ],
  activeRequests: [
    { id: 'REQ-101', timestamp: new Date(Date.now() - 43200000).toISOString(), category: 'Recovery', status: 'IN REVIEW' },
  ],
};

async function safeFetch<T>(url: string, options?: RequestInit, timeoutMs = 6000): Promise<T | null> {
  try {
    const token = localStorage.getItem('token');
    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        ...(options || {}),
      },
      timeoutMs,
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export const submitCheckIn = async (status: string, factors: string[]): Promise<WelfareCheckIn> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/welfare/check-ins`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, factors }),
      },
      8000,
    );
    if (response.ok) {
      const data = await response.json();
      return {
        id: data.id || data._id || `CHK-${Math.floor(Math.random() * 10000)}`,
        timestamp: data.timestamp || new Date().toISOString(),
        status: status as any,
        factors,
      };
    }
  } catch {}
  return {
    id: `CHK-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toISOString(),
    status: status as any,
    factors,
  };
};

export const submitSupportRequest = async (category: string, message?: string): Promise<SupportRequest> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/support/requests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ category, message }),
      },
      8000,
    );
    if (response.ok) {
      const data = await response.json();
      return {
        id: data.id || data._id || `REQ-${Math.floor(Math.random() * 10000)}`,
        timestamp: data.timestamp || new Date().toISOString(),
        category,
        status: 'PENDING',
        message,
      };
    }
  } catch {}
  return {
    id: `REQ-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toISOString(),
    category,
    status: 'PENDING',
    message,
  };
};

export const getWelfareIndicators = async (): Promise<WelfareIndicators> => {
  const [summary, checkIns, requests] = await Promise.all([
    safeFetch<any>(`${API_BASE_URL}/welfare/summary`),
    safeFetch<any[]>(`${API_BASE_URL}/welfare/check-ins`),
    safeFetch<any[]>(`${API_BASE_URL}/support/requests`),
  ]);

  const metrics = summary?.metrics || {};
  const totalCheckIns = Object.values(metrics).reduce((s: number, v: any) => s + (Number(v) || 0), 0) as number;

  return {
    workloadTrend: totalCheckIns > 5 ? 'INCREASING' : 'STABLE',
    restTrend: metrics.POOR > 0 ? 'DECREASING' : 'STABLE',
    fatigueLevel: metrics.POOR > 2 ? 'HIGH' : metrics.FAIR > 2 ? 'MEDIUM' : 'LOW',
    recentCheckIns: (checkIns || FALLBACK.recentCheckIns).slice(0, 5).map((c: any) => ({
      id: c.id || c._id,
      timestamp: c.timestamp || c.created_at || new Date().toISOString(),
      status: c.status || 'Okay',
      factors: c.factors || [],
    })),
    activeRequests: (requests || FALLBACK.activeRequests).slice(0, 5).map((r: any) => ({
      id: r.id || r._id,
      timestamp: r.timestamp || r.created_at || new Date().toISOString(),
      category: r.category,
      status: r.status,
    })),
  };
};
