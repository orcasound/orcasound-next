# Baseline Architecture Inventory (All Repos)

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

---

## Repo Map: `orcasound-next` (`/app`)

### Data-fetch paths
- React Query app provider: `ui/src/pages/_app.tsx`
- GraphQL fetch transport: `ui/src/graphql/client.ts`
- Query composition hook: `ui/src/hooks/beta/useMasterData.ts`
- Additional hook fetches (AI/sightings/live feeds) consumed by `useMasterData`

### Global/shared state paths
- `SocketContext`: `ui/src/pages/_app.tsx`
- `DataContext`: `ui/src/context/DataContext.tsx`
- `NowPlayingContext`: `ui/src/context/NowPlayingContext.tsx`
- Zustand layout store: `ui/src/stores/layoutStore.tsx`
- Layout context delegates to store: `ui/src/context/LayoutContext.tsx`

### Component/page-local state examples
- `_app` local `queryClient`, devtools toggle, socket setter state
- Provider internals: filter controls, playback queue, temporary refs

### State field classification
- `feeds`, `human/ai/sightings/combined` -> `server-state`
- `filters`, `useLiveData`, report-display controls -> `shared-ui-state`
- layout toggles/drawer/mobile tab from Zustand -> `shared-ui-state`
- now playing candidate/feed/queue/player status -> `shared-ui-state`
- page-only toggles and ephemeral component form/pagination fields -> `local-ui-state`

---

## Repo Map: `orcasite` (`/workspaces/orcasite`)

### Data-fetch paths
- React Query provider: `ui/src/pages/_app.tsx`
- GraphQL fetch transport: `ui/src/graphql/client.ts`
- Generated query hooks used directly in pages and hooks
  - examples: `ui/src/pages/reports/index.tsx`, `ui/src/pages/reports/[candidateId].tsx`, `ui/src/hooks/useSocket.ts`

### Global/shared state paths
- `SocketContext` only: `ui/src/pages/_app.tsx`
- No custom Zustand/global app store detected in active paths

### Component/page-local state examples
- reports pagination (`rowsPerPage`, `page`) in `ui/src/pages/reports/index.tsx`
- per-page derived UI state from query results

### State field classification
- GraphQL query results (`candidates`, `candidate`, `currentUser`, `feeds`) -> `server-state`
- socket reference/context -> `shared-ui-state`
- pagination and page-only UI flags -> `local-ui-state`

---

## Repo Map: `esp32_ui` (`/workspaces/esp32_ui`)

### Data-fetch paths
- Template API modules with in-memory data: `src/api/*`
- Async flow pattern: thunk -> API module -> Redux slice
  - example: `src/thunks/calendar.ts`
- Page-level local data hook pattern also present
  - example: `src/pages/dashboard/locations/index.tsx`

### Global/shared state paths
- Redux Toolkit store: `src/store/index.ts`
- Root reducers: `src/store/root-reducer.ts`
- App providers: Redux + Auth + Settings + Time in `src/pages/_app.tsx`
- Time context (URL-synced): `src/contexts/time-context.tsx`

### Component/page-local state examples
- search/filter/sort/pagination in location dashboard page
- local request loading/results state in page hooks

### State field classification
- Redux slice entities (`calendar/chat/kanban/mail`) -> currently treated as `server-state`
- auth/settings/time context values -> `shared-ui-state`
- page search/filter pagination state -> `local-ui-state`
- in-memory API module backing data -> pseudo-`server-state` (mocked locally)

---

## Repo Map: `esp32_api` (`/workspaces/esp32_api`)

### Data-fetch and processing paths
- FastAPI endpoints: `server/app/main.py`
  - `/ping`, `/latest`, `/ingest`
- RAG router endpoints: `server/app/api/rag_router.py`
  - `/rag/query`, `/rag/rebuild`, `/rag/index`, `/rag/ingest_docs`
- DB access
  - Supabase client path in `main.py`
  - psycopg access in RAG modules (`rag_query.py`, `rag_snapshots.py`, `rag_index.py`)

### Global/shared service state
- process-level globals: `supabase`, `latest_reading`
- startup background thread for index loop

### State field classification (mapped to shared taxonomy)
- persisted readings/snapshots/vector docs -> `server-state`
- process memory cache (`latest_reading`) -> `server-state` (ephemeral)
- `shared-ui-state`: n/a (backend)
- `local-ui-state`: n/a (backend)

---

## High-Level Observations
- `orcasound-next`: mixed architecture (React Query + Context + partial Zustand).
- `orcasite`: React Query-centric with minimal global UI state.
- `esp32_ui`: template-era Redux/context + mock API pattern, ready for data-layer modernization.
- `esp32_api`: backend already supports telemetry ingest and RAG, but contract clarity is the key dependency for frontend consistency.

