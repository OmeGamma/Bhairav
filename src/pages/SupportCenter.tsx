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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Personnel Support Center</h1>
        <p className="text-gray-400 text-sm mt-1">Request professional, medical, or welfare support</p>
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
            <div className="bg-gray-900/50 border border-gray-800 rounded p-4 text-sm text-gray-300">
              You are requesting support for: <span className="font-semibold text-white">{selectedCategory}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Additional Context (Optional)
              </label>
              <textarea 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide any additional information..."
                className="w-full bg-[#1a1d24] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div className="bg-blue-900/10 border border-blue-900/30 rounded p-3 text-xs text-blue-200/70">
              This request will be routed to the appropriate authorized personnel. Your privacy will be maintained in accordance with standard protocol.
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-transparent text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-5 text-center">
              <h3 className="text-lg font-medium text-green-400 mb-1">Request Submitted</h3>
              <p className="text-sm text-gray-400">Request ID: <span className="font-mono text-gray-300">{requestId}</span></p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4">Status Tracking</h4>
              <Timeline events={timelineEvents} />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
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
