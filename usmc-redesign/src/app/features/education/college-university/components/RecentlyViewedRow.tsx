import { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolBadge } from './SchoolBadge';
import { TACoverageBar } from './TACoverageBar';
import { activeTuition, calcCostPerCredit, calcTACoverage, coverageTextClass } from '../utils';
import type { SchoolResult, TuitionMode } from '../types';

interface Props {
  schools: SchoolResult[];
  tuitionMode: TuitionMode;
  isDesert: boolean;
  selectedName?: string;
  onSelect: (school: SchoolResult) => void;
}

export function RecentlyViewedRow({ schools, tuitionMode, isDesert, selectedName, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  if (!schools.length) return null;

  return (
    <div className="border border-white/10">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-gray-600" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-gray-500">RECENTLY VIEWED</span>
          <span className="text-[10px] text-gray-700 font-mono">{schools.length}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex gap-3 overflow-x-auto px-4 py-3">
              {schools.map(school => {
                const tuition = activeTuition(school, tuitionMode);
                const cpc = calcCostPerCredit(tuition);
                const pct = calcTACoverage(tuition);
                const isSelected = school.name === selectedName;

                return (
                  <button
                    key={school.name}
                    onClick={() => onSelect(school)}
                    className={`flex-shrink-0 w-44 border text-left p-3 transition-colors ${
                      isSelected
                        ? isDesert ? 'border-red-700/60 bg-red-900/10' : 'border-red-600 bg-red-950/20'
                        : 'border-white/10 bg-black hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <SchoolBadge name={school.name} size="sm" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-gray-300 leading-tight line-clamp-2">{school.name}</div>
                        <div className="text-[9px] text-gray-700 mt-0.5">{school.state}</div>
                      </div>
                    </div>
                    {cpc != null && pct != null ? (
                      <>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] text-gray-700">${cpc}/cr</span>
                          <span className={`text-[9px] font-bold ${coverageTextClass(pct, isDesert)}`}>{pct}%</span>
                        </div>
                        <TACoverageBar pct={pct} isDesert={isDesert} showLabel={false} />
                      </>
                    ) : (
                      <div className="text-[9px] text-gray-700">N/A</div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
