import React, { useState, useEffect } from 'react';
import { Report } from '../types/reports';
import { getReports, generateReport } from '../services/reportsService';
import { ReportCard } from '../components/Reports/ReportCard';
import { ContextDrawer } from '../components/Shared/ContextDrawer';
import { StatusBadge } from '../components/Shared/StatusBadge';

export const ReportsDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      const data = await getReports();
      setReports(data);
      setIsLoading(false);
    };
    fetchReports();
  }, []);

  const handleGenerate = async (category: string) => {
    setIsGenerating(true);
    try {
      const newReport = await generateReport(category);
      setReports([newReport, ...reports]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId) || null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-bhairav-text)]">Intelligence Reports</h1>
          <p className="text-[var(--color-bhairav-text-muted)] text-sm mt-1">Generated intelligence and welfare summaries</p>
        </div>

        <div className="flex gap-2">
          <div className="relative group">
            <button 
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              )}
              {isGenerating ? 'Generating...' : 'Generate New Report'}
            </button>
            
            {/* Simple Dropdown for Demo */}
            {!isGenerating && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="py-1">
                  {['Security', 'Verification', 'Network Intelligence', 'Personnel Welfare'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => handleGenerate(cat)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onView={(id) => setSelectedReportId(id)}
              onExport={(id) => console.log('Exporting', id)}
            />
          ))}
        </div>
      )}

      {/* Report Detail Drawer */}
      <ContextDrawer 
        isOpen={!!selectedReportId} 
        onClose={() => setSelectedReportId(null)}
        title="Report Details"
        width="full"
      >
        {selectedReport && (
          <div className="max-w-3xl mx-auto py-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">{selectedReport.category}</span>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedReport.title}</h2>
                <p className="text-sm text-gray-400 font-mono">ID: {selectedReport.id} • {new Date(selectedReport.date).toLocaleString()}</p>
              </div>
              <StatusBadge status="VERIFIED" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-900/50 p-4 border border-gray-800 rounded-lg">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Prepared For</span>
                <span className="text-sm font-medium text-gray-200">{selectedReport.preparedFor}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Classification</span>
                <span className="text-sm font-medium text-red-400">RESTRICTED</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">Executive Summary</h3>
              <p className="text-gray-300 leading-relaxed">{selectedReport.summary}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">Key Findings</h3>
              <ul className="space-y-3">
                {selectedReport.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-gray-300">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded p-12 flex flex-col items-center justify-center text-gray-500 mb-8">
              <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <p>Visualization placeholder for exported PDF rendering.</p>
            </div>

            <div className="flex gap-4">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Export as PDF
              </button>
            </div>
          </div>
        )}
      </ContextDrawer>
    </div>
  );
};
