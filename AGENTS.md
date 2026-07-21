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

No test framework is set up.

## Next.js 16 Quirks That Apply Here
- `next lint` removed — run `eslint` directly
- Turbopack is the default bundler
- `eslint` config option removed from `next.config.ts`
- `<Image>`: use `preload` prop instead of deprecated `priority`

## Architecture
- **Single page app** — all sections in `app/page.tsx`, no routes
- **Static data** in `data/profile.ts` — edit without touching components
- **Components** in `components/`: `Navbar`, `ThemeProvider`, `ThemeToggle`, `sections/*` (Hero, About, Timeline, Projects, Skills, Contact, Footer)
- **Dark mode** via custom `ThemeProvider` (no `next-themes`). Flash prevention via inline `<script>` in `app/layout.tsx:<head>`
- **Path alias**: `@/*` maps to project root (used in imports)
- **Animation**: `framer-motion` available for scroll/entry animations
- **CLAUDE.md** delegates to this file via `@AGENTS.md`

## Styling
- Tailwind CSS v4 uses `@import "tailwindcss"` (NOT old `@tailwind` directives)
- Theme tokens with `@theme inline` in `globals.css`
- Dark mode via `.dark` class on `<html>`

## Lint
- `react-hooks/set-state-in-effect` is **error** — do NOT call `setState` synchronously inside `useEffect`. Use `// eslint-disable-next-line react-hooks/set-state-in-effect` if unavoidable (see `ThemeProvider.tsx`)
