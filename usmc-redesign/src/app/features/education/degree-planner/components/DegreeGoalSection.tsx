import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Info, MapPin } from 'lucide-react';
import type { DegreeLevel, SchoolDetails, SchoolSuggestion, Term } from '../types';
import { DEGREE_CREDITS, FIELDS_OF_STUDY } from '../constants';
import { NumericInput } from './NumericInput';
import { SectionHeader } from './SectionHeader';

interface DegreeGoalSectionProps {
  degreeLevel: DegreeLevel;
  setDegreeLevel: React.Dispatch<React.SetStateAction<DegreeLevel>>;
  school: string;
  setSchool: React.Dispatch<React.SetStateAction<string>>;
  schoolDetails: SchoolDetails | null;
  setSchoolDetails: React.Dispatch<React.SetStateAction<SchoolDetails | null>>;
  schoolSuggestions: SchoolSuggestion[];
  setSchoolSuggestions: React.Dispatch<React.SetStateAction<SchoolSuggestion[]>>;
  showSchoolSuggestions: boolean;
  setShowSchoolSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  handleSchoolChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fieldOfStudy: string;
  setFieldOfStudy: React.Dispatch<React.SetStateAction<string>>;
  customCredits: number | null;
  setCustomCredits: React.Dispatch<React.SetStateAction<number | null>>;
  isDesert: boolean;
  setTerms: React.Dispatch<React.SetStateAction<Term[]>>;
}

export function DegreeGoalSection({
  degreeLevel,
  setDegreeLevel,
  school,
  setSchool,
  schoolDetails,
  setSchoolDetails,
  schoolSuggestions,
  setSchoolSuggestions,
  showSchoolSuggestions,
  setShowSchoolSuggestions,
  handleSchoolChange,
  fieldOfStudy,
  setFieldOfStudy,
  customCredits,
  setCustomCredits,
  isDesert,
  setTerms,
}: DegreeGoalSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      className="border border-white/12 bg-black"
    >
      <SectionHeader num="1" title="DEGREE GOAL" />
      <div className="space-y-6 px-6 py-6">

        {/* School + Field of study — side by side */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-gray-500">SCHOOL / INSTITUTION</div>
            <div className="relative">
              <input
                type="text"
                value={school}
                onChange={handleSchoolChange}
                onFocus={() => school.length >= 2 && setShowSchoolSuggestions(schoolSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSchoolSuggestions(false), 150)}
                onKeyDown={e => { if (e.key === 'Escape') setShowSchoolSuggestions(false); }}
                placeholder="e.g. American Military University…"
                className="w-full border border-white/16 bg-black px-4 py-3 font-mono text-sm text-white placeholder-gray-700 focus:border-red-500/50 focus:outline-none"
              />
              {showSchoolSuggestions && (
                <div className={`absolute left-0 right-0 top-full z-50 border border-t-0 shadow-xl ${isDesert ? 'border-black/10 bg-[#f0ebe0]' : 'border-white/16 bg-[#0a0a0a]'}`}>
                  {schoolSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        const details: SchoolDetails = { ownership: s.ownership, distanceOnly: s.distanceOnly, tuitionInState: s.tuitionInState, tuitionOutOfState: s.tuitionOutOfState, city: s.city, state: s.state };
                        setSchool(s.name);
                        setSchoolDetails(details);
                        setShowSchoolSuggestions(false);
                        setSchoolSuggestions([]);
                        if (s.tuitionInState) {
                          const estimated = Math.round(s.tuitionInState / 30);
                          setTerms(prev => prev.map(t => ({
                            ...t,
                            courses: t.courses.map(c => c.status === 'complete' ? c : { ...c, costPerCredit: estimated }),
                          })));
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between border-b px-4 py-2.5 text-left last:border-b-0 ${isDesert ? 'border-black/8 hover:bg-black/5' : 'border-white/8 hover:bg-white/8'}`}
                    >
                      <span className={`truncate pr-3 font-mono text-sm ${isDesert ? 'text-gray-900' : 'text-white'}`}>{s.name}</span>
                      <span className={`shrink-0 text-xs ${isDesert ? 'text-stone-500' : 'text-gray-500'}`}>{s.city}, {s.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {schoolDetails && (() => {
              const ownershipMeta = schoolDetails.ownership === 1
                ? { label: 'PUBLIC', cls: isDesert ? 'border-gray-500 bg-gray-200/60 text-gray-700' : 'border-gray-600 bg-gray-800/60 text-gray-300' }
                : schoolDetails.ownership === 2
                ? { label: 'PRIVATE NON-PROFIT', cls: isDesert ? 'border-green-700/60 bg-green-100/60 text-green-800' : 'border-green-800/60 bg-green-900/20 text-green-400' }
                : { label: 'PRIVATE FOR-PROFIT', cls: isDesert ? 'border-amber-700/60 bg-amber-100/60 text-amber-800' : 'border-amber-700/60 bg-amber-900/20 text-amber-400' };
              return (
                <div className="mt-2 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold tracking-[0.15em] px-2 py-0.5 border ${ownershipMeta.cls}`}>
                      {ownershipMeta.label}
                    </span>
                    {schoolDetails.distanceOnly && (
                      <span className="text-[10px] font-bold tracking-[0.15em] px-2 py-0.5 border border-sky-800/60 bg-sky-900/20 text-sky-400">
                        ONLINE ONLY
                      </span>
                    )}
                    {schoolDetails.city && schoolDetails.state && (
                      <span className="flex items-center gap-1 text-[10px] font-bold tracking-[0.15em] text-gray-500">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        {schoolDetails.city}, {schoolDetails.state}
                      </span>
                    )}
                  </div>
                  {schoolDetails.ownership === 3 && (
                    <p className={`text-[11px] leading-snug ${isDesert ? 'text-amber-800' : 'text-amber-500'}`}>
                      ⚠ For-profit institutions may have additional USMC TA eligibility requirements. Verify regional accreditation before enrolling.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
          <div>
            <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-gray-500">FIELD OF STUDY</div>
            <div className="relative">
              <select
                value={fieldOfStudy}
                onChange={e => setFieldOfStudy(e.target.value)}
                className="w-full appearance-none border border-white/16 bg-black px-4 py-3 pr-8 font-mono text-sm text-white focus:border-red-500/50 focus:outline-none"
              >
                <option value="">Select a field of study…</option>
                {FIELDS_OF_STUDY.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Level selector */}
        <div>
          <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-gray-500">TARGET DEGREE LEVEL</div>
          <div className="grid grid-cols-3 gap-2">
            {(['associates', 'bachelors', 'masters'] as const).map((level, levelIdx) => {
              const selected = degreeLevel === level;
              return (
                <motion.button
                  key={level}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + levelIdx * 0.07, duration: 0.3 }}
                  onClick={() => { setDegreeLevel(level); setCustomCredits(null); }}
                  className={`cursor-pointer border px-2 py-3 text-left transition-colors md:px-4 md:py-5 ${
                    selected
                      ? isDesert ? 'border-red-700/60 bg-red-900/15 text-red-900' : 'border-red-600 bg-red-950/40 text-white'
                      : 'border-white/16 bg-black text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <div className="mb-2 min-h-[2.25rem] text-[10px] font-bold tracking-wide md:mb-3 md:min-h-0 md:text-sm md:tracking-wider">
                    {level === 'associates' ? "ASSOCIATE'S" : level === 'bachelors' ? "BACHELOR'S" : "MASTER'S"}
                  </div>
                  <div className={`text-2xl font-black leading-none md:text-4xl ${selected ? (isDesert ? 'text-red-800' : 'text-red-400') : 'text-gray-600'}`}>
                    {DEGREE_CREDITS[level]}
                    <span className="ml-1 text-sm font-bold md:ml-1.5 md:text-base">SH</span>
                  </div>
                  {level === 'masters' && (
                    <div className="mt-2 text-[9px] text-gray-600 md:mt-3 md:text-[10px]">grad coursework only</div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Master's clarification */}
        <AnimatePresence>
          {degreeLevel === 'masters' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 border px-4 py-3 ${
                isDesert ? 'border-amber-600/40 bg-amber-100/60' : 'border-amber-500/20 bg-amber-950/20'
              }`}
            >
              <Info className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isDesert ? 'text-amber-700' : 'text-amber-400'}`} />
              <p className={`text-[12px] leading-relaxed ${isDesert ? 'text-amber-800' : 'text-amber-300/80'}`}>
                A Master's program is <strong>graduate coursework only</strong> — typically 30–36 SH on top of a completed bachelor's degree. A bachelor's degree is required for admission. The credits shown here do not include your undergraduate education.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom credit hour override */}
        {degreeLevel && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-gray-500">
              {degreeLevel === 'masters' ? 'GRADUATE CREDIT HOURS REQUIRED' : 'TOTAL CREDIT HOURS REQUIRED'}
            </div>
            <div className="flex items-center gap-3">
              <NumericInput
                key={degreeLevel}
                value={customCredits ?? DEGREE_CREDITS[degreeLevel]}
                onChange={n => setCustomCredits(n)}
                min={1}
                className="w-28 border border-white/16 bg-black px-3 py-2.5 font-mono text-sm text-white focus:border-red-500/50 focus:outline-none"
              />
              <span className="text-[11px] leading-relaxed text-gray-600">
                {degreeLevel === 'masters'
                  ? `Adjust if your grad program requires more or fewer than ${DEGREE_CREDITS[degreeLevel]} SH.`
                  : `Adjust if your program differs from the ${DEGREE_CREDITS[degreeLevel]}-SH default.`
                }
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
