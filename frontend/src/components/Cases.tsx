import React, { useState, useEffect } from 'react';
import Layout from './layout/Layout';
import { FolderOpen, Search, Plus, Filter, X, Edit3, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cases: React.FC = () => {
  const [casesData, setCasesData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [filterCrime, setFilterCrime] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCases = async (mode: 'active' | 'deleted') => {
    setIsLoading(true);
    try {
      const endpoint = mode === 'deleted' ? '/api/cases/deleted' : '/api/cases';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to load cases.');
      const data = await res.json();
      setCasesData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Unable to load cases.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases(viewMode);
  }, [viewMode]);

  const cities = ['All', ...Array.from(new Set(casesData.map(c => c.location?.city).filter(Boolean)))];
  const states = ['All', ...Array.from(new Set(casesData.map(c => c.location?.state).filter(Boolean)))];
  const crimes = ['All', ...Array.from(new Set(casesData.map(c => c.crimeType).filter(Boolean)))];

  const filteredCases = casesData.filter(c => {
    if (filterCity !== 'All' && c.location?.city !== filterCity) return false;
    if (filterState !== 'All' && c.location?.state !== filterState) return false;
    if (filterCrime !== 'All' && c.crimeType !== filterCrime) return false;
    if (filterPriority !== 'All' && c.priority?.toUpperCase() !== filterPriority) return false;
    if (filterStatus !== 'All' && c.status?.toUpperCase() !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = [c.case_number, c.title, c.crimeType, c.description, c.city, c.district, c.state, c.suspect]
        .filter(Boolean)
        .some((val: any) => String(val).toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  });

  const getPriorityColor = (priority: string) => {
    const p = (priority || '').toUpperCase();
    switch (p) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'OPEN': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'UNDER INVESTIGATION': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FolderOpen className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Case Files
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage investigations, evidence, and case intelligence.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
              <button 
                onClick={() => setViewMode('active')} 
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'active' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setViewMode('deleted')} 
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'deleted' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Deleted
              </button>
            </div>
            {viewMode === 'active' && (
              <Link
                to="/cases/new"
                className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-opacity-90 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Case
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error} <button onClick={() => fetchCases(viewMode)} className="ml-2 underline">Retry</button>
          </div>
        )}

        <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm border border-light-border dark:border-dark-border space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Case ID, Title, Keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-light-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-2 text-gray-700 dark:text-gray-300">
                {cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
              </select>
              <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-2 text-gray-700 dark:text-gray-300">
                {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
              </select>
              <select value={filterCrime} onChange={(e) => setFilterCrime(e.target.value)} className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-2 text-gray-700 dark:text-gray-300">
                {crimes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Crimes' : c}</option>)}
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-2 text-gray-700 dark:text-gray-300">
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-2 text-gray-700 dark:text-gray-300">
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Closed">Closed</option>
              </select>
              {(filterCity !== 'All' || filterState !== 'All' || filterCrime !== 'All' || filterPriority !== 'All' || filterStatus !== 'All' || searchTerm) && (
                <button onClick={() => { setFilterCity('All'); setFilterState('All'); setFilterCrime('All'); setFilterPriority('All'); setFilterStatus('All'); setSearchTerm(''); }} className="p-2 text-gray-500 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading cases...</div>
          ) : filteredCases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No matching cases found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crime Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCases.map((caseItem) => (
                    <tr key={caseItem._id || caseItem.case_number} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-accent dark:text-dark-accent">{caseItem.case_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          {caseItem.title}
                          {caseItem.dataClassification === 'DEMO_SYNTHETIC' && (
                            <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-300">DEMO DATA</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{caseItem.location?.city || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{caseItem.crimeType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(caseItem.priority)}`}>
                          {caseItem.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(caseItem.filingDate || caseItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center gap-2">
                        <Link to={`/cases/${caseItem.case_number}`} className="text-light-accent dark:text-dark-accent hover:underline">View</Link>
                        {viewMode === 'active' && (
                          <>
                            <Link to={`/cases/${caseItem.case_number}/edit`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            {caseItem.status !== 'Closed' && (
                              <Link to={`/cases/${caseItem.case_number}`} className="text-green-600 hover:text-green-800" title="Close Case">
                                <CheckCircle className="w-4 h-4" />
                              </Link>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cases;

