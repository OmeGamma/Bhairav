export type SecurityStatus = 'critical' | 'warning' | 'verified' | 'neutral' | 'info';

export interface CameraConfiguration {
  fps: number;
  resolution: string;
  reconnect_attempts: number;
  reconnect_delay: number;
  frame_skip: number;
  processing_enabled: boolean;
  recording_enabled: boolean;
}

export interface Camera {
  id: string;
  name: string;
  camera_code?: string;
  description?: string;
  location_id?: string;
  latitude?: number;
  longitude?: number;
  zone?: string;
  source_type: 'VIDEO_FILE' | 'WEBCAM' | 'RTSP' | 'SIMULATED';
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'RECONNECTING' | 'ERROR' | 'DISABLED' | 'MAINTENANCE';
  enabled: boolean;
  stream_reference?: string;
  configuration?: CameraConfiguration;
  lastEventTime?: string;
  detectionCount: number;
  location?: string; // legacy support for UI
}

export interface CameraSession {
  id: string;
  camera_id: string;
  source_type: string;
  source_reference?: string;
  status: 'STARTING' | 'RUNNING' | 'PAUSED' | 'STOPPING' | 'STOPPED' | 'ERROR';
  frames_processed: number;
  frames_dropped: number;
  fps: number;
  resolution?: string;
  error?: string;
  created_by?: string;
  started_at?: string;
  ended_at?: string;
  last_frame_at?: string;
}

export interface Detection {
  detection_id?: string;
  camera_id?: string;
  session_id?: string;
  timestamp?: string;
  frame_number?: number;
  label: string;
  confidence: number;
  bounding_box?: number[];
  track_id?: string;
  snapshot_id?: string;
  metadata?: Record<string, any>;
  processing_engine?: string;
}

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: SecurityStatus;
  timestamp: string;
  cameraId?: string;
  session_id?: string;
  location: string;
  coords?: LocationCoords;
  description: string;
  relatedEntitiesCount: number;
  status: 'active' | 'resolved' | 'investigating';
  frame_number?: number;
  snapshot_id?: string;
  confidence?: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: SecurityStatus;
  timestamp: string;
  category: 'security' | 'intelligence' | 'welfare' | 'system' | 'review';
  actionRequired: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  criticalAlerts: number;
  securityReviews: number;
  intelligenceUpdates: number;
  welfareFollowups: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
}

export * from './evidence';

