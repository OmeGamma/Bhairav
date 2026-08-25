import React from 'react';
import { VoiceState } from '../../types/assistant';

interface VoiceMicrophoneBtnProps {
  state: VoiceState;
  onClick: () => void;
}

export const VoiceMicrophoneBtn: React.FC<VoiceMicrophoneBtnProps> = ({ state, onClick }) => {
  let btnClass = 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700';
  let pulseClass = '';
  
  if (state === 'LISTENING') {
    btnClass = 'bg-blue-600 text-white';
    pulseClass = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75';
  } else if (state === 'PROCESSING') {
    btnClass = 'bg-yellow-600 text-white';
    pulseClass = 'animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-yellow-400 border-t-transparent';
  } else if (state === 'RESPONDING') {
    btnClass = 'bg-green-600 text-white';
    pulseClass = 'animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50';
  } else if (state === 'ERROR') {
    btnClass = 'bg-red-600 text-white';
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
