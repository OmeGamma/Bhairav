import React, { useRef, useState } from 'react';

interface UploadDropzoneProps {
  label: string;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  accept?: string;
  allowCamera?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ 
  label, 
  onFileSelect, 
  selectedFile, 
  onClear,
  accept = "image/*,application/pdf",
  allowCamera = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraPlaceholder, setShowCameraPlaceholder] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (showCameraPlaceholder) {
    return (
      <div className="bg-[#1a1d24] border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center min-h-[250px]">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <p className="text-gray-400 mb-4 text-sm">Camera UI integration ready for frontend</p>
        <button 
          onClick={() => setShowCameraPlaceholder(false)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors"
        >
          Cancel Camera
        </button>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <div className="bg-[#1a1d24] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 truncate">
          <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-400 hover:text-blue-300">Replace</button>
          <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300">Remove</button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleChange} 
            className="hidden" 
            accept={accept} 
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors min-h-[200px] cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-[#1a1d24] hover:border-gray-500'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
      </div>
      <p className="text-sm text-white font-medium mb-1">{label}</p>
      <p className="text-xs text-gray-500 mb-4">Drag and drop or click to browse</p>
      
      {allowCamera && (
        <div className="flex gap-3 w-full max-w-xs justify-center" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors flex-1"
          >
            Upload
          </button>
          <button 
            onClick={() => setShowCameraPlaceholder(true)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors flex-1"
          >
            Camera
          </button>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept={accept} 
      />
    </div>
  );
};
