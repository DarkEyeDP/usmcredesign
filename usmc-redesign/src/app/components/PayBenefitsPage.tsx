import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronRight, Calculator, ExternalLink, Info, Shield, TrendingUp, DollarSign } from 'lucide-react';

const tabs = ['OVERVIEW', 'ACTIVE DUTY', 'RESERVE', 'VETERANS & FAMILIES', 'TOOLS & RESOURCES'];

const popularTopics = [
  { label: 'Basic Pay', desc: 'Pay scales and charts' },
  { label: 'Allowances', desc: 'BAH, BAS, and more' },
  { label: 'Special & Incentive Pays', desc: 'Career and skill incentives' },
  { label: 'Bonuses', desc: 'Enlistment and extension' },
  { label: 'Taxes', desc: 'Federal and state information' },
  { label: 'Leave & Permissive TDY', desc: 'Policy and pay impacts' },
  { label: 'Pay Forms & Documents', desc: 'DD Forms and resources' },
];

const benefits = [
  { label: 'HEALTH CARE', desc: 'Comprehensive medical, dental, and vision coverage.' },
  { label: 'HOUSING', desc: 'BAH, on-base housing, and housing resources.' },
  { label: 'EDUCATION', desc: 'Tuition assistance, GI Bill, and credentialing.' },
  { label: 'FAMILY SUPPORT', desc: 'Programs and services for Marines and their families.' },
  { label: 'RETIREMENT', desc: 'Plan for your future with retirement and savings.' },
];

const tools = [
  { icon: Shield, label: 'BRS OPT-IN', desc: 'Blended Retirement System information and enrollment.' },
  { icon: Shield, label: 'SGLI', desc: "Servicemembers' Group Life Insurance details and coverage." },
  { icon: TrendingUp, label: 'THRIFT SAVINGS PLAN', desc: 'Plan for retirement with the TSP and resources.' },
  { icon: DollarSign, label: 'FINANCIAL COUNSELING', desc: 'Get help from accredited financial counselors.' },
  { icon: DollarSign, label: 'MONEY MATTERS', desc: 'Financial readiness tips and training.' },
];

export function PayBenefitsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      {/* Hero */}
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,10,20,0.9) 40%, rgba(20,15,5,0.8) 100%)',
          backgroundColor: '#050508'
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-900/30" />

        <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
          {/* Financial Readiness overlay card */}
          <div className="absolute top-5 right-8 border border-white/10 bg-black/60 px-5 py-4 text-right">
            <div className="text-xs font-black text-white tracking-widest mb-1">FINANCIAL READINESS</div>
            <div className="w-8 h-0.5 bg-red-600 ml-auto mb-2" />
            <div className="text-[13px] text-gray-400 tracking-[0.2em]">MISSION READY<span className="text-red-600">.</span></div>
            <div className="text-[13px] text-gray-400 tracking-[0.2em]">FINANCIALLY SECURE<span className="text-red-600">.</span></div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">BENEFITS</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[clamp(2.75rem,5vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-2"
            >
              PAY &<br />BENEFITS
            </motion.h1>
            <p className="text-[14px] text-gray-400 max-w-xs leading-relaxed mb-3">
              Competitive pay. Comprehensive benefits. Financial security for you and your family, today and tomorrow.
            </p>
            <button className="flex items-center gap-2 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
              MANAGE MY PAY <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Tabs — flush at bottom so active underline sits on the hero border */}
          <div className="flex items-center px-4 md:px-8 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" layoutId="payTabLine" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="px-8 py-8 border-b border-white/12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/12">
          {/* Pay Overview */}
          <div className="p-6 border-r border-white/12">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">PAY OVERVIEW</div>
            <div className="text-[13px] text-red-500 font-bold tracking-widest mb-4">E-5 | OVER 4 YEARS OF SERVICE</div>
            <div className="mb-4">
              <div className="text-[13px] text-gray-600 tracking-wider mb-1">ESTIMATED MONTHLY TAKE-HOME PAY</div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">$4,330.58</span>
                <Info className="w-3.5 h-3.5 text-gray-600 mb-1.5" />
              </div>
            </div>
            <div className="mb-5">
              <div className="text-[13px] text-gray-600 tracking-wider mb-1">ESTIMATED GROSS PAY</div>
              <div className="text-xl font-bold text-gray-300">$6,923.64</div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-white/16 text-gray-400 text-[13px] font-bold tracking-widest hover:border-white/40 hover:text-white transition-colors">
              <Calculator className="w-3 h-3" /> PAY CALCULATOR
            </button>
          </div>

          {/* Next Pay Day */}
          <div className="p-6 border-r border-white/12">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">NEXT PAY DAY</div>
            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 border border-red-600/40 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight">31 MAY 2024</div>
                <div className="text-[13px] text-gray-500 tracking-wider mt-1">24 DAYS AWAY</div>
              </div>
            </div>
            <div className="border-t border-white/12 pt-4">
              <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-2">DFAS MYPAY LOGIN</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-black text-green-400" style={{ fontStyle: 'italic' }}>MyPay</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-3">Access your LES, W-2, and pay information.</p>
              <button className="flex items-center gap-1.5 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
                LOG IN TO MYPAY <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Popular Topics */}
          <div className="p-6">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">POPULAR TOPICS</div>
            <div className="space-y-0">
              {popularTopics.map((topic, i) => (
                <button key={i} className="w-full flex items-center justify-between py-2.5 border-b border-white/10 last:border-0 text-left group">
                  <div>
                    <div className="text-sm text-gray-300 group-hover:text-white transition-colors">{topic.label}</div>
                    <div className="text-xs text-gray-600">{topic.desc}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Benefits */}
      <div className="px-8 py-10 border-b border-white/12">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[13px] font-bold text-gray-300 tracking-[0.2em]">FEATURED BENEFITS</div>
          <button className="flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            VIEW ALL BENEFITS <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black border border-white/12 mb-3 group-hover:border-white/30 transition-colors overflow-hidden relative">
                <div className="absolute inset-0 opacity-40" style={{
                  background: `linear-gradient(${135 + i * 15}deg, rgba(20,10,5,1) 0%, rgba(5,5,5,1) 100%)`
                }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="text-5xl font-black text-white">{b.label.charAt(0)}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-white tracking-wide mb-1">{b.label}</div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-2">{b.desc}</p>
              <button className="flex items-center gap-1 text-xs text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
                →
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tools & Resources */}
      <div className="px-8 py-10 border-b border-white/12">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[13px] font-bold text-gray-300 tracking-[0.2em]">TOOLS & RESOURCES</div>
          <button className="flex items-center gap-1 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            VIEW ALL TOOLS <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-white/12">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <div key={i} className={`p-5 ${i < tools.length - 1 ? 'border-r border-white/12' : ''} hover:bg-red-900/5 transition-colors cursor-pointer group`}>
                <Icon className="w-5 h-5 text-red-600/60 mb-3" />
                <div className="text-[13px] font-bold text-white tracking-wide mb-2">{tool.label}</div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{tool.desc}</p>
                <button className="text-red-500 text-[13px] font-bold group-hover:text-red-400 transition-colors">→</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Need Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/12">
        <div className="p-8 flex items-center gap-6 border-b md:border-b-0 md:border-r border-white/12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, rgba(30,10,0,1), transparent)' }} />
          <div className="w-28 h-28 bg-gradient-to-br from-gray-800 to-black border border-white/12 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="text-4xl font-black text-white">M</div>
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-[13px] text-red-500 font-bold tracking-[0.2em] mb-3">NEED HELP?</div>
            <p className="text-[15px] text-gray-300 leading-relaxed mb-4">
              Talk to a Marine Corps Financial Counselor.<br />We're here to help.
            </p>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-red-600/50 text-red-500 text-[13px] font-bold tracking-widest hover:bg-red-900/10 transition-colors">
              FIND A COUNSELOR <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="p-8 flex flex-col justify-center">
          <div className="text-xl font-black text-white tracking-tight mb-3">FINANCIAL READINESS IS MISSION READINESS<span className="text-red-600">.</span></div>
          <div className="w-8 h-0.5 bg-red-600 mb-4" />
          <p className="text-[15px] text-gray-400 leading-relaxed mb-2">Take control of your financial future.</p>
          <p className="text-[15px] text-gray-400">We've got your six.</p>
        </div>
      </div>
    </div>
  );
}
