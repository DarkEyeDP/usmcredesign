import { motion, AnimatePresence } from 'motion/react';
import { CaretRight, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { CLEARANCE_LABELS, colorVisionLabel } from '../types';
import { SKILL_LABELS } from '../db/mos-skills';
import { CERT_BY_ID } from '../db/cert-library';
import { DEGREE_FIELD_BY_ID } from '../db/degree-field-library';
import type { ResultItem } from '../types';
import { useTheme } from '@/app/features/theme/ThemeContext';

const bonusFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface Props {
  result: ResultItem | null;
  resultNumber: number | null;
  activeSide: 'left' | 'right';
}

export function ResultCardDetail({ result, resultNumber, activeSide }: Props) {
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const formattedNumber = resultNumber == null ? '' : String(resultNumber).padStart(2, '0');
  const bonusRangeLabel = result?.lateralMoveBonusRange
    ? `${bonusFormatter.format(result.lateralMoveBonusRange.min)}-${bonusFormatter.format(result.lateralMoveBonusRange.max)}`
    : null;

  function qualificationTone(status: 'met' | 'unmet' | 'unknown') {
    if (status === 'unmet') {
      return {
        icon: <WarningCircle className={`mt-0.5 h-3 w-3 flex-shrink-0 ${isDesert ? 'text-red-600' : 'text-red-400'}`} />,
        textClassName: `text-[13px] leading-relaxed ${isDesert ? 'text-red-700' : 'text-red-200'}`,
      };
    }

    if (status === 'unknown') {
      return {
        icon: <WarningCircle className={`mt-0.5 h-3 w-3 flex-shrink-0 ${isDesert ? 'text-yellow-600' : 'text-yellow-500'}`} />,
        textClassName: `text-[13px] leading-relaxed ${isDesert ? 'text-yellow-700' : 'text-yellow-200'}`,
      };
    }

    return {
      icon: <CheckCircle className={`mt-0.5 h-3 w-3 flex-shrink-0 ${isDesert ? 'text-green-700' : 'text-green-500'}`} />,
      textClassName: `text-[13px] leading-relaxed ${isDesert ? 'text-green-700' : 'text-green-300'}`,
    };
  }

  return (
    <AnimatePresence initial={false}>
      {result && (
        <motion.div
          AppWindow
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="border border-t-0 border-red-500/30 bg-red-950/8 pb-5 pt-0">
            <div className="relative mb-5">
              <div className="relative px-5" style={{ backgroundColor: 'var(--usmc-bg-page)' }}>
                {activeSide === 'left' ? (
                  <div className="flex min-h-11 flex-wrap items-end gap-4 border-b border-white/12 pb-2 pt-4">
                    <div className="pb-px font-mono text-[11px] font-bold tracking-[0.18em] text-red-500/45">
                      {formattedNumber}
                    </div>
                    <div className="text-[13px] font-bold tracking-[0.25em] text-red-400/90">
                      EXPANDED DETAILS FOR MOS {result.id}
                    </div>
                    <div className="mb-1.5 h-px flex-1 bg-red-500/30" />
                  </div>
                ) : (
                  <div className="flex min-h-11 flex-wrap items-end gap-4 border-b border-white/12 pb-2 pt-4">
                    <div className="mb-1.5 h-px flex-1 bg-red-500/30" />
                    <div className="pb-px font-mono text-[11px] font-bold tracking-[0.18em] text-red-500/45">
                      {formattedNumber}
                    </div>
                    <div className="text-[13px] font-bold tracking-[0.25em] text-red-400/90">
                      EXPANDED DETAILS FOR MOS {result.id}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-5 px-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-8">
              <div>
                <div className="mb-2 text-[11px] font-bold tracking-[0.24em] text-gray-500">MOS OVERVIEW</div>
                <div className="mb-1 text-[18px] font-bold leading-tight text-white">
                  {result.id} - {result.title}
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
                    <div className={`mb-2 text-[11px] font-bold tracking-[0.24em] ${isDesert ? 'text-cyan-700' : 'text-cyan-500/70'}`}>
                      TRANSFERABLE SKILLS ({result.skillMatch.pct}% MATCH)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skillMatch.shared.map(tag => (
                        <span
                          key={tag}
                          className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] ${isDesert ? 'border-cyan-600/40 bg-cyan-100/60 text-cyan-800' : 'border-cyan-500/20 bg-cyan-950/30 text-cyan-400/80'}`}
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
                    <div className={`mb-2 text-[11px] font-bold tracking-[0.24em] ${isDesert ? 'text-violet-700' : 'text-violet-400/70'}`}>
                      RELEVANT DEGREE BACKGROUNDS
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchingDegreeFieldIds.map(id => (
                        <span
                          key={id}
                          className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] ${isDesert ? 'border-violet-500/40 bg-violet-100/60 text-violet-800' : 'border-violet-500/20 bg-violet-950/30 text-violet-300/80'}`}
                        >
                          {DEGREE_FIELD_BY_ID[id]?.label ?? id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
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
                  <div className={`mt-4 px-3 py-2.5 ${isDesert ? 'border border-red-700/40 bg-red-100/40' : 'border border-red-600/20 bg-red-950/20'}`}>
                    <div className={`text-[11px] font-bold tracking-[0.2em] ${isDesert ? 'text-red-700' : 'text-red-300/85'}`}>FY27 LM BONUS RANGE</div>
                    <div className="mt-1 text-[17px] font-black text-white">{bonusRangeLabel}</div>
                    <div className="mt-1 text-[12px] font-mono text-gray-500">
                      Base SRBP range across Zones {result.lateralMoveBonusRange?.zones.join(', ')}
                    </div>
                    <Link
                      to="/pay-benefits/bonuses"
                      className={`mt-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] transition-colors ${isDesert ? 'text-red-700 hover:text-red-800' : 'text-red-400 hover:text-red-300'}`}
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
  );
}
