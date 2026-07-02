import { useState } from 'react';
import { BookOpen } from '@phosphor-icons/react';
import type { EducationEvent } from '../../../types';
import {
  dateToX, ttEducation, years,
  type TooltipState,
} from '../timelineUtils';
import { SectionLabel, GridLines } from '../TimelineAtoms';
import { useTheme } from '@/app/features/theme/ThemeContext';

interface Props {
  education: EducationEvent[];
  yw: number;
  showTT: (e: React.MouseEvent<HTMLElement>, content: Omit<TooltipState, 'x'|'y'>) => void;
  moveTT: (e: React.MouseEvent<HTMLElement>) => void;
  hideTT: () => void;
  onAddEducation?: () => void;
  onDeleteEducation?: (id: string) => void;
  onEditEducation?: (e: EducationEvent) => void;
}

export function EducationSection({ education, yw, showTT, moveTT, hideTT, onAddEducation, onDeleteEducation, onEditEducation }: Props) {
  const totalW = years.length * yw;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDesert = theme === 'desert';

  return (
    <div className="flex border-b border-white/10" style={{ minHeight: 96 }}>
      <SectionLabel icon={<BookOpen className="w-3.5 h-3.5" />} lower="EDUCATION" onAdd={onAddEducation} />
      <div className="relative flex-1" style={{ width: totalW, minHeight: 96 }}>
        <GridLines yw={yw} />
        {education.map(e => {
          const x = dateToX(e.startDate, yw);
          const w = dateToX(e.endDate, yw) - x;
          const isHovered = hoveredId === e.id;
          return (
            <div key={e.id} className="absolute top-2 flex flex-col justify-center px-2 overflow-hidden cursor-pointer"
              style={{ left: x + 2, width: w - 4, height: 36,
                background: isDesert ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.25)',
                border: isDesert ? '1px solid rgba(29,78,216,0.38)' : '1px solid rgba(59,130,246,0.40)' }}
              onMouseEnter={e2 => { setHoveredId(e.id); showTT(e2 as React.MouseEvent<HTMLElement>, ttEducation(e)); }}
              onMouseMove={e2 => moveTT(e2 as React.MouseEvent<HTMLElement>)}
              onMouseLeave={() => { setHoveredId(null); hideTT(); }}
              onClick={() => { hideTT(); onEditEducation?.(e); }}>
              <div className="flex items-center justify-between gap-1">
                <div className={`text-[10px] font-mono font-bold truncate flex-1 ${isDesert ? 'text-blue-800' : 'text-blue-300/90'}`}>{e.label}</div>
                {isHovered && onDeleteEducation && (
                  <button onClick={ev => { ev.stopPropagation(); hideTT(); onDeleteEducation(e.id); }}
                    title="REMOVE" className="flex-none w-4 h-4 border border-red-600/60 flex items-center justify-center text-red-400 hover:text-red-300 hover:border-red-500 transition-colors">
                    <span className="text-[14px] leading-none translate-y-px">×</span>
                  </button>
                )}
              </div>
              {e.isProjected && <div className={`text-[8px] font-mono ${isDesert ? 'text-blue-700/70' : 'text-blue-400/50'}`}>PROJECTED</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
