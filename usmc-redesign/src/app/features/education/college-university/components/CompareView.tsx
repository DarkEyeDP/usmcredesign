import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolBadge } from './SchoolBadge';
import { TACoverageBar } from './TACoverageBar';
import { activeTuition, calcCostPerCredit, calcTACoverage, coverageTextClass, ownershipLabel } from '../utils';
import { TA_CAP_PER_CREDIT } from '../constants';
import type { SchoolResult, TuitionMode } from '../types';

interface Props {
  schools: SchoolResult[];
  tuitionMode: TuitionMode;
  isDesert: boolean;
  onClose: () => void;
  onAddToPlanner: (school: SchoolResult) => void;
}

const ROWS = [
  { label: 'TUITION / CREDIT', key: 'tuition' },
  { label: 'OUT-OF-POCKET / CR', key: 'gap' },
  { label: 'SCHOOL TYPE', key: 'type' },
  { label: 'LOCATION', key: 'location' },
  { label: 'ONLINE PROGRAMS', key: 'online' },
] as const;

type RowKey = (typeof ROWS)[number]['key'];

function getCellValue(school: SchoolResult, key: RowKey, tuitionMode: TuitionMode) {
  const tuition = activeTuition(school, tuitionMode);
  const cpc = calcCostPerCredit(tuition);
  const gap = cpc != null ? Math.max(0, cpc - TA_CAP_PER_CREDIT) : null;
  switch (key) {
    case 'tuition':  return { display: cpc != null ? `$${cpc}` : 'N/A', raw: cpc, type: 'money' as const };
    case 'gap':      return { display: gap != null ? (gap === 0 ? '$0' : `$${gap}`) : 'N/A', raw: gap, type: 'gap' as const };
    case 'type':     return { display: ownershipLabel(school.ownership), raw: null, type: 'text' as const };
    case 'location': return { display: `${school.city}, ${school.state}`, raw: null, type: 'text' as const };
    case 'online':   return { display: school.distanceOnly ? 'Yes' : 'Partial', raw: null, type: 'text' as const };
  }
}

export function CompareView({ schools, tuitionMode, isDesert, onClose, onAddToPlanner }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        key="compare-overlay"
        className="fixed inset-0 z-50 flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className={`relative w-full max-h-[88vh] overflow-y-auto border-t border-white/12 ${isDesert ? 'bg-amber-50' : 'bg-black'}`}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-white/12 bg-white/[0.04] sticky top-0 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-red-600" />
              <span className="text-[13px] font-bold tracking-[0.2em] text-gray-300">
                SIDE-BY-SIDE COMPARISON
              </span>
              <span className="text-[10px] text-gray-600 ml-1">
                {tuitionMode === 'out-of-state' ? '· OUT-OF-STATE RATES' : '· IN-STATE RATES'}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-8 py-6 overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left pb-4 pr-6 w-36">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-gray-600">METRIC</span>
                  </th>
                  {schools.map(school => (
                    <th key={school.name} className="pb-4 px-4 text-center align-top">
                      <div className="flex flex-col items-center gap-2">
                        <SchoolBadge name={school.name} size="md" />
                        <div className="text-xs font-bold text-white leading-snug max-w-[140px]">{school.name}</div>
                        <div className="text-[10px] text-gray-600">{school.city}, {school.state}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {/* TA Coverage row — visual treatment */}
                <tr>
                  <td className="py-3.5 pr-6 text-[10px] font-bold tracking-[0.15em] text-gray-600 align-middle">TA COVERAGE</td>
                  {schools.map(school => {
                    const pct = calcTACoverage(activeTuition(school, tuitionMode));
                    return (
                      <td key={school.name} className="py-3.5 px-4 text-center">
                        {pct != null ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className={`text-2xl font-black ${coverageTextClass(pct, isDesert)}`}>{pct}%</span>
                            <div className="w-full max-w-[140px]">
                              <TACoverageBar pct={pct} isDesert={isDesert} showLabel={false} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {ROWS.map(row => (
                  <tr key={row.key}>
                    <td className="py-3.5 pr-6 text-[10px] font-bold tracking-[0.15em] text-gray-600 align-middle whitespace-nowrap">
                      {row.label}
                    </td>
                    {schools.map(school => {
                      const cell = getCellValue(school, row.key, tuitionMode);
                      const isFullyCovered = cell.type === 'gap' && cell.raw === 0;
                      const isGap = cell.type === 'gap' && cell.raw != null && cell.raw > 0;
                      return (
                        <td key={school.name} className="py-3.5 px-4 text-center">
                          <span className={`text-sm font-bold ${
                            isFullyCovered
                              ? isDesert ? 'text-green-700' : 'text-green-400'
                              : isGap
                                ? isDesert ? 'text-amber-700' : 'text-amber-400'
                                : 'text-white'
                          }`}>
                            {cell.display}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Add to Planner */}
                <tr>
                  <td className="pt-5 pr-6" />
                  {schools.map(school => (
                    <td key={school.name} className="pt-5 px-4">
                      <button
                        onClick={() => onAddToPlanner(school)}
                        className={`w-full py-2.5 text-[11px] font-bold tracking-widest border transition-colors flex items-center justify-center gap-1.5 ${
                          isDesert
                            ? 'border-red-700 bg-red-700 text-red-50 hover:bg-red-800'
                            : 'border-red-600 bg-red-950/40 text-white hover:bg-red-600'
                        }`}
                      >
                        <BookOpen className="w-3 h-3" />
                        ADD TO PLANNER
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <p className="text-[10px] text-gray-600 mt-4">
              * Tuition figures are estimates (College Scorecard annual ÷ 30 credits). Confirm with the school's military/veterans office before enrolling.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
