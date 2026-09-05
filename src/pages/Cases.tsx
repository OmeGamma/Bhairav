import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Search, Filter, Eye, Trash2, FileText, Link2, Unlink,
  RefreshCw, X, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { caseService } from '../services/caseService';
import { evidenceService } from '../services/evidenceService';
import type { Case, CaseStatus, CasePriority, Classification, EvidenceFile } from '../types/evidence';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { DemoBanner } from '../components/common/DemoBanner';
import { cn } from '../utils/cn';

const STATUSES: CaseStatus[] = ['OPEN', 'UNDER_INVESTIGATION', 'ON_HOLD', 'CLOSED', 'ARCHIVED'];
const PRIORITIES: CasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CLASSIFICATIONS: Classification[] = ['PUBLIC', 'INTERNAL', 'RESTRICTED', 'CONFIDENTIAL'];

function getStatusColor(status: CaseStatus): string {
  switch (status) {
    case 'OPEN': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'UNDER_INVESTIGATION': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'ON_HOLD': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    case 'CLOSED': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    case 'ARCHIVED': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

function getPriorityColor(priority: CasePriority): string {
  switch (priority) {
    case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    case 'LOW': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
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

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | ''>('');
  const [skip, setSkip] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailCase, setDetailCase] = useState<Case | null>(null);
  const [caseEvidence, setCaseEvidence] = useState<EvidenceFile[]>([]);
  const [createForm, setCreateForm] = useState({ title: '', description: '', status: 'OPEN' as CaseStatus, priority: 'MEDIUM' as CasePriority, classification: 'INTERNAL' as Classification });
  const limit = 20;

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await caseService.getCases({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        skip,
        limit,
      });
      setCases(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setError(e.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, skip, limit]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await caseService.createCase(createForm);
      setCases(prev => [created, ...prev]);
      setCreateModalOpen(false);
      setCreateForm({ title: '', description: '', status: 'OPEN', priority: 'MEDIUM', classification: 'INTERNAL' });
    } catch (err: any) {
      alert(err.message || 'Failed to create case');
    }
  };

  const openCaseDetail = async (c: Case) => {
    setDetailCase(c);
    try {
      const allFiles = await evidenceService.getFiles({ case_id: c.id, limit: 100 });
      setCaseEvidence(allFiles.items);
    } catch {
      setCaseEvidence([]);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in-up">
      <DemoBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-bhairav-text)] uppercase">
            Investigations
          </h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1 text-sm">
            Manage investigations and track linked evidence.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] transition-colors shadow-sm"
        >
          <Plus size={16} /> Create Case
        </button>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" />
            <input
              type="text"
              placeholder="Search cases by title, description..."
              value={search}
              onChange={e => { setSearch(e.target.value); setSkip(0); }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] placeholder:text-[var(--color-bhairav-text-muted)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as CaseStatus | ''); setSkip(0); }}
            className="px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={e => { setPriorityFilter(e.target.value as CasePriority | ''); setSkip(0); }}
            className="px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={() => { setSkip(0); loadCases(); }} className="p-2 rounded-lg border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors">
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
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Case</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Priority</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Classification</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Evidence</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Updated</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-bhairav-border)]">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center"><LoadingState message="Loading cases..." /></td></tr>
              ) : cases.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <EmptyState icon={Shield} title="No Cases Found" description="Create a new investigation to get started" />
                </td></tr>
              ) : (
                cases.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--color-bhairav-surface-hover)] transition-colors cursor-pointer" onClick={() => openCaseDetail(c)}>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-bhairav-text)] truncate">{c.title}</p>
                        {c.case_number && <p className="text-[10px] text-[var(--color-bhairav-text-muted)] font-mono">{c.case_number}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border font-mono', getStatusColor(c.status))}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border font-mono', getPriorityColor(c.priority))}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border font-mono', getClassificationColor(c.classification))}>
                        {c.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-bhairav-text-muted)] text-xs">
                      {c.related_evidence?.length ?? 0} files
                    </td>
                    <td className="px-4 py-3 text-[var(--color-bhairav-text-muted)] text-xs">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openCaseDetail(c)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors" title="View details">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[var(--color-bhairav-border)] flex items-center justify-between">
            <p className="text-xs text-[var(--color-bhairav-text-muted)]">
              Showing {skip + 1}-{Math.min(skip + limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setSkip(s => Math.max(0, s - limit))} disabled={skip === 0} className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-bhairav-border)] disabled:opacity-50 hover:border-[var(--color-bhairav-primary)] transition-colors">Previous</button>
              <span className="text-xs text-[var(--color-bhairav-text-muted)]">{skip / limit + 1} / {totalPages}</span>
              <button onClick={() => setSkip(s => Math.min(total - limit, s + limit))} disabled={skip + limit >= total} className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-bhairav-border)] disabled:opacity-50 hover:border-[var(--color-bhairav-primary)] transition-colors">Next</button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCreateModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-sm rounded-xl border border-[var(--color-bhairav-border)] shadow-xl animate-slide-down">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-bhairav-border)]">
              <h3 className="text-lg font-bold text-[var(--color-bhairav-text)]">Create Investigation</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-bhairav-text-muted)] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-bhairav-text-muted)] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-bhairav-text-muted)] mb-1">Status</label>
                  <select
                    value={createForm.status}
                    onChange={e => setCreateForm(p => ({ ...p, status: e.target.value as CaseStatus }))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-bhairav-text-muted)] mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={e => setCreateForm(p => ({ ...p, priority: e.target.value as CasePriority }))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)]"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 rounded-lg text-sm border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text)] transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Detail Panel */}
      {detailCase && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDetailCase(null)} />
          <div className="relative w-full max-w-lg bg-[var(--color-bhairav-bg)] border-l border-[var(--color-bhairav-border)] shadow-xl overflow-y-auto animate-slide-right">
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg)]/80 backdrop-blur">
              <h3 className="text-lg font-bold text-[var(--color-bhairav-text)]">Case Details</h3>
              <button onClick={() => setDetailCase(null)} className="p-1.5 rounded hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Title</p>
                <p className="text-sm text-[var(--color-bhairav-text)] mt-0.5">{detailCase.title}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Description</p>
                <p className="text-sm text-[var(--color-bhairav-text)] mt-0.5">{detailCase.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Status</p>
                  <span className={cn('inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border font-mono', getStatusColor(detailCase.status))}>
                    {detailCase.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">Priority</p>
                  <span className={cn('inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest border font-mono', getPriorityColor(detailCase.priority))}>
                    {detailCase.priority}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono mb-2">Linked Evidence ({caseEvidence.length})</p>
                {caseEvidence.length === 0 ? (
                  <p className="text-xs text-[var(--color-bhairav-text-muted)]">No evidence linked to this case.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {caseEvidence.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)]">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={14} className="text-[var(--color-bhairav-text-muted)] shrink-0" />
                          <span className="text-xs text-[var(--color-bhairav-text)] truncate">{ev.original_filename}</span>
                        </div>
                        <button
                          onClick={async () => {
                            await evidenceService.unlinkCase(ev.id);
                            setCaseEvidence(prev => prev.filter(x => x.id !== ev.id));
                          }}
                          className="p-1 rounded hover:bg-red-500/10 text-[var(--color-bhairav-text-muted)] hover:text-red-400 shrink-0"
                          title="Unlink"
                        >
                          <Unlink size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
