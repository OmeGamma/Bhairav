import { WelfareCheckIn, SupportRequest, WelfareIndicators } from '../types/welfare';

export const submitCheckIn = async (status: string, factors: string[]): Promise<WelfareCheckIn> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `CHK-${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
        status: status as any,
        factors
      });
    }, 1000);
  });
};

export const submitSupportRequest = async (category: string, message?: string): Promise<SupportRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `REQ-${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
        category,
        status: 'PENDING',
        message
      });
    }, 1500);
  });
};

export const getWelfareIndicators = async (): Promise<WelfareIndicators> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        workloadTrend: 'INCREASING',
        restTrend: 'DECREASING',
        fatigueLevel: 'MEDIUM',
        recentCheckIns: [
          {
            id: 'CHK-1',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: 'Tired',
            factors: ['Sleep / Rest', 'Workload']
          },
          {
            id: 'CHK-2',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            status: 'Okay',
            factors: ['Operational Pressure']
          }
        ],
        activeRequests: [
          {
            id: 'REQ-101',
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            category: 'Recovery',
            status: 'IN REVIEW'
          }
        ]
      });
    }, 800);
  });
};
