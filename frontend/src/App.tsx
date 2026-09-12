import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AIAnalyzer from './components/AIAnalyzer';
import SuspectProfile from './components/SuspectProfile';
import CriminalNetwork from './components/CriminalNetwork';
import GeospatialIntelligence from './components/GeospatialIntelligence';
import Cases from './components/Cases';
import CaseForm from './components/CaseForm';
import CaseDetail from './components/CaseDetail';
import ReportView from './components/ReportView';
import ReportsList from './components/ReportsList';
import Profile from './components/Profile';
import DocumentIntelligence from './components/DocumentIntelligence';
import VideoReports from './pages/VideoReports';
import VideoReportDetail from './pages/VideoReportDetail';
import VideoIntelligence from './components/VideoIntelligence';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import Landing from './components/Landing';
import Analytics from './components/Analytics';
import { NotificationProvider } from './components/contexts/NotificationContext';

import { Shield, Lock } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0f111a] font-sans selection:bg-blue-500/30">
      
      {/* Left Side: Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-start justify-between p-12 overflow-hidden border-r border-gray-100 dark:border-gray-800/60 bg-gray-50 dark:bg-[#0a0c10]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <Shield className="w-10 h-10 text-blue-600 dark:text-blue-500" />
          <span className="text-2xl font-bold tracking-[0.2em] text-gray-900 dark:text-white">BHAIRAV</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Secure Intelligence Access
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
            Authorized personnel only. Access to Bhairav provides real-time criminal intelligence, predictive threat modeling, and advanced analytical capabilities.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-gray-500 dark:text-gray-500 tracking-wider uppercase">
          Bhairav — Made with Love in India : By OmeGamma
        </div>
      </div>

      {/* Right Side: Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-500" />
            <span className="text-2xl font-bold tracking-[0.2em] text-gray-900 dark:text-white">BHAIRAV</span>
          </div>

          <div className="bg-white dark:bg-[#161821] p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Please sign in to your secure workspace.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username or ID</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="Officer" 
                    className="block w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-[#0a0c10] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    defaultValue="security123" 
                    className="block w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-[#0a0c10] border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none" 
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Forgot credentials?</a>
              </div>

              <button 
                onClick={() => window.location.href = '/dashboard'} 
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#161821] transition-all shadow-lg shadow-blue-500/30"
              >
                 Sign In Securely
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8 max-w-sm mx-auto leading-relaxed">
            By signing in, you acknowledge that you are accessing a restricted intelligence system. All activities are monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-analyzer" element={<AIAnalyzer />} />
          <Route path="/suspect/:id" element={<SuspectProfile />} />
          <Route path="/criminal-network" element={<CriminalNetwork />} />
          <Route path="/geospatial" element={<GeospatialIntelligence />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/new" element={<CaseForm />} />
          <Route path="/cases/:caseId/edit" element={<CaseForm />} />
          <Route path="/cases/:caseId" element={<CaseDetail />} />
          <Route path="/report-preview" element={<ReportView />} />
          <Route path="/documents" element={<DocumentIntelligence />} />
          <Route path="/video-intelligence" element={<VideoIntelligence />} />
        <Route path="/video-reports" element={<VideoReports />} />
        <Route path="/video-reports/:id" element={<VideoReportDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<ReportsList />} />
          <Route path="/search" element={<AIAnalyzer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;

