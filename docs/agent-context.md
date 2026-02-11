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
