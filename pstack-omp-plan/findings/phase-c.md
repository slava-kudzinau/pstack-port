# Findings — Phase C: Port the rest

**Date:** 2026-08-31
**OMP version:** 18.0.11 @ c2ade4bba14fb4706857286afb5528bc2244bf44
**Upstream pstack:** cursor/plugins @ fd878692de15a3069c21c8f429eb0b9f2fe178fa
**Local model:** mlx/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-4bit

## Decision or headline

All 68 ported components (22 poteto-mode playbooks, 21 `principle-*`
skills, 23 remaining skills, 2 agents) landed under the OMP loading roots,
every one as `ADAPT` — no row qualified as `PORT` because every upstream
component contains Cursor branding, CC tool names (`Agent`/`Task`),
`subagent_type`, `run_in_background`, `AskQuestion`, or `control-cli` /
`control-ui` / `/goal` references. Cross-references to skills that carry
`disable-model-invocation: true` were rewritten to `skill://` pointers,
since a bold-name mention of a model-hidden skill is a dead reference.
`poteto-mode/SKILL.md` and `bug-fix/SKILL.md` moved from the Phase B
skeleton to full upstream coverage. Four constructs could not be translated
and are recorded below rather than invented.

## Results

| Item | Result | Evidence (path:lines, or transcript) |
|---|---|---|
| Matrix coverage | 68/68 components ported; 68 skill dirs, 2 agents, 24 commands (22 playbooks + 2 direct skills with `disable-model-invocation`: `create-verification-skill`, `maintain-verification-skill`; + `poteto-mode` + `setup-pstack`) | `ls skills agents commands` |
| Branding check | `bun run scripts/branding-check.ts` → `branding check: clean (skills, agents, commands)` | `scripts/branding-check.ts` |
| Frontmatter | All 70 `SKILL.md`/agent files parse; `name:` matches directory/file | `python3 -c "import yaml; yaml.safe_load(fm)"` per file |
| Orphan sweep | Zero `skill://` refs pointing at missing skills | regex sweep over `skills/`, `agents/`, `commands/` |
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
| `make-bot-ui` | Upstream drives Cursor Routines: `update_state` routine tool, `SendToUser` secret-request card, webhook-wake `[routine]`/`<webhook_event>` format — no OMP equivalent exists; preserved verbatim, flagged in `note:` | n/a — construct absent from OMP |
| `deslop`, `cursor-team-kit` `control-cli`/`control-ui` | Plugin never vendored in this port (conventions §5); generalized to prose or dropped | n/a |
| `references/bugbot-triage.md` | Not tracked in `matrix.md`; dangling relative link in `autopilot-*`/`babysit` cut to plain prose | n/a |
| `/goal` persistent objective | No OMP fallback (substitution contract); rewritten as restating the standing brief | n/a |
| `check-plan.mjs`, `orch.ts`, `watch-pr` | Real pstack tooling, but porting the scripts is out of scope for the markdown-only phase; kept as bare command names | n/a |

## Questions raised

- Should `make-bot-ui` be reclassified `DEFER`? Its core (Cursor Routines/webhook
  automation) has no OMP equivalent, so the ported skill keeps an unreachable
  mechanism. `create-verification-skill`/`maintain-verification-skill` set the
  precedent for flagging a gap rather than inventing a substitute.

## Done-when checklist

- [x] Every matrix row (all `ADAPT`) has a file under the loading roots — 68/68 dirs/files present (`ls` verified)
- [x] Branding check passes — `bun run scripts/branding-check.ts` → clean
- [x] Frontmatter check passes — all 70 files `yaml.safe_load`-clean after 14 quote fixes
- [x] Phase B probes still pass — `bun run scripts/verify-phase-b.ts` → exit 0
