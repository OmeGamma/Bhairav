import React from 'react';
import { VoiceState } from '../../types/assistant';

interface VoiceMicrophoneBtnProps {
  state: VoiceState;
  onClick: () => void;
}

export const VoiceMicrophoneBtn: React.FC<VoiceMicrophoneBtnProps> = ({ state, onClick }) => {
  let btnClass = 'bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)]';
  let pulseClass = '';
  
  if (state === 'LISTENING') {
    btnClass = 'bg-[var(--color-bhairav-primary)] text-white border-[var(--color-bhairav-primary)]';
    pulseClass = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-bhairav-primary)] opacity-50';
  } else if (state === 'PROCESSING') {
    btnClass = 'bg-[var(--color-bhairav-warning)] text-white border-[var(--color-bhairav-warning)]';
    pulseClass = 'animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-[var(--color-bhairav-warning)] border-t-transparent';
  } else if (state === 'RESPONDING') {
    btnClass = 'bg-[var(--color-bhairav-verified)] text-white border-[var(--color-bhairav-verified)]';
    pulseClass = 'animate-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--color-bhairav-verified)] opacity-30';
  } else if (state === 'ERROR') {
    btnClass = 'bg-[var(--color-bhairav-critical)] text-white border-[var(--color-bhairav-critical)]';
  }

  return (
    <div className="relative flex items-center justify-center">
      {pulseClass && <span className={pulseClass}></span>}
      <button 
        onClick={onClick}
        className={`relative z-10 p-3 rounded-full transition-colors flex items-center justify-center shadow-lg ${btnClass}`}
        title={state === 'IDLE' ? 'Tap to speak' : state}
      >
        {state === 'ERROR' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
        )}
      </button>
    </div>
  );
};
