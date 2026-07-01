import { useState } from 'react';
import { Flag } from '@phosphor-icons/react';
import { renderCustomIcon } from '../../IconColorPicker';
import type { CareerMilestone } from '../../../types';
import {
  years,
  dateToX, fmtDate,
  ttMilestone, MILESTONE_COLOR, MILESTONE_COLOR_DESERT,
  type TooltipState,
} from '../timelineUtils';
import { SectionLabel, GridLines, getMilestoneIcon } from '../TimelineAtoms';
import { useTheme } from '@/app/features/theme/ThemeContext';

interface Props {
  milestones: CareerMilestone[];
  yw: number;
  showTT: (e: React.MouseEvent<HTMLElement>, content: Omit<TooltipState, 'x'|'y'>) => void;
  moveTT: (e: React.MouseEvent<HTMLElement>) => void;
  hideTT: () => void;
  onAddMilestone?: () => void;
  onDeleteMilestone?: (id: string) => void;
  onEditMilestone?: (m: CareerMilestone) => void;
}

export function CareerSection({ milestones, yw, showTT, moveTT, hideTT, onAddMilestone, onDeleteMilestone, onEditMilestone }: Props) {
  const totalW = years.length * yw;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const MC = isDesert ? MILESTONE_COLOR_DESERT : MILESTONE_COLOR;

  return (
    <div className="flex border-b border-white/10" style={{ minHeight: 90 }}>
      <SectionLabel icon={<Flag className="w-3.5 h-3.5" />} lower="MILESTONES" onAdd={onAddMilestone} />
      <div className="relative flex-1" style={{ width: totalW, minHeight: 90 }}>
        <GridLines yw={yw} />
        <div className="absolute" style={{ left: 0, right: 0, top: 32, height: 1, background: 'var(--usmc-border-subtle)' }} />
        <div className="absolute" style={{ left: 0, right: 0, top: 76, height: 1, background: 'var(--usmc-border-subtle)' }} />

        {milestones.map(m => {
          const x = dateToX(m.date, yw);
          const top = m.track === 0 ? 4 : 50;
          const color = m.type === 'custom' ? (m.customColor ?? '#a78bfa') : MILESTONE_COLOR[m.type];
          const iconCls = m.iconSize === 'sm' ? 'w-3.5 h-3.5' : m.iconSize === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
          const iconEl = m.type === 'custom'
            ? renderCustomIcon(m.customIcon ?? 'Star', iconCls)
            : getMilestoneIcon(m.type, iconCls);
          const isHovered = hoveredId === m.id;
          return (
            <div key={m.id} className="absolute flex flex-col items-center" style={{ left: x - 14, top }}
              onMouseEnter={e => { setHoveredId(m.id); showTT(e as React.MouseEvent<HTMLElement>, ttMilestone(m)); }}
              onMouseMove={e => moveTT(e as React.MouseEvent<HTMLElement>)}
              onMouseLeave={() => { setHoveredId(null); hideTT(); }}
              onClick={() => { hideTT(); onEditMilestone?.(m); }}>
              <div className="relative">
                <div className="flex items-center justify-center cursor-default" style={{ color }}>
                  {iconEl}
                </div>
                {isHovered && onDeleteMilestone && (
                  <button onClick={e => { e.stopPropagation(); hideTT(); onDeleteMilestone(m.id); }}
                    title="REMOVE" className="absolute -top-1 -right-1 w-4 h-4 z-10 flex items-center justify-center border border-red-600/60 bg-black text-red-400 hover:text-red-300 hover:border-red-500 transition-colors">
                    <span className="text-[14px] leading-none translate-y-px">×</span>
                  </button>
                )}
              </div>
              <div className={`text-[8px] font-mono text-center mt-0.5 whitespace-nowrap leading-tight ${isDesert ? 'text-gray-300' : 'text-white/55'}`}>{m.shortLabel}</div>
              <div className={`text-[7px] font-mono text-center whitespace-nowrap ${isDesert ? 'text-gray-400' : 'text-white/25'}`}>{fmtDate(m.date)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

