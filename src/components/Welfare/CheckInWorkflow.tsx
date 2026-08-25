import React, { useState } from 'react';
import { submitCheckIn } from '../../services/welfareService';

export const CheckInWorkflow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [factors, setFactors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleStatusSelect = (selectedStatus: string) => {
    setStatus(selectedStatus);
    setStep(2);
  };

  const toggleFactor = (factor: string) => {
    setFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitCheckIn(status, factors);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="bg-[#12141a] border border-gray-800 rounded-xl p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-900/50">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Check-in Complete</h3>
        <p className="text-sm text-gray-400 mb-6">Your response has been securely recorded.</p>
        <button 
          onClick={() => { setStep(1); setStatus(''); setFactors([]); setIsComplete(false); }}
          className="text-blue-400 text-sm hover:text-blue-300"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#12141a] border border-gray-800 rounded-xl p-6 md:p-8 max-w-lg w-full">
      <div className="flex items-center gap-3 mb-8">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Private & Secure Check-in</span>
      </div>

      {step === 1 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-light text-white mb-2">Good Evening</h2>
          <p className="text-gray-400 mb-8">How are things going?</p>
          
          <div className="flex flex-col gap-3">
            {['Good', 'Okay', 'Tired', 'Stressed', 'Difficult'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusSelect(s)}
                className="w-full text-left px-5 py-4 bg-[#1a1d24] hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-lg text-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <button 
            onClick={() => setStep(1)} 
            className="text-gray-500 hover:text-gray-300 flex items-center gap-1 text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
          
          <h2 className="text-xl font-light text-white mb-2">What is affecting you?</h2>
          <p className="text-gray-400 mb-6 text-sm">Select any that apply</p>
          
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              'Workload', 'Sleep / Rest', 'Operational Pressure', 'Family', 
              'Isolation', 'Physical Fatigue', 'Personal Concern', 'Something Else'
            ].map((f) => {
              const isSelected = factors.includes(f);
              return (
                <button
                  key={f}
                  onClick={() => toggleFactor(f)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-all
                    ${isSelected 
                      ? 'bg-blue-900/20 border-blue-500/50 text-blue-100' 
                      : 'bg-[#1a1d24] border-gray-800 text-gray-300 hover:border-gray-600'
                    }
                  `}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-white text-gray-900 font-medium py-3 rounded-lg transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Recording...' : 'Complete Check-in'}
            </button>
            <button 
              onClick={() => { setFactors(['Prefer not to say']); handleSubmit(); }}
              className="px-4 py-3 bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-400 rounded-lg text-sm transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
