# Phase B — Vertical slice

**Goal:** port one thin slice end to end. Confirm the format from Phase A is
right before bulk work.

**Time:** small. If this takes more than a day, the format is wrong — go back
to Phase A.

## The slice

Pick these three components from upstream:

- **One playbook** — bug fix, or another simple one.
- **`poteto-mode` in skeleton form** — routing only to that one playbook.
- **`poteto-agent`** — reading the same rules as the main agent, not a copy.
- **One command** — `/pstack:poteto-mode` invoking the skill.

## Steps

1. Author content directly at the loading roots — `skills/<name>/SKILL.md`,
   `agents/*.md`, `commands/*.md` — with provenance frontmatter
   (`templates/frontmatter.md`).
2. Strip Cursor-specific instructions. Mark those files `adapted`.
3. Namespace the command as `/pstack:poteto-mode`.
4. Run the branding check.
5. Load in OMP. Run the two probe prompts below.

## Two probes

Not the full suite yet. Just enough to know the slice works.

| Prompt | Expected |
|---|---|
| `there is a race in <file>, reproduce and fix it` | Routes through poteto-mode to the bug-fix playbook. Reproduce → root cause → fix → verify. |
| `what does this function return?` | Direct answer. No playbook, no subagent. |

Over-firing on the second prompt is a defect.

## Output

- `skills/poteto-mode/` (skeleton), `skills/<bugfix-playbook>/`,
  `agents/poteto-agent.md`, `commands/poteto-mode.md`
- `findings/phase-b.md` — the two probe transcripts, and any format problems
  found

## Done when

- [ ] Both probes pass
- [ ] Branding check passes
- [ ] Provenance frontmatter valid on every file
- [ ] `poteto-agent` reads the same skill files as the main agent (no
      duplicated prompt text)
- [ ] Human review complete (checkpoint 2)
