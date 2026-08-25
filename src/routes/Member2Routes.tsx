import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Verification
import { Verification } from '../pages/Verification';
import { VerificationHistory } from '../pages/VerificationHistory';

// Network
import { NetworkIntelligence } from '../pages/NetworkIntelligence';

// Welfare
import { PersonnelDashboard } from '../pages/PersonnelDashboard';
import { WelfareCheckIn } from '../pages/WelfareCheckIn';
import { SupportCenter } from '../pages/SupportCenter';

// Assistant
import { AskBhairav } from '../pages/AskBhairav';

// Reports
import { ReportsDashboard } from '../pages/ReportsDashboard';

/**
 * Member 2 Routes
 * These routes should be nested within the main application shell
 * provided by Member 1.
 */
export const Member2Routes: React.FC = () => {
  return (
    <Routes>
      {/* Verification */}
      <Route path="/verification" element={<Verification />} />
      <Route path="/verification/history" element={<VerificationHistory />} />
      
      {/* Network Intelligence */}
      <Route path="/network" element={<NetworkIntelligence />} />
      <Route path="/network/:entityId" element={<NetworkIntelligence />} />
      
      {/* Personnel Welfare */}
      <Route path="/personnel" element={<PersonnelDashboard />} />
      <Route path="/personnel/check-in" element={<WelfareCheckIn />} />
      <Route path="/personnel/support" element={<SupportCenter />} />
      
      {/* Ask Bhairav AI */}
      <Route path="/ask-bhairav" element={<AskBhairav />} />
      
      {/* Reports */}
      <Route path="/reports" element={<ReportsDashboard />} />
    </Routes>
  );
};
