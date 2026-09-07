import React, { useEffect, useState, useMemo } from 'react';
import Layout from './layout/Layout';
import {
  Briefcase,
  AlertTriangle,
  Video,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#0284C7', '#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD'];

const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [analyticsRes, casesRes] = await Promise.all([
          fetch('http://localhost:8000/api/analytics'),
          fetch('http://localhost:8000/api/cases'),
        ]);
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
        if (casesRes.ok) {
          const data = await casesRes.json();
          setRecentCases(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusCounts = useMemo(() => {
    if (!analytics?.cases_by_status) return { open: 0, investigation: 0, closed: 0 };
    const map: Record<string, number> = {};
    for (const item of analytics.cases_by_status) {
      map[item.status] = item.count;
    }
    return {
      open: map['OPEN'] || 0,
      investigation: map['UNDER INVESTIGATION'] || 0,
      closed: map['CLOSED'] || 0,
    };
  }, [analytics]);

  const statCards = analytics
    ? [
        { name: 'Total Cases', value: analytics.total_cases.toLocaleString(), icon: Briefcase, color: 'text-blue-500' },
        { name: 'Open Cases', value: statusCounts.open.toLocaleString(), icon: Clock, color: 'text-yellow-500' },
        { name: 'Under Investigation', value: statusCounts.investigation.toLocaleString(), icon: AlertTriangle, color: 'text-orange-500' },
        { name: 'Closed Cases', value: statusCounts.closed.toLocaleString(), icon: CheckCircle, color: 'text-green-500' },
        { name: 'Evidence Items', value: analytics.total_evidence.toLocaleString(), icon: FileText, color: 'text-purple-500' },
        { name: 'Video Evidence', value: analytics.total_videos.toLocaleString(), icon: Video, color: 'text-teal-500' },
      ]
    : [];

  const cityData = analytics?.cases_by_city || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Under Investigation': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last updated: Just now</p>
          </div>
          {analytics && (
            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded border border-yellow-300 dark:border-yellow-700">DEMO DATA</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4 flex items-center animate-pulse">
                  <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-8 h-8" />
                  <div className="ml-3 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                  </div>
                </div>
              ))
            : statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4 flex items-center transition-transform hover:scale-105 cursor-default">
                    <div className={`p-2 rounded-full bg-opacity-20 bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6 min-h-[400px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cases by City</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="city" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }}
                    itemStyle={{ color: '#0EA5E9' }}
                  />
                  <Bar dataKey="count" fill="#0284C7">
                    {cityData.map((_entry: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6 min-h-[400px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Cases</h2>
            <div className="space-y-3">
              {recentCases.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500">No cases found.</p>
              )}
              {recentCases.map((c) => (
                <Link key={c._id || c.case_number} to={`/cases/${c.case_number}`} className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.case_number}: {c.title}</h3>
                      {c.dataClassification === 'DEMO_SYNTHETIC' && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-300 ml-2">DEMO DATA</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.crime_type} • {c.location?.city || 'Unknown'}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(c.status)}`}>{c.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
