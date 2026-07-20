# Porto — Portfolio Website (Next.js 16)

## Stack
- Next.js 16.2.10 (App Router, Turbopack by default)
- Tailwind CSS v4 (`@import "tailwindcss"` + `@theme inline` syntax)
- TypeScript, ESLint (flat config), pnpm

## Commands
| Command | Notes |
|---------|-------|
| `pnpm dev` | Dev server (outputs to `.next/dev`) |
| `pnpm build` | Production build |
| `pnpm start` | Start prod server |
| `pnpm run lint` | Uses ESLint directly (`next lint` was removed in v16) |

## Any "ESLint" changes

## Next.js 16 Breaking Changes (applies to this repo)
- `next lint` removed — use `eslint` directly
- `params`/`searchParams` in pages/layouts are Promises (must `await`). Not relevant here (static single page).
- `<Image>`: use `preload` prop instead of deprecated `priority`
- `next/image` defaults: `qualities: [75]`, `minimumCacheTTL` is now 4h
- `middleware.ts` renamed to `proxy.ts` (not used here)
- `eslint` config option removed from `next.config.ts`
- Turbopack is the default bundler

## Architecture
- **Single page app** — all sections rendered in `app/page.tsx`, no route changes
- **Static data** in `data/profile.ts` — edit this file to change content without touching components
- **Components** in `components/` — organized as `Navbar`, `ThemeToggle`, and `sections/*` (Hero, About, Timeline, Projects, Skills, Contact, Footer)
- **Dark mode** via custom `ThemeProvider` (no `next-themes`). Flash prevention via inline `<script>` in `app/layout.tsx:<head>`. Toggle in `components/ThemeToggle.tsx`

## Styling
- Tailwind CSS v4 uses `@import "tailwindcss"` (NOT old `@tailwind` directives)
- Theme tokens defined with `@theme inline` in `globals.css`
- Dark mode via `.dark` class
- Colors: zinc/navy palette, blue-900 as primary accent

## Lint Rules Enforced
- `react-hooks/set-state-in-effect` is **error** — do NOT call `setState` synchronously inside `useEffect`. Use `// eslint-disable-next-line react-hooks/set-state-in-effect` if unavoidable (see `ThemeProvider.tsx`).
- Unused vars are warnings
