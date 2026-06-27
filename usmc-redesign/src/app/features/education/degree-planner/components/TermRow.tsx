import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Trash2, Plus, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import type { Term, Course, FundingSource, SchoolDetails } from '../types';
import { SEASONS, FUNDING_CYCLE, FUNDING_META, TA_ANNUAL_MAX } from '../constants';
import { courseTACost, fundingTextClass } from '../utils';
import { CourseRow } from './CourseRow';

interface TermRowProps {
  term: Term;
  termIdx: number;
  isOpen: boolean;
  isDesert: boolean;
  fyOver: boolean;
  termCredits: number;
  termTATotal: number;
  termFundingTotals: Partial<Record<FundingSource, number>>;
  termTAGap: number;
  schoolDetails: SchoolDetails | null;
  school: string;
  toggleTerm: (termId: string) => void;
  removeTerm: (termId: string) => void;
  setTerms: React.Dispatch<React.SetStateAction<Term[]>>;
  updateCourse: (termId: string, courseId: string, updates: Partial<Course>) => void;
  removeCourse: (termId: string, courseId: string) => void;
  addCourse: (termId: string) => void;
}

export function TermRow({
  term,
  termIdx,
  isOpen,
  isDesert,
  fyOver,
  termCredits,
  termTATotal,
  termFundingTotals,
  termTAGap,
  schoolDetails,
  school,
  toggleTerm,
  removeTerm,
  setTerms,
  updateCourse,
  removeCourse,
  addCourse,
}: TermRowProps) {
  return (
    <motion.div
      key={term.id}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.22 }}
    >
      {/* Term header row */}
      <div
        className="group flex cursor-pointer items-center gap-2 px-6 py-3 transition-colors hover:bg-white/[0.03]"
        onClick={() => toggleTerm(term.id)}
      >
        {/* Index badge */}
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center border border-white/20 text-[10px] font-bold text-gray-500 transition-colors group-hover:border-white/35 group-hover:text-gray-400">
          {String(termIdx + 1).padStart(2, '0')}
        </div>

        {/* Inline season select — ch units match exact character count in monospace */}
        <select
          value={term.season}
          onChange={e => setTerms(prev => prev.map(t => t.id === term.id ? { ...t, season: e.target.value as typeof term.season } : t))}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          title="Click to change season"
          className={`appearance-none cursor-pointer border-b border-transparent bg-transparent p-0 font-mono text-sm font-bold transition-colors focus:outline-none hover:border-white/30 focus:border-red-500/60 ${isDesert ? 'text-gray-900' : 'text-white'}`}
          style={{ width: `${term.season.length}ch` }}
        >
          {SEASONS.map(s => <option key={s} value={s} className={isDesert ? 'bg-[#f0ebe0]' : 'bg-black'}>{s}</option>)}
        </select>

        {/* Inline year select */}
        <select
          value={term.year}
          onChange={e => setTerms(prev => prev.map(t => t.id === term.id ? { ...t, year: Number(e.target.value) } : t))}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          title="Click to change year"
          className={`appearance-none cursor-pointer border-b border-transparent bg-transparent p-0 font-mono text-sm font-bold transition-colors focus:outline-none hover:border-white/30 focus:border-red-500/60 ${isDesert ? 'text-gray-900' : 'text-white'}`}
          style={{ width: '4ch' }}
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 1).map(y => (
            <option key={y} value={y} className={isDesert ? 'bg-[#f0ebe0]' : 'bg-black'}>{y}</option>
          ))}
        </select>

        {/* Edit hint */}
        <span className={`text-[9px] italic ${isDesert ? 'text-stone-400' : 'text-gray-600'}`}>
          — click to edit
        </span>

        {/* Credits + FY over-limit badge */}
        <span className="text-[11px] text-gray-600">{termCredits} SH</span>
        {fyOver && (
          <span className={`border px-1.5 py-0.5 text-[10px] font-bold ${isDesert ? 'border-amber-700/50 text-amber-900' : 'border-amber-500/30 text-amber-400'}`}>
            FY OVER LIMIT
          </span>
        )}

        {/* Chevron — pushed right */}
        <ChevronDown className={`ml-auto h-4 w-4 flex-shrink-0 text-gray-600 transition-[transform,color] group-hover:text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />

        {/* Trash — destructive, kept far right and separated */}
        <button
          onClick={e => { e.stopPropagation(); removeTerm(term.id); }}
          className="flex h-7 w-7 cursor-pointer items-center justify-center border border-white/10 text-gray-600 transition-colors hover:border-red-500/40 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expandable course rows */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-5">
              {/* Column headers */}
              {term.courses.length > 0 && (
                <div className="mb-2 hidden grid-cols-[1fr_100px_72px_100px_80px_52px_32px] gap-2 text-[10px] font-bold tracking-wider text-gray-600 md:grid">
                  <div>COURSE / SUBJECT</div>
                  <div>STATUS</div>
                  <div>CREDITS</div>
                  <div className="flex items-center gap-1">
                    COST / SH ($)
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="cursor-pointer text-gray-700 transition-colors hover:text-gray-400">
                          <Info className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" side="top" className="w-72 rounded-none border-white/12 bg-black/95 p-4 text-left shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
                        <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-red-400">COST / SH ($)</div>
                        <p className="text-xs leading-relaxed text-gray-400">
                          Cost per semester hour (credit hour).{' '}
                          {schoolDetails?.tuitionInState
                            ? <>Pre-filled from <span className="text-gray-300">{school}</span>'s reported in-state tuition of <span className="text-gray-300">${schoolDetails.tuitionInState.toLocaleString()}/yr</span> divided by 30 credit hours. This is an estimate — edit any value to match your actual rate.</>
                            : <>Select a school in the Degree Goal section to auto-fill this from the school's published tuition. You can always edit the value manually.</>
                          }
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>FUNDING</div>
                  <div>GRADE</div>
                  <div />
                </div>
              )}

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {term.courses.map(course => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      termId={term.id}
                      isDesert={isDesert}
                      updateCourse={updateCourse}
                      removeCourse={removeCourse}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <button
                onClick={() => addCourse(term.id)}
                className="mt-3 flex w-full cursor-pointer items-center gap-2 border border-dashed border-white/16 px-4 py-2.5 text-[12px] font-bold tracking-wider text-gray-600 transition-colors hover:border-white/30 hover:text-gray-400"
              >
                <Plus className="h-3.5 w-3.5" />
                ADD COURSE
              </button>

              {term.courses.length > 0 && (() => {
                return (
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4 text-[11px]">
                    <span className="text-gray-500">
                      CREDITS: <span className="font-bold text-white">{termCredits} SH</span>
                    </span>
                    {FUNDING_CYCLE.filter(f => termFundingTotals[f]).map(f => (
                      <span key={f} className="text-gray-500">
                        {FUNDING_META[f].label}:{' '}
                        <span className={`font-bold ${fundingTextClass(f, isDesert)}`}>
                          ${(f === 'ta' ? termTATotal : (termFundingTotals[f] ?? 0)).toLocaleString()}
                        </span>
                        {f === 'ta' && termTAGap > 0 && (
                          <span className="ml-1 font-normal text-gray-600">(cap $250/SH)</span>
                        )}
                      </span>
                    ))}
                    {termTAGap > 0 && (
                      <span className="text-gray-500">
                        UNCOVERED:{' '}
                        <span className={`font-bold ${isDesert ? 'text-amber-900' : 'text-amber-400'}`}>${termTAGap.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
