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
    <div className="flex flex-col h-full bg-[#0b0c10] border border-gray-800 rounded-xl overflow-hidden relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : msg.role === 'system'
                  ? 'bg-red-900/20 border border-red-900/50 text-red-200 rounded-bl-sm'
                  : 'bg-[#1a1d24] border border-gray-800 text-gray-200 rounded-bl-sm'
            }`}>
              
              {/* Context/Role Indicator */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
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
                <div className="mt-4 pt-3 border-t border-gray-700 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 w-full mb-1">References:</span>
                  {msg.references.map(ref => (
                    <span key={ref.id} className="text-xs bg-gray-900 border border-gray-700 px-2 py-1 rounded text-gray-400 cursor-pointer hover:text-blue-400 transition-colors">
                      {ref.label}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {msg.actions.map((act, i) => (
                    <button key={i} className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-900/50 px-3 py-1.5 rounded transition-colors">
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
            <div className="bg-[#1a1d24] border border-gray-800 rounded-2xl rounded-bl-sm p-4 w-16 flex justify-center items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Status Overlay */}
      {voiceState !== 'IDLE' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 border border-gray-700 backdrop-blur px-4 py-2 rounded-full text-xs font-medium text-white shadow-lg flex items-center gap-2 z-20">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          {voiceState === 'LISTENING' ? 'Listening...' : voiceState === 'PROCESSING' ? 'Processing...' : 'Responding...'}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-[#16181f] border-t border-gray-800">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <button className="p-3 text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </button>
          
          <div className="flex-1 bg-[#12141a] border border-gray-700 focus-within:border-blue-500 rounded-xl overflow-hidden transition-colors flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Bhairav..."
              className="w-full bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder-gray-500"
            />
            {input.trim() ? (
              <button onClick={handleSend} className="p-3 text-blue-500 hover:text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            ) : null}
          </div>

          <VoiceMicrophoneBtn state={voiceState} onClick={handleVoiceToggle} />
        </div>
        
        <div className="text-center mt-3">
          <p className="text-[10px] text-gray-600">AI-generated analysis. Verify supporting records before making decisions.</p>
        </div>
      </div>
    </div>
  );
};
