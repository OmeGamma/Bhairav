import React, { useState } from 'react';
import { UploadDropzone } from '../components/Verification/UploadDropzone';
import { DocumentPreview } from '../components/Verification/DocumentPreview';
import { ExplainAnalysisModal } from '../components/Verification/ExplainAnalysisModal';
import { StatusBadge } from '../components/Shared/StatusBadge';
import { submitForVerification } from '../services/verificationService';
import { VerificationResult } from '../types/verification';

export const Verification: React.FC = () => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  const handleSubmit = async () => {
    if (!photoFile && !documentFile) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const res = await submitForVerification(photoFile, documentFile);
      setResult(res);
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPhotoFile(null);
    setDocumentFile(null);
    setResult(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
          <p className="text-gray-400 text-sm mt-1">Secure identity and document analysis workspace</p>
        </div>
        
        {/* Progress Flow UI */}
        <div className="hidden md:flex items-center text-xs text-gray-500 font-medium space-x-2">
          <span className={photoFile ? 'text-blue-400' : ''}>PHOTO</span>
          <span>→</span>
          <span className={documentFile ? 'text-blue-400' : ''}>DOCUMENT</span>
          <span>→</span>
          <span className={isProcessing ? 'text-blue-400 animate-pulse' : result ? 'text-green-400' : ''}>ANALYSIS</span>
          <span>→</span>
          <span className={result ? 'text-white' : ''}>REVIEW</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#12141a] border border-gray-800 rounded-lg p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-200 mb-4">Verification Subjects</h2>
            
            <div className="space-y-4">
              <UploadDropzone 
                label="Subject Photograph" 
                onFileSelect={setPhotoFile} 
                selectedFile={photoFile} 
                onClear={() => setPhotoFile(null)}
                accept="image/*"
                allowCamera={true}
              />
              
              <UploadDropzone 
                label="Identity Document" 
                onFileSelect={setDocumentFile} 
                selectedFile={documentFile} 
                onClear={() => setDocumentFile(null)}
                accept="image/*,application/pdf"
              />
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between">
              <button 
                onClick={resetForm}
                disabled={isProcessing || (!photoFile && !documentFile)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50"
              >
                Clear
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isProcessing || (!photoFile && !documentFile)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium rounded text-sm transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
          
          {/* Result Card */}
          {result && (
            <div className="bg-[#12141a] border border-gray-800 rounded-lg p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-base font-semibold text-gray-200">Verification Result</h2>
                <StatusBadge status={result.status} />
              </div>
              
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Information Consistency</span>
                  <span className="text-gray-200">{result.informationConsistency}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Photo Consistency</span>
                  <span className="text-gray-200">{result.photoConsistency}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Document Integrity</span>
                  <span className="text-gray-200">{result.documentIntegrity}%</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsExplainModalOpen(true)}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded text-sm font-medium transition-colors"
              >
                Explain Analysis
              </button>
            </div>
          )}
        </div>
        
        {/* Right Column: Preview & Analysis */}
        <div className="lg:col-span-7">
          <DocumentPreview 
            photoFile={photoFile} 
            documentFile={documentFile} 
            result={result}
            isProcessing={isProcessing}
          />
        </div>
      </div>
      
      {result && (
        <ExplainAnalysisModal 
          isOpen={isExplainModalOpen} 
          onClose={() => setIsExplainModalOpen(false)} 
          result={result} 
        />
      )}
    </div>
  );
};
