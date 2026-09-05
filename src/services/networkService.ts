import type {
  NetworkGraphData,
  NetworkEntity,
  NetworkRelationship,
  NetworkClusterInfo,
  EntityType,
  RelationshipType,
} from '../types/network';
import { API_BASE_URL, fetchWithTimeout } from './apiClient';

export interface GraphFilters {
  entityTypes?: EntityType[];
  relationshipTypes?: RelationshipType[];
  since?: string;
  sinceDays?: number;
  investigationId?: string;
  centerEntityId?: string;
  hops?: number;
}

interface BackendNode {
  id: string;
  type: string;
  label: string;
  metadata?: Record<string, any>;
}

interface BackendEdge {
  source: string;
  target: string;
  relationship: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface BackendGraph {
  nodes: BackendNode[];
  edges: BackendEdge[];
  metadata?: Record<string, any>;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const s = search.toString();
  return s ? `?${s}` : '';
}

function toEntity(node: BackendNode): NetworkEntity {
  return {
    id: node.id,
    label: node.label || node.id,
    type: (node.type as EntityType) || 'PERSON',
    status: node.metadata?.status,
    connectionsCount: undefined,
  };
}

function toRelationship(edge: BackendEdge, index: number): NetworkRelationship {
  return {
    id: `${edge.source}-${edge.relationship}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    type: (edge.relationship as RelationshipType) || 'ASSOCIATED_WITH',
    label: edge.relationship,
  };
}

export const networkService = {
  getGraph: async (filters: GraphFilters = {}): Promise<NetworkGraphData> => {
    const since =
      filters.since ||
      (filters.sinceDays !== undefined
        ? new Date(Date.now() - filters.sinceDays * 86400_000).toISOString()
        : undefined);
    const url = `${API_BASE_URL}/network/graph${buildQuery({
      entity_types: filters.entityTypes?.join(','),
      relationship_types: filters.relationshipTypes?.join(','),
      since,
      investigation_id: filters.investigationId,
    })}`;

    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }, 8000);

      if (!response.ok) {
        return { nodes: [], links: [] };
      }
      const data: BackendGraph = await response.json();
      return {
        nodes: (data.nodes || []).map(toEntity),
        links: (data.edges || []).map(toRelationship),
      };
    } catch {
      return { nodes: [], links: [] };
    }
  },

  getGraphAroundEntity: async (entityId: string, hops = 1): Promise<NetworkGraphData> => {
    const url = `${API_BASE_URL}/network/graph/${encodeURIComponent(entityId)}?hops=${hops}`;
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }, 8000);
      if (!response.ok) {
        return { nodes: [], links: [] };
      }
      const data: BackendGraph = await response.json();
      return {
        nodes: (data.nodes || []).map(toEntity),
        links: (data.edges || []).map(toRelationship),
      };
    } catch {
      return { nodes: [], links: [] };
    }
  },

  getEntityDetails: async (entityId: string): Promise<NetworkEntity | null> => {
    const url = `${API_BASE_URL}/network/entity/${encodeURIComponent(entityId)}/details`;
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }, 8000);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return {
        id: data.id,
        label: data.label,
        type: (data.type as EntityType) || 'PERSON',
        status: data.status,
        connectionsCount: data.connections_count,
        details: {
          ...(data.metadata || {}),
          RelatedEvents: (data.related?.events || []).length,
          RelatedCases: (data.related?.cases || []).length,
          RelatedVehicles: (data.related?.vehicles || []).length,
          RelatedLocations: (data.related?.locations || []).length,
        },
      };
    } catch {
      return null;
    }
  },

  getClusterInfo: async (entityId: string): Promise<NetworkClusterInfo | null> => {
    const url = `${API_BASE_URL}/network/graph/${encodeURIComponent(entityId)}?hops=2`;
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }, 8000);
      if (!response.ok) return null;
      const data: BackendGraph = await response.json();
      const totalConnections = (data.edges || []).length;
      return {
        id: `CLUSTER-${entityId}`,
        size: (data.nodes || []).length,
        connectedEntities: (data.nodes || []).length,
        relationshipDensity: totalConnections > 8 ? 'HIGH' : totalConnections > 3 ? 'MEDIUM' : 'LOW',
        importantEntities: (data.nodes || []).slice(0, 3).map((n) => n.id),
      };
    } catch {
      return null;
    }
  },
};
