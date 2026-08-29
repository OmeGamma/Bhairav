import React, { useState, useEffect } from 'react';
import { NetworkFilters } from '../components/Network/NetworkFilters';
import { NetworkGraphViewer } from '../components/Network/NetworkGraphViewer';
import { EntityDetailsPanel } from '../components/Network/EntityDetailsPanel';
import { NetworkTimeline } from '../components/Network/NetworkTimeline';
import { NetworkGraphData, NetworkEntity, NetworkClusterInfo } from '../types/network';
import { getNetworkGraph, getEntityDetails, getClusterInfo } from '../services/networkService';

export const NetworkIntelligence: React.FC = () => {
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);
  const [clusterInfo, setClusterInfo] = useState<NetworkClusterInfo | null>(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  useEffect(() => {
    const fetchGraph = async () => {
      const data = await getNetworkGraph();
      setGraphData(data);
    };
    fetchGraph();
  }, []);

  const handleNodeClick = async (node: NetworkEntity) => {
    const details = await getEntityDetails(node.id);
    const cluster = await getClusterInfo(node.id);
    
    setSelectedEntity(details || node);
    setClusterInfo(cluster);
    setIsMobilePanelOpen(true);
  };

  const handleResetFilters = () => {
    // Reset filter logic would go here
  };

  return (
    <div className=" flex flex-col space-y-6">
      <div className="flex justify-between items-end border-b border-[var(--color-bhairav-border)] pb-4 flex-shrink-0 z-10">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-bhairav-text)] uppercase tracking-tight">Network Intelligence</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Understand relationships between authorized entities</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left: Filters */}
          <div className="hidden lg:block lg:col-span-2 h-full">
            <NetworkFilters onFilterChange={() => {}} onReset={handleResetFilters} />
          </div>

          {/* Center: Graph & Timeline */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full min-h-[500px]">
            <div className="flex-1 relative bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden shadow-sm">
              <NetworkGraphViewer 
                data={graphData} 
                onNodeClick={handleNodeClick} 
                selectedNodeId={selectedEntity?.id} 
              />
            </div>
            
            <div className="h-64 flex-shrink-0 hidden lg:block bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden shadow-sm">
              <NetworkTimeline entity={selectedEntity} />
            </div>
          </div>

          {/* Right: Entity Panel */}
          <div className={`
            fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:col-span-3 lg:w-auto lg:max-w-none lg:z-auto
            ${isMobilePanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <EntityDetailsPanel 
              entity={selectedEntity} 
              clusterInfo={clusterInfo} 
              onClose={() => setIsMobilePanelOpen(false)} 
            />
          </div>

        </div>
      </div>
      
      {/* Mobile Backdrop */}
      {isMobilePanelOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobilePanelOpen(false)}
        />
      )}
    </div>
  );
};
