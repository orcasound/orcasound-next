# AGENTS.md

## Purpose
This file defines stable, repo-level instructions for the coding agent.

## Working Agreement
- Treat this file as long-lived guidance.
- Keep instructions concise, concrete, and actionable.
- Do not store transient task status here; use `docs/agent-context.md` for that.

## Session Continuity Rule
- Update `docs/agent-context.md` at each milestone and at the end of every task.
- Before closing the workspace or rebuilding the dev container, add a short handoff snapshot.

## Handoff Snapshot Minimum
- Current objective
- What changed
- Next step
- Blockers/risks
- Branch and latest commit hash (if available)

## Session Start Rule
- At the start of every new session in this repo, read AGENTS.md and docs/agent-context.md before answering any request, including non-substantive requests.
- If docs/agent-context.md is missing, create it and note that continuity context is unavailable.
