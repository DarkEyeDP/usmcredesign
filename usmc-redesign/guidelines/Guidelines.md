# USMC Redesign — Coding Guidelines

## Routing — Every new page needs a URL

This project uses **react-router v7** in SPA/library mode (`BrowserRouter` + `Routes`/`Route`).

**When adding a new page, complete all four steps:**

1. Create the page component under `src/app/components/`
2. Add a `<Route path="/your-route" element={<YourPage />} />` in the `<Routes>` block in `src/app/App.tsx`
3. Add a nav item with the matching `path` to `loggedOutItems` and/or `loggedInItems` in `src/app/components/Navigation.tsx`
4. Use `useNavigate` from `react-router` for any in-page programmatic navigation — never track current page in `useState`

**Current routes:**

| Page | Path |
|------|------|
| Home | `/` |
| Messages / MARADMIN | `/messages` |
| Pay & Benefits | `/pay-benefits` |
| Education | `/education` |
| Lateral Move | `/lateral-move` |
| Stay Marine | `/stay-marine` |

---

## General guidelines

- Prefer flexbox and grid over absolute positioning
- Keep file sizes small — put helpers and sub-components in their own files
- All `<input>`, `<select>`, `<textarea>` must be `font-size: 16px+` on mobile (prevents iOS auto-zoom)
- Divs with `onClick` need `cursor-pointer` added manually; buttons/selects/anchors get it globally

## Tech stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- motion/react (Framer Motion) for animation
- react-router v7 (SPA mode)
- lucide-react for icons
