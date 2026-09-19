import React, { useEffect, useState } from 'react';
import Layout from './layout/Layout';
import { Download, FileText, Search, Trash2, AlertTriangle, X } from 'lucide-react';

const ReportsList: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${deleteCandidate.reportId || deleteCandidate._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteCandidate(null);
        fetchReports(); // refresh list
      } else {
        const errData = await res.json();
        alert(`Failed to delete: ${errData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to delete report', err);
      alert('An error occurred during deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const title = r.title || r.reportId || '';
    const caseId = r.caseId || '';
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || caseId.toLowerCase().includes(query);
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Cleanup</h1>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports by ID or Case ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg">No reports found</p>
              <p className="text-sm">Generate a report from a case detail page.</p>
            </div>
          ) : (
            <div className="min-w-0 flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Report ID</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Case ID</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Created At</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Storage</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReports.map((r) => {
                    const rId = r.reportId || r._id;
                    const date = r.generatedAt || r.createdAt;
                    const displayDate = date ? new Date(date).toLocaleDateString() : 'Unknown';
                    const hasCloudinary = r.storagePath ? 'Cloudinary' : 'Local';
                    return (
                      <tr key={rId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{rId}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{r.caseId || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{r.reportType || 'Standard'}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{displayDate}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          <span className={`px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`}>
                            {hasCloudinary}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <a
                            href={`/api/reports/download/${rId}`} // Assuming download endpoint if it existed, or just a dummy button for demo if not supported directly yet
                            className="inline-flex items-center px-3 py-1.5 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors text-sm"
                            onClick={(e) => {
                              // If there's no actual download URL stored, we can fallback to generate logic
                              if (!r.reportUrl) {
                                e.preventDefault();
                                window.location.href = `/api/reports/generate?case_id=${encodeURIComponent(r.caseId)}`;
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </a>
                          <button
                            onClick={() => setDeleteCandidate(r)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md font-medium transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-md border border-light-border dark:border-dark-border">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-bold">Delete Report</h3>
                </div>
                <button onClick={() => setDeleteCandidate(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6 text-gray-700 dark:text-gray-300">
                <p className="mb-2">Delete this report permanently?</p>
                <p className="text-sm font-semibold">{deleteCandidate.reportId || deleteCandidate._id}</p>
                <p className="text-xs text-gray-500 mt-2">
                  This action removes the report record and associated stored media where applicable. The case and other entities will remain intact.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportsList;
