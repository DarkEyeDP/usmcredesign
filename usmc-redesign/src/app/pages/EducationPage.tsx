import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronRight, Layout, Award } from 'lucide-react';
import { useNewsItems } from '@/app/features/news';
import { getCachedFeed } from '@/app/features/maradmin/maradminStorage';

const tabs = ['OVERVIEW', 'TA EDUCATION', 'COLLEGE & UNIVERSITY', 'CERTIFICATIONS', 'SKILLS & CAREER', 'RESOURCES'];

const pathwaySteps = [
  { label: 'ENLISTMENT', desc: 'Start your journey' },
  { label: 'MILITARY TRAINING', desc: 'Build your foundation' },
  { label: 'ADVANCED EDUCATION', desc: 'Expand your knowledge' },
  { label: 'LEADERSHIP DEVELOPMENT', desc: 'Strengthen your leadership' },
  { label: 'LIFELONG LEARNING', desc: 'Continue to grow and succeed' },
];

const topBenefits = [
  { label: 'Tuition Assistance (TA)', desc: 'Up to $4,500 per fiscal year' },
  { label: 'GI Bill® Benefits', desc: 'Education benefits for you and your family' },
  { label: 'Marine Corps COOL', desc: 'Credentialing opportunities for in-demand careers' },
  { label: 'Marines University', desc: 'Free online courses and degree programs' },
  { label: 'Apprenticeship Programs', desc: 'Earn while you learn in high-demand fields' },
];

const educationTools = [
  { label: 'Degree Planner', desc: 'Plan your degree and track your progress' },
  { label: 'TA Request (WebTA)', desc: 'Apply for Tuition Assistance online' },
  { label: 'Navy College Program', desc: 'Access courses and manage your education' },
  { label: 'Joint Services Transcript', desc: 'View and download your official transcript' },
  { label: 'Virtual Education Center', desc: 'Connect with counselors and resources' },
];

const featuredPrograms = [
  { label: 'MARINE CORPS UNIVERSITY', desc: 'Online degree programs designed for Marines.' },
  { label: 'TUITION ASSISTANCE', desc: 'Financial assistance for college courses and certifications.' },
  { label: 'COOL PROGRAM', desc: 'Turn your military skills into industry-recognized credentials.' },
  { label: 'GI BILL® BENEFITS', desc: 'Education benefits for Marines and their dependents.' },
  { label: 'APPRENTICESHIP PROGRAMS', desc: 'Build skills. Earn credentials. Advance your career.' },
  { label: 'LEADERSHIP & PROFESSIONAL DEVELOPMENT', desc: 'Courses and certifications to develop leaders.' },
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
    <div className="min-h-screen bg-black pb-20 md:pb-0">
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
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[clamp(2.75rem,5vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-2"
            >
              EDUCATION
            </motion.h1>
            <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3">
              Knowledge strengthens leaders. Advance your military career and prepare for life beyond the uniform with world-class education opportunities.
            </p>
            <button className="flex items-center gap-2 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
              EXPLORE EDUCATION BENEFITS <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Tabs — flush at bottom so active underline sits on the hero border */}
          <div className="flex items-center px-8 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => tab === 'TA EDUCATION' ? navigate('/education/tuition-assistance') : setActiveTab(tab)}
                className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" layoutId="eduTabLine" />
                )}
              </button>
            ))}
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
          <button className="mt-6 flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            FIND YOUR PATH <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Top Education Benefits */}
        <div className="md:px-8 md:border-r border-white/12 py-8 md:py-0 border-b md:border-b-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">TOP EDUCATION BENEFITS</div>
          </div>
          <div className="space-y-0">
            {topBenefits.map((b, i) => (
              <button key={i} onClick={() => b.label === 'Tuition Assistance (TA)' ? navigate('/education/tuition-assistance') : undefined} className="w-full flex items-center justify-between py-3.5 border-b border-white/10 last:border-0 text-left group">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 border border-white/16 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-white/30 transition-colors">
                    <Award className="w-3 h-3 text-red-600/60 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-200 group-hover:text-white transition-colors font-medium">{b.label}</div>
                    <div className="text-xs text-gray-600">{b.desc}</div>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            VIEW ALL BENEFITS <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Education Tools */}
        <div className="md:pl-8 pt-8 md:pt-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">YOUR EDUCATION TOOLS</div>
          </div>
          <div className="space-y-0">
            {educationTools.map((t, i) => (
              <button key={i} onClick={() => t.label === 'TA Request (WebTA)' ? navigate('/education/tuition-assistance') : undefined} className="w-full flex items-center justify-between py-3.5 border-b border-white/10 last:border-0 text-left group">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 border border-white/16 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-white/30 transition-colors">
                    <Layout className="w-3 h-3 text-red-600/60 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div>
                    <div className="text-[13px] text-gray-200 group-hover:text-white transition-colors font-medium">{t.label}</div>
                    <div className="text-xs text-gray-600">{t.desc}</div>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            ACCESS TOOLS <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Featured Programs */}
      <div className="px-8 py-10 border-b border-white/12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">FEATURED PROGRAMS</div>
          </div>
          <button className="flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            VIEW ALL PROGRAMS <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {featuredPrograms.map((p, i) => (
            <motion.div
              key={i}
              onClick={() => p.label === 'TUITION ASSISTANCE' ? navigate('/education/tuition-assistance') : undefined}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black border border-white/12 mb-3 group-hover:border-white/30 transition-colors overflow-hidden relative">
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(${120 + i * 20}deg, rgba(15,10,5,1) 0%, rgba(5,5,5,1) 100%)`
                }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
                  <div className="text-4xl font-black text-white">{p.label.charAt(0)}</div>
                </div>
              </div>
              <div className="text-[13px] font-bold text-white tracking-wide mb-1 leading-tight">{p.label}</div>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{p.desc}</p>
              <button className="flex items-center gap-1 text-xs text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
                LEARN MORE <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 px-8 py-8 border-b border-white/12">
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

        {/* Upcoming Events */}
        <div className="md:px-8 md:border-r border-white/12 py-8 md:py-0 border-b md:border-b-0">
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
                <button className="group flex items-start justify-between gap-2 w-full text-left">
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors tracking-wide">{event.title}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{event.desc}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-red-500 transition-colors flex-shrink-0 mt-0.5" />
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            VIEW ALL EVENTS <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Education Counseling + Quick Links */}
        <div className="md:pl-8 pt-8 md:pt-0">
          <div className="border border-white/12 p-4 mb-5 relative overflow-hidden hover:border-white/20 transition-colors">
            <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, rgba(0,5,15,1), transparent)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 bg-red-600" />
                <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">EDUCATION COUNSELING</div>
              </div>
              <div className="flex gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-black border border-white/12 flex-shrink-0" />
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  Our Marine Corps Education Center counselors are here to help you plan your education and achieve your goals.
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-red-600/40 text-red-500 text-xs font-bold tracking-widest hover:bg-red-900/10 transition-colors">
                FIND A COUNSELOR <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">QUICK LINKS</div>
          </div>
          <div className="space-y-0">
            {quickLinks.map((link, i) => (
              <button key={i} className="w-full flex items-center justify-between py-2.5 border-b border-white/10 last:border-0 text-left group">
                <span className="text-[13px] text-gray-400 group-hover:text-white transition-colors">{link}</span>
                <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
