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
