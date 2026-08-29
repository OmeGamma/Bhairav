import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ChatInterface } from '../components/Assistant/ChatInterface';
import { AIContext } from '../types/assistant';
import { BackButton } from '../components/common/BackButton';

export const AskBhairav: React.FC = () => {
  const navigate = useNavigate();
  const mockContext: AIContext = {
    entityType: 'person',
    entityId: 'BH-P-104'
  };

  return (
    <div className=" flex flex-col">
      <div className="mb-6 flex items-center gap-4 border-b border-[var(--color-bhairav-border)] pb-4">
        <BackButton />
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
