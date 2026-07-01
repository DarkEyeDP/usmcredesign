import { Square, CheckSquare, Bookmark } from 'lucide-react';
import { SchoolBadge } from './SchoolBadge';
import { TACoverageBar } from './TACoverageBar';
import { activeTuition, calcCostPerCredit, calcTACoverage, coverageTextClass, ownershipLabel } from '../utils';
import type { SchoolResult, TuitionMode } from '../types';

interface Props {
  school: SchoolResult;
  isSelected: boolean;
  inCompare: boolean;
  isSaved: boolean;
  tuitionMode: TuitionMode;
  isDesert: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
  onToggleSave: () => void;
}

export function SchoolResultCard({
  school, isSelected, inCompare, isSaved, tuitionMode, isDesert,
  onSelect, onToggleCompare, onToggleSave,
}: Props) {
  const tuition = activeTuition(school, tuitionMode);
  const cpc = calcCostPerCredit(tuition);
  const pct = calcTACoverage(tuition);
  const isOOS = tuitionMode === 'out-of-state' && school.tuitionOutOfState !== school.tuitionInState;

  return (
    <div className={`border-b border-white/10 last:border-0 transition-colors ${
      isSelected ? (isDesert ? 'bg-red-900/10' : 'bg-red-950/15') : 'hover:bg-white/[0.02]'
    }`}>
      <button onClick={onSelect} className="w-full text-left px-4 py-3.5">
        <div className="flex items-start gap-3">
          <SchoolBadge name={school.name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className={`text-[13px] font-bold leading-snug mb-0.5 transition-colors ${
              isSelected ? (isDesert ? 'text-red-900' : 'text-white') : 'text-gray-200'
            }`}>
              {school.name}
            </div>
            <div className="text-[11px] text-gray-600">{school.city}, {school.state}</div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[9px] font-bold tracking-wider border border-white/16 px-1.5 py-0.5 text-gray-500">
                {ownershipLabel(school.ownership)}
              </span>
              {school.distanceOnly && (
                <span className={`text-[9px] font-bold tracking-wider border px-1.5 py-0.5 ${
                  isDesert ? 'border-green-700/50 text-green-800' : 'border-green-500/30 text-green-500/80'
                }`}>
                  ONLINE
                </span>
              )}
              {isOOS && (
                <span className="text-[9px] font-bold tracking-wider border border-amber-500/30 px-1.5 py-0.5 text-amber-500/70">
                  OUT-OF-STATE
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {cpc != null && pct != null ? (
              <>
                <div className="text-[11px] text-gray-500 mb-0.5">${cpc}/credit</div>
                <div className={`text-[12px] font-bold ${coverageTextClass(pct, isDesert)}`}>{pct}% COVERS</div>
              </>
            ) : (
              <div className="text-[10px] text-gray-700">N/A</div>
            )}
          </div>
        </div>
        {pct != null && (
          <div className="mt-2 ml-[3.25rem]">
            <TACoverageBar pct={pct} isDesert={isDesert} showLabel={false} />
          </div>
        )}
      </button>

      <div className="px-4 pb-2.5 flex items-center justify-between">
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(); }}
          className={`flex items-center gap-1.5 text-[10px] tracking-wider transition-colors ${
            isSaved ? 'text-red-500 hover:text-red-400' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          <Bookmark className="w-3 h-3" fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'SAVED' : 'SAVE'}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onToggleCompare(); }}
          className="flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-gray-400 transition-colors tracking-wider"
        >
          {inCompare
            ? <CheckSquare className="w-3 h-3 text-red-500" />
            : <Square className="w-3 h-3" />}
          COMPARE
        </button>
      </div>
    </div>
  );
}
