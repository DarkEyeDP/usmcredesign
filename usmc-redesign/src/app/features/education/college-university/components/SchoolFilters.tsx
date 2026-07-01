import { Search, ChevronDown } from 'lucide-react';
import { US_STATES, FIELD_OF_STUDY_OPTIONS } from '../constants';

interface Props {
  query: string;
  stateFilter: string;
  ownershipFilter: string;
  fieldOfStudy: string;
  distanceOnly: boolean;
  loading: boolean;
  canSearch: boolean;
  isBrowseMode: boolean;
  isDesert: boolean;
  onQueryChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onOwnershipChange: (v: string) => void;
  onFieldOfStudyChange: (v: string) => void;
  onDistanceOnlyChange: (v: boolean) => void;
  onSearch: () => void;
}

export function SchoolFilters({
  query, stateFilter, ownershipFilter, fieldOfStudy, distanceOnly,
  loading, canSearch, isBrowseMode, isDesert,
  onQueryChange, onStateChange, onOwnershipChange, onFieldOfStudyChange,
  onDistanceOnlyChange, onSearch,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Row 1: name + field of study */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1.5">SEARCH</div>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSearch && onSearch()}
              placeholder="School name or keyword"
              className="w-full bg-black border border-white/16 px-3 py-2.5 pr-9 text-[13px] text-white placeholder-gray-700 focus:outline-none focus:border-red-500/50 font-mono"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          </div>
        </div>

        <div className="w-52">
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1.5">FIELD OF STUDY</div>
          <div className="relative">
            <select
              value={fieldOfStudy}
              onChange={e => onFieldOfStudyChange(e.target.value)}
              className="w-full appearance-none bg-black border border-white/16 px-3 py-2.5 pr-8 text-[13px] text-white focus:outline-none focus:border-red-500/50 font-mono"
            >
              <option value="">Any Field</option>
              {FIELD_OF_STUDY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Row 2: state + school type + online + search button */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-40">
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1.5">STATE</div>
          <div className="relative">
            <select
              value={stateFilter}
              onChange={e => onStateChange(e.target.value)}
              className="w-full appearance-none bg-black border border-white/16 px-3 py-2.5 pr-8 text-[13px] text-white focus:outline-none focus:border-red-500/50 font-mono"
            >
              <option value="">All States</option>
              {US_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          </div>
        </div>

        <div className="w-40">
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1.5">SCHOOL TYPE</div>
          <div className="relative">
            <select
              value={ownershipFilter}
              onChange={e => onOwnershipChange(e.target.value)}
              className="w-full appearance-none bg-black border border-white/16 px-3 py-2.5 pr-8 text-[13px] text-white focus:outline-none focus:border-red-500/50 font-mono"
            >
              <option value="">All Types</option>
              <option value="1">Public</option>
              <option value="2">Private Nonprofit</option>
              <option value="3">For-Profit</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          </div>
        </div>

        <div className="w-40">
          <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-1.5">ONLINE PROGRAMS</div>
          <div className="relative">
            <select
              value={distanceOnly ? 'distance' : 'any'}
              onChange={e => onDistanceOnlyChange(e.target.value === 'distance')}
              className="w-full appearance-none bg-black border border-white/16 px-3 py-2.5 pr-8 text-[13px] text-white focus:outline-none focus:border-red-500/50 font-mono"
            >
              <option value="any">Any</option>
              <option value="distance">Distance Only</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          </div>
        </div>

        <button
          onClick={onSearch}
          disabled={loading || !canSearch}
          className={`px-6 py-2.5 text-[11px] font-bold tracking-widest border transition-colors disabled:opacity-40 ${
            isDesert
              ? 'border-red-700 bg-red-700 text-red-50 hover:bg-red-800'
              : 'border-red-600 bg-red-950/40 text-white hover:bg-red-600'
          }`}
        >
          {loading ? 'SEARCHING...' : isBrowseMode ? 'BROWSE SCHOOLS' : 'SEARCH SCHOOLS'}
        </button>
      </div>

      {isBrowseMode && (
        <p className={`text-[10px] ${isDesert ? 'text-amber-700' : 'text-amber-500/70'}`}>
          Browse mode — searching by filters only. Add a school name to narrow results further.
        </p>
      )}
    </div>
  );
}
