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
