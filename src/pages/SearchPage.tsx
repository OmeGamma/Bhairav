import { useState } from 'react';
import { Search as SearchIcon, Filter, User, MapPin, Video, FileText, ArrowRight } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { cn } from '../utils/cn';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Results' },
    { id: 'people', label: 'People & Entities' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'locations', label: 'Locations' },
    { id: 'events', label: 'Events & Cases' },
    { id: 'media', label: 'Media & CCTV' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center justify-center text-center mt-12 mb-10">
         <div className="w-16 h-16 rounded-full bg-[var(--color-bhairav-primary)]/10 flex items-center justify-center mb-6 border border-[var(--color-bhairav-primary)]/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <SearchIcon className="text-[var(--color-bhairav-primary)]" size={28} />
         </div>
         <h2 className="text-3xl font-bold tracking-tight mb-3">Universal Intelligence Search</h2>
         <p className="text-[var(--color-bhairav-text-muted)] max-w-lg">
           Cross-reference entities, events, vehicles, locations, and documents across the entire Bhairav database.
         </p>
      </div>

      <div className="max-w-3xl w-full mx-auto relative z-10">
        <div className="relative group flex items-center">
          <div className="absolute left-4 z-20">
            <SearchIcon className="text-[var(--color-bhairav-text-muted)] group-focus-within:text-[var(--color-bhairav-primary)] transition-colors" size={24} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for names, IDs, plates, locations, or describe an event..." 
            className="w-full bg-[var(--color-bhairav-surface)] border-2 border-[var(--color-bhairav-border)] text-lg rounded-xl pl-14 pr-32 py-5 shadow-2xl focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-4 focus:ring-[var(--color-bhairav-primary)]/20 transition-all placeholder:text-[var(--color-bhairav-text-muted)]/70"
          />
          <div className="absolute right-3 z-20 flex items-center gap-2">
             <button className="bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md">
               Search
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                activeFilter === f.id
                  ? "bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-primary)] border-[var(--color-bhairav-primary)]/30"
                  : "bg-[var(--color-bhairav-surface)] text-[var(--color-bhairav-text-muted)] border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-text-muted)]"
              )}
            >
              {f.label}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-full text-sm font-medium border border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-surface)] text-[var(--color-bhairav-text-muted)] hover:border-[var(--color-bhairav-text-muted)] transition-colors flex items-center gap-1 ml-auto">
             <Filter size={14} /> Advanced
          </button>
        </div>
      </div>

      {/* Mock Search Results State (when typing) */}
      <div className={cn("mt-12 max-w-4xl w-full mx-auto transition-opacity duration-500", searchQuery.length > 2 ? "opacity-100" : "opacity-0 pointer-events-none")}>
         <div className="flex items-center justify-between mb-4 border-b border-[var(--color-bhairav-border)] pb-2">
            <h3 className="text-sm font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-wider">Top Results</h3>
            <span className="text-xs text-[var(--color-bhairav-text-muted)]">Showing results for "{searchQuery}"</span>
         </div>
         
         <div className="space-y-4">
            {/* Person Result */}
            <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)]/50 p-4 rounded-xl flex items-start gap-4 group cursor-pointer transition-colors">
               <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 border border-gray-700">
                  <User size={24} className="text-gray-400" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <h4 className="font-bold text-lg text-[var(--color-bhairav-text)] group-hover:text-[var(--color-bhairav-primary)] transition-colors">Unknown Subject A (Sector X)</h4>
                     <Badge status="warning" dot={false}>POI</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-bhairav-text-muted)] line-clamp-1 mb-2">Subject matches partial description from recent perimeter anomaly event BH-104.</p>
                  <div className="flex gap-4 text-xs text-[var(--color-bhairav-text-muted)]">
                     <span className="flex items-center gap-1"><MapPin size={12}/> Last seen: Sector X</span>
                     <span className="flex items-center gap-1"><FileText size={12}/> 3 Related Reports</span>
                  </div>
               </div>
               <div className="shrink-0 pt-2">
                  <ArrowRight size={20} className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors" />
               </div>
            </div>

            {/* Event Result */}
            <div className="bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] hover:border-[var(--color-bhairav-primary)]/50 p-4 rounded-xl flex items-start gap-4 group cursor-pointer transition-colors">
               <div className="w-12 h-12 bg-[var(--color-bhairav-critical)]/10 text-[var(--color-bhairav-critical)] rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-bhairav-critical)]/30">
                  <Video size={24} />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <h4 className="font-bold text-lg text-[var(--color-bhairav-text)] group-hover:text-[var(--color-bhairav-primary)] transition-colors">Event #BH-104</h4>
                     <Badge status="critical" dot={false}>CRITICAL</Badge>
                  </div>
                  <p className="text-sm text-[var(--color-bhairav-text-muted)] line-clamp-1 mb-2">Restricted-zone movement detected by CAM-17.</p>
                  <div className="flex gap-4 text-xs text-[var(--color-bhairav-text-muted)]">
                     <span className="flex items-center gap-1"><MapPin size={12}/> Sector X</span>
                  </div>
               </div>
               <div className="shrink-0 pt-2">
                  <ArrowRight size={20} className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
