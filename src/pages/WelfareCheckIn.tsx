import React from 'react';
import { CheckInWorkflow } from '../components/Welfare/CheckInWorkflow';

export const WelfareCheckIn: React.FC = () => {
  return (
    <div className="min- flex flex-col items-center justify-center p-6">
      <CheckInWorkflow />
      
      <div className="mt-12 text-center max-w-md">
        <p className="text-[10px] text-[var(--color-bhairav-text-muted)] font-bold uppercase tracking-widest leading-relaxed opacity-70">
          This system is private and secure. Information is only shared with authorized welfare personnel in accordance with protocol.
        </p>
      </div>
    </div>
  );
};
