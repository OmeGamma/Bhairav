import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Maximize2, Minimize2, Layers } from 'lucide-react';
import { NetworkFilters } from '../components/Network/NetworkFilters';
import { NetworkGraphViewer } from '../components/Network/NetworkGraphViewer';
import { EntityDetailsPanel } from '../components/Network/EntityDetailsPanel';
import { NetworkTimeline } from '../components/Network/NetworkTimeline';
import type { NetworkGraphData, NetworkEntity, EntityType, RelationshipType } from '../types/network';
import { networkService } from '../services/networkService';

interface ActiveFilters {
  entityTypes: EntityType[];
  relationshipTypes: RelationshipType[];
  search: string;
  sinceDays?: number;
}

const DEFAULT_FILTERS: ActiveFilters = {
  entityTypes: ['PERSON', 'VEHICLE', 'LOCATION', 'INCIDENT', 'CASE', 'ORGANIZATION', 'PHONE', 'EVENT'],
  relationshipTypes: [
    'ASSOCIATED_WITH',
    'CONTACTED',
    'USES',
    'LOCATED_AT',
    'DETECTED_AT',
    'MEMBER_OF',
    'MENTIONED_IN',
    'INVOLVED',
  ],
  search: '',
};

export function NetworkIntelligence() {
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const fetchGraph = useCallback(async (sinceDays?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await networkService.getGraph({
        entityTypes: filters.entityTypes,
        relationshipTypes: filters.relationshipTypes,
        sinceDays,
        investigationId: undefined,
      });
      setGraphData(data);
    } catch (e) {
      setError('Unable to load network graph.');
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  }, [filters.entityTypes, filters.relationshipTypes]);

  useEffect(() => {
    const sinceIso =
      filters.sinceDays !== undefined
        ? new Date(Date.now() - filters.sinceDays * 86400_000).toISOString()
        : undefined;
    fetchGraph(filters.sinceDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.entityTypes, filters.relationshipTypes, filters.sinceDays]);

  const handleNodeClick = (node: NetworkEntity) => {
    setSelectedEntity(node);
    setIsMobilePanelOpen(true);
  };

  const handleSearchSubmit = (query: string) => {
    const q = query.toLowerCase();
    const match = graphData?.nodes.find((n) => n.label.toLowerCase().includes(q));
    if (match) setSelectedEntity(match);
  };

  const handleExpandRelated = async (entityId: string) => {
    setLoading(true);
    try {
      const sub = await networkService.getGraphAroundEntity(entityId, 1);
      setGraphData((prev) => {
        if (!prev) return sub;
        const existingNodes = new Map(prev.nodes.map((n) => [n.id, n]));
        sub.nodes.forEach((n) => existingNodes.set(n.id, n));
        const existingEdges = new Set(prev.links.map((l) => `${l.source}|${l.type}|${l.target}`));
        const merged: typeof prev.links = [...prev.links];
        sub.links.forEach((l) => {
          const k = `${l.source}|${l.type}|${l.target}`;
          if (!existingEdges.has(k)) merged.push(l);
        });
        return { nodes: Array.from(existingNodes.values()), links: merged };
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => setFilters(DEFAULT_FILTERS);

  const summary = {
    nodes: graphData?.nodes.length || 0,
    links: graphData?.links.length || 0,
    selected: selectedEntity?.label,
  };

  return (
    <div className="flex flex-col space-y-4 animate-fade-in-up min-h-[calc(100vh-7rem)]">

      <div className="flex justify-between items-end border-b border-[var(--color-bhairav-border-strong)] pb-3 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            Network Intelligence
          </h2>
          <p className="text-[var(--color-bhairav-text-muted)] text-sm mt-1">
            Explore relationships between entities ingested into BHAIRAV
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">
            <span>
              Nodes: <span className="text-white">{summary.nodes}</span>
            </span>
            <span>
              Links: <span className="text-white">{summary.links}</span>
            </span>
            {summary.selected && (
              <span className="text-[var(--color-bhairav-primary)]">
                Selected: {summary.selected}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchGraph(filters.sinceDays)}
            className="p-2 rounded border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
            title="Refresh"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className={`flex-1 overflow-hidden ${fullscreen ? 'fixed inset-0 z-50 bg-[var(--color-bhairav-bg)] p-4' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          {/* Left: Filters */}
          <div className="hidden lg:block lg:col-span-2 h-full">
            <NetworkFilters
              onFilterChange={(f) =>
                setFilters({
                  entityTypes: f.entityTypes,
                  relationshipTypes: f.relationshipTypes,
                  search: f.search,
                  sinceDays: f.sinceDays,
                })
              }
              onReset={handleResetFilters}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          {/* Center: Graph & Timeline */}
          <div className="lg:col-span-7 flex flex-col gap-4 h-full min-h-[420px]">
            <div className="flex-1 relative glass-sm border border-[var(--color-bhairav-border-strong)] rounded-xl overflow-hidden">
              {graphData && graphData.nodes.length === 0 && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Layers size={28} className="text-[var(--color-bhairav-text-muted)] mb-2" />
                  <p className="text-[var(--color-bhairav-text-muted)] text-xs font-mono tracking-widest uppercase">
                    No entities match the current filters
                  </p>
                  <p className="text-[var(--color-bhairav-text-muted)] text-[11px] mt-1">
                    Try enabling more entity types or clearing the time range.
                  </p>
                </div>
              )}
              <NetworkGraphViewer
                data={graphData}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedEntity?.id}
                highlightEntityTypes={filters.entityTypes}
                highlightRelationshipTypes={filters.relationshipTypes}
              />
              <button
                onClick={() => setFullscreen((f) => !f)}
                className="absolute top-3 right-3 p-1.5 rounded bg-[var(--color-bhairav-bg)]/80 border border-[var(--color-bhairav-border-strong)] text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
                title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              {loading && (
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono">
                  Loading…
                </div>
              )}
            </div>

            <div className="h-56 flex-shrink-0 hidden lg:block">
              <NetworkTimeline entity={selectedEntity} />
            </div>
          </div>

          {/* Right: Entity Panel */}
          <div
            className={`
              fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:col-span-3 lg:w-auto lg:max-w-none lg:z-auto
              ${isMobilePanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}
          >
            <EntityDetailsPanel
              entity={selectedEntity}
              onClose={() => setIsMobilePanelOpen(false)}
              onSelectRelated={handleExpandRelated}
            />
          </div>
        </div>
      </div>

      {isMobilePanelOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobilePanelOpen(false)}
        />
      )}
    </div>
  );
}
