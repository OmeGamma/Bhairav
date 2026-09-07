import React, { useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Layout from './layout/Layout';
import { Download, ArrowLeft, FileText, Database } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const ReportView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { results, query, caseData } = location.state || {};

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    const element = reportRef.current;
    
    const opt = {
      margin:       10,
      filename:     `Bhairav_Report_${new Date().getTime()}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      setIsGenerating(false);
    });
  };

  if (!results && !caseData) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-500">
          <p>No report data provided. Please generate a report from a Case or the Analyzer.</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-light-accent text-white rounded">Go Back</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-6 h-6 mr-3 text-light-accent dark:text-dark-accent" />
              Intelligence Report Preview
            </h1>
          </div>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            DOWNLOAD PDF REPORT
          </button>
        </div>

        {/* This div is styled specifically for printing/PDF generation. We force a white background and black text overriding the dark theme. */}
        <div className="bg-gray-200 dark:bg-gray-900 p-8 rounded-lg overflow-x-auto shadow-inner border border-gray-300 dark:border-gray-700">
          <div 
            ref={reportRef} 
            className="bg-white text-black p-10 max-w-3xl mx-auto shadow-lg"
            style={{ width: '210mm', minHeight: '297mm', color: '#000000', backgroundColor: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}
          >
            {/* Report Header */}
            <div className="border-b-4 border-gray-800 pb-4 mb-6 text-center">
              <h1 className="text-3xl font-black uppercase tracking-widest text-black m-0">BHAIRAV</h1>
              <h2 className="text-xl font-bold text-gray-700 mt-2">AI-CRIMINAL ANALYZER REPORT</h2>
            </div>
            
            <div className="flex justify-between text-sm mb-8 border-b border-gray-300 pb-4">
              <div>
                <p><strong>REPORT ID:</strong> RPT-{new Date().getTime().toString().slice(-6)}</p>
                <p><strong>ANALYST:</strong> Officer (Auto-Generated)</p>
              </div>
              <div className="text-right">
                <p><strong>DATE:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                {query && <p><strong>QUERY:</strong> "{query}"</p>}
              </div>
            </div>

            {/* AI Summary / Executive Summary */}
            {results?.summary && (
              <div className="mb-8">
                <h3 className="text-lg font-bold bg-gray-100 p-2 mb-3 border-l-4 border-blue-600 uppercase">Executive Summary (AI-ASSISTED ANALYSIS)</h3>
                <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">{results.summary}</p>
              </div>
            )}

            {/* Case Data Details if navigated from Case */}
            {caseData && (
              <div className="mb-8">
                <h3 className="text-lg font-bold bg-gray-100 p-2 mb-3 border-l-4 border-gray-800 uppercase">Case Information (DATABASE RECORD)</h3>
                <table className="w-full text-sm text-left mb-6 border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200"><th className="py-2 w-1/3">Case ID</th><td className="py-2">{caseData.case_number}</td></tr>
                    <tr className="border-b border-gray-200"><th className="py-2">Title</th><td className="py-2">{caseData.title}</td></tr>
                    <tr className="border-b border-gray-200"><th className="py-2">Crime Type</th><td className="py-2">{caseData.crime_type}</td></tr>
                    <tr className="border-b border-gray-200"><th className="py-2">Status</th><td className="py-2">{caseData.status}</td></tr>
                    <tr className="border-b border-gray-200"><th className="py-2">Location</th><td className="py-2">{caseData.location?.city || caseData.location?.district || 'Unknown'}</td></tr>
                    <tr className="border-b border-gray-200"><th className="py-2">Officer</th><td className="py-2">{caseData.officer}</td></tr>
                  </tbody>
                </table>

                {caseData.ai_summary && (
                  <div className="mb-6">
                    <h4 className="font-bold text-sm mb-2 uppercase border-b border-gray-300 pb-1">AI-Assisted Case Analysis</h4>
                    <p className="text-sm text-gray-800 italic">{caseData.ai_summary}</p>
                  </div>
                )}
              </div>
            )}

            {/* DB Matches from Analyzer */}
            {results?.results && results.results.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold bg-gray-100 p-2 mb-3 border-l-4 border-gray-800 uppercase flex items-center">
                  <Database className="w-4 h-4 mr-2 text-black" />
                  Database Records Matches
                </h3>
                
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-200 text-black">
                      <th className="p-2 text-left border border-gray-300">Type</th>
                      <th className="p-2 text-left border border-gray-300">ID / Source</th>
                      <th className="p-2 text-left border border-gray-300">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((r: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="p-2 font-semibold uppercase text-xs border border-gray-300">{r.type}</td>
                        <td className="p-2 border border-gray-300">
                          {/* We make it clickable for the web preview, but it looks like text for PDF */}
                          <Link to={r.link} className="text-blue-700 underline font-mono">{r.id}</Link>
                        </td>
                        <td className="p-2 border border-gray-300">
                          <strong>{r.title}</strong><br/>
                          <span className="text-gray-600 text-xs">{r.description}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Source Footer */}
            <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
              <p>CONFIDENTIAL INTELLIGENCE DOCUMENT</p>
              <p>This report contains automated AI assistance. Information should be independently verified.</p>
              <p className="mt-1">Generated by Bhairav Core Platform</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportView;
