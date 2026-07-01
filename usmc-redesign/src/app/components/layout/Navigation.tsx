import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router';
import { SidebarSimple } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { loggedInItems, loggedOutItems } from './navigationConfig';
import { useTheme, THEMES, type Theme } from '@/app/features/theme/ThemeContext';

interface NavigationProps {
  isLoggedIn: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

declare const __APP_VERSION__: string;
const SIDEBAR_VERSION = `v${__APP_VERSION__}`;

function ThemeDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block flex-shrink-0 border border-white/30"
      style={{ width: 10, height: 10, backgroundColor: color, borderRadius: 2 }}
    />
  );
}

function ThemeSidebarToggle({ isExpanded }: { isExpanded: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState<{ bottom: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const current = THEMES.find(t => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideBtn = btnRef.current?.contains(target);
      const insideFlyout = flyoutRef.current?.contains(target);
      if (!insideBtn && !insideFlyout) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setFlyoutPos({
        bottom: window.innerHeight - rect.bottom,
        left: rect.right + 8,
      });
    }
    setOpen(v => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className={`absolute bottom-6 flex h-9 items-center gap-2 border border-white/16 text-gray-500 transition-colors hover:border-white/40 hover:text-white ${
          isExpanded
            ? 'left-[22px] px-3'
            : 'left-10 w-9 -translate-x-1/2 justify-center'
        }`}
        aria-label="Change display theme"
        aria-expanded={open}
      >
        <ThemeDot color={current.color} />
        {isExpanded && (
          <span className="font-mono text-[10px] tracking-[0.22em]">{current.label}</span>
        )}
      </button>

      {open && flyoutPos && createPortal(
        <div
          ref={flyoutRef}
          style={{
            position: 'fixed',
            bottom: flyoutPos.bottom,
            left: flyoutPos.left,
            zIndex: 9999,
          }}
          className="min-w-[148px] border border-white/16 bg-black shadow-lg"
        >
          <div className="border-b border-white/8 px-3 py-2">
            <span className="text-[9px] font-mono tracking-[0.28em] text-gray-600">DISPLAY MODE</span>
          </div>
          {THEMES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTheme(t.id as Theme); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left font-mono text-[11px] tracking-[0.18em] transition-colors ${
                theme === t.id
                  ? 'bg-white/[0.06] text-white'
                  : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
              }`}
            >
              <ThemeDot color={t.color} />
              <span>{t.label}</span>
              {theme === t.id && <span className="ml-auto text-red-500">◆</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

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

      {/* Theme toggle — above collapse button, always centered in the fixed 80px column */}
      <ThemeSidebarToggle isExpanded={isExpanded} />

      {/* Toggle button — always centered in the fixed 80px column */}
      <button
        type="button"
        onClick={onToggleExpanded}
        className="absolute bottom-[68px] left-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center border border-white/16 text-gray-500 transition-colors hover:border-white/40 hover:text-white"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <SidebarSimple weight="bold" className="h-4 w-4" /> : <SidebarSimple weight="bold" className="h-4 w-4" />}
      </button>
    </motion.div>
    </>
  );
}
