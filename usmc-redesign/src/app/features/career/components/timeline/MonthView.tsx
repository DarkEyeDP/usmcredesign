import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import {
  Flag, MapPin, CaretUp, BookOpen,
  Heart, Users, GraduationCap, CurrencyDollar,
  CaretLeft, CaretRight, Rows,
} from '@phosphor-icons/react';
import { renderCustomIcon } from '../IconColorPicker';
import type { TimelineData } from '../../types';
import {
  LABEL_W, LABEL_W_COLLAPSED, GUTTER_W, MONTH_W, MONTHS, TODAY, years,
  getAgeAtMonth, getTISLabel, fmtDate,
  ttDutyStation, ttPromotion, ttEducation, ttMilestone, ttGoal, ttChild, ttSchool,
  SCHOOL_STYLE, SCHOOL_STYLE_DESERT, GRADE_LABELS, MILESTONE_COLOR, MILESTONE_COLOR_DESERT,
  getVerticalScrollTarget, getVerticalScrollTop, setVerticalScrollTop,
  type TooltipState, type VerticalScrollTarget,
} from './timelineUtils';
import { TooltipCard, GoalIcon, SmallLabel, getMilestoneIcon, SidebarCollapsedCtx } from './TimelineAtoms';
import { DayView } from './DayView';
import { useTheme } from '@/app/features/theme/ThemeContext';

type PanStart = { x: number; y: number; sl: number; st: number; vst: VerticalScrollTarget };

// x-position in the full multi-year month timeline
function dateToFMX(date: Date): number {
  const months = (date.getFullYear() - years[0]) * 12 + date.getMonth();
  return Math.max(0, months * MONTH_W);
}

function SectionLabel({ icon, lower }: { icon: React.ReactNode; lower: string }) {
  const collapsed = useContext(SidebarCollapsedCtx);
  const lw = collapsed ? GUTTER_W + LABEL_W_COLLAPSED : LABEL_W;
  return (
    <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center gap-2 overflow-hidden"
      style={{ width: lw, background: 'var(--usmc-bg-base)', padding: collapsed ? '0 0 0 4px' : '0 10px', transition: 'width 200ms ease' }}>
      <span className="flex-none text-white/30">{icon}</span>
      <div className="text-[11px] font-mono font-bold text-white/70 tracking-wider leading-tight"
        style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 120ms ease' }}>{lower}</div>
    </div>
  );
}

function FullGridLines({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="absolute top-0 bottom-0 border-r border-white/[0.04]"
          style={{ left: i * MONTH_W, width: MONTH_W }} />
      ))}
    </>
  );
}

interface Props {
  year: number;
  data: TimelineData;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  presentDate?: Date;
  onPresentDateChange?: (d: Date) => void;
  onMonthSelect?: (month: { year: number; month: number }) => void;
  isFullscreen?: boolean;
}

export function MonthView({ year, data, onBack, onPrev, onNext, presentDate, onPresentDateChange, onMonthSelect, isFullscreen = false }: Props) {
  const { profile, milestones, dutyStations, promotions, education, spouse, children, financialGoals } = data;
  const realChildren = children.filter(c => !c.isPlanned);
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const MC = isDesert ? MILESTONE_COLOR_DESERT : MILESTONE_COLOR;
  const schoolStyle = isDesert ? SCHOOL_STYLE_DESERT : SCHOOL_STYLE;
  const effectiveToday = presentDate ?? TODAY;
  const realToday = new Date();
  const totalMonthCount = years.length * 12;
  const totalW = totalMonthCount * MONTH_W;
  const todayFMX = dateToFMX(effectiveToday);

  const collapsed = useContext(SidebarCollapsedCtx);
  const labelW = collapsed ? GUTTER_W + LABEL_W_COLLAPSED : LABEL_W;
  const labelWRef = useRef(labelW);
  labelWRef.current = labelW;

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
  const [isDraggingLine, setIsDraggingLine] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<PanStart | null>(null);
  const hasPanned = useRef(false);
  const onPresentDateChangeRef = useRef(onPresentDateChange);

  useEffect(() => {
    onPresentDateChangeRef.current = onPresentDateChange;
  }, [onPresentDateChange]);

  // Scroll to selected year whenever year prop changes (and on mount)
  useEffect(() => {
    const targetX = Math.max(0, (year - years[0]) * 12 * MONTH_W - 20);
    if (scrollRef.current) scrollRef.current.scrollLeft = targetX;
    if (headerRef.current) headerRef.current.scrollLeft = targetX;
  }, [year]);

  // Sync header scroll with content scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !headerRef.current) return;
    headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
  }, []);

  // Drag present-date line
  useEffect(() => {
    if (!isDraggingLine) return;
    function onMove(e: MouseEvent) {
      if (!scrollRef.current) return;
      const rect = scrollRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left + scrollRef.current.scrollLeft - labelWRef.current;
      const monthIdx = Math.max(0, Math.min(totalMonthCount - 1, Math.floor(rawX / MONTH_W)));
      const yr = years[0] + Math.floor(monthIdx / 12);
      const mo = monthIdx % 12;
      onPresentDateChangeRef.current?.(new Date(yr, mo, 1));
    }
    function onUp() { setIsDraggingLine(false); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDraggingLine, totalMonthCount]);

  // Pan
  useEffect(() => {
    if (!isPanning) return;
    function onMove(e: MouseEvent) {
      if (!panStart.current || !scrollRef.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasPanned.current = true;
      scrollRef.current.scrollLeft = panStart.current.sl - dx;
      setVerticalScrollTop(panStart.current.vst, panStart.current.st - dy);
    }
    function onUp() {
      setIsPanning(false);
      if (hasPanned.current) window.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true });
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning]);

  const showTT = useCallback((e: React.MouseEvent, content: Omit<TooltipState,'x'|'y'>) => {
    setTooltip({ x: e.clientX, y: e.clientY, ...content });
  }, []);
  const moveTT = useCallback((e: React.MouseEvent) => {
    setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
  }, []);
  const hideTT = useCallback(() => setTooltip(null), []);

  if (selectedMonth) {
    const canGoPrev = selectedMonth.year > years[0] || selectedMonth.month > 0;
    const canGoNext = selectedMonth.year < years[years.length - 1] || selectedMonth.month < 11;
    return (
      <DayView
        year={selectedMonth.year}
        month={selectedMonth.month}
        data={data}
        presentDate={effectiveToday}
        onPresentDateChange={onPresentDateChange}
        onBack={() => setSelectedMonth(null)}
        onPrev={() => {
          if (!canGoPrev) return;
          setSelectedMonth(current => {
            if (!current) return current;
            return current.month === 0 ? { year: current.year - 1, month: 11 } : { year: current.year, month: current.month - 1 };
          });
        }}
        onNext={() => {
          if (!canGoNext) return;
          setSelectedMonth(current => {
            if (!current) return current;
            return current.month === 11 ? { year: current.year + 1, month: 0 } : { year: current.year, month: current.month + 1 };
          });
        }}
        isFullscreen={isFullscreen}
      />
    );
  }

  return (
    <div className="relative">
      {tooltip && <TooltipCard t={tooltip} />}

      {/* ── Sticky year/month header ─────────────────────────────────────── */}
      <div
        ref={headerRef}
        className={`sticky z-[30] border-b border-white/10 overflow-x-scroll [&::-webkit-scrollbar]:hidden ${isFullscreen ? 'top-0' : 'top-32'}`}
        style={{ scrollbarWidth: 'none', background: 'var(--usmc-bg-base)' }}
      >
        <div className="relative flex" style={{ minWidth: labelW + totalW }}>
          {/* Faint red line ghost in header */}
          <div className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: labelW + todayFMX, width: 2, background: 'rgba(239,68,68,0.45)' }} />

          {/* Nav cell */}
          <div className="flex-none sticky left-0 z-[40] border-r border-white/10 flex flex-col overflow-hidden"
            style={{ width: labelW, height: 56, background: 'var(--usmc-bg-base)', transition: 'width 200ms ease' }}>
            {collapsed ? (
              <>
                <div className="h-8 border-b border-white/[0.06] flex items-center justify-around px-0.5">
                  <button onClick={onPrev} className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/70 transition-colors">
                    <CaretLeft className="w-3 h-3" />
                  </button>
                  <button onClick={onBack} className="w-5 h-5 flex items-center justify-center text-red-500/60 hover:text-red-400 transition-colors">
                    <CaretUp className="w-3 h-3" />
                  </button>
                  <button onClick={onNext} className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/70 transition-colors">
                    <CaretRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <Rows className="w-3 h-3 text-white/25" />
                </div>
              </>
            ) : (
              <>
                <div className="h-8 border-b border-white/[0.06] flex items-center justify-between px-2">
                  <button onClick={onPrev} className="w-6 h-6 flex items-center justify-center text-white/25 hover:text-white/70 transition-colors">
                    <CaretLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={onBack} className="text-[8px] font-mono text-red-500 hover:text-red-400 tracking-widest transition-colors">
                    ← YEAR VIEW
                  </button>
                  <button onClick={onNext} className="w-6 h-6 flex items-center justify-center text-white/25 hover:text-white/70 transition-colors">
                    <CaretRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="h-6 flex items-center px-3">
                  <span className="text-[8px] font-mono text-white/20 tracking-widest">MONTH</span>
                </div>
              </>
            )}
          </div>

          {/* Year groups */}
          {years.map(y => {
            const isThisYear = y === realToday.getFullYear();
            return (
              <div key={y} className="flex-none border-r border-white/10" style={{ width: 12 * MONTH_W }}>
                <div className={`h-8 border-b border-white/[0.06] flex items-center justify-center ${isThisYear ? 'bg-white/[0.025]' : ''}`}>
                  <span className={`text-[13px] font-mono font-black tracking-wider ${isThisYear ? 'text-white/85' : 'text-white/30'}`}>{y}</span>
                </div>
                <div className="flex h-6">
                  {MONTHS.map((m, i) => {
                    const isToday = y === realToday.getFullYear() && i === realToday.getMonth();
                    return (
                      <button key={m} onClick={() => onMonthSelect ? onMonthSelect({ year: y, month: i }) : setSelectedMonth({ year: y, month: i })}
                        className="flex-none flex items-center justify-center border-r border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors"
                        style={{ width: MONTH_W }}>
                        {isToday
                          ? <span className="bg-red-600 text-white text-[8px] font-mono font-black tracking-widest px-1 py-0.5">TODAY</span>
                          : <span className={`text-[10px] font-mono font-bold tracking-wider ${isThisYear ? 'text-white/50' : 'text-white/20'}`}>{m}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main scroll container ────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        onScroll={handleScroll}
        style={{ background: 'var(--usmc-bg-base)', cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={e => {
          if (e.button !== 0 || isDraggingLine) return;
          const tag = (e.target as HTMLElement).tagName;
          if (tag === 'BUTTON' || tag === 'INPUT' || (e.target as HTMLElement).closest('button,input')) return;
          e.preventDefault();
          hasPanned.current = false;
          const vst = getVerticalScrollTarget(scrollRef.current);
          panStart.current = {
            x: e.clientX,
            y: e.clientY,
            sl: scrollRef.current?.scrollLeft ?? 0,
            st: getVerticalScrollTop(vst),
            vst,
          };
          setIsPanning(true);
        }}
      >
        <div className="relative" style={{ minWidth: labelW + totalW }}>

          {/* Present-date line */}
          <div className="absolute top-0 bottom-0 pointer-events-none z-[5]"
            style={{ left: labelW + todayFMX, width: 2, background: 'rgba(239,68,68,0.85)' }} />
          {/* Drag handle */}
          {onPresentDateChange && (
            <div className="absolute top-0 bottom-0 z-[6]"
              style={{ left: labelW + todayFMX - 8, width: 18, cursor: 'ew-resize' }}
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingLine(true); }}>
              {isDraggingLine && (
                <div className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-mono font-bold text-white tracking-wider pointer-events-none select-none"
                  style={{ top: 6, background: '#ef4444', whiteSpace: 'nowrap' }}>
                  {effectiveToday.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* ── Age row ───────────────────────────────────────────────────── */}
          <div className="flex h-8 border-b border-white/[0.06]">
            <SmallLabel text="AGE" />
            <div className="flex">
              {years.flatMap((y, yi) => MONTHS.map((_, i) => {
                const age = getAgeAtMonth(profile.dob, y, i);
                return (
                  <div key={yi * 12 + i} className="flex-none flex items-center justify-center border-r border-white/[0.04] text-[11px] font-mono text-white/40"
                    style={{ width: MONTH_W }}>
                    {age >= 0 ? age : ''}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* ── Time in Service row ───────────────────────────────────────── */}
          <div className="flex h-8 border-b border-white/10">
            <SmallLabel text="TIME IN SVC" />
            <div className="flex">
              {years.flatMap((y, yi) => MONTHS.map((_, i) => {
                const label = getTISLabel(profile.enlistmentDate, y, i);
                return (
                  <div key={yi * 12 + i} className="flex-none border-r border-white/[0.04] p-0.5" style={{ width: MONTH_W }}>
                    {label !== '—' && (
                      <div className="h-full flex items-center justify-center text-[9px] font-mono font-bold text-white/50"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                        {label}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* ── Milestones ─────────────────────────────────────────────────── */}
          <div className="flex border-b border-white/10" style={{ minHeight: 90 }}>
            <SectionLabel icon={<Flag className="w-3.5 h-3.5" />} lower="MILESTONES" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 90 }}>
              <FullGridLines count={totalMonthCount} />
              {milestones.map(m => {
                const x = dateToFMX(m.date);
                const top = m.track === 0 ? 4 : 50;
                const color = m.type === 'custom' ? (m.customColor ?? '#a78bfa') : MC[m.type];
                const iconCls = m.iconSize === 'sm' ? 'w-3.5 h-3.5' : m.iconSize === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
                const iconEl = m.type === 'custom' ? renderCustomIcon(m.customIcon ?? 'Star', iconCls) : getMilestoneIcon(m.type, iconCls);
                return (
                  <div key={m.id} className="absolute flex flex-col items-center cursor-default"
                    style={{ left: x - 14, top }}
                    onMouseEnter={e => showTT(e, ttMilestone(m))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className="flex items-center justify-center" style={{ color }}>{iconEl}</div>
                    <div className={`text-[8px] font-mono text-center mt-0.5 whitespace-nowrap ${isDesert ? 'text-gray-300' : 'text-white/50'}`}>{m.shortLabel}</div>
                    <div className={`text-[7px] font-mono text-center whitespace-nowrap ${isDesert ? 'text-gray-400' : 'text-white/25'}`}>{fmtDate(m.date)}</div>
                  </div>
                );
              })}
              {milestones.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-white/15 tracking-widest">NO MILESTONES</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Duty Stations ──────────────────────────────────────────────── */}
          <div className="flex border-b border-white/10" style={{ minHeight: 60 }}>
            <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} lower="STATIONS" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 60 }}>
              <FullGridLines count={totalMonthCount} />
              {dutyStations.map(ds => {
                const x = dateToFMX(ds.startDate);
                const ex = dateToFMX(ds.endDate);
                const cx = Math.max(0, x); const cw = Math.min(totalW, ex) - cx;
                if (cw <= 0) return null;
                return (
                  <div key={ds.id} className="absolute top-2 overflow-hidden flex flex-col justify-center px-2 cursor-default"
                    style={{ left: cx + 2, width: cw - 4, height: 44,
                      background: isDesert
                        ? (ds.isPotential ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.08)')
                        : (ds.isPotential ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)'),
                      border: isDesert
                        ? (ds.isPotential ? '1px dashed rgba(0,0,0,0.18)' : '1px solid rgba(0,0,0,0.25)')
                        : (ds.isPotential ? '1px dashed rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.20)') }}
                    onMouseEnter={e => showTT(e, ttDutyStation(ds))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className={`text-[10px] font-mono font-bold truncate ${isDesert ? 'text-gray-300' : 'text-white/80'}`}>{ds.location}</div>
                    {ds.unit && !ds.isPotential && <div className={`text-[8px] font-mono truncate ${isDesert ? 'text-gray-400' : 'text-white/35'}`}>{ds.unit}</div>}
                    <div className={`text-[8px] font-mono truncate ${isDesert ? 'text-gray-400' : 'text-white/30'}`}>{fmtDate(ds.startDate)} – {fmtDate(ds.endDate)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Promotions ─────────────────────────────────────────────────── */}
          <div className="flex border-b border-white/10" style={{ minHeight: 64 }}>
            <SectionLabel icon={<CaretUp className="w-3.5 h-3.5" />} lower="PROMOTIONS" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 64 }}>
              <FullGridLines count={totalMonthCount} />
              <div className="absolute" style={{ left: 0, right: 0, top: 36, height: 1, background: 'var(--usmc-border-subtle)' }} />
              {promotions.map(p => {
                const x = dateToFMX(p.date);
                const past = p.date <= effectiveToday;
                return (
                  <div key={p.id} className="absolute flex flex-col items-center cursor-default" style={{ left: x - 22, top: 8 }}
                    onMouseEnter={e => showTT(e, ttPromotion(p))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className={`px-1.5 py-0.5 text-[9px] font-mono font-black tracking-wider border ${
                      isDesert
                        ? (past ? 'border-gray-500 text-gray-300 bg-black/10' : 'border-gray-400 text-gray-400')
                        : (past ? 'border-white/40 text-white/90 bg-white/10' : 'border-white/15 text-white/35')
                    }`}>
                      {p.rankAbbr}
                    </div>
                    <div className={`text-[8px] font-mono mt-0.5 whitespace-nowrap ${isDesert ? 'text-gray-400' : 'text-white/30'}`}>{fmtDate(p.date)}</div>
                    {p.isProjected && <div className={`text-[7px] font-mono whitespace-nowrap ${isDesert ? 'text-gray-400' : 'text-white/20'}`}>(PROJ)</div>}
                  </div>
                );
              })}
              {promotions.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-white/15 tracking-widest">NO PROMOTIONS</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Education ──────────────────────────────────────────────────── */}
          <div className="flex border-b border-white/10" style={{ minHeight: 52 }}>
            <SectionLabel icon={<BookOpen className="w-3.5 h-3.5" />} lower="EDUCATION" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 52 }}>
              <FullGridLines count={totalMonthCount} />
              {education.map(e => {
                const x = dateToFMX(e.startDate);
                const ex = dateToFMX(e.endDate);
                const cx = Math.max(0, x); const cw = Math.min(totalW, ex) - cx;
                if (cw <= 0) return null;
                return (
                  <div key={e.id} className="absolute top-2 flex flex-col justify-center px-2 overflow-hidden cursor-default"
                    style={{ left: cx + 2, width: cw - 4, height: 36, background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.40)' }}
                    onMouseEnter={e2 => showTT(e2, ttEducation(e))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className="text-[10px] font-mono font-bold text-blue-300/90 truncate">{e.label}</div>
                    {e.isProjected && <div className="text-[8px] font-mono text-blue-400/50">PROJECTED</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Spouse ─────────────────────────────────────────────────────── */}
          {spouse && (
            <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
              <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center overflow-hidden"
                style={{ width: labelW, background: 'var(--usmc-bg-base)', padding: collapsed ? '0 4px' : '0 12px', transition: 'width 200ms ease' }}>
                <span className="flex-none text-white/30"><Heart className="w-3.5 h-3.5" /></span>
                <div className="ml-2 min-w-0" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 120ms ease' }}>
                  <div className="text-[10px] font-mono font-bold text-white/70 truncate">{spouse.name.toUpperCase()}</div>
                  <div className="text-[8px] font-mono text-white/30">MARRIED {fmtDate(spouse.marriageDate)}</div>
                </div>
              </div>
              <div className="flex">
                {years.flatMap((y, yi) => MONTHS.map((_, i) => {
                  const married = y > spouse.marriageDate.getFullYear() ||
                    (y === spouse.marriageDate.getFullYear() && i >= spouse.marriageDate.getMonth());
                  if (!married) return <div key={yi * 12 + i} className="flex-none border-r border-white/[0.04]" style={{ width: MONTH_W }} />;
                  const age = getAgeAtMonth(spouse.dob, y, i);
                  const anniversaryYrs = y - spouse.marriageDate.getFullYear();
                  const isAnniversary = anniversaryYrs > 0 && i === spouse.marriageDate.getMonth();
                  return (
                    <div key={yi * 12 + i} className="flex-none flex flex-col items-center justify-center border-r border-white/[0.04] cursor-default"
                      style={{ width: MONTH_W, background: isAnniversary ? 'rgba(244,114,182,0.06)' : undefined }}
                      onMouseEnter={isAnniversary ? e => showTT(e, {
                        title: `${anniversaryYrs} YEAR ANNIVERSARY`,
                        subtitle: spouse.name.toUpperCase(),
                        lines: [`Married ${fmtDate(spouse.marriageDate)}`, `${anniversaryYrs} years together`],
                      }) : undefined}
                      onMouseMove={isAnniversary ? moveTT : undefined}
                      onMouseLeave={isAnniversary ? hideTT : undefined}>
                      <span className="text-[11px] font-mono" style={{ color: 'rgba(244,114,182,0.7)' }}>{age}</span>
                      {isAnniversary && (
                        <span className="text-[7px] font-mono tracking-wider leading-none" style={{ color: 'rgba(244,114,182,0.45)' }}>
                          {anniversaryYrs} YR ANNIV
                        </span>
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>
          )}

          {/* ── Children ───────────────────────────────────────────────────── */}
          {realChildren.length > 0 && (
            <>
              <div className="flex border-b border-white/10" style={{ minHeight: 28 }}>
                <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center overflow-hidden"
                  style={{ width: labelW, background: 'var(--usmc-bg-base)', padding: collapsed ? '0 4px' : '0 12px', transition: 'width 200ms ease' }}>
                  <span className="flex-none text-white/30"><Users className="w-3.5 h-3.5" /></span>
                  <div className="ml-2" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 120ms ease' }}>
                    <div className="text-[8px] font-mono tracking-[0.18em] text-white/30 uppercase leading-none">Family</div>
                    <div className="text-[11px] font-mono font-bold text-white/70 tracking-wider leading-tight">CHILDREN</div>
                  </div>
                </div>
                <div className="flex">
                  {years.flatMap((_, yi) => MONTHS.map((__, i) => (
                    <div key={yi * 12 + i} className="flex-none border-r border-white/[0.04]" style={{ width: MONTH_W }} />
                  )))}
                </div>
              </div>
              {realChildren.map(child => (
                <div key={child.id}>
                  {/* Child age row */}
                  <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
                    <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center overflow-hidden"
                      style={{ width: labelW, background: 'var(--usmc-bg-base)', padding: collapsed ? '0 4px' : '0 12px 0 24px', transition: 'width 200ms ease' }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: child.color }} />
                      <div className="ml-2" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 120ms ease' }}>
                        <div className="text-[10px] font-mono font-bold text-white/70">{child.name.toUpperCase()}</div>
                        <div className="text-[8px] font-mono text-white/30">BORN {fmtDate(child.dob)}</div>
                      </div>
                    </div>
                    <div className="flex">
                      {years.flatMap((y, yi) => MONTHS.map((_, i) => {
                        const age = getAgeAtMonth(child.dob, y, i);
                        if (age < 0) return <div key={yi * 12 + i} className="flex-none border-r border-white/[0.04]" style={{ width: MONTH_W }} />;
                        return (
                          <div key={yi * 12 + i} className="flex-none flex items-center justify-center border-r border-white/[0.04] text-[11px] font-mono cursor-default"
                            style={{ width: MONTH_W, color: child.color + 'bb' }}
                            onMouseEnter={e => showTT(e, ttChild(child, y))} onMouseLeave={hideTT}>
                            {age}
                          </div>
                        );
                      }))}
                    </div>
                  </div>
                  {/* Child school row */}
                  <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
                    <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center overflow-hidden"
                      style={{ width: labelW, background: 'var(--usmc-bg-base)', padding: collapsed ? '0 4px' : '0 12px 0 24px', transition: 'width 200ms ease' }}>
                      <span className="flex-none text-white/20"><GraduationCap className="w-3 h-3" /></span>
                      <span className="text-[9px] font-mono text-white/30 ml-1.5 tracking-wider"
                        style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 120ms ease' }}>SCHOOLS</span>
                    </div>
                    <div className="flex">
                      {years.flatMap((y, yi) => MONTHS.map((_, i) => {
                        const monthMid = new Date(y, i, 15);
                        const sp = child.schoolPhases.find(p => monthMid >= p.startDate && monthMid < p.endDate);
                        if (!sp) return <div key={yi * 12 + i} className="flex-none border-r border-white/[0.04]" style={{ width: MONTH_W }} />;
                        const st = schoolStyle[sp.phase];
                        const endMonth = child.schoolYearEndMonth ?? 5;
                        const isSummer = i > endMonth && i <= 7;
                        if (isSummer) return <div key={yi * 12 + i} className="flex-none border-r border-white/[0.04]" style={{ width: MONTH_W }} />;
                        const academicYear = i >= 8 ? y : y - 1;
                        const firstCalYear = sp.startDate.getMonth() > 8
                          ? sp.startDate.getFullYear() + 1
                          : sp.startDate.getFullYear();
                        const yearIdx = academicYear - firstCalYear;
                        const labels = GRADE_LABELS[sp.phase] ?? [];
                        const grade = yearIdx >= 0 ? (labels[yearIdx] ?? labels[labels.length - 1] ?? '') : '';
                        return (
                          <div key={yi * 12 + i} className="flex-none flex items-center justify-center border-r border-white/[0.04] text-[10px] font-mono font-bold cursor-default"
                            style={{ width: MONTH_W, background: st.bg, color: st.text }}
                            onMouseEnter={e => showTT(e, ttSchool(sp.label, child, sp.startDate, sp.endDate))}
                            onMouseMove={moveTT} onMouseLeave={hideTT}>
                            {grade}
                          </div>
                        );
                      }))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Financial Goals ─────────────────────────────────────────────── */}
          <div className="flex border-b border-white/10" style={{ minHeight: 80 }}>
            <SectionLabel icon={<CurrencyDollar className="w-3.5 h-3.5" />} lower="GOALS" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 80 }}>
              <FullGridLines count={totalMonthCount} />
              {financialGoals.map(g => {
                const x = dateToFMX(g.targetDate);
                const isCustom = g.iconName === 'custom';
                const gc = isCustom ? (g.customColor ?? '#a78bfa') : null;
                return (
                  <div key={g.id} className="absolute top-2 flex flex-col items-start" style={{ left: x - 4, width: 94 }}>
                    <div className="w-0.5 h-4 mb-1 ml-4" style={{ background: isCustom ? `${gc}AA` : 'rgba(74,222,128,0.7)' }} />
                    <div className="p-1.5 w-full cursor-default"
                      style={isCustom ? { background: `${gc}12`, border: `1px solid ${gc}40` } : { background: 'rgba(5,46,22,0.6)', border: '1px solid rgba(74,222,128,0.30)' }}
                      onMouseEnter={e => showTT(e, ttGoal(g))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                      <div className="flex items-center gap-1 mb-0.5" style={{ color: isCustom ? gc! : 'rgba(74,222,128,0.7)' }}>
                        <GoalIcon name={g.iconName} customIconName={g.customIconName} />
                      </div>
                      <div className="text-[8px] font-mono font-bold leading-tight"
                        style={{ color: isCustom ? `${gc}CC` : 'rgba(134,239,172,0.8)' }}>{g.label}</div>
                      {g.amount > 0 && <div className="text-[8px] font-mono" style={{ color: isCustom ? `${gc}99` : 'rgba(74,222,128,0.6)' }}>
                        GOAL: ${g.amount.toLocaleString()}</div>}
                      <div className="text-[7px] font-mono" style={{ color: isCustom ? `${gc}66` : 'rgba(74,222,128,0.4)' }}>
                        {fmtDate(g.targetDate)}</div>
                    </div>
                  </div>
                );
              })}
              {financialGoals.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-white/15 tracking-widest">NO GOALS</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
