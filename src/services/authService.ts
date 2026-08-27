import { API_BASE_URL } from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  status: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Authentication failed');
    }

    const data = await response.json();
    const token = data.access_token;

    const user = await authService.verifySession(token);
    return { ...user, token };
  },

  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Registration failed');
    }

    return response.json();
  },
  
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error('Logout request failed', e);
      }
    }
    localStorage.removeItem('token');
  },
  
  verifySession: async (tokenOverride?: string): Promise<User> => {
    const token = tokenOverride || localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Session expired or invalid');
    }

    return response.json();
  }
};
