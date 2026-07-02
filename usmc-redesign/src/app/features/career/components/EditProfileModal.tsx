import { useState, useEffect, useCallback } from 'react';
import { X, CaretDown } from '@phosphor-icons/react';
import type { MarineProfile } from '../types';
import { USMC_RANKS } from '../rankData';
import { RankInsignia } from '@/app/components/ui/RankInsignia';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function fromInputDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function calcRetirementYears(enlist: Date, retire: Date): number {
  return Math.round((retire.getFullYear() - enlist.getFullYear()) +
    (retire.getMonth() - enlist.getMonth()) / 12);
}

// ─── Form state type ──────────────────────────────────────────────────────────
interface FormState {
  name: string;
  rankKey: string; // `${abbr}|${payGrade}`
  promotionDate: string;
  mos: string;
  mosDescription: string;
  dob: string;
  enlistmentDate: string;
  projectedRetirement: string;
}

function profileToForm(p: MarineProfile): FormState {
  return {
    name: p.name,
    rankKey: `${p.rankAbbr}|${p.payGrade}`,
    promotionDate: toInputDate(p.promotionDate),
    mos: p.mos,
    mosDescription: p.mosDescription,
    dob: toInputDate(p.dob),
    enlistmentDate: toInputDate(p.enlistmentDate),
    projectedRetirement: toInputDate(p.projectedRetirement),
  };
}

function formToProfile(f: FormState, original: MarineProfile): MarineProfile {
  const [abbr, payGrade] = f.rankKey.split('|');
  const rank = USMC_RANKS.find(r => r.abbr === abbr && r.payGrade === payGrade);
  const enlist = fromInputDate(f.enlistmentDate) ?? original.enlistmentDate;
  const retire = fromInputDate(f.projectedRetirement) ?? original.projectedRetirement;

  return {
    name: f.name.trim(),
    rankFull: rank?.full ?? original.rankFull,
    rankAbbr: rank?.abbr ?? original.rankAbbr,
    payGrade: rank?.payGrade ?? original.payGrade,
    promotionDate: fromInputDate(f.promotionDate) ?? original.promotionDate,
    mos: f.mos.trim(),
    mosDescription: f.mosDescription.trim(),
    dob: fromInputDate(f.dob) ?? original.dob,
    enlistmentDate: enlist,
    projectedRetirement: retire,
    retirementYears: calcRetirementYears(enlist, retire),
  };
}

// ─── Field components ─────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">
      {children}
    </label>
  );
}

const inputCls = [
  'w-full h-9 px-3',
  'bg-black border border-white/15',
  'text-[11px] font-mono text-white/80',
  'focus:outline-none focus:border-red-600/60',
  'transition-colors placeholder:text-white/20',
].join(' ');

const selectCls = [
  'w-full h-9 px-3 appearance-none',
  'bg-black border border-white/15',
  'text-[11px] font-mono text-white/80',
  'focus:outline-none focus:border-red-600/60',
  'transition-colors',
].join(' ');

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <div className="w-0.5 h-4 bg-red-600/60 flex-none" />
      <span className="text-[9px] font-mono tracking-[0.25em] text-white/45 uppercase">{label}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface Props {
  profile: MarineProfile;
  onSave: (updated: MarineProfile) => void;
  onClose: () => void;
}

export function EditProfileModal({ profile, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormState>(() => profileToForm(profile));
  const [dirty, setDirty] = useState(false);

  const set = useCallback((field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setDirty(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleSave() {
    onSave(formToProfile(form, profile));
    onClose();
  }

  // Derived values for preview
  const selectedRank = USMC_RANKS.find(r => `${r.abbr}|${r.payGrade}` === form.rankKey);
  const enlistDate = fromInputDate(form.enlistmentDate);
  const retireDate = fromInputDate(form.projectedRetirement);
  const retYears = enlistDate && retireDate ? calcRetirementYears(enlistDate, retireDate) : '—';

  return (
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center sm:justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-2xl h-[92dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto border border-b-0 sm:border-b border-white/15 flex flex-col"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 sticky top-0 z-10"
          style={{ background: 'var(--usmc-bg-surface)' }}>
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Career Path</div>
            <div className="text-[15px] font-mono font-black text-white tracking-wider">
              EDIT PROFILE<span className="text-red-600">.</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-white/15 text-white/40 hover:text-white/80 hover:border-white/30 transition-colors">
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="px-4 sm:px-6 py-5 flex-1">

          <SectionHead label="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-0">
            <div className="col-span-2">
              <FieldLabel>Full Name</FieldLabel>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Last Name, First MI"
              />
            </div>
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              <input
                type="date"
                className={inputCls}
                value={form.dob}
                onChange={e => set('dob', e.target.value)}              />
            </div>
          </div>

          <SectionHead label="Service Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <FieldLabel>Rank</FieldLabel>
              <div className="relative">
                <select
                  className={selectCls}
                  value={form.rankKey}
                  onChange={e => set('rankKey', e.target.value)}
                >
                  {['Enlisted', 'Warrant Officer', 'Officer'].map(group => {
                    const prefix = group === 'Enlisted' ? 'E-' : group === 'Warrant Officer' ? 'W-' : 'O-';
                    const ranks = USMC_RANKS.filter(r => r.payGrade.startsWith(prefix));
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
              {selectedRank && (
                <div className="mt-2 flex items-center gap-3">
                  <RankInsignia payGrade={selectedRank.payGrade} rankAbbr={selectedRank.abbr} className="w-10 h-10" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-mono font-bold text-white/70">{selectedRank.payGrade} · {selectedRank.abbr}</span>
                    <span className="text-[9px] font-mono text-white/35">{selectedRank.full}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <FieldLabel>Date Promoted to Current Rank</FieldLabel>
              <input
                type="date"
                className={inputCls}
                value={form.promotionDate}
                onChange={e => set('promotionDate', e.target.value)}              />
              <div className="mt-1 text-[9px] font-mono text-white/25">
                Updates the confirmed entry in your Promotions lane
              </div>
            </div>

            <div>
              <FieldLabel>MOS Code</FieldLabel>
              <input
                className={inputCls}
                value={form.mos}
                onChange={e => set('mos', e.target.value)}
                placeholder="e.g. 0311"
                maxLength={6}
              />
            </div>
            <div>
              <FieldLabel>MOS Description</FieldLabel>
              <input
                className={inputCls}
                value={form.mosDescription}
                onChange={e => set('mosDescription', e.target.value)}
                placeholder="e.g. Rifleman"
              />
            </div>
          </div>

          <SectionHead label="Career Timeline" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Enlistment / Commission Date</FieldLabel>
              <input
                type="date"
                className={inputCls}
                value={form.enlistmentDate}
                onChange={e => set('enlistmentDate', e.target.value)}              />
            </div>
            <div>
              <FieldLabel>Projected Retirement Date</FieldLabel>
              <input
                type="date"
                className={inputCls}
                value={form.projectedRetirement}
                onChange={e => set('projectedRetirement', e.target.value)}              />
            </div>
          </div>

          {/* Derived summary */}
          {enlistDate && retireDate && (
            <div className="mt-4 border border-white/[0.08] p-4 flex flex-wrap gap-6"
              style={{ background: 'var(--usmc-bg-elevated)' }}>
              <div>
                <div className="text-[8px] font-mono tracking-widest text-white/25 uppercase mb-0.5">Years of Service</div>
                <div className="text-[14px] font-mono font-black text-white/80">{retYears} <span className="text-[10px] text-white/35">YRS</span></div>
              </div>
              <div>
                <div className="text-[8px] font-mono tracking-widest text-white/25 uppercase mb-0.5">Retirement Year</div>
                <div className="text-[14px] font-mono font-black text-white/80">{retireDate.getFullYear()}</div>
              </div>
              <div>
                <div className="text-[8px] font-mono tracking-widest text-white/25 uppercase mb-0.5">Current Rank</div>
                <div className="text-[14px] font-mono font-black text-white/80">
                  {selectedRank?.abbr ?? '—'} <span className="text-[10px] text-white/35">{selectedRank?.payGrade}</span>
                </div>
              </div>
              <div>
                <div className="text-[8px] font-mono tracking-widest text-white/25 uppercase mb-0.5">MOS</div>
                <div className="text-[14px] font-mono font-black text-white/80">
                  {form.mos || '—'} <span className="text-[10px] text-white/35">{form.mosDescription}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-white/10 sticky bottom-0"
          style={{ background: 'var(--usmc-bg-surface)' }}>
          <div className="text-[9px] font-mono text-white/25">
            {dirty ? 'UNSAVED CHANGES' : 'NO CHANGES'}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="h-9 px-5 border border-white/15 text-[10px] font-mono font-bold tracking-widest text-white/45 hover:text-white/70 hover:border-white/30 transition-colors">
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="h-9 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-700 text-white text-[10px] font-mono font-black tracking-widest transition-colors">
              SAVE PROFILE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
