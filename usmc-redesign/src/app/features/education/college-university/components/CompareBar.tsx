import { X } from 'lucide-react';
import { SchoolBadge } from './SchoolBadge';
import type { SchoolResult } from '../types';

interface Props {
  schools: SchoolResult[];
  isDesert: boolean;
  onRemove: (name: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export function CompareBar({ schools, isDesert, onRemove, onClear, onCompare }: Props) {
  if (schools.length === 0) return null;

  return (
    <div className={`sticky bottom-0 z-20 border-t border-white/12 px-6 py-3 flex flex-wrap items-center gap-3 backdrop-blur-sm ${
      isDesert ? 'bg-amber-50/95' : 'bg-black/95'
    }`}>
      <span className="text-[10px] font-bold tracking-widest text-gray-500 flex-shrink-0">COMPARE SCHOOLS</span>

      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {schools.map(s => (
          <div key={s.name} className="flex items-center gap-1.5 border border-white/16 px-2 py-1 bg-black">
            <SchoolBadge name={s.name} size="sm" />
            <span className="text-[11px] text-gray-300 max-w-[90px] truncate">{s.name}</span>
            <button
              onClick={() => onRemove(s.name)}
              className="text-gray-600 hover:text-gray-400 transition-colors ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {schools.length < 3 && (
          <div className="border border-dashed border-white/16 px-3 py-1.5 text-[10px] text-gray-700 tracking-wider">
            + ADD SCHOOL
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[10px] text-gray-600">{schools.length} of 3 selected</span>
        <button
          onClick={onClear}
          className="text-[10px] tracking-widest text-gray-600 hover:text-gray-400 transition-colors"
        >
          CLEAR ALL
        </button>
        <button
          onClick={onCompare}
          disabled={schools.length < 2}
          className={`px-4 py-1.5 text-[11px] font-bold tracking-widest border transition-colors disabled:opacity-40 ${
            isDesert
              ? 'border-red-700 bg-red-700 text-red-50 hover:bg-red-800'
              : 'border-red-600 text-white hover:bg-red-600'
          }`}
        >
          COMPARE NOW
        </button>
      </div>
    </div>
  );
}
