import { NetworkGraphData, NetworkEntity, NetworkClusterInfo } from '../types/network';

// Mock service for network graph data

const MOCK_NODES: NetworkEntity[] = [
  { id: 'BH-P-104', label: 'Unknown Subject Alpha', type: 'PERSON', status: 'REVIEW REQUIRED', eventsCount: 4, connectionsCount: 12, details: { 'Locations': 3, 'Vehicles': 2, 'Cases': 1 } },
  { id: 'BH-P-105', label: 'Contact Beta', type: 'PERSON', status: 'UNKNOWN' },
  { id: 'BH-V-201', label: 'White SUV', type: 'VEHICLE' },
  { id: 'BH-L-301', label: 'Sector 4 Checkpoint', type: 'LOCATION' },
  { id: 'BH-L-302', label: 'Safehouse Alpha', type: 'LOCATION' },
  { id: 'BH-I-401', label: 'Incident 2026-08-10', type: 'INCIDENT', status: 'HIGH RISK' },
  { id: 'BH-C-501', label: 'Case File X-44', type: 'CASE' },
  { id: 'BH-O-601', label: 'Front Organization', type: 'ORGANIZATION' }
];

const MOCK_LINKS = [
  { id: 'l1', source: 'BH-P-104', target: 'BH-P-105', type: 'CONTACTED' as const },
  { id: 'l2', source: 'BH-P-104', target: 'BH-V-201', type: 'VEHICLE_ASSOCIATION' as const },
  { id: 'l3', source: 'BH-P-104', target: 'BH-L-301', type: 'APPEARED_AT' as const },
  { id: 'l4', source: 'BH-P-104', target: 'BH-I-401', type: 'LINKED_TO_INCIDENT' as const },
  { id: 'l5', source: 'BH-P-105', target: 'BH-L-302', type: 'LOCATION_ASSOCIATION' as const },
  { id: 'l6', source: 'BH-I-401', target: 'BH-C-501', type: 'LINKED_TO_CASE' as const },
  { id: 'l7', source: 'BH-P-104', target: 'BH-O-601', type: 'ASSOCIATED_WITH' as const },
];

export const getNetworkGraph = async (): Promise<NetworkGraphData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        nodes: MOCK_NODES,
        links: MOCK_LINKS
      });
    }, 1000);
  });
};

export const getEntityDetails = async (entityId: string): Promise<NetworkEntity | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const entity = MOCK_NODES.find(n => n.id === entityId) || null;
      resolve(entity);
    }, 500);
  });
};

export const getClusterInfo = async (entityId: string): Promise<NetworkClusterInfo | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (entityId === 'BH-P-104') {
        resolve({
          id: 'CLUSTER-A',
          size: 8,
          connectedEntities: 14,
          relationshipDensity: 'HIGH',
          importantEntities: ['BH-P-104', 'BH-I-401']
        });
      } else {
        resolve(null);
      }
    }, 800);
  });
};
