import React, { useState } from 'react';

interface NetworkFiltersProps {
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

export const NetworkFilters: React.FC<NetworkFiltersProps> = ({ onFilterChange, onReset }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    setSearchQuery('');
    onFilterChange({});
  };

  return (
    <div className="bg-[#12141a] border border-gray-800 rounded-lg p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Network Controls</h3>
        <button onClick={onReset} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Reset View</button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entity..." 
            className="w-full pl-9 pr-9 py-2 bg-[#1a1d24] border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Entity Type</h4>
          <div className="space-y-2">
            {['Person', 'Vehicle', 'Location', 'Incident', 'Case', 'Organization', 'Document'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked className="form-checkbox bg-gray-800 border-gray-700 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Relationship Type</h4>
          <div className="space-y-2">
            {['Associated', 'Contact', 'Location', 'Incident', 'Case', 'Vehicle'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked className="form-checkbox bg-gray-800 border-gray-700 rounded text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-800">
        <button onClick={onReset} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors border border-gray-700">
          Clear Filters
        </button>
      </div>
    </div>
  );
};
