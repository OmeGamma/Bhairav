import React from 'react';

interface SupportCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  options: { label: string, isUrgent?: boolean }[];
  onSelect: (option: string) => void;
}

interface SupportCategoryGridProps {
  onSelect: (option: string) => void;
}

export const SupportCategoryGrid: React.FC<SupportCategoryGridProps> = ({ onSelect }) => {
  const categories: SupportCategory[] = [
    {
      title: 'Duty & Recovery',
      description: 'Operational workload and fatigue management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      options: [
        { label: 'Workload Concern' },
        { label: 'Recovery Request' },
        { label: 'Fatigue Support' }
      ],
      onSelect
    },
    {
      title: 'Human Support',
      description: 'Connect with designated personnel',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      options: [
        { label: 'Welfare Officer' },
        { label: 'Medical Support' },
        { label: 'Professional Pathway' },
        { label: 'Trusted Peer' }
      ],
      onSelect
    },
    {
      title: 'Wellbeing',
      description: 'Evidence-based stress management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      ),
      options: [
        { label: 'Sleep/Recovery' },
        { label: 'Stress Management' },
        { label: 'Grounding Exercises' }
      ],
      onSelect
    },
    {
      title: 'Immediate Support',
      description: 'Direct access to emergency resources',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      options: [
        { label: 'Emergency Contact', isUrgent: true },
        { label: 'Crisis Pathway', isUrgent: true }
      ],
      onSelect
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category, idx) => (
        <div key={idx} className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
          <div className="p-5 border-b border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface-hover)] flex gap-4">
            <div className="w-10 h-10 rounded-md bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-border)] flex items-center justify-center text-[var(--color-bhairav-text-muted)] flex-shrink-0">
              {category.icon}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-bhairav-text)] uppercase tracking-wider">{category.title}</h3>
              <p className="text-[10px] text-[var(--color-bhairav-text-muted)] mt-1 uppercase tracking-widest font-mono">{category.description}</p>
            </div>
          </div>
          <div className="p-4 flex-1">
            <div className="grid grid-cols-1 gap-2">
              {category.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => category.onSelect(option.label)}
                  className={`text-left px-4 py-3 rounded-lg border text-xs font-bold uppercase tracking-widest transition-colors flex justify-between items-center group
                    ${option.isUrgent 
                      ? 'bg-[var(--color-bhairav-critical)]/10 border-[var(--color-bhairav-critical)]/30 hover:border-[var(--color-bhairav-critical)]/60 text-[var(--color-bhairav-critical)]' 
                      : 'bg-[var(--color-bhairav-bg)] border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)]/50 text-[var(--color-bhairav-text)]'
                    }
                  `}
                >
                  <span>{option.label}</span>
                  <svg className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${option.isUrgent ? 'text-[var(--color-bhairav-critical)]' : 'text-[var(--color-bhairav-primary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
