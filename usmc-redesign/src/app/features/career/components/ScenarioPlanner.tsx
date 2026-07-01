import { useState } from 'react';
import { useTheme } from '@/app/features/theme/ThemeContext';
import { X, Plus, TrendUp } from '@phosphor-icons/react';
import { TimelineGrid } from './timeline';
import type { ScenarioSummary } from '../types';

interface Props {
  scenarios: ScenarioSummary[];
  yearWidth: number;
}

export function ScenarioPlanner({ scenarios, yearWidth }: Props) {
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const [activeScenario, setActiveScenario] = useState(scenarios[0]?.id ?? '');
  const [scenarioName, setScenarioName] = useState('');

  const current = scenarios.find(s => s.id === activeScenario) ?? scenarios[0] ?? null;

  return (
    <div>
      {/* ── Create a New Scenario ─────────────────────────────────── */}
      <div className="border-b border-white/10 px-6 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase mb-3">
          Create a New Scenario
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Scenario Name</label>
            <input
              value={scenarioName}
              onChange={e => setScenarioName(e.target.value)}
              placeholder="e.g. Stay in for 20, Lateral Move, Early Retirement"
              className="h-8 px-3 text-[11px] font-mono bg-black border border-white/15 text-white/70 placeholder:text-white/20 focus:outline-none focus:border-red-600/50 w-72"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Starting Year</label>
            <input
              defaultValue="2024"
              className="h-8 px-3 w-24 text-[11px] font-mono bg-black border border-white/15 text-white/70 focus:outline-none focus:border-red-600/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Retirement Goal</label>
            <select className="h-8 px-3 w-36 text-[11px] font-mono bg-black border border-white/15 text-white/70 focus:outline-none focus:border-red-600/50">
              <option>20 YEARS</option>
              <option>15 YEARS</option>
              <option>25 YEARS</option>
              <option>30 YEARS</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="compare" className="accent-red-600" defaultChecked />
            <label htmlFor="compare" className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              Include in Comparison
            </label>
          </div>
          <button className="h-8 px-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-black tracking-widest transition-colors flex items-center gap-1.5">
            <Plus weight="bold" className="w-3 h-3" />
            CREATE SCENARIO
          </button>
        </div>
      </div>

      {/* ── Scenario Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-white/10 overflow-x-auto" style={{ background: '#050508' }}>
        {scenarios.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            className={`flex-none flex items-center gap-2 px-4 py-3 border-r border-white/10 transition-colors text-left ${
              activeScenario === s.id ? 'bg-white/5' : 'hover:bg-white/[0.03]'
            }`}>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[10px] font-mono font-black tracking-wider text-white/80">{s.label}</span>
                {activeScenario === s.id && (
                  <div className="w-px h-3 border-l border-white/20" />
                )}
              </div>
              <div className="text-[9px] font-mono text-white/35 mt-0.5 pl-4"
                style={{ color: activeScenario === s.id ? s.color + '99' : undefined }}>
                {s.sublabel}
              </div>
            </div>
            {scenarios.length > 1 && activeScenario === s.id && (
              <X weight="bold" className="w-3 h-3 text-white/20 hover:text-white/50 ml-1 flex-none" />
            )}
          </button>
        ))}
        <button className="flex-none flex items-center gap-1.5 px-4 py-3 text-white/30 hover:text-white/60 text-[10px] font-mono tracking-wider transition-colors">
          <Plus weight="bold" className="w-3 h-3" />
          ADD SCENARIO
        </button>
      </div>

      {/* ── Active Scenario Timeline ───────────────────────────────── */}
      {current ? (
        <TimelineGrid data={current.data} yearWidth={yearWidth} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-[11px] font-mono tracking-[0.3em] text-white/20 uppercase">[ NO SCENARIOS YET ]</div>
          <div className="text-[13px] font-mono text-white/30">Create a scenario above to get started.</div>
        </div>
      )}

      {/* ── Scenario Comparison Summary ────────────────────────────── */}
      <div className="border-t border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase mb-4">
          Scenario Comparison Summary
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                {['SCENARIO', 'RETIREMENT DATE', 'TOTAL YEARS', 'PROJ. RETIREMENT PAY (MO)', 'TOTAL EDUCATION BENEFITS', 'EST. NET WORTH AT RETIRE'].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 text-[9px] font-mono tracking-widest text-white/30 font-normal uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map(s => (
                <tr key={s.id}
                  className={`border-b border-white/[0.06] ${activeScenario === s.id ? 'bg-white/[0.03]' : ''}`}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: s.color }} />
                      <div>
                        <div className="text-[11px] font-mono font-black text-white/90">{s.label}</div>
                        <div className="text-[9px] font-mono text-white/35" style={{ color: s.color + '99' }}>
                          {s.sublabel}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-[11px] font-mono text-white/70">{s.retirementDate}</td>
                  <td className="py-3 pr-4 text-[11px] font-mono text-white/70">{s.totalYears}</td>
                  <td className={`py-3 pr-4 text-[12px] font-mono font-bold ${isDesert ? 'text-green-700' : 'text-green-400'}`}>{s.monthlyRetirementPay}</td>
                  <td className="py-3 pr-4 text-[12px] font-mono font-bold" style={{ color: s.color }}>{s.totalEducationBenefits}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono font-bold text-white/90">{s.estNetWorth}</span>
                      <TrendUp className={`w-3.5 h-3.5 ${isDesert ? 'text-green-700/60' : 'text-green-400/60'}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[9px] font-mono text-white/20">
          Projections are estimates based on current data and assumptions. Actual results may vary.
        </div>
        <button className="mt-2 text-[10px] font-mono font-bold text-red-500 hover:text-red-400 tracking-widest transition-colors flex items-center gap-1">
          VIEW DETAILED ANALYSIS →
        </button>
      </div>
    </div>
  );
}
