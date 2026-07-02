import { useState, useContext } from 'react';
import { Heart, Users, GraduationCap, Plus, DotsSixVertical } from '@phosphor-icons/react';
import { useTheme } from '@/app/features/theme/ThemeContext';
import type { Spouse, Child } from '../../../types';
import {
  LABEL_W, LABEL_W_COLLAPSED, GUTTER_W, years,
  dateToX, fmtDate,
  ttChild, ttSchool,
  SCHOOL_STYLE, SCHOOL_STYLE_DESERT, getSchoolGradeBlocks,
  type TooltipState,
} from '../timelineUtils';
import { SectionLabel, GridLines, SidebarCollapsedCtx } from '../TimelineAtoms';

interface Props {
  spouse: Spouse | null;
  children: Child[];
  yw: number;
  showTT: (e: React.MouseEvent<HTMLElement>, content: Omit<TooltipState, 'x'|'y'>) => void;
  moveTT: (e: React.MouseEvent<HTMLElement>) => void;
  hideTT: () => void;
  onAddSpouse?: () => void;
  onAddChild?: () => void;
  onDeleteChild?: (id: string) => void;
  onEditChild?: (c: Child) => void;
  onReorderChildren?: (ids: string[]) => void;
}

export function FamilySection({
  spouse, children, yw,
  showTT, moveTT, hideTT,
  onAddSpouse, onAddChild, onDeleteChild, onEditChild, onReorderChildren,
}: Props) {
  const totalW = years.length * yw;
  const realChildren = children.filter(c => !c.isPlanned);
  const plannedChild = children.find(c => c.isPlanned);
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const schoolStyle = isDesert ? SCHOOL_STYLE_DESERT : SCHOOL_STYLE;
  const collapsed = useContext(SidebarCollapsedCtx);
  const subLabelW = collapsed ? LABEL_W_COLLAPSED : LABEL_W - GUTTER_W;

  const [dragChildId, setDragChildId]       = useState<string | null>(null);
  const [dropTargetId, setDropTargetId]     = useState<string | null>(null);
  const [dropAbove, setDropAbove]           = useState(false);
  const [hoveredChildId, setHoveredChildId] = useState<string | null>(null);

  return (
    <>
      {/* Spouse */}
      <div className="flex border-b border-white/10" style={{ minHeight: 36 }}>
        <SectionLabel icon={<Heart className="w-3.5 h-3.5" />} lower="SPOUSE" onAdd={onAddSpouse} />
        <div className="relative flex-1" style={{ width: totalW, minHeight: 36 }}>
          <GridLines yw={yw} />
          {spouse ? (() => {
            const sc = spouse.color ?? '#f472b6';
            return (
              <>
                <div className="absolute top-1 bottom-1 pointer-events-none"
                  style={{ left: dateToX(spouse.marriageDate, yw) + 1, right: 2, background: `${sc}14`, border: `1px solid ${sc}33` }} />
                <div className="absolute top-1 bottom-1 pointer-events-none"
                  style={{ left: dateToX(spouse.marriageDate, yw), width: 1, background: `${sc}80` }} />
                <div className="absolute top-0 bottom-0 flex items-center pointer-events-none"
                  style={{ left: dateToX(spouse.marriageDate, yw) + 5 }}>
                  <span className="text-[9px] font-mono font-bold whitespace-nowrap" style={{ color: isDesert ? `${sc}cc` : `${sc}80` }}>
                    {spouse.name.split(' ')[0].toUpperCase()}
                  </span>
                </div>
                <div className="absolute inset-0 cursor-pointer" onClick={onAddSpouse} />
                {years.map(y => {
                  if (y < spouse.marriageDate.getFullYear()) return null;
                  const dobMonth = spouse.dob.getMonth();
                  const ageNew = y - spouse.dob.getFullYear();
                  const ageOld = ageNew - 1;
                  const splitX = Math.round((dobMonth / 12) * yw);
                  const baseLeft = (y - years[0]) * yw;
                  const showOld = splitX > 0 && ageOld >= 0;
                  const showNew = ageNew >= 0;
                  if (!showOld && !showNew) return null;
                  return (
                    <div key={y} className="absolute h-full pointer-events-none" style={{ left: baseLeft, width: yw }}>
                      {showOld && (
                        <div className="absolute inset-y-0 flex items-center justify-center text-[9px] font-mono"
                          style={{ left: 0, width: splitX, color: isDesert ? `${sc}aa` : `${sc}66` }}>
                          {ageOld}
                        </div>
                      )}
                      {showOld && <div className="absolute" style={{ left: splitX, top: '25%', bottom: '25%', width: 1, background: `${sc}33` }} />}
                      {showNew && (
                        <div className="absolute inset-y-0 flex items-center justify-center text-[10px] font-mono"
                          style={{ left: showOld ? splitX + 1 : 0, right: 0, color: isDesert ? `${sc}ee` : `${sc}bf` }}>
                          {ageNew}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            );
          })() : (
            <div className="absolute inset-0 flex items-center" style={{ left: 12 }}>
              <span className="text-[9px] font-mono text-white/15 tracking-widest">— NOT ADDED —</span>
            </div>
          )}
        </div>
      </div>

      {/* Children label row */}
      <div className="flex border-b border-white/10" style={{ minHeight: 28 }}>
        <div className={`flex-none sticky z-[20] border-r border-white/10 flex items-center overflow-hidden ${collapsed ? 'justify-center' : 'gap-2 px-2.5'}`} style={{ left: GUTTER_W, width: subLabelW, background: 'var(--usmc-bg-base)', transition: 'width 200ms ease' }}>
          <span className="text-white/25 flex-none"><Users className="w-3.5 h-3.5" /></span>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-bold text-white/70 tracking-wider leading-tight">CHILDREN</div>
              </div>
              {onAddChild && (
                <button onClick={onAddChild}
                  className="flex-none w-5 h-5 border border-white/20 flex items-center justify-center text-white/35 hover:text-red-400 hover:border-red-600/50 transition-colors">
                  <Plus weight="bold" className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
        <div className="relative flex-1" style={{ width: totalW }}><GridLines yw={yw} /></div>
      </div>

      {realChildren.map(child => {
        const isDragging = dragChildId === child.id;
        const isDropTarget = dropTargetId === child.id;
        return (
          <div key={child.id} style={{ opacity: isDragging ? 0.35 : 1, transition: 'opacity 0.1s' }}>
            {/* Age row */}
            <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
              <div
                className={`flex-none sticky z-[20] border-r border-white/10 flex items-center overflow-hidden ${collapsed ? 'justify-center' : 'px-2 cursor-grab group transition-colors hover:bg-white/[0.03]'}`}
                style={{
                  left: GUTTER_W,
                  width: subLabelW,
                  background: 'var(--usmc-bg-base)',
                  transition: 'width 200ms ease',
                  borderTop: isDropTarget && dropAbove ? '2px solid rgba(239,68,68,0.7)' : undefined,
                  borderBottom: isDropTarget && !dropAbove ? '2px solid rgba(239,68,68,0.7)' : undefined,
                }}
                draggable={!collapsed && !!onReorderChildren}
                onMouseEnter={() => !collapsed && setHoveredChildId(child.id)}
                onMouseLeave={() => setHoveredChildId(null)}
                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragChildId(child.id); }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropAbove(e.clientY < rect.top + rect.height / 2);
                  setDropTargetId(child.id);
                }}
                onDragLeave={() => setDropTargetId(null)}
                onDrop={e => {
                  e.preventDefault();
                  if (!dragChildId || dragChildId === child.id) { setDragChildId(null); setDropTargetId(null); return; }
                  const ids = realChildren.map(c => c.id);
                  const filtered = ids.filter(id => id !== dragChildId);
                  const toIdx = filtered.indexOf(child.id);
                  const insertAt = dropAbove ? toIdx : toIdx + 1;
                  filtered.splice(insertAt, 0, dragChildId);
                  onReorderChildren?.(filtered);
                  setDragChildId(null);
                  setDropTargetId(null);
                }}
                onDragEnd={() => { setDragChildId(null); setDropTargetId(null); }}
                onClick={() => !collapsed && onEditChild?.(child)}
              >
                {collapsed ? (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: child.color + '80' }} />
                ) : (
                  <>
                    <DotsSixVertical weight="fill" className="w-3.5 h-3.5 text-white/15 group-hover:text-white/35 flex-none mr-1 transition-colors" />
                    <div className="w-1.5 h-1.5 rounded-full mr-2 flex-none" style={{ background: child.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono font-bold text-white/70 truncate">{child.name.toUpperCase()}</div>
                      <div className="text-[8px] font-mono text-white/30">BORN {fmtDate(child.dob)}</div>
                    </div>
                    {hoveredChildId === child.id && onDeleteChild && (
                      <button
                        onClick={e => { e.stopPropagation(); onDeleteChild(child.id); }}
                        title="REMOVE" className="flex-none w-4 h-4 border border-red-600/60 flex items-center justify-center text-red-400 hover:text-red-300 hover:border-red-500 transition-colors ml-1">
                        <span className="text-[14px] leading-none translate-y-px">×</span>
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="relative flex-1" style={{ width: totalW, minHeight: 36 }}>
                <GridLines yw={yw} />
                {years.map(y => {
                  const dobMonth = child.dob.getMonth();
                  const ageNew = y - child.dob.getFullYear();
                  const ageOld = ageNew - 1;
                  const splitX = Math.round((dobMonth / 12) * yw);
                  const showOld = splitX > 0 && ageOld >= 0 && ageOld <= 22;
                  const showNew = ageNew >= 0 && ageNew <= 22;
                  if (!showOld && !showNew) return null;
                  const baseLeft = (y - years[0]) * yw;
                  return (
                    <div key={y} className="absolute h-full"
                      style={{ left: baseLeft, width: yw }}
                      onMouseEnter={e => showTT(e as React.MouseEvent<HTMLElement>, ttChild(child, y))} onMouseLeave={hideTT}>
                      {showOld && (
                        <div className="absolute inset-y-0 flex items-center justify-center text-[9px] font-mono"
                          style={{ left: 0, width: splitX, color: child.color + (isDesert ? 'aa' : '55') }}>
                          {ageOld}
                        </div>
                      )}
                      {showOld && (
                        <div className="absolute" style={{ left: splitX, top: '25%', bottom: '25%', width: 1, background: child.color + '30' }} />
                      )}
                      {showNew && (
                        <div className="absolute inset-y-0 flex items-center justify-center text-[10px] font-mono"
                          style={{ left: showOld ? splitX + 1 : 0, right: 0, color: child.color + (isDesert ? 'dd' : 'aa') }}>
                          {ageNew}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* School row */}
            <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
              <div className={`flex-none sticky z-[20] border-r border-white/10 flex items-center overflow-hidden ${collapsed ? 'justify-center' : 'px-2.5 pl-5'}`} style={{ left: GUTTER_W, width: subLabelW, background: 'var(--usmc-bg-base)', transition: 'width 200ms ease' }}>
                <span className="text-white/20 flex-none"><GraduationCap className="w-3 h-3" /></span>
                {!collapsed && <span className="text-[9px] font-mono text-white/30 ml-1.5 tracking-wider">SCHOOLS</span>}
              </div>
              <div className="relative flex-1" style={{ width: totalW, minHeight: 36 }}>
                <GridLines yw={yw} />
                {child.schoolPhases.flatMap(sp => {
                  const st = schoolStyle[sp.phase];
                  return getSchoolGradeBlocks(sp, yw, child.schoolYearEndMonth, child.schoolYearEndDay).map(blk => (
                    <div key={`${sp.phase}-${blk.label}-${Math.round(blk.x)}`}
                      className="absolute top-1.5 flex items-center justify-center overflow-hidden cursor-default"
                      style={{ left: blk.x + 1, width: blk.w - 2, height: 26, background: st.bg, border: `1px solid ${st.border}` }}
                      onMouseEnter={e => showTT(e as React.MouseEvent<HTMLElement>, ttSchool(blk.label, child, sp.startDate, sp.endDate))}
                      onMouseMove={e => moveTT(e as React.MouseEvent<HTMLElement>)} onMouseLeave={hideTT}>
                      <span className="text-[9px] font-mono font-bold truncate px-0.5" style={{ color: st.text }}>{blk.label}</span>
                    </div>
                  ));
                })}
              </div>
            </div>
          </div>
        );
      })}

      {plannedChild && (
        <>
          {/* Planned child age row */}
          <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
            <div
              className={`flex-none sticky z-[20] border-r border-white/10 flex items-center overflow-hidden ${collapsed ? 'justify-center' : 'px-2 cursor-pointer hover:bg-white/[0.03] transition-colors'}`}
              style={{ left: GUTTER_W, width: subLabelW, background: 'var(--usmc-bg-base)', transition: 'width 200ms ease' }}
              onMouseEnter={() => !collapsed && setHoveredChildId(plannedChild.id)}
              onMouseLeave={() => setHoveredChildId(null)}
              onClick={() => !collapsed && onEditChild?.(plannedChild)}>
              {collapsed ? (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: plannedChild.color + '40' }} />
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full mr-2 flex-none" style={{ background: plannedChild.color + '60' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono font-bold text-white/40">
                      {plannedChild.name ? plannedChild.name.toUpperCase() : 'PLANNED CHILD'}
                    </div>
                    <div className="text-[8px] font-mono text-white/20">
                      {plannedChild.dob.toLocaleString('en-US', { month: 'short' }).toUpperCase()} {plannedChild.plannedYear ?? plannedChild.dob.getFullYear()}
                    </div>
                  </div>
                  {hoveredChildId === plannedChild.id && onDeleteChild && (
                    <button
                      title="REMOVE"
                      onClick={e => { e.stopPropagation(); onDeleteChild(plannedChild.id); }}
                      className="flex-none w-4 h-4 border border-red-600/60 flex items-center justify-center text-red-400 hover:text-red-300 hover:border-red-500 transition-colors ml-1">
                      <span className="text-[14px] leading-none translate-y-px">×</span>
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="relative flex-1" style={{ width: totalW, minHeight: 36 }}>
              <GridLines yw={yw} />
              {years.map(y => {
                if (y < (plannedChild.plannedYear ?? plannedChild.dob.getFullYear())) return null;
                const dobMonth = plannedChild.dob.getMonth();
                const ageNew = y - plannedChild.dob.getFullYear();
                const ageOld = ageNew - 1;
                const splitX = Math.round((dobMonth / 12) * yw);
                const showOld = splitX > 0 && ageOld >= 0 && ageOld <= 22;
                const showNew = ageNew >= 0 && ageNew <= 22;
                if (!showOld && !showNew) return null;
                const baseLeft = (y - years[0]) * yw;
                return (
                  <div key={y} className="absolute h-full" style={{ left: baseLeft, width: yw }}>
                    {showOld && (
                      <div className="absolute inset-y-0 flex items-center justify-center text-[9px] font-mono"
                        style={{ left: 0, width: splitX, color: plannedChild.color + (isDesert ? '77' : '33') }}>
                        {ageOld}
                      </div>
                    )}
                    {showOld && (
                      <div className="absolute" style={{ left: splitX, top: '25%', bottom: '25%', width: 1, background: plannedChild.color + '20' }} />
                    )}
                    {showNew && (
                      <div className="absolute inset-y-0 flex items-center justify-center text-[10px] font-mono"
                        style={{ left: showOld ? splitX + 1 : 0, right: 0, color: plannedChild.color + (isDesert ? 'aa' : '55') }}>
                        {ageNew}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="absolute top-1 bottom-1 pointer-events-none"
                style={{ left: dateToX(plannedChild.dob, yw), width: 1, borderLeft: `2px dashed ${plannedChild.color}40` }} />
            </div>
          </div>

          {/* Planned child school row */}
          {plannedChild.schoolPhases.length > 0 && (
            <div className="flex border-b border-white/[0.06]" style={{ minHeight: 36 }}>
              <div className={`flex-none sticky z-[20] border-r border-white/10 flex items-center overflow-hidden ${collapsed ? 'justify-center' : 'px-2.5 pl-5'}`}
                style={{ left: GUTTER_W, width: subLabelW, background: 'var(--usmc-bg-base)', transition: 'width 200ms ease' }}>
                <span className="text-white/15 flex-none"><GraduationCap className="w-3 h-3" /></span>
                {!collapsed && (
                  <>
                    <span className="text-[9px] font-mono text-white/20 ml-1.5 tracking-wider">SCHOOLS</span>
                    <span className="text-[7px] font-mono text-white/15 ml-1">(PROJ)</span>
                  </>
                )}
              </div>
              <div className="relative flex-1" style={{ width: totalW, minHeight: 36 }}>
                <GridLines yw={yw} />
                {plannedChild.schoolPhases.flatMap(sp => {
                  const st = schoolStyle[sp.phase];
                  return getSchoolGradeBlocks(sp, yw, plannedChild.schoolYearEndMonth, plannedChild.schoolYearEndDay).map(blk => (
                    <div key={`${sp.phase}-${blk.label}-${Math.round(blk.x)}`}
                      className="absolute top-1.5 flex items-center justify-center overflow-hidden cursor-default opacity-50"
                      style={{ left: blk.x + 1, width: blk.w - 2, height: 26, background: st.bg, border: `1px dashed ${st.border}` }}>
                      <span className="text-[9px] font-mono font-bold truncate px-0.5" style={{ color: st.text }}>{blk.label}</span>
                    </div>
                  ));
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
