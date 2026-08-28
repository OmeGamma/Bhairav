export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.detail || `API request failed with status ${response.status}`,
        response.status
      );
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('API Client Error:', error);
    throw new Error('Network error or API is unavailable. Please check your connection.');
  }
}

export const apiClient = {
  get: (endpoint: string) => fetchWithAuth(endpoint),
  post: (endpoint: string, data: any) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => fetchWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};

// Keep simulateApiCall for components not yet migrated or using synthetic data
export async function simulateApiCall<T>(data: T, delay = 800, shouldFail: boolean | 'random' = false): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const willFail = shouldFail === 'random' ? Math.random() < 0.1 : shouldFail;
      if (willFail) {
        reject(new Error('Network request failed. Please try again later.'));
      } else {
        resolve(data);
      }
    }, delay);
  });
}
