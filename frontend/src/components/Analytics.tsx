import React, { useEffect, useState } from 'react';
import Layout from './layout/Layout';
import { apiClient } from '../api/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Bar, Scatter,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Activity, FileText, Video, Database, Clock, MapPin, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-2xl rounded-xl p-4 text-sm font-sans z-50">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.payload.fill || COLORS[0] }} />
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {entry.name || 'Count'}: <span className="font-bold text-gray-900 dark:text-white ml-1">{entry.value}</span>
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
          <div className="flex flex-col items-center gap-5">
             <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-500"></div>
             <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Synthesizing Intelligence Data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center min-h-[500px] text-red-500 flex-col bg-red-50/50 dark:bg-red-900/10 rounded-3xl m-8 border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="w-20 h-20 mb-6 opacity-80" />
          <h2 className="text-2xl font-bold tracking-tight">Intelligence Feed Error</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-lg">{error}</p>
        </div>
      </Layout>
    );
  }

  let filteredCrimeDist = data.cases_by_crime || [];
  if (crimeTypeFilter !== 'All') {
     filteredCrimeDist = filteredCrimeDist.filter((c: any) => c.crime_type === crimeTypeFilter);
  }

  // Pre-process for Lollipop Chart
  const lollipopData = data.cases_by_crime.map((c: any, i: number) => ({
    name: c.crime_type,
    count: c.count,
    fill: COLORS[i % COLORS.length]
  })).sort((a: any, b: any) => b.count - a.count);

  // Pre-process for Radial Status
  const statusData = data.cases_by_status.map((s: any, i: number) => ({
    name: s.status,
    count: s.count,
    fill: s.status === 'Closed' ? '#10b981' : s.status === 'Open' ? '#ef4444' : '#3b82f6'
  }));

  // Pre-process for Radial Priority
  const priorityData = data.cases_by_priority.map((p: any, i: number) => ({
    name: p.priority,
    count: p.count,
    fill: p.priority === 'High' ? '#ef4444' : p.priority === 'Medium' ? '#f59e0b' : '#10b981'
  }));

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto pb-32 px-6 sm:px-10 lg:px-16 space-y-24">
        
        {/* Header Section */}
        <div className="pt-12 pb-8 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              ANALYTICS
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed font-light">
              Explore patterns, activity, geographic concentration and intelligence signals across Bhairav.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
             <div className="bg-white dark:bg-dark-card shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl p-1.5 flex items-center transition-all hover:border-gray-300 dark:hover:border-gray-700">
               <select 
                  value={crimeTypeFilter}
                  onChange={(e) => setCrimeTypeFilter(e.target.value)}
                  className="bg-transparent border-none text-gray-700 dark:text-gray-300 px-4 py-2 font-medium focus:ring-0 cursor-pointer outline-none w-full"
                >
                  <option value="All">All Crime Types</option>
                  {data.cases_by_crime.map((c: any) => (
                    <option key={c.crime_type} value={c.crime_type}>{c.crime_type}</option>
                  ))}
                </select>
             </div>
             <div className="bg-white dark:bg-dark-card shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl p-1.5 flex items-center transition-all hover:border-gray-300 dark:hover:border-gray-700">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent border-none text-gray-700 dark:text-gray-300 px-4 py-2 font-medium focus:ring-0 cursor-pointer outline-none w-full"
                >
                  <option value="All Time">All Time</option>
                  <option value="7 Days">Last 7 Days</option>
                  <option value="30 Days">Last 30 Days</option>
                </select>
             </div>
          </div>
        </div>

        {/* SUMMARY RINGS */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {[
              { label: 'TOTAL CASES', value: data.total_cases, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/10' },
              { label: 'AVERAGE CLOSURE', value: data.resolution.avg_closure_days ? `${data.resolution.avg_closure_days}D` : 'N/A', color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
              { label: 'EVIDENCE', value: data.total_evidence, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-900/10' },
              { label: 'VIDEO REPORTS', value: data.video_analytics.total, color: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-900/10' },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-5 p-6 rounded-3xl border border-gray-100 dark:border-gray-800/60 ${stat.bg} transition-transform hover:-translate-y-1 duration-300`}>
                 <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-gray-800" />
                      <circle cx="32" cy="32" r="30" fill="none" stroke={stat.color} strokeWidth="4" strokeDasharray="188" strokeDashoffset="47" className="transition-all duration-1000 ease-out" />
                    </svg>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                 </div>
              </div>
            ))}
          </div>
        </section>



        {/* CRIME DISTRIBUTION */}
        <section className="bg-white dark:bg-[#13151c] rounded-[2.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">CRIME DISTRIBUTION</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Proportional breakdown of categorized offenses</p>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="h-[500px] w-full max-w-[600px] relative mb-12">
              {filteredCrimeDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredCrimeDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={130}
                      outerRadius={180}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="crime_type"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {filteredCrimeDist.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">NO DATA AVAILABLE</div>
              )}
              {/* Center Value */}
              {filteredCrimeDist.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">TOTAL CASES</span>
                  <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {filteredCrimeDist.reduce((acc: number, curr: any) => acc + curr.count, 0)}
                  </span>
                </div>
              )}
            </div>

            {/* Flat Legend without internal scrollbar */}
            {filteredCrimeDist.length > 0 && (
              <div className="w-full flex flex-wrap justify-center gap-x-8 gap-y-4 px-4">
                {filteredCrimeDist.map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/40 px-5 py-2.5 rounded-full border border-gray-100 dark:border-gray-700/50">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{c.crime_type}</span>
                    <span className="text-gray-900 dark:text-white font-bold ml-2">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CRIME COMPARISON (Lollipop) */}
        <section className="bg-white dark:bg-[#13151c] rounded-[2.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <div className="mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">CRIME COMPARISON</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Magnitude comparison across crime types</p>
          </div>
          <div className="h-[500px]">
             {lollipopData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={lollipopData} layout="vertical" margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.05} horizontal={false} />
                    <XAxis type="number" stroke="#9ca3af" fontSize={13} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={13} tickLine={false} axisLine={false} width={120} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" barSize={3} radius={4} fill="#e2e8f0" />
                    <Scatter dataKey="count" name="Count" shape="circle" fill="#8b5cf6" />
                  </ComposedChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">INSUFFICIENT DATA</div>
             )}
          </div>
        </section>

        {/* STATUS & PRIORITY (Radial) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-[#13151c] rounded-[2.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">CASE STATUS</h2>
            </div>
            <div className="h-[350px] relative">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={20} data={statusData} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: 'transparent' }} dataKey="count" cornerRadius={10} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">NO DATA</div>
              )}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              {statusData.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 text-sm font-medium">
                  <span className="text-gray-500 uppercase tracking-widest w-32 text-right">{s.name}</span>
                  <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: s.fill }}></div>
                  <span className="text-gray-900 dark:text-white font-bold w-10 text-lg">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#13151c] rounded-[2.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">PRIORITY</h2>
            </div>
            <div className="h-[350px] relative">
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={20} data={priorityData} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: 'transparent' }} dataKey="count" cornerRadius={10} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">NO DATA</div>
              )}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              {priorityData.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 text-sm font-medium">
                  <span className="text-gray-500 uppercase tracking-widest w-32 text-right">{p.name}</span>
                  <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: p.fill }}></div>
                  <span className="text-gray-900 dark:text-white font-bold w-10 text-lg">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GEOGRAPHIC HOTSPOTS */}
        <section className="bg-white dark:bg-[#13151c] rounded-[2.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
           <div className="mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">HOTSPOT CONCENTRATION</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Geographic intensity nodes</p>
          </div>
          <div className="h-[500px] w-full bg-gray-50 dark:bg-black/20 rounded-3xl border border-gray-100 dark:border-gray-800/50 flex items-center justify-center overflow-hidden relative">
             {/* Simulated Node Visualization for hotspots since actual map isn't in rechart */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/5 to-transparent pointer-events-none"></div>
             
             {data.cases_by_city.length > 0 ? (
               <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-12 p-8">
                 {data.cases_by_city.map((loc: any, idx: number) => {
                   const size = Math.max(80, Math.min(200, (loc.count / data.total_cases) * 400));
                   return (
                     <div key={idx} className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                        <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        <div className="absolute inset-2 rounded-full bg-blue-500/10 border border-blue-500/50"></div>
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center">
                           <span className="text-white font-black text-xl">{loc.count}</span>
                        </div>
                        <span className="absolute -bottom-8 whitespace-nowrap text-sm font-bold tracking-widest uppercase text-gray-700 dark:text-gray-300">
                          {loc.city}
                        </span>
                     </div>
                   )
                 })}
               </div>
             ) : (
                <div className="text-gray-400 font-medium tracking-widest uppercase">NO GEOGRAPHIC DATA</div>
             )}
          </div>
        </section>

        {/* INVESTIGATION ACTIVITY */}
        <section className="bg-white dark:bg-[#13151c] rounded-[2.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
           <div className="mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">INVESTIGATION TIMELINE</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Recent operational events</p>
          </div>
          
          <div className="max-w-4xl mx-auto pl-4">
             {data.timeline.length > 0 ? (
               <div className="relative border-l-2 border-gray-100 dark:border-gray-800 space-y-12 pb-4">
                 {data.timeline.map((item: any, idx: number) => (
                   <div key={idx} className="relative pl-10 group">
                      <div className="absolute -left-[13px] top-1 w-6 h-6 rounded-full bg-white dark:bg-[#13151c] border-4 border-blue-500 shadow-sm group-hover:scale-125 transition-transform"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">{item.event}</h4>
                        <span className="text-sm font-medium text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="text-center text-gray-400 font-medium py-10 uppercase tracking-widest">No recent activity</div>
             )}
          </div>
        </section>

        {/* VIDEO INTELLIGENCE ANALYTICS */}
        <section className="bg-white dark:bg-[#13151c] rounded-[2.5rem] p-10 lg:p-14 border border-gray-100 dark:border-gray-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">VIDEO INTELLIGENCE</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Detection signals across uploaded media</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-16 lg:gap-24">
             {Object.entries(data.video_analytics?.detections || {}).map(([objType, count]: any, idx: number) => (
               <div key={idx} className="flex flex-col items-center">
                 <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent border-l-transparent rotate-45"></div>
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{count}</span>
                 </div>
                 <span className="text-sm font-bold uppercase tracking-widest text-gray-500">{objType}</span>
               </div>
             ))}
             {Object.keys(data.video_analytics?.detections || {}).length === 0 && (
                <div className="text-center text-gray-400 font-medium uppercase tracking-widest w-full">NO VIDEO DETECTIONS</div>
             )}
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Analytics;
