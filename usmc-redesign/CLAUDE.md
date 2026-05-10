# USMC Redesign — Project Rules for AI Assistants

## Routing — Every new page needs a URL

This is a React SPA using **react-router v7** (`BrowserRouter` + `Routes`/`Route`).

**When adding a new page, you must do all four of these:**

1. Create the page component under `src/app/components/`
2. Add a `<Route path="/your-route" element={<YourPage />} />` inside the `<Routes>` block in `src/app/App.tsx`
3. Add a nav item with the matching `path` to the appropriate list (`loggedOutItems` and/or `loggedInItems`) in `src/app/components/Navigation.tsx`
4. Use `useNavigate` from `react-router` for any programmatic navigation inside the new page — never manage current page via `useState`

**Current route map:**

| Page | Path | Component |
|------|------|-----------|
| Home | `/` | `HomePage` |
| Messages / MARADMIN | `/messages` | `MARADMINPage` |
| Pay & Benefits | `/pay-benefits` | `PayBenefitsPage` |
| Education | `/education` | `EducationPage` |
| Lateral Move | `/lateral-move` | `LateralMovePage` |
| Stay Marine | `/stay-marine` | `StayMarinePage` |

**Production note:** The host server must redirect all requests to `index.html` (standard SPA fallback). Vite dev server handles this automatically.

---

## Tech stack

- **Framework:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** motion/react (Framer Motion)
- **Routing:** react-router v7 (library/SPA mode — not framework mode)
- **Icons:** lucide-react

## Inputs and interactive elements

- All `<input>`, `<select>`, and `<textarea>` elements must use `font-size: 16px` or larger on mobile to prevent iOS auto-zoom. The global rule lives in `src/styles/globals.css`.
- All `<button>`, `<select>`, `<a>`, and `[role="button"]` elements get `cursor: pointer` via the global stylesheet. Divs with `onClick` need `cursor-pointer` added manually as a Tailwind class.

## Lateral Move tool — data layer

The lat move tool data lives in `src/app/components/latmove/db/`. The query layer in `queries.ts` is intentionally structured as a DAL so the in-memory data can be swapped for PostgreSQL calls without touching the rest of the app.

- **`mos-data.ts`** — lat move TARGET MOSs (what a Marine can move TO). 156 entries.
- **`mos-skills.ts`** — skill tag map for ALL MOSs (targets + background). The bottom section labeled `BACKGROUND / ADDITIONAL MOSs` covers MOSs held as PMOS/AMOS that aren't lat move targets. When adding new MOSs, put lat move targets in `mos-data.ts` and add skill tags in the appropriate section of `mos-skills.ts`.
- **`mos-descriptions.ts`** — NAVMC 1200.1L summary text keyed by MOS ID.
- **`cert-library.ts`** — certification library with skill tag mappings.
- **`queries.ts`** — DAL. Only file the rest of the app imports from. To migrate to PostgreSQL, replace the function bodies here; nothing else changes.
