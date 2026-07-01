import { CaretRight, CheckCircle, ArrowsLeftRight, Shield, Briefcase } from '@phosphor-icons/react';

const aboutItems = [
  { icon: ArrowsLeftRight, label: 'EXPAND YOUR SKILLS',  desc: 'Gain new expertise and broaden your career opportunities.' },
  { icon: Shield,         label: 'STAY MISSION READY',  desc: 'Fill critical roles and continue making an impact.' },
  { icon: Briefcase,      label: 'GROW YOUR FUTURE',    desc: 'Build the foundation for long-term success in and out of the Corps.' },
];

const eligibilityItems = [
  'Meet ASVAB line score requirements',
  'Maintain minimum time in service',
  'Meet physical and medical standards',
  'No adverse NJP or misconduct',
  'Command approval required',
  'MOS must have available quotas',
];

const resourceLinks = [
  'Lateral Move Checklist',
  'ASVAB Score Calculator',
  'Lateral Move MILPERSMAN',
  'Frequently Asked Questions',
  'Contact Your Career Planner',
];

export function AboutSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-white/12 px-6 md:px-8 py-10">
      {/* About lateral moves */}
      <div className="md:pr-8 md:border-r border-white/12 border-b md:border-b-0 pb-6 md:pb-0">
        <div className="text-[13px] font-bold text-gray-300 tracking-[0.2em] mb-3">ABOUT LATERAL MOVES</div>
        <p className="text-sm text-gray-400 leading-relaxed mb-5">
          Lateral moves allow you to transition to a new MOS while staying in the Marine Corps.
        </p>
        <div className="space-y-4">
          {aboutItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex gap-3">
                <div className="w-8 h-8 border border-white/16 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-red-600/60" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white tracking-wide mb-0.5">{item.label}</div>
                  <div className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="mt-5 flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
          LEARN MORE <CaretRight className="w-3 h-3" />
        </button>
      </div>

      {/* Eligibility */}
      <div className="md:px-8 md:border-r border-white/12 py-6 md:py-0 border-b md:border-b-0">
        <div className="text-[13px] font-bold text-gray-300 tracking-[0.2em] mb-2">ELIGIBILITY REQUIREMENTS</div>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
          General requirements for lateral move consideration.
        </p>
        <div className="space-y-2.5">
          {eligibilityItems.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-500/70 flex-shrink-0" />
              <span className="text-[13px] text-gray-400">{item}</span>
            </div>
          ))}
        </div>
        <button className="mt-5 flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
          VIEW FULL REQUIREMENTS <CaretRight className="w-3 h-3" />
        </button>
      </div>

      {/* Tools & Resources */}
      <div className="md:pl-8 pt-6 md:pt-0">
        <div className="text-[13px] font-bold text-gray-300 tracking-[0.2em] mb-4">TOOLS & RESOURCES</div>
        <div className="space-y-0">
          {resourceLinks.map((link) => (
            <button
              key={link}
              className="w-full flex items-center justify-between py-3 border-b border-white/10 last:border-0 text-left group"
            >
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{link}</span>
              <CaretRight className="w-3 h-3 text-red-600/60 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
