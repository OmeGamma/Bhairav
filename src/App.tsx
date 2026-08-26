<<<<<<< HEAD
import React from 'react';
import { Member2Routes } from './routes/Member2Routes';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col">
      {/* Basic mock shell since Member 1 shell isn't here */}
      <header className="h-16 bg-[#12141a] border-b border-gray-800 flex items-center justify-between px-6">
        <div className="font-bold text-xl tracking-widest">BHAIRAV</div>
        <nav className="flex gap-4 text-sm text-gray-400">
          <Link to="/verification" className="hover:text-white transition-colors">Verification</Link>
          <Link to="/network" className="hover:text-white transition-colors">Network</Link>
          <Link to="/personnel" className="hover:text-white transition-colors">Personnel</Link>
          <Link to="/reports" className="hover:text-white transition-colors">Reports</Link>
          <Link to="/ask-bhairav" className="text-blue-400 hover:text-blue-300 transition-colors">Ask Bhairav</Link>
        </nav>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        <Member2Routes />
      </main>

      <footer className="h-8 bg-[#0b0c10] flex items-center justify-center">
        <span className="text-[10px] text-gray-600 opacity-60">Bhairav: Shadows and Steel - By OmeGamma</span>
      </footer>
    </div>
=======
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
          
          {/* Placeholders for future pages */}
          <Route path="/verification" element={<div className="p-8 text-[var(--color-bhairav-text)]">Verification coming soon</div>} />
          <Route path="/ask-bhairav" element={<div className="p-8 text-[var(--color-bhairav-text)]">Ask Bhairav coming soon</div>} />
          <Route path="/reports" element={<div className="p-8 text-[var(--color-bhairav-text)]">Reports coming soon</div>} />
          <Route path="/settings" element={<div className="p-8 text-[var(--color-bhairav-text)]">Settings coming soon</div>} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
>>>>>>> origin/feature/Aditya_frontend1
  );
}

export default App;
