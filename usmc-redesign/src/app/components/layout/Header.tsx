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

interface HeaderProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  isExpanded: boolean;
  isMobile?: boolean;
}

export function Header({ isLoggedIn, onToggleLogin, isExpanded, isMobile }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = isLoggedIn ? loggedInItems : loggedOutItems;

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
                <SheetDescription className="text-[11px] font-mono tracking-[0.18em] text-gray-600 uppercase">
                  Navigation
                </SheetDescription>
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
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-green-500/30 bg-green-900/10 rounded-sm">
          <div className="flex h-4 items-center">
            <div className="h-4 w-1.5 rounded-sm bg-green-500 animate-pulse" />
          </div>
          <span className="text-sm text-green-400 font-mono tracking-widest">UNCLASSIFIED</span>
        </div>
      </div>
    </motion.header>
  );
}
