# ADR 0003 — Theme motion + icon platform

## Status

Accepted — 2026-09-06 (revised for Telegram primary source)

## Context

Users need a Telegram-quality theme reveal and professional icons. Master Framework requires design tokens, accessibility (reduced motion), and clear platform vs feature boundaries.

## Research (evidence)

| Topic | Source | Finding |
| --- | --- | --- |
| Theme reveal duration | DrKLO/Telegram `LaunchActivity.java` (`needSetDayNightTheme`) | `anim.setDuration(400)` **Documented** |
| Theme reveal easing | Same + `Easings.java` | `Easings.easeInOutQuad` = `(0.455, 0.03, 0.515, 0.955)` **Documented** |
| Reveal algorithm | Same | Snapshot → reveal from toggle; toDark expands new, toLight shrinks snapshot **Documented** |
| Radius | Same | Max hypot to all four viewport corners **Documented** |
| Web technique | MDN View Transitions + clip-path | Expand/shrink from control **Documented** |
| Icons | Shopify Polaris icons; Fluent/Meta design-system icon packages | Ship SVG icon packages, not emoji **Documented** |
| Motion a11y | Shopify Polaris / WCAG | Honor `prefers-reduced-motion` **Documented** |

Note: `CubicBezierInterpolator.EASE_OUT_QUINT` is widely used in Telegram UI, but **not** for the day/night circular reveal.

## Decision

1. Motion tokens in `platform/theme/motion.ts`: 400ms + Telegram `easeInOutQuad`.
2. Sync `html` class + `colorScheme` inside the VT callback — `next-themes` only
   applies class in `useEffect` (post-paint), which caused dark→light flash.
3. Directional wipe (Telegram `LaunchActivity`):
   - light → dark: expand `::view-transition-new` (reveal **out**)
   - dark → light: shrink `::view-transition-old` (reveal **in**)
4. Inject a temporary `<style>` with **concrete px** clip/z-index before VT —
   CSS variables on `<html>` do not reliably inherit into `::view-transition-*`
   (first-click origin fell back to viewport center).
5. Read current theme from `document.documentElement.classList` (not lagging
   `resolvedTheme`) so the first post-refresh toggle uses the correct direction.
6. Always render the real toggle `<button>` (no placeholder node swap) so geometry
   is measurable on first click.
7. Icons via `@phosphor-icons/react` re-exported from `shared/icons` only.
8. Shared UI in `shared/ui`; env in `platform/config`; `cn` in `shared/lib`.
9. Folder map: `app/` · `platform/` · `shared/` · `features/`.

## Consequences

- Theme feel matches Telegram’s published day/night wipe curve.
- Reduced-motion still instant-swaps.
- Icon updates go through `shared/icons` only.
- Auth feature does not own generic form chrome.
