# Stores Overview

## Why `layoutStore` Exists

`layoutStore` centralizes cross-feature UI/session state that is used by distant components and routes.

### 1) Cross-feature state used in many places

- `useLayout()` is used in 17 callsites across list cards, map layout, playbar, header, and `/beta` pages.
- Example callsites:
  - `ui/src/components/CandidateList/CandidateCard.tsx`
  - `ui/src/components/CandidateList/HydrophoneCard.tsx`
  - `ui/src/components/layouts/HalfMapLayout/HalfMapLayout.tsx`
  - `ui/src/components/PlayBar/PlayerBase.tsx`
  - `ui/src/pages/beta/[feedSlug]/index.tsx`

### 2) It is not a tiny bounded provider

`layoutStore` holds multiple mutable UI fields and actions:

- Fields: `alertOpen`, `playbarExpanded`, `activeMobileTab`, `candidatePreview`, `drawerContent`, `drawerSide`, `showPlayPrompt`.
- Actions: `setAlertOpen`, `setPlaybarExpanded`, `setActiveMobileTab`, `setCandidatePreview`, `setDrawerContent`, `setDrawerSide`, `setShowPlayPrompt`.
- Source: `ui/src/stores/layoutStore.tsx`.

### 3) Interaction-driven updates happen across boundaries

- `setPlaybarExpanded(...)` is triggered from many components/pages (14 callsites).
- `setDrawerContent(...)` is triggered from multiple components/pages (6 callsites).
- These updates are driven by user interaction (opening/closing player, switching drawer views, route-dependent layout updates).

Because these updates span unrelated UI regions, shared store state with selector-based subscriptions is the right fit.

## Implementation Note

- Current `LayoutContext` is a thin compatibility wrapper over `layoutStore` (`ui/src/context/LayoutContext.tsx`).
- Long-term direction: keep shared layout state in store; keep context narrow and compatibility-focused.

## Cleanup Target

- `drawerContent` currently stores a `ReactNode`, which is non-serializable (`ui/src/stores/layoutStore.tsx`).
- Prefer serializable view descriptors over raw component instances as migration continues.
