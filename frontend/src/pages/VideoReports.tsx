import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  Video, Search, AlertTriangle, CheckCircle, Clock, Eye,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface VideoReport {
  id: string;
  reportId: string;
  eventType: string;
  sourceType: string;
  sourceName: string;
  confidence: number;
  status: string;
  caseId: string | null;
  timestamp: string | null;
  createdAt: string | null;
  personCropUrl: string | null;
  fullFrameUrl: string | null;
  trackId: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  REVIEWED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  FLAGGED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  NEW: <Clock className="w-4 h-4" />,
  REVIEWED: <Eye className="w-4 h-4" />,
  CLOSED: <CheckCircle className="w-4 h-4" />,
  FLAGGED: <AlertTriangle className="w-4 h-4" />,
};

const VideoReports: React.FC = () => {
  const [reports, setReports] = useState<VideoReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/video-intelligence/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to load video reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.eventType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.caseId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || r.sourceType === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sourceFilter]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <Video className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Reports</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/video-intelligence"
              className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center text-sm"
            >
              <Video className="w-4 h-4 mr-2" /> Live Intelligence
            </Link>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {filteredReports.length} video {filteredReports.length === 1 ? 'report' : 'reports'} found.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event type, source, case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-light-accent dark:focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-light-accent focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="FLAGGED">Flagged</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-light-accent focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="CAMERA">Camera</option>
              <option value="UPLOADED_VIDEO">Uploaded Video</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin opacity-30" />
              Loading video reports...
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg text-gray-900 dark:text-white">No video reports found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {reports.length === 0
                  ? 'Upload a video or start a live camera to generate reports.'
                  : 'No reports match your current filters.'}
              </p>
            </div>
          ) : (
            <div className="min-w-0 flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Source</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Event</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Confidence</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Case ID</th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Timestamp</th>
                    <th className="px-6 py-3 text-right text-gray-500 dark:text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginated.map((r) => (
                    <tr
                      key={r.reportId || r.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[r.status] || STATUS_COLORS['NEW']
                          }`}
                        >
                          {STATUS_ICONS[r.status] || STATUS_ICONS['NEW']}
                          {r.status || 'NEW'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {r.sourceName || r.sourceType || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {r.eventType || 'PERSON_DETECTED'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-light-accent dark:bg-dark-accent h-2 rounded-full"
                              style={{ width: `${Math.round((r.confidence || 0) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                            {Math.round((r.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.caseId ? (
                          <Link
                            to={`/cases/${r.caseId}`}
                            className="text-light-accent dark:text-blue-400 hover:underline text-sm"
                          >
                            {r.caseId}
                          </Link>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {r.timestamp
                          ? new Date(r.timestamp).toLocaleString()
                          : r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/video-reports/${r.reportId || r.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages} ({filteredReports.length} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VideoReports;