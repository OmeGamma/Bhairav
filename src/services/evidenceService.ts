import { API_BASE_URL, fetchWithTimeout } from './apiClient';
import type {
  EvidenceFile,
  EvidenceVersion,
  EvidenceAudit,
  ProcessingJob,
  IngestionResult,
  Classification,
  EvidenceSourceType,
  ProcessingStatus,
} from '../types/evidence';

export interface EvidenceFilters {
  search?: string;
  file_type?: string;
  source_type?: EvidenceSourceType;
  case_id?: string;
  processing_status?: ProcessingStatus;
  classification?: Classification;
  uploaded_by?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

export interface EvidenceListResponse {
  items: EvidenceFile[];
  total: number;
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

export const evidenceService = {
  async getFiles(filters: EvidenceFilters = {}): Promise<EvidenceListResponse> {
    const url = `${API_BASE_URL}/files${buildQuery({
      search: filters.search,
      file_type: filters.file_type,
      source_type: filters.source_type,
      case_id: filters.case_id,
      processing_status: filters.processing_status,
      classification: filters.classification,
      uploaded_by: filters.uploaded_by,
      date_from: filters.date_from,
      date_to: filters.date_to,
      skip: String(filters.skip ?? 0),
      limit: String(filters.limit ?? 50),
    })}`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch files' }));
      throw new Error(error.detail || 'Failed to fetch files');
    }
    const items = await response.json();
    return { items, total: items.length };
  },

  async getFile(fileId: string): Promise<EvidenceFile> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch file' }));
      throw new Error(error.detail || 'Failed to fetch file');
    }
    return response.json();
  },

  async uploadFile(
    file: File,
    data: {
      source_type: EvidenceSourceType;
      description?: string;
      case_id?: string;
      classification?: Classification;
      tags?: string[];
    }
  ): Promise<EvidenceFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_type', data.source_type);
    if (data.description) formData.append('description', data.description);
    if (data.case_id) formData.append('case_id', data.case_id);
    if (data.classification) formData.append('classification', data.classification);
    if (data.tags?.length) formData.append('tags', data.tags.join(','));

    const response = await fetch(`${API_BASE_URL}/files?source_type=${encodeURIComponent(data.source_type)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }
    return response.json();
  },

  async updateFile(fileId: string, data: Record<string, any>): Promise<EvidenceFile> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}`;
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Update failed' }));
      throw new Error(error.detail || 'Update failed');
    }
    return response.json();
  },

  async deleteFile(fileId: string): Promise<void> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}`;
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(error.detail || 'Delete failed');
    }
  },

  async downloadFile(fileId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/download`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 15000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Download failed' }));
      throw new Error(error.detail || 'Download failed');
    }
    return response.blob();
  },

  async linkCase(fileId: string, caseId: string): Promise<EvidenceFile> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/link-case?case_id=${encodeURIComponent(caseId)}`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Link failed' }));
      throw new Error(error.detail || 'Link failed');
    }
    return response.json();
  },

  async unlinkCase(fileId: string): Promise<EvidenceFile> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/unlink-case`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unlink failed' }));
      throw new Error(error.detail || 'Unlink failed');
    }
    return response.json();
  },

  async getVersions(fileId: string): Promise<EvidenceVersion[]> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/versions`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch versions' }));
      throw new Error(error.detail || 'Failed to fetch versions');
    }
    return response.json();
  },

  async getAudit(fileId: string, skip = 0, limit = 50): Promise<EvidenceAudit[]> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/audit?skip=${skip}&limit=${limit}`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch audit' }));
      throw new Error(error.detail || 'Failed to fetch audit');
    }
    return response.json();
  },

  async getProcessingJobs(fileId: string): Promise<ProcessingJob[]> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/processing`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch jobs' }));
      throw new Error(error.detail || 'Failed to fetch jobs');
    }
    return response.json();
  },

  async getMetadata(fileId: string): Promise<any> {
    const url = `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/metadata`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }, 8000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch metadata' }));
      throw new Error(error.detail || 'Failed to fetch metadata');
    }
    return response.json();
  },
};
