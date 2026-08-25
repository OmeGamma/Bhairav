import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../components/Shared/StatusBadge';
import { getVerificationHistory } from '../services/verificationService';
import { VerificationHistoryItem } from '../types/verification';

export const VerificationHistory: React.FC = () => {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getVerificationHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reviewer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Verification History</h1>
          <p className="text-gray-400 text-sm mt-1">Review past verifications and anomalies</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search ID or Reviewer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#1a1d24] border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#1a1d24] border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="REVIEW REQUIRED">Review Required</option>
            <option value="ANOMALY DETECTED">Anomaly Detected</option>
          </select>
        </div>
      </div>

      <div className="bg-[#12141a] border border-gray-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#16181f] text-xs uppercase text-gray-500 font-semibold border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Verification ID</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500">Loading history...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No verification records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-300">{item.id}</td>
                    <td className="px-6 py-4">
                      {new Date(item.timestamp).toLocaleDateString()}<br/>
                      <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">{item.documentType}</td>
                    <td className="px-6 py-4">{item.location || '-'}</td>
                    <td className="px-6 py-4">{item.reviewer}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
