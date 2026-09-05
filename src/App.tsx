import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ScrollToTop } from './components/common/ScrollToTop';
import { LoadingState } from './components/common/LoadingState';



const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const RequestAccessPage = lazy(() => import('./pages/public/RequestAccessPage'));
const SecurityPage = lazy(() => import('./pages/public/SecurityPage'));
const DataProtectionPage = lazy(() => import('./pages/public/DataProtectionPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/public/TermsOfServicePage'));
const CookiePolicyPage = lazy(() => import('./pages/public/CookiePolicyPage'));
const AccessibilityPage = lazy(() => import('./pages/public/AccessibilityPage'));

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const OnboardingPage = lazy(() => import('./pages/auth/OnboardingPage'));

const PostLoginHome = lazy(() => import('./pages/PostLoginHome'));

const CommandCenter = lazy(() => import('./pages/command-center/CommandCenter'));
const SecurityMap = lazy(() => import('./pages/security/SecurityMap'));
const SecurityMonitoring = lazy(() => import('./pages/security/SecurityMonitoring'));
const SecurityEvents = lazy(() => import('./pages/security/SecurityEvents'));
const AttentionCenter = lazy(() => import('./pages/AttentionCenter'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Verification = lazy(() => import('./pages/Verification'));
const VerificationHistory = lazy(() => import('./pages/VerificationHistory'));
const NetworkIntelligence = lazy(() => import('./pages/NetworkIntelligence'));
const PersonnelDashboard = lazy(() => import('./pages/PersonnelDashboard'));
const WelfareCheckIn = lazy(() => import('./pages/WelfareCheckIn'));
const SupportCenter = lazy(() => import('./pages/SupportCenter'));
const AskBhairav = lazy(() => import('./pages/AskBhairav'));
const ReportsDashboard = lazy(() => import('./pages/ReportsDashboard'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const EvidenceFiles = lazy(() => import('./pages/EvidenceFiles'));
const Cases = lazy(() => import('./pages/Cases'));

function RouteSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><LoadingState message="Loading…" /></div>}>
      {children}
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<RouteSuspense><LandingPage /></RouteSuspense>} />
              <Route path="/landing" element={<RouteSuspense><LandingPage /></RouteSuspense>} />
              <Route path="/about" element={<RouteSuspense><AboutPage /></RouteSuspense>} />
              <Route path="/contact" element={<RouteSuspense><ContactPage /></RouteSuspense>} />
              <Route path="/privacy" element={<RouteSuspense><PrivacyPolicyPage /></RouteSuspense>} />
              <Route path="/terms" element={<RouteSuspense><TermsOfServicePage /></RouteSuspense>} />
              <Route path="/cookies" element={<RouteSuspense><CookiePolicyPage /></RouteSuspense>} />
              <Route path="/accessibility" element={<RouteSuspense><AccessibilityPage /></RouteSuspense>} />
              <Route path="/data-protection" element={<RouteSuspense><DataProtectionPage /></RouteSuspense>} />
              <Route path="/security" element={<RouteSuspense><SecurityPage /></RouteSuspense>} />
              <Route path="/onboarding" element={<RouteSuspense><OnboardingPage /></RouteSuspense>} />
              <Route path="/request-access" element={<RouteSuspense><RequestAccessPage /></RouteSuspense>} />

              <Route path="/login" element={<RouteSuspense><LoginPage /></RouteSuspense>} />
              <Route path="/register" element={<RouteSuspense><RegisterPage /></RouteSuspense>} />
              <Route path="/signup" element={<RouteSuspense><RegisterPage /></RouteSuspense>} />

              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<RouteSuspense><PostLoginHome /></RouteSuspense>} />

                <Route path="/command-center" element={<RouteSuspense><CommandCenter /></RouteSuspense>} />
                <Route path="/command-centre" element={<RouteSuspense><CommandCenter /></RouteSuspense>} />

                <Route path="/security/map" element={<RouteSuspense><SecurityMap /></RouteSuspense>} />
                <Route path="/security/monitoring" element={<RouteSuspense><SecurityMonitoring /></RouteSuspense>} />
                <Route path="/security/events/:id" element={<RouteSuspense><SecurityEvents /></RouteSuspense>} />
                <Route path="/intelligence/events" element={<RouteSuspense><SecurityEvents /></RouteSuspense>} />
                <Route path="/attention" element={<RouteSuspense><AttentionCenter /></RouteSuspense>} />

                <Route path="/network" element={<RouteSuspense><NetworkIntelligence /></RouteSuspense>} />
                <Route path="/network/:entityId" element={<RouteSuspense><NetworkIntelligence /></RouteSuspense>} />
                <Route path="/verification" element={<RouteSuspense><Verification /></RouteSuspense>} />
                <Route path="/verification/history" element={<RouteSuspense><VerificationHistory /></RouteSuspense>} />
                <Route path="/document-verification" element={<Navigate to="/verification" replace />} />

                <Route path="/personnel" element={<RouteSuspense><PersonnelDashboard /></RouteSuspense>} />
                <Route path="/personnel-welfare" element={<Navigate to="/personnel" replace />} />
                <Route path="/personnel/check-in" element={<RouteSuspense><WelfareCheckIn /></RouteSuspense>} />
                <Route path="/personnel/support" element={<RouteSuspense><SupportCenter /></RouteSuspense>} />
                <Route path="/tasks" element={<RouteSuspense><TasksPage /></RouteSuspense>} />
                <Route path="/reports" element={<RouteSuspense><ReportsDashboard /></RouteSuspense>} />
                <Route path="/evidence" element={<RouteSuspense><EvidenceFiles /></RouteSuspense>} />
                <Route path="/cases" element={<RouteSuspense><Cases /></RouteSuspense>} />
                <Route path="/maps-analytics" element={<Navigate to="/security/map" replace />} />

                <Route path="/ask-bhairav" element={<RouteSuspense><AskBhairav /></RouteSuspense>} />
                <Route path="/ai-assistant" element={<Navigate to="/ask-bhairav" replace />} />
                <Route path="/intelligence/search" element={<RouteSuspense><SearchPage /></RouteSuspense>} />
                <Route path="/notifications" element={<RouteSuspense><NotificationsPage /></RouteSuspense>} />
                <Route path="/profile" element={<RouteSuspense><ProfilePage /></RouteSuspense>} />
                <Route path="/settings" element={<Navigate to="/profile" replace />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
