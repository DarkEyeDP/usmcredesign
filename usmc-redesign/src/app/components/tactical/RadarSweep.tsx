import { motion } from 'motion/react';

export function RadarSweep() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </radialGradient>
        </defs>

        {/* Radar circles */}
        <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="0.1" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="0.1" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="0.1" />

        {/* Sweeping line */}
        <motion.line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="url(#radarGradient)"
          strokeWidth="0.5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ transformOrigin: '50px 50px' }}
        />
      </svg>
    </div>
  );
}
