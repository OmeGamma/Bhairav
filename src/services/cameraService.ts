import { simulateApiCall } from './apiClient';
import type { Camera } from '../types';
import { mockCameras } from '../data/mockData';

export const cameraService = {
  getCameras: async (): Promise<Camera[]> => {
    return simulateApiCall(mockCameras, 800);
  },
  
  getCameraById: async (id: string): Promise<Camera | undefined> => {
    const camera = mockCameras.find(c => c.id === id);
    if (!camera) {
      return Promise.reject(new Error('Camera not found'));
    }
    return simulateApiCall(camera, 500);
  }
};
