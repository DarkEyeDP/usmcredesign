import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

const policySections = [
  {
    title: 'Information We Collect',
    body: 'This site may collect limited technical data needed to operate the experience, such as browser details, device type, interaction events, and basic analytics. If future forms or tools request user-submitted information, that information should be treated as voluntarily provided data.',
  },
  {
    title: 'How Information Is Used',
    body: 'Information is used to operate the site, improve performance, understand page usage, and support content and feature decisions. Data should not be used to imply official affiliation, endorsement, or government sponsorship.',
  },
  {
    title: 'Cookies And Local Storage',
    body: 'The site may use cookies or local storage to remember preferences, preserve tool settings, and improve usability between visits. Examples can include saved calculator inputs or cached browsing state.',
  },
  {
    title: 'Third-Party Services',
    body: 'Some pages may connect to external services, embedded media, official source feeds, or outbound links. Those destinations operate under their own privacy practices and policies once a visitor leaves this site.',
  },
  {
    title: 'Data Retention',
    body: 'Locally stored settings and non-sensitive experience data may remain in the browser until cleared by the user or overwritten by future site updates. No promise of permanent retention should be assumed.',
  },
  {
    title: 'Contact And Policy Updates',
    body: 'This policy may be updated as site features change. Material revisions should be reflected on this page so visitors can review the latest privacy expectations.',
  },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(9,10,14,0.92) 52%, rgba(12,8,8,0.88) 100%)',
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 px-8 py-8 min-h-[190px]">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">PRIVACY POLICY</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
              className="page-hero-title mb-3"
            >
              PRIVACY POLICY<span className="text-red-600">.</span>
            </motion.h1>
            <p className="text-[14px] text-gray-400 max-w-2xl leading-relaxed">
              This page explains the kinds of information the site may use, how it supports the experience, and what visitors should expect when interacting with tools, feeds, and external links.
            </p>
          </div>

          <div className="border border-white/10 bg-black/45 px-5 py-4 max-w-sm">
            <div className="text-[12px] font-black text-white tracking-widest">DATA PRACTICES<span className="text-red-600">.</span></div>
            <div className="w-6 h-px bg-red-600 mt-2 mb-3" />
            <div className="text-[11px] text-gray-500 tracking-wider">COLLECTION<span className="text-red-600">.</span> USAGE<span className="text-red-600">.</span> RETENTION<span className="text-red-600">.</span></div>
          </div>
        </div>
      </div>

      <div className="px-8 py-10">
        <div className="max-w-5xl mx-auto border border-white/12 bg-black/40">
          <div className="px-6 py-4 border-b border-white/12 flex items-center gap-3">
            <div className="w-1 h-5 bg-red-600" />
            <div className="text-[13px] text-gray-300 font-bold tracking-[0.22em]">POLICY OVERVIEW</div>
          </div>

          <div className="divide-y divide-white/10">
            {policySections.map((section) => (
              <section key={section.title} className="px-6 py-5">
                <h2 className="text-sm font-black text-white tracking-wide mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
