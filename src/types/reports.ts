export interface Report {
  id: string;
  title: string;
  category: 'Security' | 'Verification' | 'Network Intelligence' | 'Personnel Welfare';
  date: string;
  preparedFor: string;
  summary: string;
  status: 'READY' | 'GENERATING' | 'FAILED';
  keyFindings: string[];
}
