import { useState, useEffect } from 'react';
import { X, CaretLeft, Check } from '@phosphor-icons/react';
import type { Child, SchoolPhase } from '../types';

interface Props {
  existing?: Child;
  onSave: (c: Child) => void;
  onClose: () => void;
  onBackToEvents?: () => void;
}

const COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80',
  '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const inputCls = 'w-full h-9 px-3 bg-black border border-white/15 text-[11px] font-mono text-white/80 focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-white/20';

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromInputDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// US Sept 1 cutoff: born Jan–Aug → K at age 5; born Sept–Dec → K at age 6
function kindergartenStartYear(dob: Date): number {
  return dob.getFullYear() + (dob.getMonth() < 8 ? 5 : 6);
}

function generateSchoolPhases(kYear: number, endMonth = 5): SchoolPhase[] {
  const eom = endMonth + 1; // exclusive: first day of the month after school ends
  return [
    { phase: 'prek',       label: 'Pre-K',       startDate: new Date(kYear - 1, 8, 1), endDate: new Date(kYear,      eom, 1) },
    { phase: 'elementary', label: 'Elementary',  startDate: new Date(kYear,     8, 1), endDate: new Date(kYear + 6,  eom, 1) },
    { phase: 'middle',     label: 'Middle',      startDate: new Date(kYear + 6, 8, 1), endDate: new Date(kYear + 9,  eom, 1) },
    { phase: 'high',       label: 'High School', startDate: new Date(kYear + 9, 8, 1), endDate: new Date(kYear + 13, eom, 1) },
  ];
}

// Derive the K start year from stored school phases (elementary start year)
function kYearFromPhases(phases: SchoolPhase[]): number | null {
  const elem = phases.find(sp => sp.phase === 'elementary');
  return elem ? elem.startDate.getFullYear() : null;
}

export function AddChildModal({ existing, onSave, onClose, onBackToEvents }: Props) {
  const isEditing = !!existing;
  const [mode, setMode]               = useState<'born' | 'planned'>(existing?.isPlanned ? 'planned' : 'born');
  const [name, setName]               = useState(existing && !existing.isPlanned ? (existing.name ?? '') : '');
  const [dob, setDob]                 = useState(existing && !existing.isPlanned ? toInputDate(existing.dob) : '');
  const [plannedName, setPlannedName] = useState(existing?.isPlanned ? (existing.name ?? '') : '');
  const [plannedYear, setPlannedYear] = useState(
    existing?.isPlanned ? String(existing.plannedYear ?? new Date().getFullYear() + 1) : String(new Date().getFullYear() + 1)
  );
  const [plannedMonth, setPlannedMonth] = useState(existing?.isPlanned ? existing.dob.getMonth() : 5);
  const [color, setColor]               = useState(existing?.color ?? COLORS[0]);
  const [autoSchool, setAutoSchool]     = useState(true);
  const [showProjectedSchool, setShowProjectedSchool] = useState(
    existing?.isPlanned ? (existing.schoolPhases?.length ?? 0) > 0 : false
  );

  const [schoolYearEndMonth, setSchoolYearEndMonth] = useState<number>(existing?.schoolYearEndMonth ?? 5);
  const [schoolYearEndDay,   setSchoolYearEndDay]   = useState<number>(existing?.schoolYearEndDay ?? 15);

  // K start year — auto-calculated from DOB, user-adjustable with +/-
  const [kStartYear, setKStartYear] = useState<number>(() => {
    if (existing?.schoolPhases?.length) {
      const fromStored = kYearFromPhases(existing.schoolPhases);
      if (fromStored) return fromStored;
    }
    if (existing) return kindergartenStartYear(existing.dob);
    return new Date().getFullYear() + 5;
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  function handleDobChange(val: string) {
    setDob(val);
    if (!isEditing) {
      const d = fromInputDate(val);
      if (d) setKStartYear(kindergartenStartYear(d));
    }
  }

  function handlePlannedYearChange(val: string) {
    setPlannedYear(val);
    if (!isEditing) {
      const py = Number(val);
      if (py > 2000) setKStartYear(kindergartenStartYear(new Date(py, plannedMonth, 1)));
    }
  }

  function handlePlannedMonthChange(m: number) {
    setPlannedMonth(m);
    if (!isEditing) {
      const py = Number(plannedYear);
      if (py > 2000) setKStartYear(kindergartenStartYear(new Date(py, m, 1)));
    }
  }

  // Effective DOB for K start year calculation — works for both modes
  const previewDob = mode === 'born'
    ? fromInputDate(dob)
    : (Number(plannedYear) > 2000 ? new Date(Number(plannedYear), plannedMonth, 1) : null);

  const showSchoolSection = mode === 'born' ? (autoSchool && !!dob) : (showProjectedSchool && !!previewDob);
  const schoolPreview = previewDob && showSchoolSection ? generateSchoolPhases(kStartYear, schoolYearEndMonth) : [];
  const autoKYear = previewDob ? kindergartenStartYear(previewDob) : null;
  const kYearIsOverridden = autoKYear !== null && kStartYear !== autoKYear;

  const canSave = mode === 'born' ? (name.trim() && dob) : (Number(plannedYear) > 2000);

  function handleSave() {
    if (mode === 'born') {
      const dobDate = fromInputDate(dob);
      if (!dobDate || !name.trim()) return;
      const schoolPhases: SchoolPhase[] = autoSchool
        ? generateSchoolPhases(kStartYear, schoolYearEndMonth)
        : (existing?.schoolPhases ?? []);
      onSave({
        id: existing?.id ?? `child-${Date.now()}`,
        name: name.trim(),
        dob: dobDate,
        color,
        schoolPhases,
        schoolYearEndMonth: autoSchool ? schoolYearEndMonth : (existing?.schoolYearEndMonth ?? 5),
        schoolYearEndDay:   autoSchool ? schoolYearEndDay   : (existing?.schoolYearEndDay   ?? 15),
        isPlanned: false,
      });
    } else {
      const py = Number(plannedYear);
      const estDob = new Date(py, plannedMonth, 1);
      const schoolPhases: SchoolPhase[] = showProjectedSchool
        ? generateSchoolPhases(kStartYear, schoolYearEndMonth)
        : [];
      onSave({
        id: existing?.id ?? `child-planned-${Date.now()}`,
        name: plannedName.trim(),
        dob: estDob,
        color,
        schoolPhases,
        schoolYearEndMonth: showProjectedSchool ? schoolYearEndMonth : undefined,
        schoolYearEndDay:   showProjectedSchool ? schoolYearEndDay   : undefined,
        isPlanned: true,
        plannedYear: py,
      });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg border border-white/15 flex flex-col max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-none">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Family</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              {isEditing ? 'EDIT CHILD' : 'ADD CHILD'}<span className="text-red-600">.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onBackToEvents && (
              <button onClick={onBackToEvents}
                className="h-8 px-3 flex items-center gap-1.5 border border-white/15 text-[9px] font-mono font-bold tracking-widest text-white/40 hover:text-white/75 hover:border-white/30 transition-colors">
                <CaretLeft weight="bold" className="w-3 h-3" />
                EVENT TYPES
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-white/15 text-white/40 hover:text-white/80 transition-colors">
              <X weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">

          {/* Born / Planned toggle */}
          <div className="flex gap-2">
            <button onClick={() => setMode('born')}
              className={`flex-1 h-9 text-[10px] font-mono font-bold tracking-widest border transition-colors ${mode === 'born' ? 'border-white/40 text-white/90 bg-white/[0.07]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
              BORN / EXISTING
            </button>
            <button onClick={() => setMode('planned')}
              className={`flex-1 h-9 text-[10px] font-mono font-bold tracking-widest border transition-colors ${mode === 'planned' ? 'border-white/40 text-white/90 bg-white/[0.07]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
              PLANNED
            </button>
          </div>

          {mode === 'born' ? (
            <>
              <div>
                <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Name</label>
                <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="First name" />
              </div>
              <div>
                <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Date of Birth</label>
                <input type="date" className={inputCls} value={dob} onChange={e => handleDobChange(e.target.value)} style={{ colorScheme: 'dark' }} />
              </div>

              {/* Auto school phases toggle */}
              <button onClick={() => setAutoSchool(v => !v)}
                className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.07] hover:border-white/15 transition-colors text-left">
                <div className={`w-4 h-4 border flex items-center justify-center flex-none ${autoSchool ? 'border-red-600 bg-red-600' : 'border-white/20'}`}>
                  {autoSchool && <Check weight="bold" className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white/70">Auto-generate school phases</div>
                  <div className="text-[9px] font-mono text-white/30">Pre-K through High School calculated from DOB</div>
                </div>
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">
                  Name <span className="text-white/20">(optional)</span>
                </label>
                <input className={inputCls} value={plannedName} onChange={e => setPlannedName(e.target.value)} placeholder="e.g. Baby Smith" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Planned Year</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={plannedYear}
                    min={2024} max={2045}
                    onChange={e => handlePlannedYearChange(e.target.value)}
                    placeholder="e.g. 2027"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Birth Month</label>
                  <div className="grid grid-cols-6 gap-1">
                    {MONTHS.map((m, i) => (
                      <button key={m} onClick={() => handlePlannedMonthChange(i)}
                        className={`h-7 text-[8px] font-mono border transition-colors ${plannedMonth === i ? 'border-white/40 text-white/90 bg-white/[0.07]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Show projected schools toggle */}
              <button onClick={() => setShowProjectedSchool(v => !v)}
                className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.07] hover:border-white/15 transition-colors text-left">
                <div className={`w-4 h-4 border flex items-center justify-center flex-none ${showProjectedSchool ? 'border-red-600 bg-red-600' : 'border-white/20'}`}>
                  {showProjectedSchool && <Check weight="bold" className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white/70">Show projected school phases</div>
                  <div className="text-[9px] font-mono text-white/30">Pre-K through High School estimated from planned date</div>
                </div>
              </button>

              <div className="text-[9px] font-mono text-white/20 -mt-1">
                Shows as a placeholder on the timeline. Update to born child later.
              </div>
            </>
          )}

          {/* K start year adjuster + school year end month — shown for both modes when school is enabled */}
          {showSchoolSection && (
            <div className="px-3 py-3 border border-white/[0.07] flex flex-col gap-3" style={{ background: 'var(--usmc-bg-elevated)' }}>
              {/* K start year */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase">Kindergarten Start</div>
                    <div className="text-[9px] font-mono text-white/20 mt-0.5">
                      Adjust if held back, early enrollment, or non-US cutoff
                    </div>
                  </div>
                  {kYearIsOverridden && (
                    <button
                      onClick={() => autoKYear && setKStartYear(autoKYear)}
                      className="text-[8px] font-mono text-red-400/70 hover:text-red-400 tracking-widest transition-colors">
                      RESET
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setKStartYear(y => y - 1)}
                    className="w-7 h-7 border border-white/15 flex items-center justify-center text-white/50 hover:text-white/80 hover:border-white/30 transition-colors text-[14px] font-mono leading-none">
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-[15px] font-mono font-black text-white/90">Fall {kStartYear}</div>
                    <div className="text-[9px] font-mono text-white/30">
                      {kYearIsOverridden ? `auto: Fall ${autoKYear}` : 'Sept 1 cutoff'}
                    </div>
                  </div>
                  <button
                    onClick={() => setKStartYear(y => y + 1)}
                    className="w-7 h-7 border border-white/15 flex items-center justify-center text-white/50 hover:text-white/80 hover:border-white/30 transition-colors text-[14px] font-mono leading-none">
                    +
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.07]" />

              {/* School year end month + day */}
              <div>
                <div className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-2">School Year Ends</div>
                <div className="flex items-center gap-2">
                  {/* Month toggle */}
                  <div className="flex border border-white/15">
                    {([4, 5] as const).map((m, i) => {
                      const isActive = schoolYearEndMonth === m;
                      return (
                        <button key={m} onClick={() => setSchoolYearEndMonth(m)}
                          className={`w-14 h-8 text-[10px] font-mono font-bold tracking-wider transition-colors ${i > 0 ? 'border-l border-white/15' : ''} ${isActive ? 'bg-white/[0.08] text-white/80' : 'text-white/30 hover:text-white/55 hover:bg-white/[0.03]'}`}>
                          {MONTHS[m].toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                  {/* Day input */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-white/25">DAY</span>
                    <input
                      type="number" min={1} max={31}
                      value={schoolYearEndDay}
                      onChange={e => {
                        const v = Math.max(1, Math.min(31, Number(e.target.value) || 1));
                        setSchoolYearEndDay(v);
                      }}
                      className="w-14 h-8 px-2 bg-black border border-white/15 text-[11px] font-mono text-white/80 text-center focus:outline-none focus:border-red-600/60 transition-colors"
                                         />
                  </div>
                  {/* Preview label */}
                  <span className="text-[10px] font-mono text-white/30">
                    {MONTHS[schoolYearEndMonth]} {schoolYearEndDay}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* School phase preview */}
          {schoolPreview.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-[9px] font-mono tracking-widest text-white/25 uppercase">
                School Phases {mode === 'planned' ? 'Preview (Projected)' : 'Preview'}
              </div>
              {schoolPreview.map(sp => (
                <div key={sp.phase} className="flex items-center gap-2 px-3 py-1.5 border border-white/[0.06]" style={{ background: 'var(--usmc-bg-elevated)' }}>
                  <div className="text-[10px] font-mono font-bold text-white/60 w-24 flex-none">{sp.label}</div>
                  <div className="text-[9px] font-mono text-white/30">
                    {sp.startDate.getFullYear()} – {sp.endDate.getFullYear()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Color picker */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-7 h-7 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: c, border: color === c ? `2px solid white` : '2px solid transparent' }}>
                  {color === c && <Check weight="bold" className="w-3.5 h-3.5 text-black" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10 flex-none">
          <button onClick={onClose} className="h-9 px-5 border border-white/15 text-[10px] font-mono font-bold tracking-widest text-white/45 hover:text-white/70 hover:border-white/30 transition-colors">
            CANCEL
          </button>
          <button onClick={handleSave} disabled={!canSave}
            className="h-9 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-700 text-white text-[10px] font-mono font-black tracking-widest transition-colors">
            {isEditing ? 'SAVE CHANGES' : 'ADD TO TIMELINE'}
          </button>
        </div>
      </div>
    </div>
  );
}
