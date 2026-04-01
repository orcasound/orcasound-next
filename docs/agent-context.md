# Agent Context

## Last Updated
- 2026-02-11 (session in `/app`)

## Current Objective
- Establish durable context files so work can continue across VS Code workspace closures and dev container rebuilds.

## Decisions Made
- Use `AGENTS.md` for stable agent operating rules.
- Use `docs/agent-context.md` for dynamic task/session context and handoff notes.
- Add a standing rule in `AGENTS.md` to update context at each milestone/end of task.

## Work Completed In This Session
- Confirmed the assistant does not have access to other account threads/workspaces by default.
- Defined recommended continuity workflow using in-repo context files.
- Created `AGENTS.md` with explicit continuity and handoff rules.
- Created this `docs/agent-context.md` file.
- Added continuity test datum: cat name is Andrew.

## Next Step
- Validate continuity after container rebuild by asking for the saved cat name.

## Blockers / Risks
- None currently.

## Environment Notes
- VS Code dev container was rebuilt and extension reinstalled before this session.
- `rg` is not installed in the current container (fallback to `find`/`grep`/`sed`).

## Git Snapshot
- Branch: main
- Commit (short): 30f0185
- Commit (full): 30f01854ed41af74b69dd25ef4a237d5d12c6e9a
- Commit title: Merge pull request #20 from orcasound/vercel/react-server-components-cve-vu-hc4pmn

## Handoff Note
- Baseline continuity docs are now in place. If the container is rebuilt, start by reading this file and then proceed with the next task.

## Continuity Test Data
- Cat name: Andrew

## Milestone Update (2026-02-11)
- Current objective: Tighten session-start compliance so initialization happens before any user request.
- What changed: Updated `AGENTS.md` Session Start Rule to require reading `AGENTS.md` and `docs/agent-context.md` before answering any request, including non-substantive requests.
- Next step: Enforce this rule in future sessions by always performing context-file reads first.
- Blockers/risks: None currently.
- Branch and latest commit hash: `main` @ `30f01854ed41af74b69dd25ef4a237d5d12c6e9a` (short: `30f0185`).

## Milestone Update (2026-02-11, cat-name check)
- Current objective: Validate saved continuity test datum by answering the cat-name question.
- What changed: Confirmed from context file that the stored cat name is Andrew.
- Next step: Continue normal task handling with session-start file reads.
- Blockers/risks: None currently.
- Branch and latest commit hash: `main` @ `30f01854ed41af74b69dd25ef4a237d5d12c6e9a` (short: `30f0185`).

## Milestone Update (2026-02-11, state-management assessment)
- Current objective: Evaluate Context API implementation risks and whether a Zustand refactor is impactful/efficient for production-readiness.
- What changed: Reviewed `ui` app context architecture and consumers. Identified broad provider values and cross-cutting rerender patterns in `DataContext`, `LayoutContext`, and `NowPlayingContext`, plus current hook usage footprint (`useData`: 24, `useNowPlaying`: 21, `useLayout`: 17 references).
- Next step: Propose an incremental migration plan that isolates high-churn UI state and filter state first, then evaluate remaining shared state.
- Blockers/risks: No blocker for migration; main risk is broad-scope rewrite creating regressions if done all at once.
- Branch and latest commit hash: `main` @ `30f01854ed41af74b69dd25ef4a237d5d12c6e9a` (short: `30f0185`).

## Milestone Update (2026-02-11, cross-repo analysis strategy)
- Current objective: Decide the best method to analyze production `orcasite` against this prototype for Zustand migration planning.
- What changed: Determined preferred workflow is local side-by-side code access (clone/open prod repo in workspace) rather than web-only browsing for deep architecture comparison and migration mapping.
- Next step: Bring production repo into local workspace context and run structural diff analysis focused on state management touchpoints.
- Blockers/risks: Web-only review is insufficient for reliable migration scoping and test impact assessment.
- Branch and latest commit hash: `main` @ `30f01854ed41af74b69dd25ef4a237d5d12c6e9a` (short: `30f0185`).

## Milestone Update (2026-02-11, devcontainer port conflict analysis)
- Current objective: Diagnose why opening a second repo devcontainer fails with port 3000 already in use.
- What changed: Confirmed host bind is hardcoded in `docker-compose.yml` (`3000:3000`, `4000:4000`) and devcontainer inherits this compose stack.
- Next step: Use host-port remapping for the second repo (e.g., `3001:3000` and likely `4001:4000`), ideally via env-driven compose ports.
- Blockers/risks: Additional conflicts may appear on `4000`, `5433`, and `6379` after resolving `3000`.
- Branch and latest commit hash: `main` @ `30f01854ed41af74b69dd25ef4a237d5d12c6e9a` (short: `30f0185`).

## Milestone Update (2026-02-11, committed devcontainer port change)
- Current objective: Permanently set `orcasound-next` devcontainer host ports to avoid conflicts with `orcasite`, and document it.
- What changed: Updated `docker-compose.yml` web service host port mappings to `3001:3000` and `4001:4000`, added `SERVER_PORT=4001` in web environment, and documented these defaults in `README.md` under "Local Devcontainer Ports".
- Next step: Rebuild/reopen the devcontainer so new bindings take effect, then open `orcasound-next` at `http://localhost:3001`.
- Blockers/risks: Could not run `docker compose` validation in this environment because `docker` CLI is unavailable here.
- Branch and latest commit hash: `main` @ `c92f956f2f4ee14e57f2b8de2ca953c73fe9b208` (short: `c92f956`).

## Milestone Update (2026-02-11, continuity resume check)
- Current objective: Re-establish task continuity and report last working state on request.
- What changed: Re-read `AGENTS.md` and `docs/agent-context.md`, then verified current repo state is on `main` at `df4b026`.
- Next step: Continue from the pending validation step by rebuilding/reopening the devcontainer and confirming services on `http://localhost:3001` (and server on `4001`).
- Blockers/risks: Docker CLI is still unavailable in this environment, so runtime validation must be done from your local Docker-enabled setup.
- Branch and latest commit hash: `main` @ `df4b026`.

## Milestone Update (2026-02-11, where-we-were check)
- Current objective: Reconfirm last known working state and pending action.
- What changed: Re-read `AGENTS.md` and `docs/agent-context.md`; confirmed latest recorded state remains a pending devcontainer rebuild/reopen validation.
- Next step: Rebuild/reopen the devcontainer and verify app accessibility on `http://localhost:3001` and related service on `4001`.
- Blockers/risks: Docker CLI/runtime validation is not available in this environment.
- Branch and latest commit hash: `main` @ `df4b026`.

## Milestone Update (2026-02-11, full port collision fix)
- Current objective: Resolve remaining devcontainer port collisions when running `orcasound-next` with `orcasite`.
- What changed: Updated `docker-compose.yml` host port mappings to be unique and configurable for all exposed services: web `${WEB_HOST_PORT:-3001}:3000`, server `${SERVER_HOST_PORT:-4001}:4000`, db `${DB_HOST_PORT:-5434}:5432`, cache `${CACHE_HOST_PORT:-6380}:6379`. Updated `README.md` Local Devcontainer Ports section accordingly.
- Next step: Rebuild/reopen this devcontainer and verify Docker Desktop shows `3001:3000`, `4001:4000`, `5434:5432`, `6380:6379` for this repo while `orcasite` keeps its own defaults.
- Blockers/risks: Runtime validation still depends on your local Docker environment.
- Branch and latest commit hash: `main` @ `df4b026`.

## Milestone Update (2026-02-11, continuity resume check)
- Current objective: Re-establish continuity and answer "where were we?" from recorded handoff state.
- What changed: Re-read `AGENTS.md` and `docs/agent-context.md`; confirmed latest branch/commit remains `main` @ `df4b026`.
- Next step: Perform local Docker-side validation by rebuilding/reopening the devcontainer and checking mapped ports/services.
- Blockers/risks: Docker CLI/runtime validation remains unavailable in this environment.
- Branch and latest commit hash: `main` @ `df4b02638126d25953af94a14bd2bdb935170b8c` (short: `df4b026`).

## Milestone Update (2026-02-11, orcasite-access check)
- Current objective: Determine whether this agent session can access the `orcasite` container/workspace.
- What changed: Verified this environment exposes `/app` only and does not have `docker` CLI access (`__NO_DOCKER__`), so cross-container inspection is not available from here.
- Next step: Continue work in this repo; if cross-repo/container analysis is needed, mount the `orcasite` repo into this workspace or provide files/outputs from that container.
- Blockers/risks: No direct visibility into `orcasite` container state from this session.
- Branch and latest commit hash: `main` @ `df4b02638126d25953af94a14bd2bdb935170b8c` (short: `df4b026`).

## Milestone Update (2026-02-11, non-container workspace visibility check)
- Current objective: Verify whether a separate VS Code workspace opened outside containers is accessible from this container session.
- What changed: Checked mounted root paths; only `/app` is present, no `/workspaces` mount, and no discovered sibling repo paths.
- Next step: If access is needed, bind-mount that workspace into this container or open this agent in that workspace directly.
- Blockers/risks: This session cannot read host-only workspace files unless explicitly mounted.
- Branch and latest commit hash: `main` @ `df4b02638126d25953af94a14bd2bdb935170b8c` (short: `df4b026`).

## Milestone Update (2026-02-11, multi-workspace and no-container guidance)
- Current objective: Provide practical guidance for mounting multiple workspaces in a devcontainer and when to run repos outside containers.
- What changed: Documented recommended approaches: add extra bind mounts via `devcontainer.json`/compose for cross-repo access, and use mixed mode (containerized deps + host editor/runtime) when faster iteration is preferred.
- Next step: User can choose either shared-container workflow (mount both repos) or separate workflow (open each repo directly on host).
- Blockers/risks: Shared mounts improve visibility but can increase complexity and path-coupling if overused.
- Branch and latest commit hash: `main` @ `df4b02638126d25953af94a14bd2bdb935170b8c` (short: `df4b026`).

## Milestone Update (2026-02-11, single-container dual-repo decision)
- Current objective: Decide if `orcasound-next` and `orcasite` can run from one shared container.
- What changed: Confirmed this is viable when dependency/runtime expectations match; advised mounting both repos but keeping per-repo dependency directories and scripts isolated.
- Next step: If adopted, mount both repos into one devcontainer and open as multi-root workspace.
- Blockers/risks: Main risk is accidental cross-repo coupling (wrong cwd, shared cache/node_modules misuse, port collisions).
- Branch and latest commit hash: `main` @ `df4b02638126d25953af94a14bd2bdb935170b8c` (short: `df4b026`).

## Milestone Update (2026-02-11, dual-workspace container workflow assessment)
- Current objective: Assess concrete VS Code/devcontainer steps to mount `orcasound-next` and `orcasite` into one container and clarify port strategy.
- What changed: Reviewed `.devcontainer/devcontainer.json`, `.devcontainer/docker-compose.yml`, and `docker-compose.dev.yml`; identified current workspace mount is `.:/app` and host-port remaps were introduced for side-by-side separate containers.
- Next step: Recommend adding an additional bind mount for `orcasite` in the devcontainer compose override and using a multi-root workspace inside the same container.
- Blockers/risks: Found unresolved merge conflict markers in `README.md`, which should be resolved before future content edits in that file.
- Branch and latest commit hash: `main` @ `df4b02638126d25953af94a14bd2bdb935170b8c` (short: `df4b026`).

## Milestone Update (2026-02-12, continuity resume check)
- Current objective: Re-establish session continuity and answer "where were we?" from the latest recorded state.
- What changed: Re-read `AGENTS.md` and `docs/agent-context.md`; confirmed the most recent tracked task remains the dual-workspace container workflow assessment and recommendation.
- Next step: If you want to proceed, implement the extra `orcasite` bind mount in the devcontainer compose override and create/open a multi-root workspace in-container.
- Blockers/risks: `README.md` still has unresolved merge conflict markers that should be cleaned up before further edits there.
- Branch and latest commit hash: `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, orcasite UI port diagnosis)
- Current objective: Diagnose why `orcasite` UI reports ready on port 3000 but appears unavailable in browser.
- What changed: Verified `next dev` is running in-container on port `3000` and responds with HTTP 200 locally; confirmed devcontainer host port mapping is `${WEB_HOST_PORT:-3001}:3000`.
- Next step: Access `orcasite` UI from host at `http://localhost:3001` (or via forwarded port 3001 in VS Code), not `http://localhost:3000`.
- Blockers/risks: If another process already binds host `3001`, remap `WEB_HOST_PORT` and reconnect.
- Branch and latest commit hash: `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, single-container dual-UI port conflict explanation)
- Current objective: Explain `EADDRINUSE :3000` when trying to run `orcasite` and `orcasound-next` UIs in the same container.
- What changed: Confirmed both repos' `ui/package.json` use `next dev -p ${UI_PORT:-3000}` so without explicit `UI_PORT` each process binds container port `3000`, causing collision.
- Next step: Start each UI with explicit and different container ports (for example `UI_PORT=3000` and `UI_PORT=3001`) and ensure host/VS Code port forwarding exists for both.
- Blockers/risks: Existing compose mapping in `/app/docker-compose.yml` publishes only container `3000` to host `3001`; container `3001` needs separate host mapping or VS Code forward to be reachable.
- Branch and latest commit hash: `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, orcasound-next isolated port defaults)
- Current objective: Make `orcasound-next` run independently from `orcasite` in the same container without modifying `orcasite`.
- What changed: Updated `/app/ui` scripts to use repo-specific `ORCASOUND_NEXT_UI_PORT` with default `3001`, updated `/app/docker-compose.yml` to publish host `3001` to container `3001` and set `ORCASOUND_NEXT_UI_PORT=3001`, and updated `/app/ui/.env.development` backend fallback from `4000` to `4001`.
- Next step: Rebuild/reopen devcontainer (or restart service) so compose env/port mapping changes take effect, then run both UIs concurrently.
- Blockers/risks: Current live container env may still contain old variables until rebuild; manual terminal exports can override defaults.
- Branch and latest commit hash: `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, continuity resume check)
- Current objective: Re-establish continuity and answer "where were we?" from the latest recorded handoff.
- What changed: Re-read `AGENTS.md` and `docs/agent-context.md`; confirmed the most recent completed work was isolating `orcasound-next` to port `3001` (container and host mapping) with backend fallback `4001`.
- Next step: Rebuild/reopen the devcontainer (or restart the compose services) and then validate both UIs can run concurrently without port collisions.
- Blockers/risks: Existing running container/session may still have old env/port state until rebuild/restart.
- Branch and latest commit hash: `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, dual-repo access confirmation)
- Current objective: Verify whether this agent session can read/analyze/change both `orcasound-next` and `orcasite` in the same container.
- What changed: Confirmed both git repos are mounted and accessible at `/app` and `/workspaces/orcasite`; validated git context in `/workspaces/orcasite` (`main` @ `2bb6a2f`).
- Next step: Proceed with cross-repo analysis and edits as requested, using explicit paths to avoid repo mix-ups.
- Blockers/risks: Need to ensure commands run in the intended repo (`/app` vs `/workspaces/orcasite`) to prevent accidental changes.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, Zustand impact-effort recap)
- Current objective: Recap prior conversation on Context API vs Zustand migration impact/effort in `orcasound-next`.
- What changed: Reconfirmed previous assessment: broad context provider values and cross-cutting rerenders exist (`useData`: 24 refs, `useNowPlaying`: 21 refs, `useLayout`: 17 refs), making targeted state-store extraction potentially high-impact.
- Next step: If proceeding, use incremental migration order (high-churn UI/filter state first) instead of full rewrite.
- Blockers/risks: Full-scope migration remains high-effort with elevated regression risk.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, orcasite Zustand opportunity + beta migration roadmap)
- Current objective: Analyze `orcasite` for practical Zustand adoption opportunities and define an incremental roadmap to port `/beta` features from `orcasound-next` using Zustand.
- What changed: Confirmed `orcasite` currently has only `SocketContext` in `_app` and mostly local state (`46` `useState` occurrences). Mapped `/beta` dependency surface in prototype: `31` beta-related files directly coupled to `DataContext`, `LayoutContext`, and `NowPlayingContext`. Identified data-pipeline dependencies (`useMasterData`, AI detections, sightings transforms) and recommended a compatibility-first Zustand slice strategy in `orcasite`.
- Next step: Implement Phase 1 in `orcasite`: add Zustand and create initial `playback`, `layout`, and `filters` slices with compatibility hooks, then migrate `MapLayout` + `Player` to validate architecture before porting `/beta` routes/components.
- Blockers/risks: `/beta` parity depends on external data sources (Orcahello + Cascadia sightings) and avoiding non-serializable state patterns (e.g., storing `ReactNode` drawer content) in Zustand.
- Branch and latest commit hash: `/workspaces/orcasite` `main` @ `2bb6a2f4842d1fc2cf8ba9df19286547c9ec74de` (short: `2bb6a2f`); `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, target data-domain architecture draft request)
- Current objective: Draft a concrete architecture for migrating beta capabilities into `orcasite` using React Query + Zustand, and clarify the future role of `MasterDataLayout`.
- What changed: Prepared a design that separates data orchestration from layout rendering: React Query for server data, normalizers/selectors for derived domain objects, and Zustand stores for cross-component UI/playback/filter state. Captured recommendations to remove live-vs-seed toggle behavior and keep only a thin bootstrap wrapper (if needed) for feature-flag gating and route-level initialization.
- Next step: Convert this draft into implementation-ready folder/module contracts in `orcasite` Phase 1 PR.
- Blockers/risks: Deployment-path semantics for "seed to prod" are backend/environment-specific and need explicit confirmation from backend/deployment owners.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, orcasound-next pre-Zustand refactor priority)
- Current objective: Prioritize extracting API/data orchestration from `MasterDataLayout` in `orcasound-next` before Zustand implementation.
- What changed: Established migration direction: move source queries and unification logic into dedicated React Query hooks/services while keeping existing context contracts intact to preserve behavior.
- Next step: Execute a no-behavior-change refactor in small PRs (service extraction, query-composition hook, provider wiring swap, then optional layout deletion/rename).
- Blockers/risks: Main risk is accidental behavior drift in derived candidate/filter outputs; mitigate with snapshot/golden tests around current DataContext outputs.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, structural pattern clarification for useMasterData)
- Current objective: Clarify whether `useMasterData` should remain the single query-composition hook and whether layout-level invocation is acceptable for global live/seed toggling.
- What changed: Confirmed `useMasterData` already serves as a valid query-composition hook. Recommended moving invocation into `DataContext` provider for clearer ownership while retaining optional global dev controls via a separate lightweight debug control component/provider.
- Next step: Implement minimal change path: `DataContext` owns `useMasterData`; keep live/seed toggle as explicit env/feature-flag + optional dev toolbar control.
- Blockers/risks: Route-specific layouts owning data source selection can produce hidden coupling and inconsistent behavior when additional layouts/routes are introduced.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, DataContext2 blueprint added)
- Current objective: Provide a simplified rewrite blueprint showing how `DataContext` can keep `useMasterData` while isolating UI/global state into a store-like layer for later Zustand migration.
- What changed: Added `ui/src/context/DataContext2.tsx` with behavior-equivalent outputs and provider API split (`DataUiStateProvider` + `DataProviderInner`), preserving current computed fields (`filters`, `filteredData`, `sortedCandidates`, `reportCount`, `lastWhaleReport`, `isSuccessOrcahello`, live/seed toggle state).
- Next step: Decide whether to wire `DataProvider2/useData2` in place of current `DataProvider/useData`, or use as a reference while migrating current `DataContext.tsx`.
- Blockers/risks: File is intentionally not wired yet, so lint reports only unused-export warnings until adopted.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, simple Zustand-native store example)
- Current objective: Provide a minimal example of replacing `useState<boolean>(true)` with a Zustand-native store.
- What changed: Added `ui/src/stores/exampleStore.ts` with `myState`, `setMyState(value: boolean)`, and `toggleMyState()` actions.
- Next step: Use this example to simplify store action signatures where React `SetStateAction` compatibility is not required.
- Blockers/risks: None.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-12, devcontainer Codex persistence setup)
- Current objective: Reduce rebuild friction by auto-installing Codex extension and persisting Codex auth/config across container rebuilds.
- What changed: Updated `.devcontainer/devcontainer.json` to auto-install `openai.chatgpt`; updated `.devcontainer/docker-compose.yml` to mount named volume `codex-home` at `/root/.codex`.
- Next step: Rebuild/reopen devcontainer so extension install and volume mount take effect, then verify Codex login persists across rebuilds.
- Blockers/risks: If token/session still expires server-side, occasional re-auth may still be required despite local config persistence.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, continuity resume check)
- Current objective: Re-establish continuity and answer "where were we?" from the latest recorded handoff.
- What changed: Re-read `AGENTS.md` and `docs/agent-context.md`; confirmed latest tracked state is the devcontainer Codex persistence setup and pending verification.
- Next step: Rebuild/reopen the devcontainer and verify Codex extension auto-installs plus `/root/.codex` persistence keeps auth/config across rebuilds.
- Blockers/risks: Token/session may still occasionally require re-auth if it expires server-side.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, Codex onboarding/persistence clarification)
- Current objective: Clarify whether Codex onboarding/tutorial can be disabled and why login/conversation continuity may still reset.
- What changed: Inspected installed extension metadata (`openai.chatgpt-0.4.74`) and found no exposed setting for disabling tutorial/onboarding. Verified auth/session artifacts exist under `/root/.codex` (including `auth.json`), while `globalStorage/openai.chatgpt` is absent in this container.
- Next step: If login prompts remain frequent, investigate container-level persistence for VS Code user data in addition to `/root/.codex`, and continue using `docs/agent-context.md` for deterministic continuity.
- Blockers/risks: Some re-auth is still expected when tokens expire server-side; cross-session conversational memory is not automatically restored without explicit continuity context.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, bind-mount path resolution guidance)
- Current objective: Explain why adding `../../postoccupancy/esp32_api` as a devcontainer bind mount fails with path-not-exist errors.
- What changed: Confirmed devcontainer uses compose files with `../docker-compose.yml` as primary, so relative bind sources are resolved on the host against repo root (`/app`), not against `.devcontainer` and not against in-container paths.
- Next step: Use the correct host-relative path from repo root (likely `../postoccupancy/esp32_api`) or switch to an explicit absolute-host-path env variable in compose.
- Blockers/risks: Host path must exist in the Docker host filesystem; container-only checks are not sufficient for bind source validation.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, architecture docs saved)
- Current objective: Persist the cross-repo architecture walkthrough plan and baseline inventory in-repo for manual implementation.
- What changed: Added `docs/architecture-walkthrough-plan.md` (manual, frontend-focused plan) and `docs/architecture-baseline-inventory.md` (repo-by-repo data/state inventory with server/shared/local classification).
- Next step: Review these docs and start Step 2 (frontend data-layer standards checklist) using the baseline inventory as source of truth.
- Blockers/risks: Inventory reflects current code snapshot and should be refreshed after major refactors to avoid stale assumptions.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, architecture index added)
- Current objective: Add a single index page to track architecture walkthrough docs and progress.
- What changed: Created `docs/architecture/README.md` with links to the walkthrough plan and baseline inventory, plus an 8-step progress checklist.
- Next step: Proceed with Step 2 and document frontend data-layer standards in a dedicated architecture doc.
- Blockers/risks: Checklist requires manual updates after each completed step to stay accurate.
- Branch and latest commit hash: `/app` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, step-2 frontend data standards documented)
- Current objective: Complete Step 2 by defining reusable frontend data-layer standards and publishing them in `/docs`.
- What changed: Added `docs/frontend-data-contract-rules.md` with standards for query key conventions, stale/refetch policy by data class, error/loading policy, and transform placement boundaries. Updated `docs/architecture/README.md` to link the new doc, mark Step 2 complete, and set Step 3 as the active focus.
- Next step: Execute Step 3 by documenting state-layer standards (shared store vs local state ownership, selector rules, anti-patterns).
- Blockers/risks: Existing code may not yet conform to all standards; migration should apply these rules incrementally to avoid broad-scope regressions.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, frontend data rules split by project tracks)
- Current objective: Remove mixed contract assumptions and separate frontend data-layer rules for Orcasound repos vs esp32_ui.
- What changed: Rewrote `docs/frontend-data-contract-rules.md` into two explicit tracks: Track A (`orcasound-next` + `orcasite`) and Track B (`esp32_ui`), with parallel architecture but separate transport/auth/query-key domains.
- Next step: Use the split contract as the source for Step 3 state-layer standards, preserving per-track independence.
- Blockers/risks: Existing implementations may still contain mixed legacy patterns; migration should enforce track-specific rules incrementally.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, contract-rules provenance + policy clarification)
- Current objective: Clarify DTO/query-key/stale-refetch behavior across repos and align Step 2 contract language with Orcasite-first conventions.
- What changed: Re-validated live implementations in `orcasite`, `orcasound-next`, and `esp32_ui`; rewrote `docs/frontend-data-contract-rules.md` to explicitly mark Track A policies as derived vs greenfield, preserve generated GraphQL key baseline, and align error/loading wording identically across Track A and Track B.
- Next step: Review and ratify the greenfield policy items before Step 3 state-layer standards.
- Blockers/risks: Current branch contains multiple unrelated in-progress/untracked changes; keep future edits scoped to requested docs to avoid accidental coupling.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, query-key clarification + transform wording alignment)
- Current objective: Clarify data-contract terminology and align rules with Orcasite migration intent.
- What changed: Updated `docs/frontend-data-contract-rules.md` to add explicit manual-key field mapping/examples, add a migration target to replace manual GraphQL hooks with generated hooks in `orcasound-next` beta path, and make Transform Placement/Disallowed wording identical across Track A and Track B except where backend boundaries differ.
- Next step: Review and ratify the key-prefix strategy (keep vs simplify) before Step 3 state-layer standards.
- Blockers/risks: Existing `orcasound-next` manual live hooks still use transitional ad-hoc keys; migration sequencing should avoid cache-key churn during active feature work.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, mirrored per-repo architecture doc structure)
- Current objective: Make architecture docs easier to review side-by-side across `orcasound-next` and `esp32_ui` while keeping content repo-specific.
- What changed: Added a mirrored `docs/architecture/` file set in both repos with equivalent structure (`README.md`, `architecture-walkthrough-plan.md`, `architecture-baseline-inventory.md`, `frontend-data-contract-rules.md`) and aligned wording template; repo-specific differences are limited to transport/auth/backend dependency context.
- Next step: Continue Step 3 in parallel by drafting state-layer standards in both mirrored folders using the same section order.
- Blockers/risks: Existing legacy docs still exist outside `docs/architecture/`; recommend choosing this folder as the canonical source to avoid drift.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, step-3 state-layer standards completed in mirrored repos)
- Current objective: Complete Step 3 with parallel, side-by-side state-layer standards for `orcasound-next` and `esp32_ui`.
- What changed: Added `docs/architecture/frontend-state-layer-standards.md` in both repos with aligned structure/text, including ownership rules (shared vs local), global-store disallow list, selector standards/anti-patterns, a reusable Zustand slice template, and a PR decision checklist. Updated both `docs/architecture/README.md` files to link Step 3 deliverable, mark Step 3 complete, and set Step 4 as active.
- Next step: Execute Step 4 in both repos by documenting telemetry integration boundaries and mapping current pages/hooks to target typed data hooks.
- Blockers/risks: Existing legacy docs outside `docs/architecture/` can drift unless one location is declared canonical.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, esp32_ui shared-state decision set to Redux)
- Current objective: Clarify template settings-state implementation and lock shared-state technology choice for `esp32_ui` docs.
- What changed: Verified dashboard/settings drawer is managed by `SettingsProvider` context (not Redux) and wired in `src/pages/_app.tsx`; updated `esp32_ui/docs/architecture/architecture-walkthrough-plan.md` and `esp32_ui/docs/architecture/frontend-state-layer-standards.md` to use Redux as the shared-state standard while keeping mirrored document structure.
- Next step: Continue Step 4 in both repos with transport-specific telemetry integration mapping (React Query for server-state, Redux/Zustand for shared UI state by repo).
- Blockers/risks: `esp32_ui` still has mixed legacy state layers (Redux + multiple contexts), so migration sequencing should define which contexts are retained vs folded into Redux.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, redux-vs-context standards added to step-3 docs)
- Current objective: Add explicit guidance for when shared state should use Redux versus Context, using `esp32_ui` template patterns as reference.
- What changed: Updated both `docs/architecture/frontend-state-layer-standards.md` files (in `esp32_ui` and `orcasound-next`) with a new `Redux vs Context Standards` section including: when Redux is required, when Context is acceptable, Context anti-pattern boundaries, and track-specific guidance notes.
- Next step: Apply these rules in Step 4 integration mapping so each proposed state field is assigned to React Query, Redux/Zustand, Context, or local state with rationale.
- Blockers/risks: Existing code still has mixed legacy patterns, so enforcement should happen incrementally in PR review checklists rather than a single large refactor.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, context-vs-store rationale thresholds explained)
- Current objective: Clarify why certain shared state uses Context vs Redux/store patterns and provide concrete decision thresholds.
- What changed: Collected concrete references from `esp32_ui` (`settings-context`, `jwt-context`, `root-reducer`) and `orcasite` (`SocketContext` in `_app`) to explain architecture choices and provide numeric heuristics for narrow/bounded/high-churn decisions.
- Next step: Apply these thresholds during Step 4 mapping so each field gets an explicit state-layer classification with rationale.
- Blockers/risks: Thresholds are heuristics, not hard constraints; exceptions should be recorded per feature to avoid inconsistent decisions.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, added useRef vs useState vs store standards)
- Current objective: Clarify the mental model for integration/session runtime handles versus UI state and formalize it in Step 3 docs.
- What changed: Added a shared `useRef vs useState vs Global Store` section to both state-layer standards docs (`orcasound-next` and `esp32_ui`), including practical thresholds for narrow/bounded/frequent/high-churn/small/large and explicit decision rules.
- Next step: Use this rubric during Step 4 mapping to classify each field as `useRef`, local state, Context, global store, or server-state.
- Blockers/risks: Existing socket hook lifecycle may still create duplicate socket connections if invoked from many consumers; review connection ownership when implementing Step 4.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, unified state-layer decision section)
- Current objective: Reduce conceptual duplication in Step 3 docs and clarify terminology for read/write semantics.
- What changed: Merged `useRef vs useState vs Global Store` and `Redux vs Context Standards` into one unified section in both mirrored files. Updated wording to explicitly include `read (get/select)` and `write (set/dispatch/action)` semantics.
- Next step: Apply the unified rubric to classify concrete state fields during Step 4 telemetry integration mapping.
- Blockers/risks: Existing runtime state in `orcasound-next` still includes non-serializable UI payloads in store; this remains a migration cleanup item.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, layoutStore concrete usage examples explained)
- Current objective: Provide concrete, code-referenced examples for why `LayoutContext`/`layoutStore` fits shared-store patterns.
- What changed: Collected callsite counts and references showing cross-feature usage (`useLayout` in 17 callsites), multiple mutable fields/actions in `layoutStore`, and interaction-driven updates (`setPlaybarExpanded` and `setDrawerContent`) across page and component boundaries.
- Next step: Use these examples to refine Step 4 mapping and optionally split `layoutStore` into narrower slices if rerender scope needs reduction.
- Blockers/risks: Current layout state still includes non-serializable `drawerContent` (`ReactNode`) which should eventually be replaced with serializable view descriptors.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, added stores README with layoutStore rationale)
- Current objective: Persist concrete code-based justification for `layoutStore` in-repo near the store implementation.
- What changed: Added `ui/src/stores/README.md` documenting why `layoutStore` is needed, including cross-feature callsite breadth, field/action scope, interaction-driven update counts, and cleanup notes about non-serializable `drawerContent`.
- Next step: If desired, split `layoutStore` into narrower slices and replace `drawerContent` with serializable view descriptors.
- Blockers/risks: Current store still holds a `ReactNode` value (`drawerContent`), which limits portability/persistence/debug tooling.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-13, esp32_ui docs navigation clarification)
- Current objective: Clarify whether `esp32_ui/docs` has a navigable hierarchy beyond alphabetical file ordering.
- What changed: Verified docs navigation is app-defined in `src/layouts/docs/config.tsx` and rendered by docs side-nav layout components, while markdown files in `/docs` are loaded by slug through `src/pages/docs/[slug].tsx` and `src/utils/docs.ts`.
- Next step: Optional improvement is adding an explicit `docs/README.md` index file if filesystem-level discoverability is desired outside the running app.
- Blockers/risks: No autogenerated heading TOC component is present in article renderer, so in-page section navigation is currently manual.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-14, esp32_ui docs runtime troubleshooting findings)
- Current objective: Diagnose why `esp32_ui` docs pages were unreachable from container and unstable outside container.
- What changed: Verified `next dev --help` supports `--webpack`; confirmed `esp32_ui` starts successfully in-container with `next dev --webpack -p 4000` and responds on `127.0.0.1:4000` (HTTP 307 to `/dashboard`). Identified host mapping mismatch as likely cause of `localhost:4000` failure from host, because this devcontainer stack publishes container `4000` to host `4001`.
- Next step: Run `esp32_ui` in container on a deliberate mapped/forwarded port and use `--webpack` outside container until Turbopack panic is resolved.
- Blockers/risks: Turbopack panic remains unresolved root-cause; workaround is stable but does not fix underlying Turbopack bug.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-14, esp32_ui permanent dev-script turbopack bypass)
- Current objective: Remove need for manual `--webpack` flags when running `esp32_ui` locally.
- What changed: Updated `esp32_ui/package.json` script from `next` to `next dev --webpack`, making `npm run dev` permanently use webpack dev server.
- Next step: Run `npm run dev` in `esp32_ui` and confirm stable startup without Turbopack panic.
- Blockers/risks: This is a stability-first pin to webpack; it does not resolve underlying Turbopack bug/root cause.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-14, pinned dev-note + local eslint working-directory fix)
- Current objective: Add permanent developer note for `esp32_ui` webpack dev mode and diagnose intermittent `orcasite` tsconfig lint parse errors in VS Code.
- What changed: Added pinned `Dev Server Note` to `esp32_ui/README.md`; verified `orcasite` ESLint issue is caused by workspace root resolution against `/workspaces/orcasite/tsconfig.json` while actual config lives in `/workspaces/orcasite/ui/tsconfig.json`; added local `.vscode/settings.json` in `orcasite` with `eslint.workingDirectories: ["ui/"]` and `typescript.tsdk` path.
- Next step: Reload VS Code window once so ESLint server restarts with the new working directory setting.
- Blockers/risks: `orcasite/.vscode/settings.json` is intentionally git-ignored, so teammates must apply equivalent local setting or use the provided `.vscode/settings.example.json`.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-14, /existing build failure root-cause)
- Current objective: Explain why `npm run build` fails with `Failed to collect page data for /existing`.
- What changed: Traced import chain and confirmed build-time env guard in `ui/src/hooks/useTimestampFetcher.ts` throws when `NEXT_PUBLIC_S3_BUCKET` is unset. `/existing` uses `getMapLayout`, which imports `Player`, which imports `useTimestampFetcher`, so the module-level throw can fail page-data collection.
- Next step: Provide either build env var in production build context (`.env.production`/`.env.local`) or move env guard from module scope into runtime-safe path.
- Blockers/risks: Similar module-scope env guards exist (`NEXT_PUBLIC_GQL_ENDPOINT`, `NEXT_PUBLIC_SOCKET_ENDPOINT`) and can cause additional page-data collection failures if unset during build.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-17, step-4 feature-track integration design completed)
- Current objective: Complete Step 4 of the architecture walkthrough in parallel for `orcasound-next` and `esp32_ui`.
- What changed: Added `docs/architecture/feature-track-integration-design.md` in both repos with explicit current->target data boundary design, page/hook/store mapping matrices, hook/client inventories, store ownership rules, and manual migration checklists. Updated both `docs/architecture/README.md` files to link the Step 4 deliverable, mark Step 4 complete, and set Step 5 as the active focus.
- Next step: Execute Step 5 by documenting AI boundary orchestration (UI route/server boundary/backend streaming contract) in mirrored docs.
- Blockers/risks: Several mappings still depend on unresolved endpoint contract details (especially telemetry/alerts and AI-adjacent fields), so Step 6 contract hygiene remains a prerequisite for final implementation sequencing.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `6b512f7acbe518f59eeaa6331032b4c1c9209ac2` (short: `6b512f7`).

## Milestone Update (2026-02-17, Step 4 deep-dive: adapter vs backend integration)
- Current objective: Answer architecture questions on DTO/domain adapters, frontend-vs-backend transforms, and `orcasite/server` Orcahello machine-detection integration.
- What changed: Re-validated backend implementation details in `orcasite/server` (`Detection` resource, JSON:API routes, machine submission policy/tests, feed `orcahello_id` metadata) and confirmed the current pattern is authenticated machine-ingestion into `/api/json/detections` with `source: machine`, not an obvious server-side Orcahello polling client in the inspected code.
- Next step: Provide a decision-ready frontend/backend boundary recommendation and PR strategy for `orcasite` and `esp32_ui` with parallel architecture.
- Blockers/risks: Need backend-team confirmation on where Orcahello client jobs run if outside this repo/process.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `8b88858f6f7e6b4d6683b4f4f76f9108f7769c87` (short: `8b88858`).
- Correction: latest commit hash for this milestone is `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-17, detailed `useMasterData` refactor guidance)
- Current objective: Provide detailed, implementation-level guidance for `orcasound-next` adapter refactor checklist questions (`DataTypes`, `masterDataTransforms`, unified detections, testing approach).
- What changed: Verified current code state: canonical types exist in `ui/src/types/DataTypes.ts`, pure transforms exist in `ui/src/utils/masterDataTransforms.ts`, orchestration exists in `ui/src/hooks/beta/useMasterData.ts`, and there is currently no app-level unit test harness in `ui` (only `node_modules` tests discovered).
- Next step: Use this baseline to define precise changes for unified detection stream and add adapter unit tests before behavior changes.
- Blockers/risks: Existing type model still reflects old split human/AI shape and will require careful migration to avoid downstream breakage.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-17, orcasite no-data + `/seed` 404 diagnosis)
- Current objective: Explain why `orcasite` UI/server show no data and why `/seed` resolves to 404 without changing repo `.env.development`.
- What changed: Verified `/workspaces/orcasite/ui/src/pages/seed.tsx` exists and intentionally returns `notFound` unless `process.env.ENABLE_SEED_FROM_PROD === "true"` in `getStaticProps`. Confirmed GraphQL data endpoint in this session responds on `http://localhost:4000/graphql` (not `4001`) and currently returns empty `feeds`.
- Next step: Run UI with explicit runtime env (`ENABLE_SEED_FROM_PROD=true`) and align UI GraphQL endpoint to the actual server port for the active workspace/session.
- Blockers/risks: Current `.env.development` uses shell-style default expansion (`${SERVER_PORT:-4000}`), which may not be expanded by the UI runtime depending on launch path.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-17, root-cause found for orcasite seed no-data)
- Current objective: Resolve why `/seed` reports success but no data appears in `orcasite` UI/GraphQL.
- What changed: Reproduced seed pipeline directly and found hard failure in `Orcasite.Radio.Seed.feeds!()` due to `maintainer_emails` being present in upstream feed payload but not accepted by local `Orcasite.Radio.Feed.create` action (`No such input maintainer_emails`). Verified upstream prod GraphQL feed data is reachable and non-empty.
- Next step: Patch feed seeding compatibility (either accept `maintainer_emails` in `Feed.create` or filter to action-accepted attrs in seed conversion), then rerun feed seed followed by resource seed.
- Blockers/risks: `seed_all` currently calls `feeds()` non-bang and proceeds, which can mask feed seed failure and produce apparent success with no local data.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-17, GraphiQL detections query mismatch guidance)
- Current objective: Explain why a manually pasted detections GraphQL query failed in GraphiQL.
- What changed: Compared user query to repo-generated operations in `ui/src/graphql/queries/listDetections.graphql` and generated types. Confirmed canonical query shape includes `count`, `hasNextPage`, and `candidate { id }`; user-added nested fields (`candidate.feedId`, `feed { ... }`) may fail on some schema snapshots.
- Next step: Use the exact generated query first, then add extra nested fields incrementally while checking schema docs for each field.
- Blockers/risks: Cannot directly inspect the user's running GraphiQL schema endpoint from this execution environment.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, ReverseProxyPlug econnrefused root cause)
- Current objective: Diagnose `localhost:4001` reverse proxy failures while running `orcasound-next/server`.
- What changed: Confirmed `OrcasiteWeb.Router` proxies `/` to `http://localhost:${UI_PORT}` and current env has `UI_PORT=3000`, while Next UI process is running on port `3001` (`next dev -p 3001`). This mismatch causes `ReverseProxyPlug network error :econnrefused` and HTTP 502 on `/`.
- Next step: Align server proxy target with actual Next port (set `UI_PORT=3001` when starting server, or update router fallback logic to use `ORCASOUND_NEXT_UI_PORT`).
- Blockers/risks: If only one of the two vars is changed, future restarts can regress to port mismatch.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, reverse proxy port precedence fix)
- Current objective: Eliminate repeated `ReverseProxyPlug :econnrefused` on `/` caused by UI port mismatch in `orcasound-next`.
- What changed: Updated `server/lib/orcasite_web/router.ex` so reverse proxy now resolves UI port in this order: `ORCASOUND_NEXT_UI_PORT`, then `UI_PORT`, then `3000`. This aligns server proxy behavior with `ui/package.json` (`next dev -p ${ORCASOUND_NEXT_UI_PORT:-3001}`). Verified compile succeeds.
- Next step: Restart Phoenix and Next processes so the new router code and env selection take effect.
- Blockers/risks: Existing running server process may still be using old compiled/router state until restarted.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, detection `source` typing gap diagnosis)
- Current objective: Explain how to get new `Detection.source` from `orcasite` schema into `orcasound-next` and why TS behavior differs across hooks/transforms.
- What changed: Verified `orcasound-next/ui/codegen.ts` still points to `http://localhost:4000/graphql`; generated `Detection` type lacks `source` (only `sourceIp`). Confirmed ad-hoc `graphql-request` hooks (`useLiveDetections*`) include `source` in query string but cast response to `Detection[]`, so extra fields are accepted yet inaccessible on the `Detection` type.
- Next step: Regenerate codegen against a schema that includes `Detection.source` (no git pull required), then update affected transforms/hooks to use updated generated types or operation-level result types.
- Blockers/risks: If codegen runs against stale local schema, `source` will remain absent and TS errors in transforms will persist.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, codegen validation fix + detection source regen)
- Current objective: Unblock GraphQL codegen in `orcasound-next/ui` and regenerate types with new `Detection.source` field.
- What changed: Renamed four anonymous ad-hoc query documents to named operations in `useFeedSegments.tsx`, `useFeedStreams.tsx`, `useLiveDetections.ts`, and `useLiveFeeds.ts`. Re-ran `npm run codegen` successfully against `https://live.orcasound.net/graphql`; generated `Detection` now includes `source: DetectionSource`.
- Next step: Update transform/hook logic to branch on `detection.source` and replace temporary assumptions around AI-vs-human source handling.
- Blockers/risks: `typescript-react-query` still ignores subscription operations (existing warning), unrelated to this fix.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, hook type fixes for optional detection category)
- Current objective: Resolve TypeScript errors in `useFilteredData` and `useSortedCandidates`.
- What changed: Updated both hooks to safely handle optional `newCategory` values introduced by current `AudioDetection` typing. `useFilteredData` now normalizes category via fallback string before comparisons/search. `useSortedCandidates` now accepts optional category values in `countCategories` and `toBucket`.
- Next step: Continue cleaning remaining repo-wide TypeScript errors unrelated to these two hooks (`DataTypes`/transform naming drift, report-page fragment typing, etc.).
- Blockers/risks: Project still has additional TS errors outside the two requested files.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, `masterDataTransforms` type-alignment fix)
- Current objective: Resolve TypeScript errors in `ui/src/utils/masterDataTransforms.ts` after data-model migration.
- What changed: Replaced stale `AIData`/`AIDetection`/`HumanData` imports with current `AudioDetection` model, removed unused `transformAI`, and updated `transformHuman` output to `type: "audio"` plus `newCategory` mapping from backend `source` (`MACHINE` whale -> `WHALE (AI)`). Restored `standardizeFeedName` import used by sightings transform. Verified no remaining TS errors for `masterDataTransforms`.
- Next step: Continue resolving remaining repo-wide TS errors unrelated to this file (context/report-page typing, deprecated AI hook imports).
- Blockers/risks: `useAIDetections` and other files still reference removed `AIData` types and need cleanup.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, `masterDataTransforms` current-error recheck and fix)
- Current objective: Re-check and resolve current TypeScript error in `ui/src/utils/masterDataTransforms.ts` after user noted stale analysis.
- What changed: Re-ran focused typecheck and confirmed current error was `newCategory` possibly undefined in `transformHuman`. Added `toAudioCategory` normalizer that maps backend `Detection` safely to `AudioDetection["newCategory"]` with machine-source handling and fallback to `OTHER`. Verified no remaining TS error in `masterDataTransforms`.
- Next step: Continue resolving remaining project-wide TypeScript errors outside this file as needed.
- Blockers/risks: None for this file; other files still have independent TS issues.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, local GraphiQL vs UI schema mismatch)
- Current objective: Explain why `source` appears in `/json` after codegen but not in local `/graphiql`.
- What changed: Verified `ui/codegen.ts` currently targets `https://live.orcasound.net/graphql`, while local backend resource file `server/lib/orcasite/radio/detection.ex` does not currently define a `source` attribute (only `source_ip`).
- Next step: Either point runtime/UI to live API consistently, or backport server-side `Detection.source` changes into local `orcasound-next/server` and restart Phoenix so local GraphiQL schema includes `source`.
- Blockers/risks: Frontend-generated types can drift from local backend schema when codegen source and runtime backend are different endpoints.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, server update strategy for `Detection.source`)
- Current objective: Recommend how to update local server schema so GraphiQL exposes `Detection.source`.
- What changed: Provided a low-risk git strategy: prefer selective cherry-pick of server schema/migration commits from `main` (or manual backport) over broad branch merge, with validation steps.
- Next step: Identify commit(s) on `main` that add detection `source`, cherry-pick onto feature branch, run migrations, restart server, and introspect `Detection` fields in GraphiQL.
- Blockers/risks: Full merge may pull unrelated frontend/docs changes and increase conflict surface.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-18, cross-repo server diff inventory)
- Current objective: Determine whether `orcasound-next/server` and `orcasite/server` are effectively identical.
- What changed: Ran directory-level file-hash diff (excluding build artifacts). Result: `61` changed shared files, `52` files only in `orcasite/server`, `6` files only in `orcasound-next/server`. Verified key divergence includes `Detection.source`/machine-ingest implementation and multiple newer migrations present only in `orcasite`.
- Next step: Prefer selective cherry-pick/backport of specific server commits (e.g., detection source + dependent migrations/types) rather than copying full server directory.
- Blockers/risks: Full folder copy would import many unrelated backend/auth/seed/listener-count changes and migrations, raising conflict and runtime risk.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-19, targeted server backport applied for `Detection.source`)
- Current objective: Execute minimal backend backport so local `orcasound-next/server` GraphQL exposes `Detection.source`.
- What changed: Added `Detection.Types.Source` enum module, added `source` attribute to `lib/orcasite/radio/detection.ex`, and added migration `20250630015604_add_source_to_detections.exs` to create `detections.source` with default `human`. Ran `mix compile` and `mix ecto.migrate` successfully. Verified schema fields include `:source` via Absinthe introspection.
- Next step: Restart running Phoenix server process and re-check `/graphiql` introspection/query results from host browser.
- Blockers/risks: Existing running server instance may still be stale until restarted.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `b283a4da9b94dd95c2ba565c6b0eabb3f831b862` (short: `b283a4d`).

## Milestone Update (2026-02-19, `NewMap` union-narrowing diagnosis)
- Current objective: Explain why `CombinedData` in `NewMap` does not expose sighting-only fields (`created`, `latitude`, `longitude`) despite filtering sightings.
- What changed: Confirmed TS errors in `NewMap` are due to insufficient union narrowing: `AudioDetection.newCategory` includes a broad `string`, so checking `newCategory === "SIGHTING"` does not prove the value is `Sighting`.
- Next step: Narrow by discriminant (`type === "sightings"`) via type-guard predicate, and/or tighten `AudioDetection.newCategory` to literal union without broad `string`.
- Blockers/risks: Keeping `| string` on `AudioDetection.newCategory` will keep undermining reliable type narrowing across the codebase.
- Branch and latest commit hash: `/workspaces/orcasound-next` `useMasterData-refactor` @ `7879f022ce5447be8f9f9684f139b7f3ece3e226` (short: `7879f02`).

## Milestone Update (2026-02-19, reports detection typing fix)
- Current objective: Fix TypeScript error in `src/pages/reports/[candidateId].tsx` where candidate query detections were not assignable to `DetectionsTable` prop type.
- What changed: Updated `ui/src/components/DetectionsTable.tsx` to accept a narrowed `TableDetection` shape (`Pick<Detection, ...>`) matching fields actually used by the table, and removed synthetic detection field injection in `ui/src/pages/reports/[candidateId].tsx` so it passes `candidate.detections` directly.
- Next step: Keep `DetectionsTable` props tied to query/usage fields (not full schema object requirements) to avoid similar operation-type mismatches.
- Blockers/risks: None; `npx tsc --noEmit` now passes.
- Branch and latest commit hash: `useMasterData-refactor` @ `e02c2433465fabc3286c6600fc00072e4fea5f5f` (short: `e02c243`).

## Milestone Update (2026-02-19, orcasite useCombinedData typing fix)
- Current objective: Resolve TypeScript error while migrating `useMasterData` pattern into `orcasite` `useCombinedData`.
- What changed: Re-ran `tsc` on latest files and fixed type mismatch by aligning adapter input/output types to the `useDetectionsQuery` result shape instead of full `Detection` schema type requiring `feed`. Updated `orcasite/ui/src/types/DataTypes.ts` and `orcasite/ui/src/utils/masterDataTransforms.ts` accordingly.
- Next step: Continue migration work on `useCombinedData` with query-result-based DTO types to avoid full-schema over-typing.
- Blockers/risks: None; `npx tsc --noEmit` passes in `/workspaces/orcasite/ui`.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-19, orcasite DTO alias readability cleanup)
- Current objective: Simplify confusing `NonNullable<...>[number]` usage introduced during `useCombinedData` type fix.
- What changed: Added readable aliases in `orcasite/ui/src/types/DataTypes.ts` (`DetectionsResultList`, `DetectionDto`) with a clarifying DTO-vs-model comment, and updated `orcasite/ui/src/utils/masterDataTransforms.ts` to use these aliases.
- Next step: Keep adapter signatures anchored to named DTO aliases for readability and consistent query-shape typing.
- Blockers/risks: None; `npx tsc --noEmit` passes in `/workspaces/orcasite/ui`.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-19, DTO-vs-model clarification)
- Current objective: Explain why `useDetectionsQuery` output cannot be treated as full `Detection` and why this surfaced in `orcasite` but seemed fine in `orcasound-next`.
- What changed: Compared both repos and confirmed `useDetectionsQuery` is strongly typed to operation result DTOs, while full `Detection` schema type requires fields (e.g., `feed`) that are not selected in the detections list query. Also confirmed `orcasound-next` masked this with explicit casts (`seedDetections as Detection[]`) and custom response typing.
- Next step: Keep adapter input/output types on operation DTO aliases (`DetectionDto`/`DetectionsResultList`) and use schema model types only where full fields are guaranteed.
- Blockers/risks: Continuing to cast DTO arrays to full model types can hide real schema/query drift and reintroduce runtime/type mismatches.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-19, useCombinedData placement guidance)
- Current objective: Decide where to call `useCombinedData` in `orcasite` for map markers and detections list without adding Context/store yet.
- What changed: Recommended page-level/container-level single invocation of `useCombinedData` with derived selectors (e.g., last 7 days) passed to map/list child components, instead of calling the adapter hook independently in each child.
- Next step: Create a route-level feature container (e.g., map/list page) that calls `useCombinedData`, derives `last7Days` once with `useMemo`, and passes filtered arrays down as props.
- Blockers/risks: Calling `useCombinedData` in each component would still share React Query network cache but duplicate adapter/merge/filter compute work.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-19, _app.tsx prop wiring guidance)
- Current objective: Clarify whether `useCombinedData` should be called in `orcasite` `_app.tsx` and passed via `pageProps`.
- What changed: Advised against `_app` for feature-specific combined-data wiring; recommended page/container-level hook invocation and prop drilling to map/list components.
- Next step: Keep `_app` for truly app-wide concerns (providers/theme/auth/router wrappers), and place `useCombinedData` in the route that needs it.
- Blockers/risks: Putting it in `_app` would run data loading/transforms for unrelated routes and can increase initial render cost globally.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-19, useCombinedData exhaustive-deps lint fix on latest file)
- Current objective: Resolve `react-hooks/exhaustive-deps` warning in `orcasite/ui/src/hooks/useCombinedData.ts` on current repo state.
- What changed: Re-read latest file versions, reproduced warning, then memoized `audioDetections` from `useDetectionsQuery().data?.detections?.results` before passing it to transform memo.
- Next step: Continue migration work; if additional lint warnings appear for fallback arrays, apply same stable-reference memo pattern.
- Blockers/risks: None; `npx eslint src/hooks/useCombinedData.ts` and `npx tsc --noEmit` pass in `/workspaces/orcasite/ui`.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-19, date-range helper added in orcasite)
- Current objective: Add a utility in `orcasite` for computing the date a duration (ms) ago from now.
- What changed: Added `getDateMsAgo(durationMs, nowMs?)` to `orcasite/ui/src/utils/dataHelpers.ts` next to time-range constants.
- Next step: Use `getDateMsAgo(sevenDays)` when deriving last-7-day filters for map/list views.
- Blockers/risks: None; `npx tsc --noEmit` passes in `/workspaces/orcasite/ui`.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, MapLayout query placement explanation)
- Current objective: Explain why `useFeedsQuery` is in `MapLayout`, whether detections/sightings should follow same placement, and clarify `getMapStaticProps` purpose.
- What changed: Reviewed `orcasite` `MapLayout`, `Map`, and listen page wiring. Confirmed layout currently owns feed selection/current-feed logic and passes `feeds/currentFeed` to `Map`; `getMapStaticProps` prefetches feeds into React Query cache during static generation for shared map pages.
- Next step: Keep feeds in layout; move detections/sightings up to layout/container only if shared by multiple children (map + list) or if you want centralized derivation; otherwise keep map-local queries.
- Blockers/risks: Prefetching high-churn detections/sightings via static props can serve stale data windows; keep those client-side unless switching to SSR/server-side fetch strategy.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, orcasite reverse-proxy 502 reminder)
- Current objective: Explain recurring `ReverseProxyPlug network error: :econnrefused` when hitting `orcasite` server root.
- What changed: Re-verified `orcasite` router proxies `/` to `http://localhost:${UI_PORT}` (default `3000`), while GraphQL lives directly on server routes (`/graphql`, `/graphiql`) and does not depend on Next proxy.
- Next step: Start Next UI and Phoenix in same environment with matching ports (`UI_PORT` for Phoenix proxy target), or avoid `/` during backend checks and use `/graphql`/`/graphiql` directly.
- Blockers/risks: If UI runs on host while Phoenix runs in container, server-side `localhost` will not reach host UI and `/` will keep returning 502.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, localhost server mismatch diagnosis)
- Current objective: Diagnose why orcasite UI was up but server routing/ports still failing.
- What changed: Verified active Next process is `orcasite/ui` on port 3000, but active Phoenix process CWD is `/workspaces/orcasound-next/server` (not `orcasite/server`). Confirmed `localhost:4000/` returns 502 proxy error and `localhost:4001` is not listening.
- Next step: Stop the current Phoenix process and start `orcasite/server` with `UI_PORT=3000` (and `PORT=4000` unless remapping).
- Blockers/risks: Running mismatched repo UI/server pairs causes expected ReverseProxyPlug `:econnrefused` and inconsistent endpoint behavior.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, orcasite commit-message assist for map changes)
- Current objective: Provide commit message matching current `orcasite` branch working tree.
- What changed: Checked current status and identified modified files in map/layout/sightings plus new `ui/src/utils/mapHelpers.tsx`.
- Next step: Commit map UI enhancements and sightings-based marker logic as one feature commit.
- Blockers/risks: Ensure map helpers file is included in commit (`git add ui/src/utils/mapHelpers.tsx`).
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, orcasite PR size check)
- Current objective: Estimate PR size for merging current `orcasite` branch into `main`.
- What changed: Compared `adrian/next-1/data-layer` against `main` using `git diff main...HEAD`.
- Next step: Use this size estimate to decide whether to split into smaller PRs.
- Blockers/risks: None.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, orcasite changed-file listing)
- Current objective: List files changed on current `orcasite` branch compared to `main`.
- What changed: Retrieved `git diff --name-only main...HEAD` for `adrian/next-1/data-layer`.
- Next step: Use this list to split PR or review scope by server vs UI concerns.
- Blockers/risks: None.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, filtered PR line-count recalculation)
- Current objective: Recalculate `orcasite` branch diff size excluding backend Elixir files and `ui/src/pages/seed.tsx`.
- What changed: Computed filtered `git diff --numstat main...HEAD` excluding `*.ex`, `*.exs`, and `ui/src/pages/seed.tsx`.
- Next step: Use this reduced number for frontend-focused PR sizing.
- Blockers/risks: None.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, getLayout data-flow guidance)
- Current objective: Explain how to share `useSightings` data with child pages under `MapLayout` (e.g., `/listen/[feed]`).
- What changed: Clarified that `getLayout` is primarily a wrapper and not an ideal prop-injection channel; recommended either querying in page/hook (cache-shared) or providing layout-scoped context/provider for shared derived data.
- Next step: If data must be shared across map + page children, add a `MapDataProvider` inside `MapLayout`; otherwise call `useSightings` directly in each consumer.
- Blockers/risks: Prop injection via `React.cloneElement` works but is brittle and weaker for typing/composability.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, MapLayout line-126 TS error diagnosis)
- Current objective: Explain TS error at `MapLayout.tsx` line 126 when passing `detections` prop.
- What changed: Reproduced with `npx tsc --noEmit`; confirmed `useDetectionsQuery().data?.detections?.results` is typed as `DetectionsResult[] | null | undefined`, while `Map` expects `DetectionsResult[] | undefined`.
- Next step: Normalize `null` to `undefined` or `[]` before passing, or widen `Map` prop type to include `null`.
- Blockers/risks: None.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, sightings hydrophone transform placement guidance)
- Current objective: Decide where to add a derived `hydrophone` field for sightings across `orcasite` usage.
- What changed: Recommended keeping `useSightings` as raw source-fetch hook and adding hydrophone enrichment in a composed adapter hook/transform layer that has feed context (e.g., `useCombinedData` or `useSightingsWithHydrophone`).
- Next step: Implement a pure transform function plus a composed hook that joins sightings + feeds and returns enriched sightings DTO/domain type.
- Blockers/risks: Injecting feed-dependent transform into `useSightings` couples one-source fetch logic to unrelated query dependencies and reduces reuse.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, dataTransforms line-104 TS fix)
- Current objective: Fix `orcasite` TypeScript error in `ui/src/utils/dataTransforms.ts` around line 104.
- What changed: Reproduced error (`Sighting[]` mismatch due `type/newCategory` widening to `string`) and fixed by typing map output explicitly as `Sighting[]` with callback return type `Sighting`.
- Next step: Continue with map/list integration using transformed sightings enriched with feed metadata.
- Blockers/risks: None; `npx tsc --noEmit` passes in `/workspaces/orcasite/ui`.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, listen-feed ReportCount prop typing fix)
- Current objective: Resolve TS error at `orcasite/ui/src/pages/listen/[feed].tsx` line 52.
- What changed: Updated `orcasite/ui/src/components/ReportCount.tsx` component signature from positional `CombinedData[]` parameter to named props object `{ detectionArray: CombinedData[] }` to match call site usage `<ReportCount detectionArray={...} />`.
- Next step: Continue listen page integration and category-count display refinements.
- Blockers/risks: None; `npx tsc --noEmit` passes in `/workspaces/orcasite/ui`.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, simplified orcasite map pan/zoom behavior)
- Current objective: Match `orcasound-next` map recenter/zoom behavior in `orcasite` with minimal code.
- What changed: Moved map viewport control to `MapLayout` using `map.setView(...)` on URL/feed changes; removed `latLng/zoom` state and `MapUpdater` usage from `Map.tsx`.
- Next step: Verify in browser that `/listen/[feed]` centers and zooms to 12, and non-feed routes reset to default center and zoom 9.
- Blockers/risks: If other routes intentionally relied on `currentFeed` fallback to first online feed, behavior is now explicit reset when no feed is present.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, MapLayout SSR fix for window undefined)
- Current objective: Resolve `ReferenceError: window is not defined` after map viewport refactor.
- What changed: Removed runtime `leaflet` import (`latLng`) from `orcasite/ui/src/components/layouts/MapLayout.tsx` and switched `setView` calls to tuple coordinates (`[lat, lng]`) to keep layout SSR-safe.
- Next step: Re-run app build/runtime and verify `/listen/[feed]` now renders without SSR crash while preserving zoom/pan behavior.
- Blockers/risks: None observed; `npx tsc --noEmit` passes.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, preserve Player feed while resetting map on no-route)
- Current objective: Keep `Player` selection when URL feed segment is removed, without changing `Player` component.
- What changed: Updated `MapLayout` to stop clearing `currentFeed` when no `[feed]` is present, and passed URL-derived `feed` (not sticky `currentFeed`) to `Map` so map zoom/highlight resets correctly.
- Next step: Verify runtime behavior: `/listen/[feed]` selects/zooms map + player, returning to `/listen` resets map but keeps playing/current player label.
- Blockers/risks: None; `npx tsc --noEmit` passes.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, map transition reset suppression between feed routes)
- Current objective: Eliminate intermediate default-center reset when navigating between `/listen/[feed]` routes via map icon clicks.
- What changed: Updated `MapLayout` viewport effect to skip reset while a feed slug exists but the feed query is still resolving (`if (slug && !feed) return`).
- Next step: Verify UX in browser by clicking multiple different feed icons consecutively; expected behavior is direct pan/zoom between feeds with no default jump.
- Blockers/risks: None; `npx tsc --noEmit` passes.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, keep active feed marker highlighted without feed slug)
- Current objective: Keep selected/playing feed marker blue when navigating from `/listen/[feed]` to `/listen` (no feed slug).
- What changed: Updated `MapLayout` to pass sticky `currentFeed` to `Map` for marker highlight state, while map viewport behavior remains URL-driven via `feed` in layout effect.
- Next step: Verify runtime: on `/listen`, map recenters to default but currently playing feed marker stays blue.
- Blockers/risks: None; `npx tsc --noEmit` passes.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, HMR-safe Leaflet setView fix)
- Current objective: Fix intermittent `Cannot set properties of undefined (setting '_leaflet_pos')` during hot reloads in `MapLayout`.
- What changed: Made map ref lifecycle explicit by allowing `Map` to report `null` on unmount, normalized to `undefined` in `MapLayout`, and added a guard to skip `setView` when map pane is not mounted.
- Next step: Verify repeated save/HMR cycles no longer throw runtime errors without manual refresh.
- Blockers/risks: None; `npx tsc --noEmit` passes.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, remove explicit-any from HMR map guard)
- Current objective: Keep HMR map safety guard while fixing ESLint `no-explicit-any` in `MapLayout`.
- What changed: Replaced `(map as any)._mapPane` with typed cast `LeafletMap & { _mapPane?: unknown }` and preserved guard semantics.
- Next step: Continue map/layout polish with strict TS/ESLint compatibility.
- Blockers/risks: None; `npx tsc --noEmit` and file-level eslint pass.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, seed.tsx exhaustive-deps warning fix)
- Current objective: Resolve `react-hooks/exhaustive-deps` warning in `orcasite/ui/src/pages/seed.tsx` for `feeds` fallback array.
- What changed: Wrapped `feeds` derivation in `useMemo` and added `useMemo` import so `feeds` reference is stable for `useEffect` dependencies.
- Next step: Continue seed-page cleanup as needed.
- Blockers/risks: None; file-level eslint passes.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, PR sizing and readiness guidance)
- Current objective: Assess PR readiness for `orcasite` branch `adrian/next-1/data-layer` relative to last PR branch `adrian/fix-seeding`.
- What changed: Calculated branch-to-branch diff stats and file list; identified mixed backend/frontend scope and no existing UI test files.
- Next step: Optionally split PR into focused frontend data-layer/map changes vs backend seed changes to reduce review surface.
- Blockers/risks: Large mixed-scope diff (15 files, 954 changed lines) may increase review churn.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, clarify fix-seeding vs data-layer diff semantics)
- Current objective: Resolve confusion about server files appearing in branch comparison and outline transform unit-test plan.
- What changed: Verified branch relationship and showed `...` vs `..` comparison differences; confirmed server files are not new relative to `adrian/fix-seeding` when using two-dot diff. Sketched focused unit-test scenarios for transform helpers.
- Next step: Use two-dot diff for branch-to-branch incremental PR scope and optionally add minimal transform tests with chosen test runner.
- Blockers/risks: UI package currently has no test runner configured, so adding unit tests requires introducing Vitest/Jest setup.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, dependent PR branching guidance)
- Current objective: Advise on branch strategy for adding a test runner while data-layer and server changes are in separate unmerged PRs.
- What changed: Recommended separate runner PR from main and stacked/dependent PR flow for data-layer without polluting runner PR diff.
- Next step: Create `add-test-runner` from `main`, then rebase/cherry-pick runner commits into data-layer branch (or set data-layer PR base accordingly) for test usage.
- Blockers/risks: Merging feature branch into runner branch will bloat runner PR and complicate review.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, test-runner branch next steps + base-branch verification)
- Current objective: Guide setup for new `adrian/add-test-ruunner` branch and clarify whether `adrian/fix-seeding` is actual base for `adrian/next-1/data-layer`.
- What changed: Provided minimal Vitest setup flow and git ancestry checks (`merge-base --is-ancestor`, merge-base hash, and branch diff commands).
- Next step: Create runner PR from `main` with small Vitest-only changes, then run ancestry checks to choose PR base strategy for data-layer.
- Blockers/risks: Mixing runner setup with feature code will inflate review scope.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, orcasite test-runner setup corrected)
- Current objective: Fix broken Vitest setup where commands were run in `orcasite/ui` but scripts/config were added in `orcasound-next/ui`.
- What changed: Added `test`/`test:watch` scripts to `orcasite/ui/package.json`, added `orcasite/ui/vitest.config.ts`, and verified `npm run test` succeeds with `--passWithNoTests`.
- Next step: Add first transform helper tests under `ui/src/utils` (e.g., `dataTransforms.test.ts`).
- Blockers/risks: None; only Vite CJS deprecation warning appears, not a failure.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, fix-seeding/data-layer branch relationship clarified)
- Current objective: Clarify correct PR stacking strategy for `adrian/fix-seeding` and `adrian/next-1/data-layer`.
- What changed: Verified `fix-seeding` is not an ancestor of `data-layer` (different hashes), but `--cherry-pick` comparison shows the seed patch is already equivalent in `data-layer` and current incremental diff is UI/test-runner focused.
- Next step: Use stacked PR workflow by setting `data-layer` PR base to `adrian/fix-seeding` (or rebase data-layer onto fix-seeding to make ancestry explicit).
- Blockers/risks: If base remains `main`, PR diff will include already-reviewed seed/server changes and create reviewer confusion.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, rebase-state explanation and recovery guidance)
- Current objective: Explain interrupted interactive rebase messages and safe recovery steps.
- What changed: Clarified skipped cherry-pick (duplicate patch), temporary overwrite protection error, and current in-progress rebase status with clean working tree.
- Next step: Continue rebase (`git rebase --continue`), skip duplicate/empty picks if prompted, and complete sequence.
- Blockers/risks: Duplicate commit entry in todo may require `git rebase --skip` or editing todo.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, first vitest unit tests added for transforms)
- Current objective: Add initial unit tests on `orcasite` data-transform helpers after runner setup.
- What changed: Added `ui/src/utils/dataTransforms.test.ts` with 4 tests covering audio category mapping/enrichment and sightings feed assignment/fallback behavior.
- Next step: Decide whether to keep tests in runner PR follow-up or include in data-layer PR, then commit accordingly.
- Blockers/risks: None; `npm run test` passes (4/4).
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, drafted comprehensive PR description for data-layer branch)
- Current objective: Provide detailed PR write-up for `adrian/next-1/data-layer` including dependent unmerged PR references and full change summary.
- What changed: Collected exact commit/file scope versus `fix-seeding` and assembled a structured PR template with summary, behavior changes, data-layer details, testing, and dependency notes.
- Next step: User can paste the drafted PR body and fill in actual GitHub PR links/IDs for `fix-seeding` and `add-test-runner`.
- Blockers/risks: Ensure PR base is set appropriately (recommended: `adrian/fix-seeding`) to minimize duplicated diff in review.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-20, vitest config lint-warning explanation)
- Current objective: Explain why `vitest.config.ts` exists and why `import/no-unused-modules` flags its default export.
- What changed: Clarified that Vitest discovers config by filename convention (CLI runtime), so no TS import references exist; warning is lint-rule false positive for tool config entrypoints.
- Next step: Add eslint override/ignore for `vitest.config.ts` (or disable `import/no-unused-modules` for config files).
- Blockers/risks: None.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-21, eslint override for vitest config export)
- Current objective: Suppress false-positive `import/no-unused-modules` warning for `vitest.config.ts`.
- What changed: Added `vitest.config.ts` to `.eslintrc` `import/no-unused-modules.ignoreExports` in `orcasite/ui` and verified `npx eslint vitest.config.ts` passes.
- Next step: Commit lint config tweak with test-runner setup changes.
- Blockers/risks: None.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-21, esp32_api pip install failure diagnosis)
- Current objective: Diagnose `playwright`/`llama-index-readers-web` install failure while setting up Python env for esp32_api linting.
- What changed: Confirmed env uses Python 3.12 and pip cannot resolve any `playwright` distributions in this container context; likely platform/packaging incompatibility for current architecture. Identified this as unrelated to FastAPI import linting needs.
- Next step: Use minimal dependency install for app imports (`fastapi`, `python-dotenv`, `supabase`, `uvicorn`) or switch to supported Python/platform for full requirements including llama-index web readers.
- Blockers/risks: Full `requirements.txt` install remains blocked until `playwright` dependency path is adjusted or environment architecture/runtime changes.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-21, esp32_api get_from_supabase test guidance)
- Current objective: Explain best terminal test method for newly added `get_from_supabase` in `esp32_api`.
- What changed: Reviewed current `main.py` implementation and clarified direct-function testing path vs endpoint/integration testing path.
- Next step: Run direct Python invocation in `server` cwd to validate Supabase query behavior before wiring `/readings` endpoint.
- Blockers/risks: Existing `/readings` route currently returns an empty string, so endpoint-level validation of `get_from_supabase` needs route implementation first.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-21, esp32_api rag import dependency blocker)
- Current objective: Unblock testing of `get_from_supabase` in `esp32_api` despite missing RAG dependencies.
- What changed: Identified that importing `app.main` eagerly imports `rag_router` -> `rag_query` -> `langchain_core`, causing failure before Supabase helper can be tested.
- Next step: Recommend either installing missing RAG deps for this env or decoupling helper testing/import path from RAG router initialization.
- Blockers/risks: Current module-level import coupling in `main.py` makes unrelated function tests fail when optional RAG deps are absent.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-02-21, esp32_api rag import check)
- Current objective: Diagnose persistent RAG-file import errors after installing `psycopg[binary]`.
- What changed: Verified `psycopg` imports successfully in `server/.venv`; direct module import check shows failures are currently due to missing `langchain_postgres` (for `rag_index`/`rag_query`), while `rag_snapshots` imports successfully.
- Next step: Install missing RAG dependency set (`langchain-postgres` and likely `psycopg_pool`) in the same active venv and re-run import checks.
- Blockers/risks: If VS Code uses a different interpreter than `server/.venv`, diagnostics may continue to look inconsistent.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`.

## Milestone Update (2026-03-11, added OrcaHello detection types)
- Current objective: Add types in `orcasound-next` for AI For Orcas / OrcaHello detections before building a portable hook.
- What changed: Updated `ui/src/types/DataTypes.ts` with exported OrcaHello types: `AIDetectionLocation`, `AIDetectionAnnotation`, `AIDetectionFound`, `AIDetectionReviewState`, `AIDetectionRaw`, and normalized `AIDetection`.
- Next step: Build a portable fetch/normalize client for OrcaHello pagination and then wrap it in a React Query hook.
- Blockers/risks: `AIDetection` is not yet threaded into `CombinedData`; integration should be done deliberately to avoid changing candidate logic unexpectedly.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`

## Milestone Update (2026-03-11, AIDetection now extends raw shape)
- Current objective: Make OrcaHello normalized detection typing show what changes from the raw API shape.
- What changed: Updated `ui/src/types/DataTypes.ts` so `AIDetection` now extends `Omit<AIDetectionRaw, "id" | "annotations" | "found" | "tags">` and explicitly redefines only the normalized fields plus app-only fields (`type`, `source`, `timestampString`, `reviewState`).
- Next step: Build fetch/normalize helpers using `AIDetectionRaw -> AIDetection` transformation.
- Blockers/risks: None.
- Branch and latest commit hash: `/workspaces/orcasound-next` `main` @ `944f866`

## Milestone Update (2026-03-11, OrcaHello pagination debug)
- Current objective: Confirm why `useAIDetections` still showed only 50 records after adding page iteration.
- What changed: Verified the OrcaHello API honors `page` and returns distinct 50-record pages. Removed stale `localStorage` fallback from `ui/src/hooks/beta/useAIDetections.ts`, stopped mutating shared params objects while paging, keyed the React Query request by date range, and added pending/fetching/error output to `ui/src/pages/json/index.tsx` for debugging.
- Next step: Reload `/json` and confirm the hook now resolves to the full multi-page result instead of a stale 50-record snapshot.
- Blockers/risks: The endpoint appears to have many pages for a 7-day range, so the full query may still take noticeable time before `data` becomes available.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, OrcaHello availability diagnosis)
- Current objective: Determine whether slow multi-page OrcaHello fetches are failing due to client logic or API-side throttling.
- What changed: Confirmed the live endpoint intermittently returns `403 Site Disabled` HTML after periods of working, with no `Retry-After` or rate-limit headers. This indicates service instability or intermittent disablement/unavailability rather than standard API throttling. Also confirmed the client-side pagination shape would require many sequential 50-record requests for a 7-day window.
- Next step: Reduce dependence on full client-side backfill by using cached GraphQL detections as the primary source and treating OrcaHello REST as enrichment or deferred/background fetch, with retry/backoff and persistence.
- Blockers/risks: As long as the Azure app remains unstable, any design that requires walking all OrcaHello pages on page load will be unreliable and slow.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, orcanode-monitor OrcaHello integration analysis)
- Current objective: Understand how `orcanode-monitor` consumes OrcaHello and whether it avoids the instability/performance issues seen in `orcasound-next`.
- What changed: Confirmed `orcanode-monitor` fetches OrcaHello server-side via C# `HttpClient`, not from the browser. It uses custom OrcaHello headers `totalamountpages` and `totalnumberrecords` to determine page counts and cheap counts, and it often asks only for counts (`RecordsPerPage=1`) instead of hydrating all detections. Full detail hydration still loops pages sequentially, but on the server and with known page count.
- Next step: If porting the approach, prefer a server-side enrichment path or background cache and use the OrcaHello pagination headers directly instead of probing until a short page.
- Blockers/risks: This does not eliminate upstream OrcaHello service instability; it mainly avoids browser CORS and reduces overfetching.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, OrcaHello header-based pagination)
- Current objective: Make `useAIDetections` page traversal deterministic and align it with the known OrcaHello API behavior.
- What changed: Updated `ui/src/hooks/beta/useAIDetections.ts` to read `totalamountpages` and `totalnumberrecords` from response headers on page 1, then fetch exactly `1..totalPages` instead of probing until a short page.
- Next step: Measure whether this reduces unnecessary requests and confirm whether the API still fails before all pages are fetched.
- Blockers/risks: This does not solve upstream Azure instability; it only improves client pagination correctness.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, browser-safe OrcaHello pagination fallback)
- Current objective: Fix `useAIDetections` after discovering OrcaHello pagination headers are present in raw responses but not readable from browser JS.
- What changed: Updated `ui/src/hooks/beta/useAIDetections.ts` so `totalPages` is nullable and only drives the loop when readable. Added a browser fallback that probes subsequent pages until an empty/short page or a repeated first record is encountered, instead of collapsing to a single page.
- Next step: Re-test `/json` to confirm multi-page results now return in browser, while still using explicit page counts when headers are available in non-browser contexts.
- Blockers/risks: Upstream API instability remains; this only fixes the one-page regression caused by unreadable custom headers.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, removed unreadable OrcaHello header path)
- Current objective: Simplify `useAIDetections` to match actual browser constraints.
- What changed: Removed the `totalamountpages` / `totalnumberrecords` parsing path from `ui/src/hooks/beta/useAIDetections.ts` since those headers are not readable from browser JS without `Access-Control-Expose-Headers`. The hook now uses only browser-safe page probing.
- Next step: Continue optimizing around API instability/performance rather than header-based pagination in the client.
- Blockers/risks: Client-side full backfill remains slow and vulnerable to OrcaHello service instability.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, partial OrcaHello data retention on 403)
- Current objective: Preserve already-fetched OrcaHello rows when a later page fails and surface coverage diagnostics in `/json`.
- What changed: Updated `ui/src/hooks/beta/useAIDetections.ts` so page-1 failure returns empty data plus metadata, while later-page failures return partial detections plus `failedPage`, `loadError`, `requestedStart`, `requestedEnd`, `fetchedNewest`, and `fetchedOldest`. Updated `ui/src/pages/json/index.tsx` to print those annotations.
- Next step: Use the earliest fetched timestamp as the minimum fallback coverage signal until a better estimate of missing records is available.
- Blockers/risks: Without readable pagination headers, missing-record count cannot be known accurately in the browser; only partial time coverage can be reported.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, incremental OrcaHello page rendering + timeframe fix)
- Current objective: Show OrcaHello detections as each page completes and correct the requested-range mismatch.
- What changed: Updated `ui/src/hooks/beta/useAIDetections.ts` to use `timeframe=1w` instead of `timeframe=all`, because the API was ignoring `dateFrom`/`dateTo` in `all` mode and returning older February records. Also changed the hook to push partial query results into local state after each completed page so `/json` can render page-1 results immediately and grow as more pages arrive.
- Next step: Re-test `/json` and confirm that the fetched range now stays within the requested 7-day window and that counts increase page by page while `Fetching` remains true.
- Blockers/risks: The upstream API can still fail on later pages; partial-data handling remains necessary.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, OrcaHello localStorage incremental cache)
- Current objective: Reduce repeated OrcaHello requests and expose whether the full requested week was returned.
- What changed: Reworked `ui/src/hooks/beta/useAIDetections.ts` to use a versioned localStorage payload containing both raw rows and normalized detections. The hook now serves cached data immediately, fetches page 1+, and stops early when it reaches ids already present in cache. Added `coversRequestedRange` to fetch metadata and rendered it in `ui/src/pages/json/index.tsx`.
- Next step: Validate that reloads now hit fewer pages, reuse cached rows, and still extend the cache when new detections arrive.
- Blockers/risks: Old records that change moderation state without reappearing in newer pages will remain stale until a wider refresh is forced.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, removed redundant range-coverage flag)
- Current objective: Simplify `/json` diagnostics to keep only the useful partial-load signals.
- What changed: Removed `coversRequestedRange` from `ui/src/hooks/beta/useAIDetections.ts` metadata and stopped rendering the corresponding line in `ui/src/pages/json/index.tsx`.
- Next step: Continue using `Partial`, `Failed page`, and fetched/requested ranges as the primary diagnostics.
- Blockers/risks: None beyond existing OrcaHello instability.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, fixed late cache initialization)
- Current objective: Stop `useAIDetections` from replaying all OrcaHello pages on refresh despite a localStorage cache.
- What changed: Switched `cachedPayload` to lazy `useState(() => readCachedPayload())` initialization in `ui/src/hooks/beta/useAIDetections.ts`, so the query starts with cached raw rows available and can stop when it reaches cached ids.
- Next step: Verify refresh now hits only the newest pages instead of replaying all 16 pages.
- Blockers/risks: If OrcaHello ids are unstable across requests, id-based cache boundary detection will still be unreliable.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, fixed hydration mismatch from localStorage)
- Current objective: Preserve OrcaHello cache benefits without causing SSR/client hydration mismatches.
- What changed: Reverted cache loading to post-mount in `ui/src/hooks/beta/useAIDetections.ts`, added `cacheReady`, and gated `useQuery` with `enabled: cacheReady`. This prevents server/client markup divergence while still ensuring the query starts only after cached raw rows are available.
- Next step: Re-test `/json` to confirm hydration errors are gone and refreshes no longer replay all pages.
- Blockers/risks: Initial server render will not show cached OrcaHello counts; they appear immediately after mount.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, fixed unnecessary page-2 fetch on warm refresh)
- Current objective: Stop `useAIDetections` from fetching page 2 when page 1 already overlaps the local cache.
- What changed: Updated `ui/src/hooks/beta/useAIDetections.ts` to detect cached ids on page 1, drop already-cached rows from that page, and return immediately without requesting page 2.
- Next step: Verify back-to-back refreshes now only request page 1 when no new rows exist.
- Blockers/risks: If OrcaHello row ids are unstable across requests, page-1 overlap detection may still miss matches.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, AI detections added to CombinedData pipeline)
- Current objective: Feed OrcaHello AI detections into `useSortedCandidates` through the shared combined dataset.
- What changed: Updated `ui/src/types/DataTypes.ts` so `AIDetection` carries `hydrophone`, optional `feedId`, `comments`, and `newCategory: "WHALE (AI)"`, and expanded `CombinedData`/`Dataset` to include AI rows. Updated `ui/src/utils/masterDataHelpers.ts` normalization to populate those candidate fields. Updated `ui/src/hooks/beta/useMasterData.ts` to call `useAIDetections()`, enrich AI rows with `feedId` from `feeds`, expose `ai`, and merge AI detections into `combined`.
- Next step: Validate downstream candidate filters/list rendering with mixed audio + AI + sightings input and decide whether AI rows should be filtered by review state before entering `combined`.
- Blockers/risks: `useMasterData` now triggers OrcaHello fetching anywhere it is used, which may be too expensive unless review-state/default filtering is applied upstream.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, CandidatesStack human/machine summary split)
- Current objective: Replace the old flat category count string with separate human and machine summary text in `CandidatesStack`.
- What changed: Updated `ui/src/components/CandidateList/CandidatesStack.tsx` so the summary now renders `Human` and `Machine` sections. Human shows whale/vessel/other/sightings-in-audible-range counts. Machine reads OrcaHello review-state counts from `AIDetection` rows for confirmed SRKW, unknown (`unknown`), false positive rate, and unreviewed. Added fallback text when only GraphQL machine detections are present and OrcaHello review details are not yet available.
- Next step: Check the visual result on `/beta`/`/index` and decide whether the fallback wording should be shorter or hidden entirely until OrcaHello data loads.
- Blockers/risks: Counts are derived from whatever is in `filteredData`; if the OrcaHello swap/fallback logic in `useMasterData` changes again, this summary may need to be adjusted.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, machine summary count label change)
- Current objective: Make the machine summary in `CandidatesStack` use a literal false-positive count instead of a percentage.
- What changed: Updated `ui/src/components/CandidateList/CandidatesStack.tsx` to replace `false positive rate` with `false positives` and removed the now-unused percentage calculation.
- Next step: Continue tuning count-string wording if needed.
- Blockers/risks: None.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, candidate clipCount AI review-state breakdown)
- Current objective: Replace the old `WHALE (AI)` category label in candidate clip-count strings with OrcaHello review-state counts.
- What changed: Updated `ui/src/hooks/beta/useSortedCandidates.tsx` so `clipCount` now shows machine candidates as confirmed SRKW / unknown / false positives / unreviewed, and human candidates as whale/vessel/other/sighting-in-audible-range. Added an `isAIDetection` type guard for the per-candidate breakdown.
- Next step: Validate the new clip-count wording in `CandidateCard` and any other consumer of `candidate.clipCount`.
- Blockers/risks: Mixed candidates are currently bucketed separately, so this assumes a candidate is either AI-driven or human/sighting-driven; if cross-type grouping rules change, `clipCount` logic will need revisiting.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-03-11, fixed mixed human+machine candidate clip counts)
- Current objective: Correct `candidate.clipCount` when a whale candidate contains both human and machine detections.
- What changed: Updated `ui/src/hooks/beta/useSortedCandidates.tsx` so machine review-state counts no longer replace human/sighting counts. `clipCount` now concatenates both sets, which matches the existing candidate-grouping rule that merges whale-like reports across human, AI, and sightings into the same candidate.
- Next step: Spot-check mixed candidates with comments to confirm human whale counts now appear alongside machine counts.
- Blockers/risks: None beyond the deliberate design choice that whale-like detections share one candidate bucket.
- Branch and latest commit hash: `main` @ `944f866`.

## Milestone Update (2026-04-01, local hydrophone type mismatch resolved)
- Current objective: Explain and unblock the local `CombinedData`/`hydrophone` TypeScript error in `useSortedCandidates.tsx`.
- What changed: Restored `hydrophone` as a compatibility field on the normalized DTOs in `ui/src/types/DataTypes.ts`, kept `standardizedFeedName` alongside it, and updated `ui/src/utils/masterDataTransforms.ts` plus `ui/src/hooks/beta/useAIDetections.ts` to return the legacy aliases expected by older consumers. Verified with `./node_modules/.bin/tsc -p tsconfig.json --noEmit` in `ui` that the TypeScript build is clean.
- Next step: If desired, continue the broader rename cleanup by gradually moving remaining consumers from `hydrophone` to `standardizedFeedName` instead of relying on the alias.
- Blockers/risks: The repo still has unrelated local edits, so any future cleanup should be careful not to overwrite other in-progress work.
- Branch and latest commit hash: `main` @ `01af3ab3d75bb45e9201d4f8ec629f246017563f` (short: `01af3ab`).
