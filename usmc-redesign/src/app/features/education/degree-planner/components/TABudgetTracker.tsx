import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, ThumbsUp } from 'lucide-react';
import { TA_ANNUAL_MAX } from '../constants';

interface TABudgetTrackerProps {
  taByFY: Map<number, number>;
  totalUncovered: number;
  totalTACost: number;
  uncoveredCardState: 'hidden' | 'gap' | 'settled';
  isDesert: boolean;
  showBulkCostEditor: boolean;
  setShowBulkCostEditor: React.Dispatch<React.SetStateAction<boolean>>;
  bulkCostRaw: string;
  setBulkCostRaw: React.Dispatch<React.SetStateAction<string>>;
  applyBulkCost: () => void;
}

export function TABudgetTracker({
  taByFY,
  totalUncovered,
  totalTACost,
  uncoveredCardState,
  isDesert,
  showBulkCostEditor,
  setShowBulkCostEditor,
  bulkCostRaw,
  setBulkCostRaw,
  applyBulkCost,
}: TABudgetTrackerProps) {
  return (
    <div className="border-b border-white/10 px-6 py-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-red-500" />
            <span className="text-[11px] font-bold tracking-widest text-gray-400">TA BUDGET TRACKER</span>
          </div>
          <p className="mt-0.5 pl-[22px] text-[10px] text-gray-600">grouped by fiscal year (Oct 1 – Sep 30)</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowBulkCostEditor(v => !v); setBulkCostRaw(''); }}
          className="flex-shrink-0 cursor-pointer text-[10px] font-bold tracking-wider text-gray-600 transition-colors hover:text-gray-300"
        >
          {showBulkCostEditor ? 'CANCEL' : 'SET ALL COSTS'}
        </button>
      </div>
      {showBulkCostEditor && (
        <div className="mb-4 flex flex-wrap items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="text-[11px] text-gray-400">Set cost / SH for all planned &amp; in-progress courses:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={bulkCostRaw}
              onChange={e => setBulkCostRaw(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') applyBulkCost(); if (e.key === 'Escape') { setShowBulkCostEditor(false); setBulkCostRaw(''); } }}
              placeholder="e.g. 250"
              autoFocus
              className="w-24 border border-white/16 bg-black px-3 py-1.5 font-mono text-sm text-white placeholder-gray-700 focus:border-red-500/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={applyBulkCost}
            disabled={!bulkCostRaw || parseInt(bulkCostRaw, 10) <= 0}
            className="cursor-pointer border border-white/20 px-4 py-1.5 text-[11px] font-bold tracking-wider text-gray-300 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            APPLY TO ALL
          </button>
        </div>
      )}
      {taByFY.size === 0 ? (
        <p className="text-[12px] text-gray-600">Add TA-funded courses below to see annual budget usage.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...taByFY.entries()].sort(([a], [b]) => a - b).slice(0, 4).map(([fy, raw], fyIdx) => {
            const cappedDisplay = Math.min(raw, TA_ANNUAL_MAX);
            const pct = Math.min(100, (raw / TA_ANNUAL_MAX) * 100);
            const over = raw > TA_ANNUAL_MAX;
            return (
              <motion.div
                key={fy}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fyIdx * 0.07, duration: 0.3 }}
                className={`border px-3 py-3 ${over ? (isDesert ? 'border-amber-700/50 bg-amber-900/15' : 'border-amber-500/30 bg-amber-950/15') : 'border-white/10 bg-white/[0.04]'}`}
              >
                <div className="mb-1 text-[10px] font-bold tracking-wider text-gray-500">
                  FY {fy}/{String(fy + 1).slice(-2)}
                </div>
                <div className={`text-lg font-black ${over ? (isDesert ? 'text-amber-900' : 'text-amber-300') : 'text-white'}`}>
                  ${cappedDisplay.toLocaleString()}
                </div>
                {over && <div className={`mt-0.5 text-[10px] font-bold ${isDesert ? 'text-amber-900' : 'text-amber-400'}`}>OVER $4,500 LIMIT</div>}
                <div className="mt-2 h-1 w-full bg-white/10">
                  <motion.div
                    className={`h-full ${over ? (isDesert ? 'bg-amber-800' : 'bg-amber-400') : 'bg-red-600'}`}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-gray-600">${TA_ANNUAL_MAX.toLocaleString()} annual max</div>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {uncoveredCardState !== 'hidden' && (
              <motion.div
                key="uncovered-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.5, ease: 'easeInOut' } }}
                transition={{ duration: 0.3 }}
                className={`border px-3 py-3 transition-colors duration-500 ${
                  uncoveredCardState === 'settled'
                    ? (isDesert ? 'border-green-700/50 bg-green-900/10' : 'border-green-600/30 bg-green-950/20')
                    : (isDesert ? 'border-orange-800/70 bg-orange-900/20' : 'border-amber-500/40 bg-amber-950/20')
                }`}
              >
                <AnimatePresence mode="wait">
                  {uncoveredCardState === 'gap' ? (
                    <motion.div key="gap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className={`text-[10px] font-bold tracking-wider ${isDesert ? 'text-orange-900' : 'text-amber-600'}`}>UNCOVERED GAP</div>
                        <div className={`text-[10px] font-bold ${isDesert ? 'text-orange-800' : 'text-amber-500/70'}`}>TA cap: $250/SH</div>
                      </div>
                      <div className={`text-lg font-black ${isDesert ? 'text-orange-900' : 'text-amber-300'}`}>${totalUncovered.toLocaleString()}</div>
                      <div className={`mt-2 h-1 w-full ${isDesert ? 'bg-orange-900/30' : 'bg-white/10'}`}>
                        <motion.div
                          className={`h-full ${isDesert ? 'bg-orange-800' : 'bg-amber-500'}`}
                          animate={{ width: `${totalTACost > 0 ? Math.min(100, (totalUncovered / totalTACost) * 100) : 0}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                      <div className={`mt-1 text-[10px] ${isDesert ? 'text-stone-600' : 'text-gray-600'}`}>
                        {totalTACost > 0 ? `${Math.round((totalUncovered / totalTACost) * 100)}% of TA course costs uncovered` : 'needs additional funding'}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="settled" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }} exit={{ opacity: 0 }} className="flex flex-col gap-1.5">
                      <div className={`text-[10px] font-bold tracking-wider ${isDesert ? 'text-green-800' : 'text-green-500'}`}>COSTS SETTLED</div>
                      <ThumbsUp className={`h-6 w-6 ${isDesert ? 'text-green-700' : 'text-green-400'}`} />
                      <div className={`text-[10px] ${isDesert ? 'text-green-800/70' : 'text-green-600'}`}>All TA costs within cap</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
