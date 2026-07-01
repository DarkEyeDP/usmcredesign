import { useState, useEffect } from 'react';
import { X, CaretLeft, Shield, House, TrendUp, CheckCircle, PiggyBank, Sparkle } from '@phosphor-icons/react';
import type { FinancialGoal } from '../types';
import { IconColorPicker, renderCustomIcon, DEFAULT_CUSTOM_COLOR, DEFAULT_CUSTOM_ICON } from './IconColorPicker';

interface Props {
  existing?: FinancialGoal;
  onSave: (g: FinancialGoal) => void;
  onClose: () => void;
  onBackToEvents?: () => void;
}

type IconName = FinancialGoal['iconName'];

interface IconDef {
  name: IconName;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ICON_DEFS: IconDef[] = [
  { name: 'shield',       label: 'Emergency Fund',    description: '3–6 months of expenses',             icon: <Shield      className="w-5 h-5" />, color: '#60a5fa' },
  { name: 'Home',         label: 'House / Property',  description: 'Down payment or payoff',             icon: <House       className="w-5 h-5" />, color: '#4ade80' },
  { name: 'trending-up',  label: 'Investments / TSP', description: 'Retirement or brokerage milestone',  icon: <TrendUp     className="w-5 h-5" />, color: '#a78bfa' },
  { name: 'check-circle', label: 'Debt-Free Target',  description: 'Eliminate a specific debt',          icon: <CheckCircle className="w-5 h-5" />, color: '#f87171' },
  { name: 'piggy-bank',   label: 'Savings Goal',      description: 'General savings target',             icon: <PiggyBank   className="w-5 h-5" />, color: '#facc15' },
  { name: 'custom',       label: 'Custom Goal',        description: 'Pick your own icon and color',      icon: <Sparkle     className="w-5 h-5" />, color: DEFAULT_CUSTOM_COLOR },
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

export function AddFinancialGoalModal({ existing, onSave, onClose, onBackToEvents }: Props) {
  const isEditing = !!existing;
  const today = new Date(2026, 5, 6);
  const [label, setLabel]             = useState(existing?.label ?? '');
  const [iconName, setIconName]       = useState<IconName>(existing?.iconName ?? 'shield');
  const [amountStr, setAmountStr]     = useState(existing?.amount ? String(existing.amount) : '');
  const [targetDate, setTargetDate]   = useState(
    existing ? toInputDate(existing.targetDate) : toInputDate(new Date(today.getFullYear() + 2, 0, 1))
  );
  const [noAmount, setNoAmount]       = useState(existing ? existing.amount === 0 : false);
  const [customIconName, setCustomIconName] = useState(existing?.customIconName ?? DEFAULT_CUSTOM_ICON);
  const [customColor, setCustomColor]       = useState(existing?.customColor ?? DEFAULT_CUSTOM_COLOR);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const def = ICON_DEFS.find(d => d.name === iconName)!;
  const activeColor = iconName === 'custom' ? customColor : def.color;
  const amount = noAmount ? 0 : (parseFloat(amountStr.replace(/,/g, '')) || 0);
  const canSave = label.trim() && targetDate && (noAmount || amountStr);

  function handleSave() {
    const d = fromInputDate(targetDate);
    if (!d || !label.trim()) return;
    onSave({
      id: existing?.id ?? `goal-${Date.now()}`,
      label: label.trim(),
      amount,
      targetDate: d,
      iconName,
      customIconName: iconName === 'custom' ? customIconName : undefined,
      customColor: iconName === 'custom' ? customColor : undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg border border-white/15 flex flex-col max-h-[90vh]"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-none">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Financial</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              {isEditing ? 'EDIT FINANCIAL GOAL' : 'ADD FINANCIAL GOAL'}<span className="text-red-600">.</span>
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

        {/* Body — scrollable */}
        <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* Goal type / icon selector */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-2">Goal Type</label>
            <div className="grid grid-cols-1 gap-1.5">
              {ICON_DEFS.map(d => {
                const isActive = iconName === d.name;
                const iconEl = d.name === 'custom' && isActive
                  ? renderCustomIcon(customIconName, 'w-5 h-5')
                  : d.icon;
                const iconColor = d.name === 'custom' && isActive ? customColor : d.color;
                return (
                  <button key={d.name} onClick={() => setIconName(d.name)}
                    className={`flex items-center gap-3 px-3 py-2.5 border text-left transition-colors ${
                      isActive ? 'border-white/25 bg-white/[0.05]' : 'border-white/[0.07] hover:border-white/15 bg-transparent'
                    }`}>
                    <span style={{ color: iconColor }}>{iconEl}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono font-bold text-white/80">{d.label}</div>
                      <div className="text-[9px] font-mono text-white/35">{d.description}</div>
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
          {iconName === 'custom' && (
            <div className="px-3 py-3 border border-white/[0.08]" style={{ background: 'var(--usmc-bg-elevated)' }}>
              <IconColorPicker
                selectedIcon={customIconName}
                selectedColor={customColor}
                onSelectIcon={setCustomIconName}
                onSelectColor={setCustomColor}
              />
            </div>
          )}

          {/* Label */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Goal Label</label>
            <input className={inputCls} value={label} onChange={e => setLabel(e.target.value)}
              placeholder={`e.g. ${def.label}`} />
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase">Target Amount</label>
              <button onClick={() => setNoAmount(v => !v)}
                className={`text-[8px] font-mono tracking-widest transition-colors ${noAmount ? 'text-red-400' : 'text-white/30 hover:text-white/50'}`}>
                {noAmount ? '✓ NO DOLLAR TARGET' : 'NO DOLLAR TARGET'}
              </button>
            </div>
            {!noAmount && (
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-white/40">$</div>
                <input
                  className={inputCls + ' pl-6'}
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>
            )}
            {noAmount && (
              <div className="h-9 px-3 border border-white/[0.07] flex items-center text-[10px] font-mono text-white/25"
                style={{ background: 'var(--usmc-bg-elevated)' }}>
                Debt-free / qualitative target — no specific amount
              </div>
            )}
          </div>

          {/* Target date */}
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Target Date</label>
            <input type="date" className={inputCls} value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>

          {/* Preview */}
          {label && targetDate && (
            <div className="px-3 py-2.5 border flex items-center gap-3"
              style={{
                background: `${activeColor}12`,
                borderColor: `${activeColor}35`,
              }}>
              <span style={{ color: activeColor }}>
                {iconName === 'custom'
                  ? renderCustomIcon(customIconName, 'w-5 h-5')
                  : def.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-bold leading-tight" style={{ color: `${activeColor}CC` }}>
                  {label}
                </div>
                <div className="text-[9px] font-mono" style={{ color: `${activeColor}80` }}>
                  {amount > 0 ? `GOAL: $${amount.toLocaleString()}  ·  ` : ''}
                  TARGET: {fromInputDate(targetDate)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </div>
              </div>
            </div>
          )}
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
