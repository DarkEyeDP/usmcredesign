import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronRight, Layout, Award } from 'lucide-react';
import { useNewsItems } from '@/app/features/news';
import { SiteLogo } from '@/app/components/layout/SiteLogo';
import { getCachedFeed } from '@/app/features/maradmin/maradminStorage';
import { SEOHead } from '@/app/components/SEOHead';
import cemeLogo from '@/app/assets/ceme-logo.png';
import mcwarLogo from '@/app/assets/mcwar-logo.png';
import commandStaffLogo from '@/app/assets/command-staff-logo.jpeg';
import ewsLogo from '@/app/assets/ews-logo.jpeg';
import cdetLogo from '@/app/assets/cdet-logo.jpg';

const tabs = ['OVERVIEW', 'TA EDUCATION', 'COLLEGE & UNIVERSITY', 'CERTIFICATIONS', 'SKILLS & CAREER', 'RESOURCES'];
const inactiveTabs = new Set(['COLLEGE & UNIVERSITY', 'CERTIFICATIONS', 'SKILLS & CAREER', 'RESOURCES']);

const pathwaySteps = [
  { label: 'ENLISTMENT', desc: 'Start your journey' },
  { label: 'MILITARY TRAINING', desc: 'Build your foundation' },
  { label: 'ADVANCED EDUCATION', desc: 'Expand your knowledge' },
  { label: 'LEADERSHIP DEVELOPMENT', desc: 'Strengthen your leadership' },
  { label: 'LIFELONG LEARNING', desc: 'Continue to grow and succeed' },
];

const topBenefits = [
  { label: 'Tuition Assistance (TA)', desc: 'Up to $4,500 per fiscal year' },
  { label: 'GI Bill® Benefits', desc: 'Education benefits for you and your family', href: 'https://www.va.gov/education/about-gi-bill-benefits/' },
  { label: 'Marine Corps COOL', desc: 'Credentialing opportunities for in-demand careers', href: 'https://www.cool.osd.mil/usmc/index.html' },
  { label: 'Marines University', desc: 'Free online courses and degree programs' },
  { label: 'Apprenticeship Programs', desc: 'Earn while you learn in high-demand fields' },
];

const educationTools = [
  { label: 'Degree Planner', desc: 'Plan your degree and track your progress' },
  { label: 'TA Request (WebTA)', desc: 'Apply for Tuition Assistance online' },
  { label: 'Navy College Program', desc: 'Access courses and manage your education', href: 'https://www.navycollege.navy.mil' },
  { label: 'Joint Services Transcript', desc: 'View and download your official transcript', href: 'https://jst.doded.mil/jst/' },
  { label: 'Virtual Education Center', desc: 'Connect with counselors and resources' },
];

type FeaturedProgram = {
  label: string;
  desc: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  logoClassName: string;
};

const featuredProgramCardClassName = 'aspect-video bg-gradient-to-br from-gray-900 to-black border border-white/12 mb-3 overflow-hidden relative transition-colors group-hover:border-white/30';
const featuredProgramPanelClassName = 'absolute inset-0 flex items-center justify-center p-4';
const featuredProgramLogoFieldClassName = 'absolute inset-3 rounded-[2px] bg-white';
const featuredProgramCtaClassName = 'flex items-center gap-1 text-xs text-red-500 font-bold tracking-widest transition-colors group-hover:text-red-400';

const featuredPrograms: FeaturedProgram[] = [
  {
    label: 'COLLEGE OF ENLISTED MILITARY EDUCATION',
    desc: 'Educates Marines to prevail in combat through enlisted professional military education programs and academies.',
    href: 'https://www.usmcu.edu/CEME/',
    imageSrc: cemeLogo,
    imageAlt: 'College of Enlisted Military Education logo',
    logoClassName: 'max-h-[70%] max-w-[70%]',
  },
  {
    label: 'MARINE CORPS WAR COLLEGE',
    desc: 'Educates selected military and civilian professionals to serve as strategic advisors, military strategists, and joint warfighters.',
    href: 'https://www.usmcu.edu/MCWAR/',
    imageSrc: mcwarLogo,
    imageAlt: 'Marine Corps War College logo',
    logoClassName: 'max-h-[72%] max-w-[72%]',
  },
  {
    label: 'COMMAND AND STAFF COLLEGE',
    desc: 'Provides graduate-level education that develops critical thinkers, problem solvers, and ethical leaders for MAGTF, joint, and multinational staffs.',
    href: 'https://www.usmcu.edu/Colleges-and-Schools/Command-and-Staff-College/',
    imageSrc: commandStaffLogo,
    imageAlt: 'Command and Staff College logo',
    logoClassName: 'max-h-[76%] max-w-[68%]',
  },
  {
    label: 'EXPEDITIONARY WARFARE SCHOOL',
    desc: 'Prepares company grade officers for increased leadership responsibility with emphasis on MAGTF warfighting in a naval expeditionary environment.',
    href: 'https://www.usmcu.edu/EWS/',
    imageSrc: ewsLogo,
    imageAlt: 'Expeditionary Warfare School logo',
    logoClassName: 'max-h-[78%] max-w-[52%]',
  },
  {
    label: 'COLLEGE OF DISTANCE EDUCATION AND TRAINING',
    desc: 'Designs and delivers distance learning programs across the Marine Corps training and education continuum to increase operational readiness.',
    href: 'https://www.usmcu.edu/CDET',
    imageSrc: cdetLogo,
    imageAlt: 'College of Distance Education and Training logo',
    logoClassName: 'max-h-[78%] max-w-[78%]',
  },
];

const EDU_KEYWORDS = [
  'tuition assistance',
  'gi bill',
  'marine corps university',
  'marines university',
  'navy college',
  'cool program',
  'credentialing opportunit',
  'enlisted commissioning',
  'education benefit',
  'scholarship',
  'webta',
  'apprenticeship program',
  'joint services transcript',
  'degree program',
  'pme',
  'professional military education',
  'stem education',
  'mcu ',
];

function isEducationRelevant(title: string, description: string): boolean {
  const hay = `${title} ${description}`.toLowerCase();
  return EDU_KEYWORDS.some(kw => hay.includes(kw));
}

const events = [
  { date: 'MAY 29, 2024', time: '1300 EST', title: 'TA WEBINAR', desc: 'How to Maximize Your Education Benefits' },
  { date: 'JUN 06, 2024', time: '0900 EST', title: 'GI BILL® BRIEF', desc: 'Education Benefits Overview' },
  { date: 'JUN 12, 2024', time: '1400 EST', title: 'CAREER TRANSITION WORKSHOP', desc: 'Plan Your Future Beyond the Corps' },
];

const quickLinks = [
  'Education Center Locator',
  'Contact Your Education Services Officer (ESO)',
  'Marine Corps Voluntary Education Program (VEP)',
  'Navy College Program',
];

export function EducationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const { newsItems, pressReleases, loading: newsLoading } = useNewsItems();

  const eduNews = useMemo(() => {
    // News + press releases
    const fromFeeds = [...newsItems, ...pressReleases]
      .filter(item => isEducationRelevant(item.title, item.description))
      .map(item => ({ id: item.id, title: item.title, date: item.pubDate, href: item.link, internal: false }));

    // MARADMINs from localStorage cache (grows as user browses /messages)
    const maradmins = getCachedFeed() ?? [];
    const fromMaradmins = maradmins
      .filter(m => isEducationRelevant(m.subject, ''))
      .map(m => ({
        id: m.number,
        title: `MARADMIN ${m.number} — ${m.subject}`,
        date: new Date(m.displayDate),
        href: `/messages/${m.number}`,
        internal: true,
      }));

    return [...fromFeeds, ...fromMaradmins]
      .filter(item => item.date instanceof Date && !isNaN(item.date.getTime()))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 4);
  }, [newsItems, pressReleases]);

  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <SEOHead
        title="Education Benefits"
        description="Marine Corps education benefits explained — Tuition Assistance (TA), college programs, certifications, and career development resources for active-duty Marines."
        path="/education"
      />
      {/* Hero */}
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(5,8,15,0.9) 50%, rgba(10,8,5,0.85) 100%)',
          backgroundColor: '#050508'
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
          {/* Info overlay card */}
          <div className="absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right hidden lg:block">
            <div className="text-[12px] font-black text-white tracking-widest">CONTINUOUS LEARNING<span className="text-red-600">.</span></div>
            <div className="text-[12px] font-black text-white tracking-widest mb-2">LIFELONG IMPACT<span className="text-red-600">.</span></div>
            <div className="w-6 h-px bg-red-600 ml-auto mb-2" />
            <div className="text-[11px] text-gray-500 tracking-wider">INVEST IN YOURSELF<span className="text-red-600">.</span></div>
            <div className="text-[11px] text-gray-500 tracking-wider">INVEST IN THE MISSION<span className="text-red-600">.</span></div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">EDUCATION</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
                className="page-hero-title mb-2"
              >
                EDUCATION<span className="text-red-600">.</span>
              </motion.h1>
            </div>
            <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3">
              Knowledge strengthens leaders. Advance your military career and prepare for life beyond the uniform with world-class education opportunities.
            </p>
          </div>

          {/* Tabs — flush at bottom so active underline sits on the hero border */}
          <div className="flex items-center px-8 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              const isInactive = inactiveTabs.has(tab);

              return (
                <button
                  key={tab}
                  onClick={() => tab === 'TA EDUCATION' ? navigate('/education/tuition-assistance') : (isInactive ? undefined : setActiveTab(tab))}
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
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" layoutId="eduTabLine" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Three-column content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-white/12 px-8 py-8">
        {/* Education Pathways */}
        <div className="md:pr-8 md:border-r border-white/12 pb-8 md:pb-0 border-b md:border-b-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">EDUCATION PATHWAYS</div>
          </div>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-6 mt-2">
            From enlistment to retirement, we provide the tools to help you achieve your goals.
          </p>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-3 top-3 bottom-3 w-px bg-white/12" />
            <div className="space-y-4">
              {pathwaySteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 border border-red-600/40 bg-black flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-white tracking-wide">{step.label}</div>
                    <div className="text-xs text-gray-600">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <span className="mt-6 inline-block text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5">COMING SOON</span>
        </div>

        {/* Top Education Benefits */}
        <div className="md:px-8 md:border-r border-white/12 py-8 md:py-0 border-b md:border-b-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">TOP EDUCATION BENEFITS</div>
          </div>
          <div className="space-y-0">
            {topBenefits.map((b, i) => {
              const internalPath = b.label === 'Tuition Assistance (TA)' ? '/education/tuition-assistance' : undefined;
              const linked = Boolean(internalPath || b.href);
              return (
                <a
                  key={i}
                  href={b.href ?? internalPath}
                  onClick={(event) => {
                    if (internalPath) {
                      event.preventDefault();
                      navigate(internalPath);
                    }
                  }}
                  target={b.href ? '_blank' : undefined}
                  rel={b.href ? 'noopener noreferrer' : undefined}
                  className={`w-full flex items-center justify-between py-3.5 border-b border-white/10 last:border-0 text-left group ${linked ? '' : 'cursor-default'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${linked ? 'border-white/16 group-hover:border-white/30' : 'border-white/8'}`}>
                      <Award className={`w-3 h-3 transition-colors ${linked ? 'text-red-600/60 group-hover:text-red-500' : 'text-white/20'}`} />
                    </div>
                    <div>
                      <div className={`text-[13px] font-medium transition-colors ${linked ? 'text-gray-200 group-hover:text-white' : 'text-gray-600'}`}>{b.label}</div>
                      <div className="text-xs text-gray-600">{b.desc}</div>
                    </div>
                  </div>
                  {linked
                    ? <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
                    : <span className="text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5 flex-shrink-0">COMING SOON</span>
                  }
                </a>
              );
            })}
          </div>
          <span className="mt-4 inline-block text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5">COMING SOON</span>
        </div>

        {/* Education Tools */}
        <div className="md:pl-8 pt-8 md:pt-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">YOUR EDUCATION TOOLS</div>
          </div>
          <div className="space-y-0">
            {educationTools.map((t, i) => {
              const internalPath = t.label === 'TA Request (WebTA)' ? '/education/tuition-assistance' : undefined;
              const linked = Boolean(internalPath || t.href);
              return (
                <a
                  key={i}
                  href={t.href ?? internalPath}
                  onClick={(event) => {
                    if (internalPath) {
                      event.preventDefault();
                      navigate(internalPath);
                    }
                  }}
                  target={t.href ? '_blank' : undefined}
                  rel={t.href ? 'noopener noreferrer' : undefined}
                  className={`w-full flex items-center justify-between py-3.5 border-b border-white/10 last:border-0 text-left group ${linked ? '' : 'cursor-default'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${linked ? 'border-white/16 group-hover:border-white/30' : 'border-white/8'}`}>
                      <Layout className={`w-3 h-3 transition-colors ${linked ? 'text-red-600/60 group-hover:text-red-500' : 'text-white/20'}`} />
                    </div>
                    <div>
                      <div className={`text-[13px] font-medium transition-colors ${linked ? 'text-gray-200 group-hover:text-white' : 'text-gray-600'}`}>{t.label}</div>
                      <div className="text-xs text-gray-600">{t.desc}</div>
                    </div>
                  </div>
                  {linked
                    ? <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
                    : <span className="text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5 flex-shrink-0">COMING SOON</span>
                  }
                </a>
              );
            })}
          </div>
          <span className="mt-4 inline-block text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5">COMING SOON</span>
        </div>
      </div>

      {/* Marine Corps Colleges and Schools */}
      <div className="px-8 py-10 border-b border-white/12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">MARINE CORPS COLLEGES & SCHOOLS</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {featuredPrograms.map((p, i) => {
            return (
              <motion.a
                key={p.label}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={featuredProgramCardClassName}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,24,24,0.22),transparent_58%),linear-gradient(135deg,rgba(19,19,19,0.96),rgba(5,5,5,1))]" />
                  <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)',
                    backgroundSize: '26px 26px',
                  }} />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
                  <div className="absolute inset-y-5 left-3 w-px bg-gradient-to-b from-transparent via-red-500/35 to-transparent" />
                  <div className="absolute inset-y-5 right-3 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent" />
                  <div className="absolute inset-0" style={{
                    background: `linear-gradient(${120 + i * 20}deg, rgba(15,10,5,1) 0%, rgba(5,5,5,1) 100%)`
                  }} />
                  <div className={featuredProgramPanelClassName}>
                    <div className={featuredProgramLogoFieldClassName} />
                    <img
                      src={p.imageSrc}
                      alt={p.imageAlt}
                      className={`relative z-10 h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)] ${p.logoClassName}`}
                    />
                  </div>
                </div>
                <div className="text-[13px] font-bold tracking-wide mb-1 leading-tight text-white">{p.label}</div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{p.desc}</p>
                <span className={featuredProgramCtaClassName}>VISIT SITE <ChevronRight className="w-2.5 h-2.5" /></span>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Bottom three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 px-8 py-8 border-b border-white/12 relative">
        {/* Education News */}
        <div className="md:pr-8 md:border-r border-white/12 pb-8 md:pb-0 border-b md:border-b-0">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">EDUCATION NEWS</div>
          </div>
          <div className="space-y-4">
            {newsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border-b border-white/10 pb-4 animate-pulse">
                    <div className="h-2 w-24 bg-white/8 rounded mb-2" />
                    <div className="h-3 w-full bg-white/8 rounded mb-1" />
                    <div className="h-3 w-3/4 bg-white/6 rounded" />
                  </div>
                ))
              : eduNews.length > 0
                ? eduNews.map(item => (
                    <div key={item.id} className="border-b border-white/10 pb-4 last:border-0">
                      <div className="text-xs text-gray-600 font-mono tracking-wider mb-1.5">
                        {item.date instanceof Date && !isNaN(item.date.getTime())
                          ? item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
                          : ''}
                      </div>
                      <a
                        href={item.href}
                        target={item.internal ? '_self' : '_blank'}
                        rel={item.internal ? undefined : 'noopener noreferrer'}
                        className="group text-sm font-bold text-white hover:text-red-400 transition-colors text-left leading-snug flex items-start justify-between gap-2 w-full"
                      >
                        <span>{item.title}</span>
                        <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-red-500 transition-colors flex-shrink-0 mt-0.5" />
                      </a>
                    </div>
                  ))
                : (
                  <div className="text-xs text-gray-600 py-2">No recent education news.</div>
                )
            }
          </div>
          <button
            onClick={() => navigate('/news')}
            className="mt-4 flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors"
          >
            VIEW ALL NEWS <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Spear + slogan — center column */}
        <div className="md:px-8 md:border-r border-white/12 py-8 md:py-0 border-b md:border-b-0 flex flex-col justify-center items-center bg-red-900/5 text-center min-h-[240px]">
          <motion.div
            className="mb-4"
            animate={{ filter: ['brightness(1)', 'brightness(1.35)', 'brightness(1)'] }}
            transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }}
          >
            <SiteLogo size={80} variant="red" />
          </motion.div>
          <div className="text-sm font-black text-white tracking-wide">KNOWLEDGE IS</div>
          <div className="text-sm font-black text-white tracking-wide">COMBAT POWER<span className="text-red-600">.</span></div>
        </div>

        {/* Upcoming Events */}
        <div className="md:pl-8 pt-8 md:pt-0">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] font-bold text-gray-300 tracking-[0.2em]">UPCOMING EVENTS</div>
          </div>
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="border-b border-white/10 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-600 font-mono tracking-wider">{event.date} • {event.time}</span>
                </div>
                <div className="flex items-start justify-between gap-2 w-full">
                  <div>
                    <div className="text-sm font-bold text-gray-600 tracking-wide">{event.title}</div>
                    <div className="text-[13px] text-gray-700 mt-0.5">{event.desc}</div>
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5 flex-shrink-0 mt-0.5">COMING SOON</span>
                </div>
              </div>
            ))}
          </div>
          <span className="mt-4 inline-block text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5">COMING SOON</span>
        </div>
      </div>
    </div>
  );
}
