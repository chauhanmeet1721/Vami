/**
 * Shared class-name helper for presentation primitives.
 * Master Framework: utilities in shared; no feature domain logic here.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
