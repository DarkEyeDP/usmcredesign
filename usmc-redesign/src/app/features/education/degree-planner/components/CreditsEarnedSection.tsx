import { motion } from 'motion/react';
import { Info } from 'lucide-react';
import { NumericInput } from './NumericInput';
import { SectionHeader } from './SectionHeader';

interface CreditsEarnedSectionProps {
  jstCredits: number;
  setJstCredits: React.Dispatch<React.SetStateAction<number>>;
  transferCredits: number;
  setTransferCredits: React.Dispatch<React.SetStateAction<number>>;
  clepCredits: number;
  setClepCredits: React.Dispatch<React.SetStateAction<number>>;
  isDesert: boolean;
  earnedCredits: number;
  requiredCredits: number;
  creditsToGo: number;
}

export function CreditsEarnedSection({
  jstCredits,
  setJstCredits,
  transferCredits,
  setTransferCredits,
  clepCredits,
  setClepCredits,
  isDesert,
  earnedCredits,
  requiredCredits,
  creditsToGo,
}: CreditsEarnedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="border border-white/12 bg-black"
    >
      <SectionHeader num="2" title="CREDITS ALREADY EARNED" />
      <div className="px-6 py-6">
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: 'JST CREDITS', value: jstCredits, setter: setJstCredits, hint: 'ACE-recommended credits from your Joint Services Transcript' },
            { label: 'TRANSFER CREDITS', value: transferCredits, setter: setTransferCredits, hint: 'Credits from prior college coursework accepted by your school' },
            { label: 'CLEP / DSST CREDITS', value: clepCredits, setter: setClepCredits, hint: 'Credits earned by passing standardized subject exams' },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.3 }}
            >
              <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-gray-500">{f.label}</div>
              <NumericInput
                value={f.value}
                onChange={n => f.setter(n)}
                className="w-full border border-white/16 bg-black px-4 py-3 font-mono text-lg font-bold text-white focus:border-red-500/50 focus:outline-none"
                min={0}
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600">{f.hint}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="mb-6 flex items-start gap-3 border border-white/10 bg-white/[0.04] px-4 py-3"
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600" />
          <p className="text-[12px] leading-relaxed text-gray-500">
            Don't have your JST? Request it at{' '}
            <a href="https://jst.doded.mil/jst/" target="_blank" rel="noopener noreferrer" className="text-red-500 underline underline-offset-2 transition-colors hover:text-red-400">
              jst.doded.mil
            </a>
            . Look for the <strong className="text-gray-400">ACE Credit Recommendation</strong> column — those are the hours typically applicable to a degree program.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-white/10 bg-white/[0.04] px-4 py-4">
            <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">TOTAL EARNED</div>
            <div className="text-2xl font-black text-white">
              {earnedCredits} <span className="text-base font-bold text-gray-500">SH</span>
            </div>
          </div>
          <div className={`border px-4 py-4 ${
            requiredCredits > 0 && creditsToGo === 0
              ? isDesert ? 'border-green-700/50 bg-green-50/50' : 'border-green-500/20 bg-green-950/15'
              : 'border-white/10 bg-white/[0.04]'
          }`}>
            <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">CREDITS REMAINING</div>
            <div className={`text-2xl font-black ${
              requiredCredits > 0
                ? creditsToGo === 0 ? (isDesert ? 'text-green-700' : 'text-green-400') : 'text-white'
                : 'text-gray-600'
            }`}>
              {requiredCredits > 0 ? creditsToGo : '—'}
              {requiredCredits > 0 && <span className="ml-1 text-base font-bold text-gray-500">SH</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
