import { apiClient, type ApiResponse } from './client';

export interface CaseLocation {
  city?: string;
  district?: string;
  state?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Case {
  _id: string;
  case_number: string;
  title: string;
  description: string;
  crimeType: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'UNDER INVESTIGATION' | 'CLOSED';
  location: CaseLocation;
  suspect?: string;
  filingDate: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
  dataClassification?: string;
}

export interface CreateCaseData {
  case_number: string;
  title: string;
  description: string;
  crimeType: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'UNDER INVESTIGATION' | 'CLOSED';
  location: CaseLocation;
  suspect?: string;
  assignedTo?: string;
}

export interface UpdateCaseData extends Partial<CreateCaseData> {}

export async function getCases(): Promise<ApiResponse<Case[]>> {
  return apiClient.get<Case[]>('/api/cases');
}

export async function getDeletedCases(): Promise<ApiResponse<Case[]>> {
  return apiClient.get<Case[]>('/api/cases/deleted');
}

export async function getCase(id: string): Promise<ApiResponse<Case>> {
  return apiClient.get<Case>(`/api/cases/${encodeURIComponent(id)}`);
}

export async function createCase(data: CreateCaseData): Promise<ApiResponse<Case>> {
  return apiClient.post<Case>('/api/cases', data);
}

export async function updateCase(id: string, data: UpdateCaseData): Promise<ApiResponse<Case>> {
  return apiClient.patch<Case>(`/api/cases/${encodeURIComponent(id)}`, data);
}

export async function closeCase(id: string): Promise<ApiResponse<Case>> {
  return apiClient.patch<Case>(`/api/cases/${encodeURIComponent(id)}`, { status: 'CLOSED' });
}

export async function deleteCase(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/cases/${encodeURIComponent(id)}`);
}