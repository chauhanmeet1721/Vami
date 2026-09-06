"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/shared/icons";
import {
  readDomIsDark,
  useCircularThemeTransition,
} from "@/platform/theme/use-circular-theme-transition";

const emptySubscribe = () => () => {};

function subscribeHtmlClass(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/**
 * Platform chrome: fixed theme control.
 * Reveal origin = this button's center (Telegram requirement).
 * Always render the real <button> (no placeholder swap) so the first
 * post-refresh click measures the correct control geometry.
 */
export function ThemeToggle() {
  const { toggleTheme } = useCircularThemeTransition();
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const isDark = useSyncExternalStore(
    subscribeHtmlClass,
    readDomIsDark,
    () => false,
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed top-4 right-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--toggle-fg)]"
      style={{
        background: "var(--toggle-bg)",
        color: "var(--toggle-fg)",
        borderColor: "var(--toggle-border)",
        boxShadow: "var(--toggle-shadow)",
        backdropFilter: isDark ? undefined : "blur(8px)",
        // Avoid icon flicker before hydration without replacing the node.
        visibility: hydrated ? "visible" : "hidden",
      }}
    >
      {isDark ? (
        <MoonIcon size={20} weight="regular" aria-hidden />
      ) : (
        <SunIcon size={20} weight="regular" aria-hidden />
      )}
    </button>
  );
}
