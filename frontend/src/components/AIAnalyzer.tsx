import React, { useState, useRef, useMemo } from 'react';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import Layout from './layout/Layout';
import { Search, BrainCircuit, ShieldAlert, Database, MapPin, Users, Network, Video, FileText } from 'lucide-react';
import { ReactFlow, Background, Controls, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const AIAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = Date.now();
    requestIdRef.current = currentRequestId;

    setIsSearching(true);
    setResults(null);
    setError(null);

    try {
      let res = await apiClient.post<any>('/api/intelligence/query', { query: query.trim(), role: 'Analyst' }, { signal: controller.signal });
      
      // Short retry for transient network issues or 500s
      if (!res.ok && res.error && (res.error.includes('Network') || res.error.includes('timeout') || res.error.includes('500') || res.error.includes('502') || res.error.includes('503'))) {
         await new Promise(r => setTimeout(r, 1000));
         res = await apiClient.post<any>('/api/intelligence/query', { query: query.trim(), role: 'Analyst' }, { signal: controller.signal });
      }

      if (!res.ok) {
        throw new Error(res.error || 'Failed to perform analysis search.');
      }
      
      const data = res.data;
      if (currentRequestId === requestIdRef.current) {
        setResults(data);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !err.message?.includes('AbortError') && !err.message?.includes('aborted')) {
        setError(err.message || 'Failed to perform analysis search.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  const renderFileSection = (title: string, items: any[], type: string, icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
          <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{items.length}</span>
        </h4>
        <div className="space-y-2">
          {items.slice(0, 10).map((file: any, idx: number) => {
            const item = file.item || file;
            const caseId = file.caseId;
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.fileName || item.title || item.documentId || item.evidenceId || item.videoId || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Case: {caseId} • {item.mimeType || item.type || type}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/cases/${encodeURIComponent(caseId)}`} className="text-xs text-light-accent hover:underline">View Case</Link>
                  <a href={`/api/files/${item.documentId || item.evidenceId || item.videoId || item._id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">Download</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDataRetrieval = (data: any[]) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No matching records found.</p>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded uppercase">
                    CASE
                  </span>
                  <ShieldAlert className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                <p className="text-sm font-mono text-light-accent dark:text-dark-accent mt-1">{item.caseNumber}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{item.crimeType} - {item.city || item.district}</p>
              </div>
              <Link to={`/cases/${encodeURIComponent(item.caseNumber)}`} className="mt-4 text-center text-sm font-semibold text-light-accent dark:text-dark-accent hover:underline">
                View Related Case
              </Link>
            </div>
          ))}
        </div>
        
        {results && renderFileSection('Documents', results.documents, 'Document', <FileText className="w-4 h-4" />)}
        {results && renderFileSection('Evidence', results.evidence, 'Evidence', <ShieldAlert className="w-4 h-4" />)}
        {results && renderFileSection('Videos', results.videos, 'Video', <Video className="w-4 h-4" />)}
      </div>
    );
  };

  const renderHotspots = (data: any[]) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No hotspots identified.</p>;
    return (
      <div className="space-y-4">
        {data.map((hotspot, idx) => (
          <div key={idx} className="flex items-center p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-lg">
            <MapPin className="w-8 h-8 text-red-500 mr-4" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{hotspot.location}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Intensity: <span className="font-bold text-red-600">{hotspot.intensity} cases</span></p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
              Cases: {hotspot.cases.join(', ')}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRepeatOffenders = (data: any[]) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No repeat offenders identified.</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((offender, idx) => (
          <div key={idx} className="flex items-start p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/50 rounded-lg">
            <Users className="w-6 h-6 text-orange-500 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{offender.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Involved in {offender.case_count} cases</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {offender.cases.map((c: string) => (
                  <span key={c} className="text-[10px] bg-white dark:bg-dark-bg border border-orange-200 dark:border-orange-800 px-1.5 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNetwork = (data: any) => {
    if (!data || !data.graph || data.graph.nodes.length === 0) return <p className="text-gray-500">No network found.</p>;
    
    // Convert to ReactFlow nodes and edges
    const nodes = data.graph.nodes.map((n: any, idx: number) => ({
      id: n.id,
      position: { x: (idx % 3) * 200, y: Math.floor(idx / 3) * 150 },
      data: { label: n.label + (n.type ? ` (${n.type})` : '') },
      style: {
        background: n.is_seed ? '#EFF6FF' : '#ffffff',
        border: `2px solid ${n.is_seed ? '#3B82F6' : '#94A3B8'}`,
        borderRadius: '8px',
        padding: '10px',
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#1E293B',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }
    }));
    
    const edges = data.graph.links.map((link: any, idx: number) => ({
      id: `e${idx}`,
      source: link.source,
      target: link.target,
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
    }));

    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center">
          <Network className="w-5 h-5 mr-2 text-blue-500" />
          Co-Accused Graph (2-hop)
        </h3>
        <style>
          {`
            .react-flow__edge-path {
              animation: dashdraw 30s linear infinite;
            }
            @keyframes dashdraw {
              from { stroke-dashoffset: 1000; }
              to { stroke-dashoffset: 0; }
            }
          `}
        </style>
        <div className="h-[400px] w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background color="#ccc" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BrainCircuit className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Bhairav Intelligence Engine
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Natural language intent routing, geographical hotspots, and co-accused graphs.
            </p>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'Show burglary hotspots' or 'List repeat offenders')..."
              className="w-full pl-5 pr-16 py-4 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent transition-all shadow-inner text-gray-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 bottom-2 px-6 bg-light-accent dark:bg-dark-accent hover:bg-opacity-90 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium mr-2">Examples:</span>
            <button onClick={() => setQuery("Show all theft cases in Mumbai")} className="hover:text-light-accent dark:hover:text-dark-accent bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">"Show all theft cases in Mumbai"</button>
            <button onClick={() => setQuery("Show burglary hotspots")} className="hover:text-light-accent dark:hover:text-dark-accent bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">"Show burglary hotspots"</button>
            <button onClick={() => setQuery("List repeat offenders in Delhi")} className="hover:text-light-accent dark:hover:text-dark-accent bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">"List repeat offenders in Delhi"</button>
            <button onClick={() => setQuery("Analyze co-accused network for Ramesh")} className="hover:text-light-accent dark:hover:text-dark-accent bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">"Analyze co-accused network for Ramesh"</button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isSearching && (
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6 animate-pulse">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <BrainCircuit className="w-5 h-5 mr-2 text-light-accent dark:text-dark-accent animate-pulse" />
              Bhairav AI Pipeline Active
            </h3>
            <div className="relative mt-6 ml-2 pb-2">
              {/* The explicit vertical thread line */}
              <div className="absolute top-2 bottom-4 left-[7px] w-0.5 bg-gray-300 dark:bg-gray-700 z-0"></div>

              <div className="space-y-8">
                <div className="relative flex items-start z-10">
                  <div className="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-green-500 shadow-[0_0_0_4px_var(--bg-card)] dark:shadow-[0_0_0_4px_#1c1f26]"></div>
                  <div className="ml-8">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center leading-none">
                      <span className="mr-2">✓</span> Classify NL Intent & Extract Entities
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-mono">Parsing semantic tokens and identifying entities...</p>
                  </div>
                </div>
                
                <div className="relative flex items-start z-10">
                  <div className="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-light-accent dark:bg-dark-accent shadow-[0_0_0_4px_var(--bg-card)] dark:shadow-[0_0_0_4px_#1c1f26]"></div>
                  <div className="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-light-accent dark:bg-dark-accent animate-ping opacity-75"></div>
                  <div className="ml-8">
                    <p className="text-sm font-bold text-light-accent dark:text-dark-accent flex items-center leading-none">
                      <div className="animate-spin h-3.5 w-3.5 border-b-2 border-current rounded-full mr-2"></div> 
                      Running Aggregations & Graph Expansions
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-mono">Traversing database relationships and resolving aliases...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6 border-t-4 border-t-light-accent dark:border-t-dark-accent">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Intelligence Results</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {results.message}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-800">
                  INTENT: {results.type}
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
              <Database className="w-5 h-5 mr-2 text-gray-400" />
              Analyzed Data
            </h3>
            
            {results.type === 'DATA_RETRIEVAL' && renderDataRetrieval(results.data)}
            {results.type === 'HOTSPOT_ANALYSIS' && renderHotspots(results.data)}
            {results.type === 'REPEAT_OFFENDERS' && renderRepeatOffenders(results.data)}
            {results.type === 'NETWORK_SEARCH' && renderNetwork(results.data)}

          </div>
        )}
      </div>
    </Layout>
  );
};

export default AIAnalyzer;

