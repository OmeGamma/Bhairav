import React, { useState, useRef, useEffect } from 'react';
import Layout from './layout/Layout';
import { FileSearch, Upload, CheckCircle2, XCircle, FileText, FolderOpen } from 'lucide-react';

const DocumentIntelligence: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          setCases(data);
          if (data.length > 0) setSelectedCase(data[0].case_number);
        }
      } catch (err) {
        console.error("Failed to load cases", err);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!selectedCase) return;
      setIsLoadingDocs(true);
      try {
        const res = await fetch(`/api/documents?case_id=${encodeURIComponent(selectedCase)}`);
        if (res.ok) {
          const data = await res.json();
          setExistingDocs(data);
        }
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchDocs();
  }, [selectedCase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResults(null);
      setError(null);
    }
  };

  const processDocument = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Document processing failed.");
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Document processing is not yet connected to the backend.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileSearch className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Document Intelligence
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Upload case documents (PDF, JPG) to extract structured intelligence using AI.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-sm rounded-md px-2 py-1 text-gray-700 dark:text-gray-300"
            >
              {cases.map(c => <option key={c.case_number} value={c.case_number}>{c.case_number} - {c.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6 flex flex-col items-center justify-center min-h-[400px]">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileChange}
            />
            
            {!file ? (
              <div 
                className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Click or drag document to upload</h3>
                <p className="text-gray-500 mt-2 text-sm">Supports PDF, JPG, PNG, TXT up to 10MB</p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <FileText className="w-16 h-16 text-light-accent dark:text-dark-accent mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setFile(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={processDocument}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:bg-blue-600 flex items-center disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Extract Intelligence'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6 min-h-[400px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Extracted Information
            </h2>
            
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
                {error}
              </div>
            )}

            {!results && !isProcessing && !error && (
              <div className="h-full flex items-center justify-center text-gray-400">
                Upload and process a document to view AI extracted intelligence.
              </div>
            )}

            {isProcessing && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-light-accent dark:border-dark-accent"></div>
                <p className="text-gray-500">Analyzing document and extracting entities...</p>
              </div>
            )}

            {results && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">File</p>
                  <p className="text-gray-900 dark:text-white font-medium">{results.filename}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{results.message}</p>
                </div>

                {results.extracted && results.entities && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Case Number</p>
                        <p className="text-gray-900 dark:text-white font-medium">{results.entities.caseNumber || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">FIR Number</p>
                        <p className="text-gray-900 dark:text-white font-medium">{results.entities.firNumber || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Crime Type</p>
                      <p className="text-gray-900 dark:text-white font-medium">{results.entities.crimeType || 'N/A'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Locations</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(results.entities.locations || []).map((loc: string) => (
                          <span key={loc} className="px-2 py-1 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300">
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Persons / Suspects / Victims</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(results.entities.persons || []).map((p: string) => (
                          <span key={p} className="px-2 py-1 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300">{p}</span>
                        ))}
                        {(results.entities.suspects || []).map((s: string) => (
                          <span key={s} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">{s}</span>
                        ))}
                        {(results.entities.victims || []).map((v: string) => (
                          <span key={v} className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-700 dark:text-orange-400">{v}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Vehicles / Organizations / Evidence</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(results.entities.vehicles || []).map((v: string) => (
                          <span key={v} className="px-2 py-1 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300">{v}</span>
                        ))}
                        {(results.entities.organizations || []).map((o: string) => (
                          <span key={o} className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-sm text-purple-700 dark:text-purple-400">{o}</span>
                        ))}
                        {(results.entities.evidenceReferences || []).map((e: string) => (
                          <span key={e} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">{e}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </button>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Validate & Save
                      </button>
                    </div>
                  </>
                )}

                {!results.extracted && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={() => { setResults(null); setFile(null); }} className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                      Discard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Existing Documents */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            Existing Documents for {selectedCase}
          </h2>
          {isLoadingDocs ? (
            <div className="p-4 text-center text-gray-500">Loading documents...</div>
          ) : existingDocs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No documents found for this case.</div>
          ) : (
            <div className="min-w-0 flex-1 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Document ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {existingDocs.map((doc: any) => (
                    <tr key={doc._id || doc.documentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 text-sm font-medium text-light-accent dark:text-dark-accent">{doc.documentId || doc._id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{doc.fileName || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{doc.mimeType || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{doc.processingStatus || 'PENDING'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-2 flex items-center space-x-3">
                        <button onClick={() => setViewingFile(`/api/files/${doc.documentId || doc._id}`)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View</button>
                        <a href={`/api/files/${doc.documentId || doc._id}?download=true`} className="text-xs text-light-accent hover:underline">Download</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-dark-card w-full max-w-5xl h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Document Viewer</h3>
              <button onClick={() => setViewingFile(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-900">
              <iframe src={viewingFile} className="w-full h-full border-none" title="Document Viewer" />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DocumentIntelligence;
