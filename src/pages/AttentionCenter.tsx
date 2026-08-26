import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Shield, CheckCircle, Search, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { alertService } from '../services/alertService';
import type { Alert } from '../types';
import { cn } from '../utils/cn';

export default function AttentionCenter() {
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'review' | 'intelligence' | 'welfare' | 'system'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError('Failed to fetch attention items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: 'all', label: 'All Items' },
    { id: 'critical', label: 'Critical', color: 'var(--color-bhairav-critical)' },
    { id: 'review', label: 'Review', color: 'var(--color-bhairav-warning)' },
    { id: 'intelligence', label: 'Intelligence', color: 'var(--color-bhairav-primary)' },
    { id: 'welfare', label: 'Welfare', color: 'var(--color-bhairav-verified)' },
    { id: 'system', label: 'System', color: 'var(--color-bhairav-neutral)' }
  ];

  if (loading) {
    return <LoadingState fullHeight message="Loading attention items..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const filteredAlerts = activeTab === 'all' 
    ? alerts 
    : alerts.filter(a => a.category === activeTab || (activeTab === 'critical' && a.severity === 'critical'));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attention Center</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Centralized hub for items requiring officer review</p>
        </div>
        <Badge status="critical" className="px-3 py-1.5 text-sm font-bold">
          {alerts.filter(a => a.severity === 'critical').length} Critical Action(s) Required
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-[var(--color-bhairav-border)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.id 
                ? "border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-primary)]" 
                : "border-transparent text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:border-[var(--color-bhairav-border)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={cn(
                "bg-[var(--color-bhairav-surface)] border p-4 rounded-xl cursor-pointer transition-all flex items-start gap-4 group",
                selectedAlert?.id === alert.id 
                  ? "border-[var(--color-bhairav-primary)] shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)]/50"
              )}
            >
              <div className="shrink-0 mt-1">
                {alert.severity === 'critical' ? (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bhairav-critical)]/10 flex items-center justify-center border border-[var(--color-bhairav-critical)]/30">
                    <AlertTriangle className="text-[var(--color-bhairav-critical)]" size={18} />
                  </div>
                ) : alert.category === 'intelligence' ? (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bhairav-primary)]/10 flex items-center justify-center border border-[var(--color-bhairav-primary)]/30">
                    <Search className="text-[var(--color-bhairav-primary)]" size={18} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bhairav-surface-hover)] flex items-center justify-center border border-[var(--color-bhairav-border)]">
                    <Bell className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors" size={18} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-[var(--color-bhairav-text)] truncate">{alert.title}</h4>
                  <span className="text-xs font-mono text-[var(--color-bhairav-text-muted)] whitespace-nowrap flex items-center gap-1">
                    <Clock size={12} /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-bhairav-text-muted)] line-clamp-2 mb-3">{alert.description}</p>
                
                <div className="flex items-center gap-3">
                  <Badge status={alert.severity}>{alert.category.toUpperCase()}</Badge>
                  {alert.actionRequired && (
                     <span className="text-xs font-medium text-[var(--color-bhairav-critical)] bg-[var(--color-bhairav-critical)]/10 px-2 py-0.5 rounded border border-[var(--color-bhairav-critical)]/20 animate-pulse">
                       ACTION REQUIRED
                     </span>
                  )}
                </div>
              </div>
              
              <div className="shrink-0 flex items-center h-full pt-4">
                 <ChevronRight size={20} className={cn(
                   "transition-colors", 
                   selectedAlert?.id === alert.id ? "text-[var(--color-bhairav-primary)]" : "text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)]"
                 )} />
              </div>
            </div>
          ))}
          
          {filteredAlerts.length === 0 && (
            <EmptyState icon={CheckCircle} title="All Caught Up" description="There are no items requiring your attention in this category." className="h-full border border-[var(--color-bhairav-border)] rounded-xl bg-[var(--color-bhairav-surface)]" />
          )}
        </div>

        {/* Selected Context Panel */}
        {selectedAlert && (
          <div className="w-1/3 min-w-[350px] bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden flex flex-col shadow-lg animate-in fade-in slide-in-from-right-4">
             <div className="p-4 border-b border-[var(--color-bhairav-border)] flex items-center justify-between bg-[var(--color-bhairav-surface)]/50">
                <div className="flex items-center gap-2">
                   <Shield className="text-[var(--color-bhairav-primary)]" size={16} />
                   <h3 className="font-semibold text-sm">Action Context</h3>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="text-[var(--color-bhairav-text-muted)] hover:text-white text-xs uppercase tracking-wider font-medium">
                   Close
                </button>
             </div>
             
             <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div>
                   <div className="flex items-center justify-between mb-3">
                      <Badge status={selectedAlert.severity}>{selectedAlert.id}</Badge>
                      <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                   </div>
                   <h2 className="text-xl font-bold mb-2">{selectedAlert.title}</h2>
                   <p className="text-[var(--color-bhairav-text)] leading-relaxed text-sm bg-[var(--color-bhairav-bg)] p-4 rounded-lg border border-[var(--color-bhairav-border)]">
                      {selectedAlert.description}
                   </p>
                </div>
                
                {selectedAlert.category === 'intelligence' && (
                  <div className="space-y-3">
                     <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-bhairav-text-muted)]">AI Analysis Summary</h4>
                     <p className="text-sm border-l-2 border-[var(--color-bhairav-primary)] pl-3 text-[var(--color-bhairav-text-muted)]">
                       Entity relationships have been updated based on recent cross-referencing. Review the newly generated intelligence graphs for potential threats.
                     </p>
                  </div>
                )}
             </div>
             
             <div className="p-4 border-t border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface)]/80 flex flex-col gap-2">
                <button className="w-full bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white py-2.5 rounded-md text-sm font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                   Acknowledge & Action
                </button>
                <button className="w-full bg-[var(--color-bhairav-bg)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-white py-2.5 rounded-md text-sm transition-colors">
                   Delegate
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
