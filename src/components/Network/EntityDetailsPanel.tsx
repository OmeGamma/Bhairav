import React from 'react';
import { NetworkEntity, NetworkClusterInfo } from '../../types/network';
import { Badge } from '../common/Badge';
import { IntelligenceCard } from '../Shared/IntelligenceCard';

interface EntityDetailsPanelProps {
  entity: NetworkEntity | null;
  clusterInfo?: NetworkClusterInfo | null;
  onClose?: () => void;
}

export const EntityDetailsPanel: React.FC<EntityDetailsPanelProps> = ({ entity, clusterInfo, onClose }) => {
  if (!entity) {
    return (
      <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-6 h-full flex flex-col items-center justify-center text-center shadow-sm">
        <svg className="w-12 h-12 text-[var(--color-bhairav-text-muted)] opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-[var(--color-bhairav-text-muted)] text-sm font-mono tracking-wider uppercase">Select an entity in the graph<br/>to view intelligence details.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl h-full flex flex-col overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface-hover)] flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-[var(--color-bhairav-text-muted)] tracking-wider">{entity.type}</span>
            {entity.status && <Badge status={entity.status === 'REVIEW REQUIRED' ? 'warning' : entity.status === 'HIGH RISK' ? 'critical' : 'neutral'}>{entity.status}</Badge>}
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-bhairav-text)] uppercase tracking-tight">{entity.label}</h2>
          <p className="text-xs text-[var(--color-bhairav-text-muted)] font-data mt-1">ID: {entity.id}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] lg:hidden transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Intelligence Indicators */}
        <div>
          <h3 className="text-xs font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">Intelligence Indicators</h3>
          <div className="grid grid-cols-1 gap-3">
            <IntelligenceCard 
              title="Repeated incident association" 
              indicator="HIGH"
              className="!p-3 bg-[var(--color-bhairav-bg)] border-[var(--color-bhairav-border)]"
            />
            <IntelligenceCard 
              title="Location overlap" 
              indicator="HIGH"
              className="!p-3 bg-[var(--color-bhairav-bg)] border-[var(--color-bhairav-border)]"
            />
            <IntelligenceCard 
              title="Historical case association" 
              indicator="MEDIUM"
              className="!p-3 bg-[var(--color-bhairav-bg)] border-[var(--color-bhairav-border)]"
            />
          </div>
        </div>

        {/* Entity Stats */}
        {entity.details && (
          <div>
            <h3 className="text-xs font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">Entity Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md p-3">
                <p className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider mb-1">Related Events</p>
                <p className="text-lg font-semibold text-[var(--color-bhairav-text)] font-data">{entity.eventsCount || 0}</p>
              </div>
              <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md p-3">
                <p className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider mb-1">Connected Entities</p>
                <p className="text-lg font-semibold text-[var(--color-bhairav-text)] font-data">{entity.connectionsCount || 0}</p>
              </div>
              {Object.entries(entity.details).map(([key, value]) => (
                <div key={key} className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md p-3">
                  <p className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider mb-1">{key}</p>
                  <p className="text-lg font-semibold text-[var(--color-bhairav-text)] font-data">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cluster Information */}
        {clusterInfo && (
          <div>
            <h3 className="text-xs font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">Cluster Analysis</h3>
            <div className="bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[var(--color-bhairav-primary)] uppercase tracking-wider">Cluster {clusterInfo.id}</span>
                <span className="text-xs font-data bg-[var(--color-bhairav-primary)]/20 text-[var(--color-bhairav-primary)] px-2 py-0.5 rounded">
                  Density: {clusterInfo.relationshipDensity}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-3 border-t border-[var(--color-bhairav-primary)]/20 pt-3">
                <div>
                  <p className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider">Entities</p>
                  <p className="text-[var(--color-bhairav-text)] font-data">{clusterInfo.size}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider">Total Connections</p>
                  <p className="text-[var(--color-bhairav-text)] font-data">{clusterInfo.connectedEntities}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <h3 className="text-xs font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 bg-[var(--color-bhairav-bg)] hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text)] rounded-md text-sm transition-colors border border-[var(--color-bhairav-border)] uppercase tracking-widest font-medium">
              View Profile
            </button>
            <button className="py-2 bg-[var(--color-bhairav-primary)]/10 hover:bg-[var(--color-bhairav-primary)]/20 text-[var(--color-bhairav-primary)] rounded-md text-sm transition-colors border border-[var(--color-bhairav-primary)]/50 uppercase tracking-widest font-medium">
              Ask Bhairav
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
