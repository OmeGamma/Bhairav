import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from './layout/Layout';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from 'lucide-react';

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  Case: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A8A' },
  Suspect: { bg: '#FEE2E2', border: '#EF4444', text: '#7F1D1D' },
  Person: { bg: '#F3F4F6', border: '#6B7280', text: '#1F2937' },
  Victim: { bg: '#FEF3C7', border: '#D97706', text: '#78350F' },
  Evidence: { bg: '#D1FAE5', border: '#10B981', text: '#064E3B' },
  Document: { bg: '#E0E7FF', border: '#4F46E5', text: '#312E81' },
  Video: { bg: '#FCE7F3', border: '#EC4899', text: '#831843' },
  Vehicle: { bg: '#E0F2FE', border: '#0284C7', text: '#082F49' },
  Organization: { bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95' },
  FIR: { bg: '#FFEDD5', border: '#EA580C', text: '#7C2D12' },
  Location: { bg: '#ECFCCB', border: '#65A30D', text: '#1A2E05' },
};

const CustomNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as { label?: string; type?: string };
  const colors = statusColors[nodeData.type || 'Case'] || statusColors.Case;
  return (
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '50%',
        width: 90,
        height: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 6,
        color: colors.text,
        fontWeight: 700,
        fontSize: 11,
        boxShadow: selected ? `0 0 0 4px ${colors.border}55` : '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div style={{ lineHeight: 1.1 }}>{nodeData.label || 'Unknown'}</div>
      <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2 }}>{nodeData.type || 'Case'}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

const CriminalNetwork: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCaseId = searchParams.get('case') || '';

  const [selectedCase, setSelectedCase] = useState(initialCaseId);
  const [availableCases, setAvailableCases] = useState<any[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/cases');
        if (res.ok) {
          const data = await res.json();
          setAvailableCases(data);
          if (data.length > 0 && !selectedCase) {
            setSelectedCase(data[0].case_number);
          }
        }
      } catch (err) {
        console.error("Failed to load cases for dropdown", err);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      if (!selectedCase) return;
      setIsLoading(true);
      setError(null);
      setNodes([]);
      setEdges([]);

      try {
        const res = await fetch(`http://localhost:8000/api/network/${selectedCase}`);
        if (!res.ok) throw new Error('Failed to load network data');
        const data = await res.json();

        const mappedNodes = data.nodes.map((n: any) => ({
          ...n,
          type: 'customNode',
          data: { ...n.data, label: n.data?.label || n.id },
        }));

        const mappedEdges = data.edges.map((e: any) => ({
          ...e,
          markerEnd: { type: MarkerType.ArrowClosed, color: (e.style?.stroke as string) || '#94A3B8' },
          style: { ...e.style, strokeWidth: 2 },
          animated: true,
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraph();
    setSearchParams({ case: selectedCase });
  }, [selectedCase, setNodes, setEdges, setSearchParams]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const getNodeStrokeColor = (n: Node) => {
    const nodeData = n.data as { type?: string } | undefined;
    return statusColors[nodeData?.type || 'Case']?.border || '#1E293B';
  };

  const getNodeColor = (n: Node) => {
    const nodeData = n.data as { type?: string } | undefined;
    return statusColors[nodeData?.type || 'Case']?.bg || '#fff';
  };

  return (
    <Layout>
      <div className="h-full flex flex-col max-w-7xl mx-auto space-y-4 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Network className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Criminal Network Graph
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Visualize associations between suspects, cases, locations, and evidence.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white dark:bg-dark-card p-2 rounded-md border border-gray-300 dark:border-gray-700 shadow-sm">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Case:</label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-md focus:ring-light-accent focus:border-light-accent block p-2"
            >
              {availableCases.map(c => (
                <option key={c.case_number} value={c.case_number}>{c.case_number} - {c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        <div className="flex-1 bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden min-h-[600px] relative">
          <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-dark-card/90 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Legend</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(statusColors).map(([type, colors]) => (
                <div key={type} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ background: colors.border }}></div>
                  <span className="text-gray-800 dark:text-gray-200">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent"></div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 z-10">
              <div className="text-center">
                <Network className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No network relationships available for this case.</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              nodeTypes={nodeTypes}
              attributionPosition="bottom-right"
            >
              <Controls className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 fill-gray-900 dark:fill-gray-100" />
              <MiniMap
                nodeStrokeColor={getNodeStrokeColor}
                nodeColor={getNodeColor}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              <Background color="#9CA3AF" gap={16} />
            </ReactFlow>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CriminalNetwork;
