import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Pages
// public
import LandingPage from './pages/public/LandingPage';
// auth
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/auth/OnboardingPage';
// shell components
import CommandCenter from './pages/command-center/CommandCenter';
import SecurityMap from './pages/security/SecurityMap';
import SecurityMonitoring from './pages/security/SecurityMonitoring';
import SecurityEvents from './pages/security/SecurityEvents';
import AttentionCenter from './pages/AttentionCenter';
import SearchPage from './pages/SearchPage';

// Member 2 Pages
import { Verification } from './pages/Verification';
import { VerificationHistory } from './pages/VerificationHistory';
import { NetworkIntelligence } from './pages/NetworkIntelligence';
import { PersonnelDashboard } from './pages/PersonnelDashboard';
import { WelfareCheckIn } from './pages/WelfareCheckIn';
import { SupportCenter } from './pages/SupportCenter';
import { AskBhairav } from './pages/AskBhairav';
import { ReportsDashboard } from './pages/ReportsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Authenticated Layout Routes */}
        <Route element={<AppLayout />}>
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/intelligence/search" element={<SearchPage />} />
          <Route path="/intelligence/events" element={<SecurityEvents />} />
          <Route path="/security/monitoring" element={<SecurityMonitoring />} />
          <Route path="/security/map" element={<SecurityMap />} />
          <Route path="/security/events/:id" element={<SecurityEvents />} />
          <Route path="/attention" element={<AttentionCenter />} />
          
          {/* Member 2 Routes */}
          <Route path="/verification" element={<Verification />} />
          <Route path="/verification/history" element={<VerificationHistory />} />
          
          <Route path="/network" element={<NetworkIntelligence />} />
          <Route path="/network/:entityId" element={<NetworkIntelligence />} />
          
          <Route path="/personnel" element={<PersonnelDashboard />} />
          <Route path="/personnel/check-in" element={<WelfareCheckIn />} />
          <Route path="/personnel/support" element={<SupportCenter />} />
          
          <Route path="/ask-bhairav" element={<AskBhairav />} />
          
          <Route path="/reports" element={<ReportsDashboard />} />
          
          <Route path="/settings" element={<div className="p-8 text-[var(--color-bhairav-text)]">Settings coming soon</div>} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
