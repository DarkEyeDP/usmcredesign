import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Filter, LayoutGrid, Rows3, Maximize2, Minimize2, Search, X } from 'lucide-react';
import {
  CLEARANCE_LABELS,
  EMPTY_RESULT_FILTERS,
  REQUIREMENT_FILTER_OPTIONS,
  type ClearanceLevel,
  type RequirementFilterTag,
  type ResultFilters,
  type ResultItem,
  type SortMode,
  type ResultViewMode,
} from '../types';
import { ResultRow } from './ResultRow';
import { ResultCard } from './ResultCard';
import { ResultCardDetail } from './ResultCardDetail';

interface Props {
  results: ResultItem[];
  displayCount: number;
  expandedMOS: string | null;
  sortBy: SortMode;
  viewMode: ResultViewMode;
  hasSearched: boolean;
  animationKey: number;
  totalResultsCount: number;
  filterSourceResults: ResultItem[];
  filters: ResultFilters;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onFiltersChange: (filters: ResultFilters) => void;
  onToggleExpand: (name: string) => void;
  onSortChange: (s: SortMode) => void;
  onViewModeChange: (mode: ResultViewMode) => void;
  onLoadMore: () => void;
}

const resultEntrance = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface FilterChipGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  available: T[];
  onToggle: (value: T) => void;
}

function FilterChipGroup<T extends string>({ label, options, selected, available, onToggle }: FilterChipGroupProps<T>) {
  if (options.length === 0) return null;

  const availableSet = new Set<T>(available);

  return (
    <div>
      <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-gray-600">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = selected.includes(option.value);
          const isUnavailable = !isSelected && !availableSet.has(option.value);

          return (
            <button
              key={option.value}
              type="button"
              disabled={isUnavailable}
              onClick={() => onToggle(option.value)}
              className={`border px-3 py-1.5 text-[12px] font-bold tracking-[0.14em] transition-colors ${
                isSelected
                  ? 'border-red-500/70 bg-red-900/20 text-red-300 line-through decoration-red-300/80 decoration-2'
                  : isUnavailable
                    ? 'cursor-not-allowed border-gray-800/70 bg-black/30 text-gray-700 line-through decoration-gray-700/80'
                  : 'border-green-500/35 bg-green-900/10 text-green-400/80 hover:border-green-400/60 hover:text-green-300'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ResultsPanel({
  results, displayCount, expandedMOS, sortBy, viewMode, hasSearched, animationKey,
  totalResultsCount, filterSourceResults, filters, scrollContainerRef,
  isFullscreen = false, onToggleFullscreen,
  onFiltersChange, onToggleExpand, onSortChange, onViewModeChange, onLoadMore,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMosPickerOpen, setIsMosPickerOpen] = useState(false);
  const [animatedMatchCount, setAnimatedMatchCount] = useState(0);
  const [isSingleCol, setIsSingleCol] = useState(() => window.matchMedia('(max-width: 1279px)').matches);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const countAnimationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)');
    const handler = (e: MediaQueryListEvent) => setIsSingleCol(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const visible = results.slice(0, displayCount);
  const remaining = results.length - displayCount;
  const cardRows = [];
  const excludedMosCodes = useMemo(
    () => filters.excludedMos.split(/[\s,]+/).map(code => code.trim()).filter(Boolean),
    [filters.excludedMos]
  );
  const excludedMosSet = useMemo(() => new Set(excludedMosCodes), [excludedMosCodes]);
  const excludedFieldsSet = useMemo(() => new Set(filters.excludedFields), [filters.excludedFields]);
  const excludedClearancesSet = useMemo(() => new Set(filters.excludedClearances), [filters.excludedClearances]);
  const excludedRequirementTagsSet = useMemo(() => new Set(filters.excludedRequirementTags), [filters.excludedRequirementTags]);
  const searchQuery = filters.searchQuery.trim().toLowerCase();
  const mosPickerOptions = useMemo(
    () => [...new Map(filterSourceResults.map(result => [result.id, result])).values()]
      .sort((a, b) => a.id.localeCompare(b.id)),
    [filterSourceResults]
  );
  const fieldOptions = useMemo(
    () => [...new Set(filterSourceResults.map(result => result.field))].sort(),
    [filterSourceResults]
  );
  const resultsMatchingSharedFilters = useMemo(
    () => filterSourceResults.filter(result => {
      const qualificationText = result.qualifications.join(' ').toLowerCase();
      const keywordText = [
        result.id,
        result.title,
        result.field,
        result.reqStr,
        ...result.qualifications,
      ].join(' ').toLowerCase();
      const matchesExcludedTag = REQUIREMENT_FILTER_OPTIONS.some(option =>
        excludedRequirementTagsSet.has(option.value) &&
        option.keywords.some(keyword => qualificationText.includes(keyword))
      );
      const matchesSearch = !searchQuery || keywordText.includes(searchQuery);

      return (
        matchesSearch &&
        !excludedClearancesSet.has(result.clearance) &&
        !(filters.hideColorVisionRequired && result.requiresNormalColorVision) &&
        !(filters.onlyLmBonusEligible && !result.lateralMoveBonusRange) &&
        !matchesExcludedTag
      );
    }),
    [excludedClearancesSet, excludedRequirementTagsSet, filterSourceResults, filters.hideColorVisionRequired, filters.onlyLmBonusEligible, searchQuery]
  );
  const clearanceOptions = useMemo(
    () => [...new Set(filterSourceResults.map(result => result.clearance))].sort(),
    [filterSourceResults]
  );
  const resultsMatchingNonFieldFilters = useMemo(
    () => resultsMatchingSharedFilters.filter(result => !excludedMosSet.has(result.id)),
    [excludedMosSet, resultsMatchingSharedFilters]
  );
  const resultsMatchingNonMosFilters = useMemo(
    () => resultsMatchingSharedFilters.filter(result => !excludedFieldsSet.has(result.field)),
    [excludedFieldsSet, resultsMatchingSharedFilters]
  );
  const activeFields = useMemo(
    () => [...new Set(resultsMatchingNonFieldFilters.map(result => result.field))],
    [resultsMatchingNonFieldFilters]
  );
  const activeClearances = useMemo(
    () => [...new Set(results.map(result => result.clearance))],
    [results]
  );
  const activeRequirementTags = useMemo(
    () => REQUIREMENT_FILTER_OPTIONS
      .filter(option => results.some(result => {
        const text = result.qualifications.join(' ').toLowerCase();
        return option.keywords.some(keyword => text.includes(keyword));
      }))
      .map(option => option.value),
    [results]
  );
  const availableMosCodes = useMemo(
    () => new Set(resultsMatchingNonMosFilters.map(result => result.id)),
    [resultsMatchingNonMosFilters]
  );
  const hasActiveColorVisionRequirement = results.some(result => result.requiresNormalColorVision);
  const hasActiveLmBonusEligibleResults = results.some(result => result.lateralMoveBonusRange);
  const activeFilterCount =
    (filters.searchQuery.trim().length > 0 ? 1 : 0) +
    excludedMosCodes.length +
    filters.excludedFields.length +
    filters.excludedClearances.length +
    filters.excludedRequirementTags.length +
    (filters.hideColorVisionRequired ? 1 : 0) +
    (filters.onlyLmBonusEligible ? 1 : 0);

  useEffect(() => {
    const targetCount = hasSearched ? results.length : 0;
    const startCount = animatedMatchCount;

    if (countAnimationFrameRef.current != null) {
      cancelAnimationFrame(countAnimationFrameRef.current);
    }

    if (startCount === targetCount) return;

    const duration = 450;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextCount = Math.round(startCount + (targetCount - startCount) * eased);

      setAnimatedMatchCount(nextCount);

      if (progress < 1) {
        countAnimationFrameRef.current = requestAnimationFrame(step);
      } else {
        countAnimationFrameRef.current = null;
      }
    }

    countAnimationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (countAnimationFrameRef.current != null) {
        cancelAnimationFrame(countAnimationFrameRef.current);
        countAnimationFrameRef.current = null;
      }
    };
  }, [results.length, hasSearched]);

  const rowSize = isSingleCol ? 1 : 2;
  for (let i = 0; i < visible.length; i += rowSize) {
    cardRows.push(visible.slice(i, i + rowSize));
  }

  function handleToggleExpand(id: string) {
    if (expandedMOS !== id) {
      const rowKey = viewMode === 'list'
        ? id
        : (cardRows[Math.floor(visible.findIndex(r => r.id === id) / rowSize)]?.[0]?.id ?? id);

      const el = rowRefs.current.get(rowKey);
      const container = scrollContainerRef.current;
      if (el) {
        if (isSingleCol) {
          const stickyHeight = stickyHeaderRef.current?.offsetHeight ?? 150;
          const elTop = el.getBoundingClientRect().top;
          const delta = elTop - stickyHeight;
          if (Math.abs(delta) > 4) {
            const startY = window.scrollY;
            const targetY = Math.max(0, startY + delta);
            const duration = 350;
            const startTime = performance.now();
            const step = (now: number) => {
              const t = Math.min((now - startTime) / duration, 1);
              const ease = 1 - Math.pow(1 - t, 3);
              window.scrollTo(0, startY + (targetY - startY) * ease);
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        } else if (container) {
          const headerHeight = stickyHeaderRef.current?.offsetHeight ?? 120;
          const elRect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const newScrollTop = container.scrollTop + (elRect.top - containerRect.top) - headerHeight - 8;
          container.scrollTo({ top: Math.max(0, newScrollTop), behavior: 'smooth' });
        }
      }
    }
    onToggleExpand(id);
  }

  function toggleFilterValue<T extends string>(key: keyof ResultFilters, value: T) {
    const current = filters[key];
    if (!Array.isArray(current)) return;

    const next = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];

    onFiltersChange({ ...filters, [key]: next });
  }

  return (
    <div className="relative flex flex-col min-h-full">
      {/* Full-pane grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.065]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Sticky header — stays pinned while the list scrolls */}
      <div ref={stickyHeaderRef} className="sticky top-0 z-30 isolate bg-black px-6 pt-6 pb-3 border-b border-white/12 md:z-50">
        {/* Header — stacks vertically on mobile, side-by-side on desktop */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
          {/* Left stack */}
          <div className="flex items-center md:flex-col md:items-start md:gap-3 md:flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border border-white/35 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-red-500">2</span>
              </div>
              <span className="text-sm font-bold text-gray-400 tracking-widest whitespace-nowrap">
                YOUR LATERAL MOVE OPTIONS
              </span>
            </div>
            <span className="hidden text-[15px] font-bold text-red-500 tracking-widest whitespace-nowrap md:block">
              MATCHES FOUND: {animatedMatchCount}
            </span>
          </div>

          {/* Right stack */}
          <div className="md:ml-auto flex flex-col gap-3 min-w-0">
            {/* Search + fullscreen */}
            <div className="flex items-center gap-3">
              <label className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                <input
                  value={filters.searchQuery}
                  onChange={event => onFiltersChange({ ...filters, searchQuery: event.target.value })}
                  placeholder="Search MOS, title, keywords..."
                  className="w-full border border-white/16 bg-black/70 py-1.5 pl-9 pr-9 text-[12px] font-mono text-gray-200 placeholder-gray-700 outline-none transition-colors focus:border-red-500/50"
                />
                {filters.searchQuery && (
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-red-400"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>

              {onToggleFullscreen && (
                <button
                  type="button"
                  onClick={onToggleFullscreen}
                  className={`hidden md:flex self-stretch flex-shrink-0 items-center gap-2 border px-3 text-[12px] font-bold tracking-widest transition-colors ${
                    isFullscreen
                      ? 'border-red-500/50 bg-red-900/15 text-white hover:bg-red-900/25'
                      : 'border-white/16 bg-black/60 text-gray-500 hover:border-white/40 hover:text-gray-300'
                  }`}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsFilterOpen(open => !open)}
                className={`flex items-center gap-2 border px-3 py-1.5 text-[12px] font-bold tracking-widest transition-colors ${
                  isFilterOpen || activeFilterCount > 0
                    ? 'border-red-500/50 bg-red-900/15 text-white'
                    : 'border-white/16 bg-black/60 text-gray-500 hover:border-white/40 hover:text-gray-300'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                FILTERS{activeFilterCount > 0 ? ` ${activeFilterCount}` : ''}
              </button>

              <div className="hidden md:flex items-center border border-white/16 bg-black/60">
                <button
                  type="button"
                  onClick={() => onViewModeChange('cards')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold tracking-widest transition-colors ${
                    viewMode === 'cards' ? 'bg-red-900/15 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  CARDS
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  className={`flex items-center gap-2 border-l border-white/16 px-3 py-1.5 text-[12px] font-bold tracking-widest transition-colors ${
                    viewMode === 'list' ? 'bg-red-900/15 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Rows3 className="w-3.5 h-3.5" />
                  LIST
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-600">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => onSortChange(e.target.value as SortMode)}
                    className="bg-black border border-white/16 text-gray-300 px-2 py-1 text-[13px] font-mono appearance-none pr-6 focus:outline-none"
                  >
                    <option value="match">Match %</option>
                    <option value="skill">Skill Transfer %</option>
                    <option value="bonus">Bonus High to Low</option>
                    <option value="field">Field</option>
                    <option value="mos">MOS</option>
                    <option value="title">Title</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <span className="text-[15px] font-bold text-red-500 tracking-widest whitespace-nowrap">
                MATCHES FOUND: {animatedMatchCount}
              </span>
            </div>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mb-4 max-h-[min(70vh,calc(100vh-240px))] overflow-y-auto border border-white/14 bg-black/80 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-[12px] font-bold tracking-[0.22em] text-gray-500">
                FILTER OPTIONS <span className="text-green-500/70">GREEN INCLUDED</span> <span className="text-red-400/80">RED HIDDEN</span>
              </div>
              <button
                type="button"
                onClick={() => onFiltersChange(EMPTY_RESULT_FILTERS)}
                className="flex items-center gap-1.5 border border-white/14 px-3 py-1.5 text-[12px] font-bold tracking-[0.18em] text-gray-500 transition-colors hover:border-white/40 hover:text-white"
              >
                CLEAR <X className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold tracking-[0.2em] text-gray-600">HIDE MOS CODES</span>
                  <input
                    value={filters.excludedMos}
                    onChange={event => onFiltersChange({ ...filters, excludedMos: event.target.value })}
                    placeholder="e.g. 0311, 0811, 3152"
                    className="w-full border border-white/16 bg-black px-3 py-2.5 font-mono text-[13px] text-gray-300 placeholder-gray-700 outline-none transition-colors focus:border-red-500/50"
                  />
                </label>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsMosPickerOpen(open => !open)}
                    className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-gray-500 transition-colors hover:text-gray-300"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isMosPickerOpen ? 'rotate-180 text-red-400' : ''}`} />
                    EXCLUDE MOS FROM CURRENT RESULTS
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isMosPickerOpen ? 'auto' : 0, opacity: isMosPickerOpen ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 max-h-40 overflow-y-auto border border-white/12 bg-black/40 p-2">
                      <div className="flex flex-wrap gap-2">
                        {mosPickerOptions.map(option => {
                          const mosCode = option.id;
                          const isSelected = excludedMosSet.has(mosCode);
                          const isUnavailable = !isSelected && !availableMosCodes.has(mosCode);

                          return (
                            <button
                              key={option.id}
                              type="button"
                              disabled={isUnavailable}
                              onClick={() => {
                                const next = isSelected
                                  ? excludedMosCodes.filter(code => code !== mosCode)
                                  : [...excludedMosCodes, mosCode];

                                onFiltersChange({ ...filters, excludedMos: next.join(', ') });
                              }}
                              className={`border px-3 py-1.5 text-[12px] font-bold tracking-[0.14em] transition-colors ${
                                isSelected
                                  ? 'border-red-500/70 bg-red-900/20 text-red-300 line-through decoration-red-300/80 decoration-2'
                                  : isUnavailable
                                    ? 'cursor-not-allowed border-gray-800/70 bg-black/30 text-gray-700 line-through decoration-gray-700/80'
                                    : 'border-green-500/35 bg-green-900/10 text-green-400/80 hover:border-green-400/60 hover:text-green-300'
                              }`}
                            >
                              {option.id} - {option.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <FilterChipGroup
                label="FIELDS"
                options={fieldOptions.map(field => ({ value: field, label: field }))}
                selected={filters.excludedFields}
                available={activeFields}
                onToggle={value => toggleFilterValue('excludedFields', value)}
              />
              <FilterChipGroup
                label="CLEARANCE REQUIREMENTS"
                options={clearanceOptions.map(clearance => ({ value: clearance, label: CLEARANCE_LABELS[clearance] }))}
                selected={filters.excludedClearances}
                available={activeClearances}
                onToggle={value => toggleFilterValue<ClearanceLevel>('excludedClearances', value)}
              />
              <FilterChipGroup
                label="OTHER REQUIREMENTS"
                options={REQUIREMENT_FILTER_OPTIONS.map(option => ({ value: option.value, label: option.label }))}
                selected={filters.excludedRequirementTags}
                available={activeRequirementTags}
                onToggle={value => toggleFilterValue<RequirementFilterTag>('excludedRequirementTags', value)}
              />
              <div>
                <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-gray-600">VISION</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!filters.hideColorVisionRequired && !hasActiveColorVisionRequirement}
                    onClick={() => onFiltersChange({ ...filters, hideColorVisionRequired: !filters.hideColorVisionRequired })}
                    className={`border px-3 py-1.5 text-[12px] font-bold tracking-[0.14em] transition-colors ${
                      filters.hideColorVisionRequired
                        ? 'border-red-500/70 bg-red-900/20 text-red-300 line-through decoration-red-300/80 decoration-2'
                        : !hasActiveColorVisionRequirement
                          ? 'cursor-not-allowed border-gray-800/70 bg-black/30 text-gray-700 line-through decoration-gray-700/80'
                        : 'border-green-500/35 bg-green-900/10 text-green-400/80 hover:border-green-400/60 hover:text-green-300'
                    }`}
                  >
                    Color Vision Required
                  </button>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-gray-600">INCENTIVES</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!filters.onlyLmBonusEligible && !hasActiveLmBonusEligibleResults}
                    onClick={() => onFiltersChange({ ...filters, onlyLmBonusEligible: !filters.onlyLmBonusEligible })}
                    className={`border px-3 py-1.5 text-[12px] font-bold tracking-[0.14em] transition-colors ${
                      filters.onlyLmBonusEligible
                        ? 'border-red-500/70 bg-red-900/20 text-red-300 line-through decoration-red-300/80 decoration-2'
                        : !hasActiveLmBonusEligibleResults
                          ? 'cursor-not-allowed border-gray-800/70 bg-black/30 text-gray-700 line-through decoration-gray-700/80'
                          : 'border-green-500/35 bg-green-900/10 text-green-400/80 hover:border-green-400/60 hover:text-green-300'
                    }`}
                  >
                    Show only FY27 LM bonus MOS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Column labels — desktop only */}
        {viewMode === 'list' && (
          <div className="hidden md:grid grid-cols-[44px_64px_minmax(0,1.15fr)_minmax(140px,0.75fr)_72px_200px_36px] gap-3 text-xs text-gray-600 font-bold tracking-[0.2em]">
            <span>#</span>
            <span>MOS</span>
            <span>TITLE</span>
            <span>FIELD</span>
            <span>MATCH</span>
            <span>REQUIREMENTS</span>
            <span />
          </div>
        )}
      </div>

      {/* Scrollable results list */}
      <div className="relative z-10 px-6 pt-4 pb-24 md:pb-6">
        <div>
        {results.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[15px] text-gray-600 font-mono tracking-widest">
              {activeFilterCount > 0 && totalResultsCount > 0
                ? 'NO OPTIONS MATCH CURRENT FILTERS'
                : hasSearched
                  ? 'NO QUALIFYING MOS OPTIONS FOUND'
                  : 'ENTER YOUR INFO TO FIND LATERAL MOVE OPTIONS'}
            </div>
            <p className="text-[13px] text-gray-700 mt-2">
              {activeFilterCount > 0 && totalResultsCount > 0
                ? 'Clear one or more filters to bring matching MOS options back into view.'
                : hasSearched
                ? 'Adjust your line scores, rank, or optional filters and try again.'
                : 'Provide ASVAB line scores and current rank to generate matching MOS results. Optional fields can refine the match.'}
            </p>
          </div>
        ) : (
          viewMode === 'list' && !isSingleCol ? (
            <div className="space-y-0">
              {visible.map((result, index) => (
                <motion.div
                  key={`${animationKey}-${result.id}`}
                  ref={el => { if (el) rowRefs.current.set(result.id, el); else rowRefs.current.delete(result.id); }}
                  variants={resultEntrance}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.22, delay: Math.min(index, 8) * 0.025 }}
                >
                  <ResultRow
                    result={result}
                    resultNumber={index + 1}
                    isExpanded={expandedMOS === result.id}
                    onToggle={() => handleToggleExpand(result.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {cardRows.map((row, index) => {
                const expandedResult = row.find(result => result.id === expandedMOS) ?? null;
                const expandedIndex = row.findIndex(result => result.id === expandedMOS);
                const expandedResultNumber = expandedResult == null ? null : visible.findIndex(result => result.id === expandedResult.id) + 1;
                const activeSide = expandedIndex === 1 ? 'right' : 'left';
                const rowKey = row[0].id;

                return (
                  <motion.div
                    key={`${animationKey}-${row.map(result => result.id).join('-')}`}
                    ref={el => { if (el) rowRefs.current.set(rowKey, el); else rowRefs.current.delete(rowKey); }}
                    className="space-y-0"
                    variants={resultEntrance}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.24, delay: Math.min(index, 6) * 0.035 }}
                  >
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {row.map(result => (
                        <ResultCard
                          key={result.id}
                          result={result}
                          resultNumber={visible.findIndex(item => item.id === result.id) + 1}
                          isActive={expandedMOS === result.id}
                          onToggle={() => handleToggleExpand(result.id)}
                        />
                      ))}
                    </div>
                    <ResultCardDetail result={expandedResult} resultNumber={expandedResultNumber} activeSide={activeSide} />
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {remaining > 0 && (
          <div className="flex justify-center mt-5">
            <button
              onClick={onLoadMore}
              className="flex items-center gap-2 px-8 py-3 border border-white/16 text-gray-400 text-[13px] font-bold tracking-widest hover:border-white/40 hover:text-white transition-colors"
            >
              LOAD MORE RESULTS ({remaining} remaining) <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
