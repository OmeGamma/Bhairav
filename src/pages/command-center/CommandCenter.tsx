import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Search, Activity, Camera, MapPin, Eye, Bell, ActivitySquare } from 'lucide-react';
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

const chartData = [
  { time: '18:00', events: 12, alerts: 2 },
  { time: '19:00', events: 19, alerts: 5 },
  { time: '20:00', events: 15, alerts: 3 },
  { time: '21:00', events: 25, alerts: 8 },
  { time: '22:00', events: 22, alerts: 7 },
  { time: '23:00', events: 30, alerts: 10 },
  { time: '00:00', events: 18, alerts: 4 },
];

export default function CommandCenter() {
  const [greeting, setGreeting] = useState('Good evening');
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
      setEvents(eventsData.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard intelligence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      
      if (hours < 12) setGreeting('Good morning');
      else if (hours < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
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
    <div className="space-y-6">
      {/* Top Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{greeting}, Officer</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">National Security Intelligence Overview</p>
        </div>
        <div className="flex items-center gap-4 bg-[var(--color-bhairav-surface)] px-4 py-2 rounded-lg border border-[var(--color-bhairav-border)]">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider">Local Time</span>
            <span className="font-mono font-medium">{timeStr}</span>
          </div>
          <div className="w-px h-8 bg-[var(--color-bhairav-border)]"></div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider">System Status</span>
            <span className="text-[var(--color-bhairav-verified)] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-bhairav-verified)] animate-pulse"></span>
              Secure
            </span>
          </div>
        </div>
      </div>

      {/* Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: "Critical Alerts", count: stats.criticalAlerts, color: "text-[var(--color-bhairav-critical)]", bg: "bg-[var(--color-bhairav-critical)]/10", icon: AlertTriangle, link: "/attention" },
          { title: "Security Reviews", count: stats.securityReviews, color: "text-[var(--color-bhairav-warning)]", bg: "bg-[var(--color-bhairav-warning)]/10", icon: Shield, link: "/intelligence/events" },
          { title: "Intelligence", count: stats.intelligenceUpdates, color: "text-[var(--color-bhairav-primary)]", bg: "bg-[var(--color-bhairav-primary)]/10", icon: Search, link: "/intelligence/search" },
          { title: "Welfare", count: stats.welfareFollowups, color: "text-[var(--color-bhairav-verified)]", bg: "bg-[var(--color-bhairav-verified)]/10", icon: Activity, link: "/attention" },
        ].map((stat, idx) => (
          <Link key={idx} to={stat.link} className="block group">
            <Card className="hover:border-[var(--color-bhairav-primary)]/50 transition-colors h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[var(--color-bhairav-text-muted)] text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold">{stat.count < 10 ? `0${stat.count}` : stat.count}</h3>
                </div>
                <div className={cn("p-3 rounded-lg group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <Card title="Security Activity (Last 12 Hours)" className="xl:col-span-2 min-h-[400px]">
          <div className="h-[320px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bhairav-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-bhairav-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bhairav-critical)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-bhairav-critical)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bhairav-border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-bhairav-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--color-bhairav-text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bhairav-surface)', borderColor: 'var(--color-bhairav-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-bhairav-text)' }}
                />
                <Area type="monotone" dataKey="events" name="Total Events" stroke="var(--color-bhairav-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                <Area type="monotone" dataKey="alerts" name="Critical Alerts" stroke="var(--color-bhairav-critical)" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live Feed */}
        <Card title="Live Intelligence Feed" action={<Link to="/intelligence/events" className="text-xs text-[var(--color-bhairav-primary)] hover:underline">View All</Link>} className="xl:col-span-1">
          <div className="space-y-4">
            {events.length === 0 ? (
              <EmptyState icon={ActivitySquare} title="No Recent Events" description="No security events have been detected recently." className="min-h-[200px]" />
            ) : (
              events.map((evt, idx) => (
                <div key={idx} className="flex gap-3 relative pb-4 last:pb-0">
                  {idx !== events.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-[var(--color-bhairav-border)] -ml-px"></div>
                  )}
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] flex items-center justify-center">
                      {evt.severity === 'critical' ? <AlertTriangle size={14} className="text-[var(--color-bhairav-critical)]" /> :
                       evt.severity === 'warning' ? <Shield size={14} className="text-[var(--color-bhairav-warning)]" /> :
                       <Eye size={14} className="text-[var(--color-bhairav-primary)]" />}
                    </div>
                  </div>
                  <div className="bg-[var(--color-bhairav-bg)] p-3 rounded-lg border border-[var(--color-bhairav-border)] flex-1 hover:border-[var(--color-bhairav-primary)]/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <Badge status={evt.severity}>{evt.type}</Badge>
                      <span className="text-xs text-[var(--color-bhairav-text-muted)]">
                        {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-bhairav-text)] mt-2 line-clamp-2">{evt.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-bhairav-text-muted)]">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {evt.location}</span>
                      {evt.cameraId && <span className="flex items-center gap-1"><Camera size={12} /> {evt.cameraId}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div className="flex gap-3 relative pb-4">
               <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] flex items-center justify-center">
                     <Bell size={14} className="text-[var(--color-bhairav-info)]" />
                  </div>
                </div>
                <div className="bg-[var(--color-bhairav-bg)] p-3 rounded-lg border border-[var(--color-bhairav-border)] flex-1 hover:border-[var(--color-bhairav-primary)]/30 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <Badge status="info">System Update</Badge>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)]">Just now</span>
                  </div>
                  <p className="text-sm text-[var(--color-bhairav-text)] mt-2">New intelligence relationship rules deployed to analysis engine.</p>
                </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
