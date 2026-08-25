import React from 'react';

interface IntelligenceCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  indicator?: 'HIGH' | 'MEDIUM' | 'LOW' | 'REVIEW';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({
  title,
  value,
  subtitle,
  indicator,
  icon,
  children,
  className = '',
  onClick
}) => {
  let indicatorColor = '';
  if (indicator === 'HIGH' || indicator === 'REVIEW') {
    indicatorColor = 'bg-red-500/20 text-red-400 border-red-500/30';
  } else if (indicator === 'MEDIUM') {
    indicatorColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  } else if (indicator === 'LOW') {
    indicatorColor = 'bg-green-500/20 text-green-400 border-green-500/30';
  }

  return (
    <div 
      className={`bg-[#12141a] border border-gray-800 rounded-lg p-4 shadow-sm backdrop-blur-sm ${onClick ? 'cursor-pointer hover:border-gray-600 transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-400">{icon}</div>}
          <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            {value !== undefined && (
              <div className="text-2xl font-semibold text-white mt-1">{value}</div>
            )}
            {subtitle && (
              <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
            )}
          </div>
        </div>
        {indicator && (
          <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${indicatorColor}`}>
            {indicator}
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
