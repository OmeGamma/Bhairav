import React from 'react';
import { ChatInterface } from '../components/Assistant/ChatInterface';
import { AIContext } from '../types/assistant';

export const AskBhairav: React.FC = () => {
  // Mock context - in a real app, this might come from routing or global state
  const mockContext: AIContext = {
    entityType: 'person',
    entityId: 'BH-P-104'
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0b0c10] flex flex-col p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Ask Bhairav</h1>
        <p className="text-gray-400 text-sm mt-1">Unified AI Assistant for Defence & Security Intelligence</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterface initialContext={mockContext} />
      </div>
    </div>
  );
};
