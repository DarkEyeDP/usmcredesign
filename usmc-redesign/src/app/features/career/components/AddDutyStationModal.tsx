import { useState, useEffect } from 'react';
import { X, CaretLeft } from '@phosphor-icons/react';
import type { DutyStation } from '../types';

interface Props {
  existing?: DutyStation;
  onSave: (ds: DutyStation) => void;
  onClose: () => void;
  onBackToEvents?: () => void;
}

const USMC_BASES = [
  'MCB Camp Lejeune, NC',
  'MCB Camp Pendleton, CA',
  'MCAS Miramar, CA',
  'MCB Quantico, VA',
  'MCAS Cherry Point, NC',
  'MCAS New River, NC',
  'MCAS Beaufort, SC',
  'MCB Hawaii, HI',
  'MCAS Iwakuni, Japan',
  'MCB Butler, Okinawa',
  'MCAS Yuma, AZ',
  'MCRD Parris Island, SC',
  'MCRD San Diego, CA',
  'Henderson Hall, Washington DC',
  'MCB Barstow, CA',
  '29 Palms, CA',
  'MCB Blount Island, FL',
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

export function AddDutyStationModal({ existing, onSave, onClose, onBackToEvents }: Props) {
  const isEditing = !!existing;
  const today = new Date(2026, 5, 6);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [unit, setUnit]         = useState(existing?.unit ?? '');
  const [startDate, setStartDate] = useState(existing ? toInputDate(existing.startDate) : toInputDate(today));
  const [endDate, setEndDate]   = useState(existing ? toInputDate(existing.endDate) : '');
  const [isPotential, setIsPotential] = useState(existing?.isPotential ?? false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const canSave = location.trim() && startDate && endDate;
  const dur = durationLabel(startDate, endDate);

  function handleSave() {
    const s = fromInputDate(startDate);
    const e = fromInputDate(endDate);
    if (!s || !e || !location.trim()) return;
    onSave({
      id: existing?.id ?? `ds-${Date.now()}`,
      location: location.trim(),
      unit: unit.trim() || undefined,
      startDate: s, endDate: e,
      isPotential,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg border border-white/15 flex flex-col"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Service</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              {isEditing ? 'EDIT DUTY STATION' : 'ADD DUTY STATION'}<span className="text-red-600">.</span>
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

          {/* Confirmed / Potential toggle */}
          <div className="flex gap-2">
            <button onClick={() => setIsPotential(false)}
              className={`flex-1 h-9 text-[10px] font-mono font-bold tracking-widest transition-colors border ${!isPotential ? 'border-white/40 text-white/90 bg-white/[0.07]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
              CONFIRMED
            </button>
            <button onClick={() => setIsPotential(true)}
              className={`flex-1 h-9 text-[10px] font-mono font-bold tracking-widest transition-colors border ${isPotential ? 'border-white/40 text-white/90 bg-white/[0.07]' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
              POTENTIAL
            </button>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Location / Base</label>
            <input
              list="usmc-bases"
              className={inputCls}
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. MCB Camp Lejeune, NC"
            />
            <datalist id="usmc-bases">
              {USMC_BASES.map(b => <option key={b} value={b} />)}
            </datalist>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">
              Unit <span className="text-white/20">(optional)</span>
            </label>
            <input className={inputCls} value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. 2nd Bn, 8th Marines" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Report Date</label>
              <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Departure Date</label>
              <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Preview */}
          {location && startDate && endDate && (
            <div className="px-3 py-2.5 border flex items-center gap-4"
              style={{ background: 'var(--usmc-bg-elevated)', borderColor: isPotential ? 'var(--usmc-border-subtle)' : 'var(--usmc-border-strong)', borderStyle: isPotential ? 'dashed' : 'solid' }}>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-bold text-white/80 truncate">{location}</div>
                {unit && <div className="text-[9px] font-mono text-white/40 truncate">{unit}</div>}
                <div className="text-[9px] font-mono text-white/30">
                  {fromInputDate(startDate)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()} – {fromInputDate(endDate)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </div>
              </div>
              {dur && <div className="text-[10px] font-mono font-bold text-white/50 flex-none">{dur.toUpperCase()}</div>}
              <span className="text-[8px] font-mono tracking-widest border px-1.5 py-0.5 flex-none"
                style={{ color: isPotential ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)', borderColor: isPotential ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.25)' }}>
                {isPotential ? 'POTENTIAL' : 'CONFIRMED'}
              </span>
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
            {isEditing ? 'SAVE CHANGES' : 'ADD TO TIMELINE'}
          </button>
        </div>
      </div>
    </div>
  );
}
