import { useNavigate, useLocation } from 'react-router';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { loggedInItems, loggedOutItems } from './navigationConfig';

interface NavigationProps {
  isLoggedIn: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

declare const __APP_VERSION__: string;
const SIDEBAR_VERSION = `v${__APP_VERSION__}`;

export function Navigation({ isLoggedIn, isExpanded, onToggleExpanded }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = isLoggedIn ? loggedInItems : loggedOutItems;

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <>
    <motion.div
      className="hidden md:flex fixed left-0 top-0 h-full bg-black/95 border-r border-white/12 flex-col overflow-x-hidden overflow-y-auto z-50 shadow-[4px_0_32px_rgba(0,0,0,0.7)]"
      initial={false}
      animate={{ width: isExpanded ? 192 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Version text — always centered in the fixed 80px icon column */}
      <div className="absolute top-6 w-20 flex justify-center pointer-events-none">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/18">
          {SIDEBAR_VERSION}
        </span>
      </div>

      <div className="w-full flex flex-col gap-1 pt-20 pb-20">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center h-14 w-full rounded-sm transition-colors group ${
                active ? 'text-red-500 bg-red-900/15' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {active && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500"
                  layoutId="activeBar"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              {/* Icon always centered in the fixed 80px column */}
              <div className="w-20 flex-shrink-0 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              {/* Label always rendered; overflow-x-hidden on parent clips it when collapsed */}
              <span className="text-sm font-bold tracking-wider whitespace-nowrap">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Toggle button — always centered in the fixed 80px column */}
      <button
        type="button"
        onClick={onToggleExpanded}
        className="absolute bottom-6 left-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center border border-white/16 text-gray-500 transition-colors hover:border-white/40 hover:text-white"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
      </button>
    </motion.div>
    </>
  );
}
