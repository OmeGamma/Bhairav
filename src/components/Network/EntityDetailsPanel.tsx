import React from 'react';
import { NetworkEntity, NetworkClusterInfo } from '../../types/network';
import { StatusBadge } from '../Shared/StatusBadge';
import { IntelligenceCard } from '../Shared/IntelligenceCard';

interface EntityDetailsPanelProps {
  entity: NetworkEntity | null;
  clusterInfo?: NetworkClusterInfo | null;
  onClose?: () => void;
}

export const EntityDetailsPanel: React.FC<EntityDetailsPanelProps> = ({ entity, clusterInfo, onClose }) => {
  if (!entity) {
    return (
      <div className="bg-[#12141a] border border-gray-800 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
        <svg className="w-12 h-12 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-gray-400 text-sm">Select an entity in the graph<br/>to view intelligence details.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12141a] border border-gray-800 rounded-lg h-full flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 bg-[#16181f] flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{entity.type}</span>
            {entity.status && <StatusBadge status={entity.status} />}
          </div>
          <h2 className="text-lg font-semibold text-white">{entity.label}</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">ID: {entity.id}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Intelligence Indicators */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Intelligence Indicators</h3>
          <div className="grid grid-cols-1 gap-3">
            <IntelligenceCard 
              title="Repeated incident association" 
              indicator="HIGH"
              className="!p-3"
            />
            <IntelligenceCard 
              title="Location overlap" 
              indicator="HIGH"
              className="!p-3"
            />
            <IntelligenceCard 
              title="Historical case association" 
              indicator="MEDIUM"
              className="!p-3"
            />
          </div>
        </div>

        {/* Entity Stats */}
        {entity.details && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Entity Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1d24] border border-gray-800 rounded p-3">
                <p className="text-xs text-gray-500 mb-1">Related Events</p>
                <p className="text-lg font-semibold text-gray-200">{entity.eventsCount || 0}</p>
              </div>
              <div className="bg-[#1a1d24] border border-gray-800 rounded p-3">
                <p className="text-xs text-gray-500 mb-1">Connected Entities</p>
                <p className="text-lg font-semibold text-gray-200">{entity.connectionsCount || 0}</p>
              </div>
              {Object.entries(entity.details).map(([key, value]) => (
                <div key={key} className="bg-[#1a1d24] border border-gray-800 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">{key}</p>
                  <p className="text-lg font-semibold text-gray-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cluster Information */}
        {clusterInfo && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Cluster Analysis</h3>
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-400">Cluster {clusterInfo.id}</span>
                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                  Density: {clusterInfo.relationshipDensity}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-3 border-t border-blue-900/30 pt-3">
                <div>
                  <p className="text-xs text-gray-500">Entities</p>
                  <p className="text-gray-300">{clusterInfo.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Connections</p>
                  <p className="text-gray-300">{clusterInfo.connectedEntities}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors border border-gray-700">
              View Profile
            </button>
            <button className="py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors border border-gray-700">
              Ask Bhairav
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
