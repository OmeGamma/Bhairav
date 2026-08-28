import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, MapPin, Eye, Bell, Heart, ActivitySquare, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { alertService } from '../../services/alertService';
import { eventService } from '../../services/eventService';
import type { DashboardStats, SecurityEvent } from '../../types';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const trendData = [
  { time: '18:00', events: 12 },
  { time: '19:00', events: 19 },
  { time: '20:00', events: 15 },
  { time: '21:00', events: 25 },
  { time: '22:00', events: 22 },
  { time: '23:00', events: 30 },
  { time: '00:00', events: 18 },
];

export default function CommandCenter() {
  const [timeStr, setTimeStr] = useState('');
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, eventsData] = await Promise.all([
        alertService.getDashboardStats(),
        eventService.getSecurityEvents()
      ]);
      setStats(statsData);
      setEvents(eventsData.slice(0, 4));
    } catch (err) {
      setError('Failed to load dashboard intelligence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' Z');
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    fetchData();
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingState fullHeight message="Initializing command center..." />;
  }

  if (error || !stats) {
    return <ErrorState title="System Unavailable" message={error || 'Initialization failed.'} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-bhairav-text)] uppercase font-sans">Command Center</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Unified Security Intelligence Overview</p>
        </div>
        <div className="flex items-center gap-4 bg-[var(--color-bhairav-surface)] px-4 py-2 rounded border border-[var(--color-bhairav-border)] shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest">Zulu Time</span>
            <span className="font-data text-[var(--color-bhairav-text)]">{timeStr}</span>
          </div>
          <div className="w-px h-8 bg-[var(--color-bhairav-border)]"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest">System</span>
            <span className="text-[var(--color-bhairav-verified)] font-medium flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--color-bhairav-verified)] animate-pulse"></span>
              SECURE
            </span>
          </div>
        </div>
      </div>

      {/* Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/intelligence/search" className="block group">
          <Card className="hover:border-[var(--color-bhairav-primary)]/50 transition-colors h-full bg-[var(--color-bhairav-surface)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[var(--color-bhairav-text-muted)] text-sm font-medium mb-1">Intelligence</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-[var(--color-bhairav-text)]">{stats.intelligenceUpdates < 10 ? `0${stats.intelligenceUpdates}` : stats.intelligenceUpdates}</h3>
                  <span className="text-xs text-[var(--color-bhairav-primary)]">Activity</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-primary)]">
                <Eye size={24} />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/attention" className="block group">
          <Card className="hover:border-[var(--color-bhairav-critical)]/50 transition-colors h-full severity-notch-critical">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[var(--color-bhairav-text-muted)] text-sm font-medium mb-1">Critical Events</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-[var(--color-bhairav-text)]">{stats.criticalAlerts < 10 ? `0${stats.criticalAlerts}` : stats.criticalAlerts}</h3>
                  <span className="text-xs text-[var(--color-bhairav-critical)]">Active</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bhairav-critical)]/10 text-[var(--color-bhairav-critical)]">
                <AlertTriangle size={24} />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/personnel" className="block group">
          <Card className="hover:border-[var(--color-bhairav-verified)]/50 transition-colors h-full bg-[var(--color-bhairav-surface)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[var(--color-bhairav-text-muted)] text-sm font-medium mb-1">Personnel Welfare</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-[var(--color-bhairav-text)]">92%</h3>
                  <span className="text-xs text-[var(--color-bhairav-verified)]">Readiness</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bhairav-verified)]/10 text-[var(--color-bhairav-verified)]">
                <Heart size={24} />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Area: Security Map */}
        <Card title="SECURITY MAP" action={<Link to="/security/map" className="text-xs text-[var(--color-bhairav-primary)] hover:underline uppercase tracking-wider">Expand Map</Link>} className="xl:col-span-2 min-h-[400px] border-[var(--color-bhairav-border)]">
          <div className="h-[360px] w-full mt-2 rounded bg-[#0b0e11] border border-[var(--color-bhairav-border)] relative overflow-hidden flex items-center justify-center">
            {/* Map Placeholder with grid texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative z-10 flex flex-col items-center gap-3 opacity-50">
               <MapPin size={32} className="text-[var(--color-bhairav-primary)]" />
               <span className="text-sm tracking-widest text-[var(--color-bhairav-primary)]">MAP DATA INITIALIZING...</span>
            </div>
            
            {/* Simulated map nodes */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-[var(--color-bhairav-primary)] shadow-[0_0_10px_var(--color-bhairav-primary)]" />
            <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-[var(--color-bhairav-critical)] shadow-[0_0_15px_var(--color-bhairav-critical)] animate-pulse" />
            <div className="absolute bottom-1/3 left-1/2 w-3 h-3 rounded-full bg-[var(--color-bhairav-warning)] shadow-[0_0_10px_var(--color-bhairav-warning)]" />
          </div>
        </Card>

        {/* Attention Center */}
        <Card title="ATTENTION CENTER" action={<Link to="/attention" className="text-xs text-[var(--color-bhairav-primary)] hover:underline uppercase tracking-wider">View All</Link>} className="xl:col-span-1">
          <div className="space-y-3 mt-2">
            <div className="bg-[var(--color-bhairav-bg)] p-3 rounded border border-[var(--color-bhairav-border)] severity-notch-critical hover:bg-[var(--color-bhairav-surface-hover)] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-xs font-bold text-[var(--color-bhairav-critical)] uppercase tracking-wider">Critical</span>
                <span className="font-data text-[var(--color-bhairav-text-muted)]">14:30:12 Z</span>
              </div>
              <p className="text-sm text-[var(--color-bhairav-text)]">Zone 4 perimeter breach detected by Cam-17.</p>
            </div>
            
            <div className="bg-[var(--color-bhairav-bg)] p-3 rounded border border-[var(--color-bhairav-border)] severity-notch-warning hover:bg-[var(--color-bhairav-surface-hover)] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-xs font-bold text-[var(--color-bhairav-warning)] uppercase tracking-wider">Review</span>
                <span className="font-data text-[var(--color-bhairav-text-muted)]">14:15:00 Z</span>
              </div>
              <p className="text-sm text-[var(--color-bhairav-text)]">Identity mismatch at Checkpoint Alpha.</p>
            </div>

            <div className="bg-[var(--color-bhairav-bg)] p-3 rounded border border-[var(--color-bhairav-border)] severity-notch-primary hover:bg-[var(--color-bhairav-surface-hover)] transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-xs font-bold text-[var(--color-bhairav-primary)] uppercase tracking-wider">Investigation</span>
                <span className="font-data text-[var(--color-bhairav-text-muted)]">13:45:22 Z</span>
              </div>
              <p className="text-sm text-[var(--color-bhairav-text)]">Unusual network activity detected on Node 42.</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="RECENT ACTIVITY" className="h-[300px]">
           <div className="space-y-0 mt-2 flex flex-col h-full overflow-y-auto pr-2">
             {events.length === 0 ? (
               <EmptyState icon={ActivitySquare} title="No Activity" description="No recent events." className="flex-1" />
             ) : (
               events.map((evt, idx) => (
                 <div key={idx} className="flex gap-3 py-3 border-b border-[var(--color-bhairav-border)] last:border-0 hover:bg-[var(--color-bhairav-bg)] px-2 -mx-2 rounded transition-colors">
                   <span className="font-data text-[var(--color-bhairav-primary)] shrink-0 w-24">
                     {new Date(evt.timestamp).toISOString().substring(11, 19)} Z
                   </span>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm text-[var(--color-bhairav-text)] truncate">{evt.description}</p>
                   </div>
                   <div className="shrink-0 flex items-center">
                     {evt.severity === 'critical' && <ShieldAlert size={14} className="text-[var(--color-bhairav-critical)]" />}
                     {evt.severity === 'warning' && <AlertTriangle size={14} className="text-[var(--color-bhairav-warning)]" />}
                   </div>
                 </div>
               ))
             )}
           </div>
        </Card>

        {/* Security Trends */}
        <Card title="SECURITY TRENDS" className="h-[300px]">
          <div className="h-full w-full mt-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bhairav-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-bhairav-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bhairav-border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-bhairav-text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={10} className="font-data" />
                <YAxis stroke="var(--color-bhairav-text-muted)" fontSize={10} tickLine={false} axisLine={false} dx={-10} className="font-data" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bhairav-surface)', borderColor: 'var(--color-bhairav-border)', borderRadius: '4px', padding: '8px' }}
                  itemStyle={{ color: 'var(--color-bhairav-text)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                  labelStyle={{ color: 'var(--color-bhairav-text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="events" name="Events" stroke="var(--color-bhairav-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
