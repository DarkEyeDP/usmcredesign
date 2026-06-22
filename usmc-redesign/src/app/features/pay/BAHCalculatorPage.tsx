import { useRef, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronRight,
  Info,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import {
  BAH_EFFECTIVE_DATE,
  BAH_LOCATIONS,
  BAH_PAY_GRADES,
  BAH_YEAR,
  BAH_ZIP_TO_MHA,
} from './bahData.generated';
import { BAHMap } from './BAHMap';
import type { MapMarker } from './BAHMap';
import { readStoredBahLookup, writeStoredBahLookup } from './bahLookupStorage';
import { STATE_SHAPES, stateCodeFromMha } from './stateShapes';

type BahLocation = (typeof BAH_LOCATIONS)[number];
type BahPayGrade = (typeof BAH_PAY_GRADES)[number];
type DependencyStatus = 'with' | 'without';
type GradeTab = 'enlisted' | 'warrant' | 'officer';

const GRADE_GROUPS: Record<GradeTab, BahPayGrade[]> = {
  enlisted: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'],
  warrant: ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'],
  officer: ['O-1E', 'O-2E', 'O-3E', 'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'],
};

function gradeTabForPayGrade(grade: BahPayGrade): GradeTab {
  if ((GRADE_GROUPS.warrant as string[]).includes(grade)) return 'warrant';
  if ((GRADE_GROUPS.officer as string[]).includes(grade)) return 'officer';
  return 'enlisted';
}

const payNavTabs = [
  { label: 'OVERVIEW', path: '/pay-benefits' },
  { label: 'PAY CHARTS', path: '/pay-benefits/basic-pay' },
  { label: 'BAH LOOKUP', path: '/pay-benefits/bah' },
  { label: 'BONUS TOOL', path: '/pay-benefits/bonuses' },
];

const marineComparisonMhas = [
  'NC178',
  'NC177',
  'CA024',
  'CA032',
  'CA038',
  'AZ016',
  'VA296',
  'VA298',
  'HI408',
  'SC258',
  'DC053',
];

const MHA_COORDINATES: Record<string, [number, number]> = {
  NC178: [34.703, -77.349],
  NC177: [34.908, -76.880],
  CA024: [33.381, -117.552],
  CA032: [34.136, -116.060],
  CA038: [32.715, -117.157],
  AZ016: [32.690, -114.628],
  VA296: [38.521, -77.302],
  VA298: [36.847, -76.292],
  HI408: [21.307, -157.858],
  SC258: [32.477, -80.723],
  DC053: [38.907, -77.037],
  CO045: [38.846, -104.820],
  TX277: [29.420, -98.490],
  CA033: [37.779, -122.419],
  WA033: [47.606, -122.332],
  GA001: [31.564, -84.027],
  FL030: [30.332, -81.656],
  FL056: [30.483, -86.525],
  FL057: [29.652, -82.325],
  FL058: [30.332, -81.656],
  FL059: [28.234, -80.610],
  FL061: [25.761, -80.192],
  FL062: [28.538, -81.379],
  FL063: [30.158, -85.660],
  FL064: [30.421, -87.216],
  FL065: [30.438, -84.281],
  FL066: [27.951, -82.457],
  FL067: [26.715, -80.053],
  FL068: [29.187, -82.140],
  FL069: [24.555, -81.780],
  FL070: [29.211, -81.023],
  FL423: [27.446, -80.325],
  FL424: [26.452, -81.948],
  NC170: [35.227, -80.843],
  OK001: [35.472, -97.520],
  VA368: [38.335, -77.036],
};

const STATE_MARKER_FALLBACKS: Record<string, [number, number]> = {
  AZ: [54, 56],
  CA: [45, 62],
  CO: [50, 50],
  DC: [50, 50],
  FL: [61, 73],
  GA: [52, 52],
  HI: [50, 50],
  NC: [58, 54],
  OK: [51, 49],
  SC: [52, 52],
  TX: [51, 58],
  VA: [56, 52],
  WA: [48, 45],
};

const MHA_STATE_MARKERS: Record<string, [number, number]> = {
  AZ016: [36, 77],
  CA024: [54, 72],
  CA032: [60, 60],
  CA038: [56, 80],
  CA033: [32, 41],
  CO045: [54, 62],
  DC053: [52, 48],
  FL030: [51, 35],
  GA001: [45, 65],
  HI408: [56, 55],
  NC170: [48, 58],
  NC177: [73, 58],
  NC178: [76, 62],
  OK001: [56, 45],
  SC258: [46, 72],
  TX277: [50, 64],
  VA296: [45, 55],
  VA298: [72, 74],
  VA368: [60, 55],
  WA033: [49, 70],
};

const gradeIndexByPayGrade = new Map<BahPayGrade, number>(
  BAH_PAY_GRADES.map((grade, index) => [grade, index]),
);
const locationByMha = new Map<string, BahLocation>(BAH_LOCATIONS.map((location) => [location.m, location]));
const zipToMha = BAH_ZIP_TO_MHA as Record<string, string>;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function normalizeQuery(value: string) {
  return value.trim().toUpperCase();
}

function getRate(location: BahLocation, payGrade: BahPayGrade, dependencyStatus: DependencyStatus) {
  const gradeIndex = gradeIndexByPayGrade.get(payGrade) ?? 0;
  return dependencyStatus === 'with' ? location.w[gradeIndex] : location.wo[gradeIndex];
}

function getLocationLabel(location: BahLocation) {
  return location.z ? `${location.n} (${location.z})` : location.n;
}

function getStateMarkerPosition(mha: string, stateCode: string) {
  return MHA_STATE_MARKERS[mha] ?? STATE_MARKER_FALLBACKS[stateCode] ?? [50, 50];
}

function getViewBoxSize(viewBox: string) {
  const [, , width = 100, height = 100] = viewBox.split(/\s+/).map(Number);
  return { width, height };
}

function projectMercatorPoint(lat: number, lng: number, projection: { scale: number; translate: [number, number] }) {
  const lambda = (lng * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;

  return {
    x: projection.scale * lambda + projection.translate[0],
    y: projection.scale * -Math.log(Math.tan(Math.PI / 4 + phi / 2)) + projection.translate[1],
  };
}

function getSearchResults(query: string) {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return BAH_LOCATIONS.slice(0, 8);
  }

  const exactZipMha = /^\d{5}$/.test(normalized) ? zipToMha[normalized] : undefined;
  const exactZipLocation = exactZipMha ? locationByMha.get(exactZipMha) : undefined;

  // Split into words so "camp lejeune nc" and "san diego ca" all match naturally
  const words = normalized.split(/\s+/).filter(Boolean);

  const matches = BAH_LOCATIONS.filter((location) => {
    const haystack = `${location.m} ${location.n} ${location.z}`.toUpperCase();
    return words.every((word) => haystack.includes(word));
  });

  // Rank: name starts with the full query first, then any match
  matches.sort((a, b) => {
    const aStarts = a.n.toUpperCase().startsWith(normalized) ? 0 : 1;
    const bStarts = b.n.toUpperCase().startsWith(normalized) ? 0 : 1;
    return aStarts - bStarts;
  });

  if (!exactZipLocation) {
    return matches.slice(0, 8);
  }

  return [exactZipLocation, ...matches.filter((l) => l.m !== exactZipLocation.m)].slice(0, 8);
}

function applyLookup(query: string, fallbackMha: string) {
  const normalized = normalizeQuery(query);
  const exactZipMha = /^\d{5}$/.test(normalized) ? zipToMha[normalized] : undefined;
  if (exactZipMha && locationByMha.has(exactZipMha)) {
    return exactZipMha;
  }

  return getSearchResults(query)[0]?.m ?? fallbackMha;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-[11px] font-bold tracking-[0.2em] text-gray-500">{children}</span>
  );
}

type BreakdownMode = 'rent' | 'purchase';

const RENT_SLICES = [
  { label: 'Rent', pct: 0.82, color: '#4ade80', legendColor: 'bg-green-400' },
  { label: 'Utilities', pct: 0.15, color: '#f59e0b', legendColor: 'bg-amber-400' },
  { label: "Renter's Insurance", pct: 0.03, color: '#a855f7', legendColor: 'bg-purple-400' },
];

const PURCHASE_SLICES = [
  { label: 'Principal & Interest', pct: 0.64, color: '#4ade80', legendColor: 'bg-green-400' },
  { label: 'Property Taxes', pct: 0.15, color: '#f59e0b', legendColor: 'bg-amber-400' },
  { label: 'Utilities', pct: 0.13, color: '#60a5fa', legendColor: 'bg-blue-400' },
  { label: "Homeowner's Insurance", pct: 0.05, color: '#a855f7', legendColor: 'bg-purple-400' },
  { label: 'HOA / Reserve Fund', pct: 0.03, color: '#f97316', legendColor: 'bg-orange-400' },
];

function DonutChart({ rate, mode }: { rate: number; mode: BreakdownMode }) {
  const slices = mode === 'rent' ? RENT_SLICES : PURCHASE_SLICES;
  const segments = slices.map((s) => ({ ...s, amount: Math.round(rate * s.pct) }));
  const conicStops = segments.reduce<string[]>((acc, s, i) => {
    const start = segments.slice(0, i).reduce((sum, seg) => sum + seg.pct * 100, 0);
    const end = start + s.pct * 100;
    acc.push(`${s.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`);
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="flex-shrink-0">
        <div
          className="relative h-40 w-40"
          style={{ borderRadius: '50%', background: `conic-gradient(${conicStops.join(', ')})` }}
        >
          <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-black">
            <div className="text-lg font-black leading-none text-white">{formatCurrency(rate)}</div>
            <div className="mt-1 text-[10px] tracking-widest text-gray-600">MONTHLY</div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${s.legendColor}`} />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
            <span className="font-mono text-xs font-bold text-white">{formatCurrency(s.amount)}</span>
          </div>
        ))}
        <p className="pt-1 text-[11px] leading-relaxed text-gray-600">
          {mode === 'rent'
            ? 'Estimated allocation based on typical rental costs. Figures reflect a budget structured to keep total housing expenses within your BAH rate.'
            : 'Estimated allocation based on typical homeownership costs. Figures reflect a budget structured to keep total housing expenses within your BAH rate. Actual mortgage terms vary.'}
        </p>
      </div>
    </div>
  );
}

export function BAHCalculatorPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState(() => readStoredBahLookup().query);
  const [selectedMha, setSelectedMha] = useState(() => readStoredBahLookup().selectedMha);
  const [payGrade, setPayGrade] = useState<BahPayGrade>(() => readStoredBahLookup().payGrade);
  const [dependencyStatus, setDependencyStatus] = useState<DependencyStatus>(() => readStoredBahLookup().dependencyStatus);
  const [compareSearch, setCompareSearch] = useState('');
  const [compareMhas, setCompareMhas] = useState<string[]>(() => readStoredBahLookup().compareMhas);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCompareFocused, setIsCompareFocused] = useState(false);
  const [dynamicCoords, setDynamicCoords] = useState<Record<string, [number, number]>>({});
  const [locationHistory, setLocationHistory] = useState<string[]>(() => readStoredBahLookup().locationHistory);
  const [mapPanelTab, setMapPanelTab] = useState<'history' | 'installations'>('installations');
  const [gradeTab, setGradeTab] = useState<GradeTab>(() => gradeTabForPayGrade(readStoredBahLookup().payGrade));
  const [currentMha, setCurrentMha] = useState<string | null>(() => readStoredBahLookup().currentMha);
  const [currentSearch, setCurrentSearch] = useState(() => readStoredBahLookup().currentSearch);
  const [isCurrentSearchFocused, setIsCurrentSearchFocused] = useState(false);
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('rent');
  const searchRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const currentSearchRef = useRef<HTMLDivElement>(null);

  // Keep grade tab in sync when pay grade changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGradeTab(gradeTabForPayGrade(payGrade));
  }, [payGrade]);

  // Persist user inputs to localStorage
  useEffect(() => {
    writeStoredBahLookup({ query, selectedMha, payGrade, dependencyStatus, compareMhas, locationHistory, currentMha, currentSearch });
  }, [query, selectedMha, payGrade, dependencyStatus, compareMhas, locationHistory, currentMha, currentSearch]);

  // Geocode any history location not in the hardcoded table.
  // Requests are staggered 350 ms apart to stay within Nominatim's rate limit.
  useEffect(() => {
    const allMhas = [...new Set([selectedMha, ...(currentMha ? [currentMha] : []), ...locationHistory])];
    const toFetch = allMhas.filter(
      (mha) => !MHA_COORDINATES[mha] && !dynamicCoords[mha] && locationByMha.has(mha),
    );
    const timers: ReturnType<typeof setTimeout>[] = [];
    toFetch.forEach((mha, i) => {
      const location = locationByMha.get(mha)!;
      // Use only the first part of slash-separated names so Nominatim can resolve them
      const placeName = location.n.split('/')[0].trim();
      const q = encodeURIComponent(placeName + ' USA');
      timers.push(
        setTimeout(() => {
          fetch(
            `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=us&format=json&limit=1`,
            { headers: { 'User-Agent': 'StayMarine-BAHCalculator/1.0' } },
          )
            .then((r) => r.json())
            .then((data) => {
              if (data[0]) {
                setDynamicCoords((prev) => ({
                  ...prev,
                  [mha]: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
                }));
              }
            })
            .catch(() => {});
        }, i * 350),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [selectedMha, currentMha, locationHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFutureLocation = query.trim().length > 0;
  const displayMha = hasFutureLocation ? selectedMha : currentMha ?? selectedMha;
  const displayLocation = locationByMha.get(displayMha) ?? BAH_LOCATIONS[0];
  const displayRate = getRate(displayLocation, payGrade, dependencyStatus);
  const oppositeRate = getRate(displayLocation, payGrade, dependencyStatus === 'with' ? 'without' : 'with');
  const dependentDelta = getRate(displayLocation, payGrade, 'with') - getRate(displayLocation, payGrade, 'without');
  const searchResults = useMemo(() => getSearchResults(query), [query]);
  const compareSearchResults = useMemo(() => getSearchResults(compareSearch), [compareSearch]);
  const currentSearchResults = useMemo(() => getSearchResults(currentSearch), [currentSearch]);
  const currentLocation = currentMha ? locationByMha.get(currentMha) : null;
  const currentRate = currentLocation ? getRate(currentLocation, payGrade, dependencyStatus) : null;
  const locationDelta = hasFutureLocation && currentRate !== null ? displayRate - currentRate : null;

  const compareRows = [...new Set([displayMha, ...compareMhas, ...marineComparisonMhas])]
    .map((mha) => locationByMha.get(mha))
    .filter((location): location is BahLocation => Boolean(location))
    .map((location) => ({
      location,
      rate: getRate(location, payGrade, dependencyStatus),
    }))
    .slice(0, 8);

  const mapMarkers = useMemo((): MapMarker[] => {
    const mhas = [...new Set([selectedMha, ...(currentMha ? [currentMha] : []), ...locationHistory, ...marineComparisonMhas])];
    return mhas
      .map((mha) => {
        const location = locationByMha.get(mha);
        if (!location) return null;
        const coords = MHA_COORDINATES[mha] ?? dynamicCoords[mha];
        if (!coords) return null;
        const [lat, lng] = coords;
        return {
          mha,
          name: getLocationLabel(location),
          lat,
          lng,
          rate: getRate(location, payGrade, dependencyStatus),
          isSelected: mha === displayMha,
          isCurrentLocation: mha === currentMha,
        };
      })
      .filter((m): m is MapMarker => m !== null);
  }, [displayMha, selectedMha, currentMha, locationHistory, dynamicCoords, payGrade, dependencyStatus]);

  const mapMinRate = Math.min(...mapMarkers.map((m) => m.rate));
  const mapMaxRate = Math.max(...mapMarkers.map((m) => m.rate));

  function pushHistory(mha: string) {
    if (marineComparisonMhas.includes(mha)) return;
    setLocationHistory((prev) => [mha, ...prev.filter((m) => m !== mha)].slice(0, 10));
  }

  function handleLookup() {
    const nextMha = applyLookup(query, selectedMha);
    setSelectedMha(nextMha);
    pushHistory(nextMha);
    setCompareMhas((current) => [nextMha, ...current.filter((mha) => mha !== nextMha)].slice(0, 6));
    setIsSearchFocused(false);
  }

  function addComparison(mha: string) {
    setCompareMhas((current) => [mha, ...current.filter((item) => item !== mha)].slice(0, 7));
    setCompareSearch('');
    setIsCompareFocused(false);
  }

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-black pb-5 md:pb-0">
      <SEOHead
        title="2026 BAH Calculator | Marine Corps Housing Allowance Lookup"
        description="Look up 2026 Basic Allowance for Housing (BAH) rates for Marine Corps duty stations. Search by ZIP code, base name, or MHA code. Compare PCS locations by pay grade and dependency status."
        keywords="BAH calculator, Basic Allowance for Housing 2026, Marine Corps BAH, USMC BAH rates, military housing allowance, BAH by zip code, BAH by duty station, PCS BAH comparison, BAH pay grade, Marine Corps pay"
        path="/pay-benefits/bah"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: '2026 Marine Corps BAH Calculator',
            url: 'https://stay-marine.com/pay-benefits/bah',
            description: 'Look up 2026 Basic Allowance for Housing rates for Marine Corps installations by ZIP code, duty station, pay grade, and dependency status.',
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
              { '@type': 'ListItem', position: 3, name: 'BAH Calculator', item: 'https://stay-marine.com/pay-benefits/bah' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is BAH?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Basic Allowance for Housing (BAH) is a monthly allowance paid to U.S. military members to offset the cost of housing when government quarters are not provided. It is based on pay grade, dependency status, and the duty station location.',
                },
              },
              {
                '@type': 'Question',
                name: 'How is BAH calculated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'BAH is determined by pay grade, dependency status (with or without dependents), and the Military Housing Area (MHA) of the duty station. Rates are set annually by the Department of Defense effective January 1.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is BAH taxable?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No. BAH is a non-taxable housing allowance and is not included in gross income for federal income tax purposes.',
                },
              },
              {
                '@type': 'Question',
                name: 'When do BAH rates change?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'BAH rates are updated annually and take effect on January 1 each year. The 2026 rates became effective January 1, 2026.',
                },
              },
            ],
          },
        ]}
      />

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

        <div className="relative z-10 flex flex-col" style={{ minHeight: '240px' }}>
          <div className="absolute right-8 top-5 hidden border border-white/10 bg-black/50 px-5 py-4 text-right lg:block">
            <div className="text-xs font-black tracking-widest text-white">{BAH_YEAR} BAH RATES</div>
            <div className="my-2 ml-auto h-0.5 w-8 bg-red-600" />
            <div className="text-[11px] tracking-[0.2em] text-gray-500">ZIP TO MHA</div>
            <div className="text-[11px] tracking-[0.2em] text-gray-500">LOCAL LOOKUP</div>
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
              <span className="text-red-500">BAH LOOKUP</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
                className="page-hero-title mb-3"
              >
                BAH<br />CALCULATOR<span className="text-red-600">.</span>
              </motion.h1>
            </div>
            <p className="mb-4 max-w-2xl text-[14px] leading-relaxed text-gray-400">
              Look up Basic Allowance for Housing by ZIP code, duty station, pay grade, and dependency status. Compare Marine Corps locations using the official {BAH_YEAR} rate set.
            </p>
          </div>

        </div>
      </div>

      {/* Sticky pay-section tab bar */}
      <div className="sticky top-20 z-30 isolate border-b border-white/10 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center overflow-x-auto px-4 sm:px-8">
          {payNavTabs.map(({ label, path }) => {
            const active = path === '/pay-benefits/bah';
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`relative whitespace-nowrap px-5 py-3 text-[12px] font-bold tracking-widest transition-colors ${
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

      <div className="relative px-4 py-8 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative space-y-6">
          {/* ── Section 1: SELECT YOUR CRITERIA ── */}
          <div className="border border-white/12 bg-black">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-6 py-4">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
                <span className="text-sm font-bold text-red-500">1</span>
              </div>
              <span className="text-sm font-bold tracking-widest text-gray-400">SELECT YOUR CRITERIA</span>
            </div>

            <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.55fr_0.75fr]">
              {/* 1. Current duty station */}
              <div ref={currentSearchRef} className="relative">
                <FieldLabel>
                  CURRENT DUTY STATION{' '}
                  <span className="ml-1.5 border border-white/10 px-1 py-0.5 text-[9px] font-bold tracking-wider text-gray-700">OPTIONAL</span>
                </FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    value={currentSearch}
                    onChange={(e) => setCurrentSearch(e.target.value)}
                    onFocus={() => setIsCurrentSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsCurrentSearchFocused(false), 150)}
                    placeholder="Search base, city, or ZIP"
                    className="h-12 w-full border border-white/12 bg-black pl-10 pr-10 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-white/30"
                  />
                  {currentMha && (
                    <button
                      type="button"
                      onClick={() => { setCurrentMha(null); setCurrentSearch(''); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-gray-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {isCurrentSearchFocused && currentSearchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full z-20 mt-1 border border-white/12 bg-[#09090c] shadow-xl"
                    >
                      {currentSearchResults.slice(0, 5).map((location) => (
                        <button
                          key={location.m}
                          type="button"
                          onMouseDown={() => {
                            setCurrentMha(location.m);
                            setCurrentSearch(location.z || location.n);
                            setIsCurrentSearchFocused(false);
                          }}
                          className="flex w-full items-center justify-between border-b border-white/8 px-4 py-2.5 text-left text-xs text-gray-400 transition-colors last:border-0 hover:bg-white/[0.04] hover:text-gray-200"
                        >
                          <span>{getLocationLabel(location)}</span>
                          <span className="font-mono text-[10px] text-gray-700">{location.m}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Future / destination duty station */}
              <div ref={searchRef} className="relative">
                <FieldLabel>FUTURE DUTY STATION</FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
                    placeholder="Search base, city, MHA, or ZIP"
                    className="h-12 w-full border border-white/12 bg-black pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-red-500/70"
                  />
                </div>
                <AnimatePresence>
                  {isSearchFocused && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full z-20 mt-1 border border-white/12 bg-[#09090c] shadow-xl"
                    >
                      {searchResults.slice(0, 5).map((location) => (
                        <button
                          key={location.m}
                          type="button"
                          onMouseDown={() => {
                            setSelectedMha(location.m);
                            pushHistory(location.m);
                            setQuery(location.z || location.n);
                            setIsSearchFocused(false);
                          }}
                          className="flex w-full items-center justify-between border-b border-white/8 px-4 py-2.5 text-left text-xs text-gray-400 transition-colors last:border-0 hover:bg-white/[0.04] hover:text-gray-200"
                        >
                          <span>{getLocationLabel(location)}</span>
                          <span className="font-mono text-[10px] text-gray-700">{location.m}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Pay grade */}
              <label className="block">
                <FieldLabel>PAY GRADE</FieldLabel>
                <select
                  value={payGrade}
                  onChange={(event) => setPayGrade(event.target.value as BahPayGrade)}
                  className="h-12 w-full border border-white/12 bg-black px-4 text-sm text-white outline-none transition-colors focus:border-red-500/70"
                >
                  {BAH_PAY_GRADES.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </label>

              {/* 4. Dependency status */}
              <label className="block">
                <FieldLabel>DEPENDENCY STATUS</FieldLabel>
                <select
                  value={dependencyStatus}
                  onChange={(event) => setDependencyStatus(event.target.value as DependencyStatus)}
                  className="h-12 w-full border border-white/12 bg-black px-4 text-sm text-white outline-none transition-colors focus:border-red-500/70"
                >
                  <option value="with">With Dependents</option>
                  <option value="without">Without Dependents</option>
                </select>
              </label>
            </div>

            <div className="border-t border-white/10 px-6 py-3 text-xs text-gray-600">
              Rates effective: <span className="font-bold text-gray-400">{BAH_EFFECTIVE_DATE}</span>
            </div>
          </div>

          {/* ── Section 2: COMPLETE BAH BREAKDOWN ── */}
          <section className="border border-white/12 bg-black">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center border border-white/35 text-sm font-bold text-red-500">2</div>
                <span className="text-sm font-bold tracking-widest text-gray-400">COMPLETE BAH BREAKDOWN</span>
              </div>
              <span className="text-[11px] font-bold tracking-widest text-red-500">{displayLocation.m}</span>
            </div>

            {/* Top row: rate + donut */}
            <div className="grid grid-cols-1 gap-0 border-b border-white/10 lg:grid-cols-2">
              {/* Left: rate + location */}
              <div className="relative flex flex-col justify-center overflow-hidden p-6 lg:border-r lg:border-white/10">
                {/* State shape watermark */}
                {(() => {
                  const code = stateCodeFromMha(displayMha);
                  const shape = code ? STATE_SHAPES[code] : null;
                  if (!code || !shape) {
                    return null;
                  }

                  const { width, height } = getViewBoxSize(shape.viewBox);
                  const selectedCoords = MHA_COORDINATES[displayMha] ?? dynamicCoords[displayMha];
                  const projectedMarker = selectedCoords
                    ? projectMercatorPoint(selectedCoords[0], selectedCoords[1], shape.projection)
                    : null;
                  const [xPct, yPct] = getStateMarkerPosition(displayMha, code);
                  const markerX = projectedMarker?.x ?? (xPct / 100) * width;
                  const markerY = projectedMarker?.y ?? (yPct / 100) * height;

                  return shape ? (
                    <div
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ height: '78%', width: '52%' }}
                      aria-hidden="true"
                    >
                      <svg
                        viewBox={shape.viewBox}
                        preserveAspectRatio="xMidYMid meet"
                        className="h-full w-full overflow-visible"
                      >
                        <path d={shape.d} fill="white" opacity="0.08" />
                        <g
                          transform={`translate(${markerX} ${markerY}) scale(2.4) translate(-12 -21)`}
                          style={{ filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.55))' }}
                        >
                          <path
                            d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                          <circle
                            cx="12"
                            cy="10"
                            r="3"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </g>
                      </svg>
                    </div>
                  ) : null;
                })()}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${displayRate}-${payGrade}-${dependencyStatus}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="mb-2 flex items-end gap-2"
                  >
                    <span className="text-[clamp(2.2rem,4vw,3rem)] font-black leading-none tracking-tighter text-green-400">{formatCurrency(displayRate)}</span>
                    <span className="pb-2 text-lg font-bold text-green-500">/mo</span>
                  </motion.div>
                </AnimatePresence>
                <div className="mb-1 text-sm font-bold tracking-wide text-white">
                  {payGrade} | {dependencyStatus === 'with' ? 'With Dependents' : 'Without Dependents'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {getLocationLabel(displayLocation)}
                </div>
              </div>

              {/* Right: donut chart */}
              <div className="flex flex-col">
                <div className="flex border-b border-white/10">
                  {(['rent', 'purchase'] as BreakdownMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBreakdownMode(m)}
                      className={`relative flex-1 py-2.5 text-[10px] font-bold tracking-widest transition-colors ${breakdownMode === m ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      {m === 'rent' ? 'RENTING' : 'PURCHASING'}
                      {breakdownMode === m && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  <DonutChart rate={displayRate} mode={breakdownMode} />
                </div>
              </div>
            </div>

            {/* PCS BAH change — full width, only when active */}
            {locationDelta !== null && currentLocation && currentLocation.m !== displayLocation.m && (
              <div className="border-b border-white/10 px-6 py-5">
                <div className="mb-3 text-[10px] font-bold tracking-widest text-blue-400/70">PCS BAH CHANGE</div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-widest text-gray-600">CURRENT</div>
                    <div className="text-xl font-black text-gray-400">{formatCurrency(currentRate!)}</div>
                    <div className="truncate text-[10px] text-gray-700">{currentLocation.n}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-600" />
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-widest text-gray-600">FUTURE</div>
                    <div className="text-xl font-black text-green-400">{formatCurrency(displayRate)}</div>
                    <div className="truncate text-[10px] text-gray-700">{displayLocation.n}</div>
                  </div>
                  <div className="flex-shrink-0 border-l border-white/10 pl-6">
                    <div className="text-[10px] tracking-widest text-gray-600">DIFFERENCE</div>
                    <div className={`text-2xl font-black ${locationDelta > 0 ? 'text-green-400' : locationDelta < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {locationDelta > 0 ? '+' : ''}{formatCurrency(locationDelta)}
                    </div>
                    <div className="text-[10px] text-gray-600">/mo</div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom row: dependency difference + how BAH works */}
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:border-white/10">
                <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-gray-500">DEPENDENCY DIFFERENCE</div>
                <div className="mb-1 text-xl font-black text-white">{formatCurrency(Math.abs(dependentDelta))}</div>
                <p className="text-xs leading-relaxed text-gray-500">
                  {dependencyStatus === 'with' ? 'Without dependents' : 'With dependents'} for this same grade and area is {formatCurrency(oppositeRate)} per month.
                </p>
              </div>
              <div className="p-6">
                <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-gray-500">HOW BAH WORKS</div>
                <p className="mb-4 text-xs leading-relaxed text-gray-500">
                  BAH is based on your pay grade, dependency status, and the cost of housing in your duty station area. It is not taxable income.
                </p>
                <div className="flex items-start gap-2 border border-white/8 bg-white/[0.02] p-3">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-600" />
                  <p className="text-[11px] leading-relaxed text-gray-600">
                    Estimates based on average costs in the {displayLocation.z || displayLocation.n} area. Actual spending varies by household.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Row 2: BAH BY LOCATION full width ── */}
          <section className="min-w-0 border border-white/12 bg-black">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex h-6 w-6 items-center justify-center border border-white/35 text-sm font-bold text-red-500">3</div>
              <span className="text-sm font-bold tracking-widest text-gray-400">BAH BY LOCATION</span>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-0 lg:grid-cols-[1fr_260px]">
              <div className="min-w-0 lg:border-r lg:border-white/10">
                <BAHMap
                  markers={mapMarkers}
                  minRate={mapMinRate}
                  maxRate={mapMaxRate}
                  onSelect={(mha) => {
                    const loc = locationByMha.get(mha);
                    if (loc) {
                      setSelectedMha(mha);
                      pushHistory(mha);
                      setQuery(loc.z || loc.n);
                    }
                  }}
                />
              </div>
              <div className="flex min-w-0 flex-col" style={{ height: '480px' }}>
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  {(['history', 'installations'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setMapPanelTab(tab)}
                      className={`relative flex-1 py-3 text-[10px] font-bold tracking-widest transition-colors ${
                        mapPanelTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {tab === 'history' ? 'HISTORY' : 'INSTALLATIONS'}
                      {mapPanelTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* History tab */}
                {mapPanelTab === 'history' && (
                  locationHistory.length === 0 ? (
                    <div className="flex flex-1 min-h-0 items-center justify-center px-4 py-8 text-center">
                      <p className="text-xs leading-relaxed text-gray-700">
                        Search for a location or tap a custom dot on the map to build your history.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      {locationHistory.map((mha, index) => {
                        const loc = locationByMha.get(mha);
                        if (!loc) return null;
                        const rate = getRate(loc, payGrade, dependencyStatus);
                        const isActive = mha === displayMha;
                        return (
                          <button
                            key={mha}
                            type="button"
                            onClick={() => {
                              setSelectedMha(mha);
                              setQuery(loc.z || loc.n);
                            }}
                            className={`grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-2 border-b border-white/8 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.04] ${isActive ? 'bg-white/[0.03]' : ''}`}
                          >
                            <span className="text-[11px] font-bold text-gray-600">{index + 1}</span>
                            <div className="min-w-0">
                              <div className={`truncate text-xs font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                {loc.n}
                              </div>
                              <div className="text-[10px] font-mono text-gray-600">{mha}</div>
                            </div>
                            <span className={`text-xs font-black ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                              {formatCurrency(rate)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Installations tab */}
                {mapPanelTab === 'installations' && (
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {marineComparisonMhas.map((mha) => {
                      const loc = locationByMha.get(mha);
                      if (!loc) return null;
                      const rate = getRate(loc, payGrade, dependencyStatus);
                      const isActive = mha === displayMha;
                      return (
                        <button
                          key={mha}
                          type="button"
                          onClick={() => {
                            setSelectedMha(mha);
                            setQuery(loc.z || loc.n);
                          }}
                          className={`grid w-full grid-cols-[1fr_auto] items-center gap-2 border-b border-white/8 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.04] ${isActive ? 'bg-white/[0.03]' : ''}`}
                        >
                          <div className="min-w-0">
                            <div className={`truncate text-xs font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                              {loc.n}
                            </div>
                            <div className="text-[10px] font-mono text-gray-600">{mha}</div>
                          </div>
                          <span className={`text-xs font-black ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                            {formatCurrency(rate)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Row 3: COMPARE LOCATIONS full width ── */}
          <section className="min-w-0 border border-white/12 bg-black">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex h-6 w-6 items-center justify-center border border-white/35 text-sm font-bold text-red-500">4</div>
              <span className="text-sm font-bold tracking-widest text-gray-400">COMPARE LOCATIONS</span>
              <span className="ml-auto text-[11px] tracking-widest text-gray-600">
                {payGrade} · {dependencyStatus === 'with' ? 'W/ DEPENDENTS' : 'W/O DEPENDENTS'}
              </span>
            </div>
            <div className="p-5">
              <div className="mb-4" ref={compareRef}>
                <FieldLabel>ADD A LOCATION</FieldLabel>
                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    value={compareSearch}
                    onChange={(event) => setCompareSearch(event.target.value)}
                    onFocus={() => setIsCompareFocused(true)}
                    onBlur={() => setTimeout(() => setIsCompareFocused(false), 150)}
                    placeholder="Search another ZIP, city, or MHA"
                    className="h-11 w-full border border-white/12 bg-black pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-red-500/70"
                  />
                  <AnimatePresence>
                    {isCompareFocused && compareSearch && compareSearchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-20 mt-1 border border-white/12 bg-[#09090c] shadow-xl"
                      >
                        {compareSearchResults.slice(0, 4).map((location) => (
                          <button
                            key={location.m}
                            type="button"
                            onMouseDown={() => addComparison(location.m)}
                            className="flex w-full items-center justify-between border-b border-white/8 px-4 py-2.5 text-left text-xs text-gray-400 transition-colors last:border-0 hover:bg-white/[0.04] hover:text-gray-200"
                          >
                            <span>{getLocationLabel(location)}</span>
                            <span className="font-mono text-[10px] text-gray-700">{location.m}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-bold tracking-widest text-gray-600">
                      <th className="py-2 pr-4">LOCATION</th>
                      <th className="py-2 pr-4">BAH RATE</th>
                      <th className="py-2 text-right">VS SELECTED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map(({ location, rate }) => {
                      const delta = rate - displayRate;
                      const isSelected = location.m === displayLocation.m;
                      return (
                        <tr
                          key={location.m}
                          className={`border-b border-white/8 transition-colors last:border-0 hover:bg-white/[0.04] ${
                            isSelected ? 'bg-red-950/20 shadow-[inset_3px_0_0_rgba(239,68,68,0.9)]' : ''
                          }`}
                        >
                          <td className="py-3 pl-3 pr-4 text-sm text-gray-300">
                            <span className={isSelected ? 'text-white' : ''}>{location.n}</span>
                            <span className="ml-2 font-mono text-[10px] text-gray-700">{location.m}</span>
                          </td>
                          <td className="py-3 pr-4 text-sm font-bold text-white">
                            {formatCurrency(rate)} <span className="text-xs text-gray-600">/mo</span>
                          </td>
                          <td className="py-3 text-right">
                            {isSelected ? (
                              <span className="text-xs font-bold tracking-widest text-gray-600">SELECTED</span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-sm font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {formatCurrency(Math.abs(delta))} <span className="text-xs opacity-70">/mo</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── Row 4: ALL-GRADES RATE TABLE full width ── */}
          <section className="min-w-0 border border-white/12 bg-black">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex h-6 w-6 items-center justify-center border border-white/35 text-sm font-bold text-red-500">5</div>
              <div>
                <span className="text-sm font-bold tracking-widest text-gray-400">ALL PAY GRADES</span>
                <span className="ml-3 text-[11px] tracking-widest text-gray-600">
                  BAH AT {displayLocation.n.toUpperCase()}
                </span>
              </div>
            </div>
            {/* Grade tabs */}
            <div className="flex border-b border-white/10">
              {(['enlisted', 'warrant', 'officer'] as GradeTab[]).map((tab) => {
                const labels: Record<GradeTab, string> = { enlisted: 'ENLISTED', warrant: 'WARRANT', officer: 'OFFICER' };
                const ranges: Record<GradeTab, string> = { enlisted: 'E-1 – E-9', warrant: 'W-1 – W-5', officer: 'O-1 – O-10' };
                const active = gradeTab === tab;
                const hasSelected = GRADE_GROUPS[tab].includes(payGrade);
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setGradeTab(tab)}
                    className={`relative flex flex-col items-start px-5 py-3 transition-colors ${active ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    <span className="text-[11px] font-bold tracking-widest">
                      {labels[tab]}
                      {hasSelected && <span className="ml-2 text-[9px] font-bold tracking-wider text-red-500">YOU</span>}
                    </span>
                    <span className="text-[10px] text-gray-600">{ranges[tab]}</span>
                    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
                  </button>
                );
              })}
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-bold tracking-widest text-gray-600">
                      <th className="sticky left-0 bg-black py-2 pr-4">GRADE</th>
                      <th className="py-2 pr-4">WITH DEPENDENTS</th>
                      <th className="py-2 pr-4">WITHOUT DEPENDENTS</th>
                      <th className="py-2 text-right">DIFFERENCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GRADE_GROUPS[gradeTab].map((grade) => {
                      const index = BAH_PAY_GRADES.indexOf(grade);
                      const withRate = displayLocation.w[index];
                      const withoutRate = displayLocation.wo[index];
                      const isYou = grade === payGrade;
                      return (
                        <tr
                          key={grade}
                          className={`group border-b border-white/8 transition-colors last:border-0 hover:bg-white/[0.04] ${isYou ? 'bg-red-950/20' : ''}`}
                        >
                          <td className={`sticky left-0 py-2.5 pr-4 text-sm font-bold text-white transition-colors group-hover:bg-white/[0.04] ${isYou ? 'bg-red-950/20' : 'bg-black'}`}>
                            {grade}
                            {isYou && (
                              <span className="ml-2 text-[10px] font-bold tracking-wider text-red-500">YOU</span>
                            )}
                          </td>
                          <td className={`py-2.5 pr-4 text-sm ${isYou ? 'font-bold text-green-400' : 'text-gray-300'}`}>
                            {formatCurrency(withRate)}
                          </td>
                          <td className={`py-2.5 pr-4 text-sm ${isYou ? 'font-bold text-green-400' : 'text-gray-300'}`}>
                            {formatCurrency(withoutRate)}
                          </td>
                          <td className="py-2.5 text-right text-sm font-bold text-green-400">
                            {formatCurrency(withRate - withoutRate)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
