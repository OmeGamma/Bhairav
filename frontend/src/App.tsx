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
import { NotificationProvider } from './components/contexts/NotificationContext';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg max-w-md w-full border border-light-border dark:border-dark-border">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Login to Bhairav</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input type="text" defaultValue="Officer" className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" defaultValue="security123" className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-gray-900 dark:text-white" />
          </div>
          <button onClick={() => window.location.href = '/dashboard'} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-light-accent dark:bg-dark-accent hover:bg-blue-600 focus:outline-none transition-colors">
             Access
          </button>
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
          <Route path="/analytics" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;

