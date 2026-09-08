const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_TIMEOUT = 30000;

export interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const base = API_BASE_URL || '';
  let url: string;
  if (base) {
    url = base.endsWith('/') ? base.slice(0, -1) + path : base + path;
  } else {
    url = path;
  }
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }
  return url;
}

async function fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...fetchOptions, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function fetchJSON<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  try {
    const res = await fetchWithTimeout(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errData = await res.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch {
        // Use default error message
      }
      return { ok: false, data: null, error: errorMessage };
    }

    const data = (await res.json()) as T;
    return { ok: true, data, error: null };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, data: null, error: 'Request timeout' };
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return { ok: false, data: null, error: 'Network error. Please check your connection.' };
    }
    return { ok: false, data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchFile<T>(path: string, formData: FormData, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, timeout: _timeout, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  try {
    const res = await fetchWithTimeout(url, {
      ...fetchOptions,
      method: fetchOptions.method ?? 'POST',
      body: formData,
      headers: {
        ...fetchOptions.headers,
      },
    });

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errData = await res.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch {
        // Use default error message
      }
      return { ok: false, data: null, error: errorMessage };
    }

    const data = (await res.json()) as T;
    return { ok: true, data, error: null };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, data: null, error: 'Request timeout' };
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return { ok: false, data: null, error: 'Network error. Please check your connection.' };
    }
    return { ok: false, data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return fetchJSON<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return fetchJSON<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return fetchJSON<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return fetchJSON<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return fetchJSON<T>(path, { ...options, method: 'DELETE' });
  },

  uploadFile<T>(path: string, formData: FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
    return fetchFile<T>(path, formData, options);
  },
};

export { API_BASE_URL };