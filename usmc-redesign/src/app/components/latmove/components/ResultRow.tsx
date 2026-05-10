import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { CLEARANCE_LABELS, colorVisionLabel } from '../types';
import { SKILL_LABELS } from '../db/mos-skills';
import { CERT_BY_ID } from '../db/cert-library';
import { DEGREE_FIELD_BY_ID } from '../db/degree-field-library';
import type { ResultItem } from '../types';

interface Props {
  result: ResultItem;
  resultNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function matchColor(pct: number) {
  if (pct >= 95) return 'text-green-400';
  if (pct >= 90) return 'text-green-500';
  return 'text-yellow-500';
}

function skillMatchColor(pct: number) {
  if (pct >= 70) return 'text-cyan-400';
  if (pct >= 40) return 'text-cyan-600';
  return 'text-gray-500';
}

export function ResultRow({ result, resultNumber, isExpanded, onToggle }: Props) {
  const formattedNumber = String(resultNumber).padStart(2, '0');

  function qualificationTone(status: 'met' | 'unmet' | 'unknown') {
    if (status === 'unmet') {
      return {
        icon: <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />,
        textClassName: 'text-[13px] text-red-200 leading-relaxed',
      };
    }

    if (status === 'unknown') {
      return {
        icon: <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />,
        textClassName: 'text-[13px] text-yellow-200 leading-relaxed',
      };
    }

    return {
      icon: <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />,
      textClassName: 'text-[13px] text-green-300 leading-relaxed',
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
        <span className="text-base font-black text-gray-300 font-mono tracking-wide">{result.id}</span>
        <span className="pr-2 text-sm leading-tight text-gray-200">{result.title}</span>
        <span className="pr-2 text-[10px] font-bold tracking-[0.16em] text-red-400/70">{result.field}</span>
        <div>
          <div className={`text-base font-black ${matchColor(result.match)}`}>{result.match}%</div>
          <div className="text-xs text-gray-600 tracking-wide">QUALIFIED</div>
          {result.skillMatch != null && (
            <>
              <div className={`mt-1 text-sm font-black ${skillMatchColor(result.skillMatch.pct)}`}>{result.skillMatch.pct}%</div>
              <div className="text-[10px] text-gray-600 tracking-wide">SKILL XFR</div>
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 font-mono leading-relaxed pr-2">
          <div>{result.reqStr}</div>
          <div className="mt-0.5 text-[11px] text-gray-600">CLR {CLEARANCE_LABELS[result.clearance]}</div>
          <div className="text-[11px] text-gray-600">COLOR {result.requiresNormalColorVision ? 'NORMAL' : 'NONE'}</div>
        </div>
        <div className="flex justify-center">
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-red-500" />
            : <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
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
                  <div className="text-xs text-gray-500 font-bold tracking-[0.2em] mb-2">MOS OVERVIEW</div>
                  <div className="text-sm font-bold text-white mb-1">
                    {result.id} — {result.title}
                  </div>
                  <div className="mb-2 text-[11px] font-bold tracking-[0.18em] text-red-400/75">
                    {result.field}
                  </div>
                  {result.description && (
                    <p className="mb-3 text-[13px] leading-relaxed text-gray-400">
                      {result.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-600 font-mono">
                    Eligible Ranks: {result.rank_eligibility.join(', ')}
                  </div>
                  <div className="text-xs text-gray-600 font-mono">
                    ASVAB: {result.reqStr}
                  </div>
                  <div className="text-xs text-gray-600 font-mono">
                    Clearance: {CLEARANCE_LABELS[result.clearance]}
                  </div>
                  <div className="text-xs text-gray-600 font-mono">
                    Color: {colorVisionLabel(result.requiresNormalColorVision)}
                  </div>

                  {result.skillMatch && result.skillMatch.shared.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-bold tracking-[0.2em] text-cyan-500/70">
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
                      <div className="mb-1 text-xs font-bold tracking-[0.2em] text-gray-600">
                        TRANSFERABLE SKILLS
                      </div>
                      <div className="text-[12px] text-gray-600">No direct skill overlap from your PMOS.</div>
                    </div>
                  )}

                  {result.matchingCertIds && result.matchingCertIds.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-bold tracking-[0.2em] text-amber-500/70">
                        RELEVANT CERTIFICATIONS
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchingCertIds.map(id => (
                          <span
                            key={id}
                            className="rounded-sm border border-amber-500/20 bg-amber-950/30 px-2 py-0.5 font-mono text-[10px] text-amber-400/80"
                          >
                            {CERT_BY_ID[id]?.label ?? id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.matchingDegreeFieldIds && result.matchingDegreeFieldIds.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-bold tracking-[0.2em] text-violet-400/70">
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
                  <div className="text-xs text-gray-500 font-bold tracking-[0.2em] mb-2">
                    QUALIFICATION REQUIREMENTS
                  </div>
                  <div className="space-y-1.5">
                    {result.qualificationChecks.length === 0 ? (
                      <span className="text-[13px] text-gray-600">No additional requirements.</span>
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
                </div>
              </div>

              <button className="w-full py-2.5 border border-red-600/40 text-red-500 text-[13px] font-bold tracking-widest hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2">
                CONTACT YOUR CAREER PLANNER <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
