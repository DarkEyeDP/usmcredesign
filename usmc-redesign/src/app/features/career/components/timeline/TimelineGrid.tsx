import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { MagnifyingGlassPlus, User, Timer, Rows } from '@phosphor-icons/react';
import type { TimelineData, Promotion, CareerMilestone, DutyStation, EducationEvent, Child, FinancialGoal } from '../../types';
import {
  LABEL_W, LABEL_W_COLLAPSED, GUTTER_W, years, TODAY,
  dateToX,
  getVerticalScrollTarget, getVerticalScrollTop, setVerticalScrollTop,
  type TooltipState, type VerticalScrollTarget,
} from './timelineUtils';
import { TooltipCard, SectionGutter, SmallLabel, SidebarCollapsedCtx } from './TimelineAtoms';
import { MonthView } from './MonthView';
import { DayView } from './DayView';
import { CareerSection } from './sections/CareerSection';
import { ServiceSection } from './sections/ServiceSection';
import { EducationSection } from './sections/EducationSection';
import { FamilySection } from './sections/FamilySection';
import { FinancialSection } from './sections/FinancialSection';

export interface TimelineGridHandle {
  scrollToToday: () => void;
}

type ZoomedMonth = { year: number; month: number } | null;
type PanStart = { x: number; y: number; sl: number; st: number; vst: VerticalScrollTarget };

interface Props {
  data: TimelineData;
  yearWidth: number;
  onAddPromotion?: () => void;
  onAddMilestone?: () => void;
  onAddDutyStation?: () => void;
  onAddEducation?: () => void;
  onAddSpouse?: () => void;
  onAddChild?: () => void;
  onAddFinancialGoal?: () => void;
  onDeletePromotion?: (id: string) => void;
  onDeleteMilestone?: (id: string) => void;
  onDeleteDutyStation?: (id: string) => void;
  onDeleteEducation?: (id: string) => void;
  onDeleteChild?: (id: string) => void;
  onDeleteFinancialGoal?: (id: string) => void;
  onEditPromotion?: (p: Promotion) => void;
  onEditMilestone?: (m: CareerMilestone) => void;
  onEditDutyStation?: (ds: DutyStation) => void;
  onEditEducation?: (e: EducationEvent) => void;
  onEditChild?: (c: Child) => void;
  onEditFinancialGoal?: (g: FinancialGoal) => void;
  onReorderChildren?: (ids: string[]) => void;
  presentDate?: Date;
  onPresentDateChange?: (d: Date) => void;
  isFullscreen?: boolean;
  zoomedYear?: number | null;
  zoomedMonth?: ZoomedMonth;
  onZoomedYearChange?: (year: number | null) => void;
  onZoomedMonthChange?: (month: ZoomedMonth) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const TimelineGrid = forwardRef<TimelineGridHandle, Props>(
  ({
    data, yearWidth: yw,
    onAddPromotion, onAddMilestone, onAddDutyStation, onAddEducation, onAddSpouse, onAddChild, onAddFinancialGoal,
    onDeletePromotion, onDeleteMilestone, onDeleteDutyStation, onDeleteEducation, onDeleteChild, onDeleteFinancialGoal,
    onEditPromotion, onEditMilestone, onEditDutyStation, onEditEducation, onEditChild, onEditFinancialGoal,
    onReorderChildren,
    presentDate, onPresentDateChange, isFullscreen = false,
    zoomedYear = null, zoomedMonth = null, onZoomedYearChange, onZoomedMonthChange,
    sidebarCollapsed: sidebarCollapsedProp, onToggleSidebar,
  }, ref) => {
    const { profile, milestones, dutyStations, promotions, education, spouse, children, financialGoals } = data;

    const scrollRef  = useRef<HTMLDivElement>(null);
    const headerRef  = useRef<HTMLDivElement>(null);
    const panStart   = useRef<PanStart | null>(null);
    const hasPanned  = useRef(false);
    const ywRef      = useRef(yw);
    ywRef.current    = yw;
    const onPresentDateChangeRef = useRef(onPresentDateChange);
    onPresentDateChangeRef.current = onPresentDateChange;

    const [tooltip,          setTooltip]          = useState<TooltipState | null>(null);
    const [atScrollEnd,      setAtScrollEnd]      = useState(false);
    const [pendingScroll,    setPendingScroll]    = useState(false);
    const [isDraggingLine,   setIsDraggingLine]   = useState(false);
    const [isPanning,        setIsPanning]        = useState(false);
    const [_sidebarCollapsed, _setSidebarCollapsed] = useState(false);
    const sidebarCollapsed = sidebarCollapsedProp ?? _sidebarCollapsed;
    const toggleSidebar = () => { if (onToggleSidebar) onToggleSidebar(); else _setSidebarCollapsed(v => !v); };

    const today  = presentDate ?? TODAY;
    const realToday = new Date();
    const totalW = years.length * yw;
    const todayX = dateToX(today, yw);
    const labelW = sidebarCollapsed ? GUTTER_W + LABEL_W_COLLAPSED : LABEL_W;
    const labelWRef = useRef(labelW);
    labelWRef.current = labelW;

    // Tooltip helpers
    const showTT = useCallback((e: React.MouseEvent, content: Omit<TooltipState,'x'|'y'>) => {
      setTooltip({ x: e.clientX, y: e.clientY, ...content });
    }, []);
    const moveTT = useCallback((e: React.MouseEvent) => {
      setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
    }, []);
    const hideTT = useCallback(() => setTooltip(null), []);

    // Scroll helpers
    const execScrollToToday = useCallback(() => {
      if (!scrollRef.current) return;
      const left = Math.max(0, labelWRef.current + todayX - 220);
      scrollRef.current.scrollLeft = left;
      if (headerRef.current) headerRef.current.scrollLeft = left;
    }, [todayX]);

    useEffect(() => { execScrollToToday(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (pendingScroll && !zoomedYear && !zoomedMonth && scrollRef.current) {
        execScrollToToday();
        setPendingScroll(false);
      }
    }, [pendingScroll, zoomedYear, zoomedMonth, execScrollToToday]);

    useImperativeHandle(ref, () => ({
      scrollToToday: () => {
        if (zoomedMonth) {
          const d = new Date();
          onPresentDateChange?.(d);
          onZoomedMonthChange?.({ year: d.getFullYear(), month: d.getMonth() });
        } else if (zoomedYear !== null) {
          onZoomedYearChange?.(null);
          setPendingScroll(true);
        } else {
          execScrollToToday();
        }
      },
    }), [zoomedYear, zoomedMonth, onPresentDateChange, onZoomedYearChange, onZoomedMonthChange, execScrollToToday]);

    const handleScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setAtScrollEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 20);
      if (headerRef.current) headerRef.current.scrollLeft = el.scrollLeft;
    }, []);

    // Drag present-date line
    useEffect(() => {
      if (!isDraggingLine) return;
      function onMove(e: MouseEvent) {
        if (!scrollRef.current) return;
        const rect = scrollRef.current.getBoundingClientRect();
        const rawX = e.clientX - rect.left + scrollRef.current.scrollLeft - labelWRef.current;
        const { TIMELINE_START, TIMELINE_END } = { TIMELINE_START: years[0], TIMELINE_END: years[years.length - 1] };
        const clamped = Math.max(0, Math.min(years.length * ywRef.current, rawX));
        const totalMonths = Math.round((clamped / ywRef.current) * 12);
        const clampedMonths = Math.max(0, Math.min((TIMELINE_END - TIMELINE_START) * 12, totalMonths));
        const year = TIMELINE_START + Math.floor(clampedMonths / 12);
        const month = clampedMonths % 12;
        onPresentDateChangeRef.current?.(new Date(year, month, 1));
      }
      function onUp() { setIsDraggingLine(false); }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [isDraggingLine]);

    // Click-drag pan
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
        if (hasPanned.current) {
          window.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true });
        }
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [isPanning]);

    if (zoomedMonth) {
      const canGoPrev = zoomedMonth.year > years[0] || zoomedMonth.month > 0;
      const canGoNext = zoomedMonth.year < years[years.length - 1] || zoomedMonth.month < 11;
      return (
        <SidebarCollapsedCtx.Provider value={sidebarCollapsed}>
          <DayView
            year={zoomedMonth.year}
            month={zoomedMonth.month}
            data={data}
            presentDate={today}
            onPresentDateChange={onPresentDateChange}
            onBack={() => onZoomedMonthChange?.(null)}
            onPrev={() => {
              if (!canGoPrev) return;
              onZoomedMonthChange?.(zoomedMonth.month === 0
                ? { year: zoomedMonth.year - 1, month: 11 }
                : { year: zoomedMonth.year, month: zoomedMonth.month - 1 });
            }}
            onNext={() => {
              if (!canGoNext) return;
              onZoomedMonthChange?.(zoomedMonth.month === 11
                ? { year: zoomedMonth.year + 1, month: 0 }
                : { year: zoomedMonth.year, month: zoomedMonth.month + 1 });
            }}
            isFullscreen={isFullscreen}
          />
        </SidebarCollapsedCtx.Provider>
      );
    }

    if (zoomedYear !== null) {
      return (
        <SidebarCollapsedCtx.Provider value={sidebarCollapsed}>
          <MonthView
            year={zoomedYear}
            data={data}
            presentDate={today}
            onPresentDateChange={onPresentDateChange}
            onBack={() => onZoomedYearChange?.(null)}
            onPrev={() => onZoomedYearChange?.(Math.max(years[0], zoomedYear - 1))}
            onNext={() => onZoomedYearChange?.(Math.min(years[years.length - 1], zoomedYear + 1))}
            onMonthSelect={month => onZoomedMonthChange?.(month)}
            isFullscreen={isFullscreen}
          />
        </SidebarCollapsedCtx.Provider>
      );
    }

    // Typed wrappers so section components accept React.MouseEvent<HTMLElement>
    const showTTEl = showTT as (e: React.MouseEvent<HTMLElement>, c: Omit<TooltipState,'x'|'y'>) => void;
    const moveTTEl = moveTT as (e: React.MouseEvent<HTMLElement>) => void;

    return (
      <SidebarCollapsedCtx.Provider value={sidebarCollapsed}>
      <div className="relative">
        {tooltip && <TooltipCard t={tooltip} />}

        {/* ── Sticky year header ──────────────────────────────────────────────── */}
        <div
          ref={headerRef}
          className={`sticky z-[30] border-b border-white/10 overflow-x-scroll [&::-webkit-scrollbar]:hidden ${isFullscreen ? 'top-0' : 'top-32'}`}
          style={{ scrollbarWidth: 'none', background: 'var(--usmc-bg-base)' }}
        >
          <div className="relative flex" style={{ minWidth: labelW + totalW }}>
            <div className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: labelW + todayX, width: 2, background: 'rgba(239,68,68,0.45)' }} />
            <div className={`flex-none sticky left-0 z-[30] border-r border-white/10 flex items-center overflow-hidden ${sidebarCollapsed ? 'justify-center' : 'px-2.5'}`}
              style={{ width: labelW, height: 56, background: 'var(--usmc-bg-base)', transition: 'width 200ms ease' }}>
              {sidebarCollapsed ? (
                <Rows className="w-3.5 h-3.5 text-white/30" />
              ) : (
                <span className="text-[8px] font-mono tracking-[0.2em] text-white/25 uppercase"
                  style={{ opacity: 1, transition: 'opacity 120ms ease' }}>Timeline</span>
              )}
            </div>
            {years.map(y => {
              const isRealToday = y === realToday.getFullYear();
              return (
                <div key={y} onClick={() => onZoomedYearChange?.(y)}
                  className={`flex-none border-r border-white/[0.06] cursor-pointer group transition-colors hover:bg-white/[0.04] relative ${isRealToday ? 'bg-white/[0.025]' : ''}`}
                  style={{ width: yw, height: 56 }}>
                  {/* Year number — always pinned to the true vertical center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`relative text-[12px] font-mono font-bold tracking-wider select-none ${isRealToday ? 'text-white/85' : 'text-white/35'}`}>
                      {y}
                      <MagnifyingGlassPlus className="absolute top-1/2 -translate-y-1/2 left-full ml-0.5 w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </span>
                  </div>
                  {/* TODAY badge — anchored to bottom, independent of year position */}
                  {isRealToday && (
                    <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
                      <span className="bg-red-600 text-white text-[9px] font-mono font-black tracking-widest px-1.5 py-0.5">TODAY</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main scroll container ───────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="overflow-x-auto"
          onScroll={handleScroll}
          style={{ background: 'var(--usmc-bg-base)', cursor: isPanning ? 'grabbing' : 'grab' }}
          onMouseDown={e => {
            if (e.button !== 0 || isDraggingLine) return;
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'BUTTON' || tag === 'INPUT' || (e.target as HTMLElement).closest('button,input,[draggable="true"]')) return;
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

            {/* Present-date line + drag handle */}
            <div className="absolute top-0 bottom-0 pointer-events-none z-[5]"
              style={{ left: labelW + todayX, width: 2, background: 'rgba(239,68,68,0.85)' }} />
            <div className="absolute top-0 bottom-0 z-[6]"
              style={{ left: labelW + todayX - 8, width: 18, cursor: 'ew-resize' }}
              onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingLine(true); }}>
              {isDraggingLine && (
                <div className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-mono font-bold text-white tracking-wider pointer-events-none select-none"
                  style={{ top: 6, background: '#ef4444', whiteSpace: 'nowrap' }}>
                  {today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </div>
              )}
            </div>

            {/* Age row */}
            <div className="flex h-8 border-b border-white/[0.06]">
              <SmallLabel text="AGE" icon={<User className="w-3 h-3" />} />
              <div className="flex">
                {years.map(y => {
                  const dobMonth = profile.dob.getMonth();
                  const ageNew = y - profile.dob.getFullYear();
                  const ageOld = ageNew - 1;
                  const splitX = Math.round((dobMonth / 12) * yw);
                  const showOld = splitX > 0 && ageOld >= 0;
                  return (
                    <div key={y} className="flex-none relative border-r border-white/[0.04]" style={{ width: yw }}>
                      {showOld && (
                        <div className="absolute inset-y-0 flex items-center justify-center text-[10px] font-mono text-white/25"
                          style={{ left: 0, width: splitX }}>
                          {ageOld}
                        </div>
                      )}
                      {showOld && (
                        <div className="absolute" style={{ left: splitX, top: '25%', bottom: '25%', width: 1, background: 'rgba(255,255,255,0.12)' }} />
                      )}
                      <div className="absolute inset-y-0 flex items-center justify-center text-[11px] font-mono text-white/50"
                        style={{ left: showOld ? splitX + 1 : 0, right: 0 }}>
                        {ageNew}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time in Service row */}
            <div className="flex h-8 border-b border-white/10">
              <SmallLabel text="TIME IN SVC" icon={<Timer className="w-3 h-3" />} />
              <div className="flex">
                {years.map(y => {
                  const enlistMonth = profile.enlistmentDate.getMonth();
                  const tisNew = y - profile.enlistmentDate.getFullYear();
                  const tisOld = tisNew - 1;
                  const splitX = Math.round((enlistMonth / 12) * yw);
                  const showOld = splitX > 0 && tisOld >= 1;
                  const showNew = tisNew >= 1;
                  if (!showOld && !showNew) {
                    return <div key={y} className="flex-none border-r border-white/[0.04]" style={{ width: yw }} />;
                  }
                  return (
                    <div key={y} className="flex-none relative border-r border-white/[0.04]" style={{ width: yw }}>
                      {showOld && (
                        <div className="absolute flex items-center justify-center text-[9px] font-mono text-white/30"
                          style={{ left: 2, top: 2, bottom: 2, width: splitX - 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          {tisOld}
                        </div>
                      )}
                      {showNew && (
                        <div className="absolute flex items-center justify-center text-[10px] font-mono font-bold text-white/55"
                          style={{ left: showOld ? splitX + 1 : 2, top: 2, bottom: 2, right: 2, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                          {tisNew}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══ CAREER ═══════════════════════════════════════════════════════ */}
            <div className="flex border-t border-white/10">
              <SectionGutter label="CAREER" />
              <div className="flex-1 min-w-0">
                <CareerSection
                  milestones={milestones} yw={yw}
                  showTT={showTTEl} moveTT={moveTTEl} hideTT={hideTT}
                  onAddMilestone={onAddMilestone}
                  onDeleteMilestone={onDeleteMilestone}
                  onEditMilestone={onEditMilestone}
                />
              </div>
            </div>

            {/* ═══ SERVICE ══════════════════════════════════════════════════════ */}
            <div className="flex border-t border-white/10">
              <SectionGutter label="SERVICE" />
              <div className="flex-1 min-w-0">
                <ServiceSection
                  dutyStations={dutyStations} promotions={promotions} yw={yw} today={today}
                  showTT={showTTEl} moveTT={moveTTEl} hideTT={hideTT}
                  onAddDutyStation={onAddDutyStation} onAddPromotion={onAddPromotion}
                  onDeleteDutyStation={onDeleteDutyStation} onDeletePromotion={onDeletePromotion}
                  onEditDutyStation={onEditDutyStation} onEditPromotion={onEditPromotion}
                />
              </div>
            </div>

            {/* ═══ EDUCATION ════════════════════════════════════════════════════ */}
            <div className="flex border-t border-white/10">
              <SectionGutter label="EDUCATION" />
              <div className="flex-1 min-w-0">
                <EducationSection
                  education={education} yw={yw}
                  showTT={showTTEl} moveTT={moveTTEl} hideTT={hideTT}
                  onAddEducation={onAddEducation}
                  onDeleteEducation={onDeleteEducation}
                  onEditEducation={onEditEducation}
                />
              </div>
            </div>

            {/* ═══ FAMILY ═══════════════════════════════════════════════════════ */}
            <div className="flex border-t border-white/10">
              <SectionGutter label="FAMILY" />
              <div className="flex-1 min-w-0">
                <FamilySection
                  spouse={spouse} children={children} yw={yw}
                  showTT={showTTEl} moveTT={moveTTEl} hideTT={hideTT}
                  onAddSpouse={onAddSpouse} onAddChild={onAddChild}
                  onDeleteChild={onDeleteChild}
                  onEditChild={onEditChild}
                  onReorderChildren={onReorderChildren}
                />
              </div>
            </div>

            {/* ═══ FINANCIAL ════════════════════════════════════════════════════ */}
            <div className="flex border-t border-white/10">
              <SectionGutter label="FINANCIAL" />
              <div className="flex-1 min-w-0">
                <FinancialSection
                  financialGoals={financialGoals} yw={yw}
                  showTT={showTTEl} moveTT={moveTTEl} hideTT={hideTT}
                  onAddFinancialGoal={onAddFinancialGoal}
                  onDeleteFinancialGoal={onDeleteFinancialGoal}
                  onEditFinancialGoal={onEditFinancialGoal}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right-edge fade */}
        {!atScrollEnd && (
          <div className="absolute top-0 right-0 bottom-0 w-20 pointer-events-none z-[8]"
            style={{ background: 'linear-gradient(to right, transparent, var(--usmc-bg-page))' }} />
        )}
      </div>
      </SidebarCollapsedCtx.Provider>
    );
  }
);

TimelineGrid.displayName = 'TimelineGrid';
