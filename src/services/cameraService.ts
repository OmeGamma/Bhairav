import { API_BASE_URL, fetchWithTimeout } from './apiClient';
import { mockCameras } from '../data/mockData';
import type { Camera } from '../types';

interface BackendCamera {
  _id: string;
  name: string;
  location_id?: string;
  status: string;
  stream_reference?: string;
  created_at?: string;
}

function toFrontendCamera(b: BackendCamera): Camera {
  return {
    id: b._id,
    name: b.name,
    location: b.location_id || 'Unassigned',
    status: (b.status === 'ACTIVE' ? 'online' : b.status === 'MAINTENANCE' ? 'maintenance' : 'offline') as any,
    isSimulated: false,
    lastEventTime: b.created_at || new Date().toISOString(),
    detectionCount: 0,
  };
}

export const cameraService = {
  getCameras: async (): Promise<Camera[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithTimeout(`${API_BASE_URL}/cameras/`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }, 8000);
      if (!response.ok) return mockCameras;
      const data: BackendCamera[] = await response.json();
      return data.map(toFrontendCamera);
    } catch {
      return mockCameras;
    }
  },

  getCameraById: async (id: string): Promise<Camera | undefined> => {
    const cameras = await cameraService.getCameras();
    return cameras.find((c) => c.id === id);
  },
};
