import { Search, LogIn, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteLogo } from '@/app/components/layout/SiteLogo';


interface HeaderProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  isExpanded: boolean;
  isMobile?: boolean;
}

export function Header({ isLoggedIn, onToggleLogin, isExpanded, isMobile }: HeaderProps) {
  return (
    <motion.header
      className="fixed top-0 right-0 h-20 bg-black/95 border-b border-white/12 flex items-center justify-between px-6 z-40"
      animate={{ left: isMobile ? 0 : (isExpanded ? 192 : 80) }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex items-center gap-3">
        <SiteLogo size={isMobile ? 40 : 54} />
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-widest text-white leading-tight">STAY MARINE<span className="text-red-600">.</span></h1>
          <p className="text-[13px] text-gray-400 tracking-[0.3em]">SEMPER FIDELIS<span className="text-red-600">.</span></p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-green-500/30 bg-green-900/10 rounded-sm">
          <div className="flex h-4 items-center">
            <div className="h-4 w-1.5 rounded-sm bg-green-500 animate-pulse" />
          </div>
          <span className="text-sm text-green-400 font-mono tracking-widest">UNCLASSIFIED</span>
        </div>

        <button className="hidden md:block text-gray-400 hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>

        <motion.button
          onClick={onToggleLogin}
          className="flex items-center gap-2 px-3 py-2 md:px-5 border border-white/40 rounded-sm text-white text-xs font-bold tracking-widest hover:border-white/80 transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          {isLoggedIn ? (
            <>
              <LogOut className="w-3.5 h-3.5" />
              SIGN OUT
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              SIGN IN
            </>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
