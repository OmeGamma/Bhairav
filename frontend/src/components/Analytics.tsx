import React, { useEffect, useState } from 'react';
import Layout from './layout/Layout';
import { apiClient } from '../api/client';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Activity, FileText, Video, Database, Clock, MapPin, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-xl rounded-xl p-4 text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-gray-300">
              {entry.name || 'Count'}: <span className="font-medium text-gray-900 dark:text-white">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState('All Time');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('All');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<any>('/api/analytics/full');
        if (res.ok && res.data) {
          setData(res.data);
        } else {
          setError(res.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center min-h-[500px]">
          <div className="flex flex-col items-center gap-4">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent"></div>
             <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Intelligence Data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center min-h-[500px] text-red-500 flex-col bg-red-50/50 dark:bg-red-900/10 rounded-2xl m-8">
          <AlertTriangle className="w-16 h-16 mb-4 opacity-80" />
          <h2 className="text-xl font-bold">Intelligence Feed Error</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </Layout>
    );
  }

  let filteredCrimeDist = data.cases_by_crime;
  if (crimeTypeFilter !== 'All') {
     filteredCrimeDist = data.cases_by_crime.filter((c: any) => c.crime_type === crimeTypeFilter);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-light-accent dark:text-blue-400" />
              Intelligence Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Comprehensive operational overview of the Bhairav Database</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="bg-white dark:bg-[#1e212b] shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-1 flex">
               <select 
                  value={crimeTypeFilter}
                  onChange={(e) => setCrimeTypeFilter(e.target.value)}
                  className="bg-transparent border-none text-gray-700 dark:text-gray-300 px-4 py-2 text-sm focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="All">All Crime Types</option>
                  {data.cases_by_crime.map((c: any) => (
                    <option key={c.crime_type} value={c.crime_type}>{c.crime_type}</option>
                  ))}
                </select>
             </div>
             <div className="bg-white dark:bg-[#1e212b] shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-1 flex">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent border-none text-gray-700 dark:text-gray-300 px-4 py-2 text-sm focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="All Time">All Time</option>
                  <option value="7 Days">Last 7 Days (Mock)</option>
                  <option value="30 Days">Last 30 Days (Mock)</option>
                </select>
             </div>
          </div>
        </div>

        {/* Global Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Cases', value: data.total_cases, icon: Shield, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Avg Closure Time', value: data.resolution.avg_closure_days ? `${data.resolution.avg_closure_days} days` : 'Insufficient data', icon: Clock, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Total Evidence', value: data.total_evidence, icon: Database, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Video Reports', value: data.video_analytics.total, icon: Video, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#1a1c23] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Primary Row: Trend & Crime Type */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Trend Analysis (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Case Activity Trend</h3>
            <div className="h-[350px]">
              {data.monthly_trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Cases" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Insufficient historical data to plot trends.</div>
              )}
            </div>
          </div>

          {/* Crime Type Distribution (Donut) */}
          <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Crime Distribution</h3>
            <div className="h-[250px] relative">
              {filteredCrimeDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredCrimeDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="crime_type"
                      stroke="none"
                    >
                      {filteredCrimeDist.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No data for selected filter</div>
              )}
              {/* Center Text */}
              {filteredCrimeDist.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {filteredCrimeDist.reduce((acc: number, curr: any) => acc + curr.count, 0)}
                  </span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
                </div>
              )}
            </div>
            
            {/* Clean Legend */}
            <div className="mt-4 flex-1 overflow-y-auto pr-2 max-h-[120px] space-y-2 custom-scrollbar">
              {filteredCrimeDist.map((c: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                     <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]" title={c.crime_type}>{c.crime_type}</span>
                   </div>
                   <span className="font-semibold text-gray-900 dark:text-white">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Row: Status & Geographic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Status & Priority Analysis */}
          <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Status & Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cases_by_status} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false}/>
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="status" type="category" stroke="#6b7280" fontSize={11} width={80} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Status" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.cases_by_priority} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false}/>
                  <XAxis dataKey="priority" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={5} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" name="Priority" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
              <MapPin className="w-6 h-6 text-indigo-400" />
              Hotspot Concentrations
            </h3>
            <div className="space-y-5 flex-1 overflow-y-auto pr-4 custom-scrollbar max-h-[250px]">
              {data.cases_by_city.map((loc: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{loc.city}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono">{loc.count} cases</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (loc.count / data.total_cases) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {data.cases_by_city.length === 0 && (
                <div className="text-gray-400 text-center py-10">Location Data Missing</div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline & Video Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2">
             <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
               <FileText className="w-6 h-6 text-purple-400" />
               Investigation Growth
             </h3>
             <div className="h-[300px]">
                {(data.growth.documents.length > 0 || data.growth.evidence.length > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDuplicatedCategory={false} dy={10} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line data={data.growth.documents} type="monotone" dataKey="count" name="Documents" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line data={data.growth.evidence} type="monotone" dataKey="count" name="Evidence" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">Insufficient historical data to plot growth.</div>
                )}
             </div>
          </div>

          <div className="bg-white dark:bg-[#1a1c23] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-1 flex flex-col">
             <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-blue-400" />
                Intelligence Timeline
             </h3>
             <div className="flex-1 overflow-y-auto pr-2 relative max-h-[300px] custom-scrollbar">
                {/* Vertical Line */}
                {data.timeline.length > 0 && (
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700"></div>
                )}
                <div className="space-y-6">
                  {data.timeline.length > 0 ? data.timeline.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className="w-6 h-6 mt-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 shrink-0 z-10 flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">{item.event}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-gray-400 text-center py-10">No recent activity</div>
                  )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
