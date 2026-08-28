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
    <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl p-5 h-full overflow-y-auto shadow-sm">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-bhairav-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-bhairav-text)] uppercase tracking-wider">Network Controls</h3>
        <button onClick={onReset} className="text-xs text-[var(--color-bhairav-primary)] hover:text-[var(--color-bhairav-primary-hover)] transition-colors uppercase tracking-widest font-medium">Reset</button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-bhairav-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entity..." 
            className="w-full pl-9 pr-9 py-2 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] rounded-md text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-primary)] transition-colors placeholder:text-[var(--color-bhairav-text-muted)]/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] hover:text-[var(--color-bhairav-text)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">Entity Type</h4>
          <div className="space-y-3">
            {['Person', 'Vehicle', 'Location', 'Incident', 'Case', 'Organization', 'Document'].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="form-checkbox bg-[var(--color-bhairav-bg)] border-[var(--color-bhairav-border)] rounded text-[var(--color-bhairav-primary)] focus:ring-[var(--color-bhairav-primary)] focus:ring-offset-[var(--color-bhairav-surface)]" />
                <span className="text-sm text-[var(--color-bhairav-text)] group-hover:text-white transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">Relationship Type</h4>
          <div className="space-y-3">
            {['Associated', 'Contact', 'Location', 'Incident', 'Case', 'Vehicle'].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="form-checkbox bg-[var(--color-bhairav-bg)] border-[var(--color-bhairav-border)] rounded text-[var(--color-bhairav-primary)] focus:ring-[var(--color-bhairav-primary)] focus:ring-offset-[var(--color-bhairav-surface)]" />
                <span className="text-sm text-[var(--color-bhairav-text)] group-hover:text-white transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-[var(--color-bhairav-border)]">
        <button onClick={onReset} className="w-full py-2 bg-[var(--color-bhairav-bg)] hover:bg-[var(--color-bhairav-surface-hover)] text-[var(--color-bhairav-text)] rounded-md text-sm transition-colors border border-[var(--color-bhairav-border)] uppercase tracking-widest font-medium">
          Clear Filters
        </button>
      </div>
    </div>
  );
};
