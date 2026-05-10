import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, Play, DollarSign, GraduationCap, Home, HeartPulse, Users, ArrowRightLeft, ChevronLeft } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  const services = [
    { icon: DollarSign, label: 'PAY & BENEFITS', desc: 'Manage pay, allowances and benefits.', path: '/pay-benefits' },
    { icon: GraduationCap, label: 'EDUCATION', desc: 'Tuition assistance, GI Bill, credentialing and more.', path: '/education' },
    { icon: Home, label: 'HOUSING', desc: 'Find housing, apply for BAH, relocation resources.', path: '/' },
    { icon: HeartPulse, label: 'HEALTH & WELLNESS', desc: 'Medical, dental and mental health care.', path: '/' },
    { icon: Users, label: 'FAMILY SUPPORT', desc: 'Programs and services for Marines and families.', path: '/' },
    { icon: ArrowRightLeft, label: 'TRANSITION ASSISTANCE', desc: 'Plan for your future after the Corps.', path: '/' },
  ];

  const news = [
    { date: 'MAY 20, 2024', title: 'III MARINE EXPEDITIONARY FORCE COMPLETES LARGE SCALE EXERCISE' },
    { date: 'MAY 17, 2024', title: "COMMANDANT'S MESSAGE: FORGING THE FUTURE" },
    { date: 'MAY 15, 2024', title: 'MARINES PARTICIPATE IN BALTOPS 24' },
  ];

  const resources = [
    'SAFETY & ACCIDENT PREVENTION',
    'UNIFORMS & APPEARANCE',
    'BOARDS & PROMOTIONS',
    'LEGAL SERVICES',
    'MARINE CORPS RELIEF SOCIETY',
    'EMERGENCY INFORMATION',
    'CONTACT YOUR CONGRESSMAN',
  ];

  return (
    <div className="relative min-h-screen bg-black pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Dramatic background */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 70% 40%, rgba(30,10,0,0.8) 0%, rgba(0,0,0,0.95) 70%)',
          backgroundColor: '#050505'
        }} />
        {/* Atmospheric overlay layers */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(80,20,0,0.4) 50%, transparent 100%)'
        }} />
        {/* Tactical grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Red accent line right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-600/40" />

        {/* Slide indicators */}
        <div className="hidden md:flex absolute bottom-32 left-8 items-center gap-4 z-20">
          {['01', '02', '03', '04'].map((n, i) => (
            <button key={n} className={`text-xs font-mono tracking-widest transition-colors ${i === 0 ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
              {n}
            </button>
          ))}
        </div>

        {/* Video preview top right */}
        <div className="hidden md:flex absolute top-28 right-8 z-20 border border-white/10 bg-black/50 p-3 items-center gap-3 w-52">
          <button className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center flex-shrink-0 hover:border-white/80 transition-colors">
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          </button>
          <div>
            <div className="text-xs text-gray-400 tracking-widest">WATCH</div>
            <div className="text-sm text-white font-bold tracking-wide">THE LEGACY</div>
            <div className="text-xs text-gray-500 mt-0.5">BEHIND EVERY BATTLE IS EVERY MARINE<span className="text-red-600">.</span></div>
            <div className="text-xs text-gray-600 font-mono">02:15</div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-sm text-gray-400 font-mono tracking-[0.3em] mb-6">EST. 1775</div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 leading-[0.9]">
              ANSWER THE<br />CALL<span className="text-red-600">,</span> ALWAYS<span className="text-red-600">.</span>
            </h1>
            <p className="text-sm text-gray-400 mb-8 tracking-wide max-w-xs md:max-w-sm">
              WE DON'T PROMISE A FAIR FIGHT<span className="text-red-600">.</span><br />WE WIN THE ONES THAT MATTER<span className="text-red-600">.</span>
            </p>
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-8 py-3 bg-transparent border border-white/40 text-white text-xs font-bold tracking-widest hover:bg-white/5 transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              EXPLORE THE CORPS
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="bg-black border-t border-white/12 py-10 px-6 md:py-12 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <div className="text-sm text-red-500 font-bold tracking-[0.25em] mb-4">OUR MISSION</div>
            <p className="text-lg font-black text-white tracking-wide leading-snug mb-4">
              THE MARINE CORPS EXISTS TO WIN OUR NATION'S BATTLES AND DEVELOP QUALITY CITIZENS COMMITTED TO MAKING A DIFFERENCE.
            </p>
            <button className="text-sm text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
              SEMPER FIDELIS<span className="text-red-600">.</span>
            </button>
          </div>

          <div className="border border-white/16 p-6 bg-black/50">
            <div className="space-y-4">
              {[
                { label: 'FORWARD DEPLOYED', value: '90+', unit: 'COUNTRIES' },
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
          <div className="text-sm text-gray-500 font-mono tracking-[0.3em] mb-8">I NEED TO...</div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-0 relative">
            {/* Left services */}
            <div className="flex flex-col gap-px">
              {services.slice(0, 3).map((s) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.label}
                    onClick={() => navigate(s.path)}
                    className="flex items-start gap-4 p-5 border border-white/12 bg-black text-left hover:bg-red-900/10 hover:border-white/30 transition-colors group"
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
                <div className="text-[11px] font-mono tracking-[0.35em] text-gray-500">USMC PORTAL</div>
                <div className="text-2xl font-black tracking-[0.28em] text-white">MARINES</div>
                <div className="h-px w-16 bg-red-600/50" />
                <div className="text-xs tracking-[0.3em] text-gray-500">IDENTITY UPDATE IN PROGRESS</div>
              </div>
            </div>

            {/* Right services */}
            <div className="flex flex-col gap-px">
              {services.slice(3).map((s) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.label}
                    onClick={() => navigate(s.path)}
                    className="flex items-start gap-4 p-5 border border-white/12 bg-black text-left hover:bg-red-900/10 hover:border-white/30 transition-colors group"
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
            <button className="text-sm text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors flex items-center gap-1 ml-auto">
              VIEW ALL SERVICES <ChevronRight className="w-3 h-3" />
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
                <button className="w-6 h-6 border border-white/16 flex items-center justify-center hover:border-white/40 transition-colors">
                  <ChevronLeft className="w-3 h-3 text-gray-500" />
                </button>
                <button className="w-6 h-6 border border-white/16 flex items-center justify-center hover:border-white/40 transition-colors">
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black border border-white/12 flex items-end p-4">
                <div className="absolute inset-0 opacity-20" style={{
                  background: 'linear-gradient(135deg, rgba(30,20,10,1) 0%, rgba(5,5,5,1) 100%)'
                }} />
                <div className="relative z-10">
                  <div className="text-xs text-gray-400 font-mono tracking-widest mb-1">INDO-PACIFIC</div>
                  <h3 className="text-lg font-black text-white tracking-tight">BALIKATAN 24</h3>
                  <p className="text-sm text-gray-400 mt-1">Strengthening alliances. Preserving peace.</p>
                </div>
              </div>
            </div>
            <button className="mt-3 text-sm text-red-500 font-bold tracking-widest hover:text-red-400 flex items-center gap-1">
              FULL STORY <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Marine Corps News */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-red-500 tracking-[0.2em]">MARINE CORPS NEWS</h2>
            </div>
            <div className="space-y-4">
              {news.map((item, i) => (
                <div key={i} className="border-b border-white/12 pb-4 last:border-0">
                  <div className="text-xs text-gray-600 font-mono tracking-widest mb-1.5">{item.date}</div>
                  <button className="text-xs font-bold text-white hover:text-red-400 transition-colors text-left tracking-wide leading-snug">
                    {item.title}
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-red-500 font-bold tracking-widest hover:text-red-400 flex items-center gap-1">
              VIEW ALL NEWS <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Resources */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-red-500 tracking-[0.2em]">RESOURCES</h2>
            </div>
            <div className="space-y-0">
              {resources.map((r, i) => (
                <button key={i} className="w-full flex items-center justify-between py-3 border-b border-white/12 text-left hover:text-red-400 transition-colors group">
                  <span className="text-sm text-gray-300 tracking-wide">{r}</span>
                  <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-red-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quote / CTA */}
      <div className="bg-black border-t border-white/12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Image placeholder */}
          <div className="hidden md:block col-span-1 relative overflow-hidden min-h-32 bg-gradient-to-br from-gray-900 to-black p-6">
            <div className="flex items-end h-full">
              <div className="text-xs text-gray-700 font-mono">[ MARINES IMAGE ]</div>
            </div>
          </div>

          {/* Become one of us */}
          <div className="col-span-1 p-10 flex flex-col justify-center bg-black border-t md:border-x border-white/12">
            <div className="text-sm text-gray-500 tracking-widest mb-2">DO YOU HAVE WHAT IT TAKES?</div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-6">BECOME ONE OF US.</h2>
            <button className="flex items-center gap-2 text-sm font-bold text-red-500 tracking-widest hover:text-red-400 transition-colors">
              FIND YOUR PATH <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Earned Never Given */}
          <div className="col-span-1 p-10 flex flex-col justify-center items-center bg-red-900/5 border-t md:border-l border-white/12 text-center">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-60">
              <circle cx="24" cy="24" r="22" stroke="#b8912a" strokeWidth="1.5" fill="none" />
              <ellipse cx="24" cy="24" rx="20" ry="9" stroke="#b8912a" strokeWidth="1.5" fill="none" />
              <path d="M24 2 L24 46" stroke="#b8912a" strokeWidth="1.5" fill="none" />
              <circle cx="24" cy="24" r="5" fill="#b8912a" />
            </svg>
            <div className="text-sm font-black text-white tracking-wide">EARNED<span className="text-red-600">.</span></div>
            <div className="text-sm font-black text-white tracking-wide">NEVER GIVEN<span className="text-red-600">.</span></div>
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
