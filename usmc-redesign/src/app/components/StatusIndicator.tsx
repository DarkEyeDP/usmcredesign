import { motion } from 'motion/react';

interface StatusIndicatorProps {
  label: string;
  value: string;
  status?: 'active' | 'warning' | 'inactive';
}

export function StatusIndicator({ label, value, status = 'active' }: StatusIndicatorProps) {
  const statusColors = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    inactive: 'bg-gray-500',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/30 border border-white/12">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 font-mono tracking-wider">{label}</span>
        <span className="text-xs text-white font-mono">{value}</span>
      </div>
      <motion.div
        className={`w-2 h-2 rounded-full ${statusColors[status]}`}
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
