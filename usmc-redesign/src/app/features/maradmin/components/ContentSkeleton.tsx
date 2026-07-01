import { SpinnerGap } from '@phosphor-icons/react';

export function ContentSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-4 h-3 bg-gray-900 rounded animate-pulse flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-900 rounded w-28 animate-pulse" />
            <div className="h-3 bg-gray-900 rounded w-full animate-pulse" />
            <div className={`h-3 bg-gray-900 rounded animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-5/6'}`} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 text-gray-800 text-[11px] font-mono tracking-widest mt-2">
        <SpinnerGap className="w-3 h-3 animate-spin" />
        FETCHING FULL MESSAGE…
      </div>
    </div>
  );
}
