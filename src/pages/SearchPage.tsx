import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, User, MapPin, Video, FileText, ArrowRight, X, Filter, Car, Building2, AlertOctagon, FileSearch } from 'lucide-react';
import { API_BASE_URL, fetchWithTimeout } from '../services/apiClient';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { cn } from '../utils/cn';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet?: string;
}

const TYPE_ICONS: Record<string, any> = {
  incident: AlertOctagon,
  person: User,
  PERSON: User,
  vehicle: Car,
  VEHICLE: Car,
  location: MapPin,
  LOCATION: MapPin,
  event: Video,
  EVENT: Video,
  case: FileSearch,
  CASE: FileSearch,
  organization: Building2,
  ORGANIZATION: Building2,
  entity: FileText,
  ENTITY: FileText,
};

const FILTERS = [
  { id: 'all', label: 'All Results' },
  { id: 'person', label: 'People' },
  { id: 'vehicle', label: 'Vehicles' },
  { id: 'location', label: 'Locations' },
  { id: 'event', label: 'Events' },
  { id: 'case', label: 'Investigations' },
  { id: 'organization', label: 'Organizations' },
  { id: 'incident', label: 'Incidents' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithTimeout(`${API_BASE_URL}/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: q, entity_types: activeFilter === 'all' ? undefined : [activeFilter] }),
      }, 8000);
      if (!response.ok) throw new Error(`Search failed (${response.status})`);
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      setResults(results);
    } catch (e: any) {
      setError(e.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      performSearch(query);
    }, 350);
    return () => clearTimeout(t);
  }, [query, activeFilter, performSearch]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setSearchParams({});
  };

  const filtered = activeFilter === 'all' ? results : results.filter((r) => r.type === activeFilter);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col animate-fade-in-up">

      <div className="flex flex-col items-center text-center mt-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-bhairav-primary)]/10 flex items-center justify-center mb-6 border border-[var(--color-bhairav-primary)]/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <SearchIcon className="text-[var(--color-bhairav-primary)]" size={28} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Universal Intelligence Search</h1>
        <p className="text-[var(--color-bhairav-text-muted)] max-w-xl">
          Cross-reference entities, events, vehicles, locations, and investigations across the entire BHAIRAV database.
        </p>
      </div>

      <div className="relative z-10">
        <div className="relative group flex items-center">
          <div className="absolute left-4 z-20">
            <SearchIcon className="text-[var(--color-bhairav-text-muted)] group-focus-within:text-[var(--color-bhairav-primary)] transition-colors" size={22} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names, IDs, plates, locations, events..."
            className="w-full glass-sm border-2 border-[var(--color-bhairav-border-strong)] text-base sm:text-lg rounded-xl pl-14 pr-32 py-4 shadow-2xl focus:outline-none focus:border-[var(--color-bhairav-primary)] focus:ring-4 focus:ring-[var(--color-bhairav-primary)]/20 transition-all placeholder:text-[var(--color-bhairav-text-muted)]/70 text-white"
          />
          <div className="absolute right-3 z-20 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors"
                title="Clear"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={() => performSearch(query)}
              className="bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeFilter === f.id
                  ? "bg-[var(--color-bhairav-primary)]/10 text-[var(--color-bhairav-primary)] border-[var(--color-bhairav-primary)]/30"
                  : "glass-sm text-[var(--color-bhairav-text-muted)] border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-text-muted)]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingState message="Searching..." />
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-sm text-rose-300">
            {error}
          </div>
        ) : !searched ? (
          <EmptyState
            icon={SearchIcon}
            title="Start typing to search"
            description="Search across all entities, events, vehicles, and locations ingested into BHAIRAV."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No results"
            description={`No matches found for "${query}". Try a different query or filter.`}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-bhairav-text-muted)] font-mono mb-2">
              {filtered.length} result{filtered.length === 1 ? '' : 's'} for "{query}"
            </p>
            {filtered.map((r) => {
              const Icon = TYPE_ICONS[r.type] || TYPE_ICONS.ENTITY;
              return (
                <div
                  key={r.id}
                  className="glass-sm border border-[var(--color-bhairav-border-strong)] hover:border-[var(--color-bhairav-primary)]/50 p-4 rounded-xl flex items-start gap-4 group cursor-pointer transition-colors"
                >
                  <div className="w-11 h-11 bg-[var(--color-bhairav-bg)] rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-bhairav-border-strong)] text-[var(--color-bhairav-primary)]">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-base text-white group-hover:text-[var(--color-bhairav-primary)] transition-colors truncate">
                        {r.title || r.id}
                      </h4>
                      <Badge status="neutral" dot={false}>{r.type}</Badge>
                    </div>
                    {r.snippet && (
                      <p className="text-sm text-[var(--color-bhairav-text-muted)] line-clamp-2 mb-1">
                        {r.snippet}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={18} className="text-[var(--color-bhairav-text-muted)] group-hover:text-[var(--color-bhairav-primary)] transition-colors flex-shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
