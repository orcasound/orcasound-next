# Frontend Data Contract Rules

## Purpose
Define frontend data-layer standards with **separate contracts** for:
- **Track A**: `orcasound-next` + `orcasite`
- **Track B**: `esp32_ui`

These tracks are intentionally independent in transport, auth, and query-key domains.

## Non-Negotiable Separation
- `orcasound-next`/`orcasite` do **not** call `esp32_api`.
- `esp32_ui` does **not** call Orcasound GraphQL/server endpoints.
- Contracts are parallel in architecture style, not shared in endpoint/auth conventions.

---

## Shared Architectural Principles (Both Tracks)
- Server-state is owned by React Query (or equivalent query cache) when the stack uses TanStack Query.
- Shared UI/session state is owned by a global state layer (Zustand target, or existing project convention while migrating).
- Local component/page state remains local.
- Query keys are factory/generated-hook owned, never hand-crafted inline in JSX.
- DTO-to-domain transforms occur before presentation components.

---

## Track A Contract: `orcasound-next` + `orcasite`

### A0) Policy Provenance (Derived vs Greenfield)
- **Derived from existing Orcasite conventions**:
  - React Query global default `staleTime: 20s`.
  - Generated GraphQL query keys shaped like `['operationName', variables?]`.
  - Option to override query options at call sites.
- **Greenfield additions (explicitly new standards)**:
  - Domain-prefixed key taxonomy (`orca-graphql`, `orca-json`, `orca-external`) for non-generated hooks.
  - Data-class stale/refetch matrix (reference/interactive/near-live/session/rag).
  - Unified error-loading wording and transform-layer boundaries.

### A1) Data Sources and Transports
- Primary: `/server` via GraphQL client/hook generation.
- Secondary: optional JSON endpoints from same Orcasound stack.
- External APIs allowed when explicitly scoped (for example sightings/aux feeds).

### A2) Auth Boundary
- Auth/session follows Orcasound server conventions (GraphQL/session/user token model).
- Socket auth follows Orcasound socket endpoint token usage.
- No `esp32_api` auth headers/tokens are used in this track.

### A3) Query Key Conventions
Current (derived) baseline in generated hooks:
- `['bout', variables]`
- `['bouts']` or `['bouts', variables]`
- `['candidates']` or `['candidates', variables]`

Standard to apply for non-generated/manual query hooks (greenfield):
- `['orca-graphql', '<resource>', '<scope>', { ...params }]`
- `['orca-json', '<resource>', '<scope>', { ...params }]`
- `['orca-external', '<provider>', '<resource>', { ...params }]`
- `['orca-auth', 'currentUser']`
- `['orca-rag', '<mode>', { ...context }]` (only if served by Orcasound stack)

Field mapping for manual keys:
- `domain`: source family (`orca-graphql`, `orca-json`, `orca-external`, `orca-auth`, `orca-rag`).
- `resource`: what the data is about (`candidates`, `feeds`, `feedStreams`, `sightings`).
- `scope`: query intent (`list`, `detail`, `window`, `byId`, `search`).
- `params`: stable serializable inputs (`{ id }`, `{ from, to }`, `{ feedId, playlistTimestamp }`).

Examples:
- `['orca-graphql', 'candidates', 'list', { limit: 100, offset: 0 }]`
- `['orca-json', 'feedStreams', 'window', { feedId, playlistTimestamp }]`
- `['orca-external', 'cascadia', 'sightings', { start, end, bbox }]`

Rules:
- Keep generated GraphQL hook keys unchanged unless codegen strategy changes.
- Migration target for `orcasound-next` beta path: replace manual GraphQL query hooks with generated GraphQL hooks where equivalent operations exist, then remove transitional manual GraphQL keys.
- For manual hooks, key shape is `[domain, resource, scope, params]`.
- `params` must be serializable and stable.
- No non-serializable values in query keys.

### A4) Stale / Refetch Policy by Data Class
Current (derived) baseline:
- Global default stale time is 20s.
- Some manual hooks override to 5 minutes for stream/media assets.
- Many manual hooks currently inherit defaults (no explicit focus/refetch policy).

Target standard (greenfield policy, applied incrementally):
- `reference-data` (feeds, metadata)
  - stale: 5-15 min
  - refetch-on-focus: false
- `interactive-list` (reports/candidates tables)
  - stale: 15-60 sec
  - refetch-on-focus: true
- `near-live` (live detections/socket-reactive views)
  - stale: 0-10 sec
  - socket/poll invalidation allowed
- `session-identity`
  - stale: 1-5 min
  - refetch-on-focus: true
- `rag-response` (if applicable)
  - request-scoped cache
  - no long retention unless explicit replay behavior is intended

### A5) Error / Loading Policy
- Normalize transport errors in the API client layer to typed frontend errors.
- Components consume typed errors, not raw network exceptions.
- Initial load: show skeleton/full placeholder.
- Background refresh: keep stale data visible and show a lightweight refresh indicator.
- Retries: enabled by default for idempotent reads; disabled for auth and validation failures.
- Mutations: show explicit success/failure feedback.

### A6) Transform Placement
- API/client layer: transport + raw DTOs.
- Hook layer: DTO -> domain mapping + query behavior.
- Selector layer: cross-component derived views.
- Component layer: presentation formatting only.

Disallowed:
- Direct data fetch in presentation components.
- Duplicating query payloads into global UI state.
- Storing non-serializable payload artifacts in shared stores.

---

## Track B Contract: `esp32_ui` (calling `esp32_api`)

### B0) Policy Provenance (Derived vs Greenfield)
- **Derived from current `esp32_ui` conventions**:
  - Current project includes Redux slices/thunks and template-local fetch patterns.
  - No repo-wide React Query stale/refetch policy is currently established.
- **Greenfield additions (explicitly new standards)**:
  - Introduce React Query key taxonomy for telemetry/rag/auth domains.
  - Introduce data-class stale/refetch matrix.
  - Introduce typed API error normalization and DTO-domain transform boundaries.

### B1) Data Sources and Transports
- Primary: `esp32_api` telemetry and RAG endpoints.
- Expected transport: REST/JSON (plus streaming boundary for AI route path if added).
- No Orcasound GraphQL dependencies in this track.

### B2) Auth Boundary
- Follow `esp32_api` endpoint auth model only (for example user JWT vs ingest/admin tokens as defined by that backend).
- No Orcasound server/session token assumptions.

### B3) Query Key Conventions
When React Query is adopted in this track, use:
- `['esp-telemetry', '<resource>', '<scope>', { ...params }]`
- `['esp-rag', '<mode>', { ...context }]`
- `['esp-auth', '<identity-scope>']`

Examples:
- `['esp-telemetry', 'timeseries', 'window', { deviceId, from, to, bucket }]`
- `['esp-telemetry', 'summary', 'window', { deviceId, from, to }]`
- `['esp-rag', 'query', { promptHash, timeRange, deviceIds }]`

Rules:
- Stable array shape `[domain, resource, scope, params]`.
- Params must be serializable and deterministic.
- Query-key factories live with hooks.

### B4) Stale / Refetch Policy by Data Class
Current (derived) baseline:
- No explicit React Query stale/refetch policy detected.
- Current refetch behavior is mostly lifecycle-driven by existing page/hook logic.

Target standard (greenfield policy):
- `reference-data` (device catalog, static thresholds)
  - stale: 5-15 min
  - refetch-on-focus: false
- `interactive-list` (history tables, paged results)
  - stale: 15-60 sec
  - refetch-on-focus: true
- `near-live telemetry` (recent windows/live cards)
  - stale: 0-10 sec
  - polling/websocket invalidation allowed
- `session-identity`
  - stale: 1-5 min
  - refetch-on-focus: true
- `rag-response`
  - request-scoped cache
  - no long retention unless explicit replay mode is intended

### B5) Error / Loading Policy
- Normalize transport errors in the API client layer to typed frontend errors.
- Components consume typed errors, not raw network exceptions.
- Initial load: show skeleton/full placeholder.
- Background refresh: keep stale data visible and show a lightweight refresh indicator.
- Retries: enabled by default for idempotent reads; disabled for auth and validation failures.
- Mutations: show explicit success/failure feedback.

### B6) Transform Placement
- API/client layer: transport + raw DTOs.
- Hook layer: DTO -> domain mapping + query behavior.
- Selector layer: cross-component derived views.
- Component layer: presentation formatting only.

Disallowed:
- Direct data fetch in presentation components.
- Mirroring query cache payload into global store.
- Storing non-serializable payload artifacts in shared stores.

---

## Implementation Snapshot References
- `orcasite` global React Query defaults: `ui/src/pages/_app.tsx`
- `orcasound-next` global React Query defaults: `ui/src/pages/_app.tsx`
- `orcasite` generated GraphQL query keys: `ui/src/graphql/generated/index.ts`
- `orcasound-next` generated GraphQL query keys: `ui/src/graphql/generated/index.ts`
- `orcasound-next` manual 5-min stale overrides: `ui/src/hooks/beta/useFeedStreams.tsx`
- `orcasound-next` manual default-inherited live hooks: `ui/src/hooks/beta/useLiveDetections1000.ts`
- `orcasound-next` DTO-to-domain transform composition: `ui/src/hooks/beta/useMasterData.ts`

## Step 2 Definition of Done
- Separate contract sections exist for Track A and Track B.
- Query key domains are non-overlapping across tracks.
- Auth assumptions are track-specific and not cross-contaminated.
- Orcasite-derived policies are identified separately from greenfield additions.
- Stale/refetch, loading/error, and transform-placement rules are documented for both tracks.
- New PRs can be reviewed against the correct track contract without ambiguity.
