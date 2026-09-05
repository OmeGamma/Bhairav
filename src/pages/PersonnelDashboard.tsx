import React, { useState, useEffect } from 'react';
import { IntelligenceCard } from '../components/Shared/IntelligenceCard';
import { Badge } from '../components/common/Badge';
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
      <div className="p-6  flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-[var(--color-bhairav-primary)]/30 border-t-[var(--color-bhairav-primary)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-end border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-bhairav-text)] uppercase">Personnel Welfare Dashboard</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Aggregated readiness and welfare indicators</p>
        </div>
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
        <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-bhairav-border)]">
            <h3 className="font-semibold text-[var(--color-bhairav-text)] uppercase tracking-wider text-sm">Recent Check-in Signals</h3>
            <span className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest font-mono">Anonymized</span>
          </div>
          
          <div className="space-y-3">
            {indicators.recentCheckIns.map(checkIn => (
              <div key={checkIn.id} className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] p-3 rounded-lg flex justify-between items-center group hover:border-[var(--color-bhairav-primary)]/50 transition-colors">
                <div>
                  <div className="text-sm font-medium text-[var(--color-bhairav-text)] mb-1 uppercase tracking-wider">{checkIn.status}</div>
                  <div className="flex gap-2 text-[10px] uppercase tracking-widest font-mono">
                    {checkIn.factors.map((f, i) => (
                      <span key={i} className="text-[var(--color-bhairav-text-muted)] bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-[var(--color-bhairav-text-muted)] font-data uppercase tracking-widest">
                  {new Date(checkIn.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Support Requests */}
        <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-bhairav-border)]">
            <h3 className="font-semibold text-[var(--color-bhairav-text)] uppercase tracking-wider text-sm">Active Support Requests</h3>
          </div>
          
          <div className="space-y-3">
            {indicators.activeRequests.map(req => (
              <div key={req.id} className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] p-3 rounded-lg flex justify-between items-center group hover:border-[var(--color-bhairav-primary)]/50 transition-colors">
                <div>
                  <div className="text-sm font-medium text-[var(--color-bhairav-text)] mb-1">{req.category}</div>
                  <div className="text-[10px] text-[var(--color-bhairav-text-muted)] font-data uppercase tracking-widest">
                    ID: {req.id} • {new Date(req.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <Badge status={req.status === 'PENDING' ? 'neutral' : req.status === 'RESOLVED' ? 'verified' : 'warning'}>{req.status}</Badge>
              </div>
            ))}
            {indicators.activeRequests.length === 0 && (
              <div className="text-sm text-[var(--color-bhairav-text-muted)] py-4 text-center font-mono uppercase tracking-widest">No active requests</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
