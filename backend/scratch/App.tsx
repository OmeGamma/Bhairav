import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
// public
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import RequestAccessPage from './pages/public/RequestAccessPage';
import SecurityPage from './pages/public/SecurityPage';
import DataProtectionPage from './pages/public/DataProtectionPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsOfServicePage from './pages/public/TermsOfServicePage';
import CookiePolicyPage from './pages/public/CookiePolicyPage';
import AccessibilityPage from './pages/public/AccessibilityPage';
// auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
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
import { Home } from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public layout: footer, no navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          <Route path="/request-access" element={<RequestAccessPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/data-protection" element={<DataProtectionPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
          </Route>

          {/* Auth pages: standalone, no footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          
          {/* Protected layout - top nav + scrolling pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/command-center" element={<CommandCenter />} />
              <Route path="/command-centre" element={<CommandCenter />} />
              <Route path="/intelligence/search" element={<SearchPage />} />
              <Route path="/intelligence/events" element={<SecurityEvents />} />
              <Route path="/security/monitoring" element={<SecurityMonitoring />} />
              <Route path="/security/map" element={<SecurityMap />} />
              <Route path="/security/events/:id" element={<SecurityEvents />} />
              <Route path="/attention" element={<AttentionCenter />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
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
              
              <Route path="/settings" element={<Navigate to="/profile" replace />} />
            </Route>
          </Route>
          
          {/* Fallback - redirect unauthenticated to landing, authenticated to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
