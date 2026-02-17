# Baseline Architecture Inventory

## Purpose
This inventory establishes current data-fetch paths and state ownership before migration.

Why this is necessary:
- Prevents mixing server data with UI-only state during refactors.
- Enables incremental migration by state class.
- Reduces regression risk by making hidden coupling explicit.

State taxonomy used:
- `server-state`: backend-derived data (query/mutation results)
- `shared-ui-state`: UI/session state shared across features/components
- `local-ui-state`: page/component-only state

## Repo Map: `orcasound-next`

### Data-fetch paths
- React Query provider: `ui/src/pages/_app.tsx`
- GraphQL transport client: `ui/src/graphql/client.ts`
- Generated GraphQL hooks: `ui/src/graphql/generated/index.ts`
- Query composition hook: `ui/src/hooks/beta/useMasterData.ts`
- Transitional manual live/external hooks used by `useMasterData`:
  - `ui/src/hooks/beta/useLiveDetections1000.ts`
  - `ui/src/hooks/beta/useLiveFeeds.ts`
  - `ui/src/hooks/beta/useAIDetections.ts`
  - `ui/src/hooks/beta/useSightings.ts`

### Global/shared state paths
- `SocketContext`: `ui/src/pages/_app.tsx`
- `DataContext`: `ui/src/context/DataContext.tsx`
- `NowPlayingContext`: `ui/src/context/NowPlayingContext.tsx`
- Zustand layout store: `ui/src/stores/layoutStore.tsx`
- Layout context delegating to store: `ui/src/context/LayoutContext.tsx`

### Component/page-local state examples
- `_app` local `queryClient` and devtools toggle state
- provider-local temporary refs and UI controls
- page-only filter, pagination, and modal state

### State field classification
- `feeds`, `human/ai/sightings/combined` -> `server-state`
- `filters`, report-display controls, UI mode flags -> `shared-ui-state`
- layout drawer/mobile tab toggles -> `shared-ui-state`
- now playing candidate/feed/queue/player status -> `shared-ui-state`
- page-only toggles and ephemeral form/pagination fields -> `local-ui-state`

## Cross-Repo Interface Notes
- Production alignment target: `orcasite` generated GraphQL query-hook conventions.
- Parallel architecture mirror exists in `esp32_ui/docs/architecture/*`.
