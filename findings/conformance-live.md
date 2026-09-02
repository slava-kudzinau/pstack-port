# Behavioral conformance — live OMP sessions

Spec: `pstack-omp-plan/60-phase-f-ship.md` §1. Fixture: `~/pstack-conformance`
(throwaway repo; baseline `7078bde`). Protocol: fresh session per test,
fixture re-armed between tests with
`git checkout -q main && git reset --hard -q 7078bde && git clean -fdq`.
Boxes 1–2 of Phase F tick only when the suite is green on the local model
**and** a baseline model, with local-only failures labelled as model findings.

## Ledger

| # | Prompt target | Model | Routing (skill loaded / subagents) | Behavior (repro→fix→verify order, output shape) | Verdict |
|---|---|---|---|---|---|
| 1 | `store.js` race | mlx/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit (local) | **PASS** — transcript `-pstack-conformance/…01a06162…jsonl`: mandate auto-injected at start (`com.pstack.poteto-mode.mandate`); first call `read skill://poteto-mode` (+`store.js` parallel); then `skill://bug-fix` (thinking weighed `tdd`, chose bug-fix — correct) + `principle-fix-root-causes` + `principle-prove-it-works`; zero `task`/`hub` calls | **PASS** — reproduced before editing (old failure output quoted verbatim: `winners: 10 ... exit 1`); instrumented trace; no-await control run surfaced a second latent defect (falsy-zero claim invisible to `if (current)`, also `"constructor"` truthiness); fix verified at HEAD: `winners: 1 OK`, exit 0, commit `0f6a10b` (2+/3−) | **PASS** |
| 2 | caching around `lookupPrice` | | | | |
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
