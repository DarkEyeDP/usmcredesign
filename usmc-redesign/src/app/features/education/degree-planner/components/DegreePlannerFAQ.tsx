import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/features/theme/ThemeContext';

const FAQS = [
  {
    q: 'How much does USMC Tuition Assistance pay per credit?',
    a: 'USMC Tuition Assistance (TA) covers up to $250 per semester hour and up to $4,500 per fiscal year (October 1 – September 30). Any tuition above these caps must be covered by other sources — such as the Post-9/11 GI Bill, FAFSA, or scholarships. This planner tracks both limits automatically as you build your course plan.',
  },
  {
    q: 'What are JST credits and do colleges accept them?',
    a: 'The Joint Services Transcript (JST) translates your military training and experience into college-level credit recommendations. Most accredited universities accept JST credits toward general education requirements or electives — reducing the number of paid courses you need to take. Enter your JST credits in the Credits Already Earned section to see exactly how they reduce your remaining course load.',
  },
  {
    q: 'How many credits do I need to earn a degree?',
    a: "Credit requirements vary by degree level: an Associate degree typically requires 60 semester hours, a Bachelor's degree requires 120 semester hours, and a Master's degree typically requires 30–36 semester hours beyond a bachelor's. The Degree Planner adjusts your target automatically when you select your degree level and accounts for all credits you've already earned.",
  },
  {
    q: 'Can I use Tuition Assistance and the GI Bill together?',
    a: "TA and the Post-9/11 GI Bill cannot pay for the same course costs simultaneously, but they complement each other. If your tuition exceeds the TA cap ($250/SH or $4,500/year), GI Bill benefits may cover the remaining gap. Most Marines use TA throughout active service and transition to the GI Bill for further education after EAS. Top-up provisions may also be available — check with your education services officer (ESO).",
  },
  {
    q: 'Does Tuition Assistance cover online and distance learning programs?',
    a: 'Yes. USMC Tuition Assistance covers tuition at accredited institutions regardless of delivery method, including fully online and distance learning programs. This makes TA ideal for Marines dealing with deployments, PCS moves, or irregular schedules. The school and program must be accredited and approved before classes begin.',
  },
];

export function DegreePlannerFAQ() {
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="border border-white/12 bg-black"
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-6 py-4">
        <HelpCircle className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-bold tracking-widest text-gray-400">FREQUENTLY ASKED QUESTIONS</span>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {FAQS.map((item, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="flex w-full cursor-pointer items-start justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
            >
              <span className={`text-[13px] font-bold leading-snug ${isDesert ? 'text-gray-700' : 'text-gray-300'}`}>
                {item.q}
              </span>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600 transition-transform duration-200 ${openIdx === i ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className={`px-6 pb-5 text-[13px] leading-relaxed ${isDesert ? 'text-gray-600' : 'text-gray-400'}`}>
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
