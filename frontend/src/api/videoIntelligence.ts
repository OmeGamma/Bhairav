import { apiClient, type ApiResponse } from './client';

export interface VideoStatus {
  enabled: boolean;
  yolo: {
    initialized: boolean;
    device?: string;
    error?: string;
  };
}

export interface VideoReport {
  reportId: string;
  _id?: string;
  caseId: string;
  eventType: string;
  confidence: number;
  timestamp: string;
  sourceName?: string;
  sourceType?: string;
  trackId?: string;
  frameNumber?: number;
  personCropUrl?: string;
  videoId?: string;
  metadata?: Record<string, unknown>;
}

export interface VideoReportFilters {
  caseId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface UploadVideoResponse {
  message: string;
  videoId: string;
  status: string;
}

export interface AnalyzeFrameResponse {
  detections: Array<{
    track_id: string;
    confidence: number;
    bounding_box: { x1: number; y1: number; x2: number; y2: number };
    personCropUrl?: string;
    event_type: string;
  }>;
  frame_number: number;
}

export async function getVideoStatus(): Promise<ApiResponse<VideoStatus>> {
  return apiClient.get<VideoStatus>('/api/video-intelligence/status');
}

export async function getVideoReports(filters: VideoReportFilters = {}): Promise<ApiResponse<VideoReport[]>> {
  const params: Record<string, string | number | boolean | undefined> = {};
  if (filters.caseId) params.case_id = filters.caseId;
  if (filters.eventType) params.event_type = filters.eventType;
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  return apiClient.get<VideoReport[]>('/api/video-intelligence/reports', { params });
}

export async function getVideoReport(id: string): Promise<ApiResponse<VideoReport>> {
  return apiClient.get<VideoReport>(`/api/video-intelligence/reports/${encodeURIComponent(id)}`);
}

export async function updateVideoReport(id: string, data: Partial<VideoReport>): Promise<ApiResponse<VideoReport>> {
  return apiClient.patch<VideoReport>(`/api/video-intelligence/reports/${encodeURIComponent(id)}`, data);
}

export async function linkVideoReportToCase(id: string, caseId: string): Promise<ApiResponse<VideoReport>> {
  return apiClient.post<VideoReport>(`/api/video-intelligence/reports/${encodeURIComponent(id)}/link-case`, undefined, { params: { case_id: caseId } });
}

export async function getReportsByCase(caseId: string): Promise<ApiResponse<VideoReport[]>> {
  return apiClient.get<VideoReport[]>(`/api/video-intelligence/reports/by-case/${encodeURIComponent(caseId)}`);
}

export async function uploadVideo(file: File, caseId?: string): Promise<ApiResponse<UploadVideoResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  if (caseId) formData.append('case_id', caseId);
  return apiClient.uploadFile<UploadVideoResponse>('/api/video-intelligence/upload', formData);
}

export async function analyzeFrame(file: File, caseId?: string): Promise<ApiResponse<AnalyzeFrameResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  if (caseId) formData.append('case_id', caseId);
  return apiClient.uploadFile<AnalyzeFrameResponse>('/api/video-intelligence/analyze-frame', formData);
}