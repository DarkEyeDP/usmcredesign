import { ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

const sitemapSections = [
  {
    label: 'PRIMARY',
    items: [
      { title: 'Home', path: '/', desc: 'Landing page, hero content, and featured access points.' },
      { title: 'News', path: '/news', desc: 'Official news stories and press release feed aggregation.' },
      { title: 'MARADMINs', path: '/messages', desc: 'Marine administrative message search and detail view.' },
    ],
  },
  {
    label: 'CAREER & BENEFITS',
    items: [
      { title: 'Pay & Benefits', path: '/pay-benefits', desc: 'Pay overview, benefits, and financial resource hub.' },
      { title: 'Basic Pay', path: '/pay-benefits/basic-pay', desc: 'Current pay tables and service-based pay breakdowns.' },
      { title: 'Bonus Tool', path: '/pay-benefits/bonuses', desc: 'SRB and continuation pay estimation tools.' },
      { title: 'Stay Marine', path: '/stay-marine', desc: 'Re-enlistment and retention-focused content.' },
      { title: 'Lateral Move', path: '/lateral-move', desc: 'MOS comparison and lateral move decision support.' },
    ],
  },
  {
    label: 'EDUCATION',
    items: [
      { title: 'Education Overview', path: '/education', desc: 'Education pathways, programs, and quick-access tools.' },
      { title: 'Tuition Assistance', path: '/education/tuition-assistance', desc: 'TA requirements, funding, and practical guidance.' },
      { title: "Commandant's Reading List", path: '/reading-list', desc: 'Official CMC Reading List — 71 books across Heritage, Leadership, Strategy, Innovation, and Foundation shelves, with purchase links and free doctrine PDF downloads.' },
    ],
  },
  {
    label: 'UTILITY',
    items: [
      { title: 'Sitemap', path: '/sitemap', desc: 'Structured index of published site pages and tools.' },
    ],
  },
];

export function SiteMapPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(10,10,14,0.92) 48%, rgba(18,8,8,0.88) 100%)',
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 px-8 py-8 min-h-[190px]">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">SITEMAP</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[clamp(2.75rem,5vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-3"
            >
              SITEMAP
            </motion.h1>
            <p className="text-[14px] text-gray-400 max-w-2xl leading-relaxed">
              A structured index of the live pages, tools, and reference areas currently available across the site.
            </p>
          </div>

          <div className="border border-white/10 bg-black/45 px-5 py-4 max-w-sm">
            <div className="text-[12px] font-black text-white tracking-widest">QUICK ORIENTATION<span className="text-red-600">.</span></div>
            <div className="w-6 h-px bg-red-600 mt-2 mb-3" />
            <div className="text-[11px] text-gray-500 tracking-wider">PRIMARY PATHS<span className="text-red-600">.</span> TOOLS<span className="text-red-600">.</span> SUPPORTING PAGES<span className="text-red-600">.</span></div>
          </div>
        </div>
      </div>

      <div className="px-8 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sitemapSections.map((section) => (
            <section key={section.label} className="border border-white/12 bg-black/40">
              <div className="px-6 py-4 border-b border-white/12 flex items-center gap-3">
                <div className="w-1 h-5 bg-red-600" />
                <h2 className="text-[13px] text-gray-300 font-bold tracking-[0.22em]">{section.label}</h2>
              </div>
              <div className="divide-y divide-white/10">
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full px-6 py-4 text-left hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-black text-white tracking-wide group-hover:text-red-400 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-600 font-mono tracking-wider mt-1">
                          {item.path}
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mt-2 max-w-xl">
                          {item.desc}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
