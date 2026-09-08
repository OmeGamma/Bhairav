import { apiClient, type ApiResponse } from './client';

export interface SystemStatus {
  status: string;
  timestamp: string;
  version?: string;
  uptime?: number;
  services?: Record<string, { status: string; latency?: number }>;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
}

export async function checkSystemStatus(): Promise<ApiResponse<SystemStatus>> {
  return apiClient.get<SystemStatus>('/api/system/status');
}

export async function checkHealth(): Promise<ApiResponse<HealthCheck>> {
  return apiClient.get<HealthCheck>('/api/health');
}