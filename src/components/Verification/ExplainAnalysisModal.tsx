import React from 'react';
import { VerificationResult } from '../../types/verification';

interface ExplainAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult;
}

export const ExplainAnalysisModal: React.FC<ExplainAnalysisModalProps> = ({ isOpen, onClose, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#12141a] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-[#16181f] flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Analysis Explanation
            </h2>
            <p className="text-xs text-gray-400 mt-1">Verification ID: {result.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 bg-gray-800 hover:bg-gray-700 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-2">Primary Reasons</h3>
            <ul className="space-y-2">
              {result.reasons.map((reason, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Confidence Metrics</h3>
          
          <div className="space-y-4">
            {/* Metric 1 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Document Readability</span>
                <span className="text-white font-mono">{result.documentReadability}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${result.documentReadability > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                  style={{ width: `${result.documentReadability}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Legibility of text and security features extracted from the document image.</p>
            </div>
            
            {/* Metric 2 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Information Consistency</span>
                <span className="text-white font-mono">{result.informationConsistency}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${result.informationConsistency > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                  style={{ width: `${result.informationConsistency}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Cross-referencing of extracted text fields against known database patterns.</p>
            </div>
            
            {/* Metric 3 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Photo Consistency</span>
                <span className="text-white font-mono">{result.photoConsistency}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${result.photoConsistency > 85 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                  style={{ width: `${result.photoConsistency}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Biometric matching between provided subject photo and document portrait.</p>
            </div>
            
            {/* Metric 4 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Document Integrity</span>
                <span className="text-white font-mono">{result.documentIntegrity}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${result.documentIntegrity > 90 ? 'bg-green-500' : result.documentIntegrity > 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  style={{ width: `${result.documentIntegrity}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Detection of digital alteration, forgery patterns, or invalid template structures.</p>
            </div>
          </div>
          
          <div className="mt-8 p-3 bg-blue-900/10 border border-blue-900/30 rounded flex gap-3 text-sm">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-blue-200/70">
              AI-generated analysis. Verify supporting records before making decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
