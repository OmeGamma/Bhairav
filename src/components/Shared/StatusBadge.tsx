import React from 'react';

export type StatusType = 'VERIFIED' | 'CONSISTENT' | 'REVIEW REQUIRED' | 'ANOMALY DETECTED' | 'UNABLE TO VERIFY' | 'PENDING' | 'IN REVIEW' | 'ASSIGNED' | 'FOLLOW-UP' | 'RESOLVED' | 'HIGH' | 'MEDIUM' | 'LOW';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let colorClass = 'bg-gray-800 text-gray-300 border-gray-700'; // Default

  const s = status.toUpperCase();
  if (s.includes('VERIFIED') || s === 'CONSISTENT' || s === 'RESOLVED' || s === 'LOW') {
    colorClass = 'bg-green-900/50 text-green-400 border-green-800';
  } else if (s.includes('REVIEW') || s === 'PENDING' || s === 'ASSIGNED' || s === 'MEDIUM') {
    colorClass = 'bg-yellow-900/50 text-yellow-400 border-yellow-800';
  } else if (s.includes('ANOMALY') || s.includes('UNABLE') || s === 'HIGH') {
    colorClass = 'bg-red-900/50 text-red-400 border-red-800';
  } else if (s === 'FOLLOW-UP') {
    colorClass = 'bg-blue-900/50 text-blue-400 border-blue-800';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colorClass} ${className}`}>
      {status}
    </span>
  );
};
