import { useState, useEffect, useRef } from 'react';
import { BookOpen, MapPin, ExternalLink, Info, Bookmark, Shield, ChevronDown, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolBadge } from './SchoolBadge';
import { TACoverageBar } from './TACoverageBar';
import { activeTuition, calcCostPerCredit, calcTACoverage, ownershipLabel, coverageTextClass, fetchSchoolPrograms } from '../utils';
import { TA_CAP_PER_CREDIT } from '../constants';
import type { SchoolResult, SchoolProgram, SchoolProgramsResult, TuitionMode } from '../types';

interface Props {
  school: SchoolResult | null;
  isSaved: boolean;
  tuitionMode: TuitionMode;
  isDesert: boolean;
  onAddToPlanner: (school: SchoolResult) => void;
  onToggleSave: (school: SchoolResult) => void;
  onTuitionModeChange: (m: TuitionMode) => void;
}

// Credential levels ordered for display grouping
const CREDENTIAL_ORDER = [5, 7, 9, 10, 11, 3, 6, 8, 1, 2, 4, 0];
const CREDENTIAL_GROUP_LABELS: Record<number, string> = {
  5: "Bachelor's Degrees",
  7: "Master's Degrees",
  9: "Doctoral Degrees",
  10: "Doctoral Degrees",
  11: "Doctoral Degrees",
  3: "Associate's Degrees",
  6: "Post-Bacc Certificates",
  8: "Post-Master's Certificates",
  1: "Certificates",
  2: "Certificates",
  4: "Certificates",
  0: "Other",
};

function groupPrograms(programs: SchoolProgram[]): { label: string; items: string[] }[] {
  const seen = new Set<number>();
  const grouped: { level: number; label: string; items: string[] }[] = [];
  for (const level of CREDENTIAL_ORDER) {
    const matches = programs.filter(p => {
      if (level === 9) return p.credentialLevel >= 9;
      if (level === 1) return [1, 2, 4].includes(p.credentialLevel) && !seen.has(p.credentialLevel);
      return p.credentialLevel === level;
    });
    if (!matches.length) continue;
    const label = CREDENTIAL_GROUP_LABELS[level] ?? 'Other';
    if (grouped.find(g => g.label === label)) continue;
    matches.forEach(p => seen.add(p.credentialLevel));
    grouped.push({ level, label, items: [...new Set(matches.map(p => p.title))].sort() });
  }
  return grouped;
}

export function SchoolDetailPanel({
  school, isSaved, tuitionMode, isDesert,
  onAddToPlanner, onToggleSave, onTuitionModeChange,
}: Props) {
  const [programsOpen, setProgramsOpen] = useState(false);
  const [programsResult, setProgramsResult] = useState<SchoolProgramsResult | null>(null);
  const [programsLoading, setProgramsLoading] = useState(false);
  const fetchedForId = useRef<number | null>(null);

  // Reset programs when school changes
  useEffect(() => {
    setProgramsOpen(false);
    setProgramsResult(null);
    fetchedForId.current = null;
  }, [school?.id]);

  async function handleProgramsToggle() {
    const next = !programsOpen;
    setProgramsOpen(next);
    if (next && programsResult === null && school?.id && fetchedForId.current !== school.id) {
      fetchedForId.current = school.id;
      const workerUrl = import.meta.env.VITE_SCHOOL_SEARCH_WORKER_URL as string;
      if (!workerUrl) return;
      setProgramsLoading(true);
      try {
        const result = await fetchSchoolPrograms(workerUrl, school.id);
        setProgramsResult(result);
      } finally {
        setProgramsLoading(false);
      }
    }
  }

  if (!school) {
    return (
      <div className="border border-white/12 bg-black flex flex-col items-center justify-center min-h-64 p-8 text-center">
        <BookOpen className="w-8 h-8 text-white/12 mb-3" />
        <div className="text-[11px] font-bold tracking-widest text-gray-700">SELECT A SCHOOL</div>
        <div className="text-[11px] text-gray-700 mt-1">Click any result to see details and TA coverage</div>
      </div>
    );
  }

  const tuition = activeTuition(school, tuitionMode);
  const cpc = calcCostPerCredit(tuition);
  const pct = calcTACoverage(tuition);
  const gap = cpc != null ? Math.max(0, cpc - TA_CAP_PER_CREDIT) : null;
  const hasBothRates = school.tuitionInState != null
    && school.tuitionOutOfState != null
    && school.tuitionInState !== school.tuitionOutOfState;

  const glanceItems: string[] = [
    pct != null ? `${pct}% of tuition covered by TA at current rates` : '',
    gap != null && gap === 0 ? 'TA fully covers tuition (up to $250/credit cap)' : '',
    gap != null && gap > 0 ? `Estimated $${gap}/credit out-of-pocket after TA` : '',
    school.distanceOnly ? 'Exclusively distance learning / online programs' : '',
    `${ownershipLabel(school.ownership)} institution`,
  ].filter(Boolean);

  return (
    <div className="border border-white/12 bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.04]">
        <div className="text-[11px] font-bold tracking-[0.2em] text-gray-400">SCHOOL DETAILS</div>
        <button
          onClick={() => onToggleSave(school)}
          className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider transition-colors ${
            isSaved ? 'text-red-500 hover:text-red-400' : 'text-gray-600 hover:text-gray-300'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'SAVED' : 'SAVE SCHOOL'}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Identity */}
        <div className="flex items-start gap-3">
          <SchoolBadge name={school.name} size="md" />
          <div>
            <div className="text-sm font-bold text-white leading-snug">{school.name}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-600">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {school.city}, {school.state} · {ownershipLabel(school.ownership)}
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {school.distanceOnly && (
                <span className={`text-[9px] font-bold tracking-wider border px-1.5 py-0.5 ${
                  isDesert ? 'border-green-700/50 text-green-800' : 'border-green-500/30 text-green-500/80'
                }`}>ONLINE</span>
              )}
              <span className="text-[9px] font-bold tracking-wider border border-white/16 px-1.5 py-0.5 text-gray-500">
                TA ELIGIBLE
              </span>
            </div>
          </div>
        </div>

        {/* Tuition mode toggle — only shown when rates differ */}
        {hasBothRates && (
          <div className="flex items-center gap-1 border border-white/10 self-start">
            <button
              onClick={() => onTuitionModeChange('in-state')}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider transition-colors ${
                tuitionMode === 'in-state'
                  ? isDesert ? 'bg-red-700 text-white' : 'bg-red-950/50 text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              IN-STATE
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => onTuitionModeChange('out-of-state')}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider transition-colors ${
                tuitionMode === 'out-of-state'
                  ? isDesert ? 'bg-red-700 text-white' : 'bg-red-950/50 text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              OUT-OF-STATE
            </button>
          </div>
        )}

        {/* TA Coverage */}
        {cpc != null && pct != null && (
          <div className="border border-white/10 p-3">
            <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-2">TUITION VS. TA CAP</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className={`text-3xl font-black ${coverageTextClass(pct, isDesert)}`}>{pct}%</span>
              <span className="text-[11px] text-gray-500">covered at $250/credit cap</span>
            </div>
            <TACoverageBar pct={pct} isDesert={isDesert} showLabel />
            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
              <div>
                <div className="text-[9px] text-gray-600 tracking-wider mb-0.5">TUITION/CREDIT</div>
                <div className="text-sm font-bold text-white">${cpc}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-600 tracking-wider mb-0.5">ONLINE</div>
                <div className="text-sm font-bold text-white">{school.distanceOnly ? 'Yes' : 'Partial'}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-600 tracking-wider mb-0.5">TYPE</div>
                <div className="text-sm font-bold text-white">{ownershipLabel(school.ownership)}</div>
              </div>
            </div>
            {hasBothRates && (
              <div className="mt-2 pt-2 border-t border-white/10 flex gap-4">
                <div>
                  <span className="text-[9px] text-gray-600 tracking-wider">IN-STATE </span>
                  <span className="text-[11px] font-bold text-gray-400">
                    ${Math.round((school.tuitionInState ?? 0) / 30)}/cr
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-600 tracking-wider">OUT-OF-STATE </span>
                  <span className="text-[11px] font-bold text-gray-400">
                    ${Math.round((school.tuitionOutOfState ?? 0) / 30)}/cr
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add to Degree Planner */}
        <button
          onClick={() => onAddToPlanner(school)}
          className={`w-full py-3 text-[12px] font-bold tracking-widest border transition-colors flex items-center justify-center gap-2 ${
            isDesert
              ? 'border-red-700 bg-red-700 text-red-50 hover:bg-red-800'
              : 'border-red-600 bg-red-950/40 text-white hover:bg-red-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          ADD TO DEGREE PLANNER
        </button>

        {/* At a Glance */}
        {glanceItems.length > 0 && (
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-gray-600 mb-2">AT A GLANCE</div>
            <div className="space-y-2">
              {glanceItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-gray-400">
                  <div className="w-1 h-1 mt-1.5 flex-shrink-0 rounded-full bg-red-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Programs Offered */}
        {school.id && (
          <div className="border border-white/10">
            <button
              type="button"
              onClick={handleProgramsToggle}
              className="flex w-full items-center justify-between px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3 h-3 text-gray-600" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-gray-500">PROGRAMS OFFERED</span>
                {programsResult !== null && (
                  <span className="text-[10px] text-gray-700 font-mono">{programsResult.programs.length}</span>
                )}
              </div>
              {programsLoading
                ? <span className="text-[9px] text-gray-700 tracking-wider">LOADING…</span>
                : <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${programsOpen ? 'rotate-180' : ''}`} />
              }
            </button>

            <AnimatePresence initial={false}>
              {programsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  {programsResult === null || programsLoading ? (
                    <div className="px-3 py-4 text-[11px] text-gray-700 text-center">Loading programs…</div>
                  ) : programsResult.programs.length === 0 ? (
                    <div className="px-3 py-4 text-[11px] text-gray-700 text-center">No program data available</div>
                  ) : (
                    <div className="px-3 py-3 space-y-4 max-h-72 overflow-y-auto">
                      {programsResult.source === 'flags' && (
                        <p className="text-[10px] text-gray-600 leading-relaxed">
                          Program areas this school reports to the U.S. Dept. of Education College Scorecard. For specific degrees, certificates, and concentrations offered, visit the school's website directly.
                        </p>
                      )}
                      {groupPrograms(programsResult.programs).map(group => (
                        <div key={group.label}>
                          {programsResult.source === 'cip4' && (
                            <div className="text-[9px] font-bold tracking-[0.2em] text-gray-600 mb-1.5 uppercase">{group.label}</div>
                          )}
                          <div className="space-y-0.5">
                            {group.items.map(title => (
                              <div key={title} className="flex items-start gap-1.5">
                                <div className="w-1 h-1 mt-1.5 flex-shrink-0 bg-red-700/60 rounded-full" />
                                <span className="text-[11px] text-gray-400 leading-snug">{title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* External links */}
        <div className="space-y-2">
          <a
            href={`https://dhra.appianportalsgov.com/DoD-MOU/page/institutions`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors"
          >
            <Shield className="w-3 h-3 flex-shrink-0 text-red-500" />
            VERIFY DOD MOU ELIGIBILITY
          </a>
          <a
            href="https://www.va.gov/education/gi-bill-comparison-tool/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0 text-red-500" />
            VA GI BILL COMPARISON TOOL
          </a>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 border border-white/10 bg-white/[0.02] px-3 py-2.5">
          <Info className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Tuition figures are estimates from College Scorecard (annual ÷ 30 credits). Confirm actual rates and MOU status with the school's military or veterans services office before enrolling.
          </p>
        </div>
      </div>
    </div>
  );
}
