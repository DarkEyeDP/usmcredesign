import { Shield } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="w-full bg-black border-t border-white/12 flex items-center justify-between px-6 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-600 font-mono tracking-widest">STATUS</span>
          <span className="text-[13px] text-green-500 font-bold tracking-widest">READY</span>
        </div>
        <svg width="80" height="20" viewBox="0 0 80 20" className="text-green-500/60">
          <polyline
            points="0,10 8,10 12,4 16,16 20,2 24,18 28,10 36,10 40,6 44,14 48,10 56,10 60,8 64,12 68,10 80,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-[13px] text-gray-500 tracking-[0.2em] font-mono">FOLLOW. ENGAGE. STAY INFORMED.</span>
        <div className="flex items-center gap-3 mt-1">
          {/* X / Twitter */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.722-8.841L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {/* Facebook */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {/* Instagram */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          {/* YouTube */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          {/* Signal/Wifi icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">
            <path d="M1.42 9a16 16 0 0121.16 0" />
            <path d="M5 12.55a11 11 0 0114.08 0" />
            <path d="M10.54 16.1a6 6 0 012.92 0" />
            <circle cx="12" cy="20" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600 font-mono tracking-wide text-right leading-relaxed">
          NOT AFFILIATED WITH THE U.S. DEPARTMENT OF WAR<br />
          OR THE U.S. MARINE CORPS
        </span>
        <Shield className="w-5 h-5 text-gray-700" />
      </div>
    </div>
  );
}
