/**
 * Theme motion tokens — Telegram day/night reveal (primary source).
 *
 * Evidence (DrKLO/Telegram `LaunchActivity.java` → `needSetDayNightTheme`):
 * - `anim.setDuration(400)`
 * - `anim.setInterpolator(Easings.easeInOutQuad)`
 * - `Easings.java`: easeInOutQuad = CubicBezier(0.455, 0.03, 0.515, 0.955)
 * - Snapshot old UI → circular reveal from toggle coords → farthest corner radius
 *
 * Also: Shopify Polaris / Master Framework §21 — honor prefers-reduced-motion.
 */
export const TELEGRAM_THEME_REVEAL_MS = 400;

/** Telegram `Easings.easeInOutQuad` — day/night circular reveal interpolator. */
export const TELEGRAM_EASE_IN_OUT_QUAD =
  "cubic-bezier(0.455, 0.03, 0.515, 0.955)";
