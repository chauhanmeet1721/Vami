"use client";

import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import {
  TELEGRAM_EASE_IN_OUT_QUAD,
  TELEGRAM_THEME_REVEAL_MS,
} from "@/platform/theme/motion";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

const REVEAL_STYLE_ID = "vami-theme-reveal-style";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Live DOM theme — next-themes `resolvedTheme` can lag on first paint after refresh. */
export function readDomIsDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

/**
 * Farthest-corner radius — Telegram LaunchActivity four-corner max hypot.
 */
function maxRadiusFromPoint(x: number, y: number): number {
  const { innerWidth: w, innerHeight: h } = window;
  return Math.max(
    Math.hypot(x, y),
    Math.hypot(w - x, y),
    Math.hypot(x, h - y),
    Math.hypot(w - x, h - y),
  );
}

/**
 * Reveal origin: button center, with click fallback if layout size is 0
 * (first paint / hydration edge cases).
 */
function originFromToggle(event: React.MouseEvent<HTMLButtonElement>): {
  x: number;
  y: number;
} {
  const button = event.currentTarget;
  void button.offsetWidth; // force layout before measure
  const rect = button.getBoundingClientRect();

  if (rect.width >= 1 && rect.height >= 1) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return { x: event.clientX, y: event.clientY };
}

/**
 * next-themes applies class in useEffect (after paint). VT needs sync DOM.
 */
function applyThemeDom(nextTheme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;
}

/**
 * Inject concrete px clip/z-index for first VT paint.
 * Avoids CSS-variable inheritance gaps into ::view-transition-* (center origin bug).
 *
 * Telegram LaunchActivity:
 * - toDark: expand NEW from 0 → R (reveal out)
 * - toLight: shrink OLD from R → 0 (reveal in)
 */
function installRevealStyle(
  goingToDark: boolean,
  x: number,
  y: number,
): HTMLStyleElement {
  document.getElementById(REVEAL_STYLE_ID)?.remove();

  const style = document.createElement("style");
  style.id = REVEAL_STYLE_ID;
  style.textContent = goingToDark
    ? `
      html[data-theme-transition="to-dark"]::view-transition-new(root) {
        z-index: 9999;
        clip-path: circle(0px at ${x}px ${y}px);
      }
      html[data-theme-transition="to-dark"]::view-transition-old(root) {
        z-index: 1;
      }
    `
    : `
      html[data-theme-transition="to-light"]::view-transition-old(root) {
        z-index: 9999;
      }
      html[data-theme-transition="to-light"]::view-transition-new(root) {
        z-index: 1;
      }
    `;
  document.head.appendChild(style);
  return style;
}

function clearRevealArtifacts(style: HTMLStyleElement | null) {
  const root = document.documentElement;
  delete root.dataset.themeTransition;
  style?.remove();
  document.getElementById(REVEAL_STYLE_ID)?.remove();
}

/**
 * Telegram-style circular theme reveal from the toggle.
 *
 * Direction (LaunchActivity + common VT pattern):
 * - light → dark: expand ::view-transition-new (reveal OUT)
 * - dark → light: shrink ::view-transition-old (reveal IN)
 */
export function useCircularThemeTransition() {
  const { setTheme } = useTheme();
  const isAnimatingRef = useRef(false);

  const toggleTheme = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isAnimatingRef.current) return;

      // DOM is source of truth after refresh (resolvedTheme may still be unset).
      const currentlyDark = readDomIsDark();
      const nextTheme = currentlyDark ? "light" : "dark";
      const goingToDark = nextTheme === "dark";
      const doc = document as ViewTransitionDocument;

      if (!doc.startViewTransition || prefersReducedMotion()) {
        applyThemeDom(nextTheme);
        setTheme(nextTheme);
        return;
      }

      const { x, y } = originFromToggle(event);
      const endRadius = maxRadiusFromPoint(x, y);
      const clipClosed = `circle(0px at ${x}px ${y}px)`;
      const clipOpen = `circle(${endRadius}px at ${x}px ${y}px)`;

      const root = document.documentElement;
      const revealStyle = installRevealStyle(goingToDark, x, y);
      root.dataset.themeTransition = goingToDark ? "to-dark" : "to-light";
      isAnimatingRef.current = true;

      try {
        const transition = doc.startViewTransition(() => {
          flushSync(() => {
            applyThemeDom(nextTheme);
            setTheme(nextTheme);
          });
        });

        await transition.ready;

        const shared: KeyframeAnimationOptions = {
          duration: TELEGRAM_THEME_REVEAL_MS,
          easing: TELEGRAM_EASE_IN_OUT_QUAD,
          fill: "both",
        };

        const animations: Animation[] = goingToDark
          ? [
              // Reveal OUT — new dark expands from the button
              root.animate(
                { clipPath: [clipClosed, clipOpen] },
                { ...shared, pseudoElement: "::view-transition-new(root)" },
              ),
              root.animate(
                { clipPath: [clipOpen, clipOpen] },
                { ...shared, pseudoElement: "::view-transition-old(root)" },
              ),
            ]
          : [
              // Reveal IN — old dark shrinks into the button
              root.animate(
                { clipPath: [clipOpen, clipClosed] },
                { ...shared, pseudoElement: "::view-transition-old(root)" },
              ),
              root.animate(
                { clipPath: [clipOpen, clipOpen] },
                { ...shared, pseudoElement: "::view-transition-new(root)" },
              ),
            ];

        await Promise.all([
          ...animations.map((animation) => animation.finished),
          transition.finished,
        ]);
      } finally {
        clearRevealArtifacts(revealStyle);
        isAnimatingRef.current = false;
      }
    },
    [setTheme],
  );

  return { toggleTheme };
}
