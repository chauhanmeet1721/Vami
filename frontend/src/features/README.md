# Feature modules

Vertical slices live here as the product grows.

## Layer map (Master Framework)

```text
app/           → routes only (thin composition)
platform/      → theme, motion, API client, config, tokens
shared/        → layout, ui primitives, icons, cn
features/*     → product capability (auth today)
```

## `auth` (implemented)

Integrates only endpoints from `backend/.../auth.routes.ts`.
Uses `@vami/schemas`, TanStack Query, and `shared/ui` + `shared/icons`.
