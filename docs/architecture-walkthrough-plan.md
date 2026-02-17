# Manual Architecture Walkthrough Plan (Frontend-Focused, Backend-Separated)

## Summary
This is a guided, manual implementation framework (no auto-implementation).

Primary goal:
- Build reusable architectural best practices across projects.

Scope:
- `esp32_ui`: reference implementation target for data/state architecture.
- `orcasound-next` and `orcasite`: adopt comparable architecture patterns independently.
- `esp32_api`: minimal backend changes; prioritize contract clarity over route redesign.

## What "Telemetry" Means
Telemetry refers to non-chat sensor data flows:
- Device reading ingestion
- Time-series retrieval
- Aggregates/summaries
- Chart/domain model preparation for frontend rendering

RAG/AI is separate:
- Prompt handling
- Retrieval/tooling
- Streaming answer/citations

## Explicit Separation: Backend vs Frontend Concerns
Backend concerns:
- Endpoint contracts and validation
- Auth boundaries
- Response consistency
- OpenAPI/schema clarity

Frontend concerns:
- Data-fetch boundaries and query keys
- Cache/refetch policy
- Shared vs local state ownership
- DTO-to-domain transforms
- Component data access rules

## Architecture Decisions
- Server data: `@tanstack/react-query`
- Shared UI state: `zustand` (or minimal context when narrowly scoped)
- API contract style: typed DTOs from published backend schema/OpenAPI
- AI integration path for `esp32_ui`: server-route proxy boundary (Vercel AI SDK-ready)
- `esp32_api` changes: minimal, contract-focused

## Important Interface Decisions
- Keep existing `esp32_api` routes initially.
- Ensure request/response contracts are explicit and typed.
- Frontend keeps a strict mapping layer:
  - transport DTOs -> UI/domain models
- Define stable response shape conventions for frontend handling.

## Manual Walkthrough Steps
1. Baseline architecture inventory (all repos)
- Document current data-fetch paths, global state paths, and component-level state.
- Mark each state field as: server-state, shared-ui-state, local-ui-state.
- Deliverable: one-page architecture map per repo.

2. Define frontend data-layer standards
- Decide and document:
- query key conventions
- stale/refetch policies by data class
- error/loading state policy
- where transforms live (hook vs selector vs component)
- Deliverable: “frontend data contract rules” doc.

3. Define frontend state-layer standards
- Decide and document:
- what must be in Zustand vs local component state
- what must never be in global store
- selector usage and anti-patterns
- Deliverable: Zustand slice template + decision checklist.

4. `esp32_ui` telemetry integration design
- Replace mock/demo API usage path-by-path with typed client wrappers.
- Introduce React Query hooks per telemetry use case.
- Add Zustand slices only for cross-component UI/session state.
- Keep chart pages consuming hooks/selectors, not raw fetch/client calls.
- Deliverable: migration checklist with page/hook/store mapping.

5. `esp32_ui` AI SDK boundary design
- Define Next server route(s) as AI orchestration boundary.
- Route calls esp32_api RAG endpoints/tools; client consumes stream from route.
- Keep prompt/tool/auth logic server-side, not browser-side.
- Deliverable: sequence diagram (UI -> Next route -> backend -> stream back).

6. Minimal `esp32_api` contract hygiene
- Keep existing endpoints; avoid major redesign.
- Ensure schema clarity for active telemetry and RAG endpoints.
- Align auth expectations by endpoint class (device token vs user JWT vs RAG admin token).
- Deliverable: compact API contract reference used by frontend teams.

7. Pattern transfer matrix to `orcasound-next`/`orcasite`
- Apply same layering:
- typed client boundary
- React Query server-state
- Zustand shared-ui-state
- local state for ephemeral component concerns
- Deliverable: adaptation matrix showing equivalent modules and boundaries.

8. Personal engineering best-practices rubric
- Convert decisions into reusable prompts/checklists:
- “before adding endpoint”
- “before adding global state”
- “before adding a new dashboard chart/query”
- “before adding AI/chat feature”
- Deliverable: personal engineering playbook markdown.

## Test/Validation Checklist
Telemetry:
- Query behavior matches stale/refetch policy
- Filters/pagination do not trigger avoidable duplicate requests
- Error/loading handling is consistent

RAG:
- Streaming path works through UI server route boundary
- Citations/metadata are preserved and render correctly

Architecture quality:
- No direct fetch in presentation-only components
- No server-state copied into global UI store without reason
- Local UI state remains local where possible

## Assumptions
- Workspace renaming is handled manually by user.
- `esp32_api` remains separate from `orcasound-next` runtime usage.
- Goal is architectural similarity and transferable engineering practice.
