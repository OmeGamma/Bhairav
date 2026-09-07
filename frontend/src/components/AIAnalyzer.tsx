import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from './layout/Layout';
import { Search, BrainCircuit, ShieldAlert, Database, MapPin, Users, Network, Video, FileText } from 'lucide-react';

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
      const res = await fetch('/api/intelligence/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), role: 'Analyst' }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Failed to perform analysis search.');
      
      const data = await res.json();
      if (currentRequestId === requestIdRef.current) {
        setResults(data);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
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
                  <Link to={`/cases/${caseId}`} className="text-xs text-light-accent hover:underline">View Case</Link>
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
              <Link to={`/cases/${item.caseNumber}`} className="mt-4 text-center text-sm font-semibold text-light-accent dark:text-dark-accent hover:underline">
                View Case Details
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
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center">
          <Network className="w-5 h-5 mr-2 text-blue-500" />
          Co-Accused Graph (2-hop)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Entities ({data.graph.nodes.length})</h4>
            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.graph.nodes.map((node: any) => (
                <li key={node.id} className={`p-2 rounded border ${node.is_seed ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-dark-bg dark:border-gray-700'}`}>
                  <span className="font-medium text-gray-900 dark:text-white">{node.label}</span>
                  <span className="ml-2 text-xs text-gray-500">({node.type})</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Connections ({data.graph.links.length})</h4>
            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.graph.links.map((link: any, idx: number) => {
                const sourceNode = data.graph.nodes.find((n: any) => n.id === link.source)?.label;
                const targetNode = data.graph.nodes.find((n: any) => n.id === link.target)?.label;
                return (
                  <li key={idx} className="p-2 rounded border bg-gray-50 border-gray-200 dark:bg-dark-bg dark:border-gray-700 text-sm">
                    <span className="font-medium">{sourceNode}</span> <span className="text-gray-400">↔</span> <span className="font-medium">{targetNode}</span>
                  </li>
                );
              })}
            </ul>
          </div>
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bhairav Pipeline Running</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center text-green-500"><span className="mr-2">✓</span> Classify NL Intent & Extract Entities</p>
              <p className="flex items-center text-light-accent dark:text-dark-accent">
                <div className="animate-spin h-3 w-3 border-b-2 border-current rounded-full mr-2"></div> 
                Running Aggregations & Graph Expansions
              </p>
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

