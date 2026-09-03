import { useEffect, useRef, useMemo } from 'react';
import cytoscape, { Core, ElementDefinition, Stylesheet } from 'cytoscape';
import type { NetworkEntity, NetworkRelationship } from '../../types/network';

interface NetworkGraphViewerProps {
  data: { nodes: NetworkEntity[]; links: NetworkRelationship[] } | null;
  onNodeClick: (node: NetworkEntity) => void;
  selectedNodeId?: string;
  highlightEntityTypes?: string[];
  highlightRelationshipTypes?: string[];
}

const TYPE_COLOR: Record<string, string> = {
  PERSON: '#4A7C9D',
  VEHICLE: '#3C8765',
  LOCATION: '#6E5BA0',
  INCIDENT: '#C63A3A',
  CASE: '#D99632',
  ORGANIZATION: '#B98CCB',
  PHONE: '#56A0B5',
  EVENT: '#C63A3A',
  INVESTIGATION: '#D99632',
  DOCUMENT: '#94A3B8',
  ENTITY: '#94A3B8',
};

const TYPE_SHAPE: Record<string, string> = {
  PERSON: 'ellipse',
  VEHICLE: 'round-rectangle',
  LOCATION: 'diamond',
  INCIDENT: 'triangle',
  CASE: 'rectangle',
  ORGANIZATION: 'hexagon',
  PHONE: 'round-pentagon',
  EVENT: 'triangle',
  INVESTIGATION: 'rectangle',
  DOCUMENT: 'tag',
  ENTITY: 'ellipse',
};

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: '#3C8765',
  OBSERVED: '#4A7C9D',
  INFERRED: '#D99632',
  REVIEW: '#D99632',
  UNVERIFIED: '#94A3B8',
};

const stylesheet: Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': (ele: cytoscape.NodeSingular) =>
        STATUS_COLOR[(ele.data('status') || '').toUpperCase()] ||
        TYPE_COLOR[ele.data('type')] ||
        '#94A3B8',
      'label': 'data(label)',
      'font-size': 10,
      'color': '#F1F5F9',
      'font-family': 'Inter, system-ui, sans-serif',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 6,
      'text-wrap': 'ellipsis',
      'text-max-width': 120,
      'width': 26,
      'height': 26,
      'border-width': 2,
      'border-color': '#1E232B',
      'shape': (ele: cytoscape.NodeSingular) =>
        TYPE_SHAPE[ele.data('type')] || 'ellipse',
      'transition-property': 'background-color, border-color, width, height',
      'transition-duration': '150ms',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#F1F5F9',
      'width': 34,
      'height': 34,
    },
  },
  {
    selector: 'node.dim',
    style: { 'opacity': 0.25 },
  },
  {
    selector: 'node.highlight',
    style: { 'border-color': '#D99632', 'border-width': 3 },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      'width': 1.5,
      'line-color': '#334155',
      'target-arrow-color': '#334155',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 0.9,
      'label': 'data(relationship)',
      'font-size': 8,
      'color': '#94A3B8',
      'text-rotation': 'autorotate',
      'text-background-color': '#0f1115',
      'text-background-opacity': 0.7,
      'text-background-padding': 2,
      'opacity': 0.7,
    },
  },
  {
    selector: 'edge.highlight',
    style: {
      'line-color': '#D99632',
      'target-arrow-color': '#D99632',
      'width': 2.5,
      'opacity': 1,
      'color': '#F1F5F9',
    },
  },
  {
    selector: 'edge.dim',
    style: { 'opacity': 0.1 },
  },
];

export function NetworkGraphViewer({
  data,
  onNodeClick,
  selectedNodeId,
  highlightEntityTypes,
  highlightRelationshipTypes,
}: NetworkGraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const elements: ElementDefinition[] = useMemo(() => {
    if (!data) return [];
    const nodes: ElementDefinition[] = data.nodes.map((n) => ({
      group: 'nodes' as const,
      data: {
        id: n.id,
        label: n.label,
        type: n.type,
        status: n.status,
      },
    }));
    const seen = new Set<string>();
    const links: ElementDefinition[] = data.links
      .filter((l) => data.nodes.some((n) => n.id === l.source) && data.nodes.some((n) => n.id === l.target))
      .filter((l) => {
        const key = `${l.source}|${l.target}|${l.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((l) => ({
        group: 'edges' as const,
        data: {
          id: l.id,
          source: l.source,
          target: l.target,
          relationship: l.type,
        },
      }));
    return [...nodes, ...links];
  }, [data]);

  // Mount cytoscape once
  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: stylesheet,
      layout: { name: 'cose', animate: false } as any,
      wheelSensitivity: 0.2,
      minZoom: 0.2,
      maxZoom: 2.5,
    });
    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      onNodeClick({
        id: node.id(),
        label: node.data('label') || node.id(),
        type: node.data('type') || 'ENTITY',
        status: node.data('status'),
      });
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [onNodeClick]);

  // Sync elements
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add(elements);
    if (elements.length > 0) {
      cy.layout({ name: 'cose', animate: true, animationDuration: 400, idealEdgeLength: () => 90, nodeRepulsion: () => 8000 } as any).run();
    } else {
      cy.fit(undefined, 30);
    }
  }, [elements]);

  // Highlight on selection / filters
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass('dim highlight');
    cy.edges().removeClass('dim highlight');

    const hasEntityFilter = highlightEntityTypes && highlightEntityTypes.length > 0;
    const hasRelFilter = highlightRelationshipTypes && highlightRelationshipTypes.length > 0;

    if (hasEntityFilter || hasRelFilter) {
      cy.nodes().forEach((n) => {
        if (hasEntityFilter && highlightEntityTypes!.includes(n.data('type'))) {
          n.addClass('highlight');
        } else {
          n.addClass('dim');
        }
      });
      cy.edges().forEach((e) => {
        if (hasRelFilter && highlightRelationshipTypes!.includes(e.data('relationship'))) {
          e.addClass('highlight');
        } else {
          e.addClass('dim');
        }
      });
    }

    if (selectedNodeId) {
      const node = cy.getElementById(selectedNodeId);
      if (node && node.length) {
        const neighborhood = node.closedNeighborhood();
        cy.elements().not(neighborhood).addClass('dim');
        node.removeClass('dim').addClass('highlight');
        neighborhood.edges().removeClass('dim').addClass('highlight');
      }
    }
  }, [selectedNodeId, highlightEntityTypes, highlightRelationshipTypes, data]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'var(--color-bhairav-bg)' }}
      aria-label="Network intelligence graph"
    />
  );
}
