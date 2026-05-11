import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface TacticalCardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export function TacticalCard({ children, className = '', glowOnHover = true }: TacticalCardProps) {
  return (
    <motion.div
      className={`bg-black/50 border border-white/16 backdrop-blur-sm ${className}`}
      whileHover={glowOnHover ? {
        borderColor: 'rgba(239, 68, 68, 0.8)',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
