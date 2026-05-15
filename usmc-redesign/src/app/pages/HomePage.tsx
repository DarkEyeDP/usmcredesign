import { useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, DollarSign, GraduationCap, ArrowRightLeft, ExternalLink, Newspaper, MessageSquare, Anchor } from 'lucide-react';
import { HeroSection } from '@/app/features/hero';
import { SiteLogo } from '@/app/components/layout/SiteLogo';
import { useNewsItems } from '@/app/features/news';
import recruitImage from '@/app/assets/hero-3.webp';
import actionImage from '@/app/assets/hero-5.webp';

interface HomePageProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export function HomePage({ isFullscreen = false, onToggleFullscreen }: HomePageProps) {
  const navigate = useNavigate();
  const { newsItems, pressReleases, loading: newsLoading } = useNewsItems();

  // Operations Feed carousel (news articles — they have images)
  const [opIndex, setOpIndex] = useState(0);
  const opTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opItems = newsItems.slice(0, 8);

  function startOpTimer() {
    if (opTimerRef.current) clearInterval(opTimerRef.current);
    opTimerRef.current = setInterval(() => {
      setOpIndex(i => (opItems.length > 0 ? (i + 1) % opItems.length : 0));
    }, 8000);
  }

  useEffect(() => {
    if (opItems.length === 0) return;
    startOpTimer();
    return () => { if (opTimerRef.current) clearInterval(opTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opItems.length]);

  function opPrev() {
    setOpIndex(i => (opItems.length > 0 ? (i - 1 + opItems.length) % opItems.length : 0));
    startOpTimer();
  }

  function opNext() {
    setOpIndex(i => (opItems.length > 0 ? (i + 1) % opItems.length : 0));
    startOpTimer();
  }

  const currentOp = opItems[opIndex] ?? null;

  // Marine Corps News panel — press releases (top 3)
  const newsPanel = pressReleases.slice(0, 3);

  const leftServices = [
    { icon: DollarSign, label: 'PAY & BENEFITS', desc: 'Manage pay, allowances and benefits.', path: '/pay-benefits' },
    { icon: GraduationCap, label: 'EDUCATION', desc: 'Tuition assistance, TA guidance, and education planning.', path: '/education' },
    { icon: Newspaper, label: 'LATEST NEWS', desc: 'Track official news stories and press releases.', path: '/news' },
  ];

  const rightServices = [
    { icon: DollarSign, label: 'BONUS TOOL', desc: 'Estimate SRB and continuation pay opportunities.', path: '/pay-benefits/bonuses' },
    { icon: MessageSquare, label: 'MARADMINS', desc: 'Search Marine administrative messages and references.', path: '/messages' },
    { icon: ArrowRightLeft, label: 'LATERAL MOVE', desc: 'Compare MOS options and find matching opportunities.', path: '/lateral-move' },
  ];

  const mobileServices = [
    leftServices[0],
    rightServices[0],
    leftServices[1],
    rightServices[1],
    leftServices[2],
    rightServices[2],
  ];


  const resources = [
    { label: 'UNIFORMS & APPEARANCE', href: 'https://www.tecom.marines.mil/resources/marine-corps-uniform-board/' },
    { label: 'LEGAL SERVICES', href: 'https://www.dso.marines.mil/#i-need-to-talk-to-someone' },
    { label: 'MARINE CORPS RELIEF SOCIETY', href: 'https://www.nmcrs.org' },
    { label: 'PROMOTION INFORMATION', href: 'https://www.manpower.marines.mil/Divisions/Manpower-Management/Performance-Branch/Promotion-Section/' },
    { label: 'CONTACT YOUR CONGRESSMAN' },
  ];

  return (
    <div className="relative min-h-screen bg-black pb-20 md:pb-0">
      <SEOHead
        description="Official tools and resources for active-duty Marines. Browse MARADMIN messages, calculate pay and bonuses, explore lateral move MOS options, and access education benefits."
        path="/"
      />
      <HeroSection isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} />

      {/* Our Mission Section */}
      <div className="bg-black border-t border-white/12 py-10 px-6 md:py-12 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <div className="text-sm text-red-500 font-bold tracking-[0.25em] mb-4">OUR MISSION</div>
            <h1 className="text-lg font-black text-white tracking-wide leading-snug mb-4">
              THE MARINE CORPS EXISTS TO WIN OUR NATION'S BATTLES AND DEVELOP QUALITY CITIZENS COMMITTED TO MAKING A DIFFERENCE.
            </h1>
            <button className="text-sm text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
              STAY MARINE<span className="text-red-600">.</span>
            </button>
          </div>

          <div className="border border-white/16 p-6 bg-black/50">
            <div className="space-y-4">
              {[
                { label: 'GLOBAL PRESENCE', value: '100+', unit: 'COUNTRIES' },
                { label: 'ACTIVE DUTY MARINES', value: '172K+', unit: '' },
                { label: 'ESTABLISHED', value: '1775', unit: '' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline justify-between border-b border-white/12 pb-3 last:border-0 last:pb-0">
                  <span className="text-[13px] text-gray-500 tracking-wider">{stat.label}</span>
                  <span className="text-2xl font-black text-red-500">{stat.value} <span className="text-sm text-gray-500">{stat.unit}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* I Need To Section */}
      <div className="bg-black border-t border-white/12 py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm text-gray-500 font-mono tracking-[0.3em] mb-8">I NEED...</div>

          <div className="grid grid-cols-2 gap-0 relative md:hidden">
            {mobileServices.map((s, index) => {
              const Icon = s.icon;
              const isTopRow = index < 2;
              const isLeftCol = index % 2 === 0;

              return (
                <motion.button
                  key={s.label}
                  onClick={() => navigate(s.path)}
                  className={`flex h-full min-h-[160px] items-start gap-4 p-5 bg-black text-left hover:bg-red-900/10 transition-colors group border-b border-white/12 ${
                    isTopRow ? 'border-t' : ''
                  } ${isLeftCol ? 'border-l border-r border-white/12' : 'border-r border-white/12'}`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white tracking-wide mb-1">{s.label}</div>
                    <div className="text-sm text-gray-500 leading-relaxed">{s.desc}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="hidden md:grid md:grid-cols-3 gap-0 relative">
            {/* Left services */}
            <div className="flex flex-col border-l border-white/12">
              {leftServices.map((s, index) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.label}
                    onClick={() => navigate(s.path)}
                    className={`flex items-start gap-4 p-5 border-b border-white/12 bg-black text-left hover:bg-red-900/10 transition-colors group ${
                      index === 0 ? 'border-t' : ''
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white tracking-wide mb-1">{s.label}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">{s.desc}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Center focal panel */}
            <div className="hidden md:flex items-center justify-center border border-white/12 bg-black/50 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)' }} />
              <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
                <div className="text-[11px] font-mono tracking-[0.35em] text-gray-500">NEXT OBJECTIVE</div>
                <div className="text-2xl font-black tracking-[0.28em] text-white">MOVE WITH PURPOSE</div>
                <div className="h-px w-16 bg-red-600/50" />
                <div className="text-xs tracking-[0.3em] text-gray-500">STAY MARINE. KEEP PRESSING.</div>
              </div>
            </div>

            {/* Right services */}
            <div className="flex flex-col border-l border-r border-white/12 md:border-l-0">
              {rightServices.map((s, index) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.label}
                    onClick={() => navigate(s.path)}
                    className={`flex items-start gap-4 p-5 border-b border-white/12 bg-black text-left hover:bg-red-900/10 transition-colors group ${
                      index === 0 ? 'border-t' : ''
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white tracking-wide mb-1">{s.label}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">{s.desc}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={() => navigate('/messages')}
              className="text-sm text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
            >
              SEARCH MARADMINS <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Operations Feed + News + Resources */}
      <div className="bg-black border-t border-white/12 py-16 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Operations Feed */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-red-500 tracking-[0.2em]">OPERATIONS FEED</h2>
              <div className="flex gap-2">
                <button
                  onClick={opPrev}
                  disabled={newsLoading || opItems.length === 0}
                  className="w-6 h-6 border border-white/16 flex items-center justify-center hover:border-white/40 transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-3 h-3 text-gray-500 rotate-180" />
                </button>
                <button
                  onClick={opNext}
                  disabled={newsLoading || opItems.length === 0}
                  className="w-6 h-6 border border-white/16 flex items-center justify-center hover:border-white/40 transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden border border-white/12">
              {newsLoading || !currentOp ? (
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-end p-4 animate-pulse">
                  <div className="space-y-2 w-full">
                    <div className="h-2 w-24 bg-white/10 rounded" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-3 w-1/2 bg-white/8 rounded" />
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.a
                    key={currentOp.id}
                    href={currentOp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block aspect-video overflow-hidden group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {currentOp.imageUrl ? (
                      <>
                        <img
                          src={currentOp.imageUrl}
                          alt={currentOp.title}
                          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      {currentOp.category && (
                        <div className="text-[10px] text-gray-400 font-mono tracking-widest mb-1">{currentOp.category}</div>
                      )}
                      <h3 className="text-sm font-black text-white tracking-tight leading-snug line-clamp-2">{currentOp.title}</h3>
                    </div>
                    {opItems.length > 1 && (
                      <div className="absolute bottom-2 right-3 z-10 flex gap-1">
                        {opItems.map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === opIndex ? 'bg-red-500' : 'bg-white/20'}`} />
                        ))}
                      </div>
                    )}
                  </motion.a>
                </AnimatePresence>
              )}
            </div>

            {currentOp ? (
              <a
                href={currentOp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm text-red-500 font-bold tracking-widest hover:text-red-400 flex items-center gap-1"
              >
                FULL STORY <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <div className="mt-3 h-5" />
            )}
          </div>

          {/* Marine Corps News — press releases */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-red-500 tracking-[0.2em]">MARINE CORPS NEWS</h2>
            </div>
            <div className="space-y-4">
              {newsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-b border-white/12 pb-4 animate-pulse">
                      <div className="h-2 w-24 bg-white/8 rounded mb-2" />
                      <div className="h-3 w-full bg-white/8 rounded mb-1" />
                      <div className="h-3 w-3/4 bg-white/6 rounded" />
                    </div>
                  ))
                : newsPanel.length > 0
                  ? newsPanel.map((item) => (
                      <div key={item.id} className="border-b border-white/12 pb-4 last:border-0">
                        <div className="text-xs text-gray-600 font-mono tracking-widest mb-1.5">{formatDate(item.pubDate)}</div>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-white hover:text-red-400 transition-colors text-left tracking-wide leading-snug block"
                        >
                          {item.title}
                        </a>
                      </div>
                    ))
                  : (
                    <div className="text-xs text-gray-600 py-4">News unavailable.</div>
                  )
              }
            </div>
            <button
              onClick={() => navigate('/news')}
              className="mt-4 text-sm text-red-500 font-bold tracking-widest hover:text-red-400 flex items-center gap-1"
            >
              VIEW ALL NEWS <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Resources */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-red-500 tracking-[0.2em]">RESOURCES</h2>
            </div>
            <div className="space-y-0">
              {resources.map((r, i) =>
                r.href ? (
                  <a
                    key={i}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between py-3 border-b border-white/12 text-left hover:text-red-400 transition-colors group"
                  >
                    <span className="text-sm text-gray-300 tracking-wide group-hover:text-red-400 transition-colors">{r.label}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-red-500 transition-colors" />
                  </a>
                ) : (
                  <div key={i} className="w-full flex items-center justify-between py-3 border-b border-white/12 text-left">
                    <span className="text-sm text-gray-500 tracking-wide">{r.label}</span>
                    <span className="text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5 flex-shrink-0">
                      COMING SOON
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quote / CTA — full-width grid so image bleeds to the left edge */}
      <div className="bg-black border-t border-white/12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Hero image — no left margin, bleeds to edge */}
          <div className="hidden md:block col-span-1 relative overflow-hidden min-h-[280px]">
            <img
              src={recruitImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient fade into the next panel */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)'
            }} />
          </div>

          {/* Earned Never Given — center */}
          <div className="col-span-1 p-10 flex flex-col justify-center items-center bg-red-900/5 border-t md:border-x border-white/12 text-center">
            <motion.div
              className="mb-4"
              animate={{ filter: ['brightness(1)', 'brightness(1.35)', 'brightness(1)'] }}
              transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }}
            >
              <SiteLogo size={80} variant="red" />
            </motion.div>
            <div className="text-sm font-black text-white tracking-wide">STAY MARINE<span className="text-red-600">.</span></div>
            <div className="text-sm font-black text-white tracking-wide">CONTINUE OUR LEGACY<span className="text-red-600">.</span></div>
          </div>

          {/* Hero image — right panel */}
          <div className="hidden md:block col-span-1 relative overflow-hidden min-h-[280px]">
            <img
              src={actionImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to left, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)'
            }} />
          </div>
        </div>
      </div>

      {/* Honor Courage Commitment */}
      <div className="bg-black border-t border-white/12 py-12 px-8 text-center">
        <div className="text-3xl font-black text-white tracking-tight mb-2">HONOR<span className="text-red-600">.</span> COURAGE<span className="text-red-600">.</span> COMMITMENT<span className="text-red-600">.</span></div>
        <div className="text-xs text-gray-500 tracking-widest">VALUES THAT NEVER CHANGE<span className="text-red-600">.</span></div>
        <div className="w-8 h-0.5 bg-red-600 mx-auto mt-4" />
      </div>
    </div>
  );
}
