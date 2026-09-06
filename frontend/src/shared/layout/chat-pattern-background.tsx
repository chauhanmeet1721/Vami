/**
 * Full-bleed Telegram-style wallpaper:
 * theme gradient + repeating doodle pattern (CSS-masked SVG).
 */
export function ChatPatternBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-r from-[var(--background)] via-[var(--background-via)] to-[var(--background-to)]" />
      <div className="chat-pattern-layer absolute inset-0" />
    </div>
  );
}
