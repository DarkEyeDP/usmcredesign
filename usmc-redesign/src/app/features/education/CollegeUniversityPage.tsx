import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SEOHead } from '@/app/components/SEOHead';
import { useTheme } from '@/app/features/theme/ThemeContext';
import { STORAGE_KEY, loadSaved } from '@/app/features/education/degree-planner/storage';
import { PopularSchoolsRow } from './college-university/components/PopularSchoolsRow';
import { RecentlyViewedRow } from './college-university/components/RecentlyViewedRow';
import { SavedSchoolsRow } from './college-university/components/SavedSchoolsRow';
import { SchoolFilters } from './college-university/components/SchoolFilters';
import { SchoolResultsList } from './college-university/components/SchoolResultsList';
import { SchoolDetailPanel } from './college-university/components/SchoolDetailPanel';
import { CompareBar } from './college-university/components/CompareBar';
import { CompareView } from './college-university/components/CompareView';
import { fetchSchools } from './college-university/utils';
import { loadSavedSchools, toggleSavedSchool } from './college-university/savedStorage';
import { loadRecentSchools, addRecentSchool } from './college-university/recentStorage';
import type { SchoolResult, SortOption, TuitionMode } from './college-university/types';

export function CollegeUniversityPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDesert = theme === 'desert';

  // Filters
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [distanceOnly, setDistanceOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('best-match');
  const [tuitionMode, setTuitionMode] = useState<TuitionMode>('in-state');

  // Results + pagination
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Selection + compare
  const [selectedSchool, setSelectedSchool] = useState<SchoolResult | null>(null);
  const [compareSchools, setCompareSchools] = useState<SchoolResult[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Saved + recently viewed
  const [savedSchools, setSavedSchools] = useState<SchoolResult[]>(loadSavedSchools);
  const [savedFilter, setSavedFilter] = useState(false);
  const [recentSchools, setRecentSchools] = useState<SchoolResult[]>(loadRecentSchools);

  const detailRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a ref with the latest filter values so the stable runSearch callback always reads current state
  const filtersRef = useRef({ stateFilter, ownershipFilter, fieldOfStudy, distanceOnly });
  useEffect(() => {
    filtersRef.current = { stateFilter, ownershipFilter, fieldOfStudy, distanceOnly };
  }, [stateFilter, ownershipFilter, fieldOfStudy, distanceOnly]);

  const canSearch = query.trim().length >= 2 || !!stateFilter || !!ownershipFilter || !!fieldOfStudy || distanceOnly;
  const isBrowseMode = query.trim().length < 2 && (!!stateFilter || !!ownershipFilter || !!fieldOfStudy || distanceOnly);

  // q is passed explicitly so debounce callers can use the freshest typed value without closure lag
  const runSearch = useCallback(async (q: string, page = 0) => {
    const workerUrl = import.meta.env.VITE_SCHOOL_SEARCH_WORKER_URL;
    if (!workerUrl) return;
    const { stateFilter: state, ownershipFilter: ownership, fieldOfStudy: fos, distanceOnly: dist } = filtersRef.current;
    setLoading(true);
    setHasSearched(true);
    try {
      const { results: newResults, total: newTotal } = await fetchSchools(workerUrl, {
        q: q.trim() || undefined,
        state: state || undefined,
        ownership: ownership || undefined,
        fieldOfStudy: fos || undefined,
        distanceOnly: dist || undefined,
        page,
      });
      if (page === 0) {
        setResults(newResults);
      } else {
        setResults(prev => [...prev, ...newResults]);
      }
      setTotal(newTotal);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(v: string) {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(v, 0), 400);
    } else if (!v.trim()) {
      setResults([]);
      setHasSearched(false);
    }
  }

  function handleSearch() {
    if (!canSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(query, 0);
  }

  function handleLoadMore() {
    runSearch(query, currentPage + 1);
  }

  function handleSelectSchool(school: SchoolResult) {
    setSelectedSchool(school);
    const updated = addRecentSchool(school, recentSchools);
    setRecentSchools(updated);
    if (window.innerWidth < 1024) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }

  function handleToggleCompare(school: SchoolResult) {
    setCompareSchools(prev => {
      if (prev.some(s => s.name === school.name)) return prev.filter(s => s.name !== school.name);
      if (prev.length >= 3) return prev;
      return [...prev, school];
    });
  }

  function handleToggleSave(school: SchoolResult) {
    setSavedSchools(prev => toggleSavedSchool(school, prev));
  }

  function handleAddToPlanner(school: SchoolResult) {
    const updated = {
      ...loadSaved(),
      school: school.name,
      schoolDetails: {
        ownership: school.ownership,
        distanceOnly: school.distanceOnly,
        tuitionInState: school.tuitionInState,
        tuitionOutOfState: school.tuitionOutOfState,
        city: school.city,
        state: school.state,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    navigate('/education/degree-planner');
  }

  return (
    <div className="pb-20 md:pb-5">
      <SEOHead
        title="College & Universities"
        description="Search TA-eligible colleges and universities. Compare tuition costs against the USMC Tuition Assistance cap and find the right school for your education benefits."
        path="/education/college-university"
      />

      {/* Popular Schools */}
      <div className="px-8 py-6 border-b border-white/12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-red-600" />
          <div className="text-[13px] font-bold tracking-[0.2em] text-gray-300">POPULAR SCHOOLS FOR MARINES</div>
        </div>
        <PopularSchoolsRow
          tuitionMode={tuitionMode}
          isDesert={isDesert}
          onSelect={handleSelectSchool}
          selectedName={selectedSchool?.name}
        />
      </div>

      {/* Recently Viewed */}
      {recentSchools.length > 0 && (
        <div className="px-8 py-3 border-b border-white/12">
          <RecentlyViewedRow
            schools={recentSchools}
            tuitionMode={tuitionMode}
            isDesert={isDesert}
            selectedName={selectedSchool?.name}
            onSelect={handleSelectSchool}
          />
        </div>
      )}

      {/* Saved Schools */}
      {savedSchools.length > 0 && (
        <div className="px-8 py-3 border-b border-white/12">
          <SavedSchoolsRow
            schools={savedSchools}
            tuitionMode={tuitionMode}
            isDesert={isDesert}
            selectedName={selectedSchool?.name}
            onSelect={handleSelectSchool}
            onUnsave={handleToggleSave}
          />
        </div>
      )}

      {/* Search & Results */}
      <div className="px-8 py-6">
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] font-bold tracking-[0.2em] text-gray-300">FIND SCHOOLS</div>
          </div>
          <SchoolFilters
            query={query}
            stateFilter={stateFilter}
            ownershipFilter={ownershipFilter}
            fieldOfStudy={fieldOfStudy}
            distanceOnly={distanceOnly}
            loading={loading}
            canSearch={canSearch}
            isBrowseMode={isBrowseMode}
            isDesert={isDesert}
            onQueryChange={handleQueryChange}
            onStateChange={setStateFilter}
            onOwnershipChange={setOwnershipFilter}
            onFieldOfStudyChange={setFieldOfStudy}
            onDistanceOnlyChange={setDistanceOnly}
            onSearch={handleSearch}
          />
          <p className="text-[11px] text-gray-500 mt-2.5">
            * Tuition figures are estimates (College Scorecard annual cost ÷ 30 credits) and may differ from actual per-credit rates. Confirm with the school's military/veterans office before enrolling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          <SchoolResultsList
            results={results}
            total={total}
            loading={loading}
            hasSearched={hasSearched}
            sort={sort}
            tuitionMode={tuitionMode}
            savedFilter={savedFilter}
            savedSchools={savedSchools}
            selectedSchool={selectedSchool}
            compareSchools={compareSchools}
            isDesert={isDesert}
            onSortChange={setSort}
            onTuitionModeChange={setTuitionMode}
            onSavedFilterChange={setSavedFilter}
            onSelectSchool={handleSelectSchool}
            onToggleCompare={handleToggleCompare}
            onToggleSave={handleToggleSave}
            onLoadMore={handleLoadMore}
          />

          <div ref={detailRef} className="lg:sticky lg:top-4 lg:self-start">
            <SchoolDetailPanel
              school={selectedSchool}
              isSaved={savedSchools.some(s => s.name === selectedSchool?.name)}
              tuitionMode={tuitionMode}
              isDesert={isDesert}
              onAddToPlanner={handleAddToPlanner}
              onToggleSave={handleToggleSave}
              onTuitionModeChange={setTuitionMode}
            />
          </div>
        </div>
      </div>

      <CompareBar
        schools={compareSchools}
        isDesert={isDesert}
        onRemove={name => setCompareSchools(prev => prev.filter(s => s.name !== name))}
        onClear={() => setCompareSchools([])}
        onCompare={() => setShowCompare(true)}
      />

      {showCompare && (
        <CompareView
          schools={compareSchools}
          tuitionMode={tuitionMode}
          isDesert={isDesert}
          onClose={() => setShowCompare(false)}
          onAddToPlanner={school => { setShowCompare(false); handleAddToPlanner(school); }}
        />
      )}
    </div>
  );
}
