import { useMemo } from 'react';
import { motion } from 'motion/react';

export function GridPulses() {
  const pulses = useMemo(() => {
    const v = Array.from({ length: 9 }, (_, i) => ({
      id: `v-${i}`,
      kind: 'v' as const,
      pos: ((i * 137) % 32 + 1) * 40,
      size: 70 + (i * 23 % 90),
      duration: 2 + (i * 2.3 % 7),
      delay: i * 2.8,
      repeatDelay: 9 + (i * 4.1 % 16),
      opacity: 0.08 + (i * 0.031 % 0.06),
      down: i % 2 === 0,
    }));
    const h = Array.from({ length: 6 }, (_, i) => ({
      id: `h-${i}`,
      kind: 'h' as const,
      top: ((i * 7 + 2) % 18 + 1) * 40,
      size: 80 + (i * 31 % 120),
      duration: 2.5 + (i * 3.1 % 8),
      delay: i * 3.4 + 1.2,
      repeatDelay: 10 + (i * 3.7 % 16),
      opacity: 0.08 + (i * 0.047 % 0.06),
      right: (i * 7 + 3) % 3 !== 0,
    }));
    return [...v, ...h];
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 6 }}>
      {pulses.map(p =>
        p.kind === 'v' ? (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: p.pos,
              width: 1,
              height: p.size,
              background: `linear-gradient(to bottom, transparent 0%, rgba(255,255,255,${p.opacity}) 50%, transparent 100%)`,
            }}
            initial={{ y: p.down ? -p.size : '110vh' }}
            animate={{ y: p.down ? '110vh' : -p.size }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, repeatDelay: p.repeatDelay, ease: 'linear' }}
          />
        ) : (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              top: p.top,
              height: 1,
              width: p.size,
              background: `linear-gradient(to right, transparent 0%, rgba(255,255,255,${p.opacity}) 50%, transparent 100%)`,
            }}
            initial={{ x: p.right ? -p.size : '110vw' }}
            animate={{ x: p.right ? '110vw' : -p.size }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, repeatDelay: p.repeatDelay, ease: 'linear' }}
          />
        )
      )}
    </div>
  );
}
