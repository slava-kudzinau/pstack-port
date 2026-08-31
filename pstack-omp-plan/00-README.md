# pstack → OMP port

Plan for porting the Cursor `pstack` plugin to **oh-my-pi (OMP)**. Written for a
coding agent driving OMP with a local model.

## How to work

Read in order: `01-conventions.md`, `02-context.md`, then the current phase.
Every phase has a `Done when` checklist. Do not tick a box from memory —
re-run the check.

## Rules

1. **Study OMP source before porting.** Verify every API in the local
   `omp-src` checkout. Evidence means a file path and a line range. If an API
   is not confirmed, put it in `98-questions.md` and stop that thread.
2. **One source of truth for content.** Cursor pstack (tagged release). The
   reference port is read once in Phase A as a worked example, then closed.
3. **No Claude branding in shipped files.** See section 1 of conventions.
4. **When stuck, stop and ask.** Do not improvise around unknown APIs or
   unclear intent.

## Phases

| File | Phase | Output |
|---|---|---|
| `02-context.md` | — | What pstack is |
| `10-phase-a-study.md` | A — Study | OMP format + porting matrix |
| `20-phase-b-slice.md` | B — Slice | One skill + one agent + one command working |
| `30-phase-c-port.md` | C — Port rest | All portable content in place |
| `40-phase-d-orchestration.md` | D — Orchestration | Parallel skills on native `task` |
| `50-phase-e-extension.md` | E — Extension | Config + optional hooks |
| `60-phase-f-ship.md` | F — Ship | Conformance, user docs, upstream sync |
| `98-questions.md` | — | Unconfirmed items |
| `99-risks.md` | — | Known risks |

## Two checkpoints

1. **After Phase A** — human reviews the matrix and the stock/fork answers
   before any porting.
2. **After Phase B** — human reviews the vertical slice before bulk porting.

## Definition of done for v1

- `/pstack:poteto-mode` routes correctly on the conformance suite.
- All portable content ported from a pinned `cursor/plugins` sha.
- At least one parallel skill runs on native OMP `task`.
- User install docs let a new user run pstack in OMP from a clean machine.
- Upstream diff tool reports a clean status.
