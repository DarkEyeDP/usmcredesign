// ── Section header ───────────────────────────────────────────────────────────────
export function SectionHeader({ num, title, aside }: { num: string; title: string; aside?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
          <span className="text-sm font-bold text-red-500">{num}</span>
        </div>
        <span className="text-sm font-bold tracking-widest text-gray-400">{title}</span>
      </div>
      {aside && <span className="text-[11px] font-bold tracking-widest text-gray-500">{aside}</span>}
    </div>
  );
}
