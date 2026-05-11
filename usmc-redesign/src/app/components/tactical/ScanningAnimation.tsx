import { motion } from 'motion/react';

export function ScanningAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"
        initial={{ top: 0 }}
        animate={{ top: '100%' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute left-0 right-0 h-20 bg-gradient-to-b from-red-500/10 to-transparent"
        initial={{ top: 0 }}
        animate={{ top: '100%' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
