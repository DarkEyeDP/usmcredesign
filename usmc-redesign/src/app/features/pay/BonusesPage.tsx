import { useEffect, useState } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronDown, ChevronRight, ExternalLink, Info, RefreshCw, Star, Target } from 'lucide-react';
import { DatePickerField } from '@/app/components/ui/date-picker-field';
import {
  calculateSrbp,
  SRBP_MARADMIN_LINK,
  SRBP_MONTH_OPTIONS,
  SRBP_MOS_OPTIONS,
  SRBP_NMOS_OPTIONS,
  type SrbpCalculationState,
  type SrbpFormValues,
  type SrbpRank,
} from './srbpCalculator';

const STORAGE_KEY = 'pay-benefits:srbp-settings:v1';

const SRBP_FAQ_ITEMS = [
  {
    q: 'What is the SRBP (Selective Retention Bonus Program)?',
    a: 'The Selective Retention Bonus Program (SRBP) is a Marine Corps cash incentive designed to retain experienced active-duty enlisted Marines in critical MOS fields. Eligible Marines who reenlist receive a lump-sum bonus based on their PMOS, pay grade, reenlistment zone, and contract length. The FY27 SRB Program is authorized by MARADMIN 023/26, signed January 22, 2026, and covers Marines with an Expiration of Current Contract (ECC) from October 1, 2026 through September 30, 2027.',
  },
  {
    q: 'Who is eligible for the FY27 Marine Corps SRBP?',
    a: 'Eligibility for the FY27 SRB requires: (1) an ECC falling between October 1, 2026 and September 30, 2027; (2) holding a PMOS listed in the authorized FY27 bonus tables; (3) reenlisting on or after the release of MARADMIN 023/26 (January 22, 2026); and (4) being a regular component first-term or career Marine. Zones A through F are authorized, though each has different grade and MOS restrictions. Some MOS have additional grade limits — always consult your career planner and the official MARADMIN to confirm your specific eligibility.',
  },
  {
    q: 'What are SRBP zones and how are they determined?',
    a: 'SRB zones are based on total years of active military service on the date of reenlistment, calculated using the Armed Forces Active-Duty Base Date (per MARADMIN 023/26, para 7.f). Zone A: 17 months to 6 years. Zone B: 6 to 10 years. Zone C: 10 to 14 years. Zone D: 14 to 18 years. Zone E: 18 to 20 years. Zone F: 20 to 24 years. Zones D through F have very limited PMOS eligibility. Marines with exactly the maximum years for a given zone on the date of reenlistment may still qualify for that zone if they have not previously received a bonus in it.',
  },
  {
    q: 'How is the Marine Corps reenlistment bonus calculated?',
    a: 'The FY27 SRBP uses published flat-rate dollar amounts — not a formula based on base pay. The pre-tax bonus amount is determined by your reenlistment zone, your grade on the date of reenlistment, and your PMOS (as listed in the MARADMIN tables). Reenlistment for at least 48 months of additional obligated service is required to receive the full flat-rate amount. Kickers (which add a fixed dollar amount on top) are only available on contracts of 60 months or more of additional obligated service. If you reenlist before your ECC, your obligated months may be prorated, which can affect your bonus amount.',
  },
  {
    q: 'What are SRBP kickers and how do they increase my bonus?',
    a: 'The FY27 SRBP offers seven kickers — fixed dollar amounts added on top of the base PMOS bonus for Marines who meet specific additional requirements. The seven kickers are: (1) Aircraft Maintenance Kicker ($5,000–$15,000, E-7 and below, aviation PMOS with qualifying NMOS such as 6016 CDI, 6017 CDQAR, or 6018 QAR); (2) Aircraft Readiness Kicker ($8,000–$24,000, E-7 and below, aviation PMOS, qualifying NMOS, and authorized MCC); (3) 84-Month Lateral Move Kicker ($50,000, Zone A, E-5 and below, into select PMOSs); (4) 72-Month Mid-Career LM Kicker ($35,000, Zone B, E-7 and below, into select PMOSs); (5) 24-Month FMF Infantry Kicker ($7,000, first-term E-5 and below in 0311/0313/0321/0331/0341/0352 with qualifying MCC); (6) 36-Month FMF Infantry Kicker ($30,000, same eligibility, higher MCC commitment); (7) Air Traffic Control Kicker ($40,000, Zone A only, 7257 PMOS with ATC NMOS 7252/7253/7254). All kickers require 60 months of additional obligated service. Marines eligible for multiple kickers may only receive one — the tool highlights the best available option.',
  },
  {
    q: 'Which MOS qualify for the FY27 SRBP?',
    a: 'The FY27 SRBP covers a wide range of critical Marine Corps MOS fields including infantry (0311, 0321, 0331, 0341, 0352), reconnaissance (0321, 0372), intelligence (0211, 0231, 0241, 0261), signals (2621, 2631, 2641, 2651), communications (0627, 0631, 0671), aviation maintenance (61xx, 62xx, 63xx series), air traffic control (7240, 7257), cyber/EW (5939, 5974, 5979), and others. The complete zone-by-zone tables are in MARADMIN 023/26. Use the SRBP Estimator above — it includes the full FY27 eligible MOS list and will automatically determine if your MOS qualifies.',
  },
  {
    q: 'Is the Marine Corps SRBP taxable?',
    a: 'Yes, SRB payments are generally subject to federal income tax and are treated as supplemental wages. However, if you are physically present in a designated tax-free combat zone on the date you reenlist and sign your reenlistment documents, your SRB is paid tax-free — regardless of when the payment is actually disbursed. Because SRBP payments are made in the FY of your ECC (which may be months after you sign), the determining factor is where you are when you sign, not where you are when the money arrives. Select "Tax-free combat zone" in the estimator only if you will physically be in a qualifying combat zone on your reenlistment signing date. State income tax treatment varies — consult a tax advisor or your installation\'s personal financial counselor.',
  },
  {
    q: 'When is the SRBP paid?',
    a: 'Per MARADMIN 023/26, SRB payments are made in the fiscal year of your ECC — not at the time you sign your reenlistment contract. Marines who reenlist ahead of their ECC lock in their bonus eligibility but receive payment in the appropriate FY. If a Marine does not receive their payment within their designated retention FY, they have the option to submit for separation within 90 days of that FY concluding. Lateral move bonuses are paid only after successful completion of formal PMOS training and award of the new PMOS, not at reenlistment signing.',
  },
  {
    q: 'Can I get a bonus for switching MOS (lateral move)?',
    a: 'Yes. Two mechanisms exist. First, LM-designated PMOSs in the bonus tables (marked "LM" in the MARADMIN) pay a flat-rate bonus to Marines who execute a lateral move reenlistment into that PMOS — paid after completing PMOS training, not at signing. Marines who fail to complete LM PMOS training receive no bonus. Second, Zone A Marines executing an LM into select PMOSs may earn the $50,000 84-month LM Kicker, and Zone B Marines executing an LM into select PMOSs may earn the $35,000 72-month Mid-Career LM Kicker, both in addition to any PMOS bonus. Enter your target MOS in the "Lateral Move MOS" field in the estimator to see if it qualifies.',
  },
  {
    q: 'What is the lifetime SRBP career limit?',
    a: 'Per MARADMIN 023/26 para 7.e, no Marine may exceed $360,000 in total career SRB payments. Previous SRB payments count against this ceiling. For example, a Zone A Sergeant who LMs into 0211 on an 84-month contract receives $101,000 and would only be eligible for up to $259,000 in future bonuses. Additionally, Marines selected to First Sergeant are not eligible to receive a PMOS bonus after the release of the selection MARADMIN. The FY27 BSSRB (Broken Service SRB) program is suspended — prior service Marines reenlisting back into the active component with less than a 4-year break in service are not eligible for a BSSRB.',
  },
] as const;

const defaultValues: SrbpFormValues = {
  pebd: '',
  rank: '',
  mos: '',
  ecc: '',
  reenlistDate: '',
  months: '48',
  lateralMove: '',
  mcc: '',
  taxFreeZone: false,
  nmosSelections: [],
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function readStoredValues(): SrbpFormValues {
  if (typeof window === 'undefined') {
    return defaultValues;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultValues;
    }

    const parsed = JSON.parse(raw) as Partial<SrbpFormValues>;
    return {
      ...defaultValues,
      ...parsed,
      nmosSelections: Array.isArray(parsed.nmosSelections)
        ? parsed.nmosSelections.filter((value): value is string => typeof value === 'string')
        : [],
    };
  } catch {
    return defaultValues;
  }
}

function normalizeFourDigitCode(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 4);
}

function normalizeMcc(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 3);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[11px] font-bold tracking-[0.2em] text-gray-500">{children}</span>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1.5 block text-[11px] leading-relaxed text-gray-600">{children}</span>
  );
}

const inputClass =
  'w-full border border-white/12 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500/70 focus:bg-white/[0.02]';

export function BonusesPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<SrbpFormValues>(() => readStoredValues());
  const [resultState, setResultState] = useState<SrbpCalculationState>({ status: 'idle' });
  const [nmosOpen, setNmosOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  function updateValue<K extends keyof SrbpFormValues>(key: K, nextValue: SrbpFormValues[K]) {
    setValues((current) => ({
      ...current,
      [key]: nextValue,
    }));
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultState(calculateSrbp(values));
  }

  function handleReset() {
    setValues(defaultValues);
    setResultState({ status: 'idle' });
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function toggleNmos(code: string) {
    setValues((current) => ({
      ...current,
      nmosSelections: current.nmosSelections.includes(code)
        ? current.nmosSelections.filter((item) => item !== code)
        : [...current.nmosSelections, code],
    }));
  }

  const result = resultState.status === 'success' ? resultState.result : null;

  return (
    <div className="min-h-screen bg-black pb-5 md:pb-0">
      <SEOHead
        title="FY27 Marine Corps SRBP Calculator | Reenlistment Bonus Estimator"
        description="Estimate your FY27 Marine Corps Selective Retention Bonus Program (SRBP) payout. Enter your MOS, rank, PEBD, ECC, and contract length — the tool calculates your base bonus, prorated amount, and best available kicker using official FY27 MARADMIN data."
        keywords="Marine Corps SRBP, Marine Corps reenlistment bonus, USMC reenlistment bonus calculator, FY27 SRBP, Selective Retention Bonus Program, Marine Corps bonus MOS, SRBP kicker, SRBP zones, Marine Corps bonus 2026 2027, USMC bonus by MOS, Marine reenlistment pay"
        path="/pay-benefits/bonuses"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'FY27 Marine Corps SRBP Bonus Calculator',
            url: 'https://stay-marine.com/pay-benefits/bonuses',
            description: 'Estimate your FY27 Selective Retention Bonus Program payout based on MOS, pay grade, reenlistment zone, contract length, and kicker eligibility.',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Stay Marine', url: 'https://stay-marine.com' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://stay-marine.com/' },
              { '@type': 'ListItem', position: 2, name: 'Pay & Benefits', item: 'https://stay-marine.com/pay-benefits' },
              { '@type': 'ListItem', position: 3, name: 'Bonus Tool', item: 'https://stay-marine.com/pay-benefits/bonuses' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Estimate Your Marine Corps FY27 SRBP Bonus',
            description: 'Use the Stay Marine SRBP Estimator to calculate your reenlistment bonus in four steps.',
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Enter your identity and dates',
                text: 'Enter your PEBD, current rank, PMOS, and current ECC. Your PEBD determines your reenlistment zone (A, B, C, or D) and the ECC must fall within the authorized FY27 window.',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Fill in contract details',
                text: 'Select your planned reenlistment date (on or after January 22, 2026), choose a reenlistment length (48 months minimum for the base bonus; 60 months minimum to unlock kickers), and optionally enter a lateral move MOS, MCC, and tax status.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Add NMOS qualifications (if applicable)',
                text: 'If you hold qualifying additional MOS codes — such as CDI (6016), CDQAR (6017), QAR (6018), or ATC ratings (7252–7254) — select them to unlock aircraft maintenance, readiness, or ATC kicker eligibility.',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Review your SRBP estimate',
                text: 'The tool shows your base bonus, prorated amount, all available kickers with the best option highlighted, and a pre- and post-tax estimate range using official FY27 MARADMIN multipliers.',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: SRBP_FAQ_ITEMS.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ]}
      />
      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-20">
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
          <div className="absolute right-8 top-5 hidden border border-white/10 bg-black/50 px-5 py-4 text-right lg:block">
            <div className="text-xs font-black tracking-widest text-white">RETENTION INCENTIVES</div>
            <div className="my-2 ml-auto h-0.5 w-8 bg-red-600" />
            <div className="text-[11px] tracking-[0.2em] text-gray-500">FY27 SRBP</div>
            <div className="text-[11px] tracking-[0.2em] text-gray-500">ESTIMATE TOOL</div>
          </div>

          <div className="flex flex-1 flex-col justify-center px-4 py-6 sm:px-8">
            <div className="mb-2 flex items-center gap-2 font-mono text-[12px] tracking-wider text-gray-600">
              <button
                onClick={() => navigate('/')}
                className="border-0 bg-transparent p-0 text-[12px] font-mono tracking-wider transition-colors hover:text-gray-400"
              >
                HOME
              </button>
              <ChevronRight className="h-3 w-3" />
              <button
                onClick={() => navigate('/pay-benefits')}
                className="border-0 bg-transparent p-0 text-[12px] font-mono tracking-wider transition-colors hover:text-gray-400"
              >
                BENEFITS
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-red-500">BONUSES</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
                className="page-hero-title mb-3"
              >
                BONUSES &<br />RETENTION PAYS<span className="text-red-600">.</span>
              </motion.h1>
            </div>
            <p className="mb-4 max-w-2xl text-[14px] leading-relaxed text-gray-400">
              Estimate a FY27 Selective Retention Bonus Program payout using your rank, zone, PMOS, contract length,
              and kicker qualifiers. Built from official MARADMIN data.
            </p>
          </div>

        </div>
      </div>

      {/* Sticky pay-section tab bar */}
      <div className="sticky top-20 z-30 isolate border-b border-white/10 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center overflow-x-auto px-4 sm:px-8">
          {[
            { label: 'OVERVIEW', path: '/pay-benefits' },
            { label: 'PAY CHARTS', path: '/pay-benefits/basic-pay' },
            { label: 'BAH LOOKUP', path: '/pay-benefits/bah' },
            { label: 'BONUS TOOL', path: '/pay-benefits/bonuses' },
          ].map(({ label, path }) => {
            const active = path === '/pay-benefits/bonuses';
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

      {/* ── Main layout ── */}
      <div className="relative px-4 py-8 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr]">

          {/* Left — form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 01 — Identity & Dates */}
            <div className="border border-white/12 bg-black">
              <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-6 py-4">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
                  <span className="text-sm font-bold text-red-500">1</span>
                </div>
                <span className="text-sm font-bold tracking-widest text-gray-400">IDENTITY & DATES</span>
              </div>
              <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
                <div className="block">
                  <FieldLabel>PEBD</FieldLabel>
                  <DatePickerField
                    value={values.pebd}
                    onChange={(v) => updateValue('pebd', v)}
                    placeholder="Select PEBD"
                    minYear={1970}
                    maxYear={new Date().getFullYear()}
                  />
                  <FieldHint>Initial pay entry base date.</FieldHint>
                </div>

                <label className="block">
                  <FieldLabel>CURRENT RANK</FieldLabel>
                  <div className="relative">
                    <select
                      value={values.rank}
                      onChange={(event) => updateValue('rank', event.target.value as SrbpRank | '')}
                      className={`w-full appearance-none border bg-black px-4 py-3 pr-8 font-mono text-sm focus:outline-none focus:border-red-500/50 ${
                        !values.rank ? 'border-red-500 bg-red-950/15 text-gray-600' : 'border-white/16 text-white'
                      }`}
                    >
                      <option value="" disabled hidden>e.g. Sergeant (E-5)</option>
                      <option value="E3">Lance Corporal (E-3)</option>
                      <option value="E4">Corporal (E-4)</option>
                      <option value="E5">Sergeant (E-5)</option>
                      <option value="E6">Staff Sergeant (E-6)</option>
                      <option value="E7">Gunnery Sergeant (E-7)</option>
                      <option value="E8">Master Sergeant / 1stSgt (E-8)</option>
                      <option value="E9">Sergeant Major (E-9)</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                  </div>
                </label>

                <label className="block">
                  <FieldLabel>CURRENT MOS</FieldLabel>
                  <input
                    list="srbp-mos-options"
                    type="text"
                    value={values.mos}
                    onChange={(event) => updateValue('mos', normalizeFourDigitCode(event.target.value))}
                    placeholder="0211"
                    className={inputClass}
                  />
                  <FieldHint>Use your current PMOS.</FieldHint>
                </label>

                <div className="block">
                  <FieldLabel>CURRENT ECC</FieldLabel>
                  <DatePickerField
                    value={values.ecc}
                    onChange={(v) => updateValue('ecc', v)}
                    placeholder="Select ECC"
                    minYear={2024}
                    maxYear={2028}
                  />
                  <FieldHint>Must fall in the FY27 SRBP window.</FieldHint>
                </div>
              </div>
            </div>

            {/* Section 02 — Contract Details */}
            <div className="border border-white/12 bg-black">
              <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-6 py-4">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
                  <span className="text-sm font-bold text-red-500">2</span>
                </div>
                <span className="text-sm font-bold tracking-widest text-gray-400">CONTRACT DETAILS</span>
              </div>
              <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
                <div className="block">
                  <FieldLabel>PLANNED REENLISTMENT DATE</FieldLabel>
                  <DatePickerField
                    value={values.reenlistDate}
                    onChange={(v) => updateValue('reenlistDate', v)}
                    placeholder="Select reenlistment date"
                    minYear={2026}
                    maxYear={2028}
                  />
                  <FieldHint>Must be on or after January 22, 2026.</FieldHint>
                </div>

                <label className="block">
                  <FieldLabel>REENLISTMENT LENGTH</FieldLabel>
                  <div className="relative">
                    <select
                      value={values.months}
                      onChange={(event) => updateValue('months', event.target.value)}
                      className="w-full appearance-none border border-white/16 bg-black px-4 py-3 pr-8 font-mono text-sm text-white focus:outline-none focus:border-red-500/50"
                    >
                      {SRBP_MONTH_OPTIONS.map((months) => (
                        <option key={months} value={String(months)}>{months} months</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                  </div>
                  <FieldHint>36 months minimum; 60+ required for most kickers.</FieldHint>
                </label>

                <label className="block">
                  <FieldLabel>LATERAL MOVE MOS</FieldLabel>
                  <input
                    list="srbp-mos-options"
                    type="text"
                    value={values.lateralMove}
                    onChange={(event) => updateValue('lateralMove', normalizeFourDigitCode(event.target.value))}
                    placeholder="Optional"
                    className={inputClass}
                  />
                  <FieldHint>Leave blank if staying in current MOS.</FieldHint>
                </label>

                <label className="block">
                  <FieldLabel>MCC</FieldLabel>
                  <input
                    type="text"
                    value={values.mcc}
                    onChange={(event) => updateValue('mcc', normalizeMcc(event.target.value))}
                    placeholder="1GT"
                    className={inputClass}
                  />
                  <FieldHint>Needed for FMF infantry and aircraft readiness kickers.</FieldHint>
                </label>

                <label className="block md:col-span-2">
                  <FieldLabel>TAX STATUS WHEN PAID</FieldLabel>
                  <div className="relative">
                    <select
                      value={values.taxFreeZone ? 'tax-free' : 'taxable'}
                      onChange={(event) => updateValue('taxFreeZone', event.target.value === 'tax-free')}
                      className="w-full appearance-none border border-white/16 bg-black px-4 py-3 pr-8 font-mono text-sm text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="taxable">Subject to federal income tax</option>
                      <option value="tax-free">Tax-free combat zone</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                  </div>
                </label>
              </div>
            </div>

            {/* Section 03 — NMOS accordion */}
            <div className="border border-white/12 bg-black">
              <button
                type="button"
                onClick={() => setNmosOpen((v) => !v)}
                className="flex w-full items-center justify-between bg-white/[0.04] px-6 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
                    <span className="text-sm font-bold text-red-500">3</span>
                  </div>
                  <span className="text-sm font-bold tracking-widest text-gray-400">NMOS QUALIFICATIONS</span>
                  {values.nmosSelections.length > 0 && (
                    <div className="flex h-5 min-w-[20px] items-center justify-center border border-red-600/50 bg-red-950/30 px-1 text-[10px] font-black text-red-400">
                      {values.nmosSelections.length}
                    </div>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${nmosOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {nmosOpen && (
                  <motion.div
                    key="nmos-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="border-t border-white/[0.06] px-6 py-3 text-[12px] leading-relaxed text-gray-500">
                      Select every qualifying NMOS you hold — feeds aircraft maintenance, readiness, and ATC kicker eligibility.
                    </p>
                    <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
                      {SRBP_NMOS_OPTIONS.map((option) => {
                        const checked = values.nmosSelections.includes(option.code);
                        return (
                          <button
                            key={option.code}
                            type="button"
                            onClick={() => toggleNmos(option.code)}
                            className={`flex items-start gap-3 border px-4 py-3 text-left transition-all ${
                              checked
                                ? 'border-red-600/60 bg-red-950/20 text-white'
                                : 'border-white/[0.08] bg-white/[0.015] text-gray-400 hover:border-white/20 hover:text-gray-200'
                            }`}
                          >
                            <div
                              className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 border transition-colors ${
                                checked ? 'border-red-500 bg-red-600' : 'border-white/20 bg-black'
                              }`}
                            />
                            <div>
                              <div className="text-xs font-black tracking-wider">{option.code}</div>
                              <div className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{option.label}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 border border-red-600 bg-red-600 px-6 py-4 text-sm font-black tracking-widest text-white transition-colors hover:bg-red-700"
              >
                <Target className="h-4 w-4" /> ESTIMATE BONUS
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 border border-white/12 bg-black px-6 py-4 text-sm font-bold tracking-widest text-gray-400 transition-colors hover:border-white/25 hover:text-white sm:flex-none"
              >
                <RefreshCw className="h-4 w-4" /> RESET
              </button>
            </div>
          </form>

          {/* Right — sticky panel (always rendered, dashes until calculated) */}
          <div className="xl:sticky xl:top-20 xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-y-auto">
            <div className="border border-white/12 bg-black">

              {/* Headline header */}
              <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
                  <span className="text-sm font-bold text-red-500">4</span>
                </div>
                <span className="text-sm font-bold tracking-widest text-gray-400">FY27 SRBP ESTIMATE</span>
              </div>

              {/* Headline body */}
              <div className="border-b border-white/10 px-5 py-5">
                <div className="flex items-baseline gap-3">
                  <div className={`text-[clamp(2.2rem,4vw,3rem)] font-black leading-none tracking-tighter ${result ? 'text-green-400' : 'text-white/20'}`}>
                    {result ? formatCurrency(result.bestKicker ? result.bestKicker.total : result.proratedBonus) : '—'}
                  </div>
                  {result && <span className="text-[10px] font-bold tracking-widest text-gray-600">PRE-TAX</span>}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {result
                    ? (result.bestKicker ? `${result.bestKicker.name} selected.` : 'Base estimate — no eligible kicker added.')
                    : 'Fill in the form and hit Estimate Bonus.'}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result
                    ? [`ZONE ${result.zone}`, result.effectiveMos, result.rank, `${result.months} MO`].map((tag) => (
                        <div key={tag} className="border border-white/12 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-300">{tag}</div>
                      ))
                    : ['ZONE —', '— MOS', '—', '— MO'].map((tag) => (
                        <div key={tag} className="border border-white/[0.06] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/20">{tag}</div>
                      ))
                  }
                </div>
              </div>

              {/* Base figures */}
              <div className="grid grid-cols-2 gap-0 border-b border-white/10">
                <div className="border-r border-white/10 px-5 py-4">
                  <div className="text-[11px] font-bold tracking-[0.2em] text-gray-500">BASE PMOS</div>
                  <div className={`mt-1.5 text-xl font-black ${result ? 'text-green-400' : 'text-white/20'}`}>
                    {result ? formatCurrency(result.proratedBonus) : '—'}
                  </div>
                  {result?.bestKicker && (
                    <div className="mt-1 text-[11px] font-bold text-green-400">
                      + {formatCurrency(result.bestKicker.amount)} kicker
                    </div>
                  )}
                </div>
                <div className={`px-5 py-4 transition-colors ${result ? 'bg-green-950/30' : ''}`}>
                  <div className={`text-[11px] font-bold tracking-[0.2em] ${result ? 'text-green-700' : 'text-gray-500'}`}>PAYOUT AFTER TAXES</div>
                  <div className={`mt-1.5 text-xl font-black leading-tight ${result ? 'text-green-400' : 'text-white/20'}`}>
                    {result
                      ? `~${formatCurrency(result.taxEstimate.highNet)} – ${formatCurrency(result.taxEstimate.lowNet)}`
                      : '—'}
                  </div>
                </div>
              </div>

              {/* Kicker options */}
              <div className="border-b border-white/10 px-5 py-4">
                <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-gray-500">KICKER OPTIONS</div>
                {result ? (
                  result.availableKickers.length > 0 ? (
                    <div className="space-y-2">
                      {result.availableKickers.map((kicker) => {
                        const isBest = result.bestKicker?.type === kicker.type;
                        return (
                          <div
                            key={kicker.type}
                            className={`border p-3 ${isBest ? 'border-red-600/50 bg-red-950/10' : 'border-white/10 bg-white/[0.02]'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="text-xs font-bold text-white">{kicker.name}</div>
                                  {isBest && (
                                    <div className="flex items-center gap-1 border border-red-600/40 bg-red-950/30 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-red-400">
                                      <Star className="h-2.5 w-2.5" /> BEST
                                    </div>
                                  )}
                                </div>
                                <div className="mt-1 text-[11px] leading-relaxed text-gray-500">{kicker.description}</div>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <div className="text-sm font-black text-green-400">+{formatCurrency(kicker.amount)}</div>
                                <div className="mt-0.5 text-[10px] text-gray-600">Total {formatCurrency(kicker.total)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed text-gray-500">No kickers unlocked. Try checking NMOS qualifications, adding a valid MCC, or adjusting contract length.</div>
                  )
                ) : (
                  <div className="text-xs text-white/20">—</div>
                )}
              </div>

              {/* Tax */}
              <div className="px-5 py-4">
                <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-gray-500">TAX DEDUCTED</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border border-white/10 px-3 py-2.5 text-xs">
                    <span className="text-gray-500">22% federal est.</span>
                    <span className={`font-bold ${result ? 'text-red-300' : 'text-white/20'}`}>
                      {result ? `~${formatCurrency(result.taxEstimate.lowTax)}` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border border-white/10 px-3 py-2.5 text-xs">
                    <span className="text-gray-500">24% federal est.</span>
                    <span className={`font-bold ${result ? 'text-red-300' : 'text-white/20'}`}>
                      {result ? `~${formatCurrency(result.taxEstimate.highTax)}` : '—'}
                    </span>
                  </div>
                </div>
                {result && <p className="mt-3 text-[10px] leading-relaxed text-gray-600">{result.taxEstimate.note}</p>}
              </div>

            </div>
          </div>
        </div>

        <datalist id="srbp-mos-options">
          {SRBP_MOS_OPTIONS.map((mos) => (
            <option key={mos} value={mos} />
          ))}
        </datalist>

        {/* ── Results ── */}
        <div className="relative mt-10">
          <AnimatePresence>
            {(resultState.status === 'error' || resultState.status === 'warning') && (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 border px-6 py-5 ${
                  resultState.status === 'error'
                    ? 'border-red-700/60 bg-red-950/20'
                    : 'border-amber-500/40 bg-amber-950/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Info
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                      resultState.status === 'error' ? 'text-red-400' : 'text-amber-300'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-bold tracking-wide text-white">
                      {resultState.status === 'error' ? 'Calculator issue' : 'Eligibility check'}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">{resultState.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detailed breakdown — only shown after calculation */}
          <AnimatePresence>
            {result && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-white/12 bg-black"
              >
                {/* Notes + Next steps */}
                <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="border-b border-white/10 bg-black p-6 md:border-b-0 md:border-r md:border-white/10">
                    <div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-gray-500">IMPORTANT NOTES</div>
                    <ul className="space-y-2.5 text-xs leading-relaxed text-gray-400">
                      <li>This is an estimate only. Final bonus determination is made by HQMC.</li>
                      <li>SRBP payments are made in the fiscal year of your ECC, not at reenlistment signing.</li>
                      <li>Lateral move bonuses are paid after successful completion of PMOS training.</li>
                      <li>Career SRB payments are capped at $360,000 lifetime.</li>
                      <li>Marines selected to First Sergeant are not eligible for PMOS bonuses.</li>
                      <li>Kickers require their full service commitment and are not prorated.</li>
                      <li>The BSSRB Program is suspended for FY27.</li>
                    </ul>
                  </div>
                  <div className="bg-black p-6">
                    <div className="mb-3 text-[12px] font-bold tracking-[0.2em] text-gray-500">NEXT STEPS</div>
                    <div className="space-y-3">
                      <a
                        href={SRBP_MARADMIN_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-between border border-white/12 px-4 py-3 text-left text-xs font-bold tracking-wide text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                      >
                        Official FY27 SRBP MARADMIN
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                      <button
                        onClick={() => navigate('/pay-benefits')}
                        className="w-full border border-white/12 px-4 py-3 text-left text-xs font-bold tracking-wide text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                      >
                        Return to Pay & Benefits
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FAQ ── */}
        <div className="relative mt-10 border border-white/12 bg-black">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
            <div className="flex h-6 w-6 items-center justify-center border border-white/35 text-sm font-bold text-red-500">5</div>
            <span className="text-sm font-bold tracking-widest text-gray-400">SRBP FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <div className="divide-y divide-white/8">
            {SRBP_FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className="text-sm font-bold text-gray-200">{item.q}</span>
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 text-red-500 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-gray-500">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
