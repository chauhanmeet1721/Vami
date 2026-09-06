# Frontend Enterprise Architecture Master Framework

**Version:** 1.0  
**Date:** 2026-09-06  
**Scope:** Evidence-graded architectural reasoning for large-scale frontend systems, applied to Vami Phase 1+.  
**Constraint:** Company-specific claims are graded. Inference is never presented as fact. Unknowns are explicit.

---

## 1. Executive summary

World-class frontend architecture is not a single stack. It is a **decision system** that maps product constraints (latency, SEO, auth, real-time, multi-tenant, team count) to structural choices (repo shape, module boundaries, rendering mode, state taxonomy, API style, delivery, observability).

Primary evidence across Meta, Google, Netflix, Uber, Airbnb, Stripe, Shopify, Microsoft, Amazon, Spotify, Cloudflare, and Vercel shows recurring principles:

1. **Organization drives architecture** — Federation, SDUI, and micro-frontends appear when many teams own surfaces concurrently.
2. **Platform vs product** — Design systems and shared plugins pay off after reuse pressure; premature platforms create coupling.
3. **Server state ≠ client UI state** — Remote data is cached/invalidated; local UI state stays local.
4. **Rendering is per-route** — SSR-first consumer surfaces vs interactive CSR apps coexist inside one company.
5. **Extensibility needs a security model** — Sandboxes, typed schemas, constrained component sets.
6. **Migration safety is architecture** — Canaries, replay tests, codemods, change files.
7. **When NOT to use** is as important as when to use.

**Vami (today):** pnpm/Turbo monorepo, Express modular monolith backend, frontend rebuild. Target maturity **Level 2 → Level 3**. Phase 1 implements a modular Next.js App Router shell with tokenized theming and View Transition theme reveal — not micro-frontends, not SDUI, not a global state library.

---

## 2. Research methodology

1. Prefer official engineering blogs, docs, OSS repos, and conference talks.
2. Assign evidence grades to every company claim.
3. Cross-cut taxonomies by problem, not by brand.
4. Build decision matrices with failure modes and “when not to use.”
5. Mark insufficient public evidence as **Unknown**.
6. Verify rapidly changing stack claims against current official docs (Next.js 16, Hydrogen 2026, etc.).

### Evidence grades

| Grade | Meaning |
| --- | --- |
| **Documented** | Official eng blog, docs, RFC, or company talk |
| **Observed** | Public OSS maintained by the company |
| **Inferred** | Strong pattern from multiple primary sources; not asserted as corporate policy |
| **Convention** | Industry-standard recommendation; not company-specific |
| **Unknown** | Insufficient reliable public evidence |

---

## 3. Sources and evidence quality

| Quality | Examples |
| --- | --- |
| High | Meta StyleX/Sapling blogs; Netflix GraphQL Federation posts; Angular/Wiz convergence; Uber Fusion.js/Base Web; Airbnb Ghost Platform; Stripe Apps docs; Shopify Hydrogen/Polaris docs; Cloudflare OpenNext; Next.js docs; Microsoft Fluent UI OSS; Amazon Cloudscape docs/OSS; Spotify eng blogs |
| Medium | Conference talks summarizing internal systems; secondary DeepWiki of public repos (use only with OSS verification) |
| Low / excluded as fact | Anonymous stack lists, unverified LinkedIn posts, undated secondary “who uses what” articles |

Full bibliography: §38.

---

## 4. Architecture taxonomy

| Pattern | Solves | Creates | Justified when | When NOT |
| --- | --- | --- | --- | --- |
| Feature-based / vertical slices | Team ownership of end-to-end features | Cross-cutting duplication risk | Product teams own flows | Tiny apps with &lt; few screens |
| Layered (presentation → domain → infra) | Clear dependency direction | Ceremony; horizontal coupling | Shared domain rules | CRUD-only UI |
| Domain-driven frontend | Aligns UI modules with business domains | Boundary disputes | Complex domain language | Marketing sites |
| Modular monolith | One deployable with internal packages | Requires discipline to avoid spaghetti | Most products &lt; ~50 FE engineers | Hard deploy independence required |
| Package-based modularization | Explicit public APIs between packages | Build graph complexity | Design system / shared libs | Premature package explosion |
| Micro-frontends / host-remote | Independent deploy & team isolation | Runtime cost, version skew, UX inconsistency | Many teams, independent release trains | Single team, shared release |
| Plugin architecture | Extensibility without core forks | Plugin lifecycle & security | Platform products (Uber Fusion) | Simple apps |
| Server-driven UI | Cross-platform parity, fast iteration | Debugging, type/versioning complexity | Multi-client same schema (Airbnb GP) | Static marketing / single web |

**Dependency direction (Convention):** UI → application/features → domain → infrastructure adapters. Never reverse. Public package APIs only; no deep imports across features.

---

## 5. Infrastructure taxonomy

| Layer | Options | Decision factors |
| --- | --- | --- |
| Static/CDN | Object storage + CDN | Latency, cache invalidation, cost |
| SSR/compute | Node containers, serverless, edge isolates | Cold start, Node API compatibility, regional needs |
| Edge | Workers / edge functions | TTL content, auth at edge, geo |
| BFF / gateway | Aggregates backends for UI | Chatty APIs, auth cookie model |
| Preview/staging | Per-PR environments | Review quality vs cost |
| Secrets | Server-only env; never client bundle | XSS blast radius |

**Documented:** Vercel Functions vs Cloudflare Workers/OpenNext trade Node compatibility for isolate cost/latency (Vercel KB, Cloudflare blog). Shopify Oxygen hosts Hydrogen at edge (Shopify docs).

---

## 6. Implementation taxonomy

| Concern | Enterprise practice |
| --- | --- |
| Language | TypeScript as default (Convention; Observed in Fluent, Cloudscape, Hydrogen) |
| Framework | Product-fit (Next/Angular/custom); not ideology |
| Module system | ESM; deep imports for tree-shaking (Cloudscape docs: deep import paths) |
| Codegen | Schema → types/clients; generated code isolated |
| Feature flags | Progressive delivery; config remote from code |
| ADRs/RFCs | Governance for irreversible decisions |

---

## 7. Repository / code structure taxonomy

| Shape | Evidence | Trade-offs |
| --- | --- | --- |
| Monorepo | Meta Sapling/Buck2 (**Documented**); Fluent UI Yarn+Nx (**Observed**) | Single version; needs caching & ownership |
| Polyrepo | Common when org/legal boundaries dominate | Version skew across packages |
| Workspaces | pnpm/yarn/npm | Links packages; still need boundary lint |
| CODEOWNERS | Fluent release/lifecycle generators (**Observed**) | Scales review without central bottleneck |
| Colocated tests | Convention | Faster feedback; avoid orphan `__tests__` dumps |
| Circular deps | Prevent via lint/dep-cruise | Silent architecture rot |

**Preventing unmaintainable FE repos:** package visibility, public API surfaces, incremental/affected builds, codemods for migrations (Meta/Fluent), deprecation automation.

---

## 8. UI architecture taxonomy

| Concept | Role |
| --- | --- |
| Design tokens / semantic tokens | Themeable, brandable, accessible color/type/space |
| Primitives | Button, Input, FocusTrap — stable contracts |
| Headless | Behavior without visuals (Radix-style) |
| Compound / slots | Flexible composition without prop explosion |
| Feature components | Product-specific; may duplicate lightly |
| Design systems | Cloudscape, Fluent, Base Web, Polaris, StyleX ecosystems |

**Reuse vs duplication:** Duplicate twice; abstract on third with ownership. Uber Base Web **overrides API** (**Documented**) balances customization without forks. Cloudscape separates public `index.tsx` from `internal.tsx` (**Observed**) to protect API stability.

**Atomic Design:** Useful vocabulary; empty atom/molecule trees are anti-pattern at Level 1–2.

---

## 9. State architecture taxonomy

### What should be state

| Kind | Store where |
| --- | --- |
| Local UI (open/closed, hover) | Component `useState` |
| Derived | Compute; don’t store |
| URL | Router/searchParams (shareable) |
| Form | Form library or local; submit → server |
| Server/cache | Query library / GraphQL cache |
| Auth session | HttpOnly cookies + server; client knows status only |
| Theme preference | Dedicated theme provider / `html` class |
| Real-time | Connection manager + normalized entities |
| Workflow/wizard | State machine if multi-step with invalid paths |

### What should NOT be state

- Copied props; redundant derived values; entire server DB mirrored client-side; theme in Redux.

### Libraries / models

| Model | When | When NOT |
| --- | --- | --- |
| Redux-style | Complex client workflows, time-travel needs | Server-cache-shaped data |
| Atomic (Jotai/Recoil-like) | Fine-grained UI | Unbounded atom sprawl |
| Signals | Fine-grained reactivity (Angular Signals / Google Wiz adoption — **Documented**) | Team unfamiliar + small app |
| State machines | Auth flows, wizards, media players | Simple toggles |
| Normalized caches | GraphQL/entity UIs (Netflix — **Documented**) | Tiny REST lists |

---

## 10. Data / API architecture taxonomy

| Style | Solves | Failure modes |
| --- | --- | --- |
| REST | Simple resources, caching | Over/under-fetch; chatty UIs |
| GraphQL / Federation | Client-shaped queries; multi-team schema (Netflix — **Documented**) | N+1, gateway complexity |
| RPC (tRPC/gRPC-web) | End-to-end types | Coupling FE/BE deploy |
| BFF | UI-optimized aggregation | Extra hop; ownership |
| Typed/generated clients | Contract safety | Stale codegen |
| Runtime validation (Zod) | Malformed responses | Perf cost if naive |

**Consistency patterns:** stale-while-revalidate; optimistic update + rollback; idempotent mutations; request cancellation; cursor pagination; dedupe; retries with backoff only on safe/idempotent ops.

---

## 11. Rendering taxonomy

| Mode | SEO | Personalization | Cost | Complexity |
| --- | --- | --- | --- | --- |
| CSR | Weak without prerender | Easy | Cheap hosting | Hydration/JS weight |
| SSR | Strong | Strong | Compute | TTFB, cache keys |
| SSG | Strong | Weak | Cheap CDN | Rebuild |
| ISR | Strong | Medium | Balanced | Revalidation bugs |
| Streaming SSR / RSC | Strong | Strong | Compute | Mental model |
| Islands / partial hydration | Strong | Medium | Lower JS | Framework support (Google Wiz influence — **Documented**) |
| Edge render | Strong | Cookie/geo limited | Isolate limits | Node API gaps |

**Rule:** Choose **per route**, not per ideology. Authenticated dashboards often CSR/SSR hybrid; marketing SSG/ISR; search-like SSR-first.

---

## 12. Dynamic UI taxonomy

| Approach | Flexibility | Safety | Ops cost |
| --- | --- | --- | --- |
| Config/feature flags | Medium | High if typed | Medium |
| Schema/metadata-driven forms | High | Needs validators | Medium |
| Server-driven UI | Very high | Schema versioning critical (Airbnb — **Documented**) | High |
| Plugin / iframe extensions | High | Sandbox required (Stripe — **Documented**; Shopify remote-dom — **Documented**) | High |
| CMS-driven | Content high | Preview/versioning | Medium |
| Role/permission-driven | Medium | Server must enforce | Medium |

**When NOT SDUI:** Single web client, low change frequency, strong design-system ownership already.

---

## 13. Asset architecture taxonomy

| Asset | Practice |
| --- | --- |
| Images | Responsive `srcset`, modern formats (AVIF/WebP), CDN transforms, lazy load |
| SVG icons | Sprite or components; sanitize untrusted SVG |
| Pattern/wallpaper SVG | Static first-party asset; CSS mask for theming (Vami Phase 1) |
| Fonts | Subset, `font-display`, self-host when privacy matters |
| User uploads | Signed URLs, virus scan, content-type allowlist, tenant isolation |
| Versioning | Content hashes; long cache; immutable URLs |

---

## 14. Performance architecture

**Lab:** Lighthouse, bundle budgets, React Profiler.  
**Field:** RUM / Core Web Vitals (LCP, INP, CLS).

Levers: code split, tree shake, deep imports, virtualize large lists, defer non-critical JS, image/font budgets, avoid layout thrash, limit third parties, preferential prefetch.

**Documented:** Google Wiz minimizes critical JS via SSR + selective hydration; Spotify rebuilt web player for maintainability and continuous delivery (**Documented**).

---

## 15. Security architecture

### Frontend can enforce (defense in depth)

CSP, Trusted Types where available, output encoding, safe URL schemes, iframe sandbox, `postMessage` origin checks, dependency scanning, avoiding `dangerouslySetInnerHTML` with untrusted input, secure cookie flags via server.

### Must be server-enforced

AuthN/AuthZ, tenant isolation, CSRF on cookie sessions, rate limits, business rules, PII access, file permissions.

| Threat | Mitigation |
| --- | --- |
| XSS | Encode, CSP, sanitize HTML/SVG |
| CSRF | SameSite + tokens for cookie auth |
| Token theft | Prefer HttpOnly cookies over localStorage |
| Supply chain | Lockfiles, audit, pin, minimal deps |
| SSR/hydration mismatch | Deterministic initial HTML; no secrets in RSC payload |

---

## 16. Reliability / resilience architecture

- Route/feature error boundaries; isolate failure domains.
- Classify errors: retryable vs fatal; auth expiry → re-auth flow.
- Graceful degradation: cached UI, offline banners.
- Crash reporting with PII scrubbing.
- Timeouts on all network calls.

---

## 17. Testing architecture

| Layer | Test | Avoid |
| --- | --- | --- |
| Unit | Pure logic, validators | Implementation details |
| Component | Interactions, a11y roles | Snapshot spam |
| Integration | Feature flows with MSW | Full browser always |
| Contract | API schema compatibility | Ignoring version skew |
| E2E | Critical paths only | Entire suite as unit substitute |
| Visual | Design system regressions (Fluent — **Observed**) | Every page forever |
| Perf | Budgets in CI | Only manual Lighthouse |

Flakes: quarantine, deterministic clocks, retry policy with root-cause ownership.

---

## 18. CI/CD architecture

- PR validation: typecheck, lint, unit, affected builds (Nx/Turbo).
- Remote cache for monorepos.
- Preview environments.
- Progressive delivery: flags, canaries (Netflix sticky canaries — **Documented**).
- Rollback + version-skew plans (old tab + new API).

---

## 19. Observability architecture

Monitor: JS errors, CWV, API latency/error rate, funnel metrics, deployment health, bundle size trends. Correlate with `trace`/`request` IDs. Session replay only with consent and redaction.

---

## 20. Accessibility architecture

A11y is API design: focus management, keyboard ops, ARIA for composite widgets, live regions for async updates, reduced motion, contrast tokens. Cloudscape/Fluent/Base Web treat focus and controllable patterns as component contracts (**Documented/Observed**).

---

## 21. Internationalization architecture

Message catalogs, plural/select ICU, locale fallback, RTL logical CSS, date/number/currency via `Intl`, localized validation messages, text expansion layouts, locale-aware routes when SEO requires.

---

## 22. Offline architecture

Justified for field tools, creative apps, poor connectivity. Otherwise: online-first with retry queues for mutations is enough. Offline-first needs conflict resolution (CRDT/OT or server-authoritative) — high cost.

---

## 23. Real-time architecture

| Transport | Use |
| --- | --- |
| WebSocket | Bidirectional, presence, collab |
| SSE | Server → client streams |
| Polling | Low frequency / simple |

Handle ordering, duplicates, reconnect/resync, missed events. Collab editing: CRDT vs OT vs server-authoritative — pick explicitly.

---

## 24. AI frontend architecture

Streaming tokens, cancellation, structured output validation, tool-call UX, partial generation UI, conversation persistence, provider fallback, safety filters, citations display. Treat model latency as first-class UX (skeletons, stop, regenerate). Do not trust model output as executable UI without schema validation.

---

## 25. Team / organizational scalability

| Engineers | Typical architecture |
| --- | --- |
| 5 | Modular monolith, few packages |
| 20 | Feature folders + design tokens; light platform |
| 50 | Dedicated platform; CODEOWNERS; ADRs |
| 100+ | Strong package boundaries; possibly MFE/federation |
| Hundreds | Internal platforms, build systems (Buck/Nx), migration tooling |

---

## 26. Code-quality standards

Cohesion high, coupling low, typed public APIs, explicit side effects, testable pure cores, deterministic rendering, backward-compatible exports, measurable complexity (not vanity coverage %). Quantitative: bundle budgets, typecheck gate, lint, flake rate. Qualitative: reviewability, naming, escape hatches.

---

## 27. Dependency / supply-chain architecture

Lockfiles committed; minimal deps; audit CI; license allowlist; duplicate detection; peerDep discipline; reproducible installs; avoid vendoring unless necessary.

---

## 28. Cost architecture

CDN egress, image transforms, SSR compute, CI minutes, observability SaaS, third-party scripts (also user CPU/battery). Prefer static/ISR where personalization allows. Cloudflare vs Vercel choice often cost+runtime compatibility (**Documented**).

---

## 29. Browser / runtime edge cases

| Scenario | Architecture response |
| --- | --- |
| Tab suspension / bfcache | Revalidate on `pageshow`; avoid assuming timers ran |
| Stale tab after deploy | Version check / soft reload; tolerant APIs |
| Storage quota / failure | Try/catch; memory fallback; user messaging |
| SW update | Controlled skipWaiting; never break mid-session silently |
| Clock/timezone change | Prefer server timestamps for critical logic |
| Low-end device | Budget JS; virtualize; reduce animation |

---

## 30. Deployment / version-skew scenarios

| Skew | Strategy |
| --- | --- |
| New FE / old BE | Feature detect; compatible clients |
| Old FE / new BE | Additive APIs; deprecation windows |
| Stale CDN HTML | Short HTML TTL; hashed assets long TTL |
| Old service worker | Versioned caches; update prompts |
| Long-lived tab | Soft navigation reload policy |

---

## 31. Enterprise company comparison matrix

Populate only with reliable evidence. Cells: short note + grade.

| Dimension | Google | Meta | Netflix | Amazon | Microsoft | Uber | NVIDIA | Stripe | Airbnb | Shopify |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Primary public FE framework story | Angular + internal Wiz converging (**Documented**) | React + StyleX (**Documented**) | React clients + GraphQL federation (**Documented**) | Cloudscape React DS (**Documented/Observed**) | Fluent UI React monorepo (**Observed**) | Fusion.js + React (**Documented**) | Unknown (GPU/product focus; no clear FE platform public story) | React + sandboxed Apps UI (**Documented**) | React + Ghost SDUI (**Documented**) | Hydrogen (React Router) + Polaris (**Documented**) |
| Repo / build | Angular monorepo public; internal Wiz Unknown | Sapling monorepo, Buck2 (**Documented**) | Unknown (service-oriented BE public) | Cloudscape OSS packages (**Observed**) | Yarn workspaces + Nx (**Observed**) | Unknown at org scale | Unknown | Unknown | Unknown | Hydrogen OSS (**Observed**) |
| Design system | Material (public); internal Unknown | StyleX; Astryx/XDS internal (**Documented**) | Unknown | Cloudscape (**Documented**) | Fluent (**Observed**) | Base Web (**Documented**) | Unknown | Stripe UI toolkit for Apps (**Documented**) | DLS + Linaria journey (**Documented**) | Polaris web components (**Documented**) |
| API for UI | Unknown mixed | GraphQL historically (OSS Relay) (**Observed**) | Federated GraphQL (**Documented**) | Unknown | Unknown | Unknown | Unknown | REST-first public APIs (**Documented**) | Shared GraphQL for SDUI (**Documented**) | Storefront / Admin GraphQL (**Documented**) |
| Rendering emphasis | SSR-first Wiz; interactive Angular (**Documented**) | Highly interactive CSR apps (**Inferred**) | Client apps + API layer (**Documented**) | Console CSR (**Inferred**) | Mixed (**Inferred**) | Universal SSR Fusion (**Documented**) | Unknown | Dashboard + iframe extensions (**Documented**) | Native multi-platform SDUI (**Documented**) | Edge SSR Hydrogen/Oxygen (**Documented**) |
| Extensibility | Unknown | Internal platforms (**Documented**) | DGS ownership (**Documented**) | Unknown | Package generators (**Observed**) | Fusion plugins (**Documented**) | Unknown | Iframe sandbox Apps (**Documented**) | SDUI sections/actions (**Documented**) | UI extensions + remote-dom (**Documented**) |
| Delivery safety | RFC process for Angular (**Documented**) | Codemods at scale (**Documented**) | A/B, replay, canaries (**Documented**) | Unknown | Beachball change files (**Observed**) | Unknown | Unknown | App review/submit (**Documented**) | Unknown | Preview envs on Oxygen (**Documented**) |

**Also researched:**

| Company | Notes |
| --- | --- |
| Spotify | New Web Player React+Redux; left iframe-isolated views; Platform APIs for web+desktop (**Documented**). Micro-frontend claims in secondary sources → treat carefully; primary blog emphasizes simpler SPA over iframes. |
| LinkedIn | Historical Ember/Pemberly public material exists; current stack claims often secondary → many cells **Unknown** without fresh primary confirmation. |
| Cloudflare | Workers + OpenNext for Next.js; caching via R2/KV/D1/DO (**Documented**). |
| Vercel | Next.js hybrid rendering platform (**Documented**). |
| Apple | Public FE product architecture largely **Unknown**; WebKit multi-process/GPU process is browser engine security (**Documented**), not app FE architecture. |

---

## 32. Architecture decision matrices

Format: **Problem → Options → Factors → Recommended → When NOT → Trade-offs → Failure modes**

### Global client state
→ Options: none / Context / Redux / atomic  
→ Recommend: local + URL + server-cache; global only for truly cross-cutting session UI  
→ NOT: server lists in Redux  
→ Failures: stale sync, unnecessary rerenders

### Server-state library
→ Options: fetch ad hoc / TanStack Query / Apollo / RTK Query  
→ Recommend: dedicated server-state lib when &gt; few queries  
→ NOT: one-shot marketing pages  
→ Failures: cache key bugs, over-invalidation

### GraphQL vs REST vs BFF
→ GraphQL/federation when many clients & multi-team schema (Netflix)  
→ REST when resource model clear  
→ BFF when UI needs aggregation without public graph  
→ Failures: gateway outages, schema conflicts

### SSR / CSR / RSC / edge
→ Per-route: public SEO → SSR/SSG/ISR; app shell authenticated → hybrid; edge when geo+short compute  
→ NOT: edge for heavy Node-native deps without adapter support  
→ Failures: cache personalization leaks, hydration mismatch

### Micro-frontends
→ Only with independent deploy + team isolation needs  
→ NOT: Vami Phase 1–3 single product team  
→ Failures: duplicate deps, CSS clashes, UX drift, version skew

### Monorepo
→ Default for Vami (already present)  
→ NOT: unrelated products with separate compliance boundaries  
→ Failures: slow CI without affected/caching

### Design system / Atomic Design
→ Tokens + primitives when 2+ surfaces or many engineers  
→ NOT: empty atomic folder trees on day 1  
→ Failures: abstraction theater

### Feature-based architecture
→ Default as features appear  
→ Failures: shared folder dumping ground

### Dynamic / server-driven UI
→ Multi-platform parity / rapid layout experiments  
→ NOT: static root layout Phase 1  
→ Failures: untyped payloads, client crashes on unknown components

### WebSockets / offline-first / service workers
→ Real-time collaboration / field offline  
→ NOT: decorative shell  
→ Failures: sync conflicts, SW serving stale app forever

### CDN / edge rendering
→ Global static & cacheable HTML  
→ Failures: wrong cache keys for personalized HTML

---

## 33. Edge-case matrices

For each: **Detection → Prevention → Runtime → Recovery → Observability → UX**

### Network
| Scenario | D→P→R→Rec→O→UX |
| --- | --- |
| Slow | RUM TTFB; budgets; skeletons; retry idempotent; latency metrics; progress |
| Offline | `online` event; queue mutations; read-only/cached; sync later; offline counter; banner |
| Timeout | AbortController; timeouts; cancel in-flight; retry policy; timeout rate; friendly error |
| Stale/out-of-order | timestamps/ETags; ignore older responses; show freshness; refetch; race metrics; subtle refresh |
| Duplicate mutation | idempotency keys; disable button; server dedupe; reconcile; dup rate; confirmation |

### Browser
| Scenario | Summary |
| --- | --- |
| Unsupported VT API | Feature detect; instant theme swap; no crash |
| Reduced motion | `matchMedia`; skip reveal animation |
| Storage fail | catch; memory theme; still usable |
| Suspended tab | revalidate on focus |

### Deployment
| Scenario | Summary |
| --- | --- |
| FE/BE skew | additive APIs; compatible clients; error taxonomy |
| Stale CDN | hashed assets; short HTML cache |
| Deploy mid-session | soft reload prompt if chunk 404 |

### User
| Scenario | Summary |
| --- | --- |
| Double click | disable during pending |
| Multi-tab theme | `storage` event / next-themes sync |
| Nav during mutation | confirm or keep request; optimistic reconcile |

### Data
| Scenario | Summary |
| --- | --- |
| Malformed | runtime schema parse; error boundary; report |
| Unknown fields | ignore extras; version field |
| Huge payload | pagination; truncate UI |

### UI
| Scenario | Summary |
| --- | --- |
| Long/i18n text | flexible layouts; no fixed widths |
| RTL | logical properties |
| Missing asset | fallback color/pattern |
| Theme toggle spam | ignore overlapping transitions |

---

## 34. Enterprise maturity model

| Level | Criteria | Exit to next |
| --- | --- | --- |
| **1 Basic** | App runs; ad hoc structure | TS, lint, basic layout system |
| **2 Production** | Testing smoke, monitoring hooks, security basics, perf budgets started, theme/tokens | Feature folders, server-state boundaries, CI gates |
| **3 Scalable** | Clear state/data boundaries, CI/CD discipline, a11y in components, previews | Platform package, CODEOWNERS, ADRs, RUM SLOs |
| **4 Enterprise** | Multi-team governance, progressive delivery, formal security/privacy, design system | Multi-product platform, federation/MFE only if needed |
| **5 Large-scale platform** | Multi-region, extensibility sandbox, sophisticated build, org-wide migration tooling | N/A |

**Vami Phase 1 goal:** solid **Level 2** shell; path to **Level 3** as auth/features land.

---

## 35. Recommended reference architecture (Vami)

```text
Vami/
  frontend/          # Next.js App Router (modular monolith)
  backend/           # Express modular monolith (existing)
  packages/schemas/  # Shared Zod/types (existing)
  docs/              # ADRs + this framework
```

### Phase 1+ structure (current)

```text
frontend/src/
  app/                 # thin App Router routes + providers
  platform/            # theme, motion, API client, config, tokens
  shared/              # layout shell, ui primitives, icons, cn
  features/auth/       # vertical slice (API, providers, forms)
```

| Decision | Choice | Evidence basis |
| --- | --- | --- |
| Scaffold | `pnpm create next-app@latest frontend` | Official Next.js CLI (**Documented**) |
| Structure | `app` + `platform` + `shared` + `features` | Platform vs product (**Convention**; ADR 0001/0003) |
| Theme | `next-themes` + CSS variables | Theme as platform, not Redux (**Convention**) |
| Reveal | VT + clip-path; 400ms + `easeInOutQuad` | Telegram `LaunchActivity` + `Easings.java` (**Documented**) |
| Icons | `@phosphor-icons/react` via `shared/icons` | Polaris/Fluent ship SVG icon packages (**Documented**) |
| Background | First-party SVG + CSS mask tint | Asset theming; avoid untrusted SVG (**Convention** + security) |
| Server state | TanStack Query in auth feature | Server state ≠ UI state (**Convention**) |
| Auth | Bearer access + httpOnly refresh cookie | Backend contract (**Documented** in ADR 0002) |
| MFE/SDUI/SW | Not used | Org scale insufficient (**Inferred** from Netflix/Airbnb justification patterns) |

### Later phases (not now)

- Shared UI package extract when reuse ≥ 3 product areas
- CSRF strategy when backend adds it
- RUM + error monitoring
- Playwright critical-path E2E

---

## 36. Anti-patterns and what to avoid

1. Micro-frontends for a single team.
2. Global store for server cache or theme.
3. Premature design-system monorepo packages.
4. Atomic Design folder cosplay with no components.
5. SDUI without schema versioning and unknown-component handling.
6. localStorage tokens for session auth.
7. Ignoring version skew / long-lived tabs.
8. Animations without `prefers-reduced-motion` fallback.
9. Claiming “Company X uses Y” without evidence.
10. Optimizing for tech count instead of decision quality.

---

## 37. Research gaps / unknowns

- Apple first-party web app FE architecture: **Unknown**.
- NVIDIA product web FE platform: **Unknown**.
- Amazon consumer (non-Cloudscape) FE internals: largely **Unknown**.
- LinkedIn current production stack (post-Ember): **insufficient primary confirmation**.
- Spotify whether production web player is formally micro-frontends today: **primary 2019/2021 blogs emphasize SPA consolidation**; secondary MFE claims unverified here.
- Meta consumer web rendering details beyond StyleX: partially **Unknown**.
- Exact Netflix web (not mobile/studio) client stack nuances: partially **Unknown**.

---

## 38. Source bibliography

1. Meta — StyleX: https://engineering.fb.com/2025/11/11/web/stylex-a-styling-library-for-css-at-scale/  
2. Meta — Sapling monorepo branching: https://engineering.fb.com/2025/10/16/developer-tools/branching-in-a-sapling-monorepo/  
3. Meta — Buck2: https://engineering.fb.com/2023/04/06/open-source/buck2-open-source-large-scale-build-system/  
4. Meta — Astryx: https://astryx.atmeta.com/blog/how-astryx-works  
5. Google/Angular — Angular and Wiz: https://blog.angular.dev/angular-and-wiz-are-better-together-91e633d8cd5a  
6. Netflix — GraphQL Federation Part 1/2: https://netflixtechblog.com/how-netflix-scales-its-api-with-graphql-federation-part-1-ae3557c187e2  
7. Netflix — Migrating to GraphQL safely: https://netflixtechblog.com/migrating-netflix-to-graphql-safely-8e1e4d4f1e72  
8. Uber — Fusion.js: https://www.uber.com/us/en/blog/fusionjs-web-framework/  
9. Uber — Base Web: https://www.uber.com/us/en/blog/introducing-base-web/  
10. Airbnb — Server-driven UI: https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5  
11. Airbnb — Linaria: https://airbnb.tech/web/airbnbs-trip-to-linaria-2/  
12. Stripe — Apps UI extensions: https://docs.stripe.com/stripe-apps/how-ui-extensions-work  
13. Shopify — Hydrogen fundamentals: https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals  
14. Shopify — Polaris: https://shopify.dev/docs/api/polaris  
15. Amazon — Cloudscape: https://cloudscape.design/ ; https://github.com/cloudscape-design/components  
16. Microsoft — Fluent UI: https://github.com/microsoft/fluentui  
17. Spotify — New Web Player: https://engineering.atspotify.com/2019/3/building-spotifys-new-web-player  
18. Spotify — Desktop/Web shared UI: https://engineering.atspotify.com/2021/04/building-the-future-of-our-desktop-apps  
19. Cloudflare — OpenNext adapter: https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/  
20. Vercel — Next.js docs / create-next-app: https://nextjs.org/docs  
21. MDN — View Transitions API: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using  
22. WebKit — Multi-process architecture: https://docs.webkit.org/Deep%20Dive/Architecture/WebKit2.html  

---

*End of Master Framework v1.0. Update evidence grades as new primary sources appear; never fill Unknown with speculation.*
