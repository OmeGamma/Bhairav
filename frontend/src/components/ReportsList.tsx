import React, { useEffect, useState } from 'react';
import Layout from './layout/Layout';
import { Download, FileText, Search } from 'lucide-react';

const ReportsList: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          setCases(data);
        }
      } catch (err) {
        console.error('Failed to load cases', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filteredCases = cases.filter(c => {
    const title = c.title || '';
    const caseNumber = c.caseNumber || c.case_number || '';
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || caseNumber.toLowerCase().includes(query);
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports by case number or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading reports...</div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg">No reports found</p>
              <p className="text-sm">Generate a report from a case detail page.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Case Number</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Title</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCases.map((c) => {
                    const caseId = c.caseNumber || c.case_number || c._id;
                    const reportUrl = `/api/reports/generate?case_id=${encodeURIComponent(caseId)}`;
                    return (
                      <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{caseId}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{c.title || 'Untitled'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            c.status === 'closed'
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              : c.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {c.status || 'open'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={reportUrl}
                            download={`Bhairav_Report_${caseId}.pdf`}
                            className="inline-flex items-center px-3 py-1.5 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download PDF
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsList;
