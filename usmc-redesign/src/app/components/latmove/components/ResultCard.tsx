import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clearanceRequirementAbbreviation, colorVisionAbbreviation } from '../types';
import type { ResultItem } from '../types';

interface Props {
  result: ResultItem;
  resultNumber: number;
  isActive: boolean;
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

export function ResultCard({ result, resultNumber, isActive, onToggle }: Props) {
  const formattedNumber = String(resultNumber).padStart(2, '0');

  return (
    <motion.div
      layout
      animate={isActive ? {
        borderColor: [
          'rgba(239,68,68,0.25)',
          'rgba(239,68,68,0.85)',
          'rgba(239,68,68,0.35)',
          'rgba(239,68,68,0.7)',
          'rgba(239,68,68,0.5)',
        ],
        backgroundColor: [
          'rgba(69,10,10,0.04)',
          'rgba(69,10,10,0.18)',
          'rgba(69,10,10,0.08)',
          'rgba(69,10,10,0.14)',
          'rgba(69,10,10,0.1)',
        ],
      } : {
        borderColor: 'rgba(229,231,235,0.16)',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      whileHover={isActive ? {
        borderColor: 'rgba(248,113,113,0.75)',
        backgroundColor: 'rgba(69,10,10,0.16)',
        boxShadow: 'inset 0 0 0 1px rgba(248,113,113,0.16), 0 0 24px rgba(127,29,29,0.18)',
      } : {
        borderColor: 'rgba(229,231,235,0.34)',
        backgroundColor: 'rgba(69,10,10,0.16)',
        boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.12), 0 0 22px rgba(127,29,29,0.16)',
      }}
      transition={{
        layout: { duration: 0.28 },
        borderColor: { duration: 0.08 },
        backgroundColor: { duration: 0.08 },
        boxShadow: { duration: 0.08 },
      }}
      className={`relative flex h-full flex-col overflow-hidden border bg-black/40 transition-[background-color,border-color,box-shadow] ${
        isActive
          ? 'border-red-500/50 bg-red-950/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.08)]'
          : 'border-white/14'
      }`}
    >
      <div
        className={`pointer-events-none absolute bottom-3 right-4 font-mono text-5xl font-black leading-none tracking-[-0.08em] transition-colors ${
          isActive ? 'text-red-500/[0.07]' : 'text-gray-500/[0.045]'
        }`}
        aria-hidden="true"
      >
        {formattedNumber}
      </div>
      {isActive && (
        <motion.div
          key={`activation-${result.id}`}
          className="pointer-events-none absolute inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.55, 0.08, 0.42, 0, 0.28, 0] }}
          transition={{ duration: 0.72, times: [0, 0.08, 0.2, 0.34, 0.48, 0.62, 1] }}
          style={{
            background:
              'linear-gradient(90deg, rgba(239,68,68,0.22), transparent 28%, rgba(239,68,68,0.12) 52%, transparent 78%), repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(239,68,68,0.18) 9px, transparent 10px)',
            boxShadow: 'inset 0 0 0 1px rgba(248,113,113,0.85), inset 0 0 28px rgba(239,68,68,0.2)',
          }}
        />
      )}
      <button
        className="flex min-h-[8.75rem] w-full flex-1 flex-col justify-between p-5 text-left"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 font-mono text-[11px] font-bold tracking-[0.18em] text-gray-700">
              {formattedNumber}
            </div>
            <div className="mb-1 text-base font-black text-gray-300 font-mono tracking-wide">MOS {result.id}</div>
            <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-red-400/75">{result.field}</div>
            <div className="text-base text-gray-100 leading-tight">{result.title}</div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`text-2xl font-black leading-none ${matchColor(result.match)}`}>
              {result.match}%
            </div>
            <div className="text-[11px] tracking-wide text-gray-600">QUALIFIED</div>
            {result.skillMatch != null && (
              <div className="mt-1 flex flex-col items-end">
                <div className={`text-base font-black leading-none ${skillMatchColor(result.skillMatch.pct)}`}>
                  {result.skillMatch.pct}%
                </div>
                <div className="text-[10px] tracking-wide text-gray-600">SKILL XFR</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className={`mb-1 text-[11px] font-bold tracking-[0.2em] ${
              isActive ? 'text-red-400/80' : 'text-gray-600'
            }`}>REQUIREMENTS</div>
            <div className="text-xs font-mono leading-relaxed text-gray-500">{result.reqStr}</div>
            <div className="text-[11px] font-mono leading-relaxed text-gray-600">
              CLR: {clearanceRequirementAbbreviation(result)}
              <span className="mx-2 text-white/18">|</span>
              COLOR: {colorVisionAbbreviation(result.requiresNormalColorVision)}
            </div>
          </div>
          <div className={`flex items-center justify-center ${isActive ? 'text-red-400' : 'text-gray-600'}`}>
            {isActive
              ? <ChevronUp className="w-4 h-4 text-red-500" />
              : <ChevronDown className="w-4 h-4" />
            }
          </div>
        </div>
      </button>
    </motion.div>
  );
}
