import { useState, useMemo, useEffect, useRef } from 'react';
import { SEOHead } from '@/app/components/SEOHead';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, BookOpen, ExternalLink, Download } from 'lucide-react';
import { useTheme } from '@/app/features/theme/ThemeContext';
import { generateDegreePlannerPdf } from './degree-planner/degreePlannerPdf';

import type { DegreeLevel, Season, Term, Course, FundingSource, SchoolDetails, SchoolSuggestion, SavedState } from './degree-planner/types';
import { DEGREE_CREDITS, SEASONS, TA_PER_CREDIT_MAX, TA_ANNUAL_MAX, GRADE_POINTS, GRADE_CYCLE } from './degree-planner/constants';
import { STORAGE_KEY, loadSaved } from './degree-planner/storage';
import { genId, fiscalYear, courseTACost, estimateFinalTerm, nextCycle } from './degree-planner/utils';

import { DegreeGoalSection } from './degree-planner/components/DegreeGoalSection';
import { CreditsEarnedSection } from './degree-planner/components/CreditsEarnedSection';
import { CoursePlanSection } from './degree-planner/components/CoursePlanSection';
import { SummarySection } from './degree-planner/components/SummarySection';
import { DegreePlannerFAQ } from './degree-planner/components/DegreePlannerFAQ';

// ── Main Component ───────────────────────────────────────────────────────────────
export function DegreePlannerPage() {
  const { theme } = useTheme();
  const isDesert = theme === 'desert';
  const navigate = useNavigate();

  // Load saved state once on mount
  const [_saved] = useState(loadSaved);

  // Goal
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>(_saved.degreeLevel ?? '');
  const [school, setSchool] = useState(_saved.school ?? '');
  const [schoolSuggestions, setSchoolSuggestions] = useState<SchoolSuggestion[]>([]);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(_saved.schoolDetails ?? null);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const schoolDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSchoolChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSchool(value);
    setSchoolDetails(null);
    if (schoolDebounceRef.current) clearTimeout(schoolDebounceRef.current);
    if (value.length < 2) {
      setSchoolSuggestions([]);
      setShowSchoolSuggestions(false);
      return;
    }
    schoolDebounceRef.current = setTimeout(async () => {
      const workerUrl = import.meta.env.VITE_SCHOOL_SEARCH_WORKER_URL;
      if (!workerUrl) return;
      try {
        const res = await fetch(`${workerUrl}?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          const results = data.results ?? [];
          setSchoolSuggestions(results);
          setShowSchoolSuggestions(results.length > 0);
        }
      } catch { /* silent — free-text entry still works */ }
    }, 300);
  }

  const [showBulkCostEditor, setShowBulkCostEditor] = useState(false);
  const [bulkCostRaw, setBulkCostRaw] = useState('');
  const [uncoveredCardState, setUncoveredCardState] = useState<'hidden' | 'gap' | 'settled'>('hidden');
  const uncoveredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function applyBulkCost() {
    const n = parseInt(bulkCostRaw, 10);
    if (!n || n <= 0) return;
    setTerms(prev => prev.map(t => ({
      ...t,
      courses: t.courses.map(c => c.status === 'complete' ? c : { ...c, costPerCredit: n }),
    })));
    setShowBulkCostEditor(false);
    setBulkCostRaw('');
  }

  const [fieldOfStudy, setFieldOfStudy] = useState(_saved.fieldOfStudy ?? '');
  const [customCredits, setCustomCredits] = useState<number | null>(_saved.customCredits ?? null);

  // Credits earned
  const [jstCredits, setJstCredits] = useState(_saved.jstCredits ?? 0);
  const [transferCredits, setTransferCredits] = useState(_saved.transferCredits ?? 0);
  const [clepCredits, setClepCredits] = useState(_saved.clepCredits ?? 0);

  // Plan
  const [terms, setTerms] = useState<Term[]>(_saved.terms ?? []);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set(_saved.expandedTermIds ?? []));

  // ── Persist to localStorage on every meaningful change ──
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        degreeLevel, school, schoolDetails, fieldOfStudy, customCredits,
        jstCredits, transferCredits, clepCredits, terms,
        expandedTermIds: [...expandedTerms],
      } satisfies SavedState));
    } catch {}
  }, [degreeLevel, school, schoolDetails, fieldOfStudy, customCredits, jstCredits, transferCredits, clepCredits, terms, expandedTerms]);

  function resetPlan() {
    if (!window.confirm('Clear all degree plan data? This cannot be undone.')) return;
    setDegreeLevel('');
    setSchool('');
    setSchoolDetails(null);
    setFieldOfStudy('');
    setCustomCredits(null);
    setJstCredits(0);
    setTransferCredits(0);
    setClepCredits(0);
    setTerms([]);
    setExpandedTerms(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  const [isPdfExporting, setIsPdfExporting] = useState(false);

  async function handleExportPdf() {
    if (isPdfExporting) return;
    setIsPdfExporting(true);
    try {
      const blob = await generateDegreePlannerPdf({
        school, schoolDetails, degreeLevel, fieldOfStudy,
        requiredCredits, earnedCredits, plannedCredits, creditsToGo,
        terms, taByFY, totalTAFunded, totalTACost, totalUncovered,
        totalByFunding, totalTuition, gpa, estimatedFinal,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = school.trim().replace(/\s+/g, '-').toLowerCase() || 'usmc';
      a.download = `degree-plan-${slug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsPdfExporting(false);
    }
  }

  // ── Computed ──
  const requiredCredits = useMemo(() => {
    if (!degreeLevel) return 0;
    return customCredits ?? DEGREE_CREDITS[degreeLevel];
  }, [degreeLevel, customCredits]);

  const earnedCredits = jstCredits + transferCredits + clepCredits;

  const plannedCredits = useMemo(
    () => terms.reduce((sum, t) => sum + t.courses.reduce((s, c) => s + c.credits, 0), 0),
    [terms],
  );

  const creditsToGo = requiredCredits > 0 ? Math.max(0, requiredCredits - earnedCredits - plannedCredits) : 0;
  const totalAccountedFor = earnedCredits + plannedCredits;
  const progressPct = requiredCredits > 0 ? Math.min(100, (totalAccountedFor / requiredCredits) * 100) : 0;
  const earnedPct = requiredCredits > 0 ? Math.min(100, (earnedCredits / requiredCredits) * 100) : 0;
  const plannedPct = requiredCredits > 0 ? Math.min(Math.max(0, 100 - earnedPct), (plannedCredits / requiredCredits) * 100) : 0;

  const taByFY = useMemo(() => {
    const fyMap = new Map<number, number>();
    for (const term of terms) {
      const fy = fiscalYear(term.season, term.year);
      const termTA = term.courses.reduce((sum, c) => sum + courseTACost(c), 0);
      fyMap.set(fy, (fyMap.get(fy) ?? 0) + termTA);
    }
    return fyMap;
  }, [terms]);

  const totalTAFunded = useMemo(
    () => [...taByFY.values()].reduce((sum, v) => sum + Math.min(v, TA_ANNUAL_MAX), 0),
    [taByFY],
  );

  const totalUncovered = useMemo(
    () => terms.reduce((sum, t) =>
      sum + t.courses.reduce((cs, c) =>
        c.funding === 'ta' && c.status !== 'complete' ? cs + Math.max(0, (c.costPerCredit - TA_PER_CREDIT_MAX) * c.credits) : cs,
      0),
    0),
    [terms],
  );

  const totalTACost = useMemo(
    () => terms.reduce((sum, t) =>
      sum + t.courses.reduce((cs, c) =>
        c.funding === 'ta' && c.status !== 'complete' ? cs + c.costPerCredit * c.credits : cs,
      0),
    0),
    [terms],
  );

  useEffect(() => {
    if (totalUncovered > 0) {
      if (uncoveredTimerRef.current) clearTimeout(uncoveredTimerRef.current);
      setUncoveredCardState('gap');
    } else {
      setUncoveredCardState(prev => {
        if (prev === 'gap') {
          uncoveredTimerRef.current = setTimeout(() => setUncoveredCardState('hidden'), 2800);
          return 'settled';
        }
        return prev;
      });
    }
  }, [totalUncovered]);

  const totalByFunding = useMemo(() => {
    const totals: Partial<Record<FundingSource, number>> = {};
    for (const term of terms) {
      for (const c of term.courses) {
        const cost = c.credits * c.costPerCredit;
        totals[c.funding] = (totals[c.funding] ?? 0) + cost;
      }
    }
    return totals;
  }, [terms]);

  const totalTuition = useMemo(
    () => terms.reduce((s, t) => s + t.courses.reduce((cs, c) => cs + c.credits * c.costPerCredit, 0), 0),
    [terms],
  );

  const avgCreditsPerTerm = useMemo(
    () => (terms.length === 0 ? 6 : plannedCredits / Math.max(1, terms.length)),
    [terms, plannedCredits],
  );

  const termsToFinish = creditsToGo > 0 && avgCreditsPerTerm > 0 ? Math.ceil(creditsToGo / avgCreditsPerTerm) : 0;

  const lastTerm = terms[terms.length - 1];
  const estimatedFinal =
    lastTerm && termsToFinish > 0
      ? estimateFinalTerm(lastTerm.season, lastTerm.year, termsToFinish)
      : '';

  // GPA from courses individually marked complete with grades
  const gpa = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const term of terms) {
      for (const c of term.courses) {
        if (c.status !== 'complete' || !c.grade) continue;
        const pts = GRADE_POINTS[c.grade as keyof typeof GRADE_POINTS];
        if (pts === undefined) continue;
        totalPoints += pts * c.credits;
        totalCredits += c.credits;
      }
    }
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
  }, [terms]);

  // ── Term operations ──
  function addTerm() {
    const currentYear = new Date().getFullYear();
    let nextSeason: Season = 'Fall';
    let nextYear = currentYear;
    if (terms.length > 0) {
      const last = terms[terms.length - 1];
      const idx = SEASONS.indexOf(last.season);
      nextSeason = SEASONS[(idx + 1) % 3];
      nextYear = idx === SEASONS.length - 1 ? last.year + 1 : last.year;
    }
    const id = genId();
    setTerms(prev => [...prev, { id, season: nextSeason, year: nextYear, courses: [] }]);
    setExpandedTerms(prev => new Set([...prev, id]));
  }

  function removeTerm(termId: string) {
    setTerms(prev => prev.filter(t => t.id !== termId));
    setExpandedTerms(prev => { const n = new Set(prev); n.delete(termId); return n; });
  }

  function toggleTerm(termId: string) {
    setExpandedTerms(prev => {
      const n = new Set(prev);
      if (n.has(termId)) n.delete(termId); else n.add(termId);
      return n;
    });
  }

  function addCourse(termId: string) {
    const costPerCredit = schoolDetails?.tuitionInState
      ? Math.round(schoolDetails.tuitionInState / 30)
      : 250;
    setTerms(prev =>
      prev.map(t =>
        t.id !== termId ? t : {
          ...t,
          courses: [...t.courses, { id: genId(), name: '', credits: 3, costPerCredit, funding: 'ta', grade: '', status: 'planned' }],
        },
      ),
    );
  }

  function updateCourse(termId: string, courseId: string, updates: Partial<Course>) {
    setTerms(prev =>
      prev.map(t =>
        t.id !== termId ? t : { ...t, courses: t.courses.map(c => c.id === courseId ? { ...c, ...updates } : c) },
      ),
    );
  }

  function removeCourse(termId: string, courseId: string) {
    setTerms(prev =>
      prev.map(t => t.id !== termId ? t : { ...t, courses: t.courses.filter(c => c.id !== courseId) }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <SEOHead
        title="USMC Degree Planner | Free Education Planning Tool for Marines"
        description="Plan your degree with USMC Tuition Assistance. Track JST credits, map TA-funded courses term by term, and monitor your $4,500 annual TA budget. Free for active-duty Marines."
        keywords="USMC tuition assistance, Marine Corps degree planner, military education planning, TA degree tracker, USMC JST credits, Marine Corps college degree, active duty education benefits, TA annual limit Marines"
        path="/education/degree-planner"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'USMC Degree Planner',
            url: 'https://stay-marine.com/education/degree-planner',
            description: 'Free interactive degree planning tool for active-duty Marines. Plan your associate, bachelor\'s, or master\'s degree using USMC Tuition Assistance, track JST credits, map courses by term, and monitor the $250/credit and $4,500/year TA budget.',
            applicationCategory: 'EducationApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            featureList: [
              'Track JST, transfer, and CLEP credits',
              'Plan courses by term (Fall, Spring, Summer)',
              'Monitor $250/credit-hour and $4,500/year USMC TA limits',
              'Export degree plan as PDF',
              'Search accredited universities by name',
            ],
            provider: { '@type': 'Organization', name: 'Stay Marine', url: 'https://stay-marine.com' },
            audience: { '@type': 'Audience', audienceType: 'Active-duty United States Marines' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://stay-marine.com/' },
              { '@type': 'ListItem', position: 2, name: 'Education', item: 'https://stay-marine.com/education' },
              { '@type': 'ListItem', position: 3, name: 'Degree Planner', item: 'https://stay-marine.com/education/degree-planner' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How much does USMC Tuition Assistance pay per credit?',
                acceptedAnswer: { '@type': 'Answer', text: 'USMC Tuition Assistance (TA) covers up to $250 per semester hour and up to $4,500 per fiscal year (October 1 – September 30). Any tuition above these caps must be covered by other sources such as the Post-9/11 GI Bill, FAFSA, or scholarships. The Degree Planner tracks both limits automatically.' },
              },
              {
                '@type': 'Question',
                name: 'What are JST credits and do colleges accept them?',
                acceptedAnswer: { '@type': 'Answer', text: 'The Joint Services Transcript (JST) translates military training and experience into college-level credit recommendations. Most accredited universities accept JST credits toward general education requirements or electives, reducing the number of paid courses needed.' },
              },
              {
                '@type': 'Question',
                name: 'How many credits do I need to earn a degree?',
                acceptedAnswer: { '@type': 'Answer', text: "An Associate degree typically requires 60 semester hours; a Bachelor's degree requires 120 semester hours; a Master's degree typically requires 30–36 semester hours beyond a bachelor's. The USMC Degree Planner adjusts your target automatically based on your selected degree level." },
              },
              {
                '@type': 'Question',
                name: 'Can I use Tuition Assistance and the GI Bill together?',
                acceptedAnswer: { '@type': 'Answer', text: 'TA and the Post-9/11 GI Bill cannot pay for the same course costs at the same time, but they complement each other. If tuition exceeds the TA cap ($250/SH or $4,500/year), GI Bill benefits may cover the gap. Most Marines use TA on active duty and transition to the GI Bill after EAS.' },
              },
              {
                '@type': 'Question',
                name: 'Does Tuition Assistance cover online and distance learning programs?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. USMC Tuition Assistance covers tuition at accredited institutions regardless of delivery method, including fully online programs. The school and program must be approved through Marine Online (MOL) before classes begin.' },
              },
            ],
          },
        ]}
      />

      <div className="space-y-4 px-4 py-6 md:px-8 md:py-8">

        {/* ── 1. DEGREE GOAL ── */}
        <DegreeGoalSection
          degreeLevel={degreeLevel}
          setDegreeLevel={setDegreeLevel}
          school={school}
          setSchool={setSchool}
          schoolDetails={schoolDetails}
          setSchoolDetails={setSchoolDetails}
          schoolSuggestions={schoolSuggestions}
          setSchoolSuggestions={setSchoolSuggestions}
          showSchoolSuggestions={showSchoolSuggestions}
          setShowSchoolSuggestions={setShowSchoolSuggestions}
          handleSchoolChange={handleSchoolChange}
          fieldOfStudy={fieldOfStudy}
          setFieldOfStudy={setFieldOfStudy}
          customCredits={customCredits}
          setCustomCredits={setCustomCredits}
          isDesert={isDesert}
          setTerms={setTerms}
        />

        {/* ── 2. CREDITS ALREADY EARNED ── */}
        <CreditsEarnedSection
          jstCredits={jstCredits}
          setJstCredits={setJstCredits}
          transferCredits={transferCredits}
          setTransferCredits={setTransferCredits}
          clepCredits={clepCredits}
          setClepCredits={setClepCredits}
          isDesert={isDesert}
          earnedCredits={earnedCredits}
          requiredCredits={requiredCredits}
          creditsToGo={creditsToGo}
        />

        {/* ── 3. COURSE PLAN ── */}
        <CoursePlanSection
          terms={terms}
          setTerms={setTerms}
          expandedTerms={expandedTerms}
          setExpandedTerms={setExpandedTerms}
          taByFY={taByFY}
          totalUncovered={totalUncovered}
          totalTACost={totalTACost}
          uncoveredCardState={uncoveredCardState}
          isDesert={isDesert}
          plannedCredits={plannedCredits}
          schoolDetails={schoolDetails}
          school={school}
          showBulkCostEditor={showBulkCostEditor}
          setShowBulkCostEditor={setShowBulkCostEditor}
          bulkCostRaw={bulkCostRaw}
          setBulkCostRaw={setBulkCostRaw}
          applyBulkCost={applyBulkCost}
          addTerm={addTerm}
          toggleTerm={toggleTerm}
          removeTerm={removeTerm}
          updateCourse={updateCourse}
          removeCourse={removeCourse}
          addCourse={addCourse}
        />

        {/* ── 4. SUMMARY ── */}
        <SummarySection
          degreeLevel={degreeLevel}
          isDesert={isDesert}
          progressPct={progressPct}
          earnedPct={earnedPct}
          plannedPct={plannedPct}
          earnedCredits={earnedCredits}
          plannedCredits={plannedCredits}
          requiredCredits={requiredCredits}
          creditsToGo={creditsToGo}
          terms={terms}
          termsToFinish={termsToFinish}
          estimatedFinal={estimatedFinal}
          lastTerm={lastTerm}
          gpa={gpa}
          fieldOfStudy={fieldOfStudy}
          school={school}
          totalTuition={totalTuition}
          totalTAFunded={totalTAFunded}
          totalByFunding={totalByFunding}
          resetPlan={resetPlan}
        />

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleExportPdf}
            disabled={isPdfExporting}
            className={`flex w-full cursor-pointer items-center justify-center gap-2 border py-3 text-[11px] font-bold tracking-wider transition-colors sm:w-56 disabled:opacity-50 ${
              isDesert
                ? 'border-red-700 bg-red-700 text-red-50 hover:bg-red-800'
                : 'border-red-600 bg-red-950/40 text-white hover:bg-red-600'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            {isPdfExporting ? 'GENERATING...' : 'EXPORT PDF'}
          </button>
          <button
            onClick={resetPlan}
            className={`w-full cursor-pointer border py-3 text-[11px] font-bold tracking-wider transition-colors sm:w-40 ${
              isDesert
                ? 'border-black/15 text-gray-600 hover:border-red-700/50 hover:text-red-700'
                : 'border-white/10 text-gray-600 hover:border-red-500/40 hover:text-red-500'
            }`}
          >
            RESET PLAN
          </button>
        </div>

        {/* ── FAQ ── */}
        <DegreePlannerFAQ />

        {/* ── Resources ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          className="border border-white/12 bg-black"
        >
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-6 py-4">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-bold tracking-widest text-gray-400">RESOURCES</span>
          </div>
          <div className="divide-y divide-white/[0.06] md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
            {[
              { label: 'TUITION ASSISTANCE', desc: 'Apply for TA — learn eligibility, limits, and how to submit', internal: '/education/tuition-assistance' },
              { label: 'JOINT SERVICES TRANSCRIPT', desc: 'View military education credits and ACE recommendations', href: 'https://jst.doded.mil/jst/' },
              { label: 'GI BILL® BENEFITS', desc: 'Federal education benefits for veterans and service members', href: 'https://www.va.gov/education/about-gi-bill-benefits/' },
              { label: 'CLEP EXAMS — FREE FOR MILITARY', desc: 'Earn up to 30+ credits by passing standardized subject exams', href: 'https://clep.collegeboard.org/clep-for-military' },
            ].map((link, i) => (
              <a
                key={i}
                href={link.href ?? link.internal}
                onClick={link.internal ? e => { e.preventDefault(); navigate(link.internal!); } : undefined}
                target={link.href ? '_blank' : undefined}
                rel={link.href ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-between px-6 py-4 transition-colors group hover:bg-white/[0.03]"
              >
                <div>
                  <div className="text-[12px] font-bold tracking-wider text-gray-300 transition-colors group-hover:text-white">{link.label}</div>
                  <div className="mt-0.5 text-[11px] text-gray-600">{link.desc}</div>
                </div>
                {link.href
                  ? <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-700 transition-colors group-hover:text-red-500" />
                  : <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-700 transition-colors group-hover:text-red-500" />
                }
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </>
  );
}
