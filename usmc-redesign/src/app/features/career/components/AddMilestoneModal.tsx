import { useState, useEffect } from 'react';
import { X, CaretLeft, Flag, Star, Medal, CaretDown } from '@phosphor-icons/react';
import type { CareerMilestone, MilestoneType, MilestoneIconSize } from '../types';
import { IconColorPicker, renderCustomIcon, DEFAULT_CUSTOM_COLOR, DEFAULT_CUSTOM_ICON } from './IconColorPicker';

interface Props {
  existing?: CareerMilestone;
  onSave: (m: CareerMilestone) => void;
  onClose: () => void;
  onDelete?: () => void;
  onBackToEvents?: () => void;
}

interface MilestoneDef {
  value: MilestoneType;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hasEndDate: boolean;
}

const MILESTONE_DEFS: MilestoneDef[] = [
  { value: 'enlistment',   label: 'Enlistment',           shortLabel: 'ENLIST',    description: 'Initial contract signing or boot camp entry',           icon: <Flag  className="w-4 h-4" />, color: '#22c55e', hasEndDate: false },
  { value: 'eas',          label: 'EAS / End of Active',  shortLabel: 'EAS',       description: 'End of active service / EAOS date',                    icon: <Star  className="w-4 h-4" />, color: '#fbbf24', hasEndDate: false },
  { value: 'reenlistment', label: 'Reenlistment',         shortLabel: 'REENLIST',  description: 'Re-enlistment contract signing date',                  icon: <Star  className="w-4 h-4" />, color: '#f97316', hasEndDate: false },
  { value: 'letter',       label: 'Letter / Recognition', shortLabel: 'RECOG',     description: 'Letter of appreciation, Medal citation, LOI',          icon: <Star  className="w-4 h-4" />, color: '#fbbf24', hasEndDate: false },
  { value: 'retirement',   label: 'Retirement',           shortLabel: 'RETIRE',    description: 'Retirement ceremony or effective retirement date',      icon: <Medal className="w-4 h-4" />, color: '#22c55e', hasEndDate: false },
  { value: 'custom',       label: 'Custom Milestone',     shortLabel: 'CUSTOM',    description: 'Pick your own icon and color',                         icon: <Star  className="w-4 h-4" />, color: DEFAULT_CUSTOM_COLOR, hasEndDate: false },
];

const inputCls = 'w-full h-9 px-3 bg-black border border-white/15 text-[11px] font-mono text-white/80 focus:outline-none focus:border-red-600/60 transition-colors';
const selectCls = 'w-full h-9 px-3 appearance-none bg-black border border-white/15 text-[11px] font-mono text-white/80 focus:outline-none focus:border-red-600/60 transition-colors';

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromInputDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function AddMilestoneModal({ existing, onSave, onClose, onDelete, onBackToEvents }: Props) {
  const isEditing = !!existing;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [typeVal, setTypeVal]     = useState<MilestoneType>(existing?.type ?? 'enlistment');
  const [label, setLabel]         = useState(existing?.label ?? '');
  const [shortLabel, setShortLabel] = useState(existing?.shortLabel ?? '');
  const [date, setDate]           = useState(existing ? toInputDate(existing.date) : toInputDate(new Date(2026, 5, 6)));
  const [endDate, setEndDate]     = useState(existing?.endDate ? toInputDate(existing.endDate) : '');
  const [track, setTrack]         = useState<0 | 1>(existing?.track ?? 0);
  const [iconSize, setIconSize]       = useState<MilestoneIconSize>(existing?.iconSize ?? 'md');
  const [customIcon, setCustomIcon]   = useState(existing?.customIcon ?? DEFAULT_CUSTOM_ICON);
  const [customColor, setCustomColor] = useState(existing?.customColor ?? DEFAULT_CUSTOM_COLOR);

  const def = MILESTONE_DEFS.find(d => d.value === typeVal)!;
  const activeColor = typeVal === 'custom' ? customColor : def.color;

  // Auto-fill label when type changes — only in add mode
  useEffect(() => {
    if (!isEditing) {
      setLabel(def.label);
      setShortLabel(def.shortLabel);
    }
  }, [typeVal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const canSave = label.trim() && date;

  function handleSave() {
    const d = fromInputDate(date);
    if (!d || !label.trim()) return;
    onSave({
      id: existing?.id ?? `milestone-${typeVal}-${Date.now()}`,
      label: label.trim(),
      shortLabel: shortLabel.trim() || def.shortLabel,
      type: typeVal,
      date: d,
      endDate: endDate ? fromInputDate(endDate) ?? undefined : undefined,
      track,
      iconSize,
      customIcon: typeVal === 'custom' ? customIcon : undefined,
      customColor: typeVal === 'custom' ? customColor : undefined,
    });
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-none">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Career Milestones</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              {isEditing ? 'EDIT MILESTONE' : 'ADD MILESTONE'}<span className="text-red-600">.</span>
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
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-white/15 text-white/40 hover:text-white/80 hover:border-white/30 transition-colors">
              <X weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* Type selector */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-2">Milestone Type</label>
            <div className="grid grid-cols-1 gap-1.5">
              {MILESTONE_DEFS.map(d => {
                const isActive = typeVal === d.value;
                const iconEl = d.value === 'custom' && isActive
                  ? renderCustomIcon(customIcon, 'w-4 h-4')
                  : d.icon;
                const iconColor = d.value === 'custom' && isActive ? customColor : d.color;
                return (
                  <button key={d.value} onClick={() => setTypeVal(d.value)}
                    className={`flex items-center gap-3 px-3 py-2.5 border text-left transition-colors ${
                      isActive ? 'border-white/30 bg-white/[0.06]' : 'border-white/[0.07] hover:border-white/15 bg-transparent'
                    }`}>
                    <span style={{ color: iconColor }}>{iconEl}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono font-bold text-white/80 leading-tight">{d.label}</div>
                      <div className="text-[9px] font-mono text-white/35 leading-tight">{d.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: iconColor }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon + color picker — shown only for custom type */}
          {typeVal === 'custom' && (
            <div className="px-3 py-3 border border-white/[0.08]" style={{ background: 'var(--usmc-bg-elevated)' }}>
              <IconColorPicker
                selectedIcon={customIcon}
                selectedColor={customColor}
                onSelectIcon={setCustomIcon}
                onSelectColor={setCustomColor}
              />
            </div>
          )}

          {/* Label + Short label */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Label</label>
              <input className={inputCls} value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Initial Enlistment" />
            </div>
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Short Label</label>
              <input className={inputCls} value={shortLabel} onChange={e => setShortLabel(e.target.value)} placeholder="ENLIST" maxLength={10} />
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Date</label>
              <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">End Date <span className="text-white/20">(optional)</span></label>
              <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Track */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Timeline Row</label>
            <div className="relative">
              <select className={selectCls} value={track} onChange={e => setTrack(Number(e.target.value) as 0 | 1)}>
                <option value={0}>Upper row</option>
                <option value={1}>Lower row</option>
              </select>
              <CaretDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Icon Size */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Icon Size</label>
            <div className="flex border border-white/15">
              {(['sm', 'md', 'lg'] as MilestoneIconSize[]).map((s, i) => {
                const isActive = iconSize === s;
                const label = s === 'sm' ? 'SMALL' : s === 'md' ? 'MEDIUM' : 'LARGE';
                return (
                  <button key={s} onClick={() => setIconSize(s)}
                    className={`flex-1 h-9 text-[10px] font-mono font-bold tracking-wider transition-colors ${i > 0 ? 'border-l border-white/15' : ''} ${isActive ? 'bg-white/[0.08] text-white/80' : 'text-white/30 hover:text-white/55 hover:bg-white/[0.03]'}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {label && date && (
            <div className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.08]"
              style={{ background: 'var(--usmc-bg-elevated)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center border flex-none"
                style={{ background: `${activeColor}22`, borderColor: `${activeColor}88`, color: activeColor }}>
                {typeVal === 'custom'
                  ? renderCustomIcon(customIcon, 'w-3.5 h-3.5')
                  : <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{def.icon}</span>}
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-white/80">{label}</div>
                <div className="text-[9px] font-mono text-white/35">
                  {fromInputDate(date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  {endDate && ` – ${fromInputDate(endDate)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 flex-none">
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
