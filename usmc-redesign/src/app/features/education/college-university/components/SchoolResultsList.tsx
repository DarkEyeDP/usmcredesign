import { ChevronDown } from 'lucide-react';
import { SchoolResultCard } from './SchoolResultCard';
import { sortSchools } from '../utils';
import type { SchoolResult, SortOption, TuitionMode } from '../types';

interface Props {
  results: SchoolResult[];
  total: number;
  loading: boolean;
  hasSearched: boolean;
  sort: SortOption;
  tuitionMode: TuitionMode;
  savedFilter: boolean;
  savedSchools: SchoolResult[];
  selectedSchool: SchoolResult | null;
  compareSchools: SchoolResult[];
  isDesert: boolean;
  onSortChange: (s: SortOption) => void;
  onTuitionModeChange: (m: TuitionMode) => void;
  onSavedFilterChange: (v: boolean) => void;
  onSelectSchool: (s: SchoolResult) => void;
  onToggleCompare: (s: SchoolResult) => void;
  onToggleSave: (s: SchoolResult) => void;
  onLoadMore: () => void;
}

export function SchoolResultsList({
  results, total, loading, hasSearched, sort, tuitionMode, savedFilter,
  savedSchools, selectedSchool, compareSchools, isDesert,
  onSortChange, onTuitionModeChange, onSavedFilterChange,
  onSelectSchool, onToggleCompare, onToggleSave, onLoadMore,
}: Props) {
  const savedCount = savedSchools.length;

  const displayResults = savedFilter ? savedSchools : results;
  const sorted = sortSchools(displayResults, sort);

  if (!hasSearched && !loading) {
    return (
      <div className="border border-white/12 bg-black p-6 text-center">
        <div className="text-[11px] text-gray-600 tracking-wider">USE THE FILTERS ABOVE TO SEARCH OR BROWSE SCHOOLS</div>
      </div>
    );
  }

  return (
    <div className="border border-white/12 bg-black">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-gray-400">
            {loading
              ? <span className="text-gray-700">Searching…</span>
              : total > 0 && (
                <span>
                  <span className="font-bold text-white">{results.length}</span>
                  <span className="text-gray-600"> of {total.toLocaleString()}</span>
                </span>
              )
            }
          </div>

          {savedCount > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onSavedFilterChange(false)}
                className={`px-2 py-0.5 text-[9px] font-bold tracking-wider border transition-colors ${
                  !savedFilter
                    ? isDesert ? 'bg-red-700 border-red-700 text-white' : 'bg-red-950/50 border-red-600 text-white'
                    : 'border-white/16 text-gray-600 hover:text-gray-400'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => onSavedFilterChange(true)}
                className={`px-2 py-0.5 text-[9px] font-bold tracking-wider border transition-colors ${
                  savedFilter
                    ? isDesert ? 'bg-red-700 border-red-700 text-white' : 'bg-red-950/50 border-red-600 text-white'
                    : 'border-white/16 text-gray-600 hover:text-gray-400'
                }`}
              >
                ★ SAVED {savedCount}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Tuition mode toggle */}
          <div className="flex items-center border border-white/10">
            <button
              onClick={() => onTuitionModeChange('in-state')}
              className={`px-2.5 py-1 text-[9px] font-bold tracking-wider transition-colors ${
                tuitionMode === 'in-state'
                  ? isDesert ? 'bg-red-700 text-white' : 'bg-red-950/50 text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              IN-STATE
            </button>
            <div className="w-px h-3 bg-white/10" />
            <button
              onClick={() => onTuitionModeChange('out-of-state')}
              className={`px-2.5 py-1 text-[9px] font-bold tracking-wider transition-colors ${
                tuitionMode === 'out-of-state'
                  ? isDesert ? 'bg-red-700 text-white' : 'bg-red-950/50 text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              OOS
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-black border border-white/16 pl-2 pr-6 py-1 text-[10px] text-gray-400 focus:outline-none font-mono"
            >
              <option value="best-match">BEST MATCH</option>
              <option value="tuition-asc">TUITION ↑</option>
              <option value="tuition-desc">TUITION ↓</option>
              <option value="name-az">A → Z</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Skeleton */}
      {loading && results.length === 0 && (
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-white/10 last:border-0 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-2.5 bg-white/[0.06] rounded w-1/3" />
                </div>
                <div className="w-16 space-y-1.5">
                  <div className="h-2.5 bg-white/10 rounded" />
                  <div className="h-2.5 bg-white/[0.06] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && hasSearched && sorted.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-[11px] font-bold tracking-widest text-gray-700">NO SCHOOLS FOUND</div>
          <div className="text-[11px] text-gray-700 mt-1">
            {savedFilter ? 'None of your saved schools match the current search.' : 'Try adjusting your search filters.'}
          </div>
        </div>
      )}

      {sorted.map(school => (
        <SchoolResultCard
          key={school.name + school.city}
          school={school}
          isSelected={selectedSchool?.name === school.name}
          inCompare={compareSchools.some(c => c.name === school.name)}
          isSaved={savedSchools.some(s => s.name === school.name)}
          tuitionMode={tuitionMode}
          isDesert={isDesert}
          onSelect={() => onSelectSchool(school)}
          onToggleCompare={() => onToggleCompare(school)}
          onToggleSave={() => onToggleSave(school)}
        />
      ))}

      {/* Load more */}
      {!loading && results.length > 0 && results.length < total && (
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={onLoadMore}
            className="w-full py-2.5 text-[11px] font-bold tracking-widest border border-white/16 text-gray-500 hover:text-white hover:border-white/30 transition-colors"
          >
            LOAD MORE · {(total - results.length).toLocaleString()} REMAINING
          </button>
        </div>
      )}
    </div>
  );
}
