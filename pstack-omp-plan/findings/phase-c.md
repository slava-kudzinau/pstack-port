# Findings — Phase C: Port the rest

**Date:** 2026-08-31
**OMP version:** 18.0.11 @ c2ade4bba14fb4706857286afb5528bc2244bf44
**Upstream pstack:** cursor/plugins @ fd878692de15a3069c21c8f429eb0b9f2fe178fa
**Local model:** mlx/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-4bit

## Decision or headline

All 76 ported components (22 poteto-mode playbooks, 21 `principle-*`
skills, 23 remaining pstack skills, 7 cursor-team-kit skills from `e46364b`,
2 agents) landed under the OMP loading roots. 70 rows `ADAPT` (every pstack
component contains Cursor branding or tool names requiring rewrite; `thermo-nuclear-code-quality-review` from cursor-team-kit also adapted for OMP `task` batch); 6 rows
`PORT` (the cursor-team-kit imports `de-slop`, `make-pr-easy-to-review`,
`fix-ci`, `fix-merge-conflicts`, `get-pr-comments`, `what-did-i-get-done` — audited
clean in the reference port, body verbatim).
Cross-references to skills carrying `disable-model-invocation: true` were rewritten
to `skill://` pointers. `poteto-mode/SKILL.md` and `bug-fix/SKILL.md` moved from
Phase B skeleton to full upstream coverage.

## Results

| Matrix coverage | 74 skill dirs, 2 agents, 30 commands on disk (76 total minus `make-bot-ui` DROP) | `ls skills agents commands` |
| Branding check | `bun scripts/branding-check.ts` → clean (expanded to include `Cursor`, `GPT`, `Gemini`, `Qwen` case-sensitive; `note:` metadata lines exempt) | `scripts/branding-check.ts` |
| Frontmatter | All 76 `SKILL.md`/agent files parse; `name:` matches directory/file; provenance keys moved under `metadata:` | `scripts/validate-frontmatter.ts` |
| Orphan sweep | 67 distinct `skill://`/`agent://` pointers; all resolve in-tree or to a bundled OMP role | `scripts/orphan-scan.ts` |
| `make-bot-ui` | De-scoped (matrix row 74 `DROP`): Cursor Routines/webhook automation with no OMP equivalent; files deleted | `skills/make-bot-ui/` removed |
| `poteto-mode/SKILL.md` | Restored to full roster: all 22 playbooks + 21 principles, all cross-refs as `skill://` | `skills/poteto-mode/SKILL.md:110-140` |
| `bug-fix/SKILL.md` | Restored: steps 1–6 verbatim from `playbooks/bug-fix.md`, `skill://how`/`why`/`architect`/`interrogate`/`tdd`/`opening-a-pr` pointers restored | `skills/bug-fix/SKILL.md:17-22` |
| Phase B probes | `bun run scripts/verify-phase-b.ts` → exit 0; agents discovered incl. new `comment-sicko`, `poteto-agent` via extension root | `scripts/verify-phase-b.ts` |
| `swarm`, `interrogate`, `arena`, `reflect` | Subagent fan-outs rewritten to one `task` batch (`{context, tasks[]}`); judge/reviewer roles use `agent: "scout"`/`"reviewer"`/`"task"` per role | e.g. `skills/swarm/SKILL.md`, `skills/interrogate/SKILL.md` |
| Model routing | Literal vendor slugs (`claude-fable-5-thinking-max`, `gpt-5.6-sol-max`, `grok-4.6-fast-xhigh`, `claude-opus-5-thinking-xhigh`) deleted; replaced by configured role aliases (`@task`, `@default`); `setup-pstack` now writes `~/.omp/agent/pstack-models.md` | `skills/setup-pstack/SKILL.md` |
| `create-verification-skill`, `maintain-verification-skill` | `.cursor/skills/verify-<app>/` → flat `skills/verify-<app>/` (OMP skill roots are non-recursive) | `skills/create-verification-skill/SKILL.md` |
| `recall`, `reflect`, `show-me-your-work` | Transcript path rewritten to `~/.omp/agent/sessions/<encoded-cwd>/<timestamp>_<sessionId>.jsonl` + `history://<id>` for subagents | `skills/recall/SKILL.md` |
| `automate-me` | `AskQuestion` → `ask` tool; Cursor `create-skill` → `manage_skill`/`learn`; nested-category skill placement dropped (OMP roots are flat) | `skills/automate-me/SKILL.md` |
| `teach` | `skill://how` + `skill://why` + `skill://unslop` pointers (all `disable-model-invocation: true`, otherwise unreachable) | `skills/teach/SKILL.md` |
| `babysit` | `scripts/watch-pr` + `/loop` replaced by `gh pr view`/`gh pr checks` polling via `bash` + `hub` background job; mode split kept | `skills/babysit/SKILL.md:8,32` |
| `worktree-cleanup` | `~/Library/Application Support/Cursor` deletion target → OMP `~/.omp/agent`; git/simulator steps verbatim | `skills/worktree-cleanup/SKILL.md` |
| `technical-writing` | `skill://unslop` pointer added at its bold mention | `skills/technical-writing/SKILL.md` |
| `comment-sicko` | Upstream frontmatter was already `name`+`description` only; `/how`, `/why` → `skill://how`, `skill://why` | `agents/comment-sicko.md` |
| `poteto-agent` | `subagent_type: poteto-agent` → `agent: poteto-agent`; `run_in_background: true` → OMP background-job auto-delivery; slugs → role aliases | `agents/poteto-agent.md` |
| Reference-file companions | `architect` (3), `interrogate` (4), `reflect` (4), `how` (4), `create-verification-skill` (3 files) ported verbatim with provenance; `show-me-your-work` keeps `scripts/log.sh` + TSV template (frontmatter would corrupt them) | `skills/*/references/*` |

## What did not work

| Item | Failure | Exact error |
|---|---|---|
| `autopilot-full`, `autopilot-stack`, `pause-safely` | First ported copies had unquoted `note:` fields; a mid-value `: ` is a YAML mapping indicator | `mapping values are not allowed here` (yaml.safe_load) |
| 11 files (e.g. `swarm`, `teach`, `why`, `poteto-agent`) | Same YAML pitfall in `description:`/`note:` values | `expected <block end>, but found '<scalar>'` |
| `deslop`, `cursor-team-kit` `control-cli`/`control-ui` | Plugin never vendored in this port (conventions §5); generalized to prose or dropped | n/a |
| `references/bugbot-triage.md` | Not tracked in `matrix.md`; dangling relative link in `autopilot-*`/`babysit` cut to plain prose | n/a |
| `/goal` persistent objective | No OMP fallback (substitution contract); rewritten as restating the standing brief | n/a |
| `check-plan.mjs`, `orch.ts`, `watch-pr` | Real pstack tooling, but porting the scripts is out of scope for the markdown-only phase; kept as bare command names | n/a |
| `make-bot-ui` | De-scoped (user decision 2026-08-31): Cursor Routines/webhook automation with no OMP equivalent; files deleted | matrix row 74 `DROP` |

## Questions raised

None. `make-bot-ui` is confirmed `DROP` (de-scoped, per user decision 2026-08-31; matrix row 74).

## Post-phase convention change (2026-09-02)

`note:` fields removed from all 102 shipped files (~39.6 KB, ~10k tokens
paid on every `skill://` read of raw SKILL.md; OMP's own invocation path
strips frontmatter — `refs/omp-src/.../extensibility/skills.ts:508`). Notes
moved verbatim to `PROVENANCE.md` (repo root) as `## <path>` sections with
`sync:` labels by `scripts/extract-notes.ts` (idempotent). `metadata:` kept
in frontmatter; the upstream-diff tool (`classify-diff.ts`) depends on those
four provenance fields. `branding-check.ts` lost its `note:`-line exemption
(the changelog sits outside the scanned trees; the audit no longer skips
lines). Conventions §4 and `templates/frontmatter.md` updated.

## Done-when checklist

- [x] Every matrix row has a file under the loading roots — 74/74 skill dirs, 2 agents, 30 commands present (`ls` verified); `make-bot-ui` DROP confirmed deleted
- [x] Branding check passes — `bun scripts/branding-check.ts` → clean (expanded list)
- [x] Frontmatter check passes — `bun scripts/validate-frontmatter.ts` → clean (74 skills + 30 commands)
- [x] Orphan scan passes — `bun scripts/orphan-scan.ts` → 67 pointers, all resolve
- [x] Phase B probes still pass — `bun scripts/verify-phase-b.ts` → exit 0
- [x] Human review complete (checkpoint 2)
