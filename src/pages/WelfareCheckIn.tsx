import React from 'react';
import { CheckInWorkflow } from '../components/Welfare/CheckInWorkflow';

export const WelfareCheckIn: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b0c10] flex flex-col items-center justify-center p-6">
      <CheckInWorkflow />
      
      <div className="mt-12 text-center max-w-md">
        <p className="text-xs text-gray-500">
          This system is private and secure. Information is only shared with authorized welfare personnel in accordance with protocol.
        </p>
      </div>
    </div>
  );
};
