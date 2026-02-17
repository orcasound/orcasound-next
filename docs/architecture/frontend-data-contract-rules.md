# Frontend Data Contract Rules

## Purpose
Define frontend data-layer standards for this repository.

## Contract Scope
- This contract applies to `orcasound-next`.
- `orcasite` conventions are the production alignment anchor.
- `esp32_ui` has a parallel contract in its own repo at `esp32_ui/docs/architecture/frontend-data-contract-rules.md`.

## Policy Provenance (Derived vs Greenfield)
- **Derived from existing Orcasite conventions**:
  - React Query global default `staleTime: 20s`.
  - Generated GraphQL query keys shaped like `['operationName', variables?]`.
  - Option to override query options at call sites.
- **Greenfield additions (explicitly new standards)**:
  - Domain-prefixed key taxonomy for non-generated hooks.
  - Data-class stale/refetch matrix.
  - Unified error/loading wording and transform-layer boundaries.

## Data Sources and Transports
- Primary: GraphQL via generated hooks from Orcasound server schema.
- Secondary: optional JSON endpoints from the same stack.
- External APIs allowed when explicitly scoped.

## Auth Boundary
- Auth/session follows Orcasound server conventions.
- Socket auth follows Orcasound socket endpoint token usage.
- No `esp32_api` auth headers/tokens are used in this track.

## Query Key Conventions
Current (derived) baseline in generated hooks:
- `['bout', variables]`
- `['bouts']` or `['bouts', variables]`
- `['candidates']` or `['candidates', variables]`

Standard to apply for non-generated/manual query hooks (greenfield):
- `['orca-graphql', '<resource>', '<scope>', { ...params }]`
- `['orca-json', '<resource>', '<scope>', { ...params }]`
- `['orca-external', '<provider>', '<resource>', { ...params }]`
- `['orca-auth', 'currentUser']`
- `['orca-rag', '<mode>', { ...context }]`

Field mapping for manual keys:
- `domain`: source family.
- `resource`: what the data is about.
- `scope`: query intent.
- `params`: stable serializable inputs.

Rules:
- Keep generated GraphQL hook keys unchanged unless codegen strategy changes.
- Migration target: replace manual GraphQL query hooks with generated GraphQL hooks where equivalent operations exist.
- For manual hooks, key shape is `[domain, resource, scope, params]`.
- `params` must be serializable and stable.
- No non-serializable values in query keys.

## Stale / Refetch Policy by Data Class
Current (derived) baseline:
- Global default stale time is 20s.
- Some manual hooks override to 5 minutes for stream/media assets.
- Many manual hooks currently inherit defaults.

Target standard (greenfield policy):
- `reference-data`
  - stale: 5-15 min
  - refetch-on-focus: false
- `interactive-list`
  - stale: 15-60 sec
  - refetch-on-focus: true
- `near-live`
  - stale: 0-10 sec
  - socket/poll invalidation allowed
- `session-identity`
  - stale: 1-5 min
  - refetch-on-focus: true
- `rag-response`
  - request-scoped cache
  - no long retention unless explicit replay behavior is intended

## Error / Loading Policy
- Normalize transport errors in the API client layer to typed frontend errors.
- Components consume typed errors, not raw network exceptions.
- Initial load: show skeleton/full placeholder.
- Background refresh: keep stale data visible and show a lightweight refresh indicator.
- Retries: enabled by default for idempotent reads; disabled for auth and validation failures.
- Mutations: show explicit success/failure feedback.

## Transform Placement
- API/client layer: transport + raw DTOs.
- Hook layer: DTO -> domain mapping + query behavior.
- Selector layer: cross-component derived views.
- Component layer: presentation formatting only.

## Disallowed
- Direct data fetch in presentation components.
- Duplicating query payloads into global UI state.
- Storing non-serializable payload artifacts in shared stores.
