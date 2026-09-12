import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import Layout from './layout/Layout';
import { FolderOpen, ArrowLeft, FileText, User, Video, GitBranch, Shield, Activity, Car, Building2, FileSearch, MapPin } from 'lucide-react';

const CaseDetail: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases/${caseId}`);
        if (!res.ok) throw new Error('Case not found or unable to load.');
        const data = await res.json();
        setCaseData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCase();
  }, [caseId]);

  if (isLoading) return <Layout><div className="p-8 text-center text-gray-500">Loading Case Data...</div></Layout>;
  if (error || !caseData) return <Layout><div className="p-8 text-center text-red-500">{error || 'Case not found'}</div></Layout>;

  const isDemo = caseData.dataClassification === 'DEMO_SYNTHETIC';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/cases')} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <FolderOpen className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
                  {caseData.case_number}: {caseData.title}
                </h1>
                {isDemo && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300">DEMO DATA</span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Crime Type: {caseData.crimeType} | Date: {new Date(caseData.filingDate || caseData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {caseData.status !== 'Closed' && (
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to close this case?")) {
                    try {
                      const res = await fetch(`/api/cases/${caseData.case_number}/close`, { method: 'PATCH' });
                      if (res.ok) {
                        const updated = await res.json();
                        setCaseData(updated);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
                className="px-3 py-2 border border-green-500 text-green-600 dark:text-green-400 rounded-md font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center text-sm"
              >
                Close Case
              </button>
            )}
            <Link to={`/cases/${caseData.case_number}/edit`} className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center text-sm">
              Edit Case
            </Link>
            <button
              onClick={async () => {
                if (confirm(`PERMANENT DELETE\n\nCase: ${caseData.case_number}\nThis action permanently deletes the case and associated data including evidence, reports, and media.\n\nContinue?`)) {
                  try {
                    const res = await apiClient.delete(`/api/cases/${caseData.case_number}`);
                    if (res.ok) {
                      navigate('/cases');
                    } else {
                      alert(`Unable to delete case: ${res.error || 'Unknown error'}`);
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Unable to delete case due to an unexpected error.");
                  }
                }
              }}
              className="px-3 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-md font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center text-sm"
            >
              Permanently Delete Case
            </button>
            <Link to={`/criminal-network?case=${caseData.case_number}`} className="px-3 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md font-medium hover:bg-blue-600 transition-colors flex items-center text-sm">
              <GitBranch className="w-4 h-4 mr-2" /> Network
            </Link>
            <Link to={`/geospatial`} className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2" /> View on Map
            </Link>
            <a href={`/api/reports/generate?case_id=${encodeURIComponent(caseData.case_number)}`} download className="px-3 py-2 border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-400 rounded-md font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center text-sm">
              <FileText className="w-4 h-4 mr-2" /> Generate PDF Report
            </a>
            <a href={`/api/cases/${caseData.case_number}/export/doc`} download className="px-3 py-2 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 rounded-md font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center text-sm">
              <FileText className="w-4 h-4 mr-2" /> Download (.DOCX)
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-gray-400" /> Case Overview
              </h2>
              <ul className="space-y-3 text-sm text-gray-900 dark:text-gray-100">
                <li className="flex justify-between"><span className="text-gray-500">Status</span> <span className="font-semibold">{caseData.status}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Priority</span> <span className="font-semibold">{caseData.priority}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Officer</span> <span className="font-semibold">{caseData.investigatingOfficer || caseData.officer || 'Unassigned'}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Location</span> <span className="font-semibold">{caseData.location ? (caseData.location.city || caseData.location.address || 'Unknown') : 'Unknown'}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Police Station</span> <span className="font-semibold">{caseData.policeStation || 'N/A'}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">FIR</span> <span className="font-semibold">{caseData.firNumber || caseData.firs?.[0]?.firNumber || 'N/A'}</span></li>
              </ul>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{caseData.description || 'No description provided.'}</p>
              </div>
              {caseData.incidentDetails && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Incident Details</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{caseData.incidentDetails}</p>
                </div>
              )}
              {caseData.modusOperandi && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Modus Operandi</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{caseData.modusOperandi}</p>
                </div>
              )}
            </div>

            {caseData.ai_summary && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/30 p-6">
                <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" /> AI-Assisted Analysis
                </h2>
                <p className="text-sm text-blue-900 dark:text-blue-200">{caseData.ai_summary}</p>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Involved Persons</h2>
              {(caseData.suspects?.length === 0 && caseData.persons?.length === 0 && caseData.victims?.length === 0) ? (
                <p className="text-sm text-gray-500 italic">No persons linked to this case.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseData.suspects?.map((s: any) => (
                    <div key={s._id || s.name} className="p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-red-500 mr-3" />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-red-600 dark:text-red-400">Suspect (Risk: {s.risk_score})</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {caseData.persons?.map((p: any) => (
                    <div key={p._id || p.name} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {caseData.victims?.map((v: any) => (
                    <div key={v._id || v.name} className="p-3 border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-orange-500 mr-3" />
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{v.name}</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">Victim</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Evidence & Records</h2>
              {(!caseData.evidences?.length && !caseData.documents?.length && !caseData.videos?.length && !caseData.vehicles?.length && !caseData.organizations?.length) ? (
                <p className="text-sm text-gray-500 italic">No evidence has been added to this case.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseData.evidences?.map((e: any) => (
                    <div key={e._id || e.evidenceId} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-start">
                      <FileSearch className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{e.evidenceId || e.title}</p>
                        <p className="text-xs text-gray-500">{e.description}</p>
                      </div>
                    </div>
                  ))}
                  {caseData.videos?.map((v: any) => (
                    <div key={v._id || v.videoId} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-start">
                      <Video className="w-5 h-5 text-pink-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{v.videoId || v.title}</p>
                        <p className="text-xs text-gray-500">{v.title}</p>
                      </div>
                    </div>
                  ))}
                  {caseData.vehicles?.map((veh: any) => (
                    <div key={veh._id || veh.vehicleId} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-start">
                      <Car className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{veh.vehicleId || veh.plate_number}</p>
                        <p className="text-xs text-gray-500">{veh.make_model}</p>
                      </div>
                    </div>
                  ))}
                  {caseData.organizations?.map((org: any) => (
                    <div key={org._id || org.organizationId} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-start">
                      <Building2 className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{org.name}</p>
                        <p className="text-xs text-gray-500">{org.type}</p>
                      </div>
                    </div>
                  ))}
                  {caseData.firs?.map((fir: any) => (
                    <div key={fir._id || fir.firNumber} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md flex items-start">
                      <FileText className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{fir.firNumber}</p>
                        <p className="text-xs text-gray-500">{fir.policeStation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CaseDetail;

