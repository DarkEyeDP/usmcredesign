import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronRight, ChevronDown, ExternalLink, Clock, AlertTriangle, CheckCircle2, FileText, GraduationCap } from 'lucide-react';

const tabs = ['OVERVIEW', 'ELIGIBILITY', 'HOW TO APPLY', 'GRADE REQUIREMENTS', 'RECOUPMENT'];

const taBasics = [
  { label: 'Annual Limit', value: '$4,500', sub: 'Per fiscal year (Oct 1 – Sep 30)' },
  { label: 'Max Per Credit Hour', value: '$250', sub: 'Semester hour · $166.67 QH · $16.67 CH' },
  { label: 'Max Concurrent Classes', value: '2', sub: 'TA-funded courses at any one time' },
  { label: 'Undergrad Credit Cap', value: '138 SH', sub: 'Lifetime maximum semester hours' },
  { label: 'Graduate Credit Cap', value: '45 SH', sub: 'Lifetime maximum semester hours' },
  { label: 'Application Window', value: '60 Days', sub: 'Submit no more than 60 days before class start' },
];

const eligibilityFirstTime = [
  'Complete the TA Orientation Brief with installation VolEd personnel',
  'Complete Personal Financial Management (PFM) training through PRS',
  'Meet at least one academic readiness criteria (see below)',
];

const academicReadiness = [
  { label: 'AFQT Score', value: '50 or higher' },
  { label: 'GT Score (ASVAB)', value: '100 or higher' },
  { label: 'Prior College Credit', value: '10 SH with no grade below C' },
  { label: 'ASP', value: 'Completed Academic Skills Program (classroom)' },
  { label: 'OASC', value: 'Completed Online Academic Skills Course' },
  { label: 'TABE', value: 'Minimum score of 11' },
];

const eligibilityAll = [
  'Must be Active Duty, AR, EAD, or Mobilized Reserve',
  'Must be eligible for promotion per MCO P1400.32D / P1400.31C',
  'Must have time-in-service (T-I-S) beyond the academic term end date',
  'Must not be attending PME, MOS school, or SkillBridge',
  'Command approval required — UEO/CAO must approve before the class starts',
  'No outstanding TA issues in your NCMIS account (unresolved grades, reimbursements, waivers)',
];

const tiRequirements = [
  { rank: 'Enlisted', requirement: '60 days beyond the course end date' },
  { rank: 'Commissioned Officers', requirement: '24 months beyond the course end date' },
  { rank: 'WO / CWO / LDO (no bachelor\'s)', requirement: '60 days beyond the course end date' },
  { rank: 'WO / CWO / LDO (with bachelor\'s)', requirement: '24 months beyond the course end date' },
  { rank: 'Reserve Officers on Active Duty', requirement: '24 months (AR service counts toward requirement)' },
];

const applySteps = [
  {
    num: '01',
    title: 'QUALIFY & ORIENT',
    desc: 'First-time users must attend the TA Orientation Brief at your installation VolEd / Education Center and complete PFM training.',
  },
  {
    num: '02',
    title: 'CHOOSE YOUR SCHOOL & PROGRAM',
    desc: 'Confirm your school has a DoD Memorandum of Understanding. Search the participating institutions list at dhra.appianportalsgov.com/DoD-MOU/page/institutions. TA only covers accredited, credit-bearing courses.',
  },
  {
    num: '03',
    title: 'ENROLL IN YOUR CLASS',
    desc: 'Enroll with your institution. Gather the course number, title, credit hours, tuition cost, and exact start/end dates.',
  },
  {
    num: '04',
    title: 'SUBMIT YOUR TA REQUEST',
    desc: 'Log in to MyEducation at myeducation.netc.navy.mil. Submit one TA request per course — no more than 60 days before class start.',
  },
  {
    num: '05',
    title: 'COMMAND APPROVAL',
    desc: 'Your CAO/UEO must approve the request at least 48 hours before the class start date. No approval = no TA.',
  },
  {
    num: '06',
    title: 'RECEIVE YOUR VOUCHER',
    desc: 'Once authorized, download your TA voucher from MyEducation and provide it to the school.',
  },
  {
    num: '07',
    title: 'PASS YOUR COURSES',
    desc: 'Attend class, complete assignments, and earn the required grades. Report grades to NETPDC within 30 days of term end.',
  },
];

const gradeRequirements = [
  { level: 'Undergraduate (AA / BA)', passing: 'C or higher', warning: 'D or F — must reimburse TA' },
  { level: 'Graduate (Master\'s)', passing: 'B or higher', warning: 'C, D, or F — must reimburse TA' },
  { level: 'Pass/Fail Courses', passing: 'Pass', warning: 'Fail — must reimburse TA' },
];

const recoupmentTriggers = [
  'Grade of D or F in any TA-funded course',
  'Grade of C in a graduate-level TA-funded course',
  'Voluntary withdrawal (W grade) from a TA-funded course',
  'Unresolved Incomplete ("I") grade after 6 months',
  'Failure to meet time-in-service requirement after course ends',
];

const faqs = [
  {
    q: 'Can I use TA for graduate school?',
    a: 'Yes. TA covers graduate courses up to the master\'s degree level, with a lifetime cap of 45 semester hours. Marines must have already earned (or be working toward) a bachelor\'s degree. TA is not authorized for doctoral programs.',
  },
  {
    q: 'Can I stack TA with the GI Bill?',
    a: 'TA and the GI Bill can be used together, but not for the same tuition charges. Typically, TA covers tuition first, and any remaining costs may be addressed through other education benefits.',
  },
  {
    q: 'What happens if my course gets cancelled or dates change?',
    a: 'Contact your installation VolEd personnel immediately. Changes to course dates must be made before the school\'s Drop/Add period ends. If both start and end dates change, the original voucher must be cancelled and a new TA request submitted.',
  },
  {
    q: 'I received an Incomplete — what do I do?',
    a: 'You have up to 6 months from the term end date to convert the "I" grade to a passing grade (the school\'s deadline takes precedence if shorter). You cannot submit any new TA requests until the Incomplete is resolved.',
  },
  {
    q: 'How many courses can I take at once?',
    a: 'Marines may not have more than two TA-funded classes active at any given time. First-time users are limited to one course, unless they document at least 31 SH of prior college credit with a 2.5+ GPA.',
  },
  {
    q: 'Do officers have different requirements?',
    a: 'For first-time use, officers are only required to complete the TA Orientation Brief, be on active duty, and have sufficient time in service for their payback obligation (24 months beyond the course end date). The AFQT/GT/credit criteria apply only to enlisted Marines.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/12 bg-black">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between bg-white/[0.04] px-6 py-4 text-left hover:bg-white/[0.07] transition-colors"
      >
        <span className="text-[13px] font-bold text-gray-200 tracking-wide pr-4">{q}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p className="px-6 py-4 text-[14px] text-gray-400 leading-relaxed border-t border-white/10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TuitionAssistancePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      {/* Hero */}
      <div className="relative pt-20 overflow-hidden border-b border-white/12">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.96) 0%, rgba(5,8,15,0.9) 50%, rgba(10,8,5,0.85) 100%)',
          backgroundColor: '#050508',
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
          <div className="absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right hidden lg:block">
            <div className="text-[12px] font-black text-white tracking-widest">INVEST IN YOURSELF<span className="text-red-600">.</span></div>
            <div className="text-[12px] font-black text-white tracking-widest mb-2">INVEST IN THE MISSION<span className="text-red-600">.</span></div>
            <div className="w-6 h-px bg-red-600 ml-auto mb-2" />
            <div className="text-[11px] text-gray-500 tracking-wider">UP TO $4,500 PER FISCAL YEAR<span className="text-red-600">.</span></div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
              <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => navigate('/education')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">EDUCATION</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-red-500">TUITION ASSISTANCE</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[clamp(2.75rem,5vw,4.75rem)] font-black text-white tracking-tighter leading-none mb-2"
            >
              TUITION ASSISTANCE
            </motion.h1>
            <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3">
              Active-duty Marines can receive up to $4,500 per fiscal year in tuition assistance for college courses — taken during off-duty time, at no cost to your military career.
            </p>
            <a
              href="https://myeducation.netc.navy.mil/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] text-red-500 font-bold tracking-widest hover:text-red-400 transition-colors"
            >
              SUBMIT A TA REQUEST (MYEDUCATION) <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center px-8 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-[12px] font-bold tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" layoutId="taTabLine" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'OVERVIEW' && (
        <div>
          {/* Stat grid — full width */}
          <div className="px-8 py-8 border-b border-white/12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-red-600" />
              <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">TA AT A GLANCE</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {taBasics.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-white/12 bg-black p-4 hover:border-white/25 transition-colors"
                >
                  <div className="text-[clamp(1.4rem,3vw,2rem)] font-black text-white tracking-tighter leading-none mb-1">{item.value}</div>
                  <div className="text-[12px] font-bold text-red-500 tracking-widest mb-1">{item.label}</div>
                  <div className="text-[11px] text-gray-600 leading-relaxed">{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Two-column body: main content left, quick links right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 px-8 py-8">

            {/* ── Left: main content ── */}
            <div className="lg:col-span-2 lg:pr-10 lg:border-r border-white/12 space-y-10 pb-10 lg:pb-0">

              {/* About TA */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">ABOUT TUITION ASSISTANCE</div>
                </div>
                <div className="space-y-4 text-[14px] text-gray-400 leading-relaxed">
                  <p>
                    The Marine Corps Tuition Assistance (TA) program encourages active-duty Marines to voluntarily pursue post-secondary education during off-duty hours. TA covers up to 100% of tuition charges — including lab, technology, and distance learning fees — up to the funding caps listed above.
                  </p>
                  <p>
                    TA is available for undergraduate and graduate courses at accredited institutions with a signed DoD Memorandum of Understanding. It can be applied toward certificates, associate's, bachelor's, or master's degrees — one level at a time.
                  </p>
                  <p>
                    The fiscal year runs <strong className="text-white">October 1 through September 30</strong>. Any unused TA does not roll over. Note: TA authorizations are suspended from <strong className="text-white">September 15–30</strong> each year for end-of-year closeout.
                  </p>
                  <p>
                    Marines are responsible for all non-tuition costs including books, supplies, room and board, transportation, and registration fees.
                  </p>
                </div>
              </div>

              {/* Degree-level progression */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">DEGREE LEVEL PROGRESSION</div>
                </div>
                <p className="text-[14px] text-gray-400 leading-relaxed mb-5">
                  TA is authorized for one degree at the next level above what you currently hold. You cannot use TA to earn a second degree at the same level you already hold (exceptions apply for MCU graduates).
                </p>
                <div className="flex flex-wrap items-center gap-0">
                  {['CERTIFICATE', "ASSOCIATE'S", "BACHELOR'S", "MASTER'S"].map((level, i, arr) => (
                    <div key={i} className="flex items-center">
                      <div className="border border-white/16 bg-black px-4 py-2.5 text-[12px] font-bold tracking-widest text-gray-300">{level}</div>
                      {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-red-600 mx-1" />}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 mt-3">
                  TA is not authorized beyond the master's degree level. MCU Military Studies master's graduates may use TA toward one additional master's degree only.
                </p>
              </div>

              {/* FAQ */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">FREQUENTLY ASKED QUESTIONS</div>
                </div>
                <div className="space-y-2">
                  {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
                </div>
              </div>
            </div>

            {/* ── Right: quick links sidebar ── */}
            <div className="lg:pl-10 pt-10 lg:pt-0">
              <div className="lg:sticky lg:top-8 space-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">QUICK LINKS</div>
                </div>
                {([
                  { label: 'MyEducation (WebTA)', sub: 'Submit and manage TA requests', href: 'https://myeducation.netc.navy.mil/' },
                  { label: 'CDET Regional Campuses', sub: 'Find your nearest education campus by installation', href: 'https://www.usmcu.edu/Colleges-and-Schools/College-of-Distance-Education-and-Training/Regional-Campuses/' },
                  { label: 'DoD MOU School List', sub: 'Verify your school is TA-authorized', href: 'https://dhra.appianportalsgov.com/DoD-MOU/page/institutions' },
                  { label: 'Joint Services Transcript (JST)', sub: 'Official military education transcript', href: 'https://jst.doded.mil/official.html' },
                  { label: 'Marine Corps COOL', sub: 'Credentialing opportunities on-line', href: 'https://www.cool.osd.mil/usmc/index.html' },
                ] as { label: string; sub: string; href: string }[]).map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3.5 border-b border-white/10 last:border-0 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 border border-red-600/50 bg-red-950/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-red-500/60 transition-colors">
                        <span className="text-[11px] font-black text-red-500">{i + 1}</span>
                      </div>
                      <div>
                        <div className="text-[13px] text-gray-200 group-hover:text-white transition-colors font-medium">{link.label}</div>
                        <div className="text-xs text-gray-600">{link.sub}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-red-500 transition-colors flex-shrink-0" />
                  </a>
                ))}

                {/* Apply CTA */}
                <div className="pt-6">
                  <div className="border border-red-600/25 bg-red-950/10 px-5 py-5">
                    <div className="text-[13px] font-bold text-gray-300 tracking-widest mb-2">READY TO APPLY?</div>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                      Log in to MyEducation to create and submit your TA request online.
                    </p>
                    <a
                      href="https://myeducation.netc.navy.mil/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-[11px] font-bold tracking-widest hover:bg-red-700 transition-colors w-full justify-center"
                    >
                      GO TO MYEDUCATION <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── ELIGIBILITY ── */}
      {activeTab === 'ELIGIBILITY' && (
        <div>

          {/* Row 1: All Marines requirements — full width */}
          <div className="px-8 py-8 border-b border-white/12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-red-600" />
              <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">ELIGIBILITY — ALL MARINES</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {eligibilityAll.map((item, i) => (
                <div key={i} className="flex items-start gap-3 border border-white/12 bg-black px-4 py-4 hover:border-white/25 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-red-500/70 flex-shrink-0 mt-0.5" />
                  <span className="text-[13px] text-gray-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Two columns — First-time left, T-I-S right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-white/12">

            {/* First-time users */}
            <div className="px-8 py-8 lg:border-r border-white/12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 bg-red-600" />
                <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">FIRST-TIME USER REQUIREMENTS</div>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
                All three must be completed before your first TA request can be approved.
              </p>
              <div className="space-y-2 mb-8">
                {eligibilityFirstTime.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 border border-white/12 bg-black px-4 py-4 hover:border-white/25 transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 border border-red-600/50 bg-red-950/20 flex items-center justify-center mt-0.5">
                      <span className="text-[11px] font-black text-red-500">{i + 1}</span>
                    </div>
                    <span className="text-[13px] text-gray-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 bg-red-600" />
                <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">ACADEMIC READINESS — MEET AT LEAST ONE</div>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-4 mt-2">
                Enlisted only. Officers are exempt from this requirement.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {academicReadiness.map((item, i) => (
                  <div key={i} className="border border-white/10 bg-black px-3 py-3 hover:border-white/20 transition-colors">
                    <div className="text-[10px] font-bold text-gray-500 tracking-[0.15em] mb-1">{item.label}</div>
                    <div className="text-[13px] text-gray-200 leading-snug">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                If none are met, the ESO may authorize one course per term until 10 SH are completed with no grade below C.
              </p>
            </div>

            {/* T-I-S Requirements */}
            <div className="px-8 py-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 bg-red-600" />
                <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">TIME-IN-SERVICE REQUIREMENTS</div>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-5 mt-2">
                You must have sufficient service time beyond the course end date. Failure to meet this results in pro-rated TA reimbursement.
              </p>
              <div className="border border-white/12">
                <div className="grid grid-cols-2 bg-white/[0.04] border-b border-white/10 px-4 py-3">
                  <div className="text-[12px] font-bold text-gray-400 tracking-[0.2em]">RANK / CATEGORY</div>
                  <div className="text-[12px] font-bold text-gray-400 tracking-[0.2em]">OBLIGATION</div>
                </div>
                {tiRequirements.map((item, i) => (
                  <div key={i} className={`grid grid-cols-2 gap-3 px-4 py-4 hover:bg-white/[0.02] transition-colors ${i < tiRequirements.length - 1 ? 'border-b border-white/10' : ''}`}>
                    <div className="text-[13px] font-bold text-gray-200 leading-snug">{item.rank}</div>
                    <div className="text-[13px] text-gray-400 leading-snug">{item.requirement}</div>
                  </div>
                ))}
              </div>

              {/* One-course restriction — fits naturally below T-I-S */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-5 bg-amber-500" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">ONE-COURSE RESTRICTION</div>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4 mt-2">
                  TA is limited to one course the following term if any of these occurred in the previous TA term:
                </p>
                <div className="space-y-1.5">
                  {[
                    'Undergraduate cumulative GPA fell between 2.0 and 2.49',
                    'Graduate cumulative GPA fell below 3.0',
                    'A grade of D or F was received in any course',
                    'A grade of C was received in a graduate course',
                    'A voluntary or involuntary withdrawal occurred from any course',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-amber-950/10 border border-amber-500/15 px-4 py-3 hover:border-amber-500/30 transition-colors">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500/60 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-gray-400 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HOW TO APPLY ── */}
      {activeTab === 'HOW TO APPLY' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">

            {/* Steps — left 2/3 */}
            <div className="lg:col-span-2 px-8 py-8 lg:border-r border-white/12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 bg-red-600" />
                <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">APPLICATION PROCESS</div>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-2 mb-6">
                Follow these steps in order. Missing a step — especially command approval — will result in your TA request being denied with no exceptions.
              </p>
              <div className="space-y-3">
                {applySteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 border border-white/12 bg-black px-5 py-4 hover:border-white/25 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 border border-red-600/50 bg-red-950/20 flex items-center justify-center mt-0.5">
                      <span className="text-[11px] font-black text-red-500">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-white tracking-widest mb-1">{step.title}</div>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right sidebar — deadlines + CTA */}
            <div className="px-8 py-8 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">CRITICAL DEADLINES</div>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: Clock, label: 'Submit Request', value: 'No more than 60 days before class start', accent: 'border-white/12' },
                    { icon: Clock, label: 'Command Approval', value: 'At least 48 hours before class start', accent: 'border-white/12' },
                    { icon: AlertTriangle, label: 'FY Blackout Period', value: 'No processing Sep 15–30 (year-end closeout)', accent: 'border-amber-500/20' },
                    { icon: FileText, label: 'Grade Submission', value: 'Grades due to NETPDC within 30 days of term end', accent: 'border-white/12' },
                  ].map((item, i) => (
                    <div key={i} className={`border ${item.accent} bg-black px-4 py-4 flex items-start gap-3 hover:bg-white/[0.03] transition-colors`}>
                      <item.icon className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12px] font-bold text-gray-500 tracking-[0.2em] mb-0.5">{item.label}</div>
                        <div className="text-[13px] text-gray-200 leading-snug">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-red-600/25 bg-red-950/10 px-5 py-5">
                <div className="text-[13px] font-bold text-gray-300 tracking-widest mb-2">READY TO APPLY?</div>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                  Log in to MyEducation to submit your TA request. Have your school code, course number, credit hours, tuition cost, and exact start/end dates ready.
                </p>
                <a
                  href="https://myeducation.netc.navy.mil/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-[11px] font-bold tracking-widest hover:bg-red-700 transition-colors w-full justify-center"
                >
                  GO TO MYEDUCATION <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GRADE REQUIREMENTS ── */}
      {activeTab === 'GRADE REQUIREMENTS' && (
        <div>
          {/* Passing grade table — full width */}
          <div className="px-8 py-8 border-b border-white/12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-5 bg-red-600" />
              <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">PASSING GRADE STANDARDS</div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-6 mt-2">
              TA funds are only earned when you successfully complete a course. Failing to meet these standards requires reimbursement of the full TA amount paid.
            </p>
            <div className="border border-white/12">
              <div className="grid grid-cols-3 bg-white/[0.04] border-b border-white/10 px-6 py-3">
                <div className="text-[12px] font-bold text-gray-400 tracking-[0.2em]">COURSE LEVEL</div>
                <div className="text-[12px] font-bold text-gray-400 tracking-[0.2em]">PASSING GRADE</div>
                <div className="text-[12px] font-bold text-gray-400 tracking-[0.2em]">RECOUPMENT TRIGGER</div>
              </div>
              {gradeRequirements.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 px-6 py-4 hover:bg-white/[0.02] transition-colors ${i < gradeRequirements.length - 1 ? 'border-b border-white/10' : ''}`}>
                  <div className="text-[13px] text-gray-200 font-medium">{row.level}</div>
                  <div className="text-[13px] text-green-400 font-bold">{row.passing}</div>
                  <div className="text-[13px] text-amber-400/80">{row.warning}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Two columns: GPA Impact + Incomplete */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* GPA Impact */}
            <div className="px-8 py-8 lg:border-r border-white/12 border-b lg:border-b-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-red-600" />
                <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">CUMULATIVE GPA IMPACT</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-white/12 bg-black p-5 hover:border-white/25 transition-colors">
                  <div className="text-[12px] font-bold text-gray-400 tracking-[0.2em] mb-3 pb-2 border-b border-white/10">UNDERGRADUATE</div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12px] font-bold text-green-400">GPA 2.5+</div>
                        <div className="text-[12px] text-gray-500">Full TA access (up to 2 courses)</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12px] font-bold text-amber-400/80">GPA 2.0–2.49</div>
                        <div className="text-[12px] text-gray-500">Limited to 1 course next term</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12px] font-bold text-red-400">GPA below 2.0</div>
                        <div className="text-[12px] text-gray-500">TA suspended</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-white/12 bg-black p-5 hover:border-white/25 transition-colors">
                  <div className="text-[12px] font-bold text-gray-400 tracking-[0.2em] mb-3 pb-2 border-b border-white/10">GRADUATE</div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12px] font-bold text-green-400">GPA 3.0+</div>
                        <div className="text-[12px] text-gray-500">Full TA access (up to 2 courses)</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[12px] font-bold text-red-400">GPA below 3.0</div>
                        <div className="text-[12px] text-gray-500">Limited to 1 course next term</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Incomplete grades */}
            <div className="px-8 py-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-amber-500" />
                <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">INCOMPLETE GRADES ("I")</div>
              </div>
              <div className="border border-amber-500/20 bg-amber-950/10 px-5 py-5 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-3 text-[13px] text-gray-400 leading-relaxed">
                    <p>You have <strong className="text-amber-400">up to 6 months</strong> from the term end date to convert an "I" grade to a passing grade. The school's deadline takes precedence if it is shorter.</p>
                    <p>You <strong className="text-white">cannot submit any new TA requests</strong> until the Incomplete is fully resolved — no exceptions.</p>
                  </div>
                </div>
              </div>
              <div className="border border-white/12 bg-black px-5 py-4 space-y-2">
                <div className="text-[12px] font-bold text-gray-500 tracking-[0.2em] mb-3">GRADE REPORTING RESPONSIBILITY</div>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  Grades must be submitted to NETPDC within <strong className="text-white">30 days</strong> after the course end date. Although the DoD MOU institution is responsible for reporting, the ultimate responsibility rests with the Marine.
                </p>
                <p className="text-[13px] text-gray-400 leading-relaxed pt-1">
                  If grades are not received, NETPDC will issue an indebtedness notice. A DD Form 139 pay checkage is initiated if no response is received within 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECOUPMENT ── */}
      {activeTab === 'RECOUPMENT' && (
        <div>
          {/* Two-column body */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">

            {/* Left 2/3: triggers + waiver process */}
            <div className="lg:col-span-2 px-8 py-8 lg:border-r border-white/12 space-y-8">

              {/* Triggers */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">WHEN TA MUST BE REPAID</div>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4 mt-2">
                  NETPDC initiates recoupment any time the following occur for a TA-funded course. Failure to respond within 30 days triggers a DD Form 139 pay checkage.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recoupmentTriggers.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 border border-red-900/30 bg-red-950/10 px-4 py-3 hover:border-red-700/40 transition-colors">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500/70 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-gray-300 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waiver process */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">WAIVERS — INVOLUNTARY WITHDRAWALS</div>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4 mt-2">
                  If a withdrawal was caused by circumstances beyond your control — deployment, PCS orders, medical emergency, or other qualifying events — you may request a recoupment waiver.
                </p>
                <div className="border border-white/12 bg-black">
                  <div className="bg-white/[0.04] border-b border-white/10 px-5 py-3">
                    <span className="text-[12px] font-bold text-gray-500 tracking-widest">WAIVER REQUEST PROCESS</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {[
                      'Do NOT submit the waiver directly to NETPDC — it must go through your installation ESO.',
                      'The waiver must be signed by the Commanding Officer (CO) or UEO.',
                      'Include supporting documentation: TAD/PCS orders, medical records, or a descriptive narrative explaining the circumstances.',
                      'The ESO reviews the request and, if justified, forwards it to NETPDC with a supporting statement.',
                      'All waiver information is obtained from your installation VolEd Center.',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 border border-red-600/50 bg-red-950/20 flex items-center justify-center mt-0.5">
                          <span className="text-[11px] font-black text-red-500">{i + 1}</span>
                        </div>
                        <span className="text-[13px] text-gray-400 leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1/3: T-I-S + contact */}
            <div className="px-8 py-8 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-red-600" />
                  <div className="text-[13px] text-gray-300 font-bold tracking-[0.2em]">T-I-S RECOUPMENT</div>
                </div>
                <div className="border border-white/12 bg-black px-5 py-5 space-y-3 hover:border-white/20 transition-colors">
                  <p className="text-[13px] text-gray-400 leading-relaxed">
                    If you separate before meeting your T-I-S obligation, you must reimburse TA at the pro-rated percentage equal to the unmet portion of your obligation.
                  </p>
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      Do <strong className="text-white">not</strong> contact your installation VolEd Center for T-I-S reimbursement payments — contact NETPDC directly. Your installation ESO can provide NETPDC contact information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-white/12 bg-black px-5 py-5 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[13px] font-bold text-gray-300 tracking-widest mb-2">QUESTIONS ABOUT RECOUPMENT?</div>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      Contact your installation Education Services Officer (ESO) or VolEd Center for guidance on reimbursement procedures, waiver eligibility, and your NCMIS account status.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-white/12 bg-black px-5 py-5 hover:border-white/20 transition-colors">
                <div className="text-[12px] font-bold text-gray-500 tracking-[0.2em] mb-3">RECOUPMENT TIMELINE</div>
                <div className="space-y-3">
                  {[
                    { label: 'Grade Deadline', value: '30 days after term end' },
                    { label: 'Indebtedness Notice', value: 'Issued if grade not received' },
                    { label: 'DD Form 139', value: '30 days after notice if no response' },
                    { label: 'Incomplete Resolution', value: 'Up to 6 months from term end' },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between gap-3 ${i < 3 ? 'pb-3 border-b border-white/10' : ''}`}>
                      <span className="text-[12px] text-gray-500">{row.label}</span>
                      <span className="text-[12px] text-gray-200 font-medium text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
