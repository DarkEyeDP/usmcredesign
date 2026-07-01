import { coverageBgClass } from '../utils';

interface Props {
  pct: number;
  isDesert: boolean;
  showLabel?: boolean;
}

export function TACoverageBar({ pct, isDesert, showLabel = true }: Props) {
  return (
    <div className="w-full">
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${coverageBgClass(pct, isDesert)}`}
          style={{ width: `${pct}%` }}
        />
        {pct < 100 && (
          <div
            className="absolute inset-y-0 bg-red-900/40"
            style={{ left: `${pct}%`, right: 0 }}
          />
        )}
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-700">$0</span>
          <span className="text-[10px] text-gray-700">TA CAP $250/CR</span>
        </div>
      )}
    </div>
  );
}
