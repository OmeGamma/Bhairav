import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import {
  Video, Clock, Eye, AlertTriangle, CheckCircle,
  FileImage, Link as LinkIcon, Trash2, ExternalLink
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../api/client';

interface CaseOption {
  case_number: string;
  title: string;
}

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
  updatedAt: string | null;
  personCropUrl: string | null;
  fullFrameUrl: string | null;
  trackId: number | null;
  boundingBox: Record<string, number> | null;
  className: string | null;
  videoTimestamp: string | null;
  frameNumber: number | null;
  humanCount: number | null;
  objectsDetected: any[] | null;
  timeline: string | null;
  videoDurationSec: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
  REVIEWED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
  FLAGGED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  NEW: <Clock className="w-4 h-4" />,
  REVIEWED: <Eye className="w-4 h-4" />,
  CLOSED: <CheckCircle className="w-4 h-4" />,
  FLAGGED: <AlertTriangle className="w-4 h-4" />,
};

const VideoReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<VideoReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLinkingCase, setIsLinkingCase] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/video-intelligence/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setSelectedCaseId(data.caseId || '');
      } else if (res.status === 404) {
        setError('Video report not found');
      }
    } catch (err) {
      setError('Failed to load video report');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error('Failed to load cases', err);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchReport();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!report) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/video-intelligence/reports/${report.reportId || report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReport(updated);
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const linkToCase = async () => {
    if (!report) return;
    setIsLinkingCase(true);
    try {
      const res = await fetch(
        `/api/video-intelligence/reports/${report.reportId || report.id}/link-case?case_id=${encodeURIComponent(selectedCaseId)}`,
        { method: 'POST' }
      );
      if (res.ok) {
        const updated = await res.json();
        setReport(updated);
      } else {
        setError('Failed to link case');
      }
    } catch (err) {
      setError('Failed to link case');
      console.error(err);
    } finally {
      setIsLinkingCase(false);
    }
  };

  const unlinkCase = async () => {
    if (!report) return;
    setIsLinkingCase(true);
    try {
      const res = await fetch(
        `/api/video-intelligence/reports/${report.reportId || report.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: null }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setReport(updated);
        setSelectedCaseId('');
      } else {
        setError('Failed to unlink case');
      }
    } catch (err) {
      setError('Failed to unlink case');
      console.error(err);
    } finally {
      setIsLinkingCase(false);
    }
  };

  const handleDeleteReport = async () => {
    if (confirm(`PERMANENT DELETE\n\nReport: ${report?.reportId}\nThis action permanently deletes the video report and associated media from Cloudinary.\n\nContinue?`)) {
      try {
        const res = await apiClient.delete(`/api/video-reports/${report?.reportId}`);
        if (res.ok) {
          navigate('/video-reports');
        } else {
          alert(`Unable to delete video report: ${res.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error("Delete failed", err);
        alert("Unable to delete video report due to an unexpected error.");
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-6 h-6 mr-2" />
            {error}
          </div>
          <button
            onClick={() => navigate('/video-reports')}
            className="mt-4 px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </Layout>
    );
  }

  if (!report) return null;

  const statusColor = STATUS_COLORS[report.status] || STATUS_COLORS['NEW'];
  const statusIcon = STATUS_ICONS[report.status] || STATUS_ICONS['NEW'];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Video className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Report</h1>
          </div>
          <Link
            to="/video-reports"
            className="text-sm text-light-accent dark:text-blue-400 hover:underline"
          >
            ← Back to All Reports
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
            {report.personCropUrl ? (
              <img
                src={report.personCropUrl}
                alt="Person detection crop"
                className="w-full h-64 object-cover"
              />
            ) : report.fullFrameUrl ? (
              <img
                src={report.fullFrameUrl}
                alt="Full frame"
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <Video className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
            )}

            {report.boundingBox && Object.keys(report.boundingBox).length > 0 && (
              <div className="p-4 border-t border-light-border dark:border-dark-border">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Bounding Box</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">x1:</span>
                    <span className="text-gray-900 dark:text-white">{report.boundingBox.x1}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">y1:</span>
                    <span className="text-gray-900 dark:text-white">{report.boundingBox.y1}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">x2:</span>
                    <span className="text-gray-900 dark:text-white">{report.boundingBox.x2}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">y2:</span>
                    <span className="text-gray-900 dark:text-white">{report.boundingBox.y2}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Report ID</dt>
                  <dd className="text-gray-900 dark:text-white font-mono text-xs mt-1">{report.reportId || report.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Event Type</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">{report.eventType || 'PERSON_DETECTED'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Class</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">{report.className || 'person'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Confidence</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-light-accent dark:bg-dark-accent h-2 rounded-full"
                          style={{ width: `${Math.round((report.confidence || 0) * 100)}%` }}
                        />
                      </div>
                      <span>{Math.round((report.confidence || 0) * 100)}%</span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Track ID</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">{report.trackId ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Frame Number</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">{report.frameNumber ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Video Timestamp</dt>
                  <dd className="text-gray-900 dark:text-white mt-1">{report.videoTimestamp || '—'}</dd>
                </div>
              </dl>
            </div>

            {(report.humanCount !== null && report.humanCount !== undefined) && (
              <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Summary</h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Approximate Humans Observed</dt>
                    <dd className="text-gray-900 dark:text-white mt-1">{report.humanCount}</dd>
                  </div>
                  {report.videoDurationSec !== null && report.videoDurationSec !== undefined && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Video Duration</dt>
                      <dd className="text-gray-900 dark:text-white mt-1">
                        {Math.floor(report.videoDurationSec / 60)}m {Math.round(report.videoDurationSec % 60)}s
                      </dd>
                    </div>
                  )}
                  {report.objectsDetected && report.objectsDetected.length > 0 && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Objects Detected</dt>
                      <dd className="text-gray-900 dark:text-white mt-1">
                        <ul className="list-disc list-inside space-y-1">
                          {report.objectsDetected.map((obj: any, idx: number) => (
                            <li key={idx}>{obj.class?.charAt(0).toUpperCase() + obj.class?.slice(1)}: {obj.label || obj.count}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  {report.timeline && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Detection Timeline</dt>
                      <dd className="text-gray-900 dark:text-white mt-1">
                        <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                          {report.timeline}
                        </pre>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusColor}`}
                >
                  {statusIcon}
                  {report.status || 'NEW'}
                </span>
                <select
                  value={report.status || 'NEW'}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={isUpdatingStatus}
                  className={`text-sm px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-light-accent disabled:opacity-50`}
                >
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="FLAGGED">Flagged</option>
                  <option value="CLOSED">Closed</option>
                </select>
                {isUpdatingStatus && <RefreshCw2 className="w-4 h-4 animate-spin text-gray-400" />}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Case Linking</h2>
              {report.caseId ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Linked to case</p>
                    <Link
                      to={`/cases/${report.caseId}`}
                      className="text-light-accent dark:text-blue-400 hover:underline font-medium"
                    >
                      {report.caseId}
                    </Link>
                  </div>
                  <button
                    onClick={unlinkCase}
                    disabled={isLinkingCase}
                    className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Unlink case"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Not linked to any case.</p>
              )}

              <div className="flex gap-2">
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  disabled={isLinkingCase || !report.caseId}
                  className="flex-1 text-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-light-accent disabled:opacity-50"
                >
                  <option value="">Select a case...</option>
                  {cases.map((c) => (
                    <option key={c.case_number} value={c.case_number}>
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
                {selectedCaseId && !report.caseId && (
                  <button
                    onClick={linkToCase}
                    disabled={isLinkingCase}
                    className="px-3 py-1 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDeleteReport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 bg-white dark:bg-dark-card text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete Report</span>
                </button>
              </div>
            </div>

            {(report.fullFrameUrl || report.personCropUrl) && (
              <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Evidence Files</h2>
                <div className="space-y-3">
                  {report.fullFrameUrl && (
                    <a
                      href={report.fullFrameUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FileImage className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Full Frame</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Full video frame image</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                  {report.personCropUrl && (
                    <a
                      href={report.personCropUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FileImage className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Person Crop</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cropped person detection</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
          <div className="space-y-4">
            {report.createdAt && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-light-accent dark:bg-dark-accent rounded-full mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Report Created</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {report.updatedAt && report.updatedAt !== report.createdAt && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Status Updated</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(report.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {report.timestamp && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Event Timestamp</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const RefreshCw2: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h5m10.667-3.333A7.633 7.633 0 0112 19a7.633 7.633 0 01-7.667-7"
    />
  </svg>
);

export default VideoReportDetail;