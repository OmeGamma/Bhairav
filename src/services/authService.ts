import { simulateApiCall } from './apiClient';

export interface User {
  id: string;
  name: string;
  rank: string;
  role: string;
  token?: string;
}

const MOCK_USER: User = {
  id: 'USR-001',
  name: 'Officer Singh',
  rank: 'Commander',
  role: 'Security Analyst',
  token: 'mock-jwt-token-xyz',
};

export const authService = {
  login: async (_credentials: Record<string, string>): Promise<User> => {
    // Simulate login verification
    return simulateApiCall(MOCK_USER, 1200);
  },
  
  logout: async (): Promise<void> => {
    return simulateApiCall(undefined, 500);
  },
  
  verifySession: async (): Promise<User> => {
    return simulateApiCall(MOCK_USER, 500);
  }
};
