import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

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
    const res = await axios.get(`${API_BASE_URL}/vehicles/${vehicleNumber}`);
    return res.data;
  },

  getVehicleMovement: async (vehicleNumber: string): Promise<VehicleDetection[]> => {
    const res = await axios.get(`${API_BASE_URL}/vehicles/${vehicleNumber}/movement`);
    return res.data;
  },

  getVehicleEntities: async (vehicleNumber: string): Promise<VehicleEntities> => {
    const res = await axios.get(`${API_BASE_URL}/vehicles/${vehicleNumber}/entities`);
    return res.data;
  }
};
