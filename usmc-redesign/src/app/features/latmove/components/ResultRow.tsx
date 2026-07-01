import { motion, AnimatePresence } from 'motion/react';
import { CaretRight, CaretDown, CaretUp, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { useTheme } from '@/app/features/theme/ThemeContext';
import { CLEARANCE_LABELS, colorVisionLabel } from '../types';
import { SKILL_LABELS } from '../db/mos-skills';
import { CERT_BY_ID } from '../db/cert-library';
import { DEGREE_FIELD_BY_ID } from '../db/degree-field-library';
import type { ResultItem } from '../types';

const bonusFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface Props {
  result: ResultItem;
  resultNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function matchColor(pct: number, isDesert: boolean) {
  if (isDesert) {
    if (pct >= 95) return 'text-green-700';
    if (pct >= 90) return 'text-green-700';
    return 'text-yellow-700';
  }
  if (pct >= 95) return 'text-green-400';
  if (pct >= 90) return 'text-green-500';
  return 'text-yellow-500';
}

function skillMatchColor(pct: number, isDesert: boolean) {
  if (isDesert) {
    if (pct >= 70) return 'text-cyan-700';
    if (pct >= 40) return 'text-cyan-800';
    return 'text-gray-600';
  }
  if (pct >= 70) return 'text-cyan-400';
  if (pct >= 40) return 'text-cyan-600';
  return 'text-gray-500';
}

export function ResultRow({ result, resultNumber, isExpanded, onToggle }: Props) {
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const formattedNumber = String(resultNumber).padStart(2, '0');
  const bonusRangeLabel = result.lateralMoveBonusRange
    ? `${bonusFormatter.format(result.lateralMoveBonusRange.min)}-${bonusFormatter.format(result.lateralMoveBonusRange.max)}`
    : null;

  function qualificationTone(status: 'met' | 'unmet' | 'unknown') {
    if (status === 'unmet') {
      return {
        icon: <WarningCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />,
        textClassName: 'text-[13px] text-red-200 leading-relaxed',
      };
    }

    if (status === 'unknown') {
      return {
        icon: <WarningCircle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isDesert ? 'text-yellow-700' : 'text-yellow-500'}`} />,
        textClassName: isDesert ? 'text-[13px] text-yellow-800 leading-relaxed' : 'text-[13px] text-yellow-200 leading-relaxed',
      };
    }

    return {
      icon: <CheckCircle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isDesert ? 'text-green-700' : 'text-green-500'}`} />,
      textClassName: isDesert ? 'text-[13px] text-green-800 leading-relaxed' : 'text-[13px] text-green-300 leading-relaxed',
    };
  }

  return (
    <div className="border-b border-white/8">
      {/* Collapsed row */}
      <button
        className="w-full grid grid-cols-[44px_64px_minmax(0,1.15fr)_minmax(140px,0.75fr)_72px_200px_36px] items-center gap-3 py-3.5 text-left hover:bg-white/[0.02] transition-colors group"
        onClick={onToggle}
      >
        <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-gray-700 transition-colors group-hover:text-red-500/60">
          {formattedNumber}
        </span>
        <span className="font-mono text-[17px] font-black tracking-[0.02em] text-gray-200">{result.id}</span>
        <span className="pr-2 text-[17px] leading-tight text-white">{result.title}</span>
        <div className="pr-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.22em] text-red-400/70">{result.field}</span>
          {result.isHighDemandLatMove && (
            <span className={`border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.18em] ${isDesert ? 'border-amber-600/50 bg-amber-100/60 text-amber-800' : 'border-amber-500/35 bg-amber-950/20 text-amber-300/90'}`}>
              HIGH DEMAND
            </span>
          )}
        </div>
        <div>
          <div className={`text-[28px] font-black leading-none tracking-[-0.03em] ${matchColor(result.match, isDesert)}`}>{result.match}%</div>
          <div className="text-[10px] tracking-[0.16em] text-gray-600">QUALIFIED</div>
          {result.skillMatch != null && (
            <>
              <div className={`mt-1 text-[18px] font-black leading-none tracking-[-0.02em] ${skillMatchColor(result.skillMatch.pct, isDesert)}`}>{result.skillMatch.pct}%</div>
              <div className="text-[10px] text-gray-600 tracking-[0.16em]">SKILL XFR</div>
            </>
          )}
        </div>
        <div className="pr-2 font-mono text-[13px] leading-relaxed text-gray-400">
          <div>{result.reqStr}</div>
          {bonusRangeLabel && <div className="mt-0.5 text-[11px] text-red-400/80">LM BONUS {bonusRangeLabel}</div>}
          <div className="mt-0.5 text-[11px] text-gray-600">CLR {CLEARANCE_LABELS[result.clearance]}</div>
          <div className="text-[11px] text-gray-600">COLOR {result.requiresNormalColorVision ? 'NORMAL' : 'NONE'}</div>
        </div>
        <div className="flex justify-center">
          {isExpanded
            ? <CaretUp className="w-4 h-4 text-red-500" />
            : <CaretDown className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
          }
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border border-white/12 bg-black/50 mb-2 p-5">
              <div className="grid grid-cols-3 gap-5 mb-4">
                {/* MOS Overview */}
                <div>
                  <div className="mb-2 text-[11px] font-bold tracking-[0.24em] text-gray-500">MOS OVERVIEW</div>
                  <div className="mb-1 text-[18px] font-bold leading-tight text-white">
                    {result.id} — {result.title}
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold tracking-[0.22em] text-red-400/75">
                      {result.field}
                    </span>
                    {result.isHighDemandLatMove && (
                      <span className={`border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.18em] ${isDesert ? 'border-amber-600/50 bg-amber-100/60 text-amber-800' : 'border-amber-500/35 bg-amber-950/20 text-amber-300/90'}`}>
                        HIGH DEMAND LATMOVE MOS
                      </span>
                    )}
                  </div>
                  {result.description && (
                    <p className="mb-3 text-[14px] leading-4 text-gray-400">
                      {result.description}
                    </p>
                  )}
                  <div className="mb-3 border-b border-white/10" />
                  <div className="text-[13px] text-gray-600 font-mono">
                    Eligible Ranks: {result.rank_eligibility.join(', ')}
                  </div>
                  <div className="text-[13px] text-gray-600 font-mono">
                    ASVAB: {result.reqStr}
                  </div>
                  <div className="text-[13px] text-gray-600 font-mono">
                    Clearance: {CLEARANCE_LABELS[result.clearance]}
                  </div>
                  <div className="text-[13px] text-gray-600 font-mono">
                    Color: {colorVisionLabel(result.requiresNormalColorVision)}
                  </div>
                  {result.skillMatch && result.skillMatch.shared.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-[11px] font-bold tracking-[0.24em] text-cyan-500/70">
                        TRANSFERABLE SKILLS ({result.skillMatch.pct}%)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.skillMatch.shared.map(tag => (
                          <span
                            key={tag}
                            className="rounded-sm border border-cyan-500/20 bg-cyan-950/30 px-2 py-0.5 font-mono text-[10px] text-cyan-400/80"
                          >
                            {SKILL_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.skillMatch && result.skillMatch.shared.length === 0 && (
                    <div className="mt-4">
                      <div className="mb-1 text-[11px] font-bold tracking-[0.24em] text-gray-600">
                        TRANSFERABLE SKILLS
                      </div>
                      <div className="text-[13px] text-gray-600">No direct skill overlap from your PMOS.</div>
                    </div>
                  )}

                  {result.matchingCertIds && result.matchingCertIds.length > 0 && (
                    <div className="mt-4">
                      <div className={`mb-2 text-[11px] font-bold tracking-[0.24em] ${isDesert ? 'text-amber-700' : 'text-amber-500/70'}`}>
                        RELEVANT CERTIFICATIONS
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchingCertIds.map(id => (
                          <span
                            key={id}
                            className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] ${isDesert ? 'border-amber-600/40 bg-amber-100/60 text-amber-800' : 'border-amber-500/20 bg-amber-950/30 text-amber-400/80'}`}
                          >
                            {CERT_BY_ID[id]?.label ?? id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.matchingDegreeFieldIds && result.matchingDegreeFieldIds.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-[11px] font-bold tracking-[0.24em] text-violet-400/70">
                        RELEVANT DEGREE BACKGROUNDS
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchingDegreeFieldIds.map(id => (
                          <span
                            key={id}
                            className="rounded-sm border border-violet-500/20 bg-violet-950/30 px-2 py-0.5 font-mono text-[10px] text-violet-300/80"
                          >
                            {DEGREE_FIELD_BY_ID[id]?.label ?? id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Qualification requirements */}
                <div className="col-span-2">
                  <div className="mb-2 text-[11px] font-bold tracking-[0.24em] text-gray-500">
                    QUALIFICATION REQUIREMENTS
                  </div>
                  <div className="space-y-1.5">
                    {result.qualificationChecks.length === 0 ? (
                      <span className="text-[14px] text-gray-600">No additional requirements.</span>
                    ) : result.qualificationChecks.map((check, i) => {
                      const tone = qualificationTone(check.status);

                      return (
                        <div key={i} className="flex items-start gap-1.5">
                          {tone.icon}
                          <span className={tone.textClassName}>{check.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  {bonusRangeLabel && (
                    <div className="mt-4 border border-red-600/20 bg-red-950/20 px-3 py-2.5">
                      <div className="text-[11px] font-bold tracking-[0.2em] text-red-300/85">FY27 LM BONUS RANGE</div>
                      <div className="mt-1 text-[17px] font-black text-white">{bonusRangeLabel}</div>
                      <div className="mt-1 text-[12px] font-mono text-gray-500">
                        Base SRBP range across Zones {result.lateralMoveBonusRange?.zones.join(', ')}
                      </div>
                      <Link
                        to="/pay-benefits/bonuses"
                        className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-red-400 transition-colors hover:text-red-300"
                      >
                        OPEN BONUS TOOL <CaretRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
