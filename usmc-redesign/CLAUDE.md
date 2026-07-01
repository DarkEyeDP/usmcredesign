# USMC Redesign — Project Rules for AI Assistants

## Routing — Every new page needs a URL

This is a React SPA using **react-router v7** (`BrowserRouter` + `Routes`/`Route`).

**When adding a new page, you must do all four of these:**

1. Create the page component in the appropriate folder (see File Structure below)
2. Add a `<Route path="/your-route" element={<YourPage />} />` inside the `<Routes>` block in `src/app/App.tsx`
3. Add a nav item with the matching `path` to the appropriate list (`loggedOutItems` and/or `loggedInItems`) in `src/app/components/layout/Navigation.tsx`
4. Use `useNavigate` from `react-router` for any programmatic navigation — never manage current page via `useState`

**Current route map:**

| Page | Path | Component | Location |
|------|------|-----------|----------|
| Home | `/` | `HomePage` | `pages/` |
| Messages / MARADMIN | `/messages` | `MARADMINPage` | `features/maradmin/` |
| Pay & Benefits | `/pay-benefits` | `PayBenefitsPage` | `features/pay/` |
| Basic Pay | `/pay-benefits/basic-pay` | `BasicPayPage` | `features/pay/` |
| BAH Calculator | `/pay-benefits/bah` | `BAHCalculatorPage` | `features/pay/` |
| Bonuses | `/pay-benefits/bonuses` | `BonusesPage` | `features/pay/` |
| Education (layout) | `/education/*` | `EducationLayout` | `features/education/` |
| Education Overview | `/education` | `EducationPage` | `pages/` |
| Tuition Assistance | `/education/tuition-assistance` | `TuitionAssistancePage` | `features/education/` |
| Degree Planner | `/education/degree-planner` | `DegreePlannerPage` | `features/education/` |
| College & University | `/education/college-university` | `CollegeUniversityPage` | `features/education/` |
| Reading List | `/reading-list` | `ReadingListPage` | `features/reading/` |
| Lateral Move | `/lateral-move` | `LateralMovePage` | `features/latmove/` |
| Stay Marine | `/stay-marine` | `StayMarinePage` | `pages/` |
| News | `/news` | `NewsPage` | `features/news/` |
| News Article | `/news/:articleSlug` | `NewsArticlePage` | `features/news/` |

**Education routes use a nested layout:** All `/education/*` routes share `EducationLayout` as a parent `<Route>` (with `<Outlet />`). The layout renders a persistent hero with animated title/subtitle, breadcrumbs, and a tab bar. Child pages render inside the `<Outlet>` — they do not render their own hero. When adding a new education sub-tab, add its route meta to `ROUTE_META` in `EducationLayout.tsx`, add it to `TABS`/`TAB_ROUTES`, and add the `<Route>` as a child of the education `<Route>` in `App.tsx`.

**Production note:** The host server must redirect all requests to `index.html` (standard SPA fallback). Vite dev server handles this automatically.

---

## File Structure

```
src/
  main.tsx
  app/
    App.tsx                          — route definitions, top-level layout
    pages/                           — standalone pages (no large feature data layer)
      HomePage.tsx
      EducationPage.tsx
      StayMarinePage.tsx
    features/                        — self-contained feature modules
      hero/                          — HomePage hero slideshow + video player
        types.ts                     — HeroSlide, HeroVideo interfaces
        heroSlides.ts                — SLIDES array + image imports (add new slides here)
        heroVideos.ts                — VIDEOS array + helpers (add new videos here)
        GridPulses.tsx               — animated grid streak component
        GridNodes.tsx                — animated intersection node component
        VideoPlayer.tsx              — YouTube player modal component
        HeroSection.tsx              — assembles the full hero section
        index.ts                     — re-exports HeroSection
      education/                     — Education section (nested layout + sub-pages)
        EducationLayout.tsx          — shared hero + tab bar + <Outlet> for all /education/* routes
        DegreePlannerPage.tsx        — degree planner orchestrator
        CollegeUniversityPage.tsx    — school search orchestrator
        TuitionAssistancePage.tsx    — TA overview page
        degree-planner/              — degree planner data layer + components
        college-university/          — school search data layer + components
      latmove/                       — Lateral Move tool
        LateralMovePage.tsx
        components/                  — latmove-specific UI components
        db/                          — in-memory data + DAL (queries.ts)
        matching.ts, types.ts, index.ts
      maradmin/                      — MARADMIN browser
        MARADMINPage.tsx
        maradmin*.ts                 — parsers, storage, search, utils, pdf
      pay/                           — Pay & Bonuses feature
        PayBenefitsPage.tsx
        BasicPayPage.tsx
        BonusesPage.tsx
        BAHCalculatorPage.tsx        — BAH calculator
        srbpCalculator.ts            — FY27 SRBP calculation logic
        srbpData.ts                  — SRBP bonus tables + kicker eligibility data
        payTables2026.ts             — 2026 basic pay tables
        payOverviewStorage.ts        — localStorage helpers
    components/
      layout/                        — app shell (Header, Navigation, SiteLogo, StatusBar)
      tactical/                      — USMC-flavored decorative components (GridOverlay, RadarSweep, etc.)
      ui/                            — shadcn/ui primitives (do not edit directly)
    assets/
      spear-tip.svg
  styles/
    globals.css                      — animations, scrollbar, cursor, iOS zoom fix, print
    theme.css                        — shadcn tokens + USMC design system tokens
    tailwind.css, fonts.css, index.css
```

**Path aliases** (configured in `vite.config.ts`):

| Import prefix | Resolves to |
|---------------|-------------|
| `@/app/pages/...` | `src/app/pages/` |
| `@/app/features/...` | `src/app/features/` |
| `@/app/components/...` | `src/app/components/` |
| `@/app/assets/...` | `src/app/assets/` |
| `@/styles/...` | `src/styles/` |

> **Note:** The root `@` alias maps to `src/`, so `@/app/features/foo` is the correct form. The shorthand aliases `@/features`, `@/pages`, `@/assets` etc. are defined in vite config but **do not work** — they are shadowed by the root `@` alias which matches first. Always use the full `@/app/...` path.

Use aliases for all cross-directory imports. Avoid deep relative paths (`../../../`).

---

## Modularization — Always split features into small files

**Every feature must be broken into separate files from the start.** Never build a feature as a single large component file and refactor later.

### Required structure for any non-trivial feature

```
features/<feature-name>/
  <FeaturePage>.tsx          — slim orchestrator: holds state, computed values, handlers; renders section components
  types.ts                   — all TypeScript types and interfaces for this feature
  constants.ts               — module-level constants (lookup tables, cycles, config values, style strings)
  storage.ts                 — localStorage key + load/save helpers (if feature persists data)
  utils.ts                   — pure helper functions (no React, no side effects)
  components/
    <SectionA>.tsx           — one component per logical section of the page
    <SectionB>.tsx
    <RowComponent>.tsx       — leaf-level repeating items (e.g. a single row in a list)
    ...
```

### Rules

1. **Page component is an orchestrator only.** It owns state, computed values (`useMemo`), side effects (`useEffect`), and event handlers. It does NOT contain large JSX blocks — it renders named section components and passes props down.

2. **One responsibility per file.** Types go in `types.ts`. Constants go in `constants.ts`. Pure functions go in `utils.ts`. If a function touches React state it belongs in a component or hook, not `utils.ts`.

3. **Size limit: ~200 lines per file.** If a component file grows past ~200 lines, split it. A component that renders more than one logical "section" of the UI should be two components.

4. **Props over Context by default.** Pass props explicitly. Only reach for React Context if prop drilling crosses more than 2–3 levels and multiple siblings need the same data.

5. **Name files after what they render**, not after their role in the hierarchy. `TermRow.tsx` not `ListItem.tsx`. `TABudgetTracker.tsx` not `Section3Part2.tsx`.

6. **Co-locate feature code.** All files for a feature live inside that feature's folder. Never scatter feature-specific types or helpers into shared `utils/` or `types/` directories unless they are genuinely reused across multiple features.

### When to apply this

- **New feature from scratch:** design the file structure before writing any code.
- **Existing file approaching 300+ lines:** split it before adding more.
- **Any time a single file contains types + constants + helpers + components:** that file needs to be split.

### Example: education feature (reference implementation)

```
features/education/
  EducationLayout.tsx            — shared nested layout: persistent hero, tab bar, <Outlet />
  DegreePlannerPage.tsx          — ~290 lines, state + computed + handlers only
  CollegeUniversityPage.tsx      — school search orchestrator: filters, results, detail, compare
  TuitionAssistancePage.tsx      — TA overview, eligibility, approval steps
  degree-planner/
    types.ts                     — 8 types/interfaces
    constants.ts                 — DEGREE_CREDITS, FUNDING_META, GRADE_POINTS, etc.
    storage.ts                   — STORAGE_KEY + loadSaved()
    utils.ts                     — genId, fiscalYear, courseTACost, fundingClass, etc.
    degreePlannerPdf.ts          — PDF export logic
    components/
      NumericInput.tsx           — reusable controlled input with isFocused sync
      SectionHeader.tsx          — numbered section label
      DegreeGoalSection.tsx      — school + degree/field selectors (integrates with college-university)
      CreditsEarnedSection.tsx   — JST/transfer/CLEP inputs
      CoursePlanSection.tsx      — section 3 wrapper
      TABudgetTracker.tsx        — FY budget cards + uncovered gap card
      TermRow.tsx                — single term accordion
      CourseRow.tsx              — single course row
      SummarySection.tsx         — progress bar + cost breakdown
      DegreePlannerFAQ.tsx       — FAQ accordion section
  college-university/
    types.ts                     — SchoolResult, SchoolProgram, SortOption, TuitionMode, SearchParams
    constants.ts                 — TA_CAP_PER_CREDIT, POPULAR_SCHOOL_NAMES, FIELD_OF_STUDY_OPTIONS, US_STATES
    utils.ts                     — fetchSchools, activeTuition, calcTACoverage, sortSchools, schoolBadge
    savedStorage.ts              — localStorage helpers for saved/bookmarked schools
    recentStorage.ts             — localStorage helpers for recently viewed schools
    components/
      SchoolFilters.tsx          — search input + state/ownership/field-of-study/distance filters
      SchoolResultsList.tsx      — paginated results with sort/filter controls
      SchoolResultCard.tsx       — single result card with TA coverage bar + compare/save actions
      SchoolDetailPanel.tsx      — sticky right panel: full details, programs, "Add to Planner" CTA
      SchoolBadge.tsx            — colored initials badge per school
      TACoverageBar.tsx          — visual TA coverage progress bar
      PopularSchoolsRow.tsx      — horizontally scrolling popular school cards (hardcoded list)
      RecentlyViewedRow.tsx      — horizontally scrolling recently viewed schools (localStorage)
      SavedSchoolsRow.tsx        — horizontally scrolling saved/bookmarked schools (localStorage)
      CompareBar.tsx             — sticky bottom bar for up to 3 schools to compare
      CompareView.tsx            — full-screen side-by-side school comparison overlay
      CollegeHero.tsx            — page-level hero (unused — hero is in EducationLayout)
```

**School search worker:** The college-university feature fetches from a Cloudflare Worker. The URL is read from `import.meta.env.VITE_SCHOOL_SEARCH_WORKER_URL`. Set this in `.env.local` for local dev. If the env var is absent, search silently no-ops. Programs (CIP codes) are fetched from the same worker with a `schoolId` query param.

---

## Cloudflare Workers & External Services — Cross-Machine Setup

**Rule:** Any time a new Cloudflare Worker (or other external service) is added to the project, document it in this section immediately. Every machine that clones or pulls this repo must complete the setup steps below before that feature will work locally.

Workers are deployed to Cloudflare's infrastructure — they are not local to any one machine. But `.env.local` is gitignored and must be configured on each machine manually.

### Active Workers

| Worker | Directory | Deployed URL | Env var for local dev |
|--------|-----------|--------------|----------------------|
| `news-metrics` | `workers/news-metrics/` | `https://news-metrics.darkeyegraphics.workers.dev` | `VITE_NEWS_METRICS_URL` |
| `school-search` | `workers/school-search/` | `https://school-search.darkeyegraphics.workers.dev` | `VITE_SCHOOL_SEARCH_WORKER_URL` |

### `.env.local` — required on every machine

Create `usmc-redesign/.env.local` with all of the following (copy from `.env.production` as a baseline):

```env
VITE_NEWS_METRICS_URL=https://news-metrics.darkeyegraphics.workers.dev
VITE_SCHOOL_SEARCH_WORKER_URL=https://school-search.darkeyegraphics.workers.dev
```

If a key is missing the feature silently no-ops — no error is thrown. If something stops working on a new machine, a missing `.env.local` key is the first thing to check.

### Deploying a worker

Workers only need to be deployed when their source code changes. Deploy from any machine:

```bash
cd usmc-redesign/workers/<worker-name>
npx wrangler deploy
```

`wrangler` must be authenticated (`npx wrangler login`) on the machine running the deploy.

### Adding a new worker — checklist

When you add a new Cloudflare Worker or any other external service that the frontend calls:

1. Create the worker directory under `workers/` with a `wrangler.toml`.
2. Add `ALLOWED_ORIGINS` in `wrangler.toml` to include localhost ports and the production domain.
3. Add the env var to `.env.local`, `.env.production`, and `.env.example`.
4. Add a row to the **Active Workers** table above.
5. Document what happens when the env var is absent (error vs. silent no-op).

---

## Theme Compliance — Always design for all three themes

Every new component or page must work correctly in BLACKOUT, WOODLAND, and DESERT. Never design only for the dark themes and fix desert later.

### Checklist for every new component

1. **Check every color class you write.** Standard `bg-black`, `text-white`, `text-gray-*`, `border-white/X` adapt automatically. Everything else needs scrutiny.

2. **Amber/orange elements always need a desert variant.** Amber reads fine on dark backgrounds but becomes hard to see on desert's sandy surface. Always pair with an `isDesert` conditional:
   ```tsx
   className={isDesert ? 'text-amber-700 border-amber-600/40 bg-amber-100/60' : 'text-amber-400 border-amber-500/20 bg-amber-950/30'}
   ```

3. **Red tints need desert variants.** Dark reds (`bg-red-950/40`, `text-red-100`) are invisible on sand. Use:
   ```tsx
   isDesert ? 'border-red-700/60 bg-red-900/15 text-red-900' : 'border-red-600 bg-red-950/40 text-white'
   ```

4. **Framer Motion inline styles need explicit values.** `animate={{ backgroundColor: ... }}` bypasses CSS variables. Always pass theme-conditional values:
   ```tsx
   animate={{ backgroundColor: isDesert ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.4)' }}
   ```

5. **Never hardcode hex backgrounds.** Replace `bg-[#09090c]` with `bg-usmc-bg-surface`, `bg-[#050508]` with `bg-usmc-bg-page`, etc.

6. **Get `isDesert` from the hook, not props.** Each component that needs it should call `useTheme()` directly:
   ```tsx
   const { theme } = useTheme();
   const isDesert = theme === 'desert';
   ```

7. **After building a new component, mentally walk through desert mode.** Ask: would any text be invisible, any border disappear, any background create a dark box on a sand background? If yes, fix it before committing.

See the **Theming System** section below for the full color reference table and what adapts automatically vs. what requires explicit handling.

---

## Page Hero — Every feature page uses the same header pattern

All feature pages (sub-pages under a top-level nav section) share a consistent hero header. Copy this pattern exactly — do not invent a new layout.

```tsx
{/* Hero */}
<div className="relative pt-20 overflow-hidden border-b border-white/12">
  {/* Background layers */}
  <div className="absolute inset-0 hero-bg" />
  <div
    className="absolute inset-0 opacity-[0.04]"
    style={{
      backgroundImage:
        'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }}
  />

  <div className="relative z-10 flex flex-col" style={{ minHeight: '176px' }}>
    {/* Optional top-right info badge (desktop only) */}
    <div className="absolute top-5 right-8 border border-white/10 bg-black/50 px-5 py-3 text-right hidden lg:block">
      <div className="text-[12px] font-black text-white tracking-widest">LABEL HERE<span className="text-red-600">.</span></div>
      <div className="w-6 h-px bg-red-600 ml-auto mb-2" />
      <div className="text-[11px] text-gray-500 tracking-wider">SUPPORTING DETAIL</div>
    </div>

    <div className="flex-1 flex flex-col justify-center px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-gray-600 font-mono tracking-wider mb-2">
        <button onClick={() => navigate('/')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">HOME</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate('/parent-route')} className="text-[12px] font-mono tracking-wider hover:text-gray-400 transition-colors bg-transparent p-0 border-0">PARENT</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-red-500">CURRENT PAGE</span>
      </div>

      {/* Title with red left bar */}
      <div className="flex items-start gap-4">
        <div className="mt-1 h-14 w-1 flex-shrink-0 bg-red-600 sm:h-20" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
          className="page-hero-title mb-3"
        >
          PAGE TITLE<span className="text-red-600">.</span>
        </motion.h1>
      </div>

      {/* Subtitle */}
      <p className="text-[14px] text-gray-400 max-w-xl leading-relaxed mb-3">
        Brief description of what this page does.
      </p>
    </div>

    {/* Tab bar (if this page has sub-tabs) */}
    <div className="flex items-center px-8 -mb-px overflow-x-auto">
      {tabs.map(tab => { /* ... tab buttons ... */ })}
    </div>
  </div>
</div>
```

### Hero rules

- `pt-20` accounts for the fixed navigation bar height — always include it.
- `hero-bg` and `hero-fade-bottom` are defined in `globals.css` and adapt per theme automatically.
- The grid overlay uses `var(--usmc-grid-color)` — never hardcode a color here.
- The red left bar (`w-1 bg-red-600`) is part of the title treatment — always include it when there's an `h1`.
- `page-hero-title` is a global CSS class — use it for all page `h1` elements; do not replicate its styles inline.
- Breadcrumb buttons use `bg-transparent p-0 border-0` to avoid browser default button styling.
- The last breadcrumb segment (current page) is always `text-red-500` and is a `<span>`, not a `<button>`.
- The top-right badge is `hidden lg:block` — desktop only, always optional.
- If the page has tabs, they sit at the bottom of the hero div touching the `border-b` line (the `-mb-px` pattern).

---

## Tech Stack

- **Framework:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** motion/react (Framer Motion)
- **Routing:** react-router v7 (library/SPA mode — not framework mode)
- **Icons:** lucide-react

---

## Theming System

### Overview

The app has **three display themes** selectable by the user from the sidebar. The active theme is stored in `localStorage` under the key `'usmc-theme'` and applied as a class on `<html>`.

| Theme | Class on `<html>` | Short code | Character |
|-------|-------------------|------------|-----------|
| BLACKOUT (default) | *(no class)* | `BLK` | Dark — true black backgrounds, white text |
| WOODLAND | `.od-green` | `WDL` | Dark green — Woodland MARPAT palette |
| DESERT | `.desert` | `DST` | Light sandy — Desert MARPAT palette |

### Architecture

All color tokens are CSS custom properties defined in `src/styles/theme.css`. The default `:root` block defines BLACKOUT values; `.od-green` and `.desert` classes override them for the other themes.

Tailwind v4's `@theme inline` block re-routes `bg-black`, `text-white`, `border-white/X`, `bg-white/X`, and `text-gray-*` through these variables:

```css
--color-black: var(--usmc-bg-base);   /* bg-black adapts per theme */
--color-white: var(--usmc-text-primary); /* text-white, border-white/X adapts */
/* gray-100 through gray-800 are also overridden per theme */
```

This means **most standard Tailwind classes already adapt automatically** — you do not need conditional logic for everyday text and border colors.

### ThemeContext

```tsx
import { useTheme } from '@/app/features/theme/ThemeContext';

const { theme, setTheme } = useTheme();
// theme: 'blackout' | 'od-green' | 'desert'
const isDesert   = theme === 'desert';
const isWoodland = theme === 'od-green';
```

`ThemeProvider` wraps the app in `App.tsx`. A flash-prevention inline `<script>` in `index.html` reads `localStorage` and applies the class to `<html>` synchronously before React hydrates.

### What adapts automatically (no extra code needed)

- `bg-black`, `bg-white/X` — routes through `--usmc-bg-base` / `--usmc-text-primary`
- `text-white`, `text-gray-*` — routes through theme gray scale overrides
- `border-white/X` — routes through `--usmc-text-primary`
- `bg-usmc-bg-base`, `bg-usmc-bg-page`, `bg-usmc-bg-surface` — explicit token classes, always correct
- `var(--usmc-grid-color)` in `backgroundImage` — adapts to white (blackout), khaki (woodland), dark brown (desert)
- `.hero-bg` class — uses `--usmc-hero-overlay` which adapts per theme
- `.hero-fade-bottom` — uses `color-mix()` against `--usmc-bg-page`
- Shadcn UI components — use `--background`, `--foreground`, `--border` etc. which are overridden per theme

### What does NOT adapt automatically (requires `isDesert` / `isWoodland`)

These require explicit conditional handling:

1. **Framer Motion `animate` / `whileHover` props** — inline styles bypass CSS variables entirely. Pass theme-conditional values directly:
   ```tsx
   animate={{ backgroundColor: isDesert ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.4)' }}
   ```

2. **Hardcoded Tailwind red tints** — `bg-red-950/40`, `bg-red-950/10`, `text-red-100`, `text-red-300` etc. are fixed Tailwind colors. In desert (light background) these dark reds become invisible or create dark boxes on sand. Use `isDesert` to swap for light red variants:
   ```tsx
   // selected state
   isDesert ? 'border-red-700/60 bg-red-900/15 text-red-900' : 'border-red-600 bg-red-950/40 text-white'
   ```

3. **Hardcoded hex backgrounds** — `bg-[#09090c]`, `bg-[#0b0b0d]`, `bg-[#2a0c10]` etc. Replace with `bg-usmc-bg-surface` or conditional classes.

4. **CSS animations with hardcoded colors** — e.g. `@keyframes pay-cell-pulse` uses literal dark reds. Add a `.desert` ancestor override in `globals.css`:
   ```css
   .desert .pay-cell-pulse { animation: pay-cell-pulse-desert 1.8s ease-in-out infinite; }
   ```

5. **`::placeholder` colors** — `placeholder-gray-800` may be invisible in woodland/desert. The gray scale IS overridden per theme (see `--color-gray-800` in theme.css), but verify placeholder colors are near-invisible on each background.

6. **Inline `style={{ color: '...' }}` that must always be white** — Elements sitting over dark photos (e.g. hero slide titles, progress dots) must use `style={{ color: '#ffffff' }}` not `text-white`, because `text-white` maps to `--usmc-text-primary` which is dark brown in desert.

### Theme-aware color reference

When writing new components that need explicit desert/woodland variants:

| Element | Blackout/Woodland | Desert |
|---------|-------------------|--------|
| Selected button bg | `bg-red-950/40` | `bg-red-900/15` |
| Selected button border | `border-red-600` | `border-red-700/60` |
| Selected button text | `text-white` | `text-red-900` |
| Selected column cell | `bg-red-950/10 text-red-100` | `bg-red-900/15 text-red-800` |
| Positive/match color | `text-green-400` / `text-green-500` | `text-green-700` |
| Skill transfer color | `text-cyan-400` / `text-cyan-600` | `text-cyan-700` / `text-cyan-800` |
| Tag (green) | `border-green-500/20 bg-green-950/30 text-green-400/80` | `border-green-700/50 bg-green-50/50 text-green-800` |
| Tag (amber) | `border-amber-500/20 bg-amber-950/30 text-amber-400/80` | `border-amber-600/40 bg-amber-100/60 text-amber-800` |
| Tag (cyan) | `border-cyan-500/20 bg-cyan-950/30 text-cyan-400/80` | `border-cyan-600/40 bg-cyan-100/60 text-cyan-800` |
| Warning box | `border-red-900/40 bg-red-950/15` | `border-red-700/40 bg-red-100/40` |
| Warning text | `text-red-300` | `text-red-700` |
| Filter chip (available) | `border-green-500/35 bg-green-900/10 text-green-400/80` | `border-green-700/50 bg-green-50/50 text-green-800` |
| Filter chip (excluded) | `border-red-500/70 bg-red-900/20 text-red-300 line-through` | `border-red-700/60 bg-red-50/60 text-red-800 line-through` |
| Primary action button | `border-red-600 bg-red-950/40 text-white hover:bg-red-600` | `border-red-700 bg-red-700 text-red-50 hover:bg-red-800` |

### Grid overlay pattern (theme-aware)

Always use `var(--usmc-grid-color)` — never hardcode `rgba(255,255,255,0.5)`. The variable resolves to white (blackout), khaki (woodland), or dark brown (desert) automatically.

```jsx
<div
  className="pointer-events-none absolute inset-0 opacity-[0.055]"
  style={{
    backgroundImage:
      'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  }}
/>
```

**Exception:** Grids that always overlay a dark photo (e.g. `HeroSection.tsx`, `VideoPlayer.tsx`) should keep the hardcoded `rgba(255,255,255,0.5)` — the photo is always dark regardless of theme.

---

## Design System

### Color Palette

All tokens are defined as CSS custom properties in `src/styles/theme.css` and exposed as Tailwind utilities via `@theme inline`. The values shown below are the BLACKOUT (default) theme values. See the Theming System section above for how they change across themes.

#### Backgrounds

| Token | Value | Usage |
|-------|-------|-------|
| `--usmc-bg-base` / `bg-usmc-bg-base` | `#000000` | Cards, buttons, inputs, any opaque surface |
| `--usmc-bg-page` / `bg-usmc-bg-page` | `#050508` | Hero sections, full-page backgrounds |
| `--usmc-bg-surface` / `bg-usmc-bg-surface` | `#09090c` | Popovers, calendar dropdowns |
| `--usmc-bg-elevated` | `rgba(255,255,255,0.04)` | Section header row fill (use as inline style or Tailwind `bg-white/[0.04]`) |

#### Borders (white-alpha scale)

| Token | Tailwind equivalent | Usage |
|-------|---------------------|-------|
| `--usmc-border-subtle` | `border-white/[0.06]` | Internal dividers, list separators |
| `--usmc-border-default` | `border-white/10` | Card inner borders |
| `--usmc-border-medium` | `border-white/12` | Card outer borders (standard) |
| `--usmc-border-strong` | `border-white/16` | Input/select borders (unfocused) |
| `--usmc-border-hover` | `border-white/30` | Hover state on interactive borders |
| `--usmc-border-focus` | `border-red-500/50` | Focus ring on inputs/selects |

#### Red — Brand, CTAs, Danger

| Token | Value | Usage |
|-------|-------|-------|
| `--usmc-red-950` | `#450a0a` | Active/selected background tint |
| `--usmc-red-600` | `#dc2626` | Primary CTA buttons, vertical accent bar |
| `--usmc-red-500` | `#ef4444` | Section number labels, breadcrumb active, focus rings |
| `--usmc-red-400` | `#f87171` | Icon accents (calendar icon, chevrons) |
| `--usmc-red-300` | `#fca5a5` | Tax deduction values |

#### Green — Positive Money Values

| Token | Value | Usage |
|-------|-------|-------|
| `--usmc-green-950` | `#052e16` | Background tint on "Payout After Taxes" cell |
| `--usmc-green-700` | `#15803d` | "Payout After Taxes" label when result is active |
| `--usmc-green-400` | `#4ade80` | All positive dollar amounts (base pay, bonuses, kickers) |

#### Amber — Warnings

| Token | Value | Usage |
|-------|-------|-------|
| `--usmc-amber-500` | `#f59e0b` | Warning borders |
| `--usmc-amber-300` | `#fcd34d` | Warning icons and text |

#### Text Hierarchy

| Token | Tailwind equivalent | Usage |
|-------|---------------------|-------|
| `--usmc-text-primary` | `text-white` | Primary content |
| `--usmc-text-secondary` | `text-gray-300` | Supporting text, button labels |
| `--usmc-text-muted` | `text-gray-400` | Body copy, descriptions |
| `--usmc-text-subtle` | `text-gray-500` / `text-gray-600` | Field labels, metadata |
| `--usmc-text-disabled` | `text-white/20` | Empty/placeholder state in result panels |

#### Grid Overlay

The background grid is always rendered as an `absolute inset-0 pointer-events-none` div with `opacity-[0.055]` inside the nearest `relative` wrapper. Always use `var(--usmc-grid-color)` — never hardcode `rgba(255,255,255,0.5)`. The variable adapts per theme automatically.

```jsx
<div className="relative px-4 py-8">
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.055]"
    style={{
      backgroundImage:
        'linear-gradient(var(--usmc-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--usmc-grid-color) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }}
  />
  {/* All direct children must have bg-black to block the grid */}
  <div className="relative ...">...</div>
</div>
```

Any sibling div that should block the grid needs either `relative` (to be above the absolute grid in stacking order) or an explicit `bg-black`.

---

### Typography

All type is `font-mono` for data/labels. Display headings use `font-black tracking-tighter`. The scale:

| Role | Classes |
|------|---------|
| Page title | `text-[clamp(2.6rem,5vw,4.8rem)] font-black leading-none tracking-tighter` |
| Section heading | `text-sm font-bold tracking-widest text-gray-400` |
| Field label | `text-[11px] font-bold tracking-[0.2em] text-gray-500` |
| Field hint | `text-[11px] leading-relaxed text-gray-600` |
| Large result value | `text-[clamp(2.2rem,4vw,3rem)] font-black leading-none tracking-tighter` |
| Medium result value | `text-xl font-black` |
| Badge / tag | `text-[10px] font-bold tracking-wider` |
| Body copy | `text-[14px] leading-relaxed text-gray-400` |

---

### Component Patterns

#### Section container (card)
```jsx
<div className="border border-white/12 bg-black">
  {/* Header row */}
  <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-6 py-4">
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-white/35">
      <span className="text-sm font-bold text-red-500">{number}</span>
    </div>
    <span className="text-sm font-bold tracking-widest text-gray-400">SECTION TITLE</span>
  </div>
  {/* Body */}
  <div className="px-6 py-6">...</div>
</div>
```

#### Styled select (appearance-none + ChevronDown overlay)
```jsx
<div className="relative">
  <select className="w-full appearance-none border border-white/16 bg-black px-4 py-3 pr-8 font-mono text-sm text-white focus:outline-none focus:border-red-500/50">
    ...
  </select>
  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
</div>
```

For a required/empty state, swap border and background: `border-red-500 bg-red-950/15 text-gray-600`.

#### Date picker
Use `<DatePickerField>` from `@/components/ui/date-picker-field`. Accepts `value` (YYYY-MM-DD string), `onChange`, `placeholder`, `minYear`, `maxYear`.

#### Accordion section (NMOS pattern)
```jsx
<div className="border border-white/12 bg-black">
  <button type="button" onClick={() => setOpen(v => !v)}
    className="flex w-full items-center justify-between bg-white/[0.04] px-6 py-4 text-left">
    ...
    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
  </button>
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}>
        ...
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

---

## Inputs and Interactive Elements

- All `<input>`, `<select>`, and `<textarea>` elements must use `font-size: 16px` or larger on mobile to prevent iOS auto-zoom. The global rule lives in `src/styles/globals.css`.
- All `<button>`, `<select>`, `<a>`, and `[role="button"]` elements get `cursor: pointer` via the global stylesheet. Divs with `onClick` need `cursor-pointer` added manually as a Tailwind class.

---

## Hero Images — Adding & Optimizing

### Format and sizing rules

All hero images must be **WebP**, max **2400px** on the longest edge, at **quality 82**. The originals from DVIDS or elsewhere are typically 6–20 MB JPEG — always run them through the pipeline below before adding to the project. The target output is 150–500 KB per image.

`sharp` is installed as a dev dependency. Run this one-liner from the project root to convert a new image:

```bash
node -e "
const sharp = require('sharp');
sharp('path/to/source.jpg')
  .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 82, effort: 5 })
  .toFile('src/app/assets/your-name.webp')
  .then(i => console.log(i));
"
```

Or to batch-process multiple files at once:

```bash
node - << 'EOF'
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const files = ['file1.jpg', 'file2.jpg']; // source paths
const outDir = 'src/app/assets';

Promise.all(files.map(src => {
  const out = path.join(outDir, path.basename(src, path.extname(src)) + '.webp');
  return sharp(src)
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(out)
    .then(i => console.log(`${path.basename(src)} → ${out} (${Math.round(i.size/1024)}KB)`));
}));
EOF
```

### Adding a new slide to the hero

1. Drop the optimized `.webp` into `src/app/assets/`
2. Import it at the top of `src/app/pages/HomePage.tsx`
3. Add a new entry to the `SLIDES` array with:
   - `image` — the imported asset
   - `label` — short tactical label (all caps)
   - `heading` — two-line display headline (array of two strings)
   - `sub` — two supporting lines (array of two strings)
   - `colorGrade` — `radial-gradient` that complements the image's dominant tone (warm/cool/green/purple)
   - `sweep` — `linear-gradient(125deg, ...)` diagonal wash, same hue family as colorGrade at lower opacity
   - `nodeColors` — array of 3 `rgba(...)` strings pulled from the image's palette for the grid intersection pulse nodes

### Notes

- Do **not** import `.jpg` originals — always import the `.webp` version.
- The original `.jpg` files can be kept locally as backups but are not referenced by the app.
- `sips` (macOS built-in) does **not** support WebP write — always use `sharp`.

---

## Lateral Move Tool — Data Layer

The lat move tool data lives in `src/app/features/latmove/db/`. The query layer in `queries.ts` is intentionally structured as a DAL so the in-memory data can be swapped for PostgreSQL calls without touching the rest of the app.

- **`mos-data.ts`** — lat move TARGET MOSs (what a Marine can move TO). 156 entries.
- **`mos-skills.ts`** — skill tag map for ALL MOSs (targets + background). The bottom section labeled `BACKGROUND / ADDITIONAL MOSs` covers MOSs held as PMOS/AMOS that aren't lat move targets. When adding new MOSs, put lat move targets in `mos-data.ts` and add skill tags in the appropriate section of `mos-skills.ts`.
- **`mos-descriptions.ts`** — NAVMC 1200.1L summary text keyed by MOS ID.
- **`cert-library.ts`** — certification library with skill tag mappings.
- **`queries.ts`** — DAL. Only file the rest of the app imports from. To migrate to PostgreSQL, replace the function bodies here; nothing else changes.
