"use client";

/**
 * Route-level error boundary (Master Framework §16 / maturity Level 2).
 * Feature-level isolation will nest additional boundaries later.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm opacity-70">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full px-4 py-2 text-sm font-medium"
        style={{
          background: "var(--toggle-bg)",
          color: "var(--toggle-fg)",
          boxShadow: "var(--toggle-shadow)",
        }}
      >
        Try again
      </button>
    </main>
  );
}
