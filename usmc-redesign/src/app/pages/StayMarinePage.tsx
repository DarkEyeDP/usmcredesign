import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SEOHead } from '@/app/components/SEOHead';

export function StayMarinePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <SEOHead
        title="Stay Marine"
        description="Reasons to stay in the Marine Corps — career growth, leadership opportunities, pay and benefits, and resources to help you make the most of your active-duty service."
        path="/stay-marine"
      />
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(8,5,0,0.92) 100%)',
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 h-44 flex flex-col justify-center px-8">
          <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
            <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-red-500">STAY MARINE</span>
          </div>
          <h1 className="text-[clamp(2.75rem,5vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-2">
            STAY MARINE<span className="text-red-600">.</span>
          </h1>
          <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3">
            Re-enlistment information, career planning, and incentives for committed Marines.
          </p>
          <button className="flex items-center gap-2 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors">
            EXPLORE RE-ENLISTMENT OPTIONS <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="px-8 py-16 text-center">
        <div className="text-gray-600 font-mono text-sm tracking-widest">[ STAY MARINE CONTENT COMING SOON ]</div>
      </div>
    </div>
  );
}
