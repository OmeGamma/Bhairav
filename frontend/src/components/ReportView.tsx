import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from './layout/Layout';
import { Download, FileText } from 'lucide-react';

const ReportView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { caseData } = location.state || {};

  if (!caseData) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-500">
          <p>No case data available for report generation.</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-light-accent text-white rounded">Go Back</button>
        </div>
      </Layout>
    );
  }

  const caseId = caseData.caseNumber || caseData.case_number;
  const reportUrl = `/api/reports/generate?case_id=${encodeURIComponent(caseId)}`;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Case Intelligence Report</h1>
          </div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-8">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-light-accent dark:text-dark-accent mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Report for {caseId}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Generate a professional PDF report with case details, evidence, persons, AI-assisted analysis, and geospatial/timeline data.
            </p>
            <a
              href={reportUrl}
              download={`Bhairav_Report_${caseId}.pdf`}
              className="inline-flex items-center px-6 py-3 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF Report
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportView;
