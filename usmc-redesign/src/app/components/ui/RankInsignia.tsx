/**
 * Maps an enlisted pay grade + optional rank abbreviation to its SVG path.
 * Returns null for E-1 (no insignia), non-enlisted grades, or missing files.
 */
export function getRankInsigniaPath(payGrade: string, rankAbbr?: string): string | null {
  if (!payGrade.startsWith('E-')) return null;
  const n = parseInt(payGrade.replace('E-', ''), 10);
  if (n <= 1) return null; // Private has no insignia

  if (n === 8) {
    return rankAbbr === '1stSgt' ? '/ranks/e8-1stsgt.svg' : '/ranks/e8-msgt.svg';
  }
  if (n === 9) {
    if (rankAbbr === 'MGySgt')   return '/ranks/e9-mgysgt.svg';
    if (rankAbbr === 'SgtMajMC') return '/ranks/e9-sgtmajmc.svg';
    if (rankAbbr === 'SEAC')     return '/ranks/e9-seac.svg';
    return '/ranks/e9-sgtmaj.svg';
  }

  return `/ranks/e${n}.svg`;
}

interface Props {
  payGrade: string;
  rankAbbr?: string;
  /** Tailwind sizing classes for the wrapper — defaults to w-14 h-14 */
  className?: string;
}

/**
 * Displays a rank insignia SVG for enlisted grades E-2 through E-9.
 * Falls back to a minimal pay-grade badge for E-1, officer, and warrant grades.
 */
export function RankInsignia({ payGrade, rankAbbr, className = 'w-14 h-14' }: Props) {
  const path = getRankInsigniaPath(payGrade, rankAbbr);

  if (path) {
    return (
      <div className={`flex items-center justify-center flex-none ${className}`}>
        <img
          src={path}
          alt={rankAbbr ?? payGrade}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  // Fallback badge for E-1, officer, and warrant grades
  return (
    <div className={`flex flex-col items-center justify-center flex-none border border-white/15 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <span className="text-[11px] font-mono font-black text-white/50 tracking-widest leading-tight">{payGrade}</span>
      {rankAbbr && (
        <span className="text-[8px] font-mono text-white/30 tracking-widest leading-tight">{rankAbbr}</span>
      )}
    </div>
  );
}
