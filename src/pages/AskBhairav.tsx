import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ChatInterface } from '../components/Assistant/ChatInterface';
import { AIContext } from '../types/assistant';

export const AskBhairav: React.FC = () => {
  const navigate = useNavigate();
  const mockContext: AIContext = {
    entityType: 'person',
    entityId: 'BH-P-104'
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0b0c10] flex flex-col p-4 md:p-6">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/command-center')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Ask Bhairav</h1>
          <p className="text-gray-400 text-sm mt-1">Unified AI Assistant for Defence & Security Intelligence</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterface initialContext={mockContext} />
      </div>
    </div>
  );
};
