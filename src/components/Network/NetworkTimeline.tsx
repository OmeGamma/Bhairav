import React from 'react';
import { Timeline, TimelineEvent } from '../Shared/Timeline';
import { NetworkEntity } from '../../types/network';

interface NetworkTimelineProps {
  entity: NetworkEntity | null;
}

export const NetworkTimeline: React.FC<NetworkTimelineProps> = ({ entity }) => {
  // Mock timeline events based on entity
  const events: TimelineEvent[] = entity ? [
    {
      id: 't1',
      timestamp: '2026-08-18T14:30:00Z',
      title: 'New relationship identified',
      description: 'Connected to BH-P-105 via communication intercept.',
      status: 'REVIEW'
    },
    {
      id: 't2',
      timestamp: '2026-08-15T09:15:00Z',
      title: 'Vehicle association',
      description: 'Spotted near White SUV (BH-V-201).'
    },
    {
      id: 't3',
      timestamp: '2026-08-12T18:45:00Z',
      title: 'Location association',
      description: 'Appeared at Sector 4 Checkpoint.'
    },
    {
      id: 't4',
      timestamp: '2026-08-10T22:00:00Z',
      title: 'Incident recorded',
      description: 'Linked to Incident 2026-08-10.',
      severity: 'HIGH'
    }
  ] : [];

  return (
    <div className="bg-[var(--color-bhairav-surface)] h-full flex flex-col">
      <h3 className="text-sm font-semibold text-[var(--color-bhairav-text)] mb-4 p-4 pb-2 border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface-hover)] uppercase tracking-wider">
        Entity Timeline {entity ? `- ${entity.label}` : ''}
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 p-4 pt-0">
        {entity ? (
          <Timeline events={events} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-[var(--color-bhairav-text-muted)] font-mono tracking-wider">
            Select an entity in the graph to view its timeline.
          </div>
        )}
      </div>
    </div>
  );
};
