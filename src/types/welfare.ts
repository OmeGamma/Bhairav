export interface WelfareCheckIn {
  id: string;
  timestamp: string;
  status: 'Good' | 'Okay' | 'Tired' | 'Stressed' | 'Difficult';
  factors: string[];
}

export interface SupportRequest {
  id: string;
  timestamp: string;
  category: string;
  status: 'PENDING' | 'IN REVIEW' | 'ASSIGNED' | 'FOLLOW-UP' | 'RESOLVED';
  message?: string;
  assignedTo?: string;
}

export interface WelfareIndicators {
  workloadTrend: 'STABLE' | 'INCREASING' | 'DECREASING';
  restTrend: 'STABLE' | 'INCREASING' | 'DECREASING';
  fatigueLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recentCheckIns: WelfareCheckIn[];
  activeRequests: SupportRequest[];
}
