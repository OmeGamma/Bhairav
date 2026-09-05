export interface AIContext {
  entityType?: 'person' | 'vehicle' | 'location' | 'incident' | 'case' | 'document' | 'support_request';
  entityId?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  references?: {
    id: string;
    type: string;
    label: string;
  }[];
  sources?: {
    title: string;
    url: string;
    domain?: string;
    snippet?: string;
    published?: string;
  }[];
}

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'RESPONDING' | 'ERROR';
