import { ChevronRight } from 'lucide-react';

export function CTABanner() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/12">
      <div className="relative overflow-hidden min-h-32 bg-gradient-to-br from-gray-900 to-black p-8 flex items-end">
        <div className="relative z-10">
          <div className="text-xl font-black text-white tracking-tight">YOUR POTENTIAL IS LIMITLESS.</div>
          <div className="text-xl font-black text-white tracking-tight">WE'LL HELP YOU FIND YOUR PATH.</div>
        </div>
      </div>
      <div className="p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/12">
        <div className="text-[13px] text-gray-500 tracking-[0.2em] mb-2">TALK TO A CAREER PLANNER</div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">Get personalized guidance for your future.</p>
        <button className="flex items-center gap-2 px-6 py-3 border border-red-600/50 text-red-500 text-[13px] font-bold tracking-widest hover:bg-red-900/10 transition-colors self-start">
          FIND A CAREER PLANNER <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
