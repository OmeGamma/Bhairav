import { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { taskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { cn } from '../utils/cn';

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  not_started: { label: 'Not Started', color: 'text-slate-300', bg: 'bg-slate-500/15', border: 'border-slate-500/30' },
  in_progress: { label: 'In Progress', color: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  completed: { label: 'Completed', color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  overdue: { label: 'Overdue', color: 'text-rose-300', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
};

const PRIORITY_STYLE: Record<string, string> = {
  low: 'text-slate-300',
  medium: 'text-amber-300',
  high: 'text-orange-300',
  critical: 'text-rose-300',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'overdue' | 'completed'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch {
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = {
    all: tasks.length,
    open: tasks.filter((t) => t.status === 'not_started' || t.status === 'in_progress').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filtered = tasks
    .filter((t) => {
      if (filter === 'open') return t.status === 'not_started' || t.status === 'in_progress';
      if (filter === 'overdue') return t.status === 'overdue';
      if (filter === 'completed') return t.status === 'completed';
      return true;
    })
    .filter((t) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    });

  if (loading) return <LoadingState fullHeight message="Loading tasks..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Tasks</h1>
        <p className="text-[var(--color-bhairav-text-muted)] mt-1 text-sm">
          Assigned tasks and operational follow-ups
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'Total', value: counts.all, icon: CheckSquare },
          { key: 'open', label: 'Open', value: counts.open, icon: Clock },
          { key: 'overdue', label: 'Overdue', value: counts.overdue, icon: AlertTriangle },
          { key: 'completed', label: 'Completed', value: counts.completed, icon: CheckSquare },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key as any)}
            className={cn(
              "glass-sm border rounded-xl p-4 text-left transition-colors",
              filter === s.key
                ? "border-[var(--color-bhairav-primary)] bg-[var(--color-bhairav-steel)]/10"
                : "border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)]/40",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className="text-[var(--color-bhairav-text-muted)]" />
              <span className="text-2xl font-bold font-mono text-white">{s.value}</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">
              {s.label}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-3 py-2.5 glass-sm border border-[var(--color-bhairav-border-strong)] rounded-md text-sm text-white focus:outline-none focus:border-[var(--color-bhairav-primary)]"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks"
          description="No tasks match the current filters."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const status = STATUS_STYLE[task.status] || STATUS_STYLE.not_started;
            return (
              <div
                key={task.id}
                className="glass-sm border border-[var(--color-bhairav-border-strong)] rounded-xl p-4 hover:border-[var(--color-bhairav-primary)]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border",
                          status.color,
                          status.bg,
                          status.border,
                        )}
                      >
                        {status.label}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-widest font-mono",
                          PRIORITY_STYLE[task.priority],
                        )}
                      >
                        {task.priority}
                      </span>
                      {task.linkedModule && (
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">
                          · {task.linkedModule}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white mt-1">{task.title}</h3>
                    <p className="text-sm text-[var(--color-bhairav-text-muted)] mt-1 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">
                      <span>From: {task.assignedBy}</span>
                      <span>·</span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-[var(--color-bhairav-text-muted)] flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
