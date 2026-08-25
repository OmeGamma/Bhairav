import React from 'react';
import { Report } from '../../types/reports';
import { StatusBadge } from '../Shared/StatusBadge';

interface ReportCardProps {
  report: Report;
  onView: (id: string) => void;
  onExport: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onView, onExport }) => {
  const getIcon = (category: string) => {
    switch(category) {
      case 'Verification':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'Network Intelligence':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
      case 'Personnel Welfare':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="bg-[#12141a] border border-gray-800 hover:border-gray-600 rounded-xl p-5 flex flex-col h-full transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-blue-400">
            {getIcon(report.category)}
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{report.category}</span>
        </div>
        <StatusBadge status={report.status === 'READY' ? 'VERIFIED' : report.status} />
      </div>
      
      <h3 className="text-lg font-semibold text-white leading-tight mb-2">{report.title}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">{new Date(report.date).toLocaleDateString()} • ID: {report.id}</p>
      
      <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3">{report.summary}</p>
      
      <div className="flex gap-2 pt-4 border-t border-gray-800">
        <button 
          onClick={() => onView(report.id)}
          className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
        >
          View
        </button>
        <button 
          onClick={() => onExport(report.id)}
          className="px-4 py-2 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 rounded transition-colors flex items-center justify-center"
          title="Export PDF"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
