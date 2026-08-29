import { API_BASE_URL, fetchWithTimeout } from './apiClient';
import type { SecurityEvent } from '../types';
import { mockEvents } from '../data/mockData';

const STATUS_MAP: Record<string, SecurityEvent['status']> = {
  'NEW': 'active',
  'ACKNOWLEDGED': 'investigating',
  'RESOLVED': 'resolved',
};

function toFrontendEvent(raw: any): SecurityEvent {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    type: String(raw.type ?? raw.event_type ?? ''),
    severity: String(raw.severity ?? 'info').toLowerCase() as SecurityEvent['severity'],
    timestamp: raw.timestamp ? new Date(raw.timestamp).toISOString() : (raw.created_at ? new Date(raw.created_at).toISOString() : new Date().toISOString()),
    cameraId: raw.cameraId ?? raw.camera_id ?? undefined,
    location: String(raw.location ?? raw.location_id ?? 'Unknown'),
    coords: raw.latitude != null && raw.longitude != null ? { lat: Number(raw.latitude), lng: Number(raw.longitude) } : undefined,
    description: String(raw.description ?? ''),
    relatedEntitiesCount: Number(raw.related_entities_count ?? raw.relatedEntitiesCount ?? 0),
    status: STATUS_MAP[String(raw.status ?? '').toUpperCase()] ?? 'active',
  };
}

export const eventService = {
  getSecurityEvents: async (filters?: { severity?: string; event_type?: string; status?: string; location?: string; start_date?: string; end_date?: string }): Promise<SecurityEvent[]> => {
    const params = new URLSearchParams();
    if (filters?.severity) params.set('severity', filters.severity);
    if (filters?.event_type) params.set('event_type', filters.event_type);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.location) params.set('location', filters.location);
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);

    const url = `${API_BASE_URL}/events/${params.toString() ? `?${params.toString()}` : ''}`;
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }, 3000);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch security events');
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(toFrontendEvent) : [];
    } catch {
      return mockEvents.map(toFrontendEvent);
    }
  },
  
  getEventById: async (id: string): Promise<SecurityEvent> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/events/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }, 10000);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Event not found');
    }

    const data = await response.json();
    return toFrontendEvent(data);
  },

  updateEvent: async (id: string, updates: Partial<SecurityEvent>): Promise<SecurityEvent> => {
    const backendUpdates: Record<string, any> = {};
    if (updates.status) {
      const reverseMap: Record<string, string> = { active: 'NEW', investigating: 'ACKNOWLEDGED', resolved: 'RESOLVED' };
      backendUpdates.status = reverseMap[updates.status] || updates.status;
    }
    if (updates.type) backendUpdates.event_type = updates.type;
    if (updates.description) backendUpdates.description = updates.description;
    if (updates.location) backendUpdates.location = updates.location;
    if (updates.cameraId) backendUpdates.camera_id = updates.cameraId;
    if (updates.coords) {
      backendUpdates.latitude = updates.coords.lat;
      backendUpdates.longitude = updates.coords.lng;
    }
    if (updates.relatedEntitiesCount !== undefined) backendUpdates.related_entities_count = updates.relatedEntitiesCount;

    const response = await fetchWithTimeout(`${API_BASE_URL}/events/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(backendUpdates),
    }, 10000);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update event');
    }

    const data = await response.json();
    return toFrontendEvent(data);
  }
};
