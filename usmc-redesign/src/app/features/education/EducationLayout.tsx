import { useLocation, useNavigate, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

const TABS = ['OVERVIEW', 'TA EDUCATION', 'DEGREE PLANNER', 'COLLEGE & UNIVERSITY', 'CERTIFICATIONS', 'SKILLS & CAREER', 'RESOURCES'];
const INACTIVE_TABS = new Set(['CERTIFICATIONS', 'SKILLS & CAREER', 'RESOURCES']);
const TAB_ROUTES: Record<string, string> = {
  'OVERVIEW': '/education',
  'TA EDUCATION': '/education/tuition-assistance',
  'DEGREE PLANNER': '/education/degree-planner',
  'COLLEGE & UNIVERSITY': '/education/college-university',
};

const GRID_STYLE = {
  backgroundImage: 'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
};

interface RouteMeta {
  title: string;
  subtitle: string;
  breadcrumb: string | null;
  badge: { line1: string; line2?: string; sub: string[] };
}

const ROUTE_META: Record<string, RouteMeta> = {
  '/education': {
    title: 'EDUCATION',
    subtitle: 'Knowledge strengthens leaders. Advance your military career and prepare for life beyond the uniform with world-class education opportunities.',
    breadcrumb: null,
    badge: { line1: 'CONTINUOUS LEARNING', line2: 'LIFELONG IMPACT', sub: ['INVEST IN YOURSELF', 'INVEST IN THE MISSION'] },
  },
  '/education/tuition-assistance': {
    title: 'TUITION ASSISTANCE',
    subtitle: 'Active-duty Marines can receive up to $4,500 per fiscal year in tuition assistance for college courses — taken during off-duty time, at no cost to your military career.',
    breadcrumb: 'TUITION ASSISTANCE',
    badge: { line1: 'INVEST IN YOURSELF', line2: 'INVEST IN THE MISSION', sub: ['UP TO $4,500 PER FISCAL YEAR'] },
  },
  '/education/degree-planner': {
    title: 'DEGREE PLANNER',
    subtitle: "Plan your associate, bachelor's, or master's degree using USMC Tuition Assistance. Track JST credits, map TA-funded courses term by term, and monitor your $4,500 annual TA budget.",
    breadcrumb: 'DEGREE PLANNER',
    badge: { line1: 'PLAN YOUR PATH', line2: 'EARN YOUR DEGREE', sub: ['TERM BY TERM'] },
  },
  '/education/college-university': {
    title: 'COLLEGE & UNIVERSITIES',
    subtitle: 'Find TA-eligible schools that fit your mission, your goals, and your future.',
    breadcrumb: 'COLLEGE & UNIVERSITIES',
    badge: { line1: 'KNOWLEDGE STRENGTHENS', line2: 'EVERY MISSION', sub: ['FIND YOUR SCHOOL'] },
  },
};

export function EducationLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const meta = ROUTE_META[path] ?? ROUTE_META['/education'];
  const activeTab = Object.entries(TAB_ROUTES).find(([, route]) => route === path)?.[0] ?? 'OVERVIEW';

  return (
    <div className="min-h-screen bg-black text-white pb-5 md:pb-0">
      {/* Persistent hero — stays mounted across all /education/* routes */}
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 opacity-[0.04]" style={GRID_STYLE} />

        <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
          {/* Info badge */}
          <div className="absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right hidden lg:block overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={path + '-badge'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                <div className="text-[12px] font-black text-white tracking-widest">
                  {meta.badge.line1}<span className="text-red-600">.</span>
                </div>
                {meta.badge.line2 && (
                  <div className="text-[12px] font-black text-white tracking-widest mb-2">
                    {meta.badge.line2}<span className="text-red-600">.</span>
                  </div>
                )}
                <div className="w-6 h-px bg-red-600 ml-auto mb-2" />
                {meta.badge.sub.map(s => (
                  <div key={s} className="text-[11px] text-gray-500 tracking-wider">
                    {s}<span className="text-red-600">.</span>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-6 lg:pr-56">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="hover:text-gray-400 transition-colors bg-transparent p-0 border-0 text-[12px] font-mono tracking-wider">
                HOME
              </button>
              <ChevronRight className="w-3 h-3" />
              {meta.breadcrumb ? (
                <>
                  <button onClick={() => navigate('/education')} className="hover:text-gray-400 transition-colors bg-transparent p-0 border-0 text-[12px] font-mono tracking-wider">
                    EDUCATION
                  </button>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-red-500">{meta.breadcrumb}</span>
                </>
              ) : (
                <span className="text-red-500">EDUCATION</span>
              )}
            </div>

            {/* Title — re-animates on route change via key */}
            <div className="flex items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <AnimatePresence mode="wait">
                <motion.h1
                  key={path + '-title'}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
                  className="page-hero-title mb-2"
                >
                  {meta.title}<span className="text-red-600">.</span>
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={path + '-sub'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3"
              >
                {meta.subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Tab bar — single mounted instance, layoutId slides correctly */}
          <div className="flex items-center px-8 -mb-px overflow-x-auto">
            {TABS.map(tab => {
              const isActive = tab === activeTab;
              const isInactive = INACTIVE_TABS.has(tab);
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (isActive || isInactive) return;
                    const route = TAB_ROUTES[tab];
                    if (route) navigate(route);
                  }}
                  className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'text-white'
                      : isInactive
                        ? 'text-gray-700/70'
                        : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {tab}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                      layoutId="eduTabLine"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page content rendered here */}
      <Outlet />
    </div>
  );
}
