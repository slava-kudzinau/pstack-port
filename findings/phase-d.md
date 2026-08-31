# Phase D — Orchestration

**Status:** Done. 2026-08-31.

## What was done

Rewrote every parallel skill to carry explicit budget and effort guidance.

### Skills touched

| Skill | Change | Evidence |
|---|---|---|
| swarm | Added effort/budget guidance to Phase B fan-out | `skills/swarm/SKILL.md:40-44` |
| arena | Added `effort: "hi"` to candidates, `effort: "med"` to cross-judge scout | `skills/arena/SKILL.md:41`, `:49` |
| interrogate | Added `effort: "hi"` to reviewer items | `skills/interrogate/SKILL.md:46` |
| architect | Added `effort: "lo"` to scout in Phase A ground step | `skills/architect/SKILL.md:29` |
| how | Added `effort: "lo"` to explorers, direct explainer, synthesizer | `skills/how/SKILL.md:54,72,84` |
| why | Added `effort: "lo"` to parallel investigators | `skills/why/SKILL.md:126` |
| reflect | Added effort column (hi/med/hi) to reviewer table, `effort: "hi"` to synthesizer | `skills/reflect/SKILL.md:41-45,51` |

### OMP task tool facts (from `refs/omp-src`)

| Fact | Source |
|---|---|
| `task` batch: `{context, tasks[]}`, one item per worker | `types.ts:167-171` |
| Per-item fields: `agent`, `task`, `effort`, `outputSchema`, `schemaMode`, `isolated` | `types.ts:133-148` |
| `effort`: `"lo" \| "med" \| "hi"` | `types.ts:112`, `settings-schema.ts:4968-4978` |
| `task.enableEffort` default: `false` | `settings-schema.ts:4968-4978` |
| `task.maxEffort` default: `"max"` | `settings-schema.ts:5092-5095` |
| Soft budget: `scout`/`sonic` = 100, others = 200 | `executor.ts:107-111` |
| 1.5x budget → forced yield + 5-request grace | `executor.ts:98-101,126` |
| `task.maxConcurrency` default: 32 | `settings-schema.ts:4980-4999` |
| Semaphore bounds concurrency across parallel `task` calls | `index.ts:581-585` |

### Concurrency ceiling

- System: Apple M5 Max, 18 physical cores
- OMP `task.maxConcurrency` default: 32 (configurable 0-64)
- Practical ceiling: 32 concurrent subagents per session
- Per-skill widths:
  - swarm: N workers (one per slice/race arm), bounded by session's `maxConcurrency`
  - arena: 2-3 candidates + 1 cross-judge scout
  - interrogate: 4 reviewers by default, configurable via `~/.omp/agent/pstack-models.md`
  - architect: 2+ arena candidates (via arena skill)
  - how: 2-4 explorers + 1 synthesizer (all scout)
  - why: up to 7 investigators (one per evidence category, all scout)
  - reflect: 3 reviewers (task) + 1 synthesizer (task)

### Budget strategy

| Role | Effort | Budget | Use |
|---|---|---|---|
| scout | `lo` | 100 | Read-only probes: explorers, investigators, cross-judge |
| sonic | `med` | 100 | Mechanical updates, data collection |
| task | `med` | 200 | General workers, synthesis |
| task | `hi` | 200 | Arena candidates, adversarial reviewers |
| reviewer | `hi` | 200 | Interrogate reviewers |

### Skills not touched (already correct)

- autonomous-run: single watcher subagent via `task`, no batch fan-out
- orchestrate: coordinator loop, workers via `task` with `isolated: true`
- autopilot-full: one owner per PR via `task` batch, already uses swarm for verification
- autopilot-stack: one owner per change via `task` batch, already uses swarm for verification
- multi-phase-plan: template, not executable; references swarm and opening-a-pr
- teach: routes to `how` and `why` which now carry effort guidance
- recall: read-only research, no subagent spawning
- session-pickup, pause-safely: single-pass, no fan-out
