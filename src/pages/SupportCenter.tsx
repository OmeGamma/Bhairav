import React, { useState } from 'react';
import { SupportCategoryGrid } from '../components/Welfare/SupportCategoryGrid';
import { ContextDrawer } from '../components/Shared/ContextDrawer';
import { submitSupportRequest } from '../services/welfareService';
import { Timeline, TimelineEvent } from '../components/Shared/Timeline';

export const SupportCenter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setRequestSubmitted(false);
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const result = await submitSupportRequest(selectedCategory, message);
      setRequestId(result.id);
      setRequestSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineEvents: TimelineEvent[] = requestSubmitted ? [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      title: 'Request Created',
      description: `Support request ${requestId} submitted.`,
      status: 'PENDING'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() + 60000).toISOString(),
      title: 'Assigned for Review',
      description: 'Request has been queued for appropriate personnel.',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  ] : [];

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-end border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-bhairav-text)] uppercase">Personnel Support Center</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Request professional, medical, or welfare support</p>
        </div>
      </div>

      <SupportCategoryGrid onSelect={handleSelectCategory} />

      <ContextDrawer 
        isOpen={!!selectedCategory} 
        onClose={() => setSelectedCategory(null)}
        title="Support Request"
        subtitle={selectedCategory || ''}
      >
        {!requestSubmitted ? (
          <div className="space-y-6">
            <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-md p-4 text-sm text-[var(--color-bhairav-text-muted)] uppercase tracking-wider">
              You are requesting support for: <span className="font-semibold text-[var(--color-bhairav-text)]">{selectedCategory}</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--color-bhairav-text-muted)] mb-2 uppercase tracking-widest">
                Additional Context (Optional)
              </label>
              <textarea 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide any additional information..."
                className="w-full bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-lg p-3 text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)] transition-colors resize-none placeholder:text-[var(--color-bhairav-text-muted)]/50"
              ></textarea>
            </div>

            <div className="bg-[var(--color-bhairav-primary)]/10 border border-[var(--color-bhairav-primary)]/30 rounded-md p-3 text-xs text-[var(--color-bhairav-primary)] uppercase tracking-wider font-medium leading-relaxed">
              This request will be routed to the appropriate authorized personnel. Your privacy will be maintained in accordance with standard protocol.
            </div>

            <div className="pt-4 flex gap-3 border-t border-[var(--color-bhairav-border)]">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-transparent text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors uppercase tracking-widest font-bold text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-[var(--color-bhairav-text)] rounded font-medium transition-colors disabled:opacity-50 uppercase tracking-widest text-sm py-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-[var(--color-bhairav-verified)]/10 border border-[var(--color-bhairav-verified)]/30 rounded-lg p-5 text-center">
              <h3 className="text-lg font-medium text-[var(--color-bhairav-verified)] mb-1 uppercase tracking-wider">Request Submitted</h3>
              <p className="text-sm text-[var(--color-bhairav-text-muted)]">Request ID: <span className="font-data text-[var(--color-bhairav-text)]">{requestId}</span></p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--color-bhairav-border)] pb-2">Status Tracking</h4>
              <Timeline events={timelineEvents} />
            </div>

            <div className="pt-4 border-t border-[var(--color-bhairav-border)]">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-full py-2 bg-[var(--color-bhairav-surface)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] rounded transition-colors uppercase tracking-widest text-sm font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ContextDrawer>
    </div>
  );
};
