import { Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function StatusBar() {
  const location = useLocation();

  return (
    <div className="w-full bg-black border-t border-white/12 px-4 py-3 md:px-6 md:py-2.5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="hidden items-center justify-between gap-3 md:flex md:justify-start">
        <div className="flex flex-col">
          <span className="text-xs text-gray-600 font-mono tracking-widest">STATUS</span>
          <span className="text-[13px] text-green-500 font-bold tracking-widest">READY</span>
        </div>
        <svg width="80" height="20" viewBox="0 0 80 20" className="text-green-500/60 flex-shrink-0" overflow="visible">
          <defs>
            <filter id="ekgDotGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M0,10 L8,10 L12,4 L16,16 L20,2 L24,18 L28,10 L36,10 L40,6 L44,14 L48,10 L56,10 L60,8 L64,12 L68,10 L80,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle r="2" fill="#4ade80" filter="url(#ekgDotGlow)">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.15; 0.48; 1"
              keyPoints="0; 0.06; 0.52; 1"
              keySplines="0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1"
              path="M0,10 L8,10 L12,4 L16,16 L20,2 L24,18 L28,10 L36,10 L40,6 L44,14 L48,10 L56,10 L60,8 L64,12 L68,10 L80,10"
            />
          </circle>
        </svg>
      </div>

      <div className="flex items-center justify-center gap-4 md:gap-5">
        <Link
          to="/sitemap"
          className={`text-[11px] font-mono tracking-[0.22em] transition-colors ${
            location.pathname === '/sitemap' ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
          }`}
        >
          SITEMAP
        </Link>
        <span className="text-white/16">|</span>
        <Link
          to="/privacy-policy"
          className={`text-[11px] font-mono tracking-[0.22em] transition-colors ${
            location.pathname === '/privacy-policy' ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
          }`}
        >
          PRIVACY POLICY
        </Link>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <span className="text-xs text-gray-600 font-mono tracking-wide text-right leading-relaxed">
          NOT AFFILIATED WITH THE U.S. DEPARTMENT OF WAR<br />
          OR THE U.S. MARINE CORPS
        </span>
        <Shield className="w-5 h-5 text-gray-700" />
      </div>

      <div className="flex items-center justify-center gap-2 md:hidden">
        <Shield className="w-4 h-4 text-gray-700 flex-shrink-0" />
        <span className="text-[10px] text-gray-600 font-mono tracking-[0.14em] text-center leading-relaxed">
          NOT AFFILIATED WITH THE U.S. DEPARTMENT OF WAR OR THE U.S. MARINE CORPS
        </span>
      </div>
      </div>
    </div>
  );
}
