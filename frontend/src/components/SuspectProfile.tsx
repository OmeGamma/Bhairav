import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from './layout/Layout';
import { User, AlertTriangle, Shield, Calendar, GitBranch } from 'lucide-react';

interface SuspectApi {
  id: number;
  name: string;
  aliases: string | null;
  risk_score: number;
  case_number: string | null;
  case_title: string | null;
  location: string | null;
  crime_type: string | null;
}

const SuspectProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SuspectApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuspect = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/suspects/${id}`);
        if (!res.ok) throw new Error('Suspect not found');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuspect();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-500">Loading Suspect Profile...</div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-500">{error || 'Suspect not found'}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <User className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Suspect Profile: {data.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ID: SUS-{data.id} • Last Updated: Today
            </p>
          </div>
          <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md font-semibold border border-red-200 dark:border-red-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            High Risk: {data.risk_score}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Personal Details</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between"><span className="text-gray-500">Full Name</span><span className="font-medium text-gray-900 dark:text-white">{data.name}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Aliases</span><span className="font-medium text-gray-900 dark:text-white">{data.aliases || 'N/A'}</span></li>
                <li className="flex justify-between"><span className="text-gray-500">Primary Location</span><span className="font-medium text-gray-900 dark:text-white">{data.location || 'Unknown'}</span></li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">AI Risk Indicators</h2>
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded border border-orange-100 dark:border-orange-800">
                  <p className="text-sm text-orange-800 dark:text-orange-400 font-medium">Modus Operandi Match</p>
                  <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">High similarity to recent {data.crime_type || 'cases'} in {data.location || 'the area'}.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">Case Association</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Directly connected to case {data.case_number || 'N/A'}.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle/Right Column: Cases and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Associated Cases</h2>
                <button className="text-sm text-light-accent dark:text-dark-accent hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {data.case_number && (
                  <Link to={`/cases/${data.case_number}`} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{data.case_number}: {data.case_title || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1"><Calendar className="w-3 h-3 mr-1" /> Today</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-light-border dark:border-dark-border p-6 min-h-[300px]">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Network Preview</h2>
                {data.case_number && (
                  <Link to={`/criminal-network?case=${data.case_number}`} className="text-sm text-light-accent dark:text-dark-accent flex items-center hover:underline">
                    <GitBranch className="w-4 h-4 mr-1" /> Open Graph
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400">
                React Flow Network Graph Placeholder
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuspectProfile;

