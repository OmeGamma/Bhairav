export type SecurityStatus = 'critical' | 'warning' | 'verified' | 'neutral' | 'info';

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  isSimulated?: boolean;
  lastEventTime?: string;
  detectionCount: number;
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
  location: string;
  coords?: LocationCoords;
  description: string;
  relatedEntitiesCount: number;
  status: 'active' | 'resolved' | 'investigating';
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

// AI/ML Types

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  detection_id: string;
  camera_id: string;
  session_id: string;
  frame_number: number;
  timestamp: string;
  label: string;
  confidence: number;
  bbox: BoundingBox;
  model_name: string;
  model_version: string;
}

export interface TrackPoint {
  x: number;
  y: number;
  timestamp: string;
}

export interface Track {
  track_id: string;
  camera_id: string;
  session_id: string;
  label: string;
  first_seen: string;
  last_seen: string;
  frames_seen: number;
  trajectory: TrackPoint[];
  current_bbox: BoundingBox;
  confidence: number;
  status: 'ACTIVE' | 'LOST' | 'ENDED';
}

export interface FaceDetection {
  face_detection_id: string;
  camera_id: string;
  session_id: string;
  frame_number: number;
  timestamp: string;
  bbox: BoundingBox;
  confidence: number;
  model_name: string;
}

export interface ANPRResult {
  anpr_id: string;
  camera_id: string;
  session_id: string;
  frame_number: number;
  timestamp: string;
  plate_text: string;
  raw_ocr_text: string;
  ocr_confidence: number;
  bbox: BoundingBox;
  vehicle_track_id?: string;
  vehicle_class?: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface VirtualZone {
  zone_id: string;
  camera_id: string;
  name: string;
  type: 'POLYGON' | 'LINE' | 'RECTANGLE';
  coordinates: number[][];
  enabled: boolean;
  severity: string;
}

export interface IntrusionEvent {
  event_id: string;
  camera_id: string;
  zone_id: string;
  track_id: string;
  event_type: 'ENTER' | 'EXIT' | 'LINE_CROSSING';
  timestamp: string;
  confidence: number;
  bbox: BoundingBox;
  severity: string;
}

export interface RuleEvent {
  event_id: string;
  camera_id: string;
  track_id?: string;
  event_type: string;
  risk_score: number;
  severity: string;
  timestamp: string;
  description: string;
  factors: string[];
  bbox?: BoundingBox;
}

export interface InferenceResult {
  camera_id: string;
  session_id: string;
  frame_number: number;
  timestamp: string;
  detections: Detection[];
  tracks: Track[];
  face_detections: FaceDetection[];
  anpr_results: ANPRResult[];
  fence_events: IntrusionEvent[];
  rule_events: RuleEvent[];
  metrics: {
    inference_time_ms: number;
    detection_count: number;
    track_count: number;
  };
  model_info: Record<string, any>;
}

export interface ModelStatus {
  model_name: string;
  model_version: string;
  task: string;
  device: string;
  status: 'READY' | 'LOADING' | 'ERROR';
  classes: string[];
  confidence_threshold: number;
  last_loaded?: string;
}

export interface CameraSession {
  session_id: string;
  camera_id: string;
  is_active: boolean;
  frame_number: number;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  events_generated: number;
  snapshots_generated: number;
  ai_metrics?: {
    frames_processed: number;
    detections: number;
    tracks: number;
    inference_time_ms: number;
    fps: number;
  };
}

export interface WebSocketMessage {
  type: 'detection.created' | 'track.updated' | 'event.created' | 'alert.created' | 'anpr.detected' | 'camera.metrics' | 'pong';
  data?: any;
  camera_id?: string;
  timestamp: string;
}
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
