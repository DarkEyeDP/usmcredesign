import { motion } from 'motion/react';

export function TargetingReticle() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(239, 68, 68, 0.3)"
          strokeWidth="0.5"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Inner circle */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="rgba(239, 68, 68, 0.4)"
          strokeWidth="0.5"
        />

        {/* Crosshairs */}
        <line x1="50" y1="10" x2="50" y2="25" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1" />
        <line x1="50" y1="75" x2="50" y2="90" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1" />
        <line x1="10" y1="50" x2="25" y2="50" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1" />
        <line x1="75" y1="50" x2="90" y2="50" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="1" />

        {/* Center dot */}
        <circle cx="50" cy="50" r="2" fill="rgba(239, 68, 68, 0.8)" />
      </svg>
    </div>
  );
}
