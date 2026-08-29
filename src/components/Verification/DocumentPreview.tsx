import React, { useState, useEffect } from 'react';
import { VerificationResult } from '../../types/verification';

interface DocumentPreviewProps {
  photoFile: File | null;
  documentFile: File | null;
  result: VerificationResult | null;
  isProcessing: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  photoFile, 
  documentFile, 
  result, 
  isProcessing 
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPhotoUrl(null);
    }
  }, [photoFile]);

  useEffect(() => {
    if (documentFile) {
      const url = URL.createObjectURL(documentFile);
      setDocumentUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setDocumentUrl(null);
    }
  }, [documentFile]);

  return (
    <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="bg-[var(--color-bhairav-surface-hover)] p-3 border-b border-[var(--color-bhairav-border)] flex justify-between items-center">
        <h3 className="text-sm font-medium text-[var(--color-bhairav-text)] flex items-center gap-2 uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          Secure Document Viewer
        </h3>
        {isProcessing && (
          <span className="text-xs text-[var(--color-bhairav-primary)] font-bold uppercase tracking-wider animate-pulse">Analyzing securely...</span>
        )}
      </div>
      
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto relative">
        {(!photoUrl && !documentUrl) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-bhairav-text-muted)]">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-sm">Upload files to view preview</p>
          </div>
        ) : (
          <>
            {isProcessing && (
              <div className="absolute inset-0 bg-[var(--color-bhairav-bg)]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--color-bhairav-primary)]/30 border-t-[var(--color-bhairav-primary)] rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--color-bhairav-primary)] text-sm font-medium uppercase tracking-wider">Extracting Information</p>
                <div className="w-48 h-1 bg-[var(--color-bhairav-surface)] mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-bhairav-primary)] animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {photoUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-[var(--color-bhairav-text-muted)] font-medium uppercase tracking-wider">Subject Photo</p>
                  <div className="relative aspect-square md:aspect-auto md:h-48 bg-[#0b0e11] rounded border border-[var(--color-bhairav-border)] overflow-hidden flex items-center justify-center">
                    <img src={photoUrl} alt="Subject" className="max-w-full max-h-full object-contain" />
                    {result && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur p-2 text-center text-xs">
                        Face Match: <span className="text-[var(--color-bhairav-verified)] font-data">{result.photoConsistency}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {documentUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-[var(--color-bhairav-text-muted)] font-medium uppercase tracking-wider">Identity Document</p>
                  <div className="relative aspect-[4/3] md:h-48 bg-[#0b0e11] rounded border border-[var(--color-bhairav-border)] overflow-hidden flex items-center justify-center">
                    {documentFile?.type === 'application/pdf' ? (
                      <div className="flex flex-col items-center text-[var(--color-bhairav-text-muted)]">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-xs uppercase tracking-wider">PDF Preview Ready</span>
                      </div>
                    ) : (
                      <img src={documentUrl} alt="Document" className="max-w-full max-h-full object-contain" />
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {result?.extractedData && (
              <div className="mt-4 border-t border-[var(--color-bhairav-border)] pt-4">
                <p className="text-xs text-[var(--color-bhairav-text-muted)] font-medium uppercase tracking-wider mb-3">Extracted Metadata</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--color-bhairav-text-muted)] block text-xs">Name</span>
                    <span className="text-[var(--color-bhairav-text)] font-data">{result.extractedData.name}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-bhairav-text-muted)] block text-xs">Document #</span>
                    <span className="text-[var(--color-bhairav-text)] font-data">{result.extractedData.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-bhairav-text-muted)] block text-xs">Date of Birth</span>
                    <span className="text-[var(--color-bhairav-text)] font-data">{result.extractedData.dob}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-bhairav-text-muted)] block text-xs">Nationality</span>
                    <span className="text-[var(--color-bhairav-text)] font-data">{result.extractedData.nationality}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
