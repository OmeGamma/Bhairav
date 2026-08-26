import type { Alert, Camera, DashboardStats, SecurityEvent } from '../types';

export const mockDashboardStats: DashboardStats = {
  criticalAlerts: 7,
  securityReviews: 12,
  intelligenceUpdates: 5,
  welfareFollowups: 4,
};

export const mockCameras: Camera[] = [
  {
    id: 'CAM-17',
    name: 'Sector X Perimeter',
    location: 'Sector X North Gate',
    status: 'online',
    isSimulated: true,
    lastEventTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    detectionCount: 14,
  },
  {
    id: 'CAM-08',
    name: 'Main Checkpoint',
    location: 'Sector Y Entrance',
    status: 'online',
    isSimulated: true,
    lastEventTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    detectionCount: 42,
  },
  {
    id: 'CAM-22',
    name: 'Restricted Zone Alpha',
    location: 'Zone Alpha',
    status: 'online',
    isSimulated: true,
    lastEventTime: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    detectionCount: 3,
  },
];

export const mockEvents: SecurityEvent[] = [
  {
    id: 'BH-104',
    type: 'Restricted-zone movement',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    cameraId: 'CAM-17',
    location: 'Sector X',
    coords: { lat: 28.6139, lng: 77.2090 }, // New Delhi approx
    description: 'Unauthorized person detected moving near restricted perimeter.',
    relatedEntitiesCount: 5,
    status: 'active',
  },
  {
    id: 'BH-103',
    type: 'Identity review requested',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    cameraId: 'CAM-08',
    location: 'Sector Y',
    coords: { lat: 28.6150, lng: 77.2100 },
    description: 'Vehicle checkpoint verification anomaly.',
    relatedEntitiesCount: 2,
    status: 'investigating',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-991',
    title: 'Perimeter Breach Attempt',
    description: 'Multiple subjects approaching restricted fence at Sector X.',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    category: 'security',
    actionRequired: true,
  },
  {
    id: 'ALT-992',
    title: 'New intelligence relationship identified',
    description: 'Link established between recent POI and historical event.',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: 'intelligence',
    actionRequired: false,
  },
];
