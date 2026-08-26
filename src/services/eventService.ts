import { simulateApiCall } from './apiClient';
import type { SecurityEvent } from '../types';
import { mockEvents } from '../data/mockData';

export const eventService = {
  getSecurityEvents: async (_filters?: Record<string, any>): Promise<SecurityEvent[]> => {
    // In a real implementation, filters would be passed to the backend
    return simulateApiCall(mockEvents, 900);
  },
  
  getEventById: async (id: string): Promise<SecurityEvent | undefined> => {
    const event = mockEvents.find(e => e.id === id);
    if (!event) {
      return Promise.reject(new Error('Event not found'));
    }
    return simulateApiCall(event, 600);
  }
};
