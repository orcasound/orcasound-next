# Feature-Track Integration Design (Step 4)

## Purpose
Define the implementation design for integrating feature-track data boundaries in this repository using the Step 2 (data) and Step 3 (state) standards.

## Scope
- In scope: `/beta` pages, `useMasterData` composition, manual live/external hooks, and shared UI state touchpoints.
- Out of scope: backend endpoint redesign and AI orchestration route design (Step 5).

## Current -> Target Boundary

Current shape:
- Pages/components consume a mix of generated GraphQL hooks and ad-hoc/manual fetch hooks.
- `useMasterData` composes multiple sources but still relies on transitional manual GraphQL/live hooks.
- Shared UI state is exposed via `useLayout` compatibility wrapper over Zustand.

Target shape:
- Generated GraphQL hooks are the default Orcasound data path where equivalent operations exist.
- Manual hooks remain only for sources that are external or have no generated equivalent.
- Components consume typed feature hooks/selectors, not transport details.
- Shared cross-feature UI state remains in Zustand; server-state remains in React Query.

## Page / Hook / Store Mapping

| Feature page/area | Current data path | Target typed boundary | Shared state owner | Notes |
| --- | --- | --- | --- | --- |
| `ui/src/pages/beta/index.tsx` | `useLayout` + layout toggles | keep page-level orchestration; no raw fetch | Zustand (`layoutStore`) | keep as route-level UI reset/orchestration |
| `ui/src/pages/beta/[feedSlug]/index.tsx` | feed-level drawer/player state + map/list interactions | `useFeedTrackData(feedSlug)` composition hook | Zustand for drawer/playbar, React Query for server-state | move route composition into dedicated feature hook |
| `ui/src/pages/beta/[feedSlug]/[candidateId].tsx` | route params + drawer updates | `useCandidateTrackData(feedSlug, candidateId)` | Zustand (`layoutStore`), DataContext-derived selectors | isolate candidate-page composition logic |
| `ui/src/pages/beta/explore/index.tsx` | context-driven filtered/sorted candidate views | selector-first consumption (`useSortedCandidates`, `useFilteredData`) | Zustand for UI controls, React Query for data | keep derived views out of global store |
| `ui/src/pages/beta/dashboard/index.tsx` | mixed context/server-derived data | feature dashboard hook boundary | Zustand for dashboard UI state only | avoid transport concerns in page components |

## Hook Migration Matrix

| Current hook | Target action | Why |
| --- | --- | --- |
| `ui/src/hooks/beta/useMasterData.ts` | keep as composition root, but narrow responsibility | centralize source composition while removing transport leakage |
| `ui/src/hooks/beta/useLiveFeeds.ts` | replace with generated GraphQL hook where equivalent exists | remove ad-hoc GraphQL fetch path |
| `ui/src/hooks/beta/useLiveDetections1000.ts` | replace with generated query + explicit policy where equivalent exists | align key/policy conventions |
| `ui/src/hooks/beta/useFeedStreams.tsx` | keep, but standardize key factory + options | explicit cache/invalidations for stream windows |
| `ui/src/hooks/beta/useSightings.ts` | keep as external-source hook | source is external and intentionally separate |
| `ui/src/hooks/beta/useAIDetections.ts` | keep until endpoint contract is replaced | external/provider-specific path |

## Store Integration Rules For Step 4
- Keep `layoutStore` as shared UI/session owner for cross-feature layout concerns.
- Keep non-layout feature orchestration in feature hooks/selectors first; only promote to store when cross-route writes are required.
- Do not mirror React Query payloads into Zustand.
- Replace non-serializable layout payloads (for example `drawerContent: ReactNode`) with serializable view descriptors as follow-up hardening.

## Migration Checklist (Manual)
1. Inventory each `/beta` page and list all direct data hooks used.
2. Classify each hook as `generated GraphQL`, `external`, or `transitional manual`.
3. For each transitional manual GraphQL hook, check for generated equivalent and swap where possible.
4. Introduce feature-level composition hooks per route (`feed track`, `candidate track`, `dashboard track`).
5. Ensure components consume feature hooks/selectors only; remove transport logic from components.
6. Verify cache keys/policies follow `frontend-data-contract-rules.md`.
7. Verify shared/local state ownership follows `frontend-state-layer-standards.md`.
8. Capture unresolved gaps as Step 5/6 inputs.

## Step 4 Definition of Done
- Feature pages are mapped to typed hook boundaries.
- Transitional manual GraphQL hooks have explicit replacement/retain decisions.
- Shared store responsibilities are explicitly separated from server-state.
- A manual migration checklist exists for implementation PR slicing.
