---
name: swarm
description: "Fan out N parallel workers, drain them, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
metadata:
  disable-model-invocation: 'true'
  upstream: 'pstack/skills/swarm/SKILL.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: "Cursor's `environment: \"cloud\"`/`\"local\"` split, `run_in_background`, the Cursor `generalPurpose` subagent field, and `cloud_base_branch` replaced with a single `task` batch call (`{context, tasks[]}`) and per-spawn `agent`/`isolated` fields — OMP subagents already share the caller's filesystem and deliver in the background automatically, so no cloud/local flag or base-branch parameter exists; a worker needing a non-default branch checks it out itself with `bash` inside its own `isolated` worktree. The `~/.cursor/rules/pstack-models.mdc` worker-model file and the `grok-4.6-fast-xhigh` slug replaced with the caller's configured model role (`@role` aliases resolve via `modelRoles.<role>` in `~/.omp/agent/config.yml`)."
---

# Swarm

Fan out N parallel workers. They may cover separate slices, race the same brief, or mix both. The parent waits, aggregates, and returns one report.

## Start

Open a todolist with one entry per phase before launching anything.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Set N from the user or derive it from the shape. N is the total worker count, not any platform concurrency limit.
4. Pick the worker model from the caller's configured model role for swarm workers when one is set. Otherwise use the caller's default configured model. For a model race, name each arm's model up front.
5. Give each worker its own writable output when it writes. Use a worktree, branch, or `/tmp/swarm-<slug>/worker-<n>/`.

## Phase B: Fan out

Spawn all N workers in a single `task` call: one `{context, tasks[]}` batch, one array entry per worker. Set each worker's `agent` field to its specialist role, or omit it for the default general worker. Every worker already shares the caller's filesystem and runs in the background automatically; isolation comes from the worktree or output directory assigned in Phase A, set per worker with `isolated: true` when a writing worker needs its own branch.

When a worker must start from a non-default branch, have it check that branch out itself with `bash` inside its own worktree, and name the worktree path in its brief.

Every brief stands alone. Include the goal, scope, exact slice or race arm, how to verify, and what to report. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence.

If a worker drops out, proceed with N-1 and note it.

## Phase C: Aggregate

Read the terminal results. For coverage, every required slice needs a result. For a race, apply the selection rule declared up front. Use first pass, rank all, or best-of. Do not paste raw worker dumps.

Keep a compact result table, one-line evidenced issues, and explicit gaps or dropouts.

## Phase D: Report

Return one consolidated in-chat report with the table, issue one-liners, gaps or dropouts, and the race rule when used.
