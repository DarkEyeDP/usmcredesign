import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';

const COLORS = [
  '#22c55e',
  'var(--usmc-green-400)',
  'var(--usmc-red-600)',
  'var(--usmc-red-500)',
  'rgba(212,173,93,1)',
  'rgba(255,244,214,1)',
  '#eab308',
  'var(--usmc-amber-500)',
  'var(--usmc-amber-300)',
];
const DESKTOP_PARTICLE_COUNT = 42;
const MOBILE_PARTICLE_COUNT = 24;
const OVERLAY_DURATION_MS = 4800;
const FOOTER_LINES = [
  'Rah responsibly.',
  'No page 11 entry generated.',
  'This celebration is non-binding.',
  'Motivation level: administratively significant.',
  'S-1 has been notified emotionally.',
  'One row. Many feelings.',
];

interface Particle {
  id: number;
  x: number;
  driftX: number;
  color: string;
  w: number;
  h: number;
  rotate: number;
  spin: number;
  delay: number;
  duration: number;
}

type ParticleStyle = CSSProperties & Record<`--${string}`, string>;

function makeParticles(): Particle[] {
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = prefersReducedMotion
    ? 0
    : isMobile
      ? MOBILE_PARTICLE_COUNT
      : DESKTOP_PARTICLE_COUNT;

  return Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    driftX: (Math.random() - 0.5) * (isMobile ? 96 : 150),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 6 + 4,
    h: Math.random() > 0.45 ? Math.random() * 6 + 4 : Math.random() * 12 + 6,
    rotate: Math.random() * 360,
    spin: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 300 + 120),
    delay: Math.random() * 0.28,
    duration: Math.random() * 1.3 + 2.5,
  }));
}

interface Props {
  label?: string;
  onDone: () => void;
}

// Mounted fresh for every celebration (parent keys each instance with a unique ID).
// Particles are generated at mount time so every trigger gets a new set.
export function CelebrationOverlay({ label, onDone }: Props) {
  const [particles] = useState<Particle[]>(makeParticles);
  const [footerLine] = useState(() => FOOTER_LINES[Math.floor(Math.random() * FOOTER_LINES.length)]);
  const displayLabel = label?.trim();

  useEffect(() => {
    const t = setTimeout(onDone, OVERLAY_DURATION_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return createPortal(
    <motion.div
      className="fixed inset-0"
      role="dialog"
      aria-modal="true"
      aria-label="Congratulations"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDone}
      style={{ zIndex: 99999, cursor: 'default', overflow: 'hidden' }}
    >
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.08 }}
          className="relative border border-red-600/70 bg-black/95 px-10 py-7 text-center shadow-[0_0_40px_rgba(0,0,0,0.65)]"
        >
          <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-red-600/60" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t border-red-600/60" />
          <span className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-red-600/60" />
          <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-red-600/60" />

          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.35em] text-red-500">
            ADMIN VICTORY LOGGED
          </p>
          <p className="font-mono text-3xl font-black tracking-tighter text-white">
            NICE WORK, MARINE
          </p>
          {displayLabel && (
            <p className="mx-auto mt-3 max-w-[min(72vw,28rem)] break-words font-mono text-[13px] font-bold leading-snug text-gray-300">
              {displayLabel}
            </p>
          )}
          <p className="mt-2 font-mono text-[10px] font-bold tracking-[0.18em] text-gray-600">
            {footerLine}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="font-mono text-lg font-black text-red-600"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
              >
                ›
              </motion.span>
            ))}
          </div>
          <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
            TAP ANYWHERE TO DISMISS
          </p>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-40">
        {particles.map(p => (
          <div
            key={p.id}
            className="maradmin-celebration-particle absolute rounded-[1px]"
            style={{
              left: `${p.x}%`,
              top: -12,
              width: p.w,
              height: p.h,
              backgroundColor: p.color,
              '--drift-x': `${p.driftX}px`,
              '--start-rotation': `${p.rotate}deg`,
              '--spin': `${p.spin}deg`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
            } as ParticleStyle}
          />
        ))}
      </div>
    </motion.div>,
    document.body,
  );
}
