import { useMemo } from 'react';
import { motion } from 'motion/react';

interface GridNodesProps {
  nodeColors: readonly string[];
  slideKey: number;
}

export function GridNodes({ nodeColors, slideKey }: GridNodesProps) {
  /* eslint-disable react-hooks/purity */
  const nodes = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => {
      const col = Math.floor(Math.random() * 32) + 1;
      const row = Math.floor(Math.random() * 18) + 1;
      return {
        id: i,
        left: col * 40,
        top: row * 40,
        duration: 1.2 + Math.random() * 3.5,
        delay: Math.random() * 6,
        repeatDelay: 4 + Math.random() * 10,
        size: Math.random() > 0.66 ? 3 : 2,
        colorIdx: Math.floor(Math.random() * nodeColors.length),
      };
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [slideKey, nodeColors]);
  /* eslint-enable react-hooks/purity */

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 7 }}>
      {nodes.map(n => {
        const color = nodeColors[n.colorIdx];
        const glow = color.replace(/[\d.]+\)$/, '0.3)');
        return (
          <motion.div
            key={n.id}
            className="absolute rounded-full"
            style={{
              left: n.left - n.size / 2,
              top: n.top - n.size / 2,
              width: n.size,
              height: n.size,
              background: color,
              boxShadow: `0 0 4px 1px ${glow}`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
            transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, repeatDelay: n.repeatDelay, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}
