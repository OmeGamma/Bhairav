import React, { useState } from 'react';
import { UploadDropzone } from '../components/Verification/UploadDropzone';
import { DocumentPreview } from '../components/Verification/DocumentPreview';
import { ExplainAnalysisModal } from '../components/Verification/ExplainAnalysisModal';
import { submitForVerification } from '../services/verificationService';
import { VerificationResult } from '../types/verification';
import { Badge } from '../components/common/Badge';

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
    <div className="space-y-6 flex flex-col min-">
      <div className="flex justify-between items-end border-b border-[var(--color-bhairav-border)] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">Identity Verification</h2>
          <p className="text-[var(--color-bhairav-text-muted)] mt-1">Secure identity and document analysis workspace</p>
        </div>
        
        {/* Progress Flow UI */}
        <div className="hidden md:flex items-center text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] space-x-3">
          <span className={photoFile ? 'text-[var(--color-bhairav-primary)] font-bold' : ''}>Photo</span>
          <span>→</span>
          <span className={documentFile ? 'text-[var(--color-bhairav-primary)] font-bold' : ''}>Document</span>
          <span>→</span>
          <span className={isProcessing ? 'text-[var(--color-bhairav-primary)] animate-pulse font-bold' : result ? 'text-[var(--color-bhairav-verified)] font-bold' : ''}>Analysis</span>
          <span>→</span>
          <span className={result ? 'text-[var(--color-bhairav-text)] font-bold' : ''}>Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Upload */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-[var(--color-bhairav-text)] mb-4">Verification Subjects</h3>
            
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
            
            <div className="mt-6 pt-4 border-t border-[var(--color-bhairav-border)] flex justify-between items-center">
              <button 
                onClick={resetForm}
                disabled={isProcessing || (!photoFile && !documentFile)}
                className="px-4 py-2 text-sm text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] disabled:opacity-50 transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isProcessing || (!photoFile && !documentFile)}
                className="px-6 py-2 bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] disabled:bg-[var(--color-bhairav-surface-hover)] disabled:text-[var(--color-bhairav-text-muted)] text-[var(--color-bhairav-text)] font-medium rounded text-sm transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
          
          {/* Result Card */}
          {result && (
            <div className={`bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 severity-notch-${result.status === 'VERIFIED' ? 'verified' : result.status === 'REVIEW REQUIRED' ? 'warning' : result.status === 'ANOMALY DETECTED' ? 'critical' : 'neutral'}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-[var(--color-bhairav-text)]">Verification Result</h3>
                <Badge status={result.status === 'VERIFIED' ? 'verified' : result.status === 'REVIEW REQUIRED' ? 'warning' : result.status === 'ANOMALY DETECTED' ? 'critical' : 'neutral'}>
                  {result.status}
                </Badge>
              </div>
              
              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-bhairav-text-muted)]">Information Consistency</span>
                  <span className="font-data text-[var(--color-bhairav-text)]">{result.informationConsistency}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-bhairav-text-muted)]">Photo Consistency</span>
                  <span className="font-data text-[var(--color-bhairav-text)]">{result.photoConsistency}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-bhairav-text-muted)]">Document Integrity</span>
                  <span className="font-data text-[var(--color-bhairav-text)]">{result.documentIntegrity}%</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsExplainModalOpen(true)}
                className="w-full py-2 bg-[var(--color-bhairav-bg)] hover:bg-[var(--color-bhairav-surface-hover)] border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] rounded text-sm font-medium transition-colors"
              >
                Explain Analysis
              </button>
            </div>
          )}
        </div>
        
        {/* Right Column: Preview & Analysis */}
        <div className="lg:col-span-7 h-full">
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
