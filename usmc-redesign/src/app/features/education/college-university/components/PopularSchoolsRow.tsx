import { useEffect, useState } from 'react';
import { SchoolBadge } from './SchoolBadge';
import { TACoverageBar } from './TACoverageBar';
import {
  activeTuition, calcCostPerCredit, calcTACoverage, coverageTextClass,
  fetchSchoolsByQuery, bestMatchFromResults, ownershipLabel,
} from '../utils';
import { POPULAR_SCHOOL_NAMES } from '../constants';
import type { SchoolResult, TuitionMode } from '../types';

interface Props {
  tuitionMode: TuitionMode;
  isDesert: boolean;
  onSelect: (school: SchoolResult) => void;
  selectedName?: string;
}

export function PopularSchoolsRow({ tuitionMode, isDesert, onSelect, selectedName }: Props) {
  const [schools, setSchools] = useState<(SchoolResult | null)[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const workerUrl = import.meta.env.VITE_SCHOOL_SEARCH_WORKER_URL;
    if (!workerUrl) { setLoaded(true); return; }

    Promise.allSettled(
      POPULAR_SCHOOL_NAMES.map(name =>
        fetchSchoolsByQuery(workerUrl, name).then(results => bestMatchFromResults(results, name))
      )
    ).then(settled => {
      setSchools(settled.map(r => (r.status === 'fulfilled' ? r.value : null)));
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {POPULAR_SCHOOL_NAMES.map((_, i) => (
          <div key={i} className="flex-shrink-0 w-52 h-36 border border-white/12 bg-black animate-pulse" />
        ))}
      </div>
    );
  }

  const visible = schools.filter(Boolean) as SchoolResult[];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {visible.map(school => {
        const tuition = activeTuition(school, tuitionMode);
        const cpc = calcCostPerCredit(tuition);
        const pct = calcTACoverage(tuition);
        const isSelected = school.name === selectedName;

        return (
          <button
            key={school.name}
            onClick={() => onSelect(school)}
            className={`flex-shrink-0 w-52 border text-left p-4 transition-colors ${
              isSelected
                ? isDesert ? 'border-red-700/60 bg-red-900/10' : 'border-red-600 bg-red-950/20'
                : 'border-white/12 bg-black hover:border-white/25'
            }`}
          >
            <div className="flex items-start gap-2.5 mb-3">
              <SchoolBadge name={school.name} size="sm" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight line-clamp-2">{school.name}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  {ownershipLabel(school.ownership)}{school.distanceOnly ? ' · Online' : ''}
                </div>
              </div>
            </div>
            {cpc != null && pct != null ? (
              <>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[11px] text-gray-500">${cpc}/credit</span>
                  <span className={`text-[11px] font-bold ${coverageTextClass(pct, isDesert)}`}>{pct}% TA</span>
                </div>
                <TACoverageBar pct={pct} isDesert={isDesert} showLabel={false} />
              </>
            ) : (
              <div className="text-[10px] text-gray-700">Tuition data unavailable</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
