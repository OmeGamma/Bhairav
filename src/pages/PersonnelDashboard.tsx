import React, { useState, useEffect } from 'react';
import { IntelligenceCard } from '../components/Shared/IntelligenceCard';
import { StatusBadge } from '../components/Shared/StatusBadge';
import { getWelfareIndicators } from '../services/welfareService';
import { WelfareIndicators } from '../types/welfare';

export const PersonnelDashboard: React.FC = () => {
  const [indicators, setIndicators] = useState<WelfareIndicators | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      const data = await getWelfareIndicators();
      setIndicators(data);
    };
    fetchIndicators();
  }, []);

  if (!indicators) {
    return (
      <div className="p-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Personnel Welfare Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Aggregated readiness and welfare indicators</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <IntelligenceCard 
          title="Unit Workload Trend" 
          value={indicators.workloadTrend} 
          indicator={indicators.workloadTrend === 'INCREASING' ? 'HIGH' : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          }
        />
        <IntelligenceCard 
          title="Recovery & Rest Trend" 
          value={indicators.restTrend} 
          indicator={indicators.restTrend === 'DECREASING' ? 'MEDIUM' : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          }
        />
        <IntelligenceCard 
          title="Aggregated Fatigue" 
          value={indicators.fatigueLevel} 
          indicator={indicators.fatigueLevel === 'HIGH' ? 'REVIEW' : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Check-ins */}
        <div className="bg-[#12141a] border border-gray-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-200">Recent Check-in Signals</h2>
            <span className="text-xs text-gray-500">Anonymized</span>
          </div>
          
          <div className="space-y-3">
            {indicators.recentCheckIns.map(checkIn => (
              <div key={checkIn.id} className="bg-[#1a1d24] border border-gray-800 p-3 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white mb-1">{checkIn.status}</div>
                  <div className="flex gap-2 text-xs">
                    {checkIn.factors.map((f, i) => (
                      <span key={i} className="text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-mono">
                  {new Date(checkIn.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Support Requests */}
        <div className="bg-[#12141a] border border-gray-800 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-200">Active Support Requests</h2>
          </div>
          
          <div className="space-y-3">
            {indicators.activeRequests.map(req => (
              <div key={req.id} className="bg-[#1a1d24] border border-gray-800 p-3 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white mb-1">{req.category}</div>
                  <div className="text-xs text-gray-500 font-mono">
                    ID: {req.id} • {new Date(req.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
            {indicators.activeRequests.length === 0 && (
              <div className="text-sm text-gray-500 py-4 text-center">No active requests</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
