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
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex items-center gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-md bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:border-[var(--color-bhairav-primary)]/50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-bhairav-text)] uppercase">Ask Bhairav</h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-bhairav-text-muted)] mt-1">Unified AI Assistant for Defence & Security Intelligence</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterface initialContext={mockContext} />
      </div>
    </div>
  );
};
