# Checkpoint 2 — Phase D through F

**Date:** 2026-09-01
**OMP version:** 18.0.11 @ c2ade4bba14fb4706857286afb5528bc2244bf44
**Upstream pstack:** cursor/plugins @ fd878692de15a3069c21c8f429eb0b9f2fe178fa (v0.14.5)

## Summary

Phases D (orchestration), E (extension), and F (ship) completed. Phase E skipped — everything covered with files alone.

## Phase D: Orchestration

Rewrote every parallel skill to carry explicit budget and effort guidance.

| Skill | Change | Evidence |
|---|---|---|
| swarm | Added effort/budget guidance to Phase B fan-out | `skills/swarm/SKILL.md:40-44` |
| arena | Added `effort: "hi"` to candidates, `effort: "med"` to cross-judge scout | `skills/arena/SKILL.md:41,49` |
| interrogate | Added `effort: "hi"` to reviewer items | `skills/interrogate/SKILL.md:46` |
| architect | Added `effort: "lo"` to scout in Phase A ground step | `skills/architect/SKILL.md:29` |
| how | Added `effort: "lo"` to explorers, direct explainer, synthesizer | `skills/how/SKILL.md:54,72,84` |
| why | Added `effort: "lo"` to parallel investigators | `skills/why/SKILL.md:126` |
| reflect | Added effort column (hi/med/hi) to reviewer table, `effort: "hi"` to synthesizer | `skills/reflect/SKILL.md:41-45,51` |

**OMP task tool facts** (from `refs/omp-src`):
- Batch: `{context, tasks[]}`, one item per worker (`types.ts:167-171`)
- Effort: `"lo" | "med" | "hi"`, gated by `task.enableEffort` (`types.ts:112`, `settings-schema.ts:4968-4978`)
- Budget: scout/sonic = 100, others = 200; 1.5x → forced yield (`executor.ts:107-111,126`)
- Concurrency: `task.maxConcurrency` default 32 (`settings-schema.ts:4980-4999`)

**Concurrency ceiling:** Apple M5 Max, 18 cores. OMP semaphore bounds at 32 concurrent subagents.

## Phase E: Extension

**Skipped.** Phases A-D covered everything with files alone:
- Model configuration: `~/.omp/agent/pstack-models.md` (plain text, skills read directly)
- Auto mode: invoke `/pstack:poteto-mode` manually; OMP `session_start` event available but not needed
- Budgets/effort: OMP's `task.enableEffort` + `task.maxEffort` settings
- Isolation: OMP's `task.isolation.mode` setting

## Phase F: Ship

**Deliverables:**
- Conformance suite: `scripts/conformance.ts` — 74 tests, all pass
- User docs: `docs/README.md`, `docs/install.md`, `docs/commands.md`, `docs/config.md`
- Sync tools: `scripts/fetch-upstream.ts`, `scripts/classify-diff.ts`, `scripts/generate-report.ts`

**Pending (requires live OMP session):**
- Behavioral conformance: 5 prompt-based tests requiring real OMP session
- Clean machine install verification
- Full upstream sync (requires new upstream sha)

## Matrix status

**77 total components:**
- 70 ADAPT (pstack skills + thermo-nuclear from cursor-team-kit)
- 6 PORT (cursor-team-kit imports: de-slop, make-pr-easy-to-review, fix-ci, fix-merge-conflicts, get-pr-comments, what-did-i-get-done)
- 1 DROP (make-bot-ui: Cursor Routines/webhook, no OMP equivalent)

**On disk:** 74 skill dirs, 2 agents, 31 commands

## Checks

| Check | Result | Command |
|---|---|---|
| Branding | Clean | `bun scripts/branding-check.ts` |
| Conformance | 74 passed, 0 failed | `bun scripts/conformance.ts` |
| Matrix | No blank actions | `findings/matrix.md` |
| 98-questions | All answered | `pstack-omp-plan/98-questions.md` |
| Phase C done-when | All checked | `pstack-omp-plan/30-phase-c-port.md` |
| Phase D done-when | All checked | `pstack-omp-plan/40-phase-d-orchestration.md` |
| Phase E done-when | Skipped | `pstack-omp-plan/50-phase-e-extension.md` |
| Phase F done-when | 2 of 6 (manual items pending) | `pstack-omp-plan/60-phase-f-ship.md` |

## Next steps

1. Install on a real OMP instance: `git clone <repo> ~/.omp/agent/pstack`
2. Run `/pstack:setup-pstack` to configure models
3. Run behavioral conformance tests (5 prompts)
4. Report any failures back to the port
