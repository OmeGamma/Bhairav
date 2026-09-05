export type EvidenceSourceType =
  | 'FIR'
  | 'POLICE_REPORT'
  | 'CDR'
  | 'FINANCIAL_RECORD'
  | 'SURVEILLANCE_REPORT'
  | 'INTELLIGENCE_REPORT'
  | 'SOCIAL_MEDIA_EXPORT'
  | 'CRIMINAL_HISTORY'
  | 'VEHICLE_RECORD'
  | 'IDENTITY_DOCUMENT'
  | 'CCTV_VIDEO'
  | 'CCTV_SNAPSHOT'
  | 'AUDIO'
  | 'IMAGE'
  | 'OTHER';

export type ProcessingStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'PARTIALLY_PROCESSED'
  | 'FAILED'
  | 'QUARANTINED';

export type Classification = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL';

export type JobType =
  | 'FILE_VALIDATION'
  | 'TEXT_EXTRACTION'
  | 'OCR'
  | 'ENTITY_EXTRACTION'
  | 'CDR_INGESTION'
  | 'FINANCIAL_INGESTION'
  | 'VIDEO_ANALYSIS'
  | 'REPORT_GENERATION';

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface EvidenceFile {
  id: string;
  original_filename: string;
  stored_filename: string;
  mime_type: string;
  extension: string;
  size_bytes: number;
  storage_provider: string;
  storage_key: string;
  checksum_sha256: string | null;
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
  created_at: string;
  source_type: EvidenceSourceType;
  classification: Classification;
  description: string | null;
  tags: string[];
  case_id: string | null;
  investigation_id: string | null;
  processing_status: ProcessingStatus;
  processing_error: string | null;
  processed_at: string | null;
  version: number;
  parent_file_id: string | null;
  is_original: boolean;
  is_deleted: boolean;
}

export interface EvidenceVersion {
  id: string;
  file_id: string;
  version: number;
  stored_filename: string;
  storage_key: string;
  size_bytes: number;
  checksum_sha256: string | null;
  uploaded_by: string;
  uploaded_at: string;
  is_original: boolean;
  change_description: string | null;
}

export interface EvidenceAudit {
  id: string;
  file_id: string;
  actor_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ProcessingJob {
  id: string;
  file_id: string;
  job_type: JobType;
  status: JobStatus;
  progress: number;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface IngestionResult {
  id: string;
  file_id: string;
  job_id: string | null;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  warnings: string[] | null;
  errors: string[] | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ExtractedEntity {
  id: string;
  file_id: string;
  job_id: string | null;
  entity_type: string;
  canonical_name: string;
  aliases: string[] | null;
  attributes: Record<string, any> | null;
  confidence: number;
  extraction_method: string;
  source_page: number | null;
  source_text: string | null;
  created_at: string;
}

export interface ExtractedRelationship {
  id: string;
  file_id: string;
  job_id: string | null;
  source_entity_id: string | null;
  target_entity_id: string | null;
  relationship_type: string;
  weight: number;
  confidence: number;
  source_record_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export type CaseStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'ON_HOLD' | 'CLOSED' | 'ARCHIVED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Case {
  id: string;
  case_number: string | null;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  classification: Classification;
  location: string | null;
  tags: string[] | null;
  assigned_investigators: string[] | null;
  related_entities: Array<{ type: string; id: string }> | null;
  related_evidence: string[] | null;
  created_at: string;
  updated_at: string;
}
