# Porto — Portfolio Website (Next.js 16)

## Stack
- Next.js 16.2.10 (App Router, Turbopack default), Tailwind CSS v4, TypeScript, ESLint flat config, pnpm

## Commands
| Command | Notes |
|---------|-------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm start` | Prod server |
| `pnpm run lint` | ESLint directly (`next lint` removed in v16) |

No test framework.

## Next.js 16 Quirks
- `next lint` removed — run `pnpm run lint` (or `eslint` directly)
- Turbopack is the default bundler
- `eslint` config option removed from `next.config.ts`; config lives in `eslint.config.mjs`
- `<Image>`: use `preload` prop instead of deprecated `priority`

## Architecture
- **Single page app** — `app/page.tsx` renders sections in order: Hero, About, Timeline, Projects, Skills, Contact, Footer
- **Static data** in `data/profile.ts` — edit without touching components
- **Components** in `components/`: `Navbar`, `ThemeProvider`, `ThemeToggle`, `sections/*` (Hero, About, Timeline, Projects, Skills, Contact, Footer)
- **Dark mode** via custom `ThemeProvider` (`components/ThemeProvider.tsx`) — no `next-themes`. Default is dark (`<html className="dark">` in `layout.tsx`). Flash prevention via inline `<script>` in `<head>` of `layout.tsx`
- **Hook**: `useTheme()` exported from `ThemeProvider.tsx` gives `{ theme, resolvedTheme, setTheme }`
- **Fonts**: Geist (sans) and Geist Mono via CSS custom properties `--font-geist-sans`, `--font-geist-mono`
- **Path alias**: `@/*` maps to project root
- **Animation**: `framer-motion` available for scroll/entry animations
- **Assets**: static files in `public/` (images, resume PDF, project thumbnails)
- **CLAUDE.md** delegates to this file via `@AGENTS.md`

## Styling
- Tailwind CSS v4 uses `@import "tailwindcss"` (NOT old `@tailwind` directives)
- Theme tokens with `@theme inline` in `globals.css`
- Dark mode via `.dark` class on `<html>`

## Lint
- `react-hooks/set-state-in-effect` is **error** (from `eslint-config-next/core-web-vitals` preset) — do NOT call `setState` synchronously inside `useEffect`. Use `// eslint-disable-next-line react-hooks/set-state-in-effect` if unavoidable (see `ThemeProvider.tsx`)
