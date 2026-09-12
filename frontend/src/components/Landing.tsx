import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BrainCircuit, Video, Network, Map, FileSearch, FileText, Bell, BarChart, ArrowRight, Play, Pause, ChevronRight } from 'lucide-react';

const features = [
  {
    title: 'AI Criminal Analyzer',
    description: 'Natural language intelligence queries with grounded database search and AI-assisted summarization.',
    icon: BrainCircuit,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Video Intelligence',
    description: 'Upload footage for automated event detection, timeline analysis, and evidence linking.',
    icon: Video,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Criminal Network',
    description: 'Visualize associations between suspects, cases, locations, and evidence in an interactive graph.',
    icon: Network,
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    title: 'Geospatial Intelligence',
    description: 'Interactive map with case markers, hotspot zones, and location-based filtering.',
    icon: Map,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Document Intelligence',
    description: 'Upload case documents to extract structured intelligence entities using AI.',
    icon: FileSearch,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Case Intelligence Reports',
    description: 'Generate professional PDF reports with case details, evidence, and AI-assisted analysis.',
    icon: FileText,
    gradient: 'from-gray-700 to-gray-900',
  },
  {
    title: 'Real-time Notifications',
    description: 'Stay updated with case creation, updates, closures, and document processing alerts.',
    icon: Bell,
    gradient: 'from-red-500 to-orange-500',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Comprehensive analytics on cases by city, crime type, priority, and temporal trends.',
    icon: BarChart,
    gradient: 'from-teal-500 to-cyan-600',
  },
];

const Landing: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const next = () => setCurrent((prev) => (prev + 1) % features.length);
  const prev = () => setCurrent((prev) => (prev - 1 + features.length) % features.length);

  const feature = features[current];
  const Icon = feature.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0f111a] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="w-full py-5 px-8 flex items-center justify-between bg-white/80 dark:bg-[#0f111a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/60 sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <span className="text-xl font-bold tracking-[0.2em]">BHAIRAV</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden border-b border-gray-200 dark:border-gray-800/60">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Online
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            AI-POWERED <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              INTELLIGENCE PLATFORM
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Analyze criminal intelligence, investigate connected networks, and extract actionable insights from video evidence using advanced artificial intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center group"
            >
              ENTER BHAIRAV 
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#1a1c23] hover:bg-gray-50 dark:hover:bg-[#22252e] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-full font-semibold transition-all shadow-sm"
            >
              EXPLORE CAPABILITIES
            </button>
          </div>
        </div>
      </section>

      {/* Main Capabilities Grid */}
      <section id="capabilities" className="py-24 px-6 bg-white dark:bg-[#0a0c10]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Core Intelligence Modules</h2>
             <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Integrated tools designed for modern investigative workflows.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {features.slice(0, 6).map((feat, idx) => {
               const FIcon = feat.icon;
               return (
                 <div key={idx} className="p-8 rounded-2xl bg-gray-50 dark:bg-[#13151c] border border-gray-100 dark:border-gray-800/80 hover:border-blue-500/30 transition-colors group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-6 shadow-md`}>
                      <FIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feat.description}</p>
                 </div>
               );
             })}
          </div>
        </div>
      </section>

      {/* Feature Slider Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-[#0f111a] border-t border-gray-200 dark:border-gray-800/60 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Interactive Workflow</h2>
          </div>

          <div
            className="relative bg-white dark:bg-[#161821] rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-gray-700/50 p-8 md:p-14 transition-all duration-500"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                  <Icon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{feature.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">{feature.description}</p>
                </div>
              </div>
              <div className="flex gap-3 self-end md:self-auto shrink-0">
                <button onClick={prev} className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <ArrowRight className="w-6 h-6 rotate-180 text-gray-700 dark:text-gray-300" />
                </button>
                <button onClick={next} className="p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <ArrowRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Dashboard Preview Mock Container */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-[#0a0c10] p-6 mt-8 overflow-hidden shadow-inner">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full ml-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-32 bg-white dark:bg-[#1a1c23] rounded-lg border border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between">
                  <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-10 w-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-md" />
                </div>
                <div className="h-32 bg-white dark:bg-[#1a1c23] rounded-lg border border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between">
                  <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-10 w-24 bg-purple-500/10 dark:bg-purple-500/20 rounded-md" />
                </div>
                <div className="h-32 bg-white dark:bg-[#1a1c23] rounded-lg border border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between">
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-10 w-20 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-md" />
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex items-center justify-between mt-10">
               <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
               <div className="flex items-center justify-center gap-3">
                 {features.map((_, idx) => (
                   <button
                     key={idx}
                     onClick={() => setCurrent(idx)}
                     className={`h-2 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-blue-600 dark:bg-blue-500' : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'}`}
                     aria-label={`Go to slide ${idx + 1}`}
                   />
                 ))}
               </div>
               <div className="w-9" /> {/* Spacer to center dots */}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="py-24 px-6 bg-blue-600 dark:bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
           <Shield className="w-16 h-16 mx-auto mb-8 text-blue-200" />
           <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to deploy intelligence?</h2>
           <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
             Secure access is restricted to authorized personnel only. Ensure your credentials are ready.
           </p>
           <button
             onClick={() => navigate('/login')}
             className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-xl flex items-center justify-center mx-auto group"
           >
             Proceed to Login
             <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white dark:bg-[#0a0c10] border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">
          Bhairav — Made with Love in India : By OmeGamma
        </p>
      </footer>
    </div>
  );
};

export default Landing;