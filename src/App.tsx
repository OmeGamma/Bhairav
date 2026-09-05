import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ScrollToTop } from './components/common/ScrollToTop';

// Public pages
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

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';

// Post-login home
import PostLoginHome from './pages/PostLoginHome';

// App pages
import CommandCenter from './pages/command-center/CommandCenter';
import SecurityMap from './pages/security/SecurityMap';
import SecurityMonitoring from './pages/security/SecurityMonitoring';
import SecurityEvents from './pages/security/SecurityEvents';
import AttentionCenter from './pages/AttentionCenter';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import { Verification } from './pages/Verification';
import { VerificationHistory } from './pages/VerificationHistory';
import { NetworkIntelligence } from './pages/NetworkIntelligence';
import { PersonnelDashboard } from './pages/PersonnelDashboard';
import { WelfareCheckIn } from './pages/WelfareCheckIn';
import { SupportCenter } from './pages/SupportCenter';
import AskBhairav from './pages/AskBhairav';
import { ReportsDashboard } from './pages/ReportsDashboard';
import TasksPage from './pages/TasksPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Single global layout for all routes */}
            <Route element={<AppLayout />}>

              {/* Public marketing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/data-protection" element={<DataProtectionPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/request-access" element={<RequestAccessPage />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signup" element={<RegisterPage />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                {/* Post-login home */}
                <Route path="/home" element={<PostLoginHome />} />

                {/* Primary */}
                <Route path="/command-center" element={<CommandCenter />} />
                <Route path="/command-centre" element={<CommandCenter />} />

                {/* Video Intelligence (IBVAP) */}
                <Route path="/security/map" element={<SecurityMap />} />
                <Route path="/security/monitoring" element={<SecurityMonitoring />} />
                <Route path="/security/events/:id" element={<SecurityEvents />} />
                <Route path="/intelligence/events" element={<SecurityEvents />} />
                <Route path="/attention" element={<AttentionCenter />} />

                {/* Criminal Network */}
                <Route path="/network" element={<NetworkIntelligence />} />
                <Route path="/network/:entityId" element={<NetworkIntelligence />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/verification/history" element={<VerificationHistory />} />
                <Route path="/document-verification" element={<Navigate to="/verification" replace />} />

                {/* Personnel & Operations */}
                <Route path="/personnel" element={<PersonnelDashboard />} />
                <Route path="/personnel-welfare" element={<Navigate to="/personnel" replace />} />
                <Route path="/personnel/check-in" element={<WelfareCheckIn />} />
                <Route path="/personnel/support" element={<SupportCenter />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/reports" element={<ReportsDashboard />} />
                <Route path="/maps-analytics" element={<Navigate to="/security/map" replace />} />

                {/* AI + utility */}
                <Route path="/ask-bhairav" element={<AskBhairav />} />
                <Route path="/ai-assistant" element={<Navigate to="/ask-bhairav" replace />} />
                <Route path="/intelligence/search" element={<SearchPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<Navigate to="/profile" replace />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
