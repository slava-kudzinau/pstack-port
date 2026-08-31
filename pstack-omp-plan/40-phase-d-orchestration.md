# Phase D — Orchestration

**Goal:** make the parallel skills real on native OMP `task`. Do not build a
new orchestration layer.

## Mapping

Filled in Phase A. Put the final version here in `findings/phase-d.md`:

| pstack concept | OMP feature |
|---|---|
| single subagent | `task` tool |
| parallel fan-out | `task.batch` with shared context |
| specialist roles | agent files in `.omp/agents/` + built-in roles |
| model / effort | agent role + effort level |
| runaway protection | soft request budget |
| risky work | isolated worktree |

Confirm every one against `omp-src` before you depend on it.

## Steps

1. Rewrite `swarm` on `task.batch`. Shared context, N workers, aggregation.
2. Rewrite `arena` on `task.batch` + isolated worktrees. Competing attempts.
3. Rewrite `interrogate` on `reviewer` role. Multiple perspectives, one report.
4. Rewrite `architect` on the read-only `scout` role for inspection fan-out.
5. Route mechanical bulk edits through `sonic`.
6. Set budgets and effort levels on every fan-out skill.
7. Measure your local concurrency ceiling on one machine. Set each skill's
   fan-out width from that number, not from the upstream default.

## Output

- Parallel skills working on native `task`
- `findings/phase-d.md` — mapping, concurrency ceiling, per-skill width

## Done when

- [x] `swarm` fans out and aggregates
- [x] `arena` and `interrogate` produce multi-perspective reports
- [x] Every fan-out skill has an effort level and a budget
- [x] No custom orchestration code duplicates OMP `task`
