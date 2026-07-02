import { useState, useEffect } from 'react';
import { X, CaretLeft, CaretDown } from '@phosphor-icons/react';
import type { MarineProfile, Promotion } from '../types';
import { USMC_RANKS, isHigherGrade } from '../rankData';

interface Props {
  profile: MarineProfile;
  existing?: Promotion;
  onSave: (p: Promotion) => void;
  onClose: () => void;
  onDelete?: () => void;
  onBackToEvents?: () => void;
}

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fromInputDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const inputCls = [
  'w-full h-9 px-3',
  'bg-black border border-white/15',
  'text-[11px] font-mono text-white/80',
  'focus:outline-none focus:border-red-600/60 transition-colors',
].join(' ');

const selectCls = [
  'w-full h-9 px-3 appearance-none',
  'bg-black border border-white/15',
  'text-[11px] font-mono text-white/80',
  'focus:outline-none focus:border-red-600/60 transition-colors',
].join(' ');

export function AddPromotionModal({ profile, existing, onSave, onClose, onDelete, onBackToEvents }: Props) {
  const isEditing = !!existing;
  const [confirmDelete, setConfirmDelete] = useState(false);

  // When editing show all ranks; when adding show only higher ranks
  const availableRanks = isEditing
    ? USMC_RANKS
    : USMC_RANKS.filter(r => isHigherGrade(r.payGrade, profile.payGrade));
  const defaultRank = availableRanks[0] ?? USMC_RANKS[0];

  const [rankKey, setRankKey] = useState(() => {
    if (existing) return `${existing.rankAbbr}|${existing.payGrade}`;
    return `${defaultRank.abbr}|${defaultRank.payGrade}`;
  });
  const [targetDate, setTargetDate] = useState(() => {
    if (existing) return toInputDate(existing.date);
    const d = new Date(profile.promotionDate);
    d.setFullYear(d.getFullYear() + 4);
    return toInputDate(d);
  });

  const selectedRank = USMC_RANKS.find(r => `${r.abbr}|${r.payGrade}` === rankKey);
  const canSave = !!selectedRank && !!targetDate;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  function handleSave() {
    if (!selectedRank) return;
    const date = fromInputDate(targetDate);
    if (!date) return;
    onSave({
      id: existing?.id ?? `proj-${selectedRank.abbr}-${Date.now()}`,
      rank: selectedRank.full,
      rankAbbr: selectedRank.abbr,
      payGrade: selectedRank.payGrade,
      date,
      isProjected: true,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center sm:justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto border border-b-0 sm:border-b border-white/15 flex flex-col"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Career Promotions</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              {isEditing ? 'EDIT PROMOTION' : 'ADD PROJECTED PROMOTION'}<span className="text-red-600">.</span>
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
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-white/15 text-white/40 hover:text-white/80 hover:border-white/30 transition-colors">
              <X weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Current rank context */}
          <div className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.07]"
            style={{ background: 'var(--usmc-bg-elevated)' }}>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Current rank</div>
            <div className="px-2 py-0.5 border border-white/40 text-[11px] font-mono font-black text-white/90">
              {profile.rankAbbr}
            </div>
            <div className="text-[10px] font-mono text-white/50">{profile.rankFull}</div>
            <div className="ml-auto text-[9px] font-mono text-white/30">{profile.payGrade}</div>
          </div>

          {/* Target rank */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">
              Target Rank
            </label>
            <div className="relative">
              <select className={selectCls} value={rankKey} onChange={e => setRankKey(e.target.value)}>
                {['Enlisted', 'Warrant Officer', 'Officer'].map(group => {
                  const prefix = group === 'Enlisted' ? 'E-' : group === 'Warrant Officer' ? 'W-' : 'O-';
                  const ranks = availableRanks.filter(r => r.payGrade.startsWith(prefix));
                  if (ranks.length === 0) return null;
                  return (
                    <optgroup key={group} label={group}>
                      {ranks.map(r => (
                        <option key={`${r.abbr}|${r.payGrade}`} value={`${r.abbr}|${r.payGrade}`}>
                          {r.payGrade} — {r.abbr} — {r.full}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              <CaretDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>

          {/* Target date */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">
              {isEditing ? 'Date' : 'Projected Date'}
            </label>
            <input
              type="date"
              className={inputCls}
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}            />
          </div>

          {/* Preview */}
          {selectedRank && targetDate && (
            <div className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.08]"
              style={{ background: 'var(--usmc-bg-elevated)' }}>
              <div className="px-2 py-0.5 border border-white/20 text-[11px] font-mono font-black text-white/50">
                {selectedRank.abbr}
              </div>
              <div className="text-[10px] font-mono text-white/40">{selectedRank.full}</div>
              <div className="ml-auto text-[10px] font-mono font-bold text-white/50">
                {fromInputDate(targetDate)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() ?? '—'}
              </div>
              <span className="text-[8px] font-mono tracking-widest border border-white/15 px-1.5 py-0.5 text-white/30">PROJ</span>
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
            <button onClick={onClose}
              className="h-9 px-5 border border-white/15 text-[10px] font-mono font-bold tracking-widest text-white/45 hover:text-white/70 hover:border-white/30 transition-colors">
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
