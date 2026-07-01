# Feature Backlog & Roadmap

A living doc for tracking in-progress, hidden, and future features. Tell Claude "add this to the list" or "let's work on X from the backlog."

---

## Hidden / Commented-Out Features

Features that exist in the codebase but are currently not exposed in the UI. These can be re-enabled when ready.

### Scenario Planner
- **File:** `src/app/features/career/CareerPathPage.tsx`
- **Status:** Tab hidden from both the compact fullscreen bar and the full tab bar
- **How to re-enable:** Add `['scenario', 'SCENARIOS']` and `['scenario', 'SCENARIO PLANNER']` back into the two tab arrays (both around the `{([...] as [Tab, string][]).map(...)` sections)
- **Component:** `ScenarioPlanner` — already imported and wired; render block `{activeTab === 'scenario' && <ScenarioPlanner ... />}` is still present
- **Notes:** Needs UX design for comparing multiple career path scenarios side by side. The `ScenarioSummary` type and basic component shell exist but are not fully built out.

### What If Analysis
- **File:** `src/app/features/career/CareerPathPage.tsx`
- **Status:** Tab hidden; render block preserved as a placeholder stub
- **How to re-enable:** Add `['whatif', 'WHAT IF']` and `['whatif', 'WHAT IF ANALYSIS']` back into the two tab arrays
- **Notes:** Currently shows a "coming soon" message. Intended for modeling things like "what if I extend my service 2 more years" or "what if I switch MOS" and projecting the financial/career impact.

---

## Stub Pages & Sections (Exist in UI, Content Not Built)

These are pages or UI sections that are already visible to users but show placeholder content or "coming soon" tags. These need real content or feature work before they're useful.

### Stay Marine Page — Full Page Stub
- **File:** `src/app/pages/StayMarinePage.tsx:50`
- **Status:** Entire page body shows `[ STAY MARINE CONTENT COMING SOON ]`
- **Notes:** Intended to cover retention incentives, career continuation programs, SRB/continuation pay info, and reasons to re-enlist. Content + layout both need to be built from scratch.

### Education Page — Career Pathway Steps
- **File:** `src/app/pages/EducationPage.tsx:180`
- **Status:** The "career pathway" timeline block (ENLISTMENT → MILITARY TRAINING → ADVANCED EDUCATION → LEADERSHIP DEVELOPMENT → LIFELONG LEARNING) is rendered but has a "COMING SOON" tag — it's display-only with no interactivity or linked content
- **Notes:** Could become an interactive guide that links to specific resources for each stage.

### Education Page — Top Benefits (Partial)
- **File:** `src/app/pages/EducationPage.tsx:218`
- **Status:** Two items in the TOP EDUCATION BENEFITS list have no link and show "COMING SOON":
  - **Marines University** — "Free online courses and degree programs" (no URL wired yet)
  - **Apprenticeship Programs** — "Earn while you learn in high-demand fields" (no page/link yet)
- **Notes:** Marines University may need an internal page; Apprenticeship Programs needs a destination (internal or external).

### Education Page — Education Tools (Partial)
- **File:** `src/app/pages/EducationPage.tsx:265`
- **Status:** Two items in YOUR EDUCATION TOOLS list have no link and show "COMING SOON":
  - **TA Request (WebTA)** — needs link to the WebTA portal or an internal walkthrough page
  - **Virtual Education Center** — needs a destination (internal page or MCN link)

### Education Page — Upcoming Events Feed
- **File:** `src/app/pages/EducationPage.tsx:405`
- **Status:** The UPCOMING EVENTS section has three hardcoded placeholder events from 2024 — all stale — and a "COMING SOON" tag on the whole section
- **Notes:** Needs either a real data source (API, CMS, or manually maintained list) or a design decision on whether to remove the section entirely.

### Pay & Benefits Page — Featured Benefits (Partial)
- **File:** `src/app/features/pay/PayBenefitsPage.tsx:659`
- **Status:** Two cards in FEATURED BENEFITS have no link and show "COMING SOON":
  - **Health Care** — "Comprehensive medical, dental, and vision coverage." (no page built)
  - **Family Support** — "Programs and services for Marines and their families." (no page built)

### Pay & Benefits Page — Tools & Resources (Partial)
- **File:** `src/app/features/pay/PayBenefitsPage.tsx:709`
- **Status:** Four items in TOOLS & RESOURCES have no link and show "COMING SOON":
  - **SGLI** — "Servicemembers' Group Life Insurance details and coverage."
  - **Thrift Savings Plan** — "Plan for retirement with the TSP and resources."
  - **Financial Counseling** — "Get help from accredited financial counselors."
  - **Money Matters** — "Financial readiness tips and training."
- **Notes:** Some of these could be external links (TSP.gov, SGLI/VGLI VA page); others may warrant internal pages.

### Home Page — Resources List (Partial)
- **File:** `src/app/pages/HomePage.tsx:382`
- **Status:** One item in the RESOURCES panel has no link and shows "COMING SOON":
  - **Contact Your Congressman** — needs a link to a congressional contact finder (e.g., house.gov, senate.gov) or an internal guide

### Reading List — PDF Downloads
- **File:** `src/app/features/reading/ReadingListPage.tsx:170, 292`
- **Status:** All book entries show a "PDF Coming Soon" button — no PDFs are hosted or linked yet
- **Notes:** PDFs would need to be hosted (likely in `public/`) or linked to external sources. Worth deciding which books we actually want to provide vs. link out to.

---

## Future Ideas & Features

Features that have been discussed but not yet built. Rough ideas welcome — we can flesh them out when we're ready to build.

### Career Path Page

- **Officer Rank SVGs** — Currently the `RankInsignia` component falls back to a text badge for officer and warrant grades. Add SVG files for O-1 through O-10 and W-1 through W-5 and wire them into the same `getRankInsigniaPath` helper.
- **SEAC Rank Variant** — E-9 SEAC (Sergeant Major of the Marine Corps) is in `getRankInsigniaPath` but no entry in `rankData.ts`. Add it to `USMC_RANKS` so it shows up as a selectable rank in the Edit Profile modal.
- **Projected Promotion Wizard** — When adding a projected promotion, suggest a realistic date range based on typical TIS/TIG for that grade.
- **Timeline Export / Print View** — Generate a clean PDF or image snapshot of the current timeline for sharing or printing.
- **Multiple Marines / Household View** — Allow a second profile (e.g., dual-military spouse) so both career timelines can be overlaid on the same grid.

### Pay & Benefits

- **Health Care Page** — Build out the Health Care section covering TRICARE plans, dental (TRDP), vision, and mental health resources. Addresses the stub in Featured Benefits.
- **Family Support Page** — Build out the Family Support section: MCFTB, EFMP, CACO resources, family readiness. Addresses the stub in Featured Benefits.
- **SGLI / VGLI Info Page** — Life insurance coverage overview, beneficiary info, and link to VA SGLI portal. Addresses the Tools & Resources stub.
- **TSP Resources Page** — TSP contribution rates, BRS matching rules, fund options overview, and link to TSP.gov. Addresses the Tools & Resources stub.
- **Financial Counseling Page** — PFMP/PFEC counseling info, local resource finder, and links to accredited counselors. Addresses the Tools & Resources stub.
- **Money Matters Page** — Financial readiness tips, budgeting guides, debt management. Addresses the Tools & Resources stub.
- **BAH Page Enhancements** — Add a rate-over-time comparison so Marines can see how BAH for a given location has changed year over year.
- **Special Pay Calculator** — Surface special pays (sea pay, hazardous duty, jump pay, etc.) as toggles that add to the monthly total shown in the Pay Overview panel.
- **TSP Projection Tool** — Input current TSP balance and contribution rate, project value at retirement using blended retirement system match rules.
- **SBP Estimator** — Survivor Benefit Plan cost/benefit breakdown tool on the retirement section.
- **Pay Raise Tracker** — Show historical COLA/pay raise percentages and project future raises against the current pay grade.

### Education

- **Marines University Page** — Internal page covering MarinesU free courses, enrolled resources, and registration. Addresses the Education Page stub.
- **Apprenticeship Programs Page** — Overview of DOD SkillBridge and USMC apprenticeship options with links. Addresses the Education Page stub.
- **WebTA Walkthrough** — Step-by-step guide for submitting a TA request through WebTA, or direct link to the portal. Addresses the Education Page stub.
- **Virtual Education Center Page** — Info on VEC services, how to contact an education counselor, and links to MCN. Addresses the Education Page stub.
- **Education Events Feed** — Replace the hardcoded 2024 placeholder events with a real or manually maintained upcoming events list. Addresses the stale events section.
- **Tuition Assistance Tracker** — A per-fiscal-year TA budget tracker showing how much has been used vs. remaining ($4,500 cap), tied to the education timeline events.
- **MyCAA Integration Info** — Surface MyCAA eligibility and benefit info for military spouses.
- **CLEP / DSST Credit Estimator** — List exams relevant to a selected degree plan and estimate credit hours they could replace.

### Stay Marine

- **Stay Marine Page** — Full page build-out: retention incentives, SRB/continuation pay, career continuation programs, re-enlistment eligibility guide, and success stories. Addresses the full-page stub.

### Reading List

- **Book PDFs / Links** — Decide which books in the reading list get hosted PDFs (in `public/`) vs. links to Project Gutenberg, Amazon, or official sources. Addresses the "PDF Coming Soon" buttons site-wide.

### Home Page

- **Contact Your Congressman Link** — Wire the "CONTACT YOUR CONGRESSMAN" resource item to house.gov or a congressional contact tool. Quick win — one line of code once we pick the destination.

### Lateral Move Tool

- **Favorites / Saved Searches** — Let users bookmark MOS results they want to revisit.
- **MOS Comparison View** — Side-by-side comparison of two or more MOSs across key dimensions (promotion rate, deployment tempo, schools required).
- **Civilian Career Crosswalk** — Map each MOS to O*NET civilian occupation codes and show median salary, growth outlook, etc.

### Site-Wide / UX

- **Dark / Light / Desert Theme Polish** — Audit all pages for theme consistency; some newer components (RankInsignia fallback, modals) may not fully respect the desert theme.
- **Mobile Responsive Pass** — The timeline is desktop-first; a simplified mobile view (month view only, collapsed sections) would improve usability on phones.
- **Global Search** — A command-palette style search (⌘K) that can jump to any page, open any tool, or search MOS codes.
- **Notifications / Reminders** — Browser push notifications for upcoming pay increases, EAS countdown, anniversary milestones on the timeline.
- **Onboarding Flow** — First-visit guided setup that walks through creating a profile, adding a duty station, and understanding the timeline.
