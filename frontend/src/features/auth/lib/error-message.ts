import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/platform/api";

/** Maps known API failures to user-visible copy — no invented status handling. */
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    if (error instanceof TypeError) {
      return "Unable to reach the server. Check that the API is running and NEXT_PUBLIC_API_URL is correct.";
    }
    return fallback;
  }

  if (error.isRateLimited) {
    return error.message || "Too many attempts. Please wait and try again.";
  }

  if (error.isValidation && error.fieldErrors.length > 0) {
    return error.fieldErrors.map((e) => e.message).join(" ");
  }

  return error.message || fallback;
}

export function applyFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
): void {
  if (!(error instanceof ApiError) || !error.isValidation) return;
  for (const item of error.fieldErrors) {
    setError(item.field as FieldPath<TFieldValues>, {
      type: "server",
      message: item.message,
    });
  }
}
