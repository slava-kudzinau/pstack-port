# Phase C — Port the rest

**Goal:** move every remaining `PORT` and `ADAPT` component from the matrix.

Format is settled by now. This phase is mechanical. Prefer many small commits,
each running the checks.

## Steps

1. Work through the matrix in order. All 70 rows are `ADAPT`; there are no
   `NATIVE` rows to skip.
2. `PORT` rows: copy content, add frontmatter, run branding check.
3. `ADAPT` rows: rewrite runtime parts, mark `adapted`, append a `## <path>`
   section to `PROVENANCE.md` recording the change.
4. Add each command as a thin wrapper. A command must not duplicate skill
   text.
5. Keep degraded orchestration if needed. Full parallel behaviour is Phase D.

## Rules

- Do not "improve" upstream prose. `portable` keeps the original wording.
- Do not add features. Missing upstream features are new work, not porting.
- If a file needs a runtime feature you cannot confirm in `omp-src`, stop and
  log the question. Do not guess.

## Output

- `skills/`, `agents/`, `commands/` populated for every matrix row
- `findings/phase-c.md` — what degraded, and why

## Done when

- [x] Every matrix row (all `ADAPT`) has a file under the loading roots
- [x] Branding check passes
- [x] Frontmatter check passes
- [x] Phase B probes still pass
