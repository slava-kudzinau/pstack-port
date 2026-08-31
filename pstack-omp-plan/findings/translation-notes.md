# Translation notes

Frozen record for the pstack → OMP port: the substitution rules that decide how
upstream Cursor/Claude primitives are restated for OMP, the component
classification counts copied from [`../../findings/matrix.md`](../../findings/matrix.md),
and the vendored upstream pins.

All 70 components under `upstream/pstack` are **port targets** (decided
2026-08-31, user): migrate everything that makes sense from pstack to OMP —
keep upstream prose, replace just the tool names, and script whatever has no
OMP equivalent. `pstack-omp` is a self-contained, independent port of pstack
into OMP, able to sync from the `cursor/plugins` upstream at any sha.
Artifacts live where OMP actually loads them: `.omp/skills/<name>/SKILL.md`
(`docs/skills.md:27-33`), `.omp/agents/*.md` (`task/discovery.ts:4-16`),
`commands/*.md` under a scanned dir (`task/commands.ts:66-109`) — not in an
inert `port/`-style folder.

Evidence paths are relative to `refs/omp-src` (the authoritative OMP source).

## 1. Substitution rules

| # | From | To | Why | Evidence |
|---|---|---|---|---|
| 1 | `Agent` / `Task` tool (one spawn per call) | `task` tool — batch `tasks[]` plus a shared `context` | OMP's `task` tool takes a `context` string and an array of items, so a fan-out is one call, not N. Each item carries `name?`, `agent`, `task`, `outputSchema?`, `schemaMode?`, and optionally `isolated`. | `packages/coding-agent/src/task/types.ts:114-177` (`taskItemSchema`, `taskItemSchemaIsolated`, `taskSchema`, `taskSchemaBatch`, `taskSchemaBatchNoIsolation`) |
| 2 | `subagent_type` | `agent` field on the task item | The OMP task item has no `subagent_type` key; `agent` is a required string defaulting to `'task'`. Bundled roles are `scout`, `designer`, `reviewer`, `security-reviewer`, `librarian`, `task`, `sonic` (`EMBEDDED_AGENT_DEFS`). `.claude/agents` dirs are **skipped** by discovery — their frontmatter is not the OMP task-agent contract — so an upstream `subagent_type: "poteto-agent"` reference must be re-declared as `.omp/agents/*.md` and spawned with `agent: "…"`. | `packages/coding-agent/src/task/agents.ts:45-76`; `packages/coding-agent/src/task/discovery.ts:4-16` (`TASK_AGENT_CONFIG_SOURCE = ".omp"` at `:32`) |
| 3 | `AskQuestion` / `AskUserQuestion` | `ask` tool | `ask` is an OMP builtin; `AskQuestion` is not, and appears in 5 upstream files that must be rewritten (`AskUserQuestion` appears in none). | `packages/coding-agent/src/tools/builtin-names.ts:1-31` (`"ask"` at `:7`); `packages/coding-agent/src/tools/ask.ts`; `docs/tools/ask.md`; upstream: `upstream/pstack/skills/setup-pstack/SKILL.md`, `…/skills/automate-me/SKILL.md`, `…/skills/poteto-mode/SKILL.md`, `…/skills/poteto-mode/playbooks/autonomous-run.md`, `…/skills/poteto-mode/playbooks/orchestrate.md` |
| 4 | Cursor `run` / `verify` / `loop` | No OMP equivalent — rewrite around `bash`, `browser`, `hub` | None of the three names exists in OMP's tool set, so there is nothing to map them onto; the surrounding step has to be re-expressed (drive the real surface with `browser`/`bash`, or hand the loop to `hub`/`task`). | `packages/coding-agent/src/tools/builtin-names.ts:1-31` (absent from `BUILTIN_TOOL_NAMES`); no `run.md`, `verify.md`, or `loop.md` under `docs/tools/` |
| 5 | `claude-*` / `grok-*` / `gpt-*` model slugs | Role aliases `@task` / `@smol` / `@slow` | OMP agents pin a role alias, not a literal model id: `task.md` → `@task`, `sonic.md` → `@smol`, `reviewer.md` → `@slow`. Aliases are resolved by `resolveModelRoleValue`; a `<role>/<level>` form stays resolvable. | `packages/coding-agent/src/task/agents.ts:45-76` (`@task` `:57`, `@smol` `:71`); `packages/coding-agent/src/prompts/agents/reviewer.md:6` (`@slow`); `packages/coding-agent/src/config/model-resolver.ts:1142`; `packages/coding-agent/src/eval/completion-bridge.ts:43`; upstream: 8 files with `claude-*`, 12 with `grok-*`, 11 with `gpt-*` |
| 6 | `is_background` / `run_in_background` | Dropped | The `task` schema has no background field to carry either key, so both are deleted rather than mapped; background jobs are already a `task`/`hub` capability — `hub` auto-delivers finished jobs, so the flag has no caller. | `packages/coding-agent/src/task/types.ts:114-177` (neither key present); `docs/tools/task.md`, `docs/tools/hub.md` (background jobs); upstream: `upstream/pstack/agents/poteto-agent.md` (`is_background`), `…/skills/swarm/SKILL.md`, `…/skills/poteto-mode/SKILL.md`, `…/skills/arena/SKILL.md` (`run_in_background`) |
| 7 | `control-cli` / `control-ui` | `bash` / `browser` tools | Cursor's control surfaces have no OMP counterpart; shell work goes through `bash`, and any browser-verified flow goes through `browser` (which drives a real Chromium tab via `tab`/`page`). | `packages/coding-agent/src/tools/builtin-names.ts:1-31` (`bash` `:3`, `browser` `:15`); `docs/tools/bash.md`, `docs/tools/browser.md`; both names appear in 7 upstream files each, incl. `…/playbooks/shipping.md`, `…/playbooks/opening-a-pr.md`, `…/playbooks/multi-phase-plan.md` |
| 8 | `~/.claude/skills`, `.claude/skills` | Still discovered — but `.omp` wins every name conflict | Skill discovery runs across `~/.omp/agent`, `~/.claude`, `~/.codex`, `~/.gemini` (project walk-up too), so the `.claude` roots keep working. Providers are sorted highest-priority-first and deduped by `key` with **first wins**, so `native` (100) beats `claude` (80) and `agent-dirs` (70): a skill present in both `.omp` and `.claude` resolves to the `.omp` copy. | `packages/coding-agent/src/capability/skill.ts:58-63` (`skillCapability`, `key: skill => skill.name`); `packages/coding-agent/src/discovery/agents.ts:26-28,189-195` (`PROVIDER_ID = "agents"`, `PRIORITY = 70`); `packages/coding-agent/src/discovery/claude.ts:33-36` (`PROVIDER_ID = "claude"`, `PRIORITY = 80`, `CONFIG_DIR = ".claude"`); `packages/coding-agent/src/discovery/builtin.ts:39-44` (`PROVIDER_ID = "native"`, `PRIORITY = 100`); `packages/coding-agent/src/capability/index.ts:183,431`; `packages/coding-agent/src/config.ts:10-15,83-92` |

### Supporting rules that fall out of the above

- **Bundled roles only.** `.claude/agents` and `~/.claude/agents` are skipped
  (`task/discovery.ts:4-16`); the only agent roots OMP scans are
  `~/.omp/agent/agents/*.md`, `.omp/agents/*.md`, and `<ext>/agents/*.md`
  (`config.ts:80-87`). So the ported playbooks must reference bundled names or
  files placed under `.omp/agents`.
- **`isolated` is per-item.** The batch schema carries `isolated` inside each
  task item (`task/types.ts:122-130`), not on the call — the "N parallel
  worktrees" shape is one `task` call with `isolated: true` per item.
- **Vendor plugins are a separate path.** Claude Code marketplace plugins are
  loaded by the `claude-plugins` provider at priority 70
  (`discovery/claude-plugins.ts:33-34`), below `.claude` (80); OMP extension
  packages are handled by `omp-plugins` at 90 (`discovery/omp-plugins.ts:46-47`).

## 2. Component classification

Counts counted from `findings/matrix.md` (70 data rows, `:20-89`), not copied
from any earlier estimate.

| Action | Meaning | Components |
|---|---|---|
| `PORT` | copy as-is | 0 — every component names Cursor-only primitives (`Agent`/`Task` tool, `subagent_type`, `run_in_background`, `AskQuestion`, `control-*`, `claude-*` slugs) |
| `ADAPT` | rewrite runtime parts for OMP | 70 — all components; keep upstream text, apply substitution rules 1-8 to the runtime parts |
| `NATIVE` | use OMP feature instead | 0 — reversed 2026-08-31: the six `Task`-dispatch skills (`architect`, `arena`, `interrogate`, `swarm`, `how`, `why`) carry methodology OMP's `task` tool does *not* supply; only their dispatch plumbing swaps (`ADAPT`, Phase B), they are not replaced by a new OMP-shaped doc |
| `REPLACE` | Cursor-specific; build an OMP equivalent | 0 — `control-cli`/`control-ui`/`run`/`verify`/`loop`/`/goal` are handled by rewriting the sentences over `bash`/`browser`/`hub`/`task`, no new tool needed |
| `DEFER` | out of v1, with reason | 0 |
| `DROP` | not porting, with reason | 0 |
| **Total** | | **70** |

By kind: 23 `playbook`, 21 `principle`, 24 `skill`, 2 `agent` = 70.
By phase: all 70 in **B** (every row `ADAPT`); the six former `NATIVE`
rows moved **D → B** with the rest.

## 3. Vendored upstream

`upstream/pstack` is vendored at the SHAs recorded in
[`../../UPSTREAM.md`](../../UPSTREAM.md) (cross-checked against
[`../../findings/phase-a.md`](../../findings/phase-a.md), which repeats the same
pins at `:4-5`) — recorded verbatim, nothing inferred:

| Key | Value |
|---|---|
| `upstream_sha` | `fd878692de15a3069c21c8f429eb0b9f2fe178fa` |
| `upstream_version` | `0.14.5` |
| `upstream_synced_at` | `2026-08-31` |
| `source` | `cursor/plugins`, `pstack/` subtree |
| `ref_port_sha` | `c2ade4bba14fb4706857286afb5528bc2244bf44` |
| `omp_sha` | `65f79e76fcc89b96632fe86a598f314bd7cfc725` |
| `omp_version` | `18.0.11` |

Two things to keep in mind when reading this file later:

- The `ADAPT` count is **70**: every upstream component carries
  Cursor/Claude-only primitives, so nothing ships verbatim.
- `ref_port_sha` is a **one-shot reference** and was consulted once. It is not
  a port target and must not be re-read as authority; `refs/omp-src` at
  `omp_sha` `65f79e76fcc89b96632fe86a598f314bd7cfc725` (OMP 18.0.11,
  `origin/main` at fetch time) is the single authoritative source for every
  claim above.

