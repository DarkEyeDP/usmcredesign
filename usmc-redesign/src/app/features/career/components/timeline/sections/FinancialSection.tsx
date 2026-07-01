import { useState } from 'react';
import { CurrencyDollar } from '@phosphor-icons/react';
import { useTheme } from '@/app/features/theme/ThemeContext';
import type { FinancialGoal } from '../../../types';
import {
  years, dateToX, fmtDate, ttGoal,
  type TooltipState,
} from '../timelineUtils';
import { SectionLabel, GridLines, GoalIcon } from '../TimelineAtoms';

interface Props {
  financialGoals: FinancialGoal[];
  yw: number;
  showTT: (e: React.MouseEvent<HTMLElement>, content: Omit<TooltipState, 'x'|'y'>) => void;
  moveTT: (e: React.MouseEvent<HTMLElement>) => void;
  hideTT: () => void;
  onAddFinancialGoal?: () => void;
  onDeleteFinancialGoal?: (id: string) => void;
  onEditFinancialGoal?: (g: FinancialGoal) => void;
}

export function FinancialSection({ financialGoals, yw, showTT, moveTT, hideTT, onAddFinancialGoal, onDeleteFinancialGoal, onEditFinancialGoal }: Props) {
  const totalW = years.length * yw;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDesert = theme === 'desert';

  return (
    <div className="flex border-b border-white/10" style={{ minHeight: 96 }}>
      <SectionLabel icon={<CurrencyDollar className="w-3.5 h-3.5" />} lower="GOALS" onAdd={onAddFinancialGoal} />
      <div className="relative flex-1" style={{ width: totalW, minHeight: 96 }}>
        <GridLines yw={yw} />
        {financialGoals.map(g => {
          const x = dateToX(g.targetDate, yw);
          const isHovered = hoveredId === g.id;
          const isCustom = g.iconName === 'custom';
          const gc = isCustom ? (g.customColor ?? '#a78bfa') : null;
          return (
            <div key={g.id} className="absolute top-2 flex flex-col items-start" style={{ left: x - 4, width: 98 }}>
              <div className="w-0.5 h-4 mb-1 ml-4"
                style={{ background: isCustom ? `${gc}AA` : isDesert ? 'rgba(22,101,52,0.65)' : 'rgba(74,222,128,0.65)' }} />
              <div className="p-1.5 w-full cursor-pointer"
                style={isCustom
                  ? { background: `${gc}12`, border: `1px solid ${gc}40` }
                  : isDesert
                    ? { background: 'rgba(5,150,60,0.10)', border: '1px solid rgba(22,101,52,0.35)' }
                    : { background: 'rgba(5,46,22,0.65)', border: '1px solid rgba(74,222,128,0.30)' }}
                onMouseEnter={e => { setHoveredId(g.id); showTT(e as React.MouseEvent<HTMLElement>, ttGoal(g)); }}
                onMouseMove={e => moveTT(e as React.MouseEvent<HTMLElement>)}
                onMouseLeave={() => { setHoveredId(null); hideTT(); }}
                onClick={() => { hideTT(); onEditFinancialGoal?.(g); }}>
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span style={{ color: isCustom ? gc! : isDesert ? '#15803d' : 'rgba(74,222,128,0.7)' }}>
                    <GoalIcon name={g.iconName} customIconName={g.customIconName} />
                  </span>
                  {isHovered && onDeleteFinancialGoal && (
                    <button onClick={e => { e.stopPropagation(); hideTT(); onDeleteFinancialGoal(g.id); }}
                      title="REMOVE" className="w-4 h-4 border border-red-600/60 flex items-center justify-center text-red-400 hover:text-red-300 hover:border-red-500 transition-colors flex-none">
                      <span className="text-[14px] leading-none translate-y-px">×</span>
                    </button>
                  )}
                </div>
                <div className="text-[8px] font-mono font-bold leading-tight"
                  style={{ color: isCustom ? `${gc}CC` : isDesert ? '#14532d' : 'rgba(134,239,172,0.8)' }}>{g.label}</div>
                {g.amount > 0 && <div className="text-[8px] font-mono"
                  style={{ color: isCustom ? `${gc}99` : isDesert ? '#166534' : 'rgba(74,222,128,0.6)' }}>
                  GOAL: ${g.amount.toLocaleString()}</div>}
                <div className="text-[7px] font-mono"
                  style={{ color: isCustom ? `${gc}66` : isDesert ? '#15803d' : 'rgba(74,222,128,0.4)' }}>
                  {fmtDate(g.targetDate)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
