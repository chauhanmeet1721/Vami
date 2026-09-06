/**
 * Matches backend `ApiResponsePayload` in
 * `backend/src/core/utils/response.util.ts` (evidence-backed).
 */
export type ApiResponsePayload<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
};

/** Field errors from backend ValidationError (HTTP 422). */
export type ApiFieldError = {
  field: string;
  message: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidation(): boolean {
    return this.status === 422;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get fieldErrors(): ApiFieldError[] {
    if (!Array.isArray(this.details)) return [];
    return this.details.filter(
      (item): item is ApiFieldError =>
        typeof item === "object" &&
        item !== null &&
        "field" in item &&
        "message" in item,
    );
  }
}
