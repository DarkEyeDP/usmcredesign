import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import { motion, AnimatePresence } from 'motion/react';
import { PanelLeftOpen } from 'lucide-react';
import { buildResults, sortResults } from './matching';
import {
  EMPTY_RESULT_FILTERS,
  REQUIREMENT_FILTER_OPTIONS,
  type ResultFilters,
  type ResultItem,
  type SortMode,
  type LanguageEntry,
  type ResultViewMode,
} from './types';
import { Hero } from './components/Hero';
import { SearchForm } from './components/SearchForm';
import { ResultsPanel } from './components/ResultsPanel';
import { AboutSection } from './components/AboutSection';
import { CTABanner } from './components/CTABanner';
import { LatMoveErrorView } from './components/LatMoveErrorView';

interface Props {
  isLoggedIn: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const STORAGE_KEY = 'latmove:user-inputs:v1';
const DEFAULT_EDUCATION = 'hs_ged';

interface SavedLatMoveInputs {
  gt?: string;
  mm?: string;
  el?: string;
  cl?: string;
  rank?: string;
  pmos?: string;
  amos?: string[];
  clearance?: string;
  hasNormalColorVision?: boolean;
  education?: string;
  degreeFields?: string[];
  certifications?: string[];
  languages?: LanguageEntry[];
}

export function LateralMovePage({ isLoggedIn, isFullscreen = false, onToggleFullscreen }: Props) {
  const toolSectionRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const pendingResultsTimerRef = useRef<number | null>(null);

  // Form state — ASVAB & service
  const [gt, setGt] = useState('');
  const [mm, setMm] = useState('');
  const [el, setEl] = useState('');
  const [cl, setCl] = useState('');
  const [rank, setRank] = useState('');

  // Form state — background (prep for skills translation)
  const [pmos, setPmos] = useState('');
  const [amos, setAmos] = useState<string[]>([]);
  const [clearance, setClearance] = useState('secret');
  const [hasNormalColorVision, setHasNormalColorVision] = useState(true);
  const [education, setEducation] = useState(DEFAULT_EDUCATION);
  const [degreeFields, setDegreeFields] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);

  // Results state
  const [results, setResults] = useState<ResultItem[]>([]);
  const [sortBy, setSortBy] = useState<SortMode>('match');
  const [viewMode, setViewMode] = useState<ResultViewMode>('cards');
  const [expandedMOS, setExpandedMOS] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(20);
  const [isInfoPanelCollapsed, setIsInfoPanelCollapsed] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasHydratedSavedInputs, setHasHydratedSavedInputs] = useState(false);
  const [resultsAnimationKey, setResultsAnimationKey] = useState(0);
  const [resultFilters, setResultFilters] = useState<ResultFilters>(EMPTY_RESULT_FILTERS);
  const [runtimeError, setRuntimeError] = useState<unknown>(null);

  const filteredResults = useMemo(() => {
    const searchQuery = resultFilters.searchQuery.trim().toLowerCase();
    const excludedMos = new Set(
      resultFilters.excludedMos
        .split(/[\s,]+/)
        .map(code => code.trim())
        .filter(Boolean)
    );
    const excludedFields = new Set(resultFilters.excludedFields);
    const excludedClearances = new Set(resultFilters.excludedClearances);
    const excludedTags = new Set(resultFilters.excludedRequirementTags);

    return results.filter(result => {
      const qualificationText = result.qualifications.join(' ').toLowerCase();
      const keywordText = [
        result.id,
        result.title,
        result.field,
        result.reqStr,
        ...result.qualifications,
      ].join(' ').toLowerCase();
      const matchesExcludedTag = REQUIREMENT_FILTER_OPTIONS.some(option =>
        excludedTags.has(option.value) &&
        option.keywords.some(keyword => qualificationText.includes(keyword))
      );
      const matchesSearch = !searchQuery || keywordText.includes(searchQuery);

      return (
        matchesSearch &&
        !excludedMos.has(result.id) &&
        !excludedFields.has(result.field) &&
        !excludedClearances.has(result.clearance) &&
        !(resultFilters.hideColorVisionRequired && result.requiresNormalColorVision) &&
        !(resultFilters.onlyLmBonusEligible && !result.lateralMoveBonusRange) &&
        !matchesExcludedTag
      );
    });
  }, [results, resultFilters]);

  // Re-sort without re-filtering when sortBy changes
  const sorted = useMemo(() => sortResults(filteredResults, sortBy), [filteredResults, sortBy]);
  const hasRequiredInputs = Boolean(rank) && [gt, mm, el, cl].every(value => value.trim().length > 0);
  const isMissingRequiredInfo = !hasRequiredInputs;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setHasHydratedSavedInputs(true);
        return;
      }

      const saved = JSON.parse(stored) as SavedLatMoveInputs;

      setGt(saved.gt ?? '');
      setMm(saved.mm ?? '');
      setEl(saved.el ?? '');
      setCl(saved.cl ?? '');
      setRank(saved.rank ?? '');
      setPmos(saved.pmos ?? '');
      setAmos(Array.isArray(saved.amos) ? saved.amos : []);
      setClearance(saved.clearance ?? 'secret');
      setHasNormalColorVision(saved.hasNormalColorVision ?? true);
      setEducation(saved.education ?? DEFAULT_EDUCATION);
      setDegreeFields(Array.isArray(saved.degreeFields) ? saved.degreeFields : []);
      setCertifications(Array.isArray(saved.certifications) ? saved.certifications : []);
      setLanguages(Array.isArray(saved.languages) ? saved.languages : []);

      const savedHasRequiredInputs = Boolean(saved.rank) && [saved.gt, saved.mm, saved.el, saved.cl].every(value => value?.trim());
      if (savedHasRequiredInputs) {
        setResults(buildResults(
          saved.gt ?? '',
          saved.mm ?? '',
          saved.el ?? '',
          saved.cl ?? '',
          saved.rank ?? '',
          saved.clearance ?? 'secret',
          saved.hasNormalColorVision ?? true,
          sortBy,
          saved.pmos ?? '',
          Array.isArray(saved.amos) ? saved.amos : [],
          Array.isArray(saved.certifications) ? saved.certifications : [],
          saved.education ?? DEFAULT_EDUCATION,
          Array.isArray(saved.degreeFields) ? saved.degreeFields : []
        ));
        setHasSearched(true);
      }
    } catch (error) {
      window.localStorage.removeItem(STORAGE_KEY);
      setRuntimeError(error);
    } finally {
      setHasHydratedSavedInputs(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedSavedInputs) return;

    const savedInputs: SavedLatMoveInputs = {
      gt,
      mm,
      el,
      cl,
      rank,
      pmos,
      amos,
      clearance,
      hasNormalColorVision,
      education,
      degreeFields,
      certifications,
      languages,
    };

    const hasAnyInput =
      [gt, mm, el, cl, rank, pmos].some(value => value.trim().length > 0) ||
      amos.length > 0 ||
      degreeFields.length > 0 ||
      certifications.length > 0 ||
      languages.length > 0 ||
      clearance !== 'secret' ||
      education !== DEFAULT_EDUCATION ||
      !hasNormalColorVision;

    if (!hasAnyInput) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedInputs));
  }, [
    gt,
    mm,
    el,
    cl,
    rank,
    pmos,
    amos,
    clearance,
    hasNormalColorVision,
    education,
    degreeFields,
    certifications,
    languages,
    hasHydratedSavedInputs,
  ]);

  function handleSearch() {
    if (!hasRequiredInputs) return;
    setRuntimeError(null);

    let nextResults: ResultItem[];
    try {
      nextResults = buildResults(
        gt,
        mm,
        el,
        cl,
        rank,
        clearance,
        hasNormalColorVision,
        sortBy,
        pmos,
        amos,
        certifications,
        education,
        degreeFields
      );
    } catch (error) {
      setRuntimeError(error);
      return;
    }

    if (pendingResultsTimerRef.current != null) {
      window.clearTimeout(pendingResultsTimerRef.current);
    }

    setDisplayCount(20);
    setExpandedMOS(null);
    requestAnimationFrame(() => {
      resultsScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      handleExploreTool();
      pendingResultsTimerRef.current = window.setTimeout(() => {
        setResults(nextResults);
        setHasSearched(true);
        setResultsAnimationKey(key => key + 1);
        pendingResultsTimerRef.current = null;
      }, 350);
    });
  }

  function handleReset() {
    if (pendingResultsTimerRef.current != null) {
      window.clearTimeout(pendingResultsTimerRef.current);
      pendingResultsTimerRef.current = null;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setRuntimeError(null);
    setGt('');
    setMm('');
    setEl('');
    setCl('');
    setRank('');
    setPmos('');
    setAmos([]);
    setClearance('secret');
    setHasNormalColorVision(true);
    setEducation(DEFAULT_EDUCATION);
    setDegreeFields([]);
    setCertifications([]);
    setLanguages([]);
    setResults([]);
    setHasSearched(false);
    setDisplayCount(20);
    setExpandedMOS(null);
    setResultsAnimationKey(0);
    setResultFilters(EMPTY_RESULT_FILTERS);
  }

  function handleToggleExpand(id: string) {
    setExpandedMOS(prev => (prev === id ? null : id));
  }

  function handleExploreTool() {
    toolSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (runtimeError) {
    return (
      <LatMoveErrorView
        title="MATCHING ENGINE ERROR."
        summary="The tool ran into a problem while restoring saved inputs or generating MOS matches. The error details below are shown directly in the page for easier debugging."
        error={runtimeError}
        onRetry={() => setRuntimeError(null)}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <SEOHead
        title="Marine Lateral Move Tool"
        description="Find Marine Corps lateral move opportunities by MOS. Search available MOS changes, review requirements, and explore career transition options for active-duty Marines."
        path="/lateral-move"
      />
      {!isFullscreen && <Hero onExploreTool={handleExploreTool} />}

      <div
        ref={toolSectionRef}
        className={`grid scroll-mt-20 gap-0 transition-[grid-template-columns] duration-300 ${
          isFullscreen ? '' : 'border-b border-white/12'
        } grid-cols-1 ${isInfoPanelCollapsed ? 'md:grid-cols-[64px_1fr]' : 'md:grid-cols-[320px_1fr]'}`}
        style={isFullscreen ? { height: '100vh' } : undefined}
      >
        <div className={`${isFullscreen ? 'h-screen overflow-y-auto' : ''} ${isInfoPanelCollapsed ? 'md:border-r md:bg-black/80' : ''}`.trim() || undefined}>

          {/* ── MOBILE: accordion ──────────────────────────────────────────── */}
          <div className="md:hidden border-b border-white/12">
            {/* Always-visible header blade */}
            <div className="flex items-center justify-between px-6 py-[19px] border-b border-white/12">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-6 h-6 border border-white/35 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-red-500">1</span>
                </div>
                <span className="text-sm font-bold text-gray-400 tracking-widest truncate">ENTER YOUR INFO</span>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoPanelCollapsed(v => !v)}
                className="flex h-8 w-8 items-center justify-center border border-white/18 text-gray-500 transition-colors hover:border-white/40 hover:text-gray-200"
                aria-label={isInfoPanelCollapsed ? 'Expand information panel' : 'Collapse information panel'}
              >
                <PanelLeftOpen className={`h-4 w-4 transition-transform duration-300 ${isInfoPanelCollapsed ? 'rotate-90' : '-rotate-90'}`} />
              </button>
            </div>

            {/* Accordion body */}
            <AnimatePresence initial={false}>
              {!isInfoPanelCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <SearchForm
                    gt={gt} setGt={setGt}
                    mm={mm} setMm={setMm}
                    el={el} setEl={setEl}
                    cl={cl} setCl={setCl}
                    rank={rank} setRank={setRank}
                    pmos={pmos} setPmos={setPmos}
                    amos={amos} setAmos={setAmos}
                    clearance={clearance} setClearance={setClearance}
                    hasNormalColorVision={hasNormalColorVision} setHasNormalColorVision={setHasNormalColorVision}
                    education={education} setEducation={setEducation}
                    degreeFields={degreeFields} setDegreeFields={setDegreeFields}
                    certifications={certifications} setCertifications={setCertifications}
                    languages={languages} setLanguages={setLanguages}
                    isLoggedIn={isLoggedIn}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCollapse={() => setIsInfoPanelCollapsed(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── DESKTOP: original collapsed/expanded behavior ─────────────── */}
          {isInfoPanelCollapsed ? (
            <div className="hidden md:block px-3 py-6">
              <div className="sticky top-24 flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsInfoPanelCollapsed(false)}
                  className={`relative flex h-9 w-9 items-center justify-center border text-gray-500 transition-colors hover:border-white/40 hover:text-gray-200 ${
                    isMissingRequiredInfo ? 'border-red-500/70 bg-red-950/20' : 'border-white/18'
                  }`}
                  aria-label={isMissingRequiredInfo ? 'Expand information panel. Required information is missing.' : 'Expand information panel'}
                >
                  {isMissingRequiredInfo && (
                    <>
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </>
                  )}
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
                <div className={`w-6 h-6 border flex items-center justify-center ${
                  isMissingRequiredInfo
                    ? 'border-red-500 bg-red-950/20 shadow-[0_0_18px_rgba(255,36,48,0.35)] animate-pulse'
                    : 'border-red-600/60'
                }`}>
                  <span className="text-sm font-bold text-red-500">1</span>
                </div>
                <div className={`[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold tracking-[0.22em] ${
                  isMissingRequiredInfo ? 'text-red-400/90' : 'text-gray-500'
                }`}>
                  ENTER YOUR INFO
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:block">
              <SearchForm
                gt={gt} setGt={setGt}
                mm={mm} setMm={setMm}
                el={el} setEl={setEl}
                cl={cl} setCl={setCl}
                rank={rank} setRank={setRank}
                pmos={pmos} setPmos={setPmos}
                amos={amos} setAmos={setAmos}
                clearance={clearance} setClearance={setClearance}
                hasNormalColorVision={hasNormalColorVision} setHasNormalColorVision={setHasNormalColorVision}
                education={education} setEducation={setEducation}
                degreeFields={degreeFields} setDegreeFields={setDegreeFields}
                certifications={certifications} setCertifications={setCertifications}
                languages={languages} setLanguages={setLanguages}
                isLoggedIn={isLoggedIn}
                onSearch={handleSearch}
                onReset={handleReset}
                onCollapse={() => setIsInfoPanelCollapsed(true)}
              />
            </div>
          )}
        </div>
        {/* Right column — sticky below the fixed header; inner div is the actual scroll container */}
        <div className={isFullscreen ? 'sticky top-0 self-start' : 'md:sticky md:top-20 md:self-start'}>
          <div ref={resultsScrollRef} className={isFullscreen ? 'h-screen overflow-y-auto' : 'md:h-[calc(100vh-80px)] md:overflow-y-auto overflow-visible'}>
            <ResultsPanel
              results={sorted}
              displayCount={displayCount}
              expandedMOS={expandedMOS}
              sortBy={sortBy}
              viewMode={viewMode}
              hasSearched={hasSearched}
              animationKey={resultsAnimationKey}
              totalResultsCount={results.length}
              filterSourceResults={results}
              filters={resultFilters}
              scrollContainerRef={resultsScrollRef as React.RefObject<HTMLDivElement>}
              isFullscreen={isFullscreen}
              onToggleFullscreen={onToggleFullscreen}
              onFiltersChange={setResultFilters}
              onToggleExpand={handleToggleExpand}
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
              onLoadMore={() => setDisplayCount(c => c + 20)}
            />
          </div>
        </div>
      </div>

      {/* {!isFullscreen && <AboutSection />} */}
      {/* {!isFullscreen && <CTABanner />} */}
    </div>
  );
}
