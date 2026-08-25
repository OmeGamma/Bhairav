export type EntityType = 'PERSON' | 'ALIAS' | 'ORGANIZATION' | 'VEHICLE' | 'LOCATION' | 'INCIDENT' | 'CASE' | 'DOCUMENT' | 'COMMUNICATION';

export type RelationshipType = 'ASSOCIATED_WITH' | 'CONTACTED' | 'APPEARED_AT' | 'LINKED_TO_INCIDENT' | 'LINKED_TO_CASE' | 'VEHICLE_ASSOCIATION' | 'LOCATION_ASSOCIATION';

export interface NetworkEntity {
  id: string;
  label: string;
  type: EntityType;
  status?: 'REVIEW REQUIRED' | 'HIGH RISK' | 'CLEARED' | 'UNKNOWN';
  details?: Record<string, string | number>;
  eventsCount?: number;
  connectionsCount?: number;
}

export interface NetworkRelationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  type: RelationshipType;
  label?: string;
}

export interface NetworkGraphData {
  nodes: NetworkEntity[];
  links: NetworkRelationship[];
}

export interface NetworkClusterInfo {
  id: string;
  size: number;
  connectedEntities: number;
  relationshipDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  importantEntities: string[]; // Entity IDs
}
