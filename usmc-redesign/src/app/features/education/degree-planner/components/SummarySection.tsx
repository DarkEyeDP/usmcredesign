import { motion, AnimatePresence } from 'motion/react';
import type { DegreeLevel, Term, FundingSource, Season } from '../types';

interface SummarySectionProps {
  degreeLevel: DegreeLevel;
  isDesert: boolean;
  progressPct: number;
  earnedPct: number;
  plannedPct: number;
  earnedCredits: number;
  plannedCredits: number;
  requiredCredits: number;
  creditsToGo: number;
  terms: Term[];
  termsToFinish: number;
  estimatedFinal: string;
  lastTerm: Term | undefined;
  gpa: string | null;
  fieldOfStudy: string;
  school: string;
  totalTuition: number;
  totalTAFunded: number;
  totalByFunding: Partial<Record<FundingSource, number>>;
  resetPlan: () => void;
}

export function SummarySection({
  degreeLevel,
  isDesert,
  progressPct,
  earnedPct,
  plannedPct,
  earnedCredits,
  plannedCredits,
  requiredCredits,
  creditsToGo,
  terms,
  termsToFinish,
  estimatedFinal,
  lastTerm,
  gpa,
  fieldOfStudy,
  school,
  totalTuition,
  totalTAFunded,
  totalByFunding,
  resetPlan,
}: SummarySectionProps) {
  return (
    <AnimatePresence>
      {degreeLevel && (
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="border border-white/12 bg-black"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
                <span className="text-sm font-bold text-red-500">4</span>
              </div>
              <span className="text-sm font-bold tracking-widest text-gray-400">SUMMARY</span>
            </div>
          </div>
          <div className="space-y-6 px-6 py-6">

            {/* Progress bar */}
            <div>
              <div className="mb-2 flex justify-between text-[11px] font-bold text-gray-500">
                <span>DEGREE PROGRESS</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden bg-white/10">
                <motion.div
                  className={`h-full flex-shrink-0 ${isDesert ? 'bg-green-600' : 'bg-green-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${earnedPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <motion.div
                  className="h-full flex-shrink-0 bg-red-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${plannedPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-600">
                <div className="flex items-center gap-3">
                  {earnedCredits > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-3 flex-shrink-0 ${isDesert ? 'bg-green-600' : 'bg-green-500'}`} />
                      <span className={isDesert ? 'text-green-700' : 'text-green-400'}>{earnedCredits} SH earned</span>
                    </span>
                  )}
                  {plannedCredits > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-3 flex-shrink-0 bg-red-600" />
                      <span className={isDesert ? 'text-red-700' : 'text-red-400'}>{plannedCredits} SH planned</span>
                    </span>
                  )}
                  {earnedCredits === 0 && plannedCredits === 0 && <span>Add credits above to track progress</span>}
                </div>
                <span>{requiredCredits} SH required</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                {
                  label: 'CREDITS TO GO',
                  value: creditsToGo === 0 && requiredCredits > 0 ? 'COMPLETE' : `${creditsToGo} SH`,
                  accent: creditsToGo === 0 && requiredCredits > 0,
                },
                { label: 'TERMS PLANNED', value: terms.length > 0 ? String(terms.length) : '—', accent: false },
                {
                  label: "ADD'L TERMS NEEDED",
                  value: creditsToGo === 0 ? '0' : terms.length > 0 ? `+${termsToFinish}` : '—',
                  accent: false,
                },
                {
                  label: 'EST. FINAL TERM',
                  value: creditsToGo === 0
                    ? lastTerm ? `${lastTerm.season} ${lastTerm.year}` : '—'
                    : estimatedFinal || '—',
                  accent: false,
                  small: true,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className={`border px-4 py-4 ${
                    stat.accent
                      ? isDesert ? 'border-green-700/50 bg-green-50/50' : 'border-green-500/20 bg-green-950/20'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">{stat.label}</div>
                  <div className={`font-black leading-tight ${(stat as any).small ? 'text-sm' : 'text-xl'} ${
                    stat.accent ? (isDesert ? 'text-green-700' : 'text-green-400') : 'text-white'
                  }`}>
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* GPA */}
            {gpa && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-5 border px-5 py-4 ${
                  isDesert ? 'border-green-700/50 bg-green-50/50' : 'border-green-500/20 bg-green-950/15'
                }`}
              >
                <div>
                  <div className="mb-0.5 text-[10px] font-bold tracking-wider text-gray-500">CUMULATIVE GPA</div>
                  <div className={`text-3xl font-black ${isDesert ? 'text-green-700' : 'text-green-400'}`}>{gpa}</div>
                </div>
                <div className="text-[11px] leading-relaxed text-gray-600">
                  Calculated from courses individually marked DONE with letter grades.<br />
                  W and IP courses are excluded from the GPA calculation.
                </div>
              </motion.div>
            )}

            {/* Field + school + level summary line */}
            {fieldOfStudy && (
              <div className="flex flex-wrap items-center gap-2 border-l-2 border-red-600 pl-4 text-[13px]">
                {school && <><span className="font-bold text-white">{school}</span><span className="text-gray-600">·</span></>}
                <span className="font-bold text-white">{fieldOfStudy}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400">
                  {degreeLevel === 'associates' ? "Associate's" : degreeLevel === 'bachelors' ? "Bachelor's" : "Master's"}{' '}Degree
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400">{requiredCredits} credit hours required</span>
              </div>
            )}

            {/* Cost breakdown */}
            {terms.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-4 w-1 bg-red-600" />
                  <span className="text-[11px] font-bold tracking-widest text-gray-400">COST BREAKDOWN</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.04] px-4 py-4">
                    <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">TOTAL TUITION</div>
                    <div className="text-xl font-black text-white">${totalTuition.toLocaleString()}</div>
                  </div>
                  {(totalByFunding.ta ?? 0) > 0 && (
                    <div className={`border px-4 py-4 ${isDesert ? 'border-green-700/50 bg-green-50/50' : 'border-green-500/20 bg-green-950/15'}`}>
                      <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">TA FUNDED (CAPPED)</div>
                      <div className={`text-xl font-black ${isDesert ? 'text-green-700' : 'text-green-400'}`}>${totalTAFunded.toLocaleString()}</div>
                    </div>
                  )}
                  {(totalByFunding['gi-bill'] ?? 0) > 0 && (
                    <div className={`border px-4 py-4 ${isDesert ? 'border-amber-700/40 bg-amber-900/10' : 'border-amber-500/20 bg-amber-950/10'}`}>
                      <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">GI BILL®</div>
                      <div className={`text-xl font-black ${isDesert ? 'text-amber-900' : 'text-amber-400'}`}>${(totalByFunding['gi-bill'] ?? 0).toLocaleString()}</div>
                    </div>
                  )}
                  {(totalByFunding.fafsa ?? 0) > 0 && (
                    <div className="border border-sky-500/20 bg-sky-950/10 px-4 py-4">
                      <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">FAFSA</div>
                      <div className="text-xl font-black text-sky-400">${(totalByFunding.fafsa ?? 0).toLocaleString()}</div>
                    </div>
                  )}
                  {(totalByFunding.scholarship ?? 0) > 0 && (
                    <div className={`border px-4 py-4 ${isDesert ? 'border-violet-700/50 bg-violet-50/50' : 'border-violet-500/20 bg-violet-950/10'}`}>
                      <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">SCHOLARSHIP</div>
                      <div className={`text-xl font-black ${isDesert ? 'text-violet-700' : 'text-violet-400'}`}>${(totalByFunding.scholarship ?? 0).toLocaleString()}</div>
                    </div>
                  )}
                  {(totalByFunding.oop ?? 0) > 0 && (
                    <div className="border border-white/10 bg-white/[0.04] px-4 py-4">
                      <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">OUT OF POCKET</div>
                      <div className="text-xl font-black text-white">${(totalByFunding.oop ?? 0).toLocaleString()}</div>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-gray-600">
                  TA is capped at $4,500 per fiscal year (Oct 1 – Sep 30) and $250 per credit hour. Funding sources shown reflect your selections per course. Estimate does not include fees, books, or other expenses. Verify all figures with your education center.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
