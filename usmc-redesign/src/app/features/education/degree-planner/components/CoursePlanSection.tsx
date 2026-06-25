import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import type { Term, Course, FundingSource, SchoolDetails } from '../types';
import { fiscalYear, courseTACost } from '../utils';
import { TA_ANNUAL_MAX } from '../constants';
import { SectionHeader } from './SectionHeader';
import { TABudgetTracker } from './TABudgetTracker';
import { TermRow } from './TermRow';

interface CoursePlanSectionProps {
  terms: Term[];
  setTerms: React.Dispatch<React.SetStateAction<Term[]>>;
  expandedTerms: Set<string>;
  setExpandedTerms: React.Dispatch<React.SetStateAction<Set<string>>>;
  taByFY: Map<number, number>;
  totalUncovered: number;
  totalTACost: number;
  uncoveredCardState: 'hidden' | 'gap' | 'settled';
  isDesert: boolean;
  plannedCredits: number;
  schoolDetails: SchoolDetails | null;
  school: string;
  showBulkCostEditor: boolean;
  setShowBulkCostEditor: React.Dispatch<React.SetStateAction<boolean>>;
  bulkCostRaw: string;
  setBulkCostRaw: React.Dispatch<React.SetStateAction<string>>;
  applyBulkCost: () => void;
  addTerm: () => void;
  toggleTerm: (termId: string) => void;
  removeTerm: (termId: string) => void;
  updateCourse: (termId: string, courseId: string, updates: Partial<Course>) => void;
  removeCourse: (termId: string, courseId: string) => void;
  addCourse: (termId: string) => void;
}

export function CoursePlanSection({
  terms,
  setTerms,
  expandedTerms,
  taByFY,
  totalUncovered,
  totalTACost,
  uncoveredCardState,
  isDesert,
  plannedCredits,
  schoolDetails,
  school,
  showBulkCostEditor,
  setShowBulkCostEditor,
  bulkCostRaw,
  setBulkCostRaw,
  applyBulkCost,
  addTerm,
  toggleTerm,
  removeTerm,
  updateCourse,
  removeCourse,
  addCourse,
}: CoursePlanSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
      className="border border-white/12 bg-black"
    >
      <SectionHeader num="3" title="COURSE PLAN" aside={plannedCredits > 0 ? `${plannedCredits} SH PLANNED` : undefined} />

      <TABudgetTracker
        taByFY={taByFY}
        totalUncovered={totalUncovered}
        totalTACost={totalTACost}
        uncoveredCardState={uncoveredCardState}
        isDesert={isDesert}
        showBulkCostEditor={showBulkCostEditor}
        setShowBulkCostEditor={setShowBulkCostEditor}
        bulkCostRaw={bulkCostRaw}
        setBulkCostRaw={setBulkCostRaw}
        applyBulkCost={applyBulkCost}
      />

      {/* Term list */}
      <div className="divide-y divide-white/[0.06]">
        <AnimatePresence initial={false}>
          {terms.map((term, termIdx) => {
            const isOpen = expandedTerms.has(term.id);
            const termCredits = term.courses.reduce((s, c) => s + c.credits, 0);
            const termTATotal = term.courses.reduce((s, c) => s + courseTACost(c), 0);
            const fy = fiscalYear(term.season, term.year);
            const fyOver = (taByFY.get(fy) ?? 0) > TA_ANNUAL_MAX;
            const termFundingTotals = term.courses.reduce((acc, c) => {
              acc[c.funding] = (acc[c.funding] ?? 0) + c.credits * c.costPerCredit;
              return acc;
            }, {} as Partial<Record<FundingSource, number>>);
            const termTAGap = (termFundingTotals['ta'] ?? 0) - termTATotal;

            return (
              <TermRow
                key={term.id}
                term={term}
                termIdx={termIdx}
                isOpen={isOpen}
                isDesert={isDesert}
                fyOver={fyOver}
                termCredits={termCredits}
                termTATotal={termTATotal}
                termFundingTotals={termFundingTotals}
                termTAGap={termTAGap}
                schoolDetails={schoolDetails}
                school={school}
                toggleTerm={toggleTerm}
                removeTerm={removeTerm}
                setTerms={setTerms}
                updateCourse={updateCourse}
                removeCourse={removeCourse}
                addCourse={addCourse}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/[0.06] px-6 py-4">
        <button
          onClick={addTerm}
          className="flex cursor-pointer items-center gap-2 border border-white/16 bg-white/[0.03] px-5 py-3 text-[12px] font-bold tracking-widest text-gray-400 transition-colors hover:border-white/30 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          ADD TERM
        </button>
      </div>
    </motion.div>
  );
}
