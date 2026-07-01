import { useState } from 'react';
import { MapPin, CaretUp, Plus } from '@phosphor-icons/react';
import { useTheme } from '@/app/features/theme/ThemeContext';
import type { DutyStation, Promotion } from '../../../types';
import {
  LABEL_W, GUTTER_W, years,
  dateToX, fmtDate,
  ttDutyStation, ttPromotion,
  type TooltipState,
} from '../timelineUtils';
import { SectionLabel, GridLines } from '../TimelineAtoms';
import { getRankInsigniaPath } from '@/app/components/ui/RankInsignia';

interface Props {
  dutyStations: DutyStation[];
  promotions: Promotion[];
  yw: number;
  today: Date;
  showTT: (e: React.MouseEvent<HTMLElement>, content: Omit<TooltipState, 'x'|'y'>) => void;
  moveTT: (e: React.MouseEvent<HTMLElement>) => void;
  hideTT: () => void;
  onAddDutyStation?: () => void;
  onAddPromotion?: () => void;
  onDeleteDutyStation?: (id: string) => void;
  onDeletePromotion?: (id: string) => void;
  onEditDutyStation?: (ds: DutyStation) => void;
  onEditPromotion?: (p: Promotion) => void;
}

export function ServiceSection({
  dutyStations, promotions, yw, today,
  showTT, moveTT, hideTT,
  onAddDutyStation, onAddPromotion,
  onDeleteDutyStation, onDeletePromotion,
  onEditDutyStation, onEditPromotion,
}: Props) {
  const totalW = years.length * yw;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDesert = theme === 'desert';

  return (
    <>
      {/* Duty Stations */}
      <div className="flex border-b border-white/10" style={{ minHeight: 60 }}>
        <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} lower="STATIONS" onAdd={onAddDutyStation} />
        <div className="relative flex-1" style={{ width: totalW, minHeight: 60 }}>
          <GridLines yw={yw} />
          {dutyStations.map(ds => {
            const x = dateToX(ds.startDate, yw);
            const w = dateToX(ds.endDate, yw) - x;
            const isHovered = hoveredId === ds.id;
            return (
              <div key={ds.id} className="absolute top-2 overflow-hidden flex flex-col justify-center px-2 cursor-pointer"
                style={{ left: x + 2, width: w - 4, height: 44,
                  background: isDesert
                    ? (ds.isPotential ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.08)')
                    : (ds.isPotential ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)'),
                  border: isDesert
                    ? (ds.isPotential ? '1px dashed rgba(0,0,0,0.18)' : '1px solid rgba(0,0,0,0.25)')
                    : (ds.isPotential ? '1px dashed rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.22)') }}
                onMouseEnter={e => { setHoveredId(ds.id); showTT(e as React.MouseEvent<HTMLElement>, ttDutyStation(ds)); }}
                onMouseMove={e => moveTT(e as React.MouseEvent<HTMLElement>)}
                onMouseLeave={() => { setHoveredId(null); hideTT(); }}
                onClick={() => { hideTT(); onEditDutyStation?.(ds); }}>
                <div className="flex items-start justify-between gap-1">
                  <div className={`text-[10px] font-mono font-bold truncate flex-1 ${isDesert ? 'text-gray-300' : 'text-white/80'}`}>{ds.location}</div>
                  {isHovered && onDeleteDutyStation && (
                    <button onClick={e => { e.stopPropagation(); hideTT(); onDeleteDutyStation(ds.id); }}
                      title="REMOVE" className="flex-none w-4 h-4 border border-red-600/60 flex items-center justify-center text-red-400 hover:text-red-300 hover:border-red-500 transition-colors flex-shrink-0">
                      <span className="text-[14px] leading-none translate-y-px">×</span>
                    </button>
                  )}
                </div>
                {ds.unit && !ds.isPotential && <div className={`text-[8px] font-mono truncate ${isDesert ? 'text-gray-400' : 'text-white/35'}`}>{ds.unit}</div>}
                <div className={`text-[8px] font-mono truncate ${isDesert ? 'text-gray-400' : 'text-white/30'}`}>{fmtDate(ds.startDate)} – {fmtDate(ds.endDate)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promotions */}
      <div className="flex border-b border-white/10" style={{ minHeight: 68 }}>
        <div className="flex-none sticky z-[20] border-r border-white/10 flex items-center gap-2 px-2.5"
          style={{ left: GUTTER_W, width: LABEL_W - GUTTER_W, background: 'var(--usmc-bg-base)' }}>
          <span className="text-white/30 flex-none"><CaretUp className="w-3.5 h-3.5" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono font-bold text-white/70 tracking-wider leading-tight">PROMOTIONS</div>
          </div>
          {onAddPromotion && (
            <button onClick={onAddPromotion} title="Add projected promotion"
              className="flex-none w-5 h-5 border border-white/20 flex items-center justify-center text-white/35 hover:text-red-400 hover:border-red-600/50 transition-colors">
              <Plus weight="bold" className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="relative flex-1" style={{ width: totalW, minHeight: 88 }}>
          <GridLines yw={yw} />
          <div className="absolute" style={{ left: 0, right: 0, top: 36, height: 1, background: 'var(--usmc-border-subtle)' }} />
          {promotions.map(p => {
            const x = dateToX(p.date, yw);
            const past = !p.isProjected && p.date <= today;
            const isCurrent = p.id === 'profile-current';
            const isHovered = hoveredId === p.id;
            const canDelete = !isCurrent && !!onDeletePromotion;
            return (
              <div key={p.id} className={`absolute flex flex-col items-center group ${!isCurrent ? 'cursor-pointer' : ''}`}
                style={{ left: x - 24, top: 2 }}
                onMouseEnter={e => { setHoveredId(p.id); showTT(e as React.MouseEvent<HTMLElement>, ttPromotion(p)); }}
                onMouseMove={e => moveTT(e as React.MouseEvent<HTMLElement>)}
                onMouseLeave={() => { setHoveredId(null); hideTT(); }}
                onClick={() => { if (!isCurrent) { hideTT(); onEditPromotion?.(p); } }}>
                <div className="relative flex flex-col items-center gap-0.5">
                  {(() => {
                    const path = getRankInsigniaPath(p.payGrade, p.rankAbbr);
                    return path ? (
                      <img src={path} alt={p.rankAbbr} className="w-7 h-7 object-contain" draggable={false}
                        style={{ opacity: p.isProjected ? 0.35 : past ? 0.85 : 0.55 }} />
                    ) : null;
                  })()}
                  <div className={`px-1.5 py-0.5 text-[9px] font-mono font-black tracking-wider border cursor-default ${
                    isCurrent
                      ? isDesert ? 'border-red-600/60 text-red-700 bg-red-100/60' : 'border-red-500/60 text-red-300/90 bg-red-950/40'
                      : isDesert
                        ? past
                          ? 'border-gray-500 text-gray-300 bg-black/10'
                          : 'border-gray-400 text-gray-400 bg-transparent'
                        : past
                          ? 'border-white/40 text-white/90 bg-white/10'
                          : 'border-white/15 text-white/35 bg-transparent'
                  }`}>
                    {p.rankAbbr}
                  </div>
                  {canDelete && isHovered && (
                    <button onClick={e => { e.stopPropagation(); hideTT(); onDeletePromotion!(p.id); }}
                      title="REMOVE" className="absolute -top-1 -right-1 w-4 h-4 z-10 flex items-center justify-center border border-red-600/60 bg-black text-red-400 hover:text-red-300 hover:border-red-500 transition-colors">
                      <span className="text-[14px] leading-none translate-y-px">×</span>
                    </button>
                  )}
                </div>
                <div className="w-px" style={{ height: 8, background: isCurrent ? 'rgba(239,68,68,0.35)' : past ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)' }} />
                <div className={`text-[8px] font-mono whitespace-nowrap ${isDesert ? 'text-gray-400' : 'text-white/30'}`}>{fmtDate(p.date)}</div>
                {p.isProjected && <div className={`text-[7px] font-mono whitespace-nowrap ${isDesert ? 'text-gray-400' : 'text-white/20'}`}>(PROJ)</div>}
                {isCurrent && <div className={`text-[7px] font-mono whitespace-nowrap ${isDesert ? 'text-red-700/70' : 'text-red-500/60'}`}>CURRENT</div>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
