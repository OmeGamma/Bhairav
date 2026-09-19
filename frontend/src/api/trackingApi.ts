import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const encodePathValue = (value: string) => encodeURIComponent(value.trim());

export interface VehicleIntelligence {
  vehicleNumber: string;
  vehicleType: string;
  status: string;
  linkedCasesCount: number;
  associatedPersonsCount: number;
  recordedDetectionsCount: number;
  lastSeen: string;
  previousSeen: string;
}

export interface VehicleDetection {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  sourceType: string;
  sourceId: string;
  confidence: number;
  caseIds: string[];
}

export interface VehicleEntities {
  cases: { id: string; title: string; date: string }[];
  persons: { id: string; name: string; role: string }[];
}

export const trackingApi = {
  getVehicleIntelligence: async (vehicleNumber: string): Promise<VehicleIntelligence> => {
    const res = await axios.get(`${API_BASE_URL}/vehicles/${encodePathValue(vehicleNumber)}`);
    return res.data;
  },

  getVehicleMovement: async (vehicleNumber: string): Promise<VehicleDetection[]> => {
    const res = await axios.get(`${API_BASE_URL}/vehicles/${encodePathValue(vehicleNumber)}/movement`);
    return res.data;
  },

  getVehicleEntities: async (vehicleNumber: string): Promise<VehicleEntities> => {
    const res = await axios.get(`${API_BASE_URL}/vehicles/${encodePathValue(vehicleNumber)}/entities`);
    return res.data;
  }
};
