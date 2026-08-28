import React, { useState, useEffect } from 'react';
import { Badge } from '../components/common/Badge';
import { getVerificationHistory } from '../services/verificationService';
import { VerificationHistoryItem } from '../types/verification';
import { Search } from 'lucide-react';

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
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)] pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-bhairav-text)] uppercase">Verification History</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Review past verifications and anomalies</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search ID or Reviewer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)] transition-colors"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)] transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="REVIEW REQUIRED">Review Required</option>
            <option value="ANOMALY DETECTED">Anomaly Detected</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-[var(--color-bhairav-text-muted)]">
            <thead className="bg-[var(--color-bhairav-surface-hover)] text-xs uppercase text-[var(--color-bhairav-text-muted)] font-semibold border-b border-[var(--color-bhairav-border)]">
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
            <tbody className="divide-y divide-[var(--color-bhairav-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-[var(--color-bhairav-primary)]/30 border-t-[var(--color-bhairav-primary)] rounded-full animate-spin"></div>
                    <p className="mt-2 text-[var(--color-bhairav-text-muted)]">Loading history...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-bhairav-text-muted)]">
                    No verification records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--color-bhairav-surface-hover)] transition-colors">
                    <td className="px-6 py-4 font-data text-[var(--color-bhairav-text)]">{item.id}</td>
                    <td className="px-6 py-4">
                      {new Date(item.timestamp).toLocaleDateString()}<br/>
                      <span className="text-xs font-data">{new Date(item.timestamp).toLocaleTimeString([], { hour12: false })} Z</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={item.status === 'VERIFIED' ? 'verified' : item.status === 'REVIEW REQUIRED' ? 'warning' : item.status === 'ANOMALY DETECTED' ? 'critical' : 'neutral'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{item.documentType}</td>
                    <td className="px-6 py-4">{item.location || '-'}</td>
                    <td className="px-6 py-4">{item.reviewer}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[var(--color-bhairav-primary)] hover:text-[var(--color-bhairav-primary-hover)] text-xs font-medium transition-colors uppercase tracking-wider">
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
