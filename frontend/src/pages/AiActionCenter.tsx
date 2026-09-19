import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, ShieldAlert, AlertOctagon, CheckCircle2, Loader2, Database, Shield } from 'lucide-react';
import Layout from '../components/layout/Layout';

export default function AiActionCenter() {
  const [searchParams] = useSearchParams();
  const identityParam = searchParams.get('identityId') || '';
  const caseParam = searchParams.get('caseId') || '';
  
  const [identityId, setIdentityId] = useState(identityParam || 'ID-DEMO-001');
  const [caseId, setCaseId] = useState(caseParam);
  
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  // Animation States
  const [isMasterAnimating, setIsMasterAnimating] = useState(false);
  const [masterAnimationStep, setMasterAnimationStep] = useState(0);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [animationSteps] = useState(11); // Extended for Digilocker/Banks
  
  const [actionAnimatingId, setActionAnimatingId] = useState('');
  const [actionAnimatingStep, setActionAnimatingStep] = useState(0);

  const fetchSummary = async (skipAnimation = false) => {
    if (!identityId) return;
    setLoading(true);
    setSummary(null);
    try {
      const url = `/api/synthetic/correlation/${identityId}${caseId ? `?case_id=${caseId}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        if (!skipAnimation && !data.error) {
          setSummary(data);
          runMasterAnimation();
        } else {
          setSummary(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isMasterAnimating && !isAnimationPaused) {
      if (masterAnimationStep < animationSteps) {
        timer = setTimeout(() => {
          setMasterAnimationStep(prev => prev + 1);
        }, 1200); // Slightly slower for readability
      } else if (masterAnimationStep === animationSteps) {
        timer = setTimeout(() => {
          setIsMasterAnimating(false);
        }, 2000);
      }
    }
    return () => clearTimeout(timer);
  }, [isMasterAnimating, masterAnimationStep, isAnimationPaused, animationSteps]);

  const runMasterAnimation = () => {
    setIsMasterAnimating(true);
    setIsAnimationPaused(false);
    setMasterAnimationStep(1);
  };

  const handleRefreshAnimation = () => {
    setMasterAnimationStep(1);
    setIsAnimationPaused(false);
  };

  useEffect(() => {
    if (identityParam) fetchSummary();
  }, [identityParam]);

  const handleAction = async (actionType: string, targetId: string, newStatus: string) => {
    setActionAnimatingId(targetId);
    setActionAnimatingStep(1);
    
    try {
      // Simulate action steps
      await new Promise(r => setTimeout(r, 600));
      setActionAnimatingStep(2);
      await new Promise(r => setTimeout(r, 600));
      setActionAnimatingStep(3);
      await new Promise(r => setTimeout(r, 600));

      const res = await fetch('/api/synthetic/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, targetId, newStatus })
      });
      if (res.ok) {
        setActionAnimatingStep(4);
        setTimeout(() => {
           setActionAnimatingId('');
           fetchSummary(true); // reload without master animation
        }, 1500);
      }
    } catch (err) {
      alert('Failed to apply demo action');
      setActionAnimatingId('');
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Synthetic Identity ID</label>
                <input 
                  type="text" 
                  value={identityId} 
                  onChange={(e) => setIdentityId(e.target.value)}
                  className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  placeholder="ID-DEMO-001"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Case ID (Optional)</label>
                <input 
                  type="text" 
                  value={caseId} 
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                />
              </div>
              <div className="flex items-end">
                <button onClick={() => fetchSummary(false)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all h-[50px] flex items-center gap-2 whitespace-nowrap">
                  <Brain className="w-5 h-5" /> START AI ACTION CENTER
                </button>
              </div>
            </div>

            {loading && !isMasterAnimating && <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />Running AI Correlation Engine...</div>}

            {/* MASTER ANIMATION OVERLAY */}
            {isMasterAnimating && summary && (
              <div className="bg-[#13151c] border border-blue-500/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[500px] relative">
                
                {/* PLAYBACK CONTROLS */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                   <button 
                     onClick={() => setIsAnimationPaused(!isAnimationPaused)}
                     className="px-4 py-2 bg-[#0a0c10] border border-gray-800 hover:bg-gray-800 text-white font-bold rounded-lg transition-all text-xs flex items-center gap-2"
                   >
                     {isAnimationPaused ? (
                       <>▶ PLAY</>
                     ) : (
                       <>⏸ PAUSE</>
                     )}
                   </button>
                   <button 
                     onClick={handleRefreshAnimation}
                     className="px-4 py-2 bg-[#0a0c10] border border-gray-800 hover:bg-gray-800 text-white font-bold rounded-lg transition-all text-xs"
                   >
                     ↻ REFRESH
                   </button>
                   <button 
                     onClick={() => setIsMasterAnimating(false)}
                     className="px-4 py-2 bg-[#0a0c10] border border-gray-800 hover:text-red-400 text-gray-500 font-bold rounded-lg transition-all text-xs"
                   >
                     ✕ SKIP
                   </button>
                </div>

                <div className="relative w-24 h-24 mb-8">
                  <div className={`absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full ${!isAnimationPaused && 'animate-spin'}`}></div>
                  <div className={`absolute inset-2 border-4 border-purple-500/20 border-b-purple-500 rounded-full ${!isAnimationPaused && 'animate-spin-reverse'}`}></div>
                  <Brain className="absolute inset-0 m-auto w-10 h-10 text-blue-400" />
                </div>
                
                <div className="space-y-4 text-left w-full max-w-lg mx-auto">
                  {masterAnimationStep >= 1 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="font-mono text-sm text-gray-300">IDENTITY VERIFIED AGAINST SYNTHETIC DATASET</span>
                    </div>
                  )}
                  {masterAnimationStep >= 2 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      {masterAnimationStep === 2 && !isAnimationPaused ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      <span className="font-mono text-sm text-gray-300">AUTHENTICATING AADHAAR VIA DIGILOCKER...</span>
                    </div>
                  )}
                  {masterAnimationStep >= 3 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="font-mono text-sm text-green-400 font-bold">DIGILOCKER AUTHENTICATION SUCCESSFUL</span>
                    </div>
                  )}
                  {masterAnimationStep >= 4 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      {masterAnimationStep === 4 && !isAnimationPaused ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      <span className="font-mono text-sm text-gray-300">ANALYZING LINKED TELECOM SERVICES...</span>
                    </div>
                  )}
                  {masterAnimationStep >= 5 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      <span className="font-mono text-sm text-blue-400">SIM RECORDS FOUND: {summary.simRecords?.length || 0}</span>
                    </div>
                  )}
                  {masterAnimationStep >= 6 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                       {masterAnimationStep === 6 && !isAnimationPaused ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      <span className="font-mono text-sm text-gray-300">ANALYZING SYNTHETIC FINANCIAL RECORDS...</span>
                    </div>
                  )}
                  {masterAnimationStep >= 7 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      <span className="font-mono text-sm text-blue-400">{summary.bankRecords?.length || 0} ACCOUNTS FOUND</span>
                    </div>
                  )}
                  {masterAnimationStep >= 8 && (
                     <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      {masterAnimationStep === 8 && !isAnimationPaused ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      <span className="font-mono text-sm text-gray-300">ANALYZING CASE ASSOCIATIONS...</span>
                    </div>
                  )}
                  {masterAnimationStep >= 9 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <Shield className="w-5 h-5 text-purple-500" />
                      <span className="font-mono text-sm text-purple-400">CRITICAL CASE LINK DETECTED</span>
                    </div>
                  )}
                  {masterAnimationStep >= 10 && (
                     <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      {masterAnimationStep === 10 && !isAnimationPaused ? <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      <span className="font-mono text-sm text-yellow-400 font-bold">GENERATING ACTION RECOMMENDATIONS...</span>
                    </div>
                  )}
                  {masterAnimationStep >= 11 && (
                     <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 mt-6 pt-4 border-t border-gray-800">
                      <ShieldAlert className="w-6 h-6 text-red-500" />
                      <span className="font-mono text-base text-red-400 font-black tracking-widest">READY FOR AUTHORIZED REVIEW</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {summary && summary.error && !loading && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-400">
                <AlertOctagon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="text-lg font-bold">Identity Not Found</h3>
                <p className="text-sm">The synthetic identity ID "{identityId}" could not be found in the database. Please enter a valid Identity ID from the Identity Intelligence page.</p>
              </div>
            )}

            {summary && !loading && !summary.error && !isMasterAnimating && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* HEADERS */}
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">AI Intelligence Summary</h2>
                      <div className="text-sm text-gray-300">
                        Case: <span 
                                className="font-mono text-blue-400 cursor-pointer hover:underline"
                                onClick={() => { if (summary.case) window.location.href = `/cases/${summary.case}`; }}
                              >
                                {summary.case}
                              </span> | 
                        Identity: <span className="font-mono text-white">{summary.identity}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold">
                        {summary.pendingReviewActions} PENDING ACTIONS
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0a0c10]/50 p-4 rounded-xl border border-blue-500/10 text-center">
                      <div className="text-2xl font-black text-white">{summary.relatedSyntheticSims}</div>
                      <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Synthetic SIMs</div>
                    </div>
                    <div className="bg-[#0a0c10]/50 p-4 rounded-xl border border-blue-500/10 text-center">
                      <div className="text-2xl font-black text-white">{summary.relatedSyntheticBankRecords}</div>
                      <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Bank Records</div>
                    </div>
                    <div className="bg-[#0a0c10]/50 p-4 rounded-xl border border-blue-500/10 text-center">
                      <div className="text-2xl font-black text-white">{summary.videoCandidateMatches}</div>
                      <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Video Matches</div>
                    </div>
                    <div className="bg-[#0a0c10]/50 p-4 rounded-xl border border-blue-500/10 text-center">
                      <div className="text-2xl font-black text-white">{summary.locationCorrelations}</div>
                      <div className="text-xs font-bold text-gray-400 mt-1 uppercase">Location Events</div>
                    </div>
                  </div>
                </div>

                {/* AI EXPLANATION */}
                <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-yellow-500" />
                    Why this case was flagged
                  </h3>
                  <ul className="space-y-2">
                    {summary.aiExplanation.map((reason: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <span className="text-blue-500 font-bold">{idx + 1}.</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ACTION CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* SIM ACTIONS */}
                  <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">RECOMMENDED TELECOM ACTION</h3>
                    <div className="text-sm text-gray-400 mb-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                      <span className="font-bold text-yellow-500">Reason:</span> Identity linked to active investigation
                    </div>
                    
                    <div className="space-y-4">
                      {summary.simRecords?.map((sim: any) => (
                        <div key={sim.simId} className="bg-[#0a0c10] p-4 rounded-xl border border-gray-800/50">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-mono text-sm">{sim.maskedPhoneNumber}</span>
                              <div className="text-xs font-bold text-gray-500 mt-0.5">{sim.operator} • Telecom</div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${sim.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {sim.status}
                            </span>
                          </div>
                          {sim.status === 'ACTIVE' && (
                            <div className="mt-4 pt-4 border-t border-gray-800/50 flex flex-col gap-2 relative overflow-hidden">
                              {actionAnimatingId === sim.simId ? (
                                <div className="text-xs font-mono space-y-2 p-2 bg-black/40 rounded">
                                  {actionAnimatingStep >= 1 && <div className="text-blue-400 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> {sim.operator} LINK ANALYSIS...</div>}
                                  {actionAnimatingStep >= 2 && <div className="text-yellow-400 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> PREPARING DEMO SUSPENSION...</div>}
                                  {actionAnimatingStep >= 3 && <div className="text-orange-400 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> SUSPENSION SIMULATION...</div>}
                                  {actionAnimatingStep >= 4 && <div className="text-red-500 font-bold flex gap-2"><CheckCircle2 className="w-3 h-3"/> {sim.operator} SIM SUSPENDED (DEMO)</div>}
                                </div>
                              ) : (
                                <button 
                                  onClick={() => handleAction('SIM_STATUS_CHANGE', sim.simId, 'SUSPENDED')}
                                  className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <AlertOctagon className="w-3 h-3" /> Approve {sim.operator} Demo Suspension
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BANK ACTIONS */}
                  <div className="bg-[#13151c] border border-gray-800/80 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">RECOMMENDED FINANCIAL ACTION</h3>
                    <div className="text-sm text-gray-400 mb-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                      <span className="font-bold text-yellow-500">Reason:</span> Case-associated financial record
                    </div>
                    
                    <div className="space-y-4">
                      {summary.bankRecords?.map((bank: any) => (
                        <div key={bank.bankAccountId} className="bg-[#0a0c10] p-4 rounded-xl border border-gray-800/50">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-mono text-sm">{bank.maskedAccountNumber}</span>
                              <div className="text-xs font-bold text-gray-500 mt-0.5">{bank.bankName} • {bank.accountType}</div>
                              <div className="text-xs font-mono text-blue-400 mt-0.5">Balance: {bank.balance || '₹0'}</div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${bank.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {bank.status}
                            </span>
                          </div>
                          {bank.status === 'ACTIVE' && (
                            <div className="mt-4 pt-4 border-t border-gray-800/50 flex flex-col gap-2">
                               {actionAnimatingId === bank.bankAccountId ? (
                                <div className="text-xs font-mono space-y-2 p-2 bg-black/40 rounded">
                                  {actionAnimatingStep >= 1 && <div className="text-blue-400 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> {bank.bankName} LINK ANALYSIS...</div>}
                                  {actionAnimatingStep >= 2 && <div className="text-yellow-400 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> VERIFYING SYNTHETIC RECORD...</div>}
                                  {actionAnimatingStep >= 3 && <div className="text-orange-400 flex gap-2"><Loader2 className="w-3 h-3 animate-spin"/> GENERATING DEMO HOLD...</div>}
                                  {actionAnimatingStep >= 4 && <div className="text-red-500 font-bold flex gap-2"><CheckCircle2 className="w-3 h-3"/> ACCOUNT FROZEN (DEMO)</div>}
                                </div>
                              ) : (
                                <button 
                                  onClick={() => handleAction('BANK_STATUS_CHANGE', bank.bankAccountId, 'FROZEN_SIMULATION')}
                                  className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-500 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <AlertOctagon className="w-3 h-3" /> Approve Demo {bank.bankName} Hold
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
                
                <div className="text-center text-xs font-bold text-gray-500 tracking-widest uppercase mt-8 border-t border-gray-800 pt-4">
                  DEMO ACTION ONLY — NO REAL BANK/TELECOM ACTION PERFORMED
                </div>
              </div>
            )}
      </div>
    </Layout>
  );
}
