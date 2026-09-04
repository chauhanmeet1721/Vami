# Packages

Shared workspace packages for the Vami monorepo.

## `@vami/schemas`

Zod auth contracts (login, register, password reset, verify email, refresh body).

- Source: `packages/schemas/src/index.ts`
- Frontend imports via `@vami/schemas` (tsconfig path + workspace dep)
- Backend DTOs in `backend/src/modules/auth/dtos/auth.dto.ts` must stay in sync until the schemas package is wired into the CommonJS `tsc` build graph

To add another package: create `packages/<name>`, add `"@vami/<name>": "workspace:*"` in consumers.
