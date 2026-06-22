import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clearanceRequirementAbbreviation, colorVisionAbbreviation } from '../types';
import type { ResultItem } from '../types';
import { useTheme } from '@/app/features/theme/ThemeContext';

const bonusFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface Props {
  result: ResultItem;
  resultNumber: number;
  isActive: boolean;
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

function compactRequirementLabel(reqStr: string) {
  return reqStr.replace(/\b([A-Z]{2})\s+(\d+)\b/g, '$1 - $2').replace(/\+/g, ' + ');
}

export function ResultCard({ result, resultNumber, isActive, onToggle }: Props) {
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const formattedNumber = String(resultNumber).padStart(2, '0');
  const bonusRangeLabel = result.lateralMoveBonusRange
    ? `${bonusFormatter.format(result.lateralMoveBonusRange.min)}-${bonusFormatter.format(result.lateralMoveBonusRange.max)}`
    : null;
  const compactReqLabel = compactRequirementLabel(result.reqStr);

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
        borderColor: isDesert ? 'rgba(0,0,0,0.22)' : 'rgba(229,231,235,0.16)',
        backgroundColor: isDesert ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.4)',
      }}
      whileHover={isActive ? {
        borderColor: 'rgba(248,113,113,0.75)',
        backgroundColor: 'rgba(69,10,10,0.16)',
        boxShadow: 'inset 0 0 0 1px rgba(248,113,113,0.16), 0 0 24px rgba(127,29,29,0.18)',
      } : {
        borderColor: isDesert ? 'rgba(0,0,0,0.40)' : 'rgba(229,231,235,0.34)',
        backgroundColor: isDesert ? 'rgba(0,0,0,0.24)' : 'rgba(69,10,10,0.16)',
        boxShadow: isDesert
          ? 'inset 0 0 0 1px rgba(0,0,0,0.14), 0 0 18px rgba(0,0,0,0.08)'
          : 'inset 0 0 0 1px rgba(239,68,68,0.12), 0 0 22px rgba(127,29,29,0.16)',
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
        className="flex min-h-[7.25rem] w-full flex-1 flex-col justify-between p-5 text-left"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1.5 font-mono text-[11px] font-bold tracking-[0.18em] text-gray-700">
              {formattedNumber}
            </div>
            <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-mono text-[17px] font-black tracking-[0.02em] text-gray-200">MOS {result.id}</span>
              <span className="text-white/18">|</span>
              <span className="text-[17px] leading-tight text-white">{result.title}</span>
            </div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.22em] text-red-400/70">{result.field}</span>
              {result.isHighDemandLatMove && (
                <span className={`border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.18em] ${isDesert ? 'border-amber-600/50 bg-amber-100/60 text-amber-800' : 'border-amber-500/35 bg-amber-950/20 text-amber-300/90'}`}>
                  HIGH DEMAND
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`text-[32px] font-black leading-none tracking-[-0.03em] ${matchColor(result.match, isDesert)}`}>
              {result.match}%
            </div>
            <div className="text-[10px] tracking-[0.16em] text-gray-600">QUALIFIED</div>
            {result.skillMatch != null && (
              <div className="mt-1 flex flex-col items-end">
                <div className={`text-[22px] font-black leading-none tracking-[-0.02em] ${skillMatchColor(result.skillMatch.pct, isDesert)}`}>
                  {result.skillMatch.pct}%
                </div>
                <div className="text-[10px] tracking-[0.16em] text-gray-600">SKILL XFR</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            {bonusRangeLabel && (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <div className={`text-[11px] font-bold tracking-[0.2em] ${
                  isActive ? 'text-red-300/90' : 'text-red-400/75'
                }`}>
                  FY27 LM BONUS RANGE
                </div>
                <div className="text-[15px] font-black text-white">{bonusRangeLabel}</div>
                <div className="text-[11px] font-mono leading-relaxed text-gray-600">
                  Zones {result.lateralMoveBonusRange?.zones.join(', ')}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <div className={`text-[11px] font-bold tracking-[0.2em] ${
                isActive ? 'text-red-400/80' : 'text-gray-600'
              }`}>REQUIREMENTS:</div>
              <div className="text-[13px] font-mono leading-relaxed text-gray-400">{compactReqLabel}</div>
              <div className="text-[12px] font-mono leading-relaxed text-gray-600">
                CLR: {clearanceRequirementAbbreviation(result)}
                <span className="mx-2 text-white/18">|</span>
                COLOR: {colorVisionAbbreviation(result.requiresNormalColorVision)}
              </div>
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
