import React, { useState, useRef, useEffect } from 'react';
import { AIMessage, AIContext, VoiceState } from '../../types/assistant';
import { VoiceMicrophoneBtn } from './VoiceMicrophoneBtn';
import { sendToBhairav } from '../../services/assistantService';

interface ChatInterfaceProps {
  initialContext?: AIContext;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialContext }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I am Bhairav, your AI intelligence assistant. How can I assist you with defence or security intelligence today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() && voiceState === 'IDLE') return;

    const userMsg: AIMessage = {
      id: `USR-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendToBhairav(userMsg.content, initialContext);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `ERR-${Date.now()}`,
        role: 'system',
        content: 'Connection to Bhairav AI services temporarily unavailable.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    if (voiceState === 'IDLE') {
      setVoiceState('LISTENING');
      // Simulate voice flow
      setTimeout(() => setVoiceState('PROCESSING'), 3000);
      setTimeout(() => {
        setVoiceState('RESPONDING');
        setMessages(prev => [...prev, {
          id: `VC-${Date.now()}`,
          role: 'user',
          content: '(Voice Input) Show me recent security events.',
          timestamp: new Date().toISOString()
        }]);
      }, 4500);
      setTimeout(() => {
        setVoiceState('IDLE');
        setMessages(prev => [...prev, {
          id: `VA-${Date.now()}`,
          role: 'assistant',
          content: 'Here are the recent security events in your sector.',
          timestamp: new Date().toISOString()
        }]);
      }, 6500);
    } else {
      setVoiceState('IDLE');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden relative shadow-sm">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[var(--color-bhairav-primary)] text-white rounded-br-sm' 
                : msg.role === 'system'
                  ? 'bg-[var(--color-bhairav-critical)]/10 border border-[var(--color-bhairav-critical)]/50 text-[var(--color-bhairav-critical)] rounded-bl-sm'
                  : 'bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] rounded-bl-sm'
            }`}>
              
              {/* Context/Role Indicator */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-[var(--color-bhairav-primary)] uppercase tracking-widest border-b border-[var(--color-bhairav-border)] pb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  BHAIRAV AI
                </div>
              )}
              
              {/* Content */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              
              {/* References */}
              {msg.references && msg.references.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[var(--color-bhairav-border)] flex flex-wrap gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-bhairav-text-muted)] w-full mb-1">References:</span>
                  {msg.references.map(ref => (
                    <span key={ref.id} className="text-xs bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] px-2 py-1 rounded text-[var(--color-bhairav-text-muted)] cursor-pointer hover:text-[var(--color-bhairav-primary)] transition-colors">
                      {ref.label}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-bhairav-border)] pt-3">
                  {msg.actions.map((act, i) => (
                    <button key={i} className="text-[10px] uppercase font-bold tracking-widest bg-[var(--color-bhairav-primary)]/10 hover:bg-[var(--color-bhairav-primary)]/20 text-[var(--color-bhairav-primary)] border border-[var(--color-bhairav-primary)]/30 px-3 py-1.5 rounded transition-colors">
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-2xl rounded-bl-sm p-4 w-16 flex justify-center items-center gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 bg-[var(--color-bhairav-text-muted)] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[var(--color-bhairav-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1.5 h-1.5 bg-[var(--color-bhairav-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Status Overlay */}
      {voiceState !== 'IDLE' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[var(--color-bhairav-bg)]/90 border border-[var(--color-bhairav-border)] backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--color-bhairav-text)] shadow-lg flex items-center gap-2 z-20">
          <div className="w-2 h-2 rounded-full bg-[var(--color-bhairav-primary)] animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          {voiceState === 'LISTENING' ? 'Listening...' : voiceState === 'PROCESSING' ? 'Processing...' : 'Responding...'}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-[var(--color-bhairav-surface-hover)] border-t border-[var(--color-bhairav-border)]">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <button className="p-3 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </button>
          
          <div className="flex-1 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] focus-within:border-[var(--color-bhairav-primary)] focus-within:shadow-[0_0_10px_rgba(59,130,246,0.1)] rounded-xl overflow-hidden transition-all flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Bhairav..."
              className="w-full bg-transparent px-4 py-3 text-sm text-[var(--color-bhairav-text)] focus:outline-none placeholder:text-[var(--color-bhairav-text-muted)]/50"
            />
            {input.trim() ? (
              <button onClick={handleSend} className="p-3 text-[var(--color-bhairav-primary)] hover:text-[var(--color-bhairav-primary-hover)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            ) : null}
          </div>

          <VoiceMicrophoneBtn state={voiceState} onClick={handleVoiceToggle} />
        </div>
        
        <div className="text-center mt-3">
          <p className="text-[10px] text-[var(--color-bhairav-text-muted)] uppercase tracking-widest font-mono">AI-generated analysis. Verify supporting records before making decisions.</p>
        </div>
      </div>
    </div>
  );
};
