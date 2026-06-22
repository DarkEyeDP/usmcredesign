import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu } from 'lucide-react';
import { SiteLogo } from '@/app/components/layout/SiteLogo';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet';
import { loggedInItems, loggedOutItems } from './navigationConfig';
import { useTheme, THEMES, type Theme } from '@/app/features/theme/ThemeContext';

declare const __APP_VERSION__: string;
const MOBILE_MENU_VERSION = `v${__APP_VERSION__}`;

function formatZuluTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
}


interface HeaderProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  isExpanded: boolean;
  isMobile?: boolean;
}

export function Header({ isLoggedIn, onToggleLogin: _onToggleLogin, isExpanded, isMobile }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const items = isLoggedIn ? loggedInItems : loggedOutItems;
  const [zuluTime, setZuluTime] = useState(() => formatZuluTime(new Date()));

  useEffect(() => {
    const updateZuluTime = () => setZuluTime(formatZuluTime(new Date()));
    updateZuluTime();

    const intervalId = window.setInterval(updateZuluTime, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <motion.header
      className="fixed top-0 right-0 h-20 bg-black/95 border-b border-white/12 flex items-center justify-between px-6 z-40"
      initial={false}
      animate={{ left: isMobile ? 0 : (isExpanded ? 192 : 80) }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <Link to="/" className="flex items-center gap-3">
        <SiteLogo size={isMobile ? 40 : 54} />
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-widest text-white leading-tight">STAY MARINE<span className="text-red-600">.</span></h1>
          <p className="text-[13px] text-gray-400 tracking-[0.3em]">CONTINUE OUR LEGACY<span className="text-red-600">.</span></p>
        </div>
      </Link>

      <div className="flex items-center gap-5">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center border border-white/14 bg-white/[0.03] text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                aria-label="Open site navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-l border-white/12 bg-black p-0 text-white flex flex-col">
              {/* Header with logo */}
              <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <SiteLogo size={44} />
                  <div>
                    <SheetTitle className="text-base font-black tracking-widest text-white leading-tight">
                      STAY MARINE<span className="text-red-600">.</span>
                    </SheetTitle>
                    <p className="text-[11px] tracking-[0.28em] text-gray-500 leading-tight mt-0.5">CONTINUE OUR LEGACY</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <SheetDescription className="text-[11px] font-mono tracking-[0.18em] text-gray-600 uppercase">
                    Navigation
                  </SheetDescription>
                  <div className="flex items-center gap-2 border border-white/12 bg-white/[0.03] px-3 py-1.5 font-mono rounded-sm">
                    <span className="text-[10px] tracking-[0.24em] text-gray-500">ZULU</span>
                    <span className="min-w-[72px] text-right text-sm tracking-widest text-white">{zuluTime}</span>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="flex flex-col py-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);

                    return (
                      <SheetClose asChild key={item.path}>
                        <button
                          type="button"
                          onClick={() => navigate(item.path)}
                          className={`relative flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                            active ? 'bg-red-950/25 text-red-400' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-red-600" />
                          )}
                          <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-red-500' : 'text-gray-600'}`} />
                          <span className="text-[12px] font-bold tracking-[0.18em] flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black tracking-widest text-white">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </SheetClose>
                    );
                  })}
                </div>

                <div className="mt-auto border-t border-white/8 px-5 py-5">
                  <div className="mb-3 text-[9px] font-mono tracking-[0.28em] text-gray-700">UTILITY</div>
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <button
                        type="button"
                        onClick={() => navigate('/sitemap')}
                        className="border border-white/10 px-4 py-3 text-left text-[11px] font-bold tracking-[0.18em] text-gray-500 transition-colors hover:border-white/20 hover:text-gray-300"
                      >
                        SITEMAP
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        type="button"
                        onClick={() => navigate('/privacy-policy')}
                        className="border border-white/10 px-4 py-3 text-left text-[11px] font-bold tracking-[0.18em] text-gray-500 transition-colors hover:border-white/20 hover:text-gray-300"
                      >
                        PRIVACY POLICY
                      </button>
                    </SheetClose>

                    {/* Display mode selector */}
                    <div className="mt-1">
                      <div className="mb-2 text-[9px] font-mono tracking-[0.28em] text-gray-700">DISPLAY MODE</div>
                      <div className="flex gap-1.5">
                        {THEMES.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTheme(t.id as Theme)}
                            className={`flex flex-1 flex-col items-center gap-1.5 border py-2.5 font-mono text-[9px] tracking-[0.16em] transition-colors ${
                              theme === t.id
                                ? 'border-red-600/60 bg-red-950/20 text-red-400'
                                : 'border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-400'
                            }`}
                            aria-pressed={theme === t.id}
                          >
                            <span
                              className="block h-4 w-6 border border-black/20"
                              style={{ backgroundColor: t.color }}
                            />
                            {t.label.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-white/8 pt-4 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-white/18">
                    {MOBILE_MENU_VERSION}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
        <div className="hidden md:flex items-stretch gap-2">
          <div className="flex items-center gap-2 border border-white/12 bg-white/[0.03] px-3 py-1.5 font-mono rounded-sm">
            <span className="text-[10px] tracking-[0.24em] text-gray-500">ZULU</span>
            <span className="min-w-[72px] text-right text-sm tracking-widest text-white">{zuluTime}</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm ${
            theme === 'desert'
              ? 'border-green-700/60 bg-green-800/12'
              : 'border-green-500/30 bg-green-900/10'
          }`}>
            <div className="flex h-4 items-center">
              <div className={`h-4 w-1.5 rounded-sm animate-pulse ${theme === 'desert' ? 'bg-green-700' : 'bg-green-500'}`} />
            </div>
            <span className={`text-sm font-mono tracking-widest ${theme === 'desert' ? 'text-green-700' : 'text-green-400'}`}>UNCLASSIFIED</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
