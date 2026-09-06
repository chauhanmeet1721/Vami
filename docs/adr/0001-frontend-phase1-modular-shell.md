# ADR 0001 — Frontend Phase 1 modular shell

## Status

Accepted — 2026-09-06

## Context

Vami rebuilt the frontend from scratch. The Master Framework recommends a modular monolith, monorepo workspace, and Level 2 maturity before micro-frontends, SDUI, or global client stores.

Product requirement for Phase 1: Telegram-style root chrome (chat-pattern wallpaper + theme toggle with circular reveal from the button).

## Decision

1. Keep `frontend` inside the pnpm/Turbo monorepo.
2. Use Next.js App Router via official `create-next-app` (stable).
3. Structure:
   - `src/app` — routes only
   - `src/platform` — theme, tokens, view transitions
   - `src/shared/layout` — shell / wallpaper
   - `src/features` — reserved for vertical slices
4. Theme via `next-themes` + CSS variables (not Redux/Zustand).
5. Theme motion via View Transitions API with directional clip-path from the toggle button center; instant fallback for reduced motion / unsupported browsers.
6. Wallpaper via first-party SVG + CSS mask (single asset, theme-tintable).

## Consequences

- Clear dependency direction: features → shared → platform; app composes them.
- Avoids premature design-system packages and micro-frontends.
- Auth, server-state libraries, and observability land in later ADRs when features require them.
