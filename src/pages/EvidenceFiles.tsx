import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, Upload, FolderOpen, AlertTriangle, CheckCircle2,
  XCircle, Clock, Search, Filter, Download, Eye, Trash2, Link2, Unlink,
  MoreVertical, ChevronDown, RefreshCw, FileCheck2, X, Plus, FileText
} from 'lucide-react';
import { evidenceService } from '../services/evidenceService';
import { caseService } from '../services/caseService';
import type { EvidenceFile, EvidenceSourceType, ProcessingStatus, Classification, Case } from '../types/evidence';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { DemoBanner } from '../components/common/DemoBanner';
import { cn } from '../utils/cn';

const SOURCE_TYPES: EvidenceSourceType[] = [
  'FIR', 'POLICE_REPORT', 'CDR', 'FINANCIAL_RECORD', 'SURVEILLANCE_REPORT',
  'INTELLIGENCE_REPORT', 'SOCIAL_MEDIA_EXPORT', 'CRIMINAL_HISTORY',
  'VEHICLE_RECORD', 'IDENTITY_DOCUMENT', 'CCTV_VIDEO', 'CCTV_SNAPSHOT',
  'AUDIO', 'IMAGE', 'OTHER',
];

const CLASSIFICATIONS: Classification[] = ['PUBLIC', 'INTERNAL', 'RESTRICTED', 'CONFIDENTIAL'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusColor(status: ProcessingStatus): string {
  switch (status) {
    case 'PROCESSED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'QUEUED': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    case 'QUARANTINED': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

function getClassificationColor(c: Classification): string {
  switch (c) {
    case 'CONFIDENTIAL': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'RESTRICTED': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'INTERNAL': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
  }
}

export default function EvidenceFiles() {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<EvidenceSourceType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | ''>('');
  const [classificationFilter, setClassificationFilter] = useState<Classification | ''>('');
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [cases, setCases] = useState<Case[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailFile, setDetailFile] = useState<EvidenceFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await evidenceService.getFiles({
        search: search || undefined,
        source_type: sourceFilter || undefined,
        processing_status: statusFilter || undefined,
        classification: classificationFilter || undefined,
        skip,
        limit,
      });
      setFiles(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || 'Failed to load evidence files');
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter, statusFilter, classificationFilter, skip, limit]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    caseService.getCases({ limit: 100 }).then(res => setCases(res.items)).catch(() => {});
  }, []);

  const handleUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true);
    const newProgress: Record<string, string> = {};
    for (const file of Array.from(selectedFiles)) {
      newProgress[file.name] = 'Uploading...';
    }
    setUploadProgress(newProgress);

    for (const file of Array.from(selectedFiles)) {
      try {
        newProgress[file.name] = 'Uploading...';
        setUploadProgress({ ...newProgress });
        await evidenceService.uploadFile(file, {
          source_type: 'OTHER',
          description: `Uploaded via Bhairav Evidence Management`,
          classification: 'INTERNAL',
        });
        newProgress[file.name] = 'Completed';
      } catch (e: any) {
        newProgress[file.name] = `Failed: ${e.message}`;
      }
      setUploadProgress({ ...newProgress });
    }

    setUploading(false);
    setUploadModalOpen(false);
    loadFiles();
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this evidence file? This action will be audited.')) return;
    try {
      await evidenceService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (detailFile?.id === fileId) setDetailFile(null);
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  const handleLinkCase = async (fileId: string) => {
    const caseId = prompt('Enter Case ID to link:');
    if (!caseId) return;
    try {
      const updated = await evidenceService.linkCase(fileId, caseId);
      setFiles(prev => prev.map(f => f.id === fileId ? updated : f));
      if (detailFile?.id === fileId) setDetailFile(updated);
    } catch (e: any) {
      alert(e.message || 'Link failed');
    }
  };

  const handleUnlinkCase = async (fileId: string) => {
    try {
      const updated = await evidenceService.unlinkCase(fileId);
      setFiles(prev => prev.map(f => f.id === fileId ? updated : f));
      if (detailFile?.id === fileId) setDetailFile(updated);
    } catch (e: any) {
      alert(e.message || 'Unlink failed');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const stats = {
    total: files.length,
    processing: files.filter(f => ['VALIDATING', 'QUEUED', 'PROCESSING'].includes(f.processing_status)).length,
    processed: files.filter(f => f.processing_status === 'PROCESSED').length,
    failed: files.filter(f => f.processing_status === 'FAILED').length,
    cases: new Set(files.filter(f => f.case_id).map(f => f.case_id!)).size,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in-up">
      <DemoBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-bhairav-text)] uppercase">
            Evidence & Files
          </h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1 text-sm">
            Manage intelligence documents, datasets, media and investigation evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] transition-colors shadow-sm"
          >
            <Upload size={16} /> Upload Evidence
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Evidence', value: stats.total, icon: FolderOpen, color: 'text-blue-400 bg-blue-400/10' },
          { label: 'Processing', value: stats.processing, icon: Clock, color: 'text-amber-400 bg-amber-400/10' },
          { label: 'Processed', value: stats.processed, icon: FileCheck2, color: 'text-emerald-400 bg-emerald-400/10' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-400 bg-red-400/10' },
          { label: 'Cases', value: stats.cases, icon: Shield, color: 'text-purple-400 bg-purple-400/10' },
        ].map(stat => (
          <Card key={stat.label} className="!p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-[var(--color-bhairav-text)]">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" />
            <input
              type="text"
              placeholder="Search filename, description, tags, checksum..."
              value={search}
              onChange={e => { setSearch(e.target.value); setSkip(0); }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] placeholder:text-[var(--color-bhairav-text-muted)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={e => { setSourceFilter(e.target.value as EvidenceSourceType | ''); setSkip(0); }}
            className="px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
          >
            <option value="">All Sources</option>
            {SOURCE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as ProcessingStatus | ''); setSkip(0); }}
            className="px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
          >
            <option value="">All Statuses</option>
            {['UPLOADED', 'VALIDATING', 'QUEUED', 'PROCESSING', 'PROCESSED', 'PARTIALLY_PROCESSED', 'FAILED', 'QUARANTINED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={classificationFilter}
            onChange={e => { setClassificationFilter(e.target.value as Classification | ''); setSkip(0); }}
            className="px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
          >
            <option value="">All Classifications</option>
            {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => { setSkip(0); loadFiles(); }}
            className="p-2 rounded-lg border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {error && (
          <div className="p-4 text-xs text-amber-300 bg-amber-500/10 border-b border-amber-500/30">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface)]/50">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">File</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Type</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Case</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Source</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Classification</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Uploaded</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-bhairav-border)]">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center"><LoadingState message="Loading evidence..." /></td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center">
                  <EmptyState icon={FileText} title="No Evidence Files" description="Upload evidence to get started" />
                </td></tr>
              ) : (
                files.map(file => (
                  <tr key={file.id} className="hover:bg-[var(--color-bhairav-surface-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[var(--color-bhairav-text-muted)] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-bhairav-text)] truncate max-w-[200px]">{file.original_filename}</p>
                          <p className="text-[10px] text-[var(--color-bhairav-text-muted)] font-mono">{formatBytes(file.size_bytes)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-bhairav-text-muted)] uppercase text-xs font-mono">{file.extension}</td>
                    <td className="px-4 py-3 text-[var(--color-bhairav-text-muted)] text-xs">
                      {file.case_id ? <span className="text-[var(--color-bhairav-primary)]">{file.case_id.slice(-8)}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-bhairav-text-muted)] text-xs font-mono">{file.source_type}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border font-mono', getStatusColor(file.processing_status))}>
                        {file.processing_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border font-mono', getClassificationColor(file.classification))}>
                        {file.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-bhairav-text-muted)] text-xs">
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailFile(file)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors" title="View details">
                          <Eye size={14} />
                        </button>
                        {file.case_id ? (
                          <button onClick={() => handleUnlinkCase(file.id)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors" title="Unlink from case">
                            <Unlink size={14} />
                          </button>
                        ) : (
                          <button onClick={() => handleLinkCase(file.id)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors" title="Link to case">
                            <Link2 size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(file.id)} className="p-1.5 rounded hover:bg-red-500/10 text-[var(--color-bhairav-text-muted)] hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[var(--color-bhairav-border)] flex items-center justify-between">
            <p className="text-xs text-[var(--color-bhairav-text-muted)]">
              Showing {skip + 1}-{Math.min(skip + limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSkip(s => Math.max(0, s - limit))}
                disabled={skip === 0}
                className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-bhairav-border)] disabled:opacity-50 hover:border-[var(--color-bhairav-primary)] transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--color-bhairav-text-muted)]">{skip / limit + 1} / {totalPages}</span>
              <button
                onClick={() => setSkip(s => Math.min(total - limit, s + limit))}
                disabled={skip + limit >= total}
                className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-bhairav-border)] disabled:opacity-50 hover:border-[var(--color-bhairav-primary)] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setUploadModalOpen(false)} />
          <div className="relative w-full max-w-xl glass-sm rounded-xl border border-[var(--color-bhairav-border)] shadow-xl animate-slide-down">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-bhairav-border)]">
              <h3 className="text-lg font-bold text-[var(--color-bhairav-text)]">Upload Evidence</h3>
              <button onClick={() => setUploadModalOpen(false)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                  dragOver ? 'border-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-primary-soft)]' : 'border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)]'
                )}
              >
                <Upload size={32} className="mx-auto mb-3 text-[var(--color-bhairav-text-muted)]" />
                <p className="text-sm font-medium text-[var(--color-bhairav-text)]">Drag files here or browse</p>
                <p className="text-xs text-[var(--color-bhairav-text-muted)] mt-1">Supports documents, images, audio, video, CSV, XLSX, JSON</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={e => handleUpload(e.target.files)}
                />
              </div>

              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(uploadProgress).map(([name, status]) => (
                    <div key={name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-xs">
                      <span className="truncate max-w-[200px] text-[var(--color-bhairav-text)]">{name}</span>
                      <span className={cn('font-mono', status.includes('Completed') ? 'text-emerald-400' : status.includes('Failed') ? 'text-red-400' : 'text-amber-400')}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {detailFile && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDetailFile(null)} />
          <div className="relative w-full max-w-lg bg-[var(--color-bhairav-bg)] border-l border-[var(--color-bhairav-border)] shadow-xl overflow-y-auto animate-slide-right">
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg)]/80 backdrop-blur">
              <h3 className="text-lg font-bold text-[var(--color-bhairav-text)]">Evidence Details</h3>
              <button onClick={() => setDetailFile(null)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Filename', detailFile.original_filename],
                  ['Type', detailFile.mime_type],
                  ['Size', formatBytes(detailFile.size_bytes)],
                  ['Extension', detailFile.extension],
                  ['Source', detailFile.source_type],
                  ['Classification', detailFile.classification],
                  ['Status', detailFile.processing_status],
                  ['Version', String(detailFile.version)],
                  ['Uploaded By', detailFile.uploaded_by],
                  ['Upload Date', new Date(detailFile.uploaded_at).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label as string} className={cn('col-span-2', label === 'Filename' ? '' : 'col-span-1')}>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">{label}</p>
                    <p className="text-sm text-[var(--color-bhairav-text)] mt-0.5 break-all">{value}</p>
                  </div>
                ))}
              </div>

              {detailFile.description && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Description</p>
                  <p className="text-sm text-[var(--color-bhairav-text)] mt-0.5">{detailFile.description}</p>
                </div>
              )}

              {detailFile.tags?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detailFile.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text-muted)] font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detailFile.checksum_sha256 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">SHA-256 Checksum</p>
                  <p className="text-xs text-[var(--color-bhairav-text)] mt-0.5 font-mono break-all">{detailFile.checksum_sha256}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-bhairav-border)]">
                <button
                  onClick={async () => {
                    try {
                      const blob = await evidenceService.downloadFile(detailFile.id);
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = detailFile.original_filename;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (e: any) {
                      alert(e.message || 'Download failed');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text)] transition-colors"
                >
                  <Download size={14} /> Download
                </button>
                {detailFile.case_id ? (
                  <button onClick={() => handleUnlinkCase(detailFile.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-[var(--color-bhairav-border)] hover:border-orange-400 text-[var(--color-bhairav-text)] transition-colors">
                    <Unlink size={14} /> Unlink Case
                  </button>
                ) : (
                  <button onClick={() => handleLinkCase(detailFile.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text)] transition-colors">
                    <Link2 size={14} /> Link to Case
                  </button>
                )}
                <button onClick={() => handleDelete(detailFile.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-red-500/30 hover:bg-red-500/10 text-red-400 transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
