import { Report } from '../types/reports';

export const getReports = async (): Promise<Report[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'REP-2026-001',
          title: 'Sector 4 Verification Anomaly Summary',
          category: 'Verification',
          date: new Date().toISOString(),
          preparedFor: 'Command Center Lead',
          summary: 'Summary of identity verification anomalies detected at Sector 4 checkpoint over the last 72 hours.',
          status: 'READY',
          keyFindings: [
            '12% increase in document integrity warnings.',
            '3 clustered anomalies matching known forged templates.'
          ]
        },
        {
          id: 'REP-2026-002',
          title: 'Entity Network Analysis: Cluster A',
          category: 'Network Intelligence',
          date: new Date(Date.now() - 86400000).toISOString(),
          preparedFor: 'Intelligence Directorate',
          summary: 'Structural breakdown of Cluster A entities and relationships, focusing on vehicle associations.',
          status: 'READY',
          keyFindings: [
            'Cluster centers on Subject Alpha (BH-P-104).',
            'Strong geographical overlap in Sector 4.'
          ]
        },
        {
          id: 'REP-2026-003',
          title: 'Weekly Unit Readiness & Welfare',
          category: 'Personnel Welfare',
          date: new Date(Date.now() - 172800000).toISOString(),
          preparedFor: 'Welfare Command',
          summary: 'Aggregated readiness metrics indicating rising operational fatigue in deployed units.',
          status: 'READY',
          keyFindings: [
            '25% increase in fatigue-related check-ins.',
            'Rest recovery trend is decreasing.'
          ]
        }
      ]);
    }, 1000);
  });
};

export const generateReport = async (category: string): Promise<Report> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `REP-GEN-${Math.floor(Math.random() * 10000)}`,
        title: `Generated ${category} Report`,
        category: category as any,
        date: new Date().toISOString(),
        preparedFor: 'Current User',
        summary: 'Newly generated report based on latest intelligence data.',
        status: 'READY',
        keyFindings: ['Analysis complete.']
      });
    }, 3000);
  });
};
