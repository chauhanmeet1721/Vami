import { cn } from "@/shared/lib/cn";

type SurfaceCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/** Shared elevated surface for centered workflows (auth, empty states). */
export function SurfaceCard({
  title,
  description,
  children,
  footer,
  className,
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-3xl border p-8 shadow-xl backdrop-blur-md",
        className,
      )}
      style={{
        background: "color-mix(in srgb, var(--background-to) 88%, transparent)",
        borderColor: "color-mix(in srgb, var(--foreground) 12%, transparent)",
      }}
    >
      <header className="mb-6 space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        {description ? (
          <p className="text-sm opacity-70">{description}</p>
        ) : null}
      </header>
      {children}
      {footer ? <div className="mt-6 text-center text-sm opacity-80">{footer}</div> : null}
    </div>
  );
}
