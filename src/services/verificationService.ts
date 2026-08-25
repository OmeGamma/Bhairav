import { VerificationResult, VerificationHistoryItem } from '../types/verification';

// Mock service representing the future integration with the backend

export const submitForVerification = async (photoFile: File | null, documentFile: File | null): Promise<VerificationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `VRF-${Math.floor(Math.random() * 10000)}`,
        status: 'REVIEW REQUIRED',
        documentReadability: 100,
        informationConsistency: 94,
        photoConsistency: 86,
        documentIntegrity: 73,
        reasons: [
          'Document anomaly detected',
          'Photo consistency requires review',
          'Additional human review recommended'
        ],
        extractedData: {
          name: 'Jane Doe',
          dob: '1990-01-01',
          documentNumber: 'A1234567',
          nationality: 'IND'
        }
      });
    }, 3000); // Simulate API delay
  });
};

export const getVerificationHistory = async (): Promise<VerificationHistoryItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'VRF-1029',
          timestamp: new Date().toISOString(),
          status: 'REVIEW REQUIRED',
          documentType: 'National ID',
          reviewer: 'Officer Sharma',
          location: 'Checkpoint Alpha',
          action: 'Pending Review'
        },
        {
          id: 'VRF-1028',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'VERIFIED',
          documentType: 'Passport',
          reviewer: 'Officer Singh',
          location: 'Sector 4',
          action: 'Cleared'
        },
        {
          id: 'VRF-1027',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'ANOMALY DETECTED',
          documentType: 'Driver License',
          reviewer: 'Officer Kumar',
          location: 'Checkpoint Beta',
          action: 'Escalated'
        }
      ]);
    }, 800);
  });
};
