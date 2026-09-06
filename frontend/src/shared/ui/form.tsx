import { cn } from "@/shared/lib/cn";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  WarningIcon,
} from "@/shared/icons";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor: string;
};

/** Shared form field shell — Cloudscape/Fluent controllable pattern. */
export function FormField({ label, error, children, htmlFor }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium opacity-90">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border bg-transparent px-3 text-sm outline-none",
        "border-[color-mix(in_srgb,var(--foreground)_14%,transparent)]",
        "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--toggle-bg)_70%,transparent)]",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-opacity",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "text-[var(--toggle-fg)]",
        variant === "ghost" && "border bg-transparent",
        className,
      )}
      style={
        variant === "primary"
          ? {
              background: "var(--toggle-bg)",
              boxShadow: "var(--toggle-shadow)",
            }
          : {
              borderColor:
                "color-mix(in srgb, var(--foreground) 14%, transparent)",
            }
      }
      {...props}
    />
  );
}

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const color =
    tone === "success"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "info"
        ? "opacity-80"
        : "text-red-600 dark:text-red-400";

  const Icon =
    tone === "success"
      ? CheckCircleIcon
      : tone === "info"
        ? EnvelopeIcon
        : WarningIcon;

  return (
    <p
      role="status"
      className={cn("flex items-start gap-2 rounded-xl text-sm", color)}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
