import { useEffect, useMemo, useState } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import { SpearWatermark } from '@/app/components/tactical/SpearWatermark';
import heroBanner from '@/app/assets/hero-3.webp';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Calculator, CalendarDays, ExternalLink, Info, Shield, TrendingUp, DollarSign, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/app/components/ui/dialog';
import { Calendar } from '@/app/components/ui/calendar';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  clampYearsOfService,
  formatStoredDate,
  getEffectiveYearsOfService,
  getNextAvailableBracket,
  getPayRate,
  getYearsOfServiceFromAfadbd,
  PAY_TABLES_2026,
  parseStoredDate,
  toStoredDateString,
  type PayCategory,
} from './payTables2026';
import {
  readStoredPayOverviewSettings,
  writeStoredPayOverviewSettings,
  type StoredPayOverviewSettings,
} from './payOverviewStorage';

const payNavTabs = [
  { label: 'OVERVIEW', path: '/pay-benefits' },
  { label: 'PAY CHARTS', path: '/pay-benefits/basic-pay' },
  { label: 'BONUS TOOL', path: '/pay-benefits/bonuses' },
];

const popularTopics = [
  { label: 'Basic Pay', desc: 'Pay scales and charts', path: '/pay-benefits/basic-pay' },
  { label: 'Bonuses', desc: 'Enlistment and extension', path: '/pay-benefits/bonuses' },
  { label: 'Allowances', desc: 'BAH, BAS, and more' },
  { label: 'Special & Incentive Pays', desc: 'Career and skill incentives' },
  { label: 'Taxes', desc: 'Federal and state information' },
  { label: 'Leave & Permissive TDY', desc: 'Policy and pay impacts' },
  { label: 'Pay Forms & Documents', desc: 'DD Forms and resources' },
];

const benefits = [
  { label: 'EDUCATION', desc: 'Tuition assistance, GI Bill, and credentialing.', glyph: 'M', link: '/education', external: false },
  { label: 'RETIREMENT', desc: 'Plan for your future with retirement and savings.', glyph: '1775', link: 'https://www.manpower.marines.mil/Divisions/Manpower-Management/Separation-and-Retirements-Branch/', external: true },
  { label: 'HEALTH CARE', desc: 'Comprehensive medical, dental, and vision coverage.', glyph: 'U', link: null, external: false },
  { label: 'HOUSING', desc: 'BAH, on-base housing, and housing resources.', glyph: 'S', link: null, external: false },
  { label: 'FAMILY SUPPORT', desc: 'Programs and services for Marines and their families.', glyph: 'C', link: null, external: false },
];

const tools = [
  { icon: TrendingUp, label: 'MILRETIRED.COM', desc: 'Compare all 50 states on taxes, cost of living, VA benefits, and retirement friendliness.', link: 'https://milretired.com' },
  { icon: Shield, label: 'SGLI', desc: "Servicemembers' Group Life Insurance details and coverage.", link: null },
  { icon: TrendingUp, label: 'THRIFT SAVINGS PLAN', desc: 'Plan for retirement with the TSP and resources.', link: null },
  { icon: DollarSign, label: 'FINANCIAL COUNSELING', desc: 'Get help from accredited financial counselors.', link: null },
  { icon: DollarSign, label: 'MONEY MATTERS', desc: 'Financial readiness tips and training.', link: null },
];

const payCategories: PayCategory[] = ['enlisted', 'warrant', 'officer'];

const payCategoryLabels: Record<PayCategory, string> = {
  enlisted: 'Enlisted',
  warrant: 'Warrant Officer',
  officer: 'Officer',
};

const basRates: Record<PayCategory, number> = {
  enlisted: 476.95,
  warrant: 328.48,
  officer: 328.48,
};

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const activeDutyPaydays2026 = [
  { payPeriod: 'January', payDate: '2026-01-15', lesAvailable: '2026-01-08' },
  { payPeriod: 'January', payDate: '2026-01-30', lesAvailable: '2026-01-23' },
  { payPeriod: 'February', payDate: '2026-02-13', lesAvailable: '2026-02-06' },
  { payPeriod: 'February', payDate: '2026-02-27', lesAvailable: '2026-02-20' },
  { payPeriod: 'March', payDate: '2026-03-13', lesAvailable: '2026-03-06' },
  { payPeriod: 'March', payDate: '2026-04-01', lesAvailable: '2026-03-25' },
  { payPeriod: 'April', payDate: '2026-04-15', lesAvailable: '2026-04-08' },
  { payPeriod: 'April', payDate: '2026-05-01', lesAvailable: '2026-04-25' },
  { payPeriod: 'May', payDate: '2026-05-15', lesAvailable: '2026-05-08' },
  { payPeriod: 'May', payDate: '2026-05-29', lesAvailable: '2026-05-22' },
  { payPeriod: 'June', payDate: '2026-06-15', lesAvailable: '2026-06-05' },
  { payPeriod: 'June', payDate: '2026-07-01', lesAvailable: '2026-06-24' },
  { payPeriod: 'July', payDate: '2026-07-15', lesAvailable: '2026-07-08' },
  { payPeriod: 'July', payDate: '2026-07-31', lesAvailable: '2026-07-24' },
  { payPeriod: 'August', payDate: '2026-08-14', lesAvailable: '2026-08-07' },
  { payPeriod: 'August', payDate: '2026-09-01', lesAvailable: '2026-08-25' },
  { payPeriod: 'September', payDate: '2026-09-15', lesAvailable: '2026-09-04' },
  { payPeriod: 'September', payDate: '2026-10-01', lesAvailable: '2026-09-24' },
  { payPeriod: 'October', payDate: '2026-10-15', lesAvailable: '2026-10-08' },
  { payPeriod: 'October', payDate: '2026-10-30', lesAvailable: '2026-10-23' },
  { payPeriod: 'November', payDate: '2026-11-13', lesAvailable: '2026-11-06' },
  { payPeriod: 'November', payDate: '2026-12-01', lesAvailable: '2026-11-24' },
  { payPeriod: 'December', payDate: '2026-12-15', lesAvailable: '2026-12-08' },
  { payPeriod: 'December', payDate: '2026-12-31', lesAvailable: '2026-12-24' },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatUppercaseDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(',', '').toUpperCase();
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function PayBenefitsPage() {
  const navigate = useNavigate();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [storedSettings, setStoredSettings] = useState<StoredPayOverviewSettings>(() => readStoredPayOverviewSettings());
  const [yearsInput, setYearsInput] = useState(() => String(readStoredPayOverviewSettings().yearsOfService));
  const [afadbdPickerOpen, setAfadbdPickerOpen] = useState(false);
  const [afadbdPickerMode, setAfadbdPickerMode] = useState<'day' | 'month-year'>('day');
  const [afadbdViewMonth, setAfadbdViewMonth] = useState(() => parseStoredDate(readStoredPayOverviewSettings().afadbd) ?? new Date(2010, 0, 1));
  const [afadbdPickerYear, setAfadbdPickerYear] = useState(() => (parseStoredDate(readStoredPayOverviewSettings().afadbd) ?? new Date(2010, 0, 1)).getFullYear());
  const { payCategory, payRank, yearsOfService, includeBas, afadbd } = storedSettings;
  const effectiveYearsOfService = getEffectiveYearsOfService(yearsOfService, afadbd);
  const afadbdDate = useMemo(() => parseStoredDate(afadbd), [afadbd]);
  const formattedAfadbd = formatStoredDate(afadbd);
  const selectableYears = Array.from({ length: new Date().getFullYear() - 1959 }, (_, index) => new Date().getFullYear() - index);

  const payTable = PAY_TABLES_2026[payCategory];
  const payDetails = getPayRate({
    category: payCategory,
    rank: payRank,
    yearsOfService: effectiveYearsOfService,
  });
  const nextAvailableBracket = getNextAvailableBracket({
    category: payCategory,
    rank: payRank,
    yearsOfService: effectiveYearsOfService,
  });
  const monthlyBasicPay = payDetails.monthlyBasicPay;
  const basRate = includeBas ? basRates[payCategory] : 0;
  const monthlyTotalPay = monthlyBasicPay !== null ? monthlyBasicPay + basRate : null;
  const annualizedPay = monthlyTotalPay !== null ? monthlyTotalPay * 12 : null;
  const semiMonthlyPay = monthlyTotalPay !== null ? monthlyTotalPay / 2 : null;
  const nextPayday = useMemo(() => {
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return activeDutyPaydays2026
      .map((entry) => {
        const payDate = parseIsoDate(entry.payDate);
        const lesDate = parseIsoDate(entry.lesAvailable);
        const daysAway = Math.ceil((payDate.getTime() - todayAtMidnight.getTime()) / 86_400_000);

        return {
          ...entry,
          payDate,
          lesDate,
          daysAway,
        };
      })
      .find((entry) => entry.daysAway >= 0) ?? null;
  }, []);

  function handleCategoryChange(category: PayCategory) {
    setStoredSettings((current) => ({
      ...current,
      payCategory: category,
      payRank: PAY_TABLES_2026[category].ranks[0],
    }));
  }

  useEffect(() => {
    writeStoredPayOverviewSettings(storedSettings);
  }, [storedSettings]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    // Radix can occasionally leave body pointer-events disabled after nested
    // dialog/popover interactions. Reset it whenever this page is active and
    // no modal surface should be blocking navigation.
    if (!selectorOpen && !afadbdPickerOpen) {
      document.body.style.pointerEvents = '';
    }

    return () => {
      document.body.style.pointerEvents = '';
    };
  }, [selectorOpen, afadbdPickerOpen]);

  useEffect(() => {
    setYearsInput(String(effectiveYearsOfService));
  }, [effectiveYearsOfService]);

  useEffect(() => {
    if (afadbdDate) {
      setAfadbdViewMonth(new Date(afadbdDate.getFullYear(), afadbdDate.getMonth(), 1));
      setAfadbdPickerYear(afadbdDate.getFullYear());
      return;
    }

    setAfadbdViewMonth(new Date(2010, 0, 1));
    setAfadbdPickerYear(2010);
  }, [afadbd]);

  useEffect(() => {
    if (!afadbdPickerOpen) {
      setAfadbdPickerMode('day');
    }
  }, [afadbdPickerOpen]);

  function handleYearsInputChange(nextValue: string) {
    if (afadbd) {
      return;
    }

    if (!/^\d{0,2}$/.test(nextValue)) {
      return;
    }

    setYearsInput(nextValue);

    if (nextValue === '') {
      return;
    }

    setStoredSettings((current) => ({
      ...current,
      yearsOfService: clampYearsOfService(Number(nextValue)),
    }));
  }

  function handleYearsInputBlur() {
    if (yearsInput === '') {
      setYearsInput(String(effectiveYearsOfService));
    }
  }

  function handleAfadbdSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    const storedDate = toStoredDateString(date);
    const derivedYears = getYearsOfServiceFromAfadbd(storedDate);

    setStoredSettings((current) => ({
      ...current,
      afadbd: storedDate,
      yearsOfService: derivedYears ?? current.yearsOfService,
    }));
    setAfadbdPickerOpen(false);
  }

  function changeAfadbdMonth(offset: number) {
    setAfadbdViewMonth((current) => {
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      setAfadbdPickerYear(nextMonth.getFullYear());
      return nextMonth;
    });
  }

  function handleAfadbdMonthPick(monthIndex: number) {
    setAfadbdViewMonth(new Date(afadbdPickerYear, monthIndex, 1));
    setAfadbdPickerMode('day');
  }

  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <SEOHead
        title="Marine Pay & Benefits"
        description="Calculate your Marine Corps base pay, allowances, and bonuses. 2026 USMC pay tables for enlisted, warrant officer, and commissioned officer ranks with years of service."
        path="/pay-benefits"
      />
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

        <div className="relative z-10 flex flex-col" style={{ minHeight: '220px' }}>
          {/* Financial Readiness overlay card */}
          <div className="hidden lg:block absolute top-5 right-8 border border-white/10 bg-black/60 px-5 py-4 text-right">
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
              className="text-[clamp(2.75rem,5vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-3"
            >
              PAY &<br />BENEFITS
            </motion.h1>
            <p className="text-[14px] text-gray-400 max-w-xs leading-relaxed mb-4">
              Competitive pay. Comprehensive benefits. Financial security for you and your family, today and tomorrow.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center px-4 md:px-8 -mb-px overflow-x-auto">
            {payNavTabs.map(({ label, path }) => {
              const active = path === '/pay-benefits';
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
      </div>

      {/* Dashboard grid */}
      <div className="px-8 py-8 border-b border-white/12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/12">
          {/* Pay Overview */}
          <div className="p-6 border-r border-white/12">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">PAY OVERVIEW</div>
            <div className="text-[13px] text-red-500 font-bold tracking-widest mb-4">
              {payRank} | {payDetails.bracket.label.toUpperCase()} YEARS OF SERVICE
            </div>
            <div className="mb-4">
              <div className="text-[13px] text-gray-600 tracking-wider mb-1">2026 MONTHLY BASIC PAY</div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">
                  {monthlyTotalPay !== null ? formatCurrency(monthlyTotalPay) : 'N/A'}
                </span>
                <Info className="w-3.5 h-3.5 text-gray-600 mb-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-[13px] text-gray-600 tracking-wider mb-1">ANNUALIZED BASIC PAY</div>
                <div className="text-xl font-bold text-gray-300">
                  {annualizedPay ? formatCurrency(annualizedPay) : 'Unavailable'}
                </div>
              </div>
              <div>
                <div className="text-[13px] text-gray-600 tracking-wider mb-1">SEMI-MONTHLY ESTIMATE</div>
                <div className="text-xl font-bold text-gray-300">
                  {semiMonthlyPay ? formatCurrency(semiMonthlyPay) : 'Unavailable'}
                </div>
              </div>
            </div>
            <div className="border-t border-white/12 pt-4 mb-5">
              <div className="text-[13px] text-gray-600 tracking-wider mb-1">PROFILE</div>
              <div className="text-sm font-bold text-white tracking-wide">
                {payCategoryLabels[payCategory]} | {payRank} | {effectiveYearsOfService} years
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mt-2">
                Based on the 2026 DFAS basic pay tables{includeBas ? ' with BAS included' : ''}. Excludes BAH, special pays, taxes, and deductions.
              </p>
              {formattedAfadbd && (
                <div className="mt-2 text-xs text-gray-500">
                  AFADBD: <span className="font-bold text-white">{formattedAfadbd}</span>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                BAS: <span className="font-bold text-white">{includeBas ? formatCurrency(basRates[payCategory]) : 'Not included'}</span>
              </div>
              {monthlyBasicPay === null && nextAvailableBracket && (
                <p className="text-xs text-amber-400 leading-relaxed mt-2">
                  This grade begins paying at the {nextAvailableBracket.label.toLowerCase()} bracket.
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectorOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/16 text-gray-400 text-[13px] font-bold tracking-widest hover:border-white/40 hover:text-white transition-colors"
            >
              <Calculator className="w-3 h-3" /> SET RANK & SERVICE
            </button>
          </div>

          {/* Next Pay Day */}
          <div className="p-6 border-r border-white/12">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">NEXT PAY DAY</div>
            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 border border-red-600/40 flex items-center justify-center flex-shrink-0">
                <motion.div
                  className="w-1.5 h-1.5 bg-red-600 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.65, 1, 0.65],
                    boxShadow: [
                      '0 0 0 rgba(220,38,38,0)',
                      '0 0 10px rgba(220,38,38,0.75)',
                      '0 0 0 rgba(220,38,38,0)',
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight">
                  {nextPayday ? formatUppercaseDate(nextPayday.payDate) : 'NO UPCOMING 2026 DATE'}
                </div>
                <div className="text-[13px] text-gray-500 tracking-wider mt-1">
                  {nextPayday
                    ? `${nextPayday.daysAway} ${nextPayday.daysAway === 1 ? 'DAY' : 'DAYS'} AWAY`
                    : '2026 PAYDAY SCHEDULE COMPLETE'}
                </div>
                {nextPayday && (
                  <div className="mt-2 text-xs text-gray-500">
                    {nextPayday.payPeriod} pay period LES available: {formatShortDate(nextPayday.lesDate)}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-white/12 pt-4">
              <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-2">DFAS MYPAY LOGIN</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-black text-green-400" style={{ fontStyle: 'italic' }}>MyPay</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-3">Access your LES, W-2, and pay information.</p>
              <a
                href="https://mypay.dfas.mil/#/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors"
              >
                LOG IN TO MYPAY <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Popular Topics */}
          <div className="p-6">
            <div className="text-[13px] text-gray-500 font-bold tracking-[0.2em] mb-3">POPULAR TOPICS</div>
            <div className="space-y-0">
              {popularTopics.map((topic, i) => {
                const rowClassName = 'w-full flex items-center justify-between py-2.5 border-b border-white/10 last:border-0 text-left group';

                if (topic.path) {
                  return (
                    <Link key={i} to={topic.path} className={rowClassName}>
                      <div>
                        <div className="text-sm text-gray-300 group-hover:text-white transition-colors">{topic.label}</div>
                        <div className="text-xs text-gray-600">{topic.desc}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
                    </Link>
                  );
                }

                return (
                  <div key={i} className={rowClassName}>
                    <div>
                      <div className="text-sm text-white/25">{topic.label}</div>
                      <div className="text-xs text-gray-700">{topic.desc}</div>
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5 flex-shrink-0">COMING SOON</span>
                  </div>
                );
              })}
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
          {benefits.map((b, i) => {
            const inner = (
              <>
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black border border-white/12 mb-3 group-hover:border-white/30 transition-colors overflow-hidden relative" style={{ backgroundColor: '#050508' }}>
                  <div className="absolute inset-0 opacity-40" style={{
                    background: `linear-gradient(${135 + i * 15}deg, rgba(20,10,5,1) 0%, rgba(5,5,5,1) 100%)`
                  }} />
                  {!b.link && <SpearWatermark opacity={0.07} size="75%" />}
                  {b.link && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <div className="text-5xl font-black text-white">{b.glyph}</div>
                    </div>
                  )}
                </div>
                <div className="text-sm font-bold text-white tracking-wide mb-1 group-hover:text-red-400 transition-colors">{b.label}</div>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-2 flex-1">{b.desc}</p>
                {b.link
                  ? <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-widest text-red-500 group-hover:text-red-400 transition-colors">EXPLORE <ChevronRight className="w-2.5 h-2.5" /></span>
                  : <span className="inline-block text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5">COMING SOON</span>
                }
              </>
            );
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {b.link ? (
                  b.external ? (
                    <a href={b.link} target="_blank" rel="noopener noreferrer" className="group flex flex-col cursor-pointer">
                      {inner}
                    </a>
                  ) : (
                    <Link to={b.link} className="group flex flex-col cursor-pointer">
                      {inner}
                    </Link>
                  )
                ) : (
                  <div className="group flex flex-col cursor-default">
                    {inner}
                  </div>
                )}
              </motion.div>
            );
          })}
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
            const inner = (
              <>
                <Icon className="w-5 h-5 text-red-600/60 mb-3 group-hover:text-red-500 transition-colors" />
                <div className="text-[13px] font-bold text-white tracking-wide mb-2 group-hover:text-red-400 transition-colors">{tool.label}</div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{tool.desc}</p>
                {tool.link
                  ? <span className="text-red-500 text-[13px] font-bold group-hover:text-red-400 transition-colors">→</span>
                  : <span className="inline-block text-[9px] font-bold tracking-widest text-white/20 border border-white/10 px-2 py-0.5">COMING SOON</span>
                }
              </>
            );
            const cls = `p-5 ${i < tools.length - 1 ? 'border-r border-white/12' : ''} hover:bg-red-900/5 transition-colors group`;
            return tool.link ? (
              <a key={i} href={tool.link} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <div key={i} className={`${cls} cursor-default`}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo + tagline banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-white/12" style={{ minHeight: '240px' }}>
        <div className="relative overflow-hidden border-b md:border-b-0 md:border-r border-white/12" style={{ minHeight: '200px' }}>
          <img src={heroBanner} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)' }} />
        </div>
        <div className="p-8 flex flex-col justify-center">
          <div className="text-xl font-black text-white tracking-tight mb-3">FINANCIAL READINESS IS MISSION READINESS<span className="text-red-600">.</span></div>
          <div className="w-8 h-0.5 bg-red-600 mb-4" />
          <p className="text-[15px] text-gray-400 leading-relaxed mb-2">Take control of your financial future.</p>
          <p className="text-[15px] text-gray-400">We've got your six.</p>
        </div>
      </div>

      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className="max-w-3xl border-white/12 bg-[#09090c] p-0 text-white">
          <div className="border-b border-white/10 px-6 py-5">
            <DialogTitle className="text-2xl font-black tracking-tight">Set Rank & Service</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-gray-400">
              Choose a 2026 pay category, pay grade, and years of service. Add AFADBD for a precise time-in-service calculation and pay-step countdowns.
            </DialogDescription>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
            <div className="mb-6">
              <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500 mb-3">CATEGORY</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {payCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`border px-4 py-3 text-left transition-colors ${
                      payCategory === category
                        ? 'border-red-600 bg-red-950/40 text-white'
                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-bold tracking-wide">{payCategoryLabels[category]}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {PAY_TABLES_2026[category].ranks.join(' · ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500 mb-3">PAY GRADE</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {payTable.ranks.map((rank) => (
                  <button
                    key={rank}
                    onClick={() => setStoredSettings((current) => ({ ...current, payRank: rank }))}
                    className={`border px-4 py-3 text-sm font-bold tracking-wide transition-colors ${
                      payRank === rank
                        ? 'border-red-600 bg-red-950/40 text-white'
                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {rank}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500">YEARS OF SERVICE</div>
                <div className="text-sm font-bold text-white">{effectiveYearsOfService} years</div>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={effectiveYearsOfService}
                disabled={Boolean(afadbd)}
                onChange={(event) => setStoredSettings((current) => ({
                  ...current,
                  yearsOfService: clampYearsOfService(Number(event.target.value)),
                }))}
                className={`w-full accent-red-600 ${afadbd ? 'cursor-not-allowed opacity-50' : ''}`}
              />
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={yearsInput}
                  onChange={(event) => handleYearsInputChange(event.target.value)}
                  onBlur={handleYearsInputBlur}
                  disabled={Boolean(afadbd)}
                  className={`w-24 border border-white/12 bg-black px-3 py-2 text-sm text-white ${afadbd ? 'cursor-not-allowed opacity-50' : ''}`}
                />
                <div className="text-sm text-gray-400">
                  Service bracket: <span className="font-bold text-white">{payDetails.bracket.label}</span>
                </div>
              </div>
              {afadbd && (
                <p className="mt-3 text-xs text-red-300">
                  Years of service are being calculated automatically from AFADBD.
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500">AFADBD</div>
                {afadbd && (
                  <button
                    onClick={() => setStoredSettings((current) => ({ ...current, afadbd: null }))}
                    className="flex items-center gap-1 text-xs font-bold tracking-widest text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" /> CLEAR
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAfadbdPickerOpen((current) => !current)}
                  className="flex min-w-[220px] items-center justify-between border border-white/12 bg-black px-4 py-3 text-left text-sm text-white hover:border-white/30 transition-colors"
                >
                  <span>{formattedAfadbd ?? 'Select AFADBD'}</span>
                  <CalendarDays className="w-4 h-4 text-red-400" />
                </button>
                <div className="text-sm text-gray-400">
                  {afadbd
                    ? 'Precise service time and future pay-step dates enabled.'
                    : 'Optional: use AFADBD for exact time in service and pay increase timing.'}
                </div>
              </div>
              {afadbdPickerOpen && (
                <div className="mt-4 w-[320px] border border-white/12 bg-[#09090c] p-3 text-white">
                  {afadbdPickerMode === 'day' ? (
                    <>
                      <div className="mb-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => changeAfadbdMonth(-1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/12 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.08] transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAfadbdPickerMode('month-year')}
                          className="px-3 py-2 text-base font-bold text-white hover:text-red-300 transition-colors"
                        >
                          {afadbdViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </button>
                        <button
                          type="button"
                          onClick={() => changeAfadbdMonth(1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/12 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.08] transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <Calendar
                        mode="single"
                        month={afadbdViewMonth}
                        onMonthChange={setAfadbdViewMonth}
                        selected={afadbdDate ?? undefined}
                        onSelect={handleAfadbdSelect}
                        className="p-0"
                        classNames={{
                          caption: 'hidden',
                          nav: 'hidden',
                          months: 'flex flex-col gap-0',
                          month: 'flex flex-col gap-3',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setAfadbdPickerMode('day')}
                          className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                        >
                          <ChevronLeft className="w-3 h-3" /> BACK
                        </button>
                        <div className="text-sm font-bold text-white">Choose Month for {afadbdPickerYear}</div>
                        <div className="w-10" />
                      </div>
                      <div className="grid grid-cols-[92px_1fr] gap-3">
                        <ScrollArea className="h-[280px] border border-white/10 bg-black/40">
                          <div className="pr-2">
                            {selectableYears.map((year) => (
                              <button
                                type="button"
                                key={year}
                                onClick={() => setAfadbdPickerYear(year)}
                                className={`w-full border-b border-white/6 px-3 py-2 text-left text-sm transition-colors last:border-b-0 ${
                                  afadbdPickerYear === year
                                    ? 'bg-red-950/40 text-white'
                                    : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="grid grid-cols-3 gap-2">
                          {monthLabels.map((month, monthIndex) => (
                            <button
                              type="button"
                              key={month}
                              onClick={() => handleAfadbdMonthPick(monthIndex)}
                              className={`border px-3 py-4 text-sm font-bold transition-colors ${
                                afadbdViewMonth.getMonth() === monthIndex && afadbdViewMonth.getFullYear() === afadbdPickerYear
                                  ? 'border-red-600 bg-red-950/40 text-white'
                                  : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/30 hover:text-white'
                              }`}
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500 mb-3">BAS</div>
              <button
                onClick={() => setStoredSettings((current) => ({ ...current, includeBas: !current.includeBas }))}
                className={`flex w-full items-center justify-between border px-4 py-3 text-left transition-colors ${
                  includeBas
                    ? 'border-red-600 bg-red-950/40 text-white'
                    : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-sm font-bold tracking-wide">Include BAS</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {payCategory === 'enlisted' ? 'Enlisted' : 'Officer/Warrant'} rate: {formatCurrency(basRates[payCategory])}
                  </div>
                </div>
                <div className="text-sm font-bold">{includeBas ? 'ON' : 'OFF'}</div>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 border border-white/10 bg-white/[0.02] p-4 md:grid-cols-3">
              <div>
                <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500 mb-2">MONTHLY</div>
                <div className="text-2xl font-black text-white">
                  {monthlyTotalPay !== null ? formatCurrency(monthlyTotalPay) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500 mb-2">ANNUAL</div>
                <div className="text-2xl font-black text-white">
                  {annualizedPay ? formatCurrency(annualizedPay) : 'Unavailable'}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold tracking-[0.2em] text-gray-500 mb-2">SEMI-MONTHLY</div>
                <div className="text-2xl font-black text-white">
                  {semiMonthlyPay ? formatCurrency(semiMonthlyPay) : 'Unavailable'}
                </div>
              </div>
            </div>

            {monthlyBasicPay !== null && includeBas && (
              <p className="mt-4 text-sm text-gray-400">
                Monthly total includes {formatCurrency(monthlyBasicPay)} base pay plus {formatCurrency(basRates[payCategory])} BAS.
              </p>
            )}

            {monthlyBasicPay === null && nextAvailableBracket && (
              <p className="mt-4 text-sm text-amber-400">
                No chart value is listed for this combination yet. The next available rate for {payRank} starts at {nextAvailableBracket.label.toLowerCase()} years of service.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
