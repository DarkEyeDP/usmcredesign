import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { gridStyle } from '@/app/features/education/degree-planner/constants';
import { EDUCATION_TABS, INACTIVE_EDUCATION_TABS } from '../constants';

export function CollegeHero() {
  const navigate = useNavigate();

  function handleTabClick(tab: string) {
    if (INACTIVE_EDUCATION_TABS.has(tab) || tab === 'COLLEGE & UNIVERSITY') return;
    if (tab === 'OVERVIEW') navigate('/education');
    else if (tab === 'TA EDUCATION') navigate('/education/tuition-assistance');
    else if (tab === 'DEGREE PLANNER') navigate('/education/degree-planner');
  }

  return (
    <div className="relative pt-20 overflow-hidden border-b border-white/12">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 opacity-[0.04]" style={gridStyle} />

      <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
        <div className="absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right hidden lg:block">
          <div className="text-[12px] font-black text-white tracking-widest">KNOWLEDGE STRENGTHENS<span className="text-red-600">.</span></div>
          <div className="text-[12px] font-black text-white tracking-widest mb-2">EVERY MISSION<span className="text-red-600">.</span></div>
          <div className="w-6 h-px bg-red-600 ml-auto mb-2" />
          <div className="text-[11px] text-gray-500 tracking-wider">FIND YOUR SCHOOL<span className="text-red-600">.</span></div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 py-6 lg:pr-56">
          <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
            <button onClick={() => navigate('/')} className="hover:text-gray-400 transition-colors bg-transparent p-0 border-0 text-[12px] font-mono tracking-wider">HOME</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navigate('/education')} className="hover:text-gray-400 transition-colors bg-transparent p-0 border-0 text-[12px] font-mono tracking-wider">EDUCATION</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-red-500">COLLEGE & UNIVERSITIES</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
              className="page-hero-title mb-3"
            >
              COLLEGE & UNIVERSITIES<span className="text-red-600">.</span>
            </motion.h1>
          </div>
          <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3">
            Find TA-eligible schools that fit your mission, your goals, and your future.
          </p>
        </div>

        <div className="flex items-center px-8 -mb-px overflow-x-auto">
          {EDUCATION_TABS.map(tab => {
            const isActive = tab === 'COLLEGE & UNIVERSITY';
            const isInactive = INACTIVE_EDUCATION_TABS.has(tab);
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
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
                    layoutId="eduTabLine-college"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
