# Phase A — Study

**Goal:** learn the OMP format from source, so porting is mechanical.

**No porting happens in this phase.** No load tests, no probes. Reading only.

## Inputs

- Local checkout of OMP source (`omp-src`), pinned commit.
- Local checkout of `cursor/plugins`, pinned to a chosen commit sha (no tags exist).
- Local checkout of the reference port. Read once here, then closed.

Record all pins in `findings/phase-a.md` from the start.

## What to learn

Answer each of these with a file path and a line range from `omp-src`:

**Discovery**
- Where does OMP look for agents? What paths, which extensions?
- Where does OMP look for skills? Same.
- Where does OMP look for commands? Files only, or extension code required?

**Formats**
- Agent frontmatter: which fields are required, which optional, what values?
- Skill frontmatter and body layout.
- Command file layout.

**The `task` tool**
- Full input schema.
- Batching: how N tasks are dispatched with shared context.
- Roles: names, defaults, what each is allowed to do.
- Effort levels: how they are set, per task or per agent.
- Request budgets: defaults, and how a custom agent sets its own.
- Isolated worktrees: when they apply, how changes are returned.

**Extension API** (needed for Phase E)
- Signatures of `registerCommand`, `registerTool`, `registerShortcut`,
  `registerFlag`, `on()`.
- Full list of lifecycle events, especially `session_start`.
- Message injection API.
- Which model-control APIs are **stock** and which need the **fork**.

## Use the reference port

Read pstack-claude alongside `omp-src`, once. For each answer above, note how
they solved it. Write these into `TRANSLATION-NOTES.md`. Then close the repo.

If the reference port targets a Cursor snapshot older than your chosen sha,
mark its notes as *stale reference*. Trust `omp-src` and Cursor upstream, not
the reference.

## Fill the porting matrix

Use `templates/matrix.md`. One row per upstream component. Classify each:

- `PORT` — copy as-is
- `ADAPT` — rewrite runtime parts for OMP
- `NATIVE` — OMP does this better; use the OMP feature
- `REPLACE` — Cursor-specific; needs an OMP equivalent built
- `DEFER` — out of scope for v1, with reason
- `DROP` — not porting, with reason

Every row needs an action. Every `DEFER`/`DROP` needs a reason.

## Sanity check (small)

Only after the format is documented, do one small check:

- Convert one agent's frontmatter from Cursor format to OMP format by hand,
  using what you learned.
- Drop it in `.omp/agents/` and start OMP.
- Confirm the `task` tool can see it.

If this fails, the format doc is wrong. Fix it before Phase B.

## Output

- `findings/phase-a.md` with all pins and answers, evidence per line
- `findings/omp-format.md` — the format doc for the whole port
- filled matrix at `findings/matrix.md`
- filled `stock vs fork` table (conventions section 6)
- `TRANSLATION-NOTES.md`, frozen
- `98-questions.md` updated with anything unconfirmed

## Done when

- [x] All pins recorded (OMP version + sha; `cursor/plugins` sha; pstack `plugin.json` version if present) — in `findings/phase-a.md:3-5`, matches `UPSTREAM.md`
- [x] Every discovery, format, `task`, and extension-API question answered with `path:lines` — see `findings/phase-a.md` tables
- [x] `stock vs fork` table has no empty fallback rows — 19 rows in conventions §6, all `Yes`/`n/a`; no fork-only row, so the blocker rule never fires
- [x] Matrix has no blank actions — 77 rows: 70 `ADAPT`, 6 `PORT` (cursor-team-kit imports `de-slop`, `make-pr-easy-to-review`, `fix-ci`, `fix-merge-conflicts`, `get-pr-comments`, `what-did-i-get-done`), 1 `DROP` (`make-bot-ui`); 0 `NATIVE`/`REPLACE`/`DEFER`
- [x] Sanity-check agent loads — `bun run scripts/sanity-poteto-agent.ts` (needs `pi_natives.darwin-arm64.node` copied from the installed 18.0.11 checkout): `discovered: poteto-agent, comment-sicko, scout, designer, reviewer, security-reviewer, librarian, task, sonic`
- [x] Human review complete (checkpoint 1)

## Also record: dogfooding notes

You are running this phase inside OMP with a local model. Anything OMP does
badly during Phase A is real data for later phases — log it in
`findings/phase-a.md`.
