import { ChatInterface } from '../components/Assistant/ChatInterface';
import type { AIContext } from '../types/assistant';
import { Sparkles } from 'lucide-react';

const MOCK_CONTEXT: AIContext = {
  entityType: 'person',
  entityId: 'BH-P-104',
};

export default function AskBhairav() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6 border-b border-[var(--color-bhairav-border)] pb-4">
        <div className="flex items-center gap-3 mb-1.5">
          <Sparkles size={18} className="text-[var(--color-bhairav-primary)]" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--color-bhairav-primary)]">
            BHAIRAV AI
          </p>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-bhairav-text)]">
          Ask BHAIRAV
        </h1>
        <p className="text-sm text-[var(--color-bhairav-text-muted)] mt-1.5 max-w-2xl">
          Unified AI assistant for defence and security intelligence. Ask in plain English about
          cameras, persons, vehicles, events, or cases. Optional web search pulls live public intel.
        </p>
      </div>

      <div className="flex-1 min-h-[600px]">
        <ChatInterface initialContext={MOCK_CONTEXT} />
      </div>
    </div>
  );
}
