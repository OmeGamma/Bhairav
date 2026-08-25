import React from 'react';
import { StatusBadge, StatusType } from './StatusBadge';

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO or formatted date
  title: string;
  description?: string;
  status?: StatusType | string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {events.map((event, index) => (
        <div 
          key={event.id} 
          className={`relative flex gap-4 ${event.onClick ? 'cursor-pointer hover:bg-gray-800/50 p-2 -m-2 rounded transition-colors' : ''}`}
          onClick={event.onClick}
        >
          {/* Vertical line connecting timeline items, skip on last item */}
          {index < events.length - 1 && (
            <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gray-700" />
          )}
          
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center z-10 text-gray-400">
            {event.icon || <span className="w-2 h-2 bg-gray-400 rounded-full" />}
          </div>
          
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-white">{event.title}</h4>
              <time className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
            </div>
            
            {event.description && (
              <p className="text-sm text-gray-400 mt-1">{event.description}</p>
            )}
            
            {(event.status || event.severity) && (
              <div className="mt-2 flex gap-2">
                {event.status && <StatusBadge status={event.status} />}
                {event.severity && <StatusBadge status={event.severity} />}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {events.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-4">No events found in timeline.</div>
      )}
    </div>
  );
};
