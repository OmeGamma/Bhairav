import { useEffect, useState } from 'react';
import { Timeline, TimelineEvent } from '../Shared/Timeline';
import type { NetworkEntity } from '../../types/network';
import { fetchWithTimeout, API_BASE_URL } from '../../services/apiClient';

interface NetworkTimelineProps {
  entity: NetworkEntity | null;
}

interface BackendTimelineItem {
  timestamp?: string;
  title?: string;
  description?: string;
  source?: string;
  type?: string;
  status?: string;
  confidence?: number;
  event_id?: string;
  case_id?: string;
}

export function NetworkTimeline({ entity }: NetworkTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entity) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const url = `${API_BASE_URL}/network/timeline/${encodeURIComponent(entity.id)}?limit=25`;
    (async () => {
      try {
        const response = await fetchWithTimeout(
          url,
          { method: 'GET', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
          8000,
        );
        if (!response.ok) {
          if (!cancelled) setEvents([]);
          return;
        }
        const data: BackendTimelineItem[] = await response.json();
        if (cancelled) return;
        setEvents(
          (data || []).map((it, i) => ({
            id: `${entity.id}-${i}`,
            timestamp: it.timestamp || new Date().toISOString(),
            title: it.title || it.type || 'Observation recorded',
            description:
              it.description ||
              [it.source, it.status, it.confidence !== undefined ? `confidence: ${it.confidence}` : '']
                .filter(Boolean)
                .join(' • '),
            status: (it.status || 'OBSERVED') as any,
          })),
        );
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entity?.id]);

  return (
    <div className="bg-[var(--color-bhairav-slate)] h-full flex flex-col rounded-xl border border-[var(--color-bhairav-graphite)] overflow-hidden">
      <h3 className="text-xs font-semibold text-white mb-0 p-4 pb-3 border-b border-[var(--color-bhairav-graphite)] uppercase tracking-widest">
        Timeline {entity ? `— ${entity.label}` : ''}
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 p-4 pt-4">
        {entity ? (
          events.length > 0 ? (
            <Timeline events={events} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[var(--color-bhairav-text-muted)] font-mono tracking-widest">
              {loading ? 'Loading timeline…' : 'No timeline events recorded for this entity.'}
            </div>
          )
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[var(--color-bhairav-text-muted)] font-mono tracking-widest">
            Select an entity in the graph to view its timeline.
          </div>
        )}
      </div>
    </div>
  );
}
