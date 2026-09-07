import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BrainCircuit, Video, Network, Map, FileSearch, FileText, Bell, BarChart, ArrowRight, Play, Pause } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden">
      {/* Navbar */}
      <nav className="w-full py-4 px-6 flex items-center justify-between bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-light-border dark:border-dark-border z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-light-accent dark:text-dark-accent" />
          <span className="text-2xl font-bold tracking-wider">BHAIRAV</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
        >
          Access Bhairav
        </button>
      </nav>

      {/* Hero + Slider */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-light-accent to-purple-600 dark:from-dark-accent dark:to-purple-400">
            AI-Powered Intelligence for a Safer World
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Analyze criminal intelligence, investigate connected networks, understand crime patterns and extract actionable insights from video evidence using AI.
          </p>

          {/* Feature Slider */}
          <div
            className="relative bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border p-8 md:p-12 text-left"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{feature.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{feature.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <button onClick={next} className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dashboard Preview Mock */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded ml-2" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-24 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-6 w-10 bg-light-accent/20 dark:bg-dark-accent/20 rounded" />
                </div>
                <div className="h-24 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-6 w-10 bg-purple-500/20 rounded" />
                </div>
                <div className="h-24 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
                  <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-6 w-10 bg-green-500/20 rounded" />
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all ${idx === current ? 'w-6 bg-light-accent dark:bg-dark-accent' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-light-accent dark:bg-dark-accent text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center"
            >
              Access Bhairav <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;