import React, { useRef, useEffect, useState } from 'react';
import { NetworkGraphData, NetworkEntity } from '../../types/network';

// Simulating react-force-graph-2d since we might not have it installed
// If this was a real env with package.json, we'd import { ForceGraph2D } from 'react-force-graph-2d';

interface NetworkGraphViewerProps {
  data: NetworkGraphData | null;
  onNodeClick: (node: NetworkEntity) => void;
  selectedNodeId?: string;
}

export const NetworkGraphViewer: React.FC<NetworkGraphViewerProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }

    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simple SVG visualization to simulate the graph if the library isn't available
  // In a real scenario, this would be <ForceGraph2D graphData={data} ... />

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'PERSON': return 'var(--color-bhairav-primary)'; 
      case 'VEHICLE': return 'var(--color-bhairav-verified)'; 
      case 'LOCATION': return '#8b5cf6'; // keep for differentiation if needed
      case 'INCIDENT': return 'var(--color-bhairav-critical)'; 
      case 'CASE': return 'var(--color-bhairav-warning)'; 
      case 'ORGANIZATION': return '#ec4899'; 
      default: return 'var(--color-bhairav-neutral)';
    }
  };

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {!data ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="inline-block w-8 h-8 border-4 border-[var(--color-bhairav-primary)]/30 border-t-[var(--color-bhairav-primary)] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* This SVG is a placeholder for the actual ForceGraph canvas */}
          <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-bhairav-border)" />
              </marker>
            </defs>
            
            {/* Draw Links (simulated layout for demo) */}
            <g stroke="var(--color-bhairav-border)" strokeWidth="1.5">
              <line x1="50%" y1="50%" x2="40%" y2="30%" />
              <line x1="50%" y1="50%" x2="60%" y2="30%" />
              <line x1="50%" y1="50%" x2="30%" y2="50%" />
              <line x1="50%" y1="50%" x2="70%" y2="60%" />
              <line x1="50%" y1="50%" x2="40%" y2="70%" />
              <line x1="40%" y1="30%" x2="45%" y2="15%" />
              <line x1="60%" y1="30%" x2="65%" y2="15%" />
            </g>
            
            {/* Draw Nodes (simulated layout for demo) */}
            {data.nodes.map((node, i) => {
              // Very rough static positioning just for visual representation
              const isCenter = node.id === 'BH-P-104';
              let cx = '50%', cy = '50%';
              if (!isCenter) {
                const angle = (i / (data.nodes.length - 1)) * Math.PI * 2;
                const radius = 120;
                cx = `calc(50% + ${Math.cos(angle) * radius}px)`;
                cy = `calc(50% + ${Math.sin(angle) * radius}px)`;
              }

              const isSelected = selectedNodeId === node.id;
              
              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer group"
                  onClick={() => onNodeClick(node)}
                >
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isSelected ? 16 : 12} 
                    fill={getNodeColor(node.type)} 
                    stroke={isSelected ? '#ffffff' : 'var(--color-bhairav-surface)'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200 opacity-90 group-hover:opacity-100"
                  />
                  <text 
                    x={cx} 
                    y={`calc(${cy} + 24px)`} 
                    fill="var(--color-bhairav-text-muted)" 
                    fontSize="11px" 
                    textAnchor="middle"
                    className="pointer-events-none font-mono tracking-wider group-hover:fill-white transition-colors"
                  >
                    {node.label}
                  </text>
                  {node.status === 'REVIEW REQUIRED' || node.status === 'HIGH RISK' ? (
                    <circle cx={`calc(${cx} + 8px)`} cy={`calc(${cy} - 8px)`} r="4" fill="var(--color-bhairav-critical)" />
                  ) : null}
                </g>
              );
            })}
          </svg>
          
          {/* Overlay controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button className="w-8 h-8 bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] rounded flex items-center justify-center hover:text-white transition-colors">
              +
            </button>
            <button className="w-8 h-8 bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] rounded flex items-center justify-center hover:text-white transition-colors">
              -
            </button>
            <button className="w-8 h-8 bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] rounded flex items-center justify-center hover:text-white transition-colors" title="Fit to screen">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
