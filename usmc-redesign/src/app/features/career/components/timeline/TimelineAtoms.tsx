import { createContext, useContext } from 'react';
import {
  Flag, Star, Medal,
  Shield, House, TrendUp, CheckCircle, PiggyBank,
  Plus,
} from '@phosphor-icons/react';
import { renderCustomIcon } from '../IconColorPicker';
import { LABEL_W, LABEL_W_COLLAPSED, GUTTER_W, years, type TooltipState } from './timelineUtils';

export const SidebarCollapsedCtx = createContext(false);

// ─── Milestone icon lookup ────────────────────────────────────────────────────
export function getMilestoneIcon(type: string, className: string): React.ReactNode {
  if (type === 'enlistment')   return <Flag className={className} />;
  if (type === 'retirement')   return <Medal className={className} />;
  return <Star className={className} />;
}

// ─── TooltipCard ─────────────────────────────────────────────────────────────
export function TooltipCard({ t }: { t: TooltipState }) {
  const OFFSET = 14;
  return (
    <div className="fixed z-[9999] pointer-events-none" style={{ left: t.x + OFFSET, top: t.y - 8 }}>
      <div className="border border-white/20 px-3 py-2.5 shadow-2xl"
        style={{ background: 'var(--usmc-bg-surface)', minWidth: 170, maxWidth: 260 }}>
        <div className="text-[11px] font-mono font-black text-white/95 leading-tight mb-0.5">{t.title}</div>
        {t.subtitle && (
          <div className="text-[9px] font-mono text-white/35 tracking-wider mb-1.5">{t.subtitle}</div>
        )}
        <div className="w-4 h-px bg-red-600/60 mb-1.5" />
        {t.lines.map((line, i) => (
          <div key={i} className="text-[10px] font-mono text-white/55 leading-snug">{line}</div>
        ))}
      </div>
    </div>
  );
}

// ─── GoalIcon ─────────────────────────────────────────────────────────────────
export function GoalIcon({ name, customIconName }: { name: string; customIconName?: string }) {
  const cls = 'w-3.5 h-3.5';
  if (name === 'custom')       return <>{renderCustomIcon(customIconName ?? 'Star', cls)}</>;
  if (name === 'shield')       return <Shield className={cls} />;
  if (name === 'Home')         return <House className={cls} />;
  if (name === 'trending-up')  return <TrendUp className={cls} />;
  if (name === 'check-circle') return <CheckCircle className={cls} />;
  return <PiggyBank className={cls} />;
}

// ─── SectionGutter ────────────────────────────────────────────────────────────
export function SectionGutter({ label }: { label: string }) {
  return (
    <div className="sticky left-0 z-[21] flex-none self-stretch flex items-center justify-center border-r border-white/[0.08]"
      style={{ width: GUTTER_W, background: 'var(--usmc-bg-base)' }}>
      <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-white/50 uppercase select-none"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
        {label}
      </span>
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ icon, lower, onAdd }: { icon: React.ReactNode; lower: string; onAdd?: () => void }) {
  const collapsed = useContext(SidebarCollapsedCtx);
  return (
    <div
      className={`flex-none sticky z-[20] border-r border-white/10 flex items-center overflow-hidden ${
        collapsed ? 'justify-center' : 'gap-2 px-2.5'
      }`}
      style={{
        left: GUTTER_W,
        width: collapsed ? LABEL_W_COLLAPSED : LABEL_W - GUTTER_W,
        background: 'var(--usmc-bg-base)',
        transition: 'width 200ms ease',
      }}>
      <span className="flex-none text-white/30">{icon}</span>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono font-bold text-white/70 tracking-wider leading-tight">{lower}</div>
          </div>
          {onAdd && (
            <button onClick={onAdd}
              className="flex-none w-5 h-5 border border-white/20 flex items-center justify-center text-white/35 hover:text-red-400 hover:border-red-600/50 transition-colors">
              <Plus weight="bold" className="w-3 h-3" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── SmallLabel ───────────────────────────────────────────────────────────────
export function SmallLabel({ text, icon }: { text: string; icon?: React.ReactNode }) {
  const collapsed = useContext(SidebarCollapsedCtx);
  return (
    <div className="flex-none sticky left-0 z-[20] border-r border-white/10 flex items-center justify-center overflow-hidden"
      style={{
        width: collapsed ? GUTTER_W + LABEL_W_COLLAPSED : LABEL_W,
        background: 'var(--usmc-bg-base)',
        transition: 'width 200ms ease',
        padding: collapsed ? '0' : '0 12px',
      }}>
      {collapsed ? (
        icon ? <span className="text-white/25">{icon}</span> : null
      ) : (
        <span className="w-full text-[10px] font-mono tracking-widest text-white/30">{text}</span>
      )}
    </div>
  );
}

// ─── GridLines ────────────────────────────────────────────────────────────────
export function GridLines({ yw, count }: { yw: number; count?: number }) {
  const n = count ?? years.length;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="absolute top-0 bottom-0 border-r border-white/[0.05]"
          style={{ left: i * yw, width: yw }} />
      ))}
    </>
  );
}
