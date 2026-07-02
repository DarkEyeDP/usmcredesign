import { useState, useRef } from 'react';
import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  CaretRight, CaretLeft, Pencil, Plus,
  Minus, Calendar, Crosshair, ArrowsOut, ArrowsIn,
  X, Flag, MapPin, BookOpen, Heart, Users, CurrencyDollar, ArrowRight, Medal,
  FloppyDisk, Trash, Clock,
} from '@phosphor-icons/react';
import { SEOHead } from '@/app/components/SEOHead';
import { TimelineGrid, type TimelineGridHandle } from './components/timeline';
import { ScenarioPlanner } from './components/ScenarioPlanner';
import { EditProfileModal } from './components/EditProfileModal';
import { AddPromotionModal } from './components/AddPromotionModal';
import { AddMilestoneModal } from './components/AddMilestoneModal';
import { AddDutyStationModal } from './components/AddDutyStationModal';
import { AddEducationModal } from './components/AddEducationModal';
import { AddSpouseModal } from './components/AddSpouseModal';
import { AddChildModal } from './components/AddChildModal';
import { AddFinancialGoalModal } from './components/AddFinancialGoalModal';
import { scenarios } from './mockData';
import { useCareerData } from './hooks/useCareerData';
import { useModalState } from './hooks/useModalState';
import type { SavedTimeline, TimelineData } from './types';
import { deleteSavedTimeline, readSavedTimelines, saveTimelineSnapshot } from './careerProfileStorage';
import { RankInsignia } from '@/app/components/ui/RankInsignia';

type Tab = 'timeline' | 'scenario' | 'whatif' | 'saved';
type ZoomedMonth = { year: number; month: number } | null;
type TimelineZoomLevel = 0 | 1 | 2;
type AddEventKind = 'milestone' | 'station' | 'promotion' | 'education' | 'spouse' | 'child' | 'goal';

const addEventOptions: {
  kind: AddEventKind;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
}[] = [
  {
    kind: 'milestone',
    eyebrow: 'Career',
    title: 'Milestone',
    description: 'Enlistment, EAS, reenlistment, retirement, letters, or custom markers.',
    icon: <Flag weight="bold" className="w-4 h-4" />,
    accent: '#ef4444',
  },
  {
    kind: 'station',
    eyebrow: 'Service',
    title: 'Duty Station',
    description: 'Add a PCS, unit assignment, potential station, or tour window.',
    icon: <MapPin weight="bold" className="w-4 h-4" />,
    accent: '#9ca3af',
  },
  {
    kind: 'promotion',
    eyebrow: 'Service',
    title: 'Promotion',
    description: 'Project a future rank change onto the career timeline.',
    icon: <Medal weight="bold" className="w-4 h-4" />,
    accent: '#f87171',
  },
  {
    kind: 'education',
    eyebrow: 'Education',
    title: 'Education',
    description: 'Track PME, school, certifications, degrees, or training dates.',
    icon: <BookOpen weight="bold" className="w-4 h-4" />,
    accent: '#60a5fa',
  },
  {
    kind: 'spouse',
    eyebrow: 'Family',
    title: 'Spouse',
    description: 'Add or update spouse details and marriage date on the family track.',
    icon: <Heart weight="bold" className="w-4 h-4" />,
    accent: '#f472b6',
  },
  {
    kind: 'child',
    eyebrow: 'Family',
    title: 'Child',
    description: 'Add a child, projected child, school phases, and school-year settings.',
    icon: <Users weight="bold" className="w-4 h-4" />,
    accent: '#fb7185',
  },
  {
    kind: 'goal',
    eyebrow: 'Financial',
    title: 'Financial Goal',
    description: 'Plot savings, investments, home, retirement, or custom money goals.',
    icon: <CurrencyDollar weight="bold" className="w-4 h-4" />,
    accent: '#4ade80',
  },
];

function AddEventChooserModal({
  onSelect,
  onClose,
}: {
  onSelect: (kind: AddEventKind) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="w-full max-w-3xl border border-white/15 flex flex-col max-h-[90vh]"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-none">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Timeline Control</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              ADD EVENT<span className="text-red-600">.</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-white/15 text-white/40 hover:text-white/80 hover:border-white/30 transition-colors">
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 overflow-y-auto flex-1">
          <div className="grid gap-2 md:grid-cols-2">
            {addEventOptions.map(option => (
              <button
                key={option.kind}
                onClick={() => onSelect(option.kind)}
                className="group flex items-center gap-3 border border-white/[0.08] p-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.035] bg-white/[0.02]">
                <div
                  className="flex h-9 w-9 flex-none items-center justify-center border transition-colors"
                  style={{
                    color: option.accent,
                    borderColor: `${option.accent}66`,
                    background: `${option.accent}14`,
                  }}>
                  {option.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] font-mono font-bold tracking-[0.22em] text-white/28 uppercase">{option.eyebrow}</div>
                  <div className="mt-0.5 text-[12px] font-mono font-black tracking-wider text-white/80">{option.title.toUpperCase()}</div>
                  <div className="mt-1 text-[10px] font-mono leading-snug text-white/38">{option.description}</div>
                </div>
                <ArrowRight weight="bold" className="w-3.5 h-3.5 flex-none text-white/20 transition-colors group-hover:text-red-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/10 flex-none">
          <div className="text-[9px] font-mono tracking-widest text-white/25">
            Select a type to open the matching timeline modal.
          </div>
          <button onClick={onClose}
            className="h-9 px-5 border border-white/15 text-[10px] font-mono font-bold tracking-widest text-white/45 hover:text-white/70 hover:border-white/30 transition-colors">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveTimelineModal({
  defaultName,
  onSave,
  onClose,
}: {
  defaultName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const canSave = name.trim().length > 0;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && canSave) onSave(name);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [canSave, name, onClose, onSave]);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="w-full max-w-md border border-white/15 flex flex-col"
        style={{ background: 'var(--usmc-bg-surface)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase mb-0.5">Timeline Archive</div>
            <div className="text-[14px] font-mono font-black text-white tracking-wider">
              SAVE TIMELINE<span className="text-red-600">.</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-white/15 text-white/40 hover:text-white/80 hover:border-white/30 transition-colors">
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-1.5">Timeline Name</label>
            <input
              autoFocus
              className="w-full h-10 px-3 bg-black border border-white/15 text-[12px] font-mono text-white/85 focus:outline-none focus:border-red-600/60 transition-colors placeholder:text-white/20"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Quantico retirement plan"
            />
          </div>
          <div className="border border-white/[0.08] px-3 py-2.5 text-[10px] font-mono text-white/38 leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            This saves a snapshot of your current profile, events, family, education, and financial goals.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/10">
          <button onClick={onClose}
            className="h-9 px-5 border border-white/15 text-[10px] font-mono font-bold tracking-widest text-white/45 hover:text-white/70 hover:border-white/30 transition-colors">
            CANCEL
          </button>
          <button onClick={() => onSave(name)} disabled={!canSave}
            className="h-9 px-6 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-700 text-white text-[10px] font-mono font-black tracking-widest transition-colors">
            SAVE TIMELINE
          </button>
        </div>
      </div>
    </div>
  );
}

function serviceYearsLabel(enlist: Date): string {
  const today = new Date();
  const totalMonths = (today.getFullYear() - enlist.getFullYear()) * 12 + (today.getMonth() - enlist.getMonth());
  if (totalMonths <= 0) return '—';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return months > 0 ? `${years} YRS, ${months} MOS` : `${years} YRS`;
}


interface Props {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function CareerPathPage({ isFullscreen = false, onToggleFullscreen }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [showTimelineHelp, setShowTimelineHelp] = useState(false);
  const [showAddEventChooser, setShowAddEventChooser] = useState(false);
  const [showSaveTimeline, setShowSaveTimeline] = useState(false);
  const [savedTimelines, setSavedTimelines] = useState<SavedTimeline[]>(() => readSavedTimelines());
  const yearWidth = 100;
  const [zoomedYear, setZoomedYear] = useState<number | null>(null);
  const [zoomedMonth, setZoomedMonth] = useState<ZoomedMonth>(null);

  const {
    profile, setProfile,
    promotions, setPromotions,
    milestones, setMilestones,
    dutyStations, setDutyStations,
    education, setEducation,
    spouse, setSpouse,
    children, setChildren,
    financialGoals, setFinancialGoals,
  } = useCareerData();

  const {
    showEditProfile, setShowEditProfile,
    showAddPromotion, setShowAddPromotion,
    showAddMilestone, setShowAddMilestone,
    showAddDutyStation, setShowAddDutyStation,
    showAddEducation, setShowAddEducation,
    showAddSpouse, setShowAddSpouse,
    showAddChild, setShowAddChild,
    showAddFinancialGoal, setShowAddFinancialGoal,
    editingPromotion, setEditingPromotion,
    editingMilestone, setEditingMilestone,
    editingDutyStation, setEditingDutyStation,
    editingEducation, setEditingEducation,
    editingChild, setEditingChild,
    editingFinancialGoal, setEditingFinancialGoal,
  } = useModalState();

  const [presentDate, setPresentDate] = useState<Date>(() => new Date());
  const presentDateIsToday = (() => {
    const real = new Date();
    return presentDate.getFullYear() === real.getFullYear() && presentDate.getMonth() === real.getMonth();
  })();

  const timelineRef = useRef<TimelineGridHandle>(null);

  const setYearView = () => {
    setZoomedYear(null);
    setZoomedMonth(null);
  };
  const setMonthView = (year = presentDate.getFullYear()) => {
    setZoomedYear(year);
    setZoomedMonth(null);
  };
  const setDayView = (date = presentDate) => {
    setZoomedYear(date.getFullYear());
    setZoomedMonth({ year: date.getFullYear(), month: date.getMonth() });
  };
  const currentDayViewDate = () => {
    if (zoomedMonth) return new Date(zoomedMonth.year, zoomedMonth.month, 1);
    if (zoomedYear !== null) {
      return presentDate.getFullYear() === zoomedYear ? presentDate : new Date(zoomedYear, 0, 1);
    }
    return presentDate;
  };
  const zoomLevel: TimelineZoomLevel = zoomedMonth ? 2 : zoomedYear !== null ? 1 : 0;
  const applyZoomLevel = (level: TimelineZoomLevel) => {
    if (level === 0) {
      setYearView();
      return;
    }
    if (level === 1) {
      setMonthView(zoomedMonth?.year ?? zoomedYear ?? presentDate.getFullYear());
      return;
    }
    setDayView(currentDayViewDate());
  };

  const handleZoomIn = () => {
    if (zoomLevel < 2) applyZoomLevel((zoomLevel + 1) as TimelineZoomLevel);
  };
  const handleZoomOut = () => {
    if (zoomLevel > 0) applyZoomLevel((zoomLevel - 1) as TimelineZoomLevel);
  };
  const handleZoomSlider = (v: TimelineZoomLevel) => {
    applyZoomLevel(v);
  };
  const openAddEventModal = (kind: AddEventKind) => {
    setShowAddEventChooser(false);
    if (kind === 'milestone') setShowAddMilestone(true);
    if (kind === 'station') setShowAddDutyStation(true);
    if (kind === 'promotion') setShowAddPromotion(true);
    if (kind === 'education') setShowAddEducation(true);
    if (kind === 'spouse') setShowAddSpouse(true);
    if (kind === 'child') setShowAddChild(true);
    if (kind === 'goal') setShowAddFinancialGoal(true);
  };
  const returnToEventTypes = () => {
    setShowAddPromotion(false);
    setShowAddMilestone(false);
    setShowAddDutyStation(false);
    setShowAddEducation(false);
    setShowAddSpouse(false);
    setShowAddChild(false);
    setShowAddFinancialGoal(false);
    setEditingPromotion(null);
    setEditingMilestone(null);
    setEditingDutyStation(null);
    setEditingEducation(null);
    setEditingChild(null);
    setEditingFinancialGoal(null);
    setShowAddEventChooser(true);
  };
  const displayName = profile.name.trim() || 'YOUR NAME';
  const displayMos = [profile.mos, profile.mosDescription].filter(Boolean).join(' ');

  const timelineData = { profile, milestones, dutyStations, promotions, education, spouse, children, financialGoals };
  const defaultSaveName = `${displayName === 'YOUR NAME' ? 'Career' : displayName.split(' ')[0]}'s Timeline`;

  const handleSaveTimeline = (name: string) => {
    saveTimelineSnapshot(name, timelineData);
    setSavedTimelines(readSavedTimelines());
    setShowSaveTimeline(false);
    setActiveTab('saved');
  };

  const loadSavedTimeline = (data: TimelineData) => {
    setProfile(data.profile);
    setPromotions(data.promotions);
    setMilestones(data.milestones);
    setDutyStations(data.dutyStations);
    setEducation(data.education);
    setSpouse(data.spouse);
    setChildren(data.children);
    setFinancialGoals(data.financialGoals);
    setActiveTab('timeline');
    setYearView();
  };

  const removeSavedTimeline = (id: string) => {
    deleteSavedTimeline(id);
    setSavedTimelines(readSavedTimelines());
  };

  return (
    <div className={isFullscreen ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen pb-5 md:pb-0'} style={{ background: 'var(--usmc-bg-page)' }}>
      <SEOHead
        title="USMC Career Path Planner | Marine Corps Timeline Tool"
        description="Plan your entire Marine Corps career on one interactive timeline — duty stations, promotions, family milestones, education, and financial goals. Visualize your USMC career path from enlistment to retirement."
        keywords="Marine Corps career planner, USMC career path, Marine Corps timeline tool, Marine duty station planner, USMC promotion timeline, Marine Corps career planning tool, Marine career milestones, USMC retirement planning, Marine Corps service planner"
        path="/career-path"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'USMC Career Path Planner',
            url: 'https://stay-marine.com/career-path',
            description: 'Interactive Marine Corps career timeline tool for planning duty stations, promotions, family milestones, education events, and financial goals across an entire USMC career.',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            provider: { '@type': 'Organization', name: 'Stay Marine', url: 'https://stay-marine.com' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://stay-marine.com/' },
              { '@type': 'ListItem', position: 2, name: 'Career Path Planner', item: 'https://stay-marine.com/career-path' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Plan Your Marine Corps Career Timeline',
            description: 'Use the Stay Marine Career Path Planner to map out your entire USMC career — from duty stations and promotions to family events, education, and financial goals — all on one interactive timeline.',
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Set up your Marine profile',
                text: 'Enter your enlistment date, current rank, MOS, and EAS. The planner uses this to anchor your timeline and populate your current promotion automatically.',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Add duty stations, promotions, and life events',
                text: 'Plot past and future duty stations, add projected promotions, record family milestones like marriage and children, plan education, and set financial goals. Each event appears on your timeline as a visual block or marker.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Visualize and plan your career',
                text: 'Switch between year, month, and day views to zoom in on specific periods. Save multiple timeline scenarios to compare career paths — such as different reenlistment options or lateral move timing.',
              },
            ],
          },
        ]}
      />

      {/* ── Hero + Profile — hidden in fullscreen ────────────────── */}
      {!isFullscreen && <>
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        <div className="absolute inset-0"
          style={{ background: 'var(--usmc-hero-overlay)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="relative z-10 flex flex-col" style={{ minHeight: 176 }}>
          <div className="hidden md:block absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right">
            <div className="text-[12px] font-black text-white tracking-widest">EXPLORE WHAT'S POSSIBLE<span className="text-red-600">.</span></div>
            <div className="text-[12px] font-black text-white tracking-widest">COMPARE<span className="text-red-600">.</span> PLAN<span className="text-red-600">.</span></div>
            <div className="text-[12px] font-black text-white tracking-widest mb-2">MAKE IT HAPPEN<span className="text-red-600">.</span></div>
            <div className="w-6 h-px bg-red-600 ml-auto" />
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="hover:text-gray-400 transition-colors bg-transparent p-0 border-0 text-[12px] font-mono tracking-wider text-gray-600">
                Home
              </button>
              <CaretRight className="w-3 h-3" />
              <span className="text-red-500">CAREER PATH</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
                className="page-hero-title mb-2"
              >
                CAREER PATH<span className="text-red-600">.</span>
              </motion.h1>
            </div>
            <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed">
              Visualize your future. Plan your career, family, education, and goals all in one interactive timeline.
            </p>
          </div>
        </div>
      </div>

      {/* ── Profile Card ──────────────────────────────────────────── */}
      <div className="border-b border-white/10 relative overflow-hidden" style={{ background: 'var(--usmc-bg-surface)' }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        <div className="relative z-10 px-6 py-4 flex flex-wrap items-center gap-4">
          <RankInsignia payGrade={profile.payGrade} rankAbbr={profile.rankAbbr} />
          <div>
            <div className="text-[8px] font-mono tracking-[0.28em] text-white/30 uppercase">
              {profile.rankFull} · {profile.payGrade}
            </div>
            <div className="text-[15px] font-mono font-black text-white tracking-wider leading-tight">{displayName.toUpperCase()}</div>
            {displayMos && (
              <div className="text-[10px] font-mono text-red-500/80 tracking-[0.18em] mt-0.5">{displayMos.toUpperCase()}</div>
            )}
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10 mx-2 flex-none" />
          <div className="hidden sm:flex gap-3 flex-1">
            <div className="border border-white/[0.08] px-3 py-2 flex-none bg-white/[0.025]">
              <div className="text-[7px] font-mono tracking-[0.28em] text-white/25 uppercase mb-0.5">YEARS OF SERVICE</div>
              <div className="text-[12px] font-mono font-bold text-white/80">{serviceYearsLabel(profile.enlistmentDate)}</div>
            </div>
            <div className="border border-white/[0.08] px-3 py-2 flex-none bg-white/[0.025]">
              <div className="text-[7px] font-mono tracking-[0.28em] text-white/25 uppercase mb-0.5">PROJECTED RETIREMENT</div>
              <div className="text-[12px] font-mono font-bold text-white/80">
                {profile.projectedRetirement.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}{' '}
                <span className="text-white/35 text-[10px]">({profile.retirementYears} YRS)</span>
              </div>
            </div>
            <div className="border border-white/[0.08] px-3 py-2 flex-none bg-white/[0.025]">
              <div className="text-[7px] font-mono tracking-[0.28em] text-white/25 uppercase mb-0.5">DATE OF BIRTH</div>
              <div className="text-[12px] font-mono font-bold text-white/80">
                {profile.dob.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowEditProfile(true)}
            className="ml-auto flex items-center gap-1.5 border border-white/15 px-3 py-1.5 text-[10px] font-mono tracking-widest text-white/50 hover:text-white/80 hover:border-white/30 transition-colors">
            <Pencil weight="bold" className="w-3 h-3" />
            EDIT PROFILE
          </button>
        </div>
      </div>
      </>}

      {/* ── Fullscreen compact bar ─────────────────────────────────── */}
      {isFullscreen && (
        <div className="flex-none flex items-center gap-3 px-5 border-b border-white/10" style={{ height: 48, background: 'var(--usmc-bg-page)' }}>
          <div className="text-[12px] font-mono font-black text-white tracking-widest flex-none">
            CAREER PATH<span className="text-red-600">.</span>
          </div>
          <div className="w-px h-4 bg-white/15 flex-none" />
          {/* Tab selector */}
          <div className="flex items-center gap-0.5">
            {([['timeline', 'TIMELINE'], ['saved', 'SAVED']] as [Tab, string][]).map(([key, lbl]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`h-7 px-3 text-[9px] font-mono font-bold tracking-widest transition-colors ${
                  activeTab === key ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/60'
                }`}>
                {lbl}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          {activeTab === 'timeline' && (
            <button
              onClick={() => setShowAddEventChooser(true)}
              className="hidden md:flex items-center gap-1.5 h-7 px-3 border border-red-600/60 hover:border-red-600 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 text-[9px] font-mono font-black tracking-widest transition-colors flex-none">
              <Plus weight="bold" className="w-3 h-3" />
              ADD EVENT
            </button>
          )}
          {activeTab === 'timeline' && (
            <button
              onClick={() => setShowSaveTimeline(true)}
              className="hidden lg:flex items-center gap-1.5 h-7 px-3 border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 text-[9px] font-mono font-bold tracking-widest transition-colors flex-none">
              <FloppyDisk weight="bold" className="w-3 h-3" />
              SAVE
            </button>
          )}
          {activeTab === 'timeline' && (
            <>
              <div className="hidden xl:flex items-center h-7 px-2.5 border border-white/10 text-[8px] font-mono tracking-widest text-white/35 whitespace-nowrap flex-none bg-white/[0.025]">
                SHIFT + WHEEL = LEFT/RIGHT
              </div>
              <button
                onClick={() => setShowTimelineHelp(v => !v)}
                className={`h-7 px-3 border text-[9px] font-mono font-black tracking-widest transition-colors flex-none ${
                  showTimelineHelp
                    ? 'border-red-600/50 bg-red-600/15 text-red-300'
                    : 'border-white/15 text-white/40 hover:text-white/70 hover:border-white/30'
                }`}>
                HELP
              </button>
            </>
          )}
          {/* Present date */}
          <div className="hidden sm:flex items-center gap-1.5 h-7 px-3 border border-white/10 flex-none bg-red-600/[0.07]">
            <div className="w-1.5 h-1.5 rounded-full flex-none bg-red-500" />
            <span className="text-[9px] font-mono font-bold text-white/60 tracking-wider">
              {presentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
            </span>
            {!presentDateIsToday && (
              <button onClick={() => setPresentDate(new Date())}
                className="text-[8px] font-mono text-red-400/70 hover:text-red-400 tracking-widest transition-colors ml-1">
                RESET
              </button>
            )}
          </div>
          {/* Jump to today */}
          <button onClick={() => timelineRef.current?.scrollToToday()}
            className="hidden sm:flex items-center gap-1.5 h-7 px-3 border border-red-600/40 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 text-[9px] font-mono font-black tracking-widest transition-colors flex-none">
            <Crosshair className="w-3 h-3" />
            TODAY
          </button>
          {/* Zoom */}
          <div className="flex items-center gap-1.5 flex-none">
            <span className="hidden lg:inline text-[9px] font-mono tracking-widest text-white/30">ZOOM:</span>
            <button onClick={handleZoomOut}
              className="w-6 h-6 border border-white/15 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <Minus weight="bold" className="w-3 h-3" />
            </button>
            <input type="range" min={0} max={2} step={1} value={zoomLevel}
              onChange={e => handleZoomSlider(Number(e.target.value) as TimelineZoomLevel)}
              className="hidden sm:block w-20 accent-red-600 h-1" />
            <button onClick={handleZoomIn}
              className="w-6 h-6 border border-white/15 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <Plus weight="bold" className="w-3 h-3" />
            </button>
          </div>
          {/* Exit fullscreen */}
          <button onClick={onToggleFullscreen}
            className="w-7 h-7 flex items-center justify-center border border-white/15 text-red-400 hover:text-red-300 hover:border-red-600/50 transition-colors flex-none">
            <ArrowsIn weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isFullscreen && activeTab === 'timeline' && showTimelineHelp && (
        <div className="flex-none relative z-[34] border-b border-white/[0.08] px-5 py-3"
          style={{ background: 'var(--usmc-bg-page)' }}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
              <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">MOVE</div>
              <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                <div><span className="text-white/70">Click + drag</span> the timeline to pan.</div>
                <div><span className="text-white/70">Shift + mouse wheel</span> scrolls left and right.</div>
                <div><span className="text-white/70">Mouse wheel / trackpad</span> scrolls vertically.</div>
              </div>
            </div>
            <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
              <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">TIME</div>
              <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                <div><span className="text-red-300">Red line</span> is your planning date.</div>
                <div><span className="text-white/70">Drag the red line</span> to preview age, TIS, school, and status at another date.</div>
                <div><span className="text-white/70">TODAY</span> marks the real current date and stays fixed.</div>
              </div>
            </div>
            <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
              <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">EVENTS</div>
              <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                <div><span className="text-white/70">Add Event</span> opens modals for milestones, stations, education, family, and goals.</div>
                <div><span className="text-white/70">Click an item</span> to edit when supported.</div>
                <div><span className="text-white/70">Hover an item</span> for details; delete controls appear on editable rows.</div>
              </div>
            </div>
            <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
              <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">VIEWS</div>
              <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                <div><span className="text-white/70">Year</span> gives the full career sweep.</div>
                <div><span className="text-white/70">Month</span> shows month-level timing across years.</div>
                <div><span className="text-white/70">Day</span> gives exact dates; use zoom or click a month header.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Bar — hidden in fullscreen (compact bar replaces it) ── */}
      {!isFullscreen && <div className="flex items-center border-b border-white/10 px-6 shadow-[0_6px_20px_rgba(0,0,0,0.5)]" style={{ background: 'var(--usmc-bg-base)' }}>
        <div className="flex flex-1 overflow-x-auto">
          {([
            ['timeline', 'MY TIMELINE'],
            ['saved',    'SAVED TIMELINES'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-none px-5 py-3.5 text-[11px] font-mono font-bold tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-white/30 hover:text-white/55'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pl-4 flex-none">
          {activeTab === 'timeline' && (
          <button
            onClick={() => setShowAddEventChooser(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-600/60 hover:border-red-600 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 text-[10px] font-mono font-black tracking-widest transition-colors">
            <Plus weight="bold" className="w-3 h-3" />
            ADD EVENT
          </button>
          )}
          {activeTab === 'timeline' && (
          <button
            onClick={() => setShowSaveTimeline(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/12 hover:border-white/25 text-white/35 hover:text-white/65 text-[10px] font-mono tracking-widest transition-colors">
            <FloppyDisk weight="bold" className="w-3 h-3" />
            SAVE TIMELINE
          </button>
          )}
        </div>
      </div>}

      {/* ── Timeline Controls — hidden in fullscreen ───────────────── */}
      {!isFullscreen && activeTab === 'timeline' && (
        <>
        <div className="sticky top-20 z-[35] flex items-center gap-4 px-6 py-2.5 border-b border-white/[0.08] flex-wrap shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
          style={{ background: 'var(--usmc-bg-page)' }}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">View By:</span>
            <div className="flex border border-white/15">
              <button onClick={setYearView}
                className={`h-7 px-3 flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider transition-colors ${zoomedYear === null && !zoomedMonth ? 'bg-white/[0.08] text-white/80' : 'text-white/30 hover:text-white/60'}`}>
                <Calendar className="w-3 h-3" />
                YEAR
              </button>
              <button onClick={() => setMonthView(zoomedMonth?.year ?? zoomedYear ?? presentDate.getFullYear())}
                className={`h-7 px-3 border-l border-white/15 text-[10px] font-mono font-bold tracking-wider transition-colors ${zoomedYear !== null && !zoomedMonth ? 'bg-white/[0.08] text-white/80' : 'text-white/30 hover:text-white/60'}`}>
                MONTH
              </button>
              <button onClick={() => setDayView(currentDayViewDate())}
                className={`h-7 px-3 border-l border-white/15 text-[10px] font-mono font-bold tracking-wider transition-colors ${zoomedMonth ? 'bg-white/[0.08] text-white/80' : 'text-white/30 hover:text-white/60'}`}>
                DAY
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-6 h-6 border border-white/15 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <CaretLeft className="w-3 h-3" />
            </button>
            <div className="border border-white/15 px-3 h-7 flex items-center text-[10px] font-mono text-white/60 whitespace-nowrap">
              <span className="text-[9px] text-white/30 tracking-widest mr-2">TIMELINE RANGE:</span>
              2018 – 2045 (28 YEARS)
            </div>
            <button className="w-6 h-6 border border-white/15 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <CaretRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden xl:flex items-center h-7 px-2.5 border border-white/10 text-[8px] font-mono tracking-widest text-white/35 whitespace-nowrap bg-white/[0.025]">
              SHIFT + WHEEL = LEFT/RIGHT
            </div>
            <button
              onClick={() => setShowTimelineHelp(v => !v)}
              className={`h-7 px-3 border text-[9px] font-mono font-black tracking-widest transition-colors ${
                showTimelineHelp
                  ? 'border-red-600/50 bg-red-600/15 text-red-300'
                  : 'border-white/15 text-white/40 hover:text-white/70 hover:border-white/30'
              }`}>
              HELP
            </button>
            {/* Present date indicator — shows current red-line position */}
            <div className="flex items-center gap-1.5 h-7 px-3 border border-white/10 bg-red-600/[0.07]">
              <div className="w-1.5 h-1.5 rounded-full flex-none bg-red-500" />
              <span className="text-[9px] font-mono font-bold text-white/60 tracking-wider">
                {presentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
              {!presentDateIsToday && (
                <button
                  onClick={() => setPresentDate(new Date())}
                  className="text-[8px] font-mono text-red-400/70 hover:text-red-400 tracking-widest transition-colors ml-1">
                  RESET
                </button>
              )}
            </div>
            <button
              onClick={() => timelineRef.current?.scrollToToday()}
              className="flex items-center gap-1.5 h-7 px-3 border border-red-600/40 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 text-[9px] font-mono font-black tracking-widest transition-colors">
              <Crosshair className="w-3 h-3" />
              JUMP TO TODAY
            </button>
            <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Zoom:</span>
            <button onClick={handleZoomOut}
              className="w-6 h-6 border border-white/15 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <Minus weight="bold" className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1 w-24">
              <input
                type="range" min={0} max={2} step={1} value={zoomLevel}
                onChange={e => handleZoomSlider(Number(e.target.value) as TimelineZoomLevel)}
                className="w-full accent-red-600 h-1"
              />
            </div>
            <button onClick={handleZoomIn}
              className="w-6 h-6 border border-white/15 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
              <Plus weight="bold" className="w-3 h-3" />
            </button>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="hidden md:flex w-6 h-6 border border-white/15 items-center justify-center text-white/40 hover:text-white/70 hover:border-white/30 transition-colors"
                title="Enter fullscreen">
                <ArrowsOut weight="bold" className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        {showTimelineHelp && (
          <div className="relative z-[34] border-b border-white/[0.08] px-6 py-3"
            style={{ background: 'var(--usmc-bg-page)' }}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
                <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">MOVE</div>
                <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                  <div><span className="text-white/70">Click + drag</span> the timeline to pan.</div>
                  <div><span className="text-white/70">Shift + mouse wheel</span> scrolls left and right.</div>
                  <div><span className="text-white/70">Mouse wheel / trackpad</span> scrolls vertically.</div>
                </div>
              </div>
              <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
                <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">TIME</div>
                <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                  <div><span className="text-red-300">Red line</span> is your planning date.</div>
                  <div><span className="text-white/70">Drag the red line</span> to preview age, TIS, school, and status at another date.</div>
                  <div><span className="text-white/70">TODAY</span> marks the real current date and stays fixed.</div>
                </div>
              </div>
              <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
                <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">EVENTS</div>
                <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                  <div><span className="text-white/70">Add Event</span> opens modals for milestones, stations, education, family, and goals.</div>
                  <div><span className="text-white/70">Click an item</span> to edit when supported.</div>
                  <div><span className="text-white/70">Hover an item</span> for details; delete controls appear on editable rows.</div>
                </div>
              </div>
              <div className="border border-white/[0.08] p-3 bg-white/[0.025]">
                <div className="text-[9px] font-mono font-black tracking-[0.18em] text-white/70 mb-2">VIEWS</div>
                <div className="space-y-1.5 text-[10px] font-mono text-white/45 leading-relaxed">
                  <div><span className="text-white/70">Year</span> gives the full career sweep.</div>
                  <div><span className="text-white/70">Month</span> shows month-level timing across years.</div>
                  <div><span className="text-white/70">Day</span> gives exact dates; use zoom or click a month header.</div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* ── Tab Content ───────────────────────────────────────────── */}
      <div className={isFullscreen ? 'flex-1 min-h-0 overflow-y-auto' : ''}>
        {activeTab === 'timeline' && (
          <TimelineGrid
            ref={timelineRef}
            data={timelineData}
            yearWidth={yearWidth}
            isFullscreen={isFullscreen}
            presentDate={presentDate}
            onPresentDateChange={setPresentDate}
            zoomedYear={zoomedYear}
            zoomedMonth={zoomedMonth}
            onZoomedYearChange={year => {
              setZoomedYear(year);
              setZoomedMonth(null);
            }}
            onZoomedMonthChange={month => {
              setZoomedMonth(month);
              if (month) setZoomedYear(month.year);
            }}
            onAddPromotion={() => setShowAddPromotion(true)}
            onAddMilestone={() => setShowAddMilestone(true)}
            onAddDutyStation={() => setShowAddDutyStation(true)}
            onAddEducation={() => setShowAddEducation(true)}
            onAddSpouse={() => setShowAddSpouse(true)}
            onAddChild={() => setShowAddChild(true)}
            onAddFinancialGoal={() => setShowAddFinancialGoal(true)}
            onDeletePromotion={id => setPromotions(prev => prev.filter(p => p.id !== id))}
            onDeleteMilestone={id => setMilestones(prev => prev.filter(m => m.id !== id))}
            onDeleteDutyStation={id => setDutyStations(prev => prev.filter(d => d.id !== id))}
            onDeleteEducation={id => setEducation(prev => prev.filter(e => e.id !== id))}
            onDeleteChild={id => setChildren(prev => prev.filter(c => c.id !== id))}
            onDeleteFinancialGoal={id => setFinancialGoals(prev => prev.filter(g => g.id !== id))}
            onEditPromotion={setEditingPromotion}
            onEditMilestone={setEditingMilestone}
            onEditDutyStation={setEditingDutyStation}
            onEditEducation={setEditingEducation}
            onEditChild={setEditingChild}
            onEditFinancialGoal={setEditingFinancialGoal}
            onReorderChildren={ids => {
              setChildren(prev => {
                const planned = prev.filter(c => c.isPlanned);
                const real = prev.filter(c => !c.isPlanned);
                const reordered = ids.map(id => real.find(c => c.id === id)!).filter(Boolean);
                return [...reordered, ...planned];
              });
            }}
          />
        )}
        {activeTab === 'scenario' && (
          <ScenarioPlanner scenarios={scenarios} yearWidth={yearWidth} />
        )}
        {activeTab === 'whatif' && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-[11px] font-mono tracking-[0.3em] text-white/20 uppercase">[ WHAT IF ANALYSIS ]</div>
            <div className="text-[13px] font-mono text-white/30">Advanced modeling tools — coming soon.</div>
          </div>
        )}
        {activeTab === 'saved' && (
          <div className="px-6 py-6">
            <div className="border border-white/10" style={{ background: 'var(--usmc-bg-base)' }}>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div>
                  <div className="text-[9px] font-mono tracking-[0.28em] text-white/30 uppercase mb-0.5">Timeline Archive</div>
                  <div className="text-[14px] font-mono font-black text-white tracking-wider">
                    SAVED TIMELINES<span className="text-red-600">.</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowSaveTimeline(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-red-600/60 hover:border-red-600 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 text-[10px] font-mono font-black tracking-widest transition-colors">
                  <FloppyDisk weight="bold" className="w-3 h-3" />
                  SAVE CURRENT
                </button>
              </div>

              {savedTimelines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-10 h-10 border border-white/12 flex items-center justify-center text-white/25">
                    <FloppyDisk weight="bold" className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] font-mono tracking-[0.26em] text-white/25 uppercase">No saved timelines</div>
                  <div className="max-w-md text-center text-[12px] font-mono text-white/35 leading-relaxed">
                    Save the current plan with a custom name, then return here to load or compare saved timeline snapshots.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.08]">
                  {savedTimelines.map(saved => {
                    const data = saved.data;
                    const eventCount = data.milestones.length + data.dutyStations.length + data.promotions.length + data.education.length + data.children.length + data.financialGoals.length + (data.spouse ? 1 : 0);
                    return (
                      <div key={saved.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center hover:bg-white/[0.025] transition-colors">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-[13px] font-mono font-black tracking-wider text-white/85 truncate">{saved.name.toUpperCase()}</div>
                            <div className="border border-white/10 px-2 py-0.5 text-[8px] font-mono tracking-widest text-white/30">
                              {eventCount} ITEMS
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-white/35">
                            <span className="flex items-center gap-1.5">
                              <Clock weight="bold" className="w-3 h-3 text-white/22" />
                              SAVED {saved.savedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                            </span>
                            <span>{data.profile.rankAbbr} {data.profile.name.toUpperCase()}</span>
                            <span>{data.dutyStations.length} STATIONS</span>
                            <span>{data.education.length} EDUCATION</span>
                            <span>{data.financialGoals.length} GOALS</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadSavedTimeline(data)}
                            className="h-8 px-4 border border-red-600/50 bg-red-600/10 text-[9px] font-mono font-black tracking-widest text-red-300 hover:bg-red-600/20 hover:text-red-200 transition-colors">
                            LOAD
                          </button>
                          <button
                            onClick={() => removeSavedTimeline(saved.id)}
                            className="h-8 w-8 border border-white/15 flex items-center justify-center text-white/35 hover:text-red-300 hover:border-red-600/50 transition-colors"
                            title="Delete saved timeline">
                            <Trash weight="bold" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      {showSaveTimeline && (
        <SaveTimelineModal
          defaultName={defaultSaveName}
          onSave={handleSaveTimeline}
          onClose={() => setShowSaveTimeline(false)}
        />
      )}

      {showAddEventChooser && (
        <AddEventChooserModal
          onSelect={openAddEventModal}
          onClose={() => setShowAddEventChooser(false)}
        />
      )}

      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onSave={updated => setProfile(updated)}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {showAddPromotion && (
        <AddPromotionModal
          profile={profile}
          onSave={p => setPromotions(prev => [...prev, p].sort((a, b) => a.date.getTime() - b.date.getTime()))}
          onClose={() => setShowAddPromotion(false)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {showAddMilestone && (
        <AddMilestoneModal
          onSave={m => setMilestones(prev => [...prev, m].sort((a, b) => a.date.getTime() - b.date.getTime()))}
          onClose={() => setShowAddMilestone(false)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {showAddDutyStation && (
        <AddDutyStationModal
          onSave={ds => setDutyStations(prev => [...prev, ds].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()))}
          onClose={() => setShowAddDutyStation(false)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {showAddEducation && (
        <AddEducationModal
          onSave={e => setEducation(prev => [...prev, e].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()))}
          onClose={() => setShowAddEducation(false)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {showAddSpouse && (
        <AddSpouseModal
          existing={spouse}
          onSave={s => setSpouse(s)}
          onRemove={() => setSpouse(null)}
          onClose={() => setShowAddSpouse(false)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {showAddChild && (
        <AddChildModal
          onSave={c => setChildren(prev => [...prev, c])}
          onClose={() => setShowAddChild(false)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {showAddFinancialGoal && (
        <AddFinancialGoalModal
          onSave={g => setFinancialGoals(prev => [...prev, g].sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime()))}
          onClose={() => setShowAddFinancialGoal(false)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {/* ── Edit modals ───────────────────────────────────────────── */}
      {editingPromotion && (
        <AddPromotionModal
          profile={profile}
          existing={editingPromotion}
          onSave={p => {
            setPromotions(prev => prev.map(x => x.id === p.id ? p : x).sort((a, b) => a.date.getTime() - b.date.getTime()));
            setEditingPromotion(null);
          }}
          onDelete={() => { setPromotions(prev => prev.filter(p => p.id !== editingPromotion.id)); setEditingPromotion(null); }}
          onClose={() => setEditingPromotion(null)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {editingMilestone && (
        <AddMilestoneModal
          existing={editingMilestone}
          onSave={m => {
            setMilestones(prev => prev.map(x => x.id === m.id ? m : x).sort((a, b) => a.date.getTime() - b.date.getTime()));
            setEditingMilestone(null);
          }}
          onDelete={() => { setMilestones(prev => prev.filter(m => m.id !== editingMilestone.id)); setEditingMilestone(null); }}
          onClose={() => setEditingMilestone(null)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {editingDutyStation && (
        <AddDutyStationModal
          existing={editingDutyStation}
          onSave={ds => {
            setDutyStations(prev => prev.map(x => x.id === ds.id ? ds : x).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));
            setEditingDutyStation(null);
          }}
          onDelete={() => { setDutyStations(prev => prev.filter(d => d.id !== editingDutyStation.id)); setEditingDutyStation(null); }}
          onClose={() => setEditingDutyStation(null)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {editingEducation && (
        <AddEducationModal
          existing={editingEducation}
          onSave={e => {
            setEducation(prev => prev.map(x => x.id === e.id ? e : x).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));
            setEditingEducation(null);
          }}
          onDelete={() => { setEducation(prev => prev.filter(e => e.id !== editingEducation.id)); setEditingEducation(null); }}
          onClose={() => setEditingEducation(null)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {editingChild && (
        <AddChildModal
          existing={editingChild}
          onSave={c => {
            setChildren(prev => prev.map(x => x.id === c.id ? c : x));
            setEditingChild(null);
          }}
          onDelete={() => { setChildren(prev => prev.filter(c => c.id !== editingChild.id)); setEditingChild(null); }}
          onClose={() => setEditingChild(null)}
          onBackToEvents={returnToEventTypes}
        />
      )}

      {editingFinancialGoal && (
        <AddFinancialGoalModal
          existing={editingFinancialGoal}
          onSave={g => {
            setFinancialGoals(prev => prev.map(x => x.id === g.id ? g : x).sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime()));
            setEditingFinancialGoal(null);
          }}
          onDelete={() => { setFinancialGoals(prev => prev.filter(g => g.id !== editingFinancialGoal.id)); setEditingFinancialGoal(null); }}
          onClose={() => setEditingFinancialGoal(null)}
          onBackToEvents={returnToEventTypes}
        />
      )}
    </div>
  );
}
