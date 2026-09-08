import React, { useEffect, useState, useMemo } from 'react';
import Layout from './layout/Layout';
import {
  Briefcase,
  AlertTriangle,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Search,
  Map as MapIcon,
  Network,
   Cpu,
  ChevronRight,
  Bell,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
const [analytics, setAnalytics] = useState<any>(null);
  const [videoStats, setVideoStats] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [analyticsRes, casesRes, notifRes, videoRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/cases'),
          fetch('/api/notifications'),
          fetch('/api/video-intelligence/status'),
        ]);
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (casesRes.ok) {
          const data = await casesRes.json();
          setRecentCases(data.slice(0, 5));
        }
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.filter((n: any) => !n.read).slice(0, 5));
        }
        if (videoRes.ok) {
          const data = await videoRes.json();
          setVideoStats(data.stats || null);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // The AI analyzer is typically where natural language search lives.
      navigate(`/ai-analyzer?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const statusCounts = useMemo(() => {
    if (!analytics?.cases_by_status) return { open: 0, investigation: 0, closed: 0 };
    const map: Record<string, number> = {};
    for (const item of analytics.cases_by_status) {
      map[item.status.toUpperCase()] = item.count;
    }
    return {
      open: map['OPEN'] || 0,
      investigation: map['UNDER INVESTIGATION'] || 0,
      closed: map['CLOSED'] || 0,
    };
  }, [analytics]);

  const statCards = analytics
    ? [
        { name: 'Total Cases', value: analytics.total_cases.toLocaleString(), icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/20' },
        { name: 'Open Cases', value: statusCounts.open.toLocaleString(), icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
        { name: 'Under Investigation', value: statusCounts.investigation.toLocaleString(), icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/20' },
        { name: 'Closed Cases', value: statusCounts.closed.toLocaleString(), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' },
         { name: 'High Priority', value: (analytics.cases_by_priority?.find((p: any) => p.priority.toUpperCase() === 'HIGH')?.count || 0).toLocaleString(), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/20' },
        { name: 'Evidence Items', value: analytics.total_evidence.toLocaleString(), icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/20' },
         { name: 'Documents', value: 0, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/20' },
         { name: 'Videos', value: analytics.total_videos.toLocaleString(), icon: Video, color: 'text-teal-500', bg: 'bg-teal-500/20' },
         { name: 'Video Events', value: (videoStats?.total_events ?? 0).toLocaleString(), icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/20' },
         { name: 'Today Events', value: (videoStats?.today_events ?? 0).toLocaleString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/20' },
      ]
    : [];

  const getPriorityBadge = (priority: string) => {
    const p = (priority || '').toUpperCase();
    switch (p) {
      case 'HIGH': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'MEDIUM': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'LOW': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'OPEN': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'UNDER INVESTIGATION': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'CLOSED': return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto pb-12 fade-in">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-light-card to-white dark:from-dark-card dark:to-dark-bg p-8 rounded-2xl shadow-sm border border-light-border dark:border-dark-border">
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-light-accent to-blue-600 dark:from-blue-400 dark:to-cyan-300">Bhairav Intelligence Search</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Natural-language grounded search across MongoDB cases, persons, and evidence.</p>
            
            <form onSubmit={handleSearch} className="mt-6 relative w-full max-w-2xl group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-light-accent dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-dark-bg/50 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-blue-500 focus:border-light-accent dark:focus:border-blue-500 transition-all sm:text-sm backdrop-blur-sm"
                placeholder="E.g., Mumbai vehicle theft involving Rajesh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute inset-y-2 right-2 px-4 py-1.5 bg-light-accent hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Top Intelligence Summary */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-1">Top Intelligence Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-dark-card rounded-xl p-4 flex flex-col items-center justify-center animate-pulse border border-light-border dark:border-dark-border min-h-[110px]">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mb-2"></div>
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))
              : statCards.map((stat) => (
                  <div key={stat.name} className="bg-white dark:bg-dark-card rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-light-border dark:border-dark-border transition-all hover:scale-[1.03] hover:shadow-md group cursor-default min-h-[110px]">
                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.name}</p>
                  </div>
                ))}
          </div>
        </div>

        {/* Triple Lens Area */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-1">Triple-Lens Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. AI Intelligence */}
            <Link to="/ai-analyzer" className="block group">
              <div className="h-full bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-dark-card rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Intelligence</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  Natural language investigation results grounded in MongoDB. Extract insights, identify patterns, and correlate seemingly unrelated events automatically.
                </p>
                <div className="mt-auto">
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
                    Launch AI Analysis <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            </Link>

            {/* 2. Criminal Network */}
            <Link to="/criminal-network" className="block group">
              <div className="h-full bg-gradient-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-dark-card rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-500 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <Network className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Criminal Network</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Live network preview mapped from relational links between persons, vehicles, evidence, and FIRs in the database.
                </p>
                 <div className="mt-auto">
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                    Explore Graph <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            </Link>

            {/* 3. Geospatial Intelligence */}
            <Link to="/geospatial" className="block group">
              <div className="h-full bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-dark-card rounded-2xl shadow-sm border border-amber-100 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-500 relative overflow-hidden">
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Geospatial Intelligence</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Live map and hotspot preview identifying high incident concentrations and spatial patterns.
                </p>
                 <div className="mt-auto">
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center">
                    Open Map <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
             </Link>

            {/* 4. Video Intelligence */}
            <Link to="/video-intelligence" className="block group">
              <div className="h-full bg-gradient-to-br from-rose-50 to-white dark:from-gray-800 dark:to-dark-card rounded-2xl shadow-sm border border-rose-100 dark:border-gray-700 p-6 transition-all hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-500 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Video Intelligence</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Real-time YOLO-based person detection from live camera feeds and uploaded videos. Track suspects, generate alerts, and link evidence to cases.
                </p>
                {videoStats && (
                  <div className="mt-auto">
                    <div className="flex gap-4 text-xs">
                      <span className="text-rose-600 dark:text-rose-400 font-medium">{videoStats.total_events} events</span>
                      <span className="text-gray-500 dark:text-gray-400">{videoStats.today_events} today</span>
                    </div>
                  </div>
                )}
              </div>
            </Link>

           </div>
         </div>

        {/* Recent Cases & Live Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Cases Table */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-light-border dark:border-dark-border overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent MongoDB Cases</h2>
              <Link to="/cases" className="text-sm text-light-accent dark:text-blue-400 font-medium hover:underline">View All</Link>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-6 py-4">Case</th>
                    <th scope="col" className="px-6 py-4">Crime</th>
                    <th scope="col" className="px-6 py-4">City</th>
                    <th scope="col" className="px-6 py-4">Status / Priority</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                    <th scope="col" className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading cases...</td>
                    </tr>
                  ) : recentCases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No cases found in MongoDB.</td>
                    </tr>
                  ) : (
                    recentCases.map((c) => (
                      <tr key={c._id || c.case_number} className="bg-white dark:bg-dark-card border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {c.case_number}
                        </td>
                        <td className="px-6 py-4">{c.crime_type || 'Unknown'}</td>
                        <td className="px-6 py-4">{c.location?.city || c.city || 'Unknown'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(c.status)}`}>{c.status}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityBadge(c.priority)}`}>{c.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {c.filingDate ? new Date(c.filingDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <Link to={`/cases/${c.case_number}`} className="font-medium text-light-accent dark:text-blue-400 hover:underline">View</Link>
                            <Link to={`/cases/${c.case_number}/edit`} className="font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">Edit</Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Alerts */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-light-border dark:border-dark-border flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-rose-500" /> Live Alerts
              </h2>
            </div>
            <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500 text-sm">Loading alerts...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <CheckCircle className="w-10 h-10 text-green-400 mb-3 opacity-50" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No new unread alerts.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.map((n) => (
                    <li key={n.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
              <Link to="/alerts" className="block w-full text-center text-sm font-medium text-light-accent dark:text-blue-400 hover:underline py-2">
                VIEW ALL ALERTS
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
