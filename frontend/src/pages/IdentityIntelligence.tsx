import React, { useState, useEffect } from 'react';
import { Search, User, CreditCard, Smartphone, FileText, AlertTriangle, ShieldCheck, Upload, X, Camera } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function IdentityIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<any>(null);
  
  const [sims, setSims] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocument, setUploadDocument] = useState<File | null>(null);
  const [uploadPhoto, setUploadPhoto] = useState<File | null>(null);
  const [uploadCaseId, setUploadCaseId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/synthetic/identities');
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Failed to load identities", err);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    
    setIsSearching(true);
    setSelectedIdentity(null);
    try {
      const url = searchQuery.trim() 
        ? `/api/synthetic/identities?search=${encodeURIComponent(searchQuery)}`
        : `/api/synthetic/identities`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const loadIdentityDetails = async (identity: any) => {
    setSelectedIdentity(identity);
    setLoadingDetails(true);
    try {
      const [simRes, bankRes] = await Promise.all([
        fetch(`/api/synthetic/sims/${identity.syntheticAadhaarId}`),
        fetch(`/api/synthetic/banks/${identity.syntheticAadhaarId}`)
      ]);
      if (simRes.ok) setSims(await simRes.json());
      if (bankRes.ok) setBanks(await bankRes.json());
    } catch (err) {
      console.error("Failed to load details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteIdentity = async (identityId: string) => {
    if (!confirm('Are you sure you want to delete this synthetic identity and all associated fake SIM/Bank records?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/synthetic/identities/${identityId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSelectedIdentity(null);
        // refresh list
        setResults(prev => prev.filter(i => i.identityId !== identityId));
      } else {
        alert('Failed to delete identity');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting identity');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocument) {
      alert("Identity document is required.");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('document', uploadDocument);
      if (uploadPhoto) formData.append('photo', uploadPhoto);
      if (uploadCaseId) formData.append('caseId', uploadCaseId);

      const res = await fetch('/api/synthetic/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadSuccess(true);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadSuccess(false);
          setUploadDocument(null);
          setUploadPhoto(null);
          setUploadCaseId('');
          // Load the newly created identity
          if (data.identity) {
             setResults([data.identity]);
             loadIdentityDetails(data.identity);
          }
        }, 1500);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed due to network error.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            
        {/* SEARCH BAR & ACTIONS */}
        <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col flex-1 w-full gap-2">
                <form onSubmit={handleSearch} className="flex gap-4 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Demo ID / Name / Case..."
                      className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                  >
                    {isSearching ? 'Searching...' : 'Search Identity'}
                  </button>
                </form>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="font-bold text-gray-400">Examples:</span>
                  <button onClick={() => {setSearchQuery('Demo Person'); handleSearch(new Event('submit') as any);}} className="hover:text-blue-400">"Demo Person"</button>
                  <button onClick={() => {setSearchQuery('DEMO-AADHAAR-'); handleSearch(new Event('submit') as any);}} className="hover:text-blue-400">"DEMO-AADHAAR-"</button>
                  <button onClick={() => {setSearchQuery('DEMO-ID-'); handleSearch(new Event('submit') as any);}} className="hover:text-blue-400">"DEMO-ID-"</button>
                </div>
              </div>
              
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-6 py-3 bg-[#0a0c10] border border-blue-500/50 hover:bg-blue-900/20 text-blue-400 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap self-start"
              >
                <Upload className="w-5 h-5" />
                Upload Identity Data
              </button>
            </div>

            {/* RESULTS LIST */}
            {!selectedIdentity && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-gray-300">Identity Records</h3>
                   <span className="text-sm font-bold text-gray-500">{results.length} records found</span>
                </div>
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((identity) => (
                      <div 
                        key={identity.identityId} 
                        onClick={() => loadIdentityDetails(identity)}
                        className="bg-[#13151c] border border-gray-800/80 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 transition-colors flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{identity.name}</div>
                          <div className="text-sm text-gray-400">{identity.syntheticAadhaarId}</div>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs font-bold px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">
                            {identity.dataClassification}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#13151c] border border-gray-800/80 rounded-xl p-8 text-center text-gray-500">
                    No synthetic identities found. Click "Upload Identity Data" to generate demo records.
                  </div>
                )}
              </div>
            )}

            {/* IDENTITY PROFILE */}
            {selectedIdentity && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                  <button onClick={() => setSelectedIdentity(null)} className="text-blue-500 hover:text-blue-400 text-sm font-bold flex items-center gap-2">
                    ← Back to Search
                  </button>
                  <div className="flex gap-2">
                    {selectedIdentity.documentUrl && (
                      <a 
                        href={selectedIdentity.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#0a0c10] border border-gray-800 hover:bg-gray-800 text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> View Aadhaar Document
                      </a>
                    )}
                    <button 
                      onClick={() => window.location.href = `/ai-action-center?identityId=${selectedIdentity.identityId}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all"
                    >
                      Open in AI Action Center
                    </button>
                    <button 
                      onClick={() => handleDeleteIdentity(selectedIdentity.identityId)}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 font-bold rounded-lg text-sm transition-all"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Identity'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* SYNTHETIC CARD */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl p-6 relative overflow-hidden shadow-2xl text-gray-900 h-full flex flex-col justify-between">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none rotate-[-30deg]">
                        <div className="text-6xl font-black text-center leading-none text-red-600">
                          NOT A REAL<br/>AADHAAR<br/><span className="text-4xl">FOR SIH DEMO ONLY</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-400/30 pb-4">
                          <ShieldCheck className="w-8 h-8 text-blue-600" />
                          <div>
                            <div className="font-black text-xl tracking-widest text-blue-900">BHAIRAV</div>
                            <div className="text-xs font-bold text-gray-500">SYNTHETIC IDENTITY RECORD</div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-24 h-32 bg-gray-400 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                            {selectedIdentity.photoUrl ? (
                              <img src={selectedIdentity.photoUrl} alt="Demo Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2 flex-1">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-gray-500">Name</div>
                              <div className="font-bold text-sm leading-tight">{selectedIdentity.name}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-gray-500">DOB</div>
                              <div className="font-bold text-sm leading-tight">{selectedIdentity.dateOfBirth}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-gray-500">Gender</div>
                              <div className="font-bold text-sm leading-tight">{selectedIdentity.gender}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-400/30 text-center">
                        <div className="font-mono text-xl font-bold tracking-widest text-gray-800">
                          {selectedIdentity.syntheticAadhaarId}
                        </div>
                        <div className="text-[10px] font-bold text-red-600 mt-1 uppercase">Demo / Synthetic Data</div>
                      </div>
                    </div>
                  </div>

                  {/* IDENTITY INFO */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Identity Profile
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0a0c10] p-4 rounded-xl border border-gray-800/50">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</div>
                          {selectedIdentity.caseId || (selectedIdentity.caseIds && selectedIdentity.caseIds.length > 0) ? (
                            <div className="text-red-400 font-bold flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> CASE-ASSOCIATED
                            </div>
                          ) : (
                            <div className="text-green-400 font-bold">CLEARED</div>
                          )}
                        </div>
                        
                        <div className="bg-[#0a0c10] p-4 rounded-xl border border-gray-800/50">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Linked Case</div>
                          <div className="text-blue-400 font-mono hover:underline cursor-pointer" onClick={() => {
                            const cid = selectedIdentity.caseId || (selectedIdentity.caseIds?.length > 0 ? selectedIdentity.caseIds[0] : null);
                            if (cid) window.location.href = `/cases/${cid}`;
                          }}>
                            {selectedIdentity.caseId || (selectedIdentity.caseIds?.length > 0 ? selectedIdentity.caseIds.join(', ') : 'None')}
                          </div>
                        </div>
                        
                        <div className="bg-[#0a0c10] p-4 rounded-xl border border-gray-800/50">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Risk Score</div>
                          <div className="text-yellow-500 font-bold">{selectedIdentity.riskStatus}</div>
                        </div>

                        <div className="bg-[#0a0c10] p-4 rounded-xl border border-gray-800/50">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Digilocker Auth</div>
                          {selectedIdentity.digilockerAuth !== false ? (
                            <div className="text-green-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4" /> AUTHENTICATED
                            </div>
                          ) : (
                            <div className="text-gray-500 font-bold">UNVERIFIED</div>
                          )}
                        </div>

                        <div className="bg-[#0a0c10] p-4 rounded-xl border border-gray-800/50">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</div>
                          <div className="text-white">{selectedIdentity.city}, {selectedIdentity.state}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* SIMS */}
                      <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-blue-500" />
                          Linked SIMs
                        </h3>
                        {loadingDetails ? <div className="text-gray-500 text-sm">Loading...</div> : (
                          <div className="space-y-3">
                            {sims.length === 0 && <div className="text-gray-500 text-sm">No SIM records found.</div>}
                            {sims.map((sim) => (
                              <div key={sim.simId} className="bg-[#0a0c10] p-3 rounded-lg border border-gray-800/50 flex justify-between items-center">
                                <div>
                                  <div className="font-mono text-sm text-gray-200">{sim.maskedPhoneNumber}</div>
                                  <div className="text-xs text-gray-500">{sim.operator}</div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${sim.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {sim.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* BANKS */}
                      <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-500" />
                          Bank Records
                        </h3>
                        {loadingDetails ? <div className="text-gray-500 text-sm">Loading...</div> : (
                          <div className="space-y-3">
                            {banks.length === 0 && <div className="text-gray-500 text-sm">No bank records found.</div>}
                            {banks.map((bank) => (
                              <div key={bank.bankAccountId} className="bg-[#0a0c10] p-3 rounded-lg border border-gray-800/50 flex justify-between items-center">
                                <div>
                                  <div className="font-mono text-sm text-gray-200">{bank.maskedAccountNumber}</div>
                                  <div className="text-xs text-gray-500">{bank.bankName} • <span className="text-blue-400 font-mono">{bank.balance || '₹0'}</span></div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${bank.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {bank.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* UPLOAD MODAL */}
            {isUploadOpen && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[#13151c] border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                  <button 
                    onClick={() => setIsUploadOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-blue-500" />
                    Upload Synthetic Identity
                  </h2>
                  <p className="text-sm text-yellow-500 mb-6 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                    <strong>DEMO / SYNTHETIC DATA ONLY.</strong> Do not upload real government records.
                  </p>
                  
                  {uploadSuccess ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-green-400">Upload Successful</h3>
                      <p className="text-gray-400 text-sm mt-2">AI Extraction complete. Generating profile...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleUpload} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Synthetic Identity Document (PDF/Image)</label>
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setUploadDocument(e.target.files ? e.target.files[0] : null)}
                          className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Synthetic Person Photograph (Optional)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setUploadPhoto(e.target.files ? e.target.files[0] : null)}
                          className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Associate Demo Case ID (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. BRH-DEMO-001"
                          value={uploadCaseId}
                          onChange={(e) => setUploadCaseId(e.target.value)}
                          className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                        />
                      </div>
                      
                      <div className="pt-4 border-t border-gray-800 mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsUploadOpen(false)}
                          className="px-6 py-3 bg-transparent text-gray-400 hover:text-white font-bold rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading || !uploadDocument}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing OCR...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" /> Start AI Extraction
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
      </div>
    </Layout>
  );
}
