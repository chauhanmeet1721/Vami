# ADR 0002 — Frontend ↔ backend auth integration

## Status

Accepted — 2026-09-06

## Context

Backend auth is an Express modular monolith under `/api/auth` with:

- Access JWT in JSON body (`Authorization: Bearer`)
- Refresh JWT in httpOnly cookie `refreshToken` (`credentials: include`)
- Optional email verification gated by `REQUIRE_EMAIL_VERIFICATION`
- Shared Zod DTOs in `@vami/schemas` (duplicated in backend `auth.dto.ts`)
- No CSRF middleware in the current backend (confirmed by code search)

Master Framework: server state ≠ client UI state; do not store session tokens in `localStorage`; prefer typed clients + validation.

## Decision

1. `platform/api` — typed `fetch` envelope matching `ApiResponsePayload`; in-memory `tokenStore`; single-flight `POST /api/auth/refresh` on 401 and on bootstrap.
2. `features/auth` — only module calling auth endpoints that exist in `auth.routes.ts`.
3. Forms validate with `@vami/schemas` via `react-hook-form` + `@hookform/resolvers/zod`.
4. Server cache via TanStack Query (`me`, `sessions`).
5. Routes aligned with email links: `/verify-email?token=`, `/reset-password?token=`.
6. **Do not invent CSRF** until the backend implements it; document gap.
7. Env: `NEXT_PUBLIC_API_URL` (absolute URL). Dev default `http://localhost:5000`.

## Edge cases covered (from backend behavior)

| Case | Handling |
|------|----------|
| Hard reload | Cookie refresh → `/me` |
| Concurrent 401 | Single-flight refresh |
| Refresh failure / reuse detection | Clear memory token; unauthenticated |
| Register + email verification required | Show verify UI; no session |
| Login while pending | 403 → resend verification CTA |
| 422 validation | Map `details[].field` into form errors |
| 429 rate limit | Surface-visible message |
| Network down | TypeError → reachability message |
| Missing reset/verify token | Dedicated invalid-link UI |
| Logout | Call API then clear local session even if API errors |
| Double submit | `isSubmitting` disables controls |

## Consequences

- CSRF remains a backend gap for cookie-authenticated refresh on cross-site deployments (`sameSite: 'none'` in preview/prod). Frontend will add CSRF only after a server contract exists.
- User/admin `/api/users` admin list is **not** wired yet (out of auth workflow scope unless requested).
- `@vami/schemas` must be built (`pnpm --filter @vami/schemas build`) before frontend typecheck in clean CI.
