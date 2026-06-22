import { useEffect, useRef, useState } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import { useTheme } from '@/app/features/theme/ThemeContext';
import { motion, animate, useMotionValue, useTransform } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronRight, ExternalLink, Info } from 'lucide-react';
import {
  formatStoredDate,
  getEffectiveYearsOfService,
  getNextPayIncrease,
  getPayBracketIndex,
  PAY_BRACKETS_2026,
  PAY_TABLES_2026,
  type PayCategory,
} from './payTables2026';
import { readStoredPayOverviewSettings } from './payOverviewStorage';

const payCategories: PayCategory[] = ['enlisted', 'warrant', 'officer'];

const payCategoryLabels: Record<PayCategory, string> = {
  enlisted: 'Enlisted',
  warrant: 'Warrant Officer',
  officer: 'Officer',
};

const payCategoryTabLabels: Record<PayCategory, string> = {
  enlisted: 'ENLISTED',
  warrant: 'WARRANT OFFICER',
  officer: 'OFFICER',
};

const pageDescriptions: Record<PayCategory, string> = {
  enlisted: '2026 active duty basic pay tables for enlisted Marines, organized by years of service and pay grade.',
  warrant: '2026 warrant officer basic pay charts with the full service progression from entry through senior thresholds.',
  officer: '2026 commissioned officer pay scales, including the upper service brackets used for field grade and general officer pay.',
};

const payTableLinks: Record<PayCategory, { label: string; href: string }> = {
  enlisted: {
    label: '2026 Enlisted Pay Table',
    href: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/EM/',
  },
  warrant: {
    label: '2026 Warrant Officer Pay Table',
    href: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/WO/',
  },
  officer: {
    label: '2026 Officer Pay Table',
    href: 'https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/CO/',
  },
};

const notesByCategory: Record<PayCategory, string[]> = {
  enlisted: [
    'Base pay values reflect the 2026 DFAS pay tables only.',
    'Blank cells indicate no published chart value for that grade and service bracket.',
    'E-8 and E-9 begin at later service thresholds than junior enlisted grades.',
  ],
  warrant: [
    'W-5 pay begins at later service thresholds than W-1 through W-4.',
    'Values shown are monthly basic pay before taxes, allowances, or special pays.',
    'Charts are based on the 2026 DFAS warrant officer table.',
  ],
  officer: [
    'Senior officer rows include the capped high-service rates published by DFAS.',
    'Blank cells indicate no chart value is published for that combination.',
    'Values shown are monthly basic pay only and do not include BAS, BAH, or incentive pays.',
  ],
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number | null) {
  return value === null ? '—' : currencyFormatter.format(value);
}

interface AnimatedCurrencyProps {
  value: number | null;
  fromValue: number | null;
  shouldAnimate: boolean;
}

function AnimatedCurrency({ value, fromValue, shouldAnimate }: AnimatedCurrencyProps) {
  const initialValue = typeof fromValue === 'number' ? fromValue : typeof value === 'number' ? value : 0;
  const motionValue = useMotionValue(initialValue);
  const roundedValue = useTransform(() => currencyFormatter.format(motionValue.get()));

  useEffect(() => {
    if (value === null) {
      return;
    }

    if (!shouldAnimate) {
      motionValue.set(value);
      return;
    }

    const startValue = typeof fromValue === 'number' ? fromValue : motionValue.get();
    motionValue.set(startValue);

    const controls = animate(motionValue, value, {
      duration: 0.95,
      ease: 'easeInOut',
    });

    return () => controls.stop();
  }, [fromValue, motionValue, shouldAnimate, value]);

  if (value === null) {
    return <span>—</span>;
  }

  return <motion.span>{roundedValue}</motion.span>;
}

export function BasicPayPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const selectedCellRef = useRef<HTMLTableCellElement | null>(null);
  const selectedHeaderRef = useRef<HTMLTableCellElement | null>(null);
  const savedSettings = readStoredPayOverviewSettings();
  const [activeCategory, setActiveCategory] = useState<PayCategory>(savedSettings.payCategory);
  const previousCategoryRef = useRef<PayCategory>(savedSettings.payCategory);
  const effectiveYearsOfService = getEffectiveYearsOfService(savedSettings.yearsOfService, savedSettings.afadbd);
  const nextIncrease = getNextPayIncrease({
    category: savedSettings.payCategory,
    rank: savedSettings.payRank,
    yearsOfService: savedSettings.yearsOfService,
  }, savedSettings.afadbd);
  const formattedAfadbd = formatStoredDate(savedSettings.afadbd);
  const formattedNextIncreaseDate = nextIncrease?.effectiveDate
    ? nextIncrease.effectiveDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : null;

  const activeTable = PAY_TABLES_2026[activeCategory];
  const displayedRanks = [...activeTable.ranks].reverse();
  const selectedBracketIndex = getPayBracketIndex(effectiveYearsOfService);
  const activeTableLink = payTableLinks[activeCategory];
  // eslint-disable-next-line react-hooks/refs
  const previousCategory = previousCategoryRef.current;
  const previousTable = PAY_TABLES_2026[previousCategory];
  const previousDisplayedRanks = [...previousTable.ranks].reverse();
  const shouldAnimateTableValues = previousCategory !== activeCategory;

  useEffect(() => {
    previousCategoryRef.current = activeCategory;
  }, [activeCategory]);

  useEffect(() => {
    const scrollFrame = window.requestAnimationFrame(() => {
      const container = tableScrollRef.current;
      const target = selectedCellRef.current ?? selectedHeaderRef.current;
      if (!container || !target) return;

      const targetCenter = target.offsetLeft + target.offsetWidth / 2;
      const nextScrollLeft = Math.max(0, targetCenter - container.clientWidth / 2);

      container.scrollTo({
        left: nextScrollLeft,
        behavior: 'auto',
      });
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [activeCategory, selectedBracketIndex, savedSettings.payCategory, savedSettings.payRank]);

  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <SEOHead
        title="Marine Basic Pay Calculator"
        description="2026 Marine Corps basic pay calculator. Look up monthly military pay by rank and years of service for enlisted Marines, warrant officers, and commissioned officers."
        path="/pay-benefits/basic-pay"
      />
      <div className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 hero-bg" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none hero-fade-bottom" />

        <div className="relative z-10 flex flex-col" style={{ minHeight: '220px' }}>
          <div className="absolute top-5 right-8 hidden border border-white/10 bg-black/50 px-5 py-4 text-right lg:block">
            <div className="text-xs font-black text-white tracking-widest">2026 PAY TABLES</div>
            <div className="w-8 h-0.5 bg-red-600 ml-auto my-2" />
            <div className="text-[11px] text-gray-500 tracking-[0.2em]">DFAS-SOURCED</div>
            <div className="text-[11px] text-gray-500 tracking-[0.2em]">MISSION REFERENCE</div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button
                onClick={() => navigate('/')}
                className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0"
              >
                HOME
              </button>
              <ChevronRight className="w-3 h-3" />
              <button
                onClick={() => navigate('/pay-benefits')}
                className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0"
              >
                BENEFITS
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">BASIC PAY</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
                className="page-hero-title mb-3"
              >
                BASIC PAY<br />SCALES & CHARTS<span className="text-red-600">.</span>
              </motion.h1>
            </div>
            <p className="text-[14px] text-gray-400 max-w-2xl leading-relaxed mb-4">
              Browse the full 2026 basic pay charts for enlisted, warrant officer, and commissioned officer grades using the same data behind your pay overview.
            </p>
          </div>

        </div>
      </div>

      {/* Sticky pay-section tab bar */}
      <div className="sticky top-20 z-30 isolate border-b border-white/10 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center overflow-x-auto px-4 md:px-8">
          {[
            { label: 'OVERVIEW', path: '/pay-benefits' },
            { label: 'PAY CHARTS', path: '/pay-benefits/basic-pay' },
            { label: 'BAH LOOKUP', path: '/pay-benefits/bah' },
            { label: 'BONUS TOOL', path: '/pay-benefits/bonuses' },
          ].map(({ label, path }) => {
            const active = path === '/pay-benefits/basic-pay';
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap ${
                  active ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {label}
                {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="mb-8 flex items-center overflow-x-auto border-b border-white/12 -mx-8 px-8">
          {payCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative flex-shrink-0 whitespace-nowrap px-5 py-3 text-[12px] font-bold tracking-widest transition-colors ${
                activeCategory === category ? 'text-white' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {payCategoryTabLabels[category]}
              {activeCategory === category && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                  layoutId="basicPayTabLine"
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 xl:grid-cols-[minmax(0,1.6fr)_auto_auto] xl:items-end">
          <div className="min-w-0">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-2">ACTIVE TABLE</div>
            <h2 className="text-3xl font-black text-white tracking-tight">{activeTable.title} 2026 Basic Pay</h2>
            <p className="text-sm text-gray-400 mt-2 max-w-3xl">{pageDescriptions[activeCategory]}</p>
          </div>
          {formattedAfadbd && nextIncrease ? (
            <div className="xl:justify-self-center xl:self-end">
              <div className={`border px-4 py-3 text-left xl:min-w-[290px] xl:text-right ${isDesert ? 'border-red-700/40 bg-red-100/40' : 'border-red-900/40 bg-red-950/15'}`}>
                <div className="text-[11px] font-bold tracking-[0.2em] text-gray-500 mb-1">NEXT PAY INCREASE</div>
                <div className={`text-2xl font-black ${isDesert ? 'text-red-700' : 'text-red-300'}`}>+{formatCurrency(nextIncrease.monthlyIncrease)}</div>
                <div className="mt-1 text-xs text-gray-400">
                  {formattedNextIncreaseDate} · {nextIncrease.daysUntil} days · {nextIncrease.bracket.label}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden xl:block" />
          )}
          <div className="flex items-start xl:justify-self-end xl:self-end">
            <a
              href={activeTableLink.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors"
            >
              {activeTableLink.label} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 14, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          ref={tableScrollRef}
          className="overflow-x-auto border border-white/12 bg-black"
        >
          <table className="min-w-[1200px] w-full border-collapse">
            <thead>
              <tr className="border-b border-white/12 bg-white/[0.03]">
                <th className="sticky left-0 z-10 border-r border-white/12 bg-usmc-bg-surface px-4 py-3 text-left text-[12px] font-bold tracking-[0.2em] text-gray-400">
                  PAY GRADE
                </th>
                {PAY_BRACKETS_2026.map((bracket, index) => {
                  const isSelectedBracket = selectedBracketIndex === index;
                  return (
                    <th
                      key={bracket.label}
                      ref={isSelectedBracket ? selectedHeaderRef : null}
                      className={`border-r border-white/12 px-4 py-3 text-left text-xs font-bold tracking-wide ${
                        isSelectedBracket
                          ? isDesert ? 'bg-red-900/20 text-red-800' : 'bg-red-950/40 text-red-300'
                          : 'text-gray-300'
                      }`}
                    >
                      {bracket.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {displayedRanks.map((rank) => {
                const isSavedRank = activeCategory === savedSettings.payCategory && rank === savedSettings.payRank;
                return (
                  <tr key={rank} className="border-b border-white/8 hover:bg-white/[0.02]">
                    <td
                      className={`sticky left-0 z-10 border-r border-white/12 px-4 py-3 text-sm font-black tracking-wide ${
                        isSavedRank
                          ? isDesert ? 'bg-red-900/25 text-white' : 'bg-[#2a0c10] text-white'
                          : 'bg-usmc-bg-surface text-gray-200'
                      }`}
                    >
                      {rank}
                    </td>
                    {activeTable.payByRank[rank].map((value, index) => {
                      const isSelectedColumn = selectedBracketIndex === index;
                      const isSelectedCell =
                        activeCategory === savedSettings.payCategory &&
                        rank === savedSettings.payRank &&
                        selectedBracketIndex === index;
                      const rowIndex = displayedRanks.indexOf(rank);
                      const previousRank = previousDisplayedRanks[rowIndex];
                      const previousValue = previousRank ? previousTable.payByRank[previousRank]?.[index] ?? null : null;

                      return (
                        <td
                          key={`${rank}-${PAY_BRACKETS_2026[index].label}`}
                          ref={isSelectedCell ? selectedCellRef : null}
                          className={`border-r border-white/8 px-4 py-3 text-sm ${
                            isSelectedCell
                              ? 'pay-cell-pulse text-white font-bold'
                              : isSelectedColumn
                                ? isDesert
                                  ? 'bg-red-900/15 text-red-800 hover:bg-red-900/25'
                                  : 'bg-red-950/10 text-red-100 hover:bg-red-950/20'
                              : value === null
                                ? 'text-gray-600 hover:bg-white/[0.03] hover:text-gray-500'
                                : 'text-gray-300 hover:bg-white/[0.05] hover:text-white'
                          }`}
                        >
                          <AnimatedCurrency
                            value={value}
                            fromValue={previousValue}
                            shouldAnimate={shouldAnimateTableValues}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        <div className="mt-2 flex justify-end">
          <div className="text-[11px] text-gray-500 tracking-wide">
            Scroll right to see more values.
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Highlighted cells reflect your saved pay overview selection when the active table matches that category.
          </span>
        </div>

        <div className="mt-8 border border-white/12">
          <div className="p-6">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">SAVED PROFILE</div>
            <div className="text-[13px] text-red-500 font-bold tracking-widest mb-4">
              {savedSettings.payRank} | {effectiveYearsOfService} YEARS | {payCategoryLabels[savedSettings.payCategory].toUpperCase()}
              {formattedAfadbd ? ` | AFADBD ${formattedAfadbd.toUpperCase()}` : ''}
            </div>
            <div className="text-sm text-gray-300 leading-relaxed mb-4">
              Your pay overview selection is carried into this page so you can compare it against the full chart.
            </div>
            {formattedAfadbd ? (
              !nextIncrease && (
                <div className="mb-4 border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-400 leading-relaxed">
                  No higher basic pay step is available for this saved rank and service combination.
                </div>
              )
            ) : (
              <div className="mb-4 border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-400 leading-relaxed">
                Add AFADBD in Set Rank & Service to get an exact service calculation plus a countdown to the next pay increase.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-0 border border-white/12 md:grid-cols-[1.5fr_1fr]">
          <div className="p-6 border-b border-white/12 md:border-b-0 md:border-r border-white/12">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">TABLE NOTES</div>
            <div className="space-y-3">
              {notesByCategory[activeCategory].map((note) => (
                <p key={note} className="text-sm text-gray-400 leading-relaxed">
                  {note}
                </p>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">QUICK ACTIONS</div>
            <div className="space-y-3">
              <a
                href={activeTableLink.href}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-between border border-white/12 px-4 py-3 text-left text-sm font-bold tracking-wide text-gray-300 hover:border-white/30 hover:text-white transition-colors"
              >
                {activeTableLink.label}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
              <button
                onClick={() => navigate('/pay-benefits')}
                className="w-full border border-white/12 px-4 py-3 text-left text-sm font-bold tracking-wide text-gray-300 hover:border-white/30 hover:text-white transition-colors"
              >
                Open pay overview
              </button>
              <button
                onClick={() => navigate('/pay-benefits')}
                className="w-full border border-white/12 px-4 py-3 text-left text-sm font-bold tracking-wide text-gray-300 hover:border-white/30 hover:text-white transition-colors"
              >
                Update saved pay profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
