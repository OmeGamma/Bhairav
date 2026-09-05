import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Search, Activity, MapPin, Eye, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { alertService } from '../../services/alertService';
import { eventService } from '../../services/eventService';
import { taskService, Task } from '../../services/taskService';
import type { DashboardStats, SecurityEvent } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, eventsData, tasksData] = await Promise.all([
        alertService.getDashboardStats(),
        eventService.getSecurityEvents(),
        taskService.getTasks(),
      ]);
      setStats(statsData);
      setEvents(eventsData.slice(0, 5));
      setTasks(tasksData);
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

  const openTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'not_started').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, Officer</h1>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">National Security Intelligence Overview</p>
        </div>
        <div className="flex items-center gap-4 bg-[var(--color-bhairav-slate)] px-4 py-2 rounded-lg border border-[var(--color-bhairav-graphite)]">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider font-mono">Local Time</span>
            <span className="font-mono font-medium">{timeStr}</span>
          </div>
          <div className="w-px h-8 bg-[var(--color-bhairav-graphite)]"></div>
          <div className="flex flex-col">
            <span className="text-xs text-[var(--color-bhairav-text-muted)] uppercase tracking-wider font-mono">System Status</span>
            <span className="text-[var(--color-bhairav-verified)] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-bhairav-verified)] animate-pulse"></span>
              Secure
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Critical Alerts', count: stats.criticalAlerts, color: 'text-[var(--color-bhairav-ember)]', bg: 'bg-[var(--color-bhairav-ember)]/10', icon: AlertTriangle, link: '/attention', notch: 'critical' },
            { title: 'Security Reviews', count: stats.securityReviews, color: 'text-[var(--color-bhairav-ochre)]', bg: 'bg-[var(--color-bhairav-ochre)]/10', icon: Shield, link: '/intelligence/events', notch: 'warning' },
            { title: 'Intelligence Updates', count: stats.intelligenceUpdates, color: 'text-[var(--color-bhairav-steel)]', bg: 'bg-[var(--color-bhairav-steel)]/10', icon: Search, link: '/intelligence/search', notch: 'primary' },
            { title: 'Welfare Follow-ups', count: stats.welfareFollowups, color: 'text-[var(--color-bhairav-verified)]', bg: 'bg-[var(--color-bhairav-verified)]/10', icon: Activity, link: '/personnel', notch: 'verified' },
          ].map((stat, idx) => (
            <Link key={idx} to={stat.link} className="block group">
              <Card className={cn("severity-notch-" + stat.notch, "hover:border-[var(--color-bhairav-steel)]/30 transition-colors")}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[var(--color-bhairav-text-muted)] text-sm font-medium mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold font-mono">{stat.count < 10 ? `0${stat.count}` : stat.count}</h3>
                  </div>
                  <div className={cn("p-3 rounded-lg group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Security Map */}
      <section>
        <h2 className="text-xl font-bold mb-4">Security Map</h2>
        <Card className="severity-notch-primary">
          <div className="h-[600px] w-full flex items-center justify-center bg-[var(--color-bhairav-bg)] rounded-lg border border-[var(--color-bhairav-graphite)]">
            <div className="text-center">
              <MapPin className="mx-auto text-[var(--color-bhairav-text-muted)] mb-2" size={48} />
              <p className="text-[var(--color-bhairav-text-muted)]">Interactive geospatial intelligence map</p>
              <p className="text-xs text-[var(--color-bhairav-text-muted)] mt-1 font-mono">Events, cameras, zones, incidents</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Active Events + Attention Center */}
      <section>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Active Events */}
          <Card title="Active Events" action={<Link to="/intelligence/events" className="text-xs text-[var(--color-bhairav-steel)] hover:underline">View All</Link>} className="severity-notch-primary">
            <div className="space-y-3">
              {events.length === 0 ? (
                <EmptyState icon={Eye} title="No Recent Events" description="No security events have been detected recently." />
              ) : (
                events.map((evt, idx) => (
                  <Link key={idx} to={`/security/events/${evt.id}`} className="block group">
                    <div className={cn("p-3 rounded-lg border border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-bg)] hover:border-[var(--color-bhairav-steel)]/30 transition-colors severity-notch-" + (evt.severity === 'critical' ? 'critical' : evt.severity === 'warning' ? 'warning' : 'primary'))}>
                      <div className="flex justify-between items-start mb-1">
                        <Badge status={evt.severity}>{evt.type}</Badge>
                        <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-bhairav-text)] mt-2 line-clamp-2">{evt.description}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-bhairav-text-muted)]">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {evt.location}</span>
                        {evt.cameraId && <span className="flex items-center gap-1"><Eye size={12} /> {evt.cameraId}</span>}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Attention Center */}
          <Card title="Attention Center" action={<Link to="/attention" className="text-xs text-[var(--color-bhairav-steel)] hover:underline">View All</Link>} className="severity-notch-warning">
            <div className="space-y-3">
              {stats.criticalAlerts > 0 && (
                <div className="p-3 rounded-lg border border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-bg)] severity-notch-critical">
                  <div className="flex justify-between items-start mb-1">
                    <Badge status="critical">Critical</Badge>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)]">Just now</span>
                  </div>
                  <p className="text-sm text-[var(--color-bhairav-text)] mt-2">Restricted-zone movement detected — Sector X</p>
                </div>
              )}
              {overdueTasks > 0 && (
                <div className="p-3 rounded-lg border border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-bg)] severity-notch-warning">
                  <div className="flex justify-between items-start mb-1">
                    <Badge status="warning">Task</Badge>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)]">Overdue</span>
                  </div>
                  <p className="text-sm text-[var(--color-bhairav-text)] mt-2">{overdueTasks} high-priority task(s) overdue</p>
                </div>
              )}
              {stats.welfareFollowups > 0 && (
                <div className="p-3 rounded-lg border border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-bg)] severity-notch-warning">
                  <div className="flex justify-between items-start mb-1">
                    <Badge status="warning">Support</Badge>
                    <span className="text-xs text-[var(--color-bhairav-text-muted)]">Pending</span>
                  </div>
                  <p className="text-sm text-[var(--color-bhairav-text)] mt-2">{stats.welfareFollowups} welfare follow-up(s) require attention</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* My Tasks Summary */}
      <section>
        <Card title="My Tasks" action={<Link to="/tasks" className="text-xs text-[var(--color-bhairav-steel)] hover:underline">View All</Link>} className="severity-notch-primary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)]">
              <p className="text-2xl font-bold font-mono">{tasks.filter(t => t.status === 'in_progress').length}</p>
              <p className="text-xs text-[var(--color-bhairav-text-muted)] mt-1">In Progress</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)]">
              <p className="text-2xl font-bold font-mono">{tasks.filter(t => t.status === 'not_started').length}</p>
              <p className="text-xs text-[var(--color-bhairav-text-muted)] mt-1">Not Started</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)]">
              <p className="text-2xl font-bold font-mono text-[var(--color-bhairav-ochre)]">{overdueTasks}</p>
              <p className="text-xs text-[var(--color-bhairav-text-muted)] mt-1">Overdue</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)]">
              <p className="text-2xl font-bold font-mono text-[var(--color-bhairav-verified)]">{tasks.filter(t => t.status === 'completed').length}</p>
              <p className="text-xs text-[var(--color-bhairav-text-muted)] mt-1">Completed</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Security Trends */}
      <section>
        <Card title="Security Trends — Last 12 Hours" className="severity-notch-primary">
          <div className="h-[320px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bhairav-steel)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-bhairav-steel)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bhairav-ochre)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-bhairav-ochre)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bhairav-graphite)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-bhairav-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--color-bhairav-text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bhairav-slate)', borderColor: 'var(--color-bhairav-graphite)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-bhairav-text)' }}
                />
                <Area type="monotone" dataKey="events" name="Total Events" stroke="var(--color-bhairav-steel)" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                <Area type="monotone" dataKey="alerts" name="Critical Alerts" stroke="var(--color-bhairav-ochre)" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Recent Activity */}
      <section>
        <Card title="Recent Activity" className="severity-notch-primary">
          <div className="space-y-4">
            {events.length === 0 ? (
              <EmptyState icon={Bell} title="No Recent Activity" description="No recent activity to display." />
            ) : (
              events.map((evt, idx) => (
                <div key={idx} className="flex gap-3 relative pb-4 last:pb-0">
                  {idx !== events.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-[var(--color-bhairav-graphite)] -ml-px"></div>
                  )}
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-graphite)] flex items-center justify-center">
                      {evt.severity === 'critical' ? <AlertTriangle size={14} className="text-[var(--color-bhairav-ember)]" /> :
                       evt.severity === 'warning' ? <Shield size={14} className="text-[var(--color-bhairav-ochre)]" /> :
                       <Eye size={14} className="text-[var(--color-bhairav-steel)]" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <Badge status={evt.severity}>{evt.type}</Badge>
                      <span className="text-xs text-[var(--color-bhairav-text-muted)] font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-bhairav-text)] mt-2">{evt.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-bhairav-text-muted)]">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {evt.location}</span>
                      {evt.cameraId && <span className="flex items-center gap-1"><Eye size={12} /> {evt.cameraId}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
