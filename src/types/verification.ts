export interface VerificationResult {
  id: string;
  status: 'VERIFIED' | 'CONSISTENT' | 'REVIEW REQUIRED' | 'ANOMALY DETECTED' | 'UNABLE TO VERIFY';
  documentReadability: number;
  informationConsistency: number;
  photoConsistency: number;
  documentIntegrity: number;
  reasons: string[];
  extractedData?: {
    name?: string;
    dob?: string;
    documentNumber?: string;
    nationality?: string;
  };
}

export interface VerificationHistoryItem {
  id: string;
  timestamp: string;
  status: 'VERIFIED' | 'CONSISTENT' | 'REVIEW REQUIRED' | 'ANOMALY DETECTED' | 'UNABLE TO VERIFY';
  documentType: string;
  reviewer: string;
  location?: string;
  action: string;
}
