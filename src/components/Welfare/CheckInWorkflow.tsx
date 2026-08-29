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
      <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-8 max-w-lg w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-[var(--color-bhairav-verified)]/10 text-[var(--color-bhairav-verified)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-bhairav-verified)]/30">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[var(--color-bhairav-text)] uppercase tracking-wider mb-2">Check-in Complete</h3>
        <p className="text-[10px] text-[var(--color-bhairav-text-muted)] font-mono uppercase tracking-widest mb-6">Your response has been securely recorded.</p>
        <button 
          onClick={() => { setStep(1); setStatus(''); setFactors([]); setIsComplete(false); }}
          className="text-[var(--color-bhairav-primary)] text-[10px] font-bold uppercase tracking-widest hover:text-[var(--color-bhairav-primary-hover)] transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-6 md:p-8 max-w-lg w-full shadow-lg">
      <div className="flex items-center gap-3 mb-8 border-b border-[var(--color-bhairav-border)] pb-4">
        <svg className="w-6 h-6 text-[var(--color-bhairav-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <span className="text-[10px] font-bold text-[var(--color-bhairav-text-muted)] uppercase tracking-widest">Private & Secure Check-in</span>
      </div>

      {step === 1 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-[var(--color-bhairav-text)] uppercase tracking-tight mb-2">Good Evening</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mb-8 font-mono text-sm tracking-wide">How are things going?</p>
          
          <div className="flex flex-col gap-3">
            {['Good', 'Okay', 'Tired', 'Stressed', 'Difficult'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusSelect(s)}
                className="w-full text-left px-5 py-4 bg-[var(--color-bhairav-bg)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)]/50 rounded-lg text-[var(--color-bhairav-text)] transition-all uppercase tracking-wider font-medium text-sm focus:outline-none focus:border-[var(--color-bhairav-primary)]"
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
            className="text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
          
          <h2 className="text-xl font-bold text-[var(--color-bhairav-text)] uppercase tracking-tight mb-2">What is affecting you?</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mb-6 text-[10px] font-mono tracking-widest uppercase">Select any that apply</p>
          
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
                  className={`text-left px-4 py-3 rounded-lg border text-xs font-medium uppercase tracking-wider transition-all
                    ${isSelected 
                      ? 'bg-[var(--color-bhairav-primary)]/10 border-[var(--color-bhairav-primary)]/50 text-[var(--color-bhairav-primary)]' 
                      : 'bg-[var(--color-bhairav-bg)] border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] hover:border-[var(--color-bhairav-primary)]/30'
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
              className="flex-1 bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-[var(--color-bhairav-text)] font-bold uppercase tracking-widest text-xs py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Complete Check-in'}
            </button>
            <button 
              onClick={() => { setFactors(['Prefer not to say']); handleSubmit(); }}
              className="px-4 py-3 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
