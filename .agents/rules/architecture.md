# Vami — Workspace Architecture Rules

These rules govern every code contribution to the Vami codebase.
They are derived from the architecture decisions made during the initial build phase
and reflect industry practices from OWASP, TanStack, and enterprise React patterns.
Do not change these rules without updating the underlying architecture first.

---

## 1. State Management Rules

### 1.1 The Three-Layer State Decision Tree
Before creating ANY state, ask in order:

1. **Does it come from the server (API)?** ? Use **TanStack Query** (`useQuery`, `useMutation`). Never use `useState + useEffect` for server data.
2. **Is it UI-only and shared across non-parent components?** ? Use **Zustand** (`useUIStore` or a new domain slice).
3. **Is it static configuration that changes at most once per session?** ? Use **React Context** (existing `AuthProvider` is the only Context in the app).

### 1.2 Forbidden Patterns
- Never store server lists (messages, session lists, user directories) in Zustand or ad-hoc Context.
- `AuthProvider` may hold **identity only** (`user`, auth flags) from boot `/auth/me` — not feature domain lists. See §16.
- Never use `useState + useEffect` to fetch API data for features. Use `useQuery` instead. Exception: AuthProvider boot refresh/me sequence (§16).
- Never create a new Context provider without approval. The only allowed Context is `AuthProvider`.
- Never use Redux or any additional global state library.

### 1.3 TanStack Query Keys Convention
Query keys must be arrays following this pattern:
```
['auth', 'sessions']           // list
['auth', 'me']                 // singleton
['messages', conversationId]   // by ID
['users', userId, 'profile']   // nested
```

---

## 2. Validation Architecture Rules

### 2.1 Single Source of Truth — Zod
- All validation schemas live in `<feature>/schemas/<feature>.schemas.ts`.
- Backend DTOs and frontend schemas must enforce the same rules for the same fields.
- TypeScript types are inferred from Zod. Never write types manually for validated data.

### 2.2 Form Architecture
- Every form uses **React Hook Form** with `zodResolver`. No raw onSubmit + manual validation.
- Validation mode is `onTouched`.
- For controlled third-party components use `<Controller>`. For standard HTML inputs use `register`.

### 2.3 Backend Validation
- Every route that accepts a body MUST use `validate(schema)` middleware before the controller.
- Controllers never validate data — that is the middleware's responsibility.

---

## 3. Global Error Handling Rules

### 3.1 Backend
- All errors thrown in controllers/services must be subclasses of `AppError`.
- Never call `res.json({ error: ... })` directly. Always throw and let `errorHandler` respond.
- Available: `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `ValidationError` (422).

### 3.2 Frontend — Toasts
- All API errors shown to users must go through Sonner: `toast.error(msg)`.
- Never use `alert()` or render error text inline in layouts.
- 422 Validation errors must be mapped to form fields via `setError()`, NOT shown as a toast.

### 3.3 Frontend — Error Boundaries
- The root `<ErrorBoundary>` in `providers.tsx` catches unrecoverable crashes.
- Wrap each major feature section with its own `<ErrorBoundary>`.
- Error boundaries are placed at the route group layout level, not inside individual pages.

---

## 4. Authentication Architecture Rules

### 4.1 Token Handling
- Access tokens: memory only (`inMemoryAccessToken`). NEVER localStorage or sessionStorage.
- Refresh tokens: HttpOnly cookies only. NEVER readable by JavaScript.
- Never put tokens in the URL.

### 4.2 API Calls
- All API calls must go through `ApiClient`. Direct `fetch()` calls are forbidden.
- `ApiClient` handles 401 ? refresh ? retry transparently. No component implements this.

### 4.3 Route Protection
- Auth-required pages: `app/(app)/` protected by `AppLayout`.
- Guest-only pages: `app/(auth)/` protected by `AuthLayout`.
- `ProtectedRoute` belongs in layout files only, never inside page components.

### 4.4 `useAuth()` Hook
- Returns identity state only: `user`, `isAuthenticated`, `isLoading` (and related flags).
- Auth actions (`login`, `register`, `logout`) live in TanStack Query mutation hooks — not on `useAuth()`.
- Only for Client Components. Do not pass `user` as props — components call `useAuth()` directly.

---

## 5. Backend Architecture Rules

### 5.1 CSR Pattern
- **Controller**: HTTP only. Zero business logic.
- **Service**: All business logic. Zero HTTP or database knowledge.
- **Repository**: All database queries. Implements a TypeScript interface.
- To swap databases: only the Repository implementation changes.

### 5.2 Module Structure
```
modules/<name>/
  controllers/   services/   repositories/
  models/        dtos/       routes/   index.ts
```

### 5.3 Dependency Injection
- Services receive repositories via constructor injection.
- DI wiring happens in the module `index.ts` barrel.

### 5.4 Response Format
Always use `ApiResponse.success()` or `ApiResponse.error()`. Never deviate from:
`{ success: boolean, message: string, data?: T, details?: unknown }`

---

## 6. File & Import Rules

### 6.1 Frontend Barrel Imports
- Import from feature barrels: `import { useAuth } from '@/features/auth'`
- Import from atomic barrel: `import { Button } from '@/components/atomic/atoms'`
- Use `@/` alias everywhere. No relative `../../` imports.

### 6.2 File Naming
- React components: `PascalCase.tsx`
- Utilities, hooks, stores: `camelCase.ts` or `kebab-case.ts`
- Schemas, DTOs: `<name>.schemas.ts`, `<name>.dto.ts`

---

## 7. Monorepo Shared Packages

- Workspace already uses pnpm + Turborepo. Shared contracts belong in `packages/*` (e.g. `@vami/schemas`).
- Frontend/backend `src/core/` remains app-local until extracted intentionally.
- SSO: New products add entries to `User.apps[]`. No schema migration needed.
- Import paths with `@/core/*` and `@/features/*` remain valid after package extraction.

---

## 8. Security Rules (Non-Negotiable)

- NEVER use `Math.random()` for security-related values. Use `crypto.randomUUID()` or `crypto.randomBytes()`.
- NEVER log sensitive data (passwords, tokens, PII).
- NEVER return the `password` field from a repository query unless `includePassword: true` is explicit.
- NEVER expose raw error stack traces to the client in production.
- Every new Express route that modifies state MUST use the `authenticate` middleware unless explicitly public.
- Every new public POST route MUST have a rate limiter.

---

## 9. Token Blocklist
- Every access token MUST have a `jti` claim.
- On logout, `jti` MUST be stored in Redis blocklist, TTL = JWT_ACCESS_EXPIRES_IN.
- `authenticate` middleware MUST check blocklist before accepting any token.

## 10. SecurityStamp Validation
- `authenticate` middleware MUST validate `decoded.securityStamp` against current DB stamp.
- Use Redis cache (`stamp:<userId>`, TTL 30s) — never hit DB per request.
- Rotate securityStamp on: password change, password reset, account suspension.

## 11. Access Token Storage (Memory ONLY)
- `inMemoryAccessToken` is the ONLY storage.
- `sessionStorage` is FORBIDDEN for tokens.
- On page refresh: AuthProvider calls `/auth/refresh` first, then `/auth/me`.

## 12. Email Verification
- New users: `status: 'pending'`, `isEmailVerified: false`.
- Token stored as SHA-256 hash in `email_verifications`.
- Enforcement gated by `REQUIRE_EMAIL_VERIFICATION` env flag.

## 13. Password Reset
- Tokens stored as SHA-256 hash in `password_resets`, TTL 1h.
- Reset MUST rotate securityStamp + revoke ALL sessions + invalidate stamp cache.

## 14. Next.js Edge Middleware
- `middleware.ts` exists at `frontend/src/` — cookie presence check only.
- `ProtectedRoute` remains as client-side secondary guard.

## 15. ApiClient Unauthenticated Callback
- `ApiClient.onUnauthenticated` registered by AuthProvider on mount.
- When refresh fails → `onUnauthenticated` dispatches LOGOUT.
- No component implements 401 handling directly.

## 16. Auth Mutations via TanStack Query
- `login`, `register`, `logout` MUST use `useMutation` hooks.
- `AuthProvider` holds identity state ONLY — does NOT call the API.
- Mutations call the API via TanStack Query, dispatch to AuthProvider via `useAuthDispatch()`.
- Boot-time `/auth/refresh` + `/auth/me` sequence is the ONLY API call AuthProvider makes.

## 17. Rate Limiter Backing Store
- Redis store (rate-limit-redis) in preview/production.
- In-memory ONLY acceptable in local development.

## 18. Zod Version Lock
- Both frontend and backend on Zod v4 — same major version always.

## 19. JWT Library (jose)
- Use `jose` library exclusively for JWT operations.
- NEVER use `jsonwebtoken` — it is legacy.
- Algorithm: HS256 for symmetric (current), with path to RS256/EdDSA for future multi-service.

## 20. Logging
- Use Pino (+ pino-http) exclusively in backend.
- `console.log/warn/error` are FORBIDDEN in production code — use logger.
- All HTTP requests logged via pino-http middleware.
- Dev: pino-pretty, Production/Preview: structured JSON.
