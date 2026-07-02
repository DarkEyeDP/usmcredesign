import { useState, useEffect } from 'react';
import { X, CaretLeft, Check } from '@phosphor-icons/react';
import type { Spouse } from '../types';

interface Props {
  existing: Spouse | null;
  onSave: (s: Spouse) => void;
  onRemove: () => void;
  onClose: () => void;
  onBackToEvents?: () => void;
}

const COLORS = [
  '#f472b6', '#f87171', '#fb923c', '#facc15',
  '#4ade80', '#60a5fa', '#a78bfa', '#2dd4bf',
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

export function AddSpouseModal({ existing, onSave, onRemove, onClose, onBackToEvents }: Props) {
  const [name, setName]                   = useState(existing?.name ?? '');
  const [dob, setDob]                     = useState(existing?.dob ? toInputDate(existing.dob) : '');
  const [marriageDate, setMarriageDate]   = useState(existing?.marriageDate ? toInputDate(existing.marriageDate) : '');
  const [color, setColor]                 = useState(existing?.color ?? COLORS[0]);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const canSave = name.trim() && marriageDate;

  function handleSave() {
    const md = fromInputDate(marriageDate);
    if (!md || !name.trim()) return;
    onSave({
      name: name.trim(),
      dob: dob ? (fromInputDate(dob) ?? new Date(1990, 0, 1)) : new Date(1990, 0, 1),
      marriageDate: md,
      color,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center sm:justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto border border-b-0 sm:border-b border-white/15 flex flex-col"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Family</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              {existing ? 'EDIT SPOUSE' : 'ADD SPOUSE'}<span className="text-red-600">.</span>
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
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Name</label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">
                Date of Birth <span className="text-white/20">(optional)</span>
              </label>
              <input type="date" className={inputCls} value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Marriage Date</label>
              <input type="date" className={inputCls} value={marriageDate} onChange={e => setMarriageDate(e.target.value)} />
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-2">Timeline Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-7 h-7 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: c, border: color === c ? '2px solid white' : '2px solid transparent' }}>
                  {color === c && <Check weight="bold" className="w-3.5 h-3.5 text-black" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {name && marriageDate && (
            <div className="px-3 py-2.5 border flex items-center gap-4"
              style={{ background: `${color}14`, borderColor: `${color}40` }}>
              <div className="w-2 h-2 rounded-full flex-none" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-bold" style={{ color: `${color}cc` }}>{name.toUpperCase()}</div>
                <div className="text-[9px] font-mono text-white/30">
                  MARRIED {fromInputDate(marriageDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </div>
                {dob && (
                  <div className="text-[9px] font-mono text-white/25">
                    DOB {fromInputDate(dob)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remove */}
          {existing && (
            <div className="border-t border-white/10 pt-3">
              {!confirmRemove ? (
                <button onClick={() => setConfirmRemove(true)}
                  className="text-[9px] font-mono tracking-widest text-red-700 hover:text-red-500 transition-colors">
                  REMOVE SPOUSE FROM TIMELINE
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-red-400/80">Are you sure?</span>
                  <button onClick={() => { onRemove(); onClose(); }}
                    className="h-7 px-3 bg-red-900/40 border border-red-600/40 text-red-400 text-[9px] font-mono font-bold tracking-widest hover:bg-red-900/70 transition-colors">
                    YES, REMOVE
                  </button>
                  <button onClick={() => setConfirmRemove(false)}
                    className="h-7 px-3 border border-white/15 text-white/40 text-[9px] font-mono tracking-widest hover:text-white/70 transition-colors">
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10">
          <button onClick={onClose} className="h-9 px-5 border border-white/15 text-[10px] font-mono font-bold tracking-widest text-white/45 hover:text-white/70 hover:border-white/30 transition-colors">
            CANCEL
          </button>
          <button onClick={handleSave} disabled={!canSave}
            className="h-9 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-700 text-white text-[10px] font-mono font-black tracking-widest transition-colors">
            {existing ? 'SAVE CHANGES' : 'ADD TO TIMELINE'}
          </button>
        </div>
      </div>
    </div>
  );
}
