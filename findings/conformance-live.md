# Behavioral conformance — live OMP sessions

Spec: `pstack-omp-plan/60-phase-f-ship.md` §1. Fixture: `~/pstack-conformance`
(throwaway repo; baseline `0157823`). Protocol: fresh session per test,
fixture re-armed between tests with
`git checkout -q main && git reset --hard -q 0157823 && git clean -fdq`.
Boxes 1–2 of Phase F tick only when the suite is green on the local model
**and** a baseline model, with local-only failures labelled as model findings.

## Ledger

| # | Prompt target | Model | Routing (skill loaded / subagents) | Behavior (repro→fix→verify order, output shape) | Verdict |
|---|---|---|---|---|---|
| 1 | `store.js` race | mlx/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit (local) | **PASS** — transcript `-pstack-conformance/…01a06162…jsonl`: mandate auto-injected at start (`com.pstack.poteto-mode.mandate`); first call `read skill://poteto-mode` (+`store.js` parallel); then `skill://bug-fix` (thinking weighed `tdd`, chose bug-fix — correct) + `principle-fix-root-causes` + `principle-prove-it-works`; zero `task`/`hub` calls | **PASS** — reproduced before editing (old failure output quoted verbatim: `winners: 10 ... exit 1`); instrumented trace; no-await control run surfaced a second latent defect (falsy-zero claim invisible to `if (current)`, also `"constructor"` truthiness); fix verified at HEAD: `winners: 1 OK`, exit 0, commit `0f6a10b` (2+/3−) | **PASS** |
| 2 | `lookupPrice` cache (remote + mutable + shared) | mlx/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit (local) | **design route = feature, not architect** — trace: `read skill://poteto-mode` first; classified feature and **opened `read skill://feature`** (prior playbook-never-opened gap resolved); then `skill://how` + 4 principle leaves (`model-the-domain`, `laziness-protocol`, `separate-before-serializing-shared-state`, `boundary-discipline`), each tied to a named decision; **one `task` call** → poteto-agent wrote the cache (feature step-4 delegation honored). **No `architect`/`arena`/`interrogate`** — skipped with recorded reasons ("standard memoize+TTL, a bakeoff costs more than it settles") | **PASS, independently verified** — landed `cache.js` is the strong design: single-flight `pending` coalescing (entry + `pending` assigned synchronously before any `await`, so no read-await-write race) plus TTL revalidation. `bun test cache.test.js` = 7/7 run by the grader, not the model's self-report: concurrent cart+order cost exactly 2 fetches for skus A1,B2 (shared A1 once), repeat costs 0, a within-TTL read serves the stale price. Rejection uncached+retried; nulls cached same TTL. cart/orders migrated to the new layer, report left on the raw remote. Commits e7d8d38 + a22b6c7 | **Behavior PASS · architect route absent** — `feature` did the design work at the right weight (ground, alternatives table, delegate, verify); forcing `arena` on an ~80-LOC memoize+TTL would break the suite's own anti-ceremony rule. Fixture-too-trivial hypothesis is now dead. Local model routes boundary-crossing caching to `feature`, not `architect`. Baseline run decides quirk vs correct economy. No Phase F box ticked |
| 3 | 12 packages in `pkgs/` | | | | |
| 4 | `feature/discount` diff | | | | |
| 5 | `truncateLabel("OK2CANCEL")` | | | | |

## Notes

- T1 went beyond the pass bar: it found and fixed a defect the fixture author
  planted *deeper* than the visible race (falsy-zero + prototype-chain
  truthiness). Root-cause discipline visible in output, not just claimed.
  No subagents for a 3-line fix, with the skip stated — correct poteto-mode
  economy, not under-delegation by the letter.
- T1 routing confirmed from the transcript's tool trace, not the reply text.
  The summary also name-drops `model-the-domain` + `laziness-protocol`
  without `skill://` reads of them — those render from poteto-mode's
  one-line principles index; index working as designed.
- Session forensics: transcripts persist under `$OMP_CODING_AGENT_DIR/sessions`
  (here `~/.mlx-serve/omp`), bucket names home-relative (`-pstack-conformance`).
  A T1 follow-up question made the session misreport its own id — it looked in
  the default `~/.omp/agent/sessions`. Resumable id: `01a06162-95bf-765d-a417-05e42b93d12c`.
  Grading later tests: grep the JSONL for `"path":"skill://`, `"name":"task"`.
- `/tmp/verify-store.mjs` scratch left by the session; fixture-only artifact.
- T2 fixture re-powered 2026-09-02 to baseline `0157823`. `prices.js:lookupPrice`
  is now async, awaits a simulated remote, exposes a `setPrice` mutation path, and
  exposes a `fetchCount` observability seam. `cart.js` fans lookups out concurrently
  through `Promise.all`; `report.js` still calls `lookupPrice` twice per sku. The
  task now crosses a function boundary, so `architect` is the honest route. The old
  immutable-sync fixture never required it, so the earlier "architect not reached"
  miss was a spec over-specification, not a model defect.
- The re-power forks the design space and makes the wrong answer runtime-detectable.
  A `Map` cache that never invalidates serves a stale price after `setPrice`. A
  `Map` cache without single-flight still stamps concurrent first-touch of one sku
  (5 concurrent `B2` lookups = 5 fetches, verified). Only a cache that dedupes
  in-flight work and invalidates on `setPrice` passes both `fetchCount` probes.
  `principle-prove-it-works` now has a runtime check, not a compile check.
- T2 re-ran on the local model against `0157823`. Behavior passes, verified independently
  at 7/7 `bun test`, single-flight plus TTL landed in `cache.js`. The row above holds the
  verdict. A baseline-model run is still owed before any Phase F box ticks.
- The prior playbook-never-opened finding is resolved. This run opened
  `read skill://feature`, copied its steps into the todo verbatim, delegated code-writing
  to a `task`, and verified on the real surface. The gap did not recur.
- Open question, now sharper. On a genuinely boundary-crossing fixture the local model
  still routes caching to `feature` and records an explicit `architect`/`arena` skip,
  calling the bakeoff over-engineering. The fixture-too-trivial excuse is gone. A baseline
  that also skips `architect` means the spec's architect-only line is over-specified and
  `feature` is a valid passing route. A baseline that reaches `architect` means the local
  model under-routes the heavy design playbook.
