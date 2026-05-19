import { ChevronRight, ChevronsDown } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Props {
  onExploreTool: () => void;
}

export function Hero({ onExploreTool }: Props) {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden border-b border-white/12 pt-20">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(5,5,10,0.92) 50%, rgba(8,5,12,0.88) 100%)',
          backgroundColor: '#050508',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
        {/* Overlay card — hidden on mobile */}
        <div className="hidden md:block absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right">
          <div className="text-[12px] font-black text-white tracking-widest">NEW SKILLS<span className="text-red-600">.</span></div>
          <div className="text-[12px] font-black text-white tracking-widest">NEW OPPORTUNITIES<span className="text-red-600">.</span></div>
          <div className="text-[12px] font-black text-white tracking-widest mb-2">SAME COMMITMENT<span className="text-red-600">.</span></div>
          <div className="w-6 h-px bg-red-600 ml-auto" />
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
            <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-red-500">LATERAL MOVE</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
            <h1 className="text-[clamp(2rem,8vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-2">
              LATERAL MOVE TOOL<span className="text-red-600">.</span>
            </h1>
          </div>

          <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3">
            Find MOS opportunities based on your ASVAB line scores, rank, and years of service.
          </p>

          <button
            type="button"
            onClick={onExploreTool}
            className="inline-flex w-fit items-center gap-2 text-left text-[13px] text-red-500 font-bold tracking-widest transition-colors hover:text-red-400 focus:outline-none focus-visible:text-red-400"
          >
            EXPLORE WHAT YOU COULD PURSUE NEXT IN THE MARINE CORPS
            <ChevronsDown className="w-3.5 h-3.5 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
