import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  BookOpen, CaretLeft, CaretRight, CaretUp, CurrencyDollar,
  Flag, GraduationCap, Heart, MapPin, Rows, Timer, User, Users,
} from '@phosphor-icons/react';
import { renderCustomIcon } from '../IconColorPicker';
import type { TimelineData } from '../../types';
import {
  LABEL_W, LABEL_W_COLLAPSED, GUTTER_W, MONTHS, TODAY, TIMELINE_START, TIMELINE_END,
  fmtDate, ttDutyStation, ttPromotion, ttEducation, ttMilestone, ttGoal, ttChild, ttSchool,
  SCHOOL_STYLE, SCHOOL_STYLE_DESERT, GRADE_LABELS, MILESTONE_COLOR, MILESTONE_COLOR_DESERT,
  getVerticalScrollTarget, getVerticalScrollTop, setVerticalScrollTop,
  type TooltipState, type VerticalScrollTarget,
} from './timelineUtils';
import { TooltipCard, GoalIcon, SmallLabel, getMilestoneIcon, SidebarCollapsedCtx } from './TimelineAtoms';
import { useTheme } from '@/app/features/theme/ThemeContext';

const DAY_W = 42;
const DAY_BUFFER = 18;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const TIMELINE_START_DATE = new Date(TIMELINE_START, 0, 1);
const TIMELINE_END_DATE = new Date(TIMELINE_END + 1, 0, 1);

type PanStart = { x: number; y: number; sl: number; st: number; vst: VerticalScrollTarget };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_PER_DAY);
}

function fmtFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function dateToDayX(date: Date): number {
  const clamped = new Date(
    Math.max(TIMELINE_START_DATE.getTime(), Math.min(TIMELINE_END_DATE.getTime(), startOfDay(date).getTime())),
  );
  return daysBetween(TIMELINE_START_DATE, clamped) * DAY_W;
}

function dateFromDayIndex(dayIdx: number): Date {
  return new Date(TIMELINE_START, 0, dayIdx + 1);
}

function overlapsTimeline(start: Date, end: Date): boolean {
  return end > TIMELINE_START_DATE && start < TIMELINE_END_DATE;
}

function getAgeAtDate(dob: Date, date: Date): number {
  let age = date.getFullYear() - dob.getFullYear();
  if (date.getMonth() < dob.getMonth() || (date.getMonth() === dob.getMonth() && date.getDate() < dob.getDate())) age -= 1;
  return age;
}

function getTISLabelAtDate(enlist: Date, date: Date): string {
  if (date < enlist) return '';
  let yearsCount = date.getFullYear() - enlist.getFullYear();
  let monthsCount = date.getMonth() - enlist.getMonth();
  let daysCount = date.getDate() - enlist.getDate();
  if (daysCount < 0) {
    monthsCount -= 1;
    daysCount += new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  }
  if (monthsCount < 0) {
    yearsCount -= 1;
    monthsCount += 12;
  }
  return daysCount > 0 ? `${yearsCount}Y ${monthsCount}M ${daysCount}D` : `${yearsCount}Y ${monthsCount}M`;
}

function getTISMonthLabel(enlist: Date, date: Date): string {
  const total = (date.getFullYear() - enlist.getFullYear()) * 12 + (date.getMonth() - enlist.getMonth());
  if (total < 0) return '';
  if (total % 12 === 0) return `${Math.floor(total / 12)}Y`;
  return `${total % 12}M`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInTimeline(date: Date): boolean {
  return date >= TIMELINE_START_DATE && date < TIMELINE_END_DATE;
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

interface VisibleDay {
  date: Date;
  idx: number;
  x: number;
}

function DayGridLines({ days }: { days: VisibleDay[] }) {
  return (
    <>
      {days.map(({ idx, x }) => (
        <div key={idx} className="absolute top-0 bottom-0 border-r border-white/[0.04]"
          style={{ left: x, width: DAY_W }} />
      ))}
    </>
  );
}

function VisibleDayTrack({ totalW, days, children }: {
  totalW: number;
  days: VisibleDay[];
  children: (d: Date, x: number) => React.ReactNode;
}) {
  return (
    <div className="relative flex-none" style={{ width: totalW }}>
      {days.map(({ date, idx, x }) => (
        <div key={idx} className="absolute top-0 bottom-0" style={{ left: x, width: DAY_W }}>
          {children(date, x)}
        </div>
      ))}
    </div>
  );
}

interface Props {
  year: number;
  month: number;
  data: TimelineData;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  presentDate?: Date;
  onPresentDateChange?: (d: Date) => void;
  isFullscreen?: boolean;
}

export function DayView({ year, month, data, onBack, onPrev, onNext, presentDate, onPresentDateChange, isFullscreen = false }: Props) {
  const { profile, milestones, dutyStations, promotions, education, spouse, children, financialGoals } = data;
  const realChildren = children.filter(c => !c.isPlanned);
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const MC = isDesert ? MILESTONE_COLOR_DESERT : MILESTONE_COLOR;
  const schoolStyle = isDesert ? SCHOOL_STYLE_DESERT : SCHOOL_STYLE;
  const effectiveToday = presentDate ?? TODAY;
  const realToday = new Date();
  const dayCount = daysBetween(TIMELINE_START_DATE, TIMELINE_END_DATE);
  const totalW = dayCount * DAY_W;
  const todayX = isInTimeline(effectiveToday) ? dateToDayX(effectiveToday) : -100;

  const collapsed = useContext(SidebarCollapsedCtx);
  const labelW = collapsed ? GUTTER_W + LABEL_W_COLLAPSED : LABEL_W;
  const labelWRef = useRef(labelW);
  labelWRef.current = labelW;

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isDraggingLine, setIsDraggingLine] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [viewport, setViewport] = useState({ left: 0, width: 1200 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<PanStart | null>(null);
  const hasPanned = useRef(false);
  const onPresentDateChangeRef = useRef(onPresentDateChange);

  useEffect(() => {
    onPresentDateChangeRef.current = onPresentDateChange;
  }, [onPresentDateChange]);

  useEffect(() => {
    const anchor = isInTimeline(effectiveToday) && effectiveToday.getFullYear() === year && effectiveToday.getMonth() === month
      ? effectiveToday
      : new Date(year, month, 1);
    const targetX = Math.max(0, dateToDayX(anchor) - 220);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = targetX;
      setViewport({ left: targetX, width: scrollRef.current.clientWidth || 1200 });
    }
    if (headerRef.current) headerRef.current.scrollLeft = targetX;
  // Only recenter when entering/changing day-view month. Red-line drag updates presentDate continuously.
  }, [year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const left = scrollRef.current.scrollLeft;
    if (headerRef.current) headerRef.current.scrollLeft = left;
    setViewport({ left, width: scrollRef.current.clientWidth || 1200 });
  }, []);

  const visibleStart = Math.max(0, Math.floor(viewport.left / DAY_W) - DAY_BUFFER);
  const visibleEnd = Math.min(dayCount, Math.ceil((viewport.left + viewport.width) / DAY_W) + DAY_BUFFER);
  const visibleDays: VisibleDay[] = Array.from({ length: Math.max(0, visibleEnd - visibleStart) }, (_, i) => {
    const idx = visibleStart + i;
    return { idx, date: dateFromDayIndex(idx), x: idx * DAY_W };
  });

  useEffect(() => {
    if (!isDraggingLine) return;
    function onMove(e: MouseEvent) {
      if (!scrollRef.current) return;
      const rect = scrollRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left + scrollRef.current.scrollLeft - labelWRef.current;
      const dayIdx = Math.max(0, Math.min(dayCount - 1, Math.floor(rawX / DAY_W)));
      onPresentDateChangeRef.current?.(dateFromDayIndex(dayIdx));
    }
    function onUp() { setIsDraggingLine(false); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDraggingLine, year, month, dayCount]);

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
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isPanning]);

  const showTT = useCallback((e: React.MouseEvent, content: Omit<TooltipState,'x'|'y'>) => {
    setTooltip({ x: e.clientX, y: e.clientY, ...content });
  }, []);
  const moveTT = useCallback((e: React.MouseEvent) => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null), []);
  const hideTT = useCallback(() => setTooltip(null), []);

  return (
    <div className="relative">
      {tooltip && <TooltipCard t={tooltip} />}

      <div
        ref={headerRef}
        className={`sticky z-[30] border-b border-white/10 overflow-x-scroll [&::-webkit-scrollbar]:hidden ${isFullscreen ? 'top-0' : 'top-32'}`}
        style={{ scrollbarWidth: 'none', background: 'var(--usmc-bg-base)' }}
      >
        <div className="relative flex" style={{ minWidth: labelW + totalW }}>
          {isInTimeline(effectiveToday) && (
            <div className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: labelW + todayX, width: 2, background: 'rgba(239,68,68,0.45)' }} />
          )}
          {/* Nav cell — matches year-view header cell style */}
          <div className="flex-none sticky left-0 z-[40] border-r border-white/10 flex flex-col overflow-hidden"
            style={{ width: labelW, height: 56, background: 'var(--usmc-bg-base)', transition: 'width 200ms ease' }}>
            {collapsed ? (
              <div className="flex-1 flex items-center justify-center">
                <Rows className="w-3.5 h-3.5 text-white/30" />
              </div>
            ) : (
              <>
                <div className="h-8 border-b border-white/[0.06] flex items-center px-2.5">
                  <span className="text-[8px] font-mono tracking-[0.2em] text-white/25 uppercase">Timeline</span>
                </div>
                <div className="flex-1 flex items-center justify-between px-1.5">
                  <button onClick={onPrev} className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/55 transition-colors">
                    <CaretLeft className="w-2.5 h-2.5" />
                  </button>
                  <button onClick={onBack} className="text-[7px] font-mono text-red-500/60 hover:text-red-400 tracking-wider transition-colors">
                    ↑ MONTH VIEW
                  </button>
                  <button onClick={onNext} className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/55 transition-colors">
                    <CaretRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="relative flex-none" style={{ width: totalW, height: 56 }}>
          {visibleDays.map(({ date: d, idx, x }) => {
            const isToday = isSameDay(d, realToday);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            const isMonthStart = d.getDate() === 1;
            return (
              <div key={idx} className={`absolute top-0 bottom-0 border-r border-white/[0.06] flex flex-col items-center justify-center ${isWeekend ? 'bg-white/[0.025]' : ''}`}
                style={{ left: x, width: DAY_W }}>
                {isToday ? (
                  <span className="bg-red-600 text-white text-[8px] font-mono font-black tracking-widest px-1 py-0.5">TODAY</span>
                ) : (
                  <>
                    <span className={`text-[11px] font-mono font-black ${isMonthStart ? 'text-red-400/80' : 'text-white/55'}`}>
                      {isMonthStart ? MONTHS[d.getMonth()] : d.getDate()}
                    </span>
                    <span className="text-[7px] font-mono text-white/20 tracking-wider">
                      {isMonthStart ? d.getFullYear() : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                    </span>
                  </>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

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
          {isInTimeline(effectiveToday) && (
            <>
              <div className="absolute top-0 bottom-0 pointer-events-none z-[5]"
                style={{ left: labelW + todayX, width: 2, background: 'rgba(239,68,68,0.85)' }} />
              {onPresentDateChange && (
                <div className="absolute top-0 bottom-0 z-[6]"
                  style={{ left: labelW + todayX - 8, width: 18, cursor: 'ew-resize' }}
                  onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingLine(true); }}>
                  {isDraggingLine && (
                    <div className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-mono font-bold text-white tracking-wider pointer-events-none select-none"
                      style={{ top: 6, background: '#ef4444', whiteSpace: 'nowrap' }}>
                      {fmtFullDate(effectiveToday)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex h-8 border-b border-white/[0.06]">
            <SmallLabel text="AGE" icon={<User className="w-3 h-3" />} />
            <VisibleDayTrack totalW={totalW} days={visibleDays}>
              {d => {
                const age = getAgeAtDate(profile.dob, d);
                const isBirthday = d.getMonth() === profile.dob.getMonth() && d.getDate() === profile.dob.getDate();
                const isMonthStart = d.getDate() === 1;
                const showAge = age >= 0 && (isBirthday || isMonthStart);
                return (
                  <div className="h-full relative border-r border-white/[0.025]">
                    {showAge && (
                      <div className="absolute inset-y-1 left-1 right-1 flex items-center justify-center border font-mono"
                        style={{
                          background: isBirthday ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.035)',
                          borderColor: isBirthday ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                          color: isBirthday ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)',
                          fontSize: isBirthday ? 10 : 9,
                          fontWeight: isBirthday ? 800 : 700,
                        }}>
                        {age}
                      </div>
                    )}
                  </div>
                );
              }}
            </VisibleDayTrack>
          </div>

          <div className="flex h-8 border-b border-white/10">
            <SmallLabel text="TIME IN SVC" icon={<Timer className="w-3 h-3" />} />
            <VisibleDayTrack totalW={totalW} days={visibleDays}>
              {d => {
                const enlisted = d >= profile.enlistmentDate;
                const isMonthStart = d.getDate() === 1;
                const isAnniversary = d.getMonth() === profile.enlistmentDate.getMonth() && d.getDate() === profile.enlistmentDate.getDate() && enlisted;
                const isMonthMark = isMonthStart && enlisted;
                const label = isAnniversary ? getTISLabelAtDate(profile.enlistmentDate, d) : isMonthMark ? getTISMonthLabel(profile.enlistmentDate, d) : '';
                return (
                  <div className="h-full relative border-r border-white/[0.025]">
                    {enlisted && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
                        style={{
                          width: isMonthMark || isAnniversary ? 2 : 1,
                          height: isAnniversary ? 22 : isMonthMark ? 16 : 8,
                          background: isAnniversary ? 'rgba(239,68,68,0.72)' : 'rgba(255,255,255,0.12)',
                        }} />
                    )}
                    {label && (
                      <div className="absolute inset-y-1 left-0.5 right-0.5 flex items-center justify-center border font-mono font-bold"
                        style={{
                          background: isAnniversary ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.035)',
                          borderColor: isAnniversary ? 'rgba(239,68,68,0.32)' : 'rgba(255,255,255,0.075)',
                          color: isAnniversary ? 'rgba(252,165,165,0.95)' : 'rgba(255,255,255,0.42)',
                          fontSize: isAnniversary ? 8 : 7,
                        }}>
                        {label}
                      </div>
                    )}
                  </div>
                );
              }}
            </VisibleDayTrack>
          </div>

          <div className="flex border-b border-white/10" style={{ minHeight: 90 }}>
            <SectionLabel icon={<Flag className="w-3.5 h-3.5" />} lower="MILESTONES" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 90 }}>
              <DayGridLines days={visibleDays} />
              {milestones.filter(m => isInTimeline(m.date)).map(m => {
                const x = dateToDayX(m.date);
                const top = m.track === 0 ? 4 : 50;
                const color = m.type === 'custom' ? (m.customColor ?? '#a78bfa') : MC[m.type];
                const iconCls = m.iconSize === 'sm' ? 'w-3.5 h-3.5' : m.iconSize === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
                const iconEl = m.type === 'custom' ? renderCustomIcon(m.customIcon ?? 'Star', iconCls) : getMilestoneIcon(m.type, iconCls);
                return (
                  <div key={m.id} className="absolute flex flex-col items-center cursor-default"
                    style={{ left: x - 14, top }}
                    onMouseEnter={e => showTT(e, ttMilestone(m))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className="flex items-center justify-center" style={{ color }}>{iconEl}</div>
                    <div className="text-[8px] font-mono text-white/50 text-center mt-0.5 whitespace-nowrap">{m.shortLabel}</div>
                    <div className="text-[7px] font-mono text-white/25 text-center whitespace-nowrap">{fmtFullDate(m.date)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex border-b border-white/10" style={{ minHeight: 60 }}>
            <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} lower="STATIONS" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 60 }}>
              <DayGridLines days={visibleDays} />
              {dutyStations.map(ds => {
                if (!overlapsTimeline(ds.startDate, ds.endDate)) return null;
                const x = dateToDayX(ds.startDate);
                const ex = dateToDayX(ds.endDate);
                const cw = ex - x;
                if (cw <= 1) return null;
                return (
                  <div key={ds.id} className="absolute top-2 overflow-hidden flex flex-col justify-center px-2 cursor-default"
                    style={{ left: x + 2, width: Math.max(22, cw - 4), height: 44, background: ds.isPotential ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)', border: ds.isPotential ? '1px dashed rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.20)' }}
                    onMouseEnter={e => showTT(e, ttDutyStation(ds))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className="text-[10px] font-mono font-bold text-white/80 truncate">{ds.location}</div>
                    <div className="text-[8px] font-mono text-white/30 truncate">{fmtDate(ds.startDate)} - {fmtDate(ds.endDate)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex border-b border-white/10" style={{ minHeight: 64 }}>
            <SectionLabel icon={<CaretUp className="w-3.5 h-3.5" />} lower="PROMOTIONS" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 64 }}>
              <DayGridLines days={visibleDays} />
              <div className="absolute" style={{ left: 0, right: 0, top: 36, height: 1, background: 'var(--usmc-border-subtle)' }} />
              {promotions.filter(p => isInTimeline(p.date)).map(p => {
                const x = dateToDayX(p.date);
                const past = p.date <= effectiveToday;
                return (
                  <div key={p.id} className="absolute flex flex-col items-center cursor-default" style={{ left: x - 22, top: 8 }}
                    onMouseEnter={e => showTT(e, ttPromotion(p))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className={`px-1.5 py-0.5 text-[9px] font-mono font-black tracking-wider border ${past ? 'border-white/40 text-white/90 bg-white/10' : 'border-white/15 text-white/35'}`}>
                      {p.rankAbbr}
                    </div>
                    <div className="text-[8px] font-mono text-white/30 mt-0.5 whitespace-nowrap">{fmtFullDate(p.date)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex border-b border-white/10" style={{ minHeight: 52 }}>
            <SectionLabel icon={<BookOpen className="w-3.5 h-3.5" />} lower="EDUCATION" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 52 }}>
              <DayGridLines days={visibleDays} />
              {education.map(e => {
                if (!overlapsTimeline(e.startDate, e.endDate)) return null;
                const x = dateToDayX(e.startDate);
                const ex = dateToDayX(e.endDate);
                const cw = ex - x;
                if (cw <= 1) return null;
                return (
                  <div key={e.id} className="absolute top-2 flex flex-col justify-center px-2 overflow-hidden cursor-default"
                    style={{ left: x + 2, width: Math.max(22, cw - 4), height: 36, background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(59,130,246,0.40)' }}
                    onMouseEnter={e2 => showTT(e2, ttEducation(e))} onMouseMove={moveTT} onMouseLeave={hideTT}>
                    <div className="text-[10px] font-mono font-bold text-blue-300/90 truncate">{e.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

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
              <VisibleDayTrack totalW={totalW} days={visibleDays}>
                {d => {
                  const married = d >= spouse.marriageDate;
                  if (!married) return <div className="h-full border-r border-white/[0.04]" />;
                  const age = getAgeAtDate(spouse.dob, d);
                  const anniversaryYrs = d.getFullYear() - spouse.marriageDate.getFullYear();
                  const isAnniversary = anniversaryYrs > 0 && d.getMonth() === spouse.marriageDate.getMonth() && d.getDate() === spouse.marriageDate.getDate();
                  return (
                    <div className="h-full flex flex-col items-center justify-center border-r border-white/[0.04] cursor-default"
                      style={{ background: isAnniversary ? 'rgba(244,114,182,0.06)' : undefined }}
                      onMouseEnter={isAnniversary ? e => showTT(e, { title: `${anniversaryYrs} YEAR ANNIVERSARY`, subtitle: spouse.name.toUpperCase(), lines: [`Married ${fmtDate(spouse.marriageDate)}`, `${anniversaryYrs} years together`] }) : undefined}
                      onMouseMove={isAnniversary ? moveTT : undefined}
                      onMouseLeave={isAnniversary ? hideTT : undefined}>
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(244,114,182,0.7)' }}>{age}</span>
                      {isAnniversary && <span className="text-[7px] font-mono tracking-wider leading-none" style={{ color: 'rgba(244,114,182,0.45)' }}>ANNIV</span>}
                    </div>
                  );
                }}
              </VisibleDayTrack>
            </div>
          )}

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
                <div className="relative flex-none" style={{ width: totalW }}>
                  <DayGridLines days={visibleDays} />
                </div>
              </div>
              {realChildren.map(child => (
                <div key={child.id}>
                  <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
                    <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center overflow-hidden"
                      style={{ width: labelW, background: 'var(--usmc-bg-base)', padding: collapsed ? '0 4px' : '0 12px 0 24px', transition: 'width 200ms ease' }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: child.color }} />
                      <div className="ml-2" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 120ms ease' }}>
                        <div className="text-[10px] font-mono font-bold text-white/70">{child.name.toUpperCase()}</div>
                        <div className="text-[8px] font-mono text-white/30">BORN {fmtDate(child.dob)}</div>
                      </div>
                    </div>
                    <VisibleDayTrack totalW={totalW} days={visibleDays}>
                      {d => {
                        const age = getAgeAtDate(child.dob, d);
                        const birthday = d.getMonth() === child.dob.getMonth() && d.getDate() === child.dob.getDate();
                        if (age < 0) return <div className="h-full border-r border-white/[0.04]" />;
                        return (
                          <div className="h-full flex items-center justify-center border-r border-white/[0.04] text-[10px] font-mono cursor-default"
                            style={{ color: child.color + 'bb', background: birthday ? `${child.color}18` : undefined }}
                            onMouseEnter={e => showTT(e, ttChild(child, d.getFullYear()))} onMouseLeave={hideTT}>
                            {birthday ? `${age}` : ''}
                          </div>
                        );
                      }}
                    </VisibleDayTrack>
                  </div>
                  <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
                    <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center overflow-hidden"
                      style={{ width: labelW, background: 'var(--usmc-bg-base)', padding: collapsed ? '0 4px' : '0 12px 0 24px', transition: 'width 200ms ease' }}>
                      <span className="flex-none text-white/20"><GraduationCap className="w-3 h-3" /></span>
                      <span className="text-[9px] font-mono text-white/30 ml-1.5 tracking-wider"
                        style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 120ms ease' }}>SCHOOLS</span>
                    </div>
                    <VisibleDayTrack totalW={totalW} days={visibleDays}>
                      {d => {
                        const sp = child.schoolPhases.find(p => d >= p.startDate && d < p.endDate);
                        if (!sp) return <div className="h-full border-r border-white/[0.04]" />;
                        const st = schoolStyle[sp.phase];
                        const endMonth = child.schoolYearEndMonth ?? 5;
                        const endDay = child.schoolYearEndDay ?? 15;
                        const summerStart = new Date(d.getFullYear(), endMonth, endDay + 1);
                        const summerEnd = new Date(d.getFullYear(), 8, 1);
                        if (d >= summerStart && d < summerEnd) return <div className="h-full border-r border-white/[0.04]" />;
                        const academicYear = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
                        const firstCalYear = sp.startDate.getMonth() > 8 ? sp.startDate.getFullYear() + 1 : sp.startDate.getFullYear();
                        const yearIdx = academicYear - firstCalYear;
                        const labels = GRADE_LABELS[sp.phase] ?? [];
                        const grade = yearIdx >= 0 ? (labels[yearIdx] ?? labels[labels.length - 1] ?? '') : '';
                        const configuredStart = new Date(academicYear, 8, 1);
                        const schoolYearStart = configuredStart > sp.startDate ? configuredStart : sp.startDate;
                        const configuredEnd = new Date(academicYear + 1, endMonth, Math.min(endDay, new Date(academicYear + 1, endMonth + 1, 0).getDate()));
                        const schoolYearEnd = configuredEnd < sp.endDate ? configuredEnd : sp.endDate;
                        return (
                          <div className="h-full flex items-center justify-center border-r border-white/[0.04] text-[9px] font-mono font-bold cursor-default"
                            style={{ background: st.bg, color: st.text }}
                            onMouseEnter={e => showTT(e, ttSchool(sp.label, child, schoolYearStart, schoolYearEnd))}
                            onMouseMove={moveTT} onMouseLeave={hideTT}>
                            {grade}
                          </div>
                        );
                      }}
                    </VisibleDayTrack>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="flex border-b border-white/10" style={{ minHeight: 80 }}>
            <SectionLabel icon={<CurrencyDollar className="w-3.5 h-3.5" />} lower="GOALS" />
            <div className="relative flex-1" style={{ width: totalW, minHeight: 80 }}>
              <DayGridLines days={visibleDays} />
              {financialGoals.filter(g => isInTimeline(g.targetDate)).map(g => {
                const x = dateToDayX(g.targetDate);
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
                      <div className="text-[7px] font-mono" style={{ color: isCustom ? `${gc}66` : 'rgba(74,222,128,0.4)' }}>
                        {fmtFullDate(g.targetDate)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
