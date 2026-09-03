import { useEffect, useState } from 'react';
import { X, Users, MapPin, Car, FileText, AlertCircle, Building, Phone, Hash, Clock } from 'lucide-react';
import type { NetworkEntity, EntityType } from '../../types/network';
import { networkService } from '../../services/networkService';
import { cn } from '../../utils/cn';

interface EntityDetailsPanelProps {
  entity: NetworkEntity | null;
  onClose?: () => void;
  onSelectRelated?: (id: string) => void;
}

const TYPE_ICON: Record<EntityType, React.ComponentType<{ size?: number; className?: string }>> = {
  PERSON: Users,
  VEHICLE: Car,
  LOCATION: MapPin,
  INCIDENT: AlertCircle,
  CASE: FileText,
  ORGANIZATION: Building,
  ALIAS: Users,
  COMMUNICATION: Phone,
  DOCUMENT: FileText,
  EVENT: AlertCircle,
};

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  OBSERVED: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  INFERRED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  REVIEW: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  UNVERIFIED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  CLEARED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  UNKNOWN: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

export function EntityDetailsPanel({ entity, onClose, onSelectRelated }: EntityDetailsPanelProps) {
  const [details, setDetails] = useState<NetworkEntity | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entity) {
      setDetails(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    networkService
      .getEntityDetails(entity.id)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entity?.id]);

  if (!entity) {
    return (
      <div className="bg-[var(--color-bhairav-slate)] border border-[var(--color-bhairav-graphite)] rounded-xl p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] flex items-center justify-center mb-4">
          <Hash size={20} className="text-[var(--color-bhairav-text-muted)]" />
        </div>
        <p className="text-[var(--color-bhairav-text-muted)] text-xs font-mono tracking-widest uppercase">
          Select a node
        </p>
        <p className="text-[var(--color-bhairav-text-muted)] text-[11px] mt-1 max-w-[200px]">
          Click any entity in the graph to view its details, provenance, and connections.
        </p>
      </div>
    );
  }

  const Icon = TYPE_ICON[entity.type] || Users;
  const status = (entity.status || details?.status || 'UNKNOWN').toUpperCase();
  const statusClass = STATUS_STYLE[status] || STATUS_STYLE.UNKNOWN;

  const relatedItems: { key: string; value: number }[] = details?.details
    ? Object.entries(details.details)
        .filter(([k]) => ['RelatedEvents', 'RelatedCases', 'RelatedVehicles', 'RelatedLocations'].includes(k))
        .map(([k, v]) => ({ key: k, value: Number(v) || 0 }))
    : [];

  const metaEntries = details?.details
    ? Object.entries(details.details).filter(
        ([k]) => !['RelatedEvents', 'RelatedCases', 'RelatedVehicles', 'RelatedLocations'].includes(k),
      )
    : [];

  return (
    <div className="bg-[var(--color-bhairav-slate)] border border-[var(--color-bhairav-graphite)] rounded-xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-bhairav-graphite)]">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-[var(--color-bhairav-steel)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-[var(--color-bhairav-text-muted)] tracking-widest">
                  {entity.type}
                </span>
                <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border", statusClass)}>
                  {status}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white uppercase tracking-tight truncate">
                {entity.label}
              </h2>
              <p className="text-[10px] text-[var(--color-bhairav-text-muted)] font-mono mt-1 truncate">
                ID: {entity.id}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors p-1"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {loading && (
          <div className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest animate-pulse">
            Loading details...
          </div>
        )}

        {/* Connections */}
        {(details?.connectionsCount !== undefined || relatedItems.length > 0) && (
          <div>
            <h3 className="text-[10px] font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">
              Connections
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {details?.connectionsCount !== undefined && (
                <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md p-3">
                  <p className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-1">
                    Connected
                  </p>
                  <p className="text-lg font-semibold text-white font-mono">
                    {details.connectionsCount}
                  </p>
                </div>
              )}
              {relatedItems.map((r) => (
                <div
                  key={r.key}
                  className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md p-3"
                >
                  <p className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-1">
                    {r.key.replace('Related', '')}
                  </p>
                  <p className="text-lg font-semibold text-white font-mono">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {metaEntries.length > 0 && (
          <div>
            <h3 className="text-[10px] font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">
              Details
            </h3>
            <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md p-3 space-y-2">
              {metaEntries.map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs gap-3">
                  <span className="text-[var(--color-bhairav-text-muted)] uppercase tracking-wide text-[10px]">
                    {k}
                  </span>
                  <span className="text-white font-mono truncate text-right">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provenance */}
        <div>
          <h3 className="text-[10px] font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">
            Provenance
          </h3>
          <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[var(--color-bhairav-text-muted)]">
              <Clock size={12} />
              <span>Last updated: {new Date().toISOString().slice(0, 10)}</span>
            </div>
            <p className="text-[10px] text-[var(--color-bhairav-text-muted)] leading-relaxed">
              All relationships and metadata reflect data ingested into BHAIRAV at the time of query.
              Confidence and status fields are recorded at source ingestion.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {onSelectRelated && (
        <div className="border-t border-[var(--color-bhairav-graphite)] p-4">
          <button
            onClick={() => onSelectRelated(entity.id)}
            className="w-full py-2 bg-[var(--color-bhairav-steel)]/15 hover:bg-[var(--color-bhairav-steel)]/25 text-white rounded-md text-xs transition-colors border border-[var(--color-bhairav-steel)]/40 uppercase tracking-widest font-medium"
          >
            Expand 1-hop neighborhood
          </button>
        </div>
      )}
    </div>
  );
}
