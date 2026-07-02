import { useState, useEffect } from 'react';
import { X, CaretLeft } from '@phosphor-icons/react';
import type { EducationEvent } from '../types';

interface Props {
  existing?: EducationEvent;
  onSave: (e: EducationEvent) => void;
  onClose: () => void;
  onDelete?: () => void;
  onBackToEvents?: () => void;
}

const SUGGESTIONS = [
  'Corporals Course',
  'Sergeants Course',
  'Staff NCO Academy',
  'SNCOa – Advanced Course',
  'Command and Staff College',
  'Joint Professional Military Education (JPME)',
  'Tuition Assistance – Bachelor\'s Degree',
  'Tuition Assistance – Master\'s Degree',
  'Marine Corps University – EWS',
  'Military Police School',
  'Scout Sniper Basic Course',
  'Reconnaissance Training Course',
  'Marine Combat Training (MCT)',
  'SOI – Infantry Training Battalion',
  'SERE School',
  'Airborne School',
  'Jump School',
  'Defense Language Institute',
];

const inputCls = 'w-full h-9 px-3 bg-black border border-white/15 text-[11px] font-mono text-white/80 focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-white/20';

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromInputDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function durationLabel(s: string, e: string): string {
  const start = fromInputDate(s);
  const end = fromInputDate(e);
  if (!start || !end || end <= start) return '';
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.join(' ') || '< 1 mo';
}

export function AddEducationModal({ existing, onSave, onClose, onDelete, onBackToEvents }: Props) {
  const isEditing = !!existing;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const today = new Date(2026, 5, 6);
  const [label, setLabel]         = useState(existing?.label ?? '');
  const [startDate, setStartDate] = useState(existing ? toInputDate(existing.startDate) : toInputDate(today));
  const [endDate, setEndDate]     = useState(existing ? toInputDate(existing.endDate) : '');
  const [isProjected, setIsProjected] = useState(existing?.isProjected ?? false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const canSave = label.trim() && startDate && endDate;
  const dur = durationLabel(startDate, endDate);

  const filtered = label.length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(label.toLowerCase()))
    : SUGGESTIONS;

  function handleSave() {
    const s = fromInputDate(startDate);
    const e = fromInputDate(endDate);
    if (!s || !e || !label.trim()) return;
    onSave({ id: existing?.id ?? `edu-${Date.now()}`, label: label.trim(), startDate: s, endDate: e, isProjected });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center sm:justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto border border-b-0 sm:border-b border-white/15 flex flex-col"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Education</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              {isEditing ? 'EDIT EDUCATION / TRAINING' : 'ADD EDUCATION / TRAINING'}<span className="text-red-600">.</span>
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

          {/* Confirmed / Projected */}
          <div className="flex gap-2">
            <button onClick={() => setIsProjected(false)}
              className={`flex-1 h-9 text-[10px] font-mono font-bold tracking-widest border transition-colors ${!isProjected ? 'border-white/40 text-white/90 bg-white/[0.07]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
              COMPLETED / IN PROGRESS
            </button>
            <button onClick={() => setIsProjected(true)}
              className={`flex-1 h-9 text-[10px] font-mono font-bold tracking-widest border transition-colors ${isProjected ? 'border-white/40 text-white/90 bg-white/[0.07]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
              PROJECTED
            </button>
          </div>

          {/* Label with suggestions */}
          <div className="relative">
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Course / Program Name</label>
            <input
              className={inputCls}
              value={label}
              onChange={e => { setLabel(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Corporals Course, Tuition Assistance – BCU"
            />
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute z-10 left-0 right-0 top-full mt-1 border border-white/15 max-h-40 overflow-y-auto"
                style={{ background: '#09090c' }}>
                {filtered.slice(0, 8).map(s => (
                  <button key={s} onMouseDown={() => { setLabel(s); setShowSuggestions(false); }}
                    className="w-full text-left px-3 py-2 text-[10px] font-mono text-white/60 hover:bg-white/[0.05] hover:text-white/90 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Start Date</label>
              <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">End Date</label>
              <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Preview */}
          {label && startDate && endDate && (
            <div className="px-3 py-2.5 border flex items-center gap-4"
              style={{ background: 'rgba(37,99,235,0.12)', borderColor: 'rgba(59,130,246,0.35)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-bold text-blue-300/90 truncate">{label}</div>
                <div className="text-[9px] font-mono text-white/30">
                  {fromInputDate(startDate)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()} – {fromInputDate(endDate)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                  {dur && ` · ${dur.toUpperCase()}`}
                </div>
              </div>
              {isProjected && <span className="text-[8px] font-mono tracking-widest border border-blue-400/25 px-1.5 py-0.5 text-blue-400/50 flex-none">PROJ</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
          {isEditing && onDelete ? (
            !confirmDelete ? (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="h-9 px-4 border border-red-600/30 text-[10px] font-mono font-bold tracking-widest text-red-500/60 hover:text-red-400 hover:border-red-500/50 transition-colors">
                DELETE
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { onDelete(); onClose(); }}
                  className="h-9 px-4 bg-red-900/40 border border-red-600/50 text-red-400 text-[10px] font-mono font-bold tracking-widest hover:bg-red-900/60 transition-colors">
                  CONFIRM
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="h-9 px-3 border border-white/15 text-white/40 text-[10px] font-mono tracking-widest hover:text-white/70 transition-colors">
                  ✕
                </button>
              </div>
            )
          ) : <div />}
          <div className="flex gap-3">
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
    </div>
  );
}
