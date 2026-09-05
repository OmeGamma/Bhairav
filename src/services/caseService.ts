import { API_BASE_URL, fetchWithTimeout } from './apiClient';
import type { Case, CaseStatus, CasePriority, Classification } from '../types/evidence';

export interface CaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  classification?: Classification;
  search?: string;
  skip?: number;
  limit?: number;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const s = search.toString();
  return s ? `?${s}` : '';
}

export const caseService = {
  async getCases(filters: CaseFilters = {}): Promise<{ items: Case[]; total: number }> {
    const url = `${API_BASE_URL}/cases${buildQuery({
      status: filters.status,
      priority: filters.priority,
      search: filters.search,
      skip: String(filters.skip ?? 0),
      limit: String(filters.limit ?? 50),
    })}`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch cases' }));
      throw new Error(error.detail || 'Failed to fetch cases');
    }
    const items = await response.json();
    const normalized = items.map((item: any) => ({
      ...item,
      id: item.id || item._id,
    }));
    return { items: normalized, total: normalized.length };
  },

  async getCase(caseId: string): Promise<Case> {
    const url = `${API_BASE_URL}/cases/${encodeURIComponent(caseId)}`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch case' }));
      throw new Error(error.detail || 'Failed to fetch case');
    }
    const data = await response.json();
    return { ...data, id: data.id || data._id };
  },

  async createCase(data: {
    case_number?: string;
    title: string;
    description: string;
    status?: CaseStatus;
    priority?: CasePriority;
    classification?: Classification;
    location?: string;
    tags?: string[];
    assigned_investigators?: string[];
  }): Promise<Case> {
    const url = `${API_BASE_URL}/cases`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create case' }));
      throw new Error(error.detail || 'Failed to create case');
    }
    const dataResp = await response.json();
    return { ...dataResp, id: dataResp.id || dataResp._id };
  },

  async updateCase(caseId: string, data: Record<string, any>): Promise<Case> {
    const url = `${API_BASE_URL}/cases/${encodeURIComponent(caseId)}`;
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update case' }));
      throw new Error(error.detail || 'Failed to update case');
    }
    const dataResp = await response.json();
    return { ...dataResp, id: dataResp.id || dataResp._id };
  },
};
