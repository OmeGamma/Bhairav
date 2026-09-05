import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import type { EntityType, RelationshipType } from '../../types/network';
import { cn } from '../../utils/cn';

export const ENTITY_TYPES: EntityType[] = [
  'PERSON',
  'VEHICLE',
  'LOCATION',
  'INCIDENT',
  'CASE',
  'ORGANIZATION',
  'PHONE',
  'EVENT',
];

export const RELATIONSHIP_TYPES: RelationshipType[] = [
  'ASSOCIATED_WITH',
  'CONTACTED',
  'USES',
  'LOCATED_AT',
  'DETECTED_AT',
  'MEMBER_OF',
  'MENTIONED_IN',
  'INVOLVED',
];

interface NetworkFiltersProps {
  onFilterChange: (filters: { entityTypes: EntityType[]; relationshipTypes: RelationshipType[]; search: string; sinceDays?: number }) => void;
  onReset: () => void;
  onSearchSubmit: (query: string) => void;
  initialSearch?: string;
}

const TYPE_LABELS: Record<string, string> = {
  PERSON: 'Person',
  VEHICLE: 'Vehicle',
  LOCATION: 'Location',
  INCIDENT: 'Incident',
  CASE: 'Investigation',
  ORGANIZATION: 'Organization',
  PHONE: 'Phone',
  EVENT: 'Event',
  DOCUMENT: 'Document',
};

const REL_LABELS: Record<string, string> = {
  ASSOCIATED_WITH: 'Associated With',
  CONTACTED: 'Contacted',
  USES: 'Uses',
  LOCATED_AT: 'Located At',
  DETECTED_AT: 'Detected At',
  MEMBER_OF: 'Member Of',
  MENTIONED_IN: 'Mentioned In',
  INVOLVED: 'Involved',
  CONNECTED_TO: 'Connected To',
};

export function NetworkFilters({ onFilterChange, onReset, onSearchSubmit, initialSearch = '' }: NetworkFiltersProps) {
  const [search, setSearch] = useState(initialSearch);
  const [entityTypes, setEntityTypes] = useState<EntityType[]>(ENTITY_TYPES);
  const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>(RELATIONSHIP_TYPES);
  const [sinceDays, setSinceDays] = useState<number | undefined>(undefined);

  useEffect(() => {
    onFilterChange({ entityTypes, relationshipTypes, search, sinceDays });
  }, [entityTypes, relationshipTypes, search, sinceDays, onFilterChange]);

  const toggleType = (t: EntityType) => {
    setEntityTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  const toggleRel = (r: RelationshipType) => {
    setRelationshipTypes((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  return (
    <div className="bg-[var(--color-bhairav-slate)] border border-[var(--color-bhairav-graphite)] rounded-xl p-5 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--color-bhairav-graphite)]">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Controls</h3>
        <button
          onClick={onReset}
          className="text-[10px] text-[var(--color-bhairav-steel)] hover:text-white transition-colors uppercase tracking-widest font-medium"
        >
          Reset
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-[10px] font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-2">
          Find entity
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (search.trim()) onSearchSubmit(search.trim());
          }}
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearch('');
              }}
              placeholder="Search person, vehicle, case..."
              className="w-full pl-9 pr-8 py-2 bg-[var(--color-bhairav-bg)] border border-[var(--color-bhairav-graphite)] rounded-md text-sm text-[var(--color-bhairav-text)] focus:outline-none focus:border-[var(--color-bhairav-steel)] transition-colors placeholder:text-[var(--color-bhairav-text-muted)]/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-bhairav-text-muted)] hover:text-white p-1"
                title="Clear"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Date range */}
      <div className="mb-6">
        <label className="block text-[10px] font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-2">
          Time range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSinceDays(undefined)}
            className={cn(
              "px-2 py-1.5 text-xs rounded border transition-colors",
              sinceDays === undefined
                ? "bg-[var(--color-bhairav-steel)]/20 border-[var(--color-bhairav-steel)] text-white"
                : "border-[var(--color-bhairav-graphite)] text-[var(--color-bhairav-text-muted)] hover:text-white"
            )}
          >
            All
          </button>
          <button
            onClick={() => setSinceDays(7)}
            className={cn(
              "px-2 py-1.5 text-xs rounded border transition-colors",
              sinceDays === 7
                ? "bg-[var(--color-bhairav-steel)]/20 border-[var(--color-bhairav-steel)] text-white"
                : "border-[var(--color-bhairav-graphite)] text-[var(--color-bhairav-text-muted)] hover:text-white"
            )}
          >
            7 days
          </button>
          <button
            onClick={() => setSinceDays(30)}
            className={cn(
              "px-2 py-1.5 text-xs rounded border transition-colors",
              sinceDays === 30
                ? "bg-[var(--color-bhairav-steel)]/20 border-[var(--color-bhairav-steel)] text-white"
                : "border-[var(--color-bhairav-graphite)] text-[var(--color-bhairav-text-muted)] hover:text-white"
            )}
          >
            30 days
          </button>
          <button
            onClick={() => setSinceDays(90)}
            className={cn(
              "px-2 py-1.5 text-xs rounded border transition-colors",
              sinceDays === 90
                ? "bg-[var(--color-bhairav-steel)]/20 border-[var(--color-bhairav-steel)] text-white"
                : "border-[var(--color-bhairav-graphite)] text-[var(--color-bhairav-text-muted)] hover:text-white"
            )}
          >
            90 days
          </button>
        </div>
      </div>

      {/* Entity types */}
      <div className="mb-6">
        <h4 className="text-[10px] font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">
          Entity type
        </h4>
        <div className="space-y-2">
          {ENTITY_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={entityTypes.includes(t)}
                onChange={() => toggleType(t)}
                className="rounded border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-steel)] focus:ring-[var(--color-bhairav-steel)]"
              />
              <span className="text-xs text-[var(--color-bhairav-text-muted)] group-hover:text-white transition-colors">
                {TYPE_LABELS[t] || t}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Relationship types */}
      <div className="mb-2">
        <h4 className="text-[10px] font-medium text-[var(--color-bhairav-text-muted)] uppercase tracking-widest mb-3">
          Relationship
        </h4>
        <div className="space-y-2">
          {RELATIONSHIP_TYPES.map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={relationshipTypes.includes(r)}
                onChange={() => toggleRel(r)}
                className="rounded border-[var(--color-bhairav-graphite)] bg-[var(--color-bhairav-bg)] text-[var(--color-bhairav-steel)] focus:ring-[var(--color-bhairav-steel)]"
              />
              <span className="text-xs text-[var(--color-bhairav-text-muted)] group-hover:text-white transition-colors">
                {REL_LABELS[r] || r}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
