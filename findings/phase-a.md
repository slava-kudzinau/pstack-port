# Findings — Phase A: Study

**Date:** 2026-08-31
**OMP version:** 18.0.11 @ 65f79e76fcc89b96632fe86a598f314bd7cfc725 (can1357/oh-my-pi `origin/main`, fetched 2026-08-31 — checkout was pinned at `c2ade4b`, which is actually the `michael-denyer/pstack-claude` tip; the two pins in `UPSTREAM.md` were swapped and are now corrected)
**Upstream pstack:** cursor/plugins @ fd878692de15a3069c21c8f429eb0b9f2fe178fa (plugin.json v0.14.5; `git ls-remote` confirms `fd87869…` is the live `main` tip — already re-pinned at latest)
**Local model:** mlx/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-4bit

## Decisions

- **No OMP-side update of the port (2026-08-31, user).** OMP is the base
  tool; the port does NOT track new OMP releases. `UPSTREAM.md` keeps its
  one-time pins (`omp_sha: 65f79e76…`, `ref_port_sha: c2ade4b…`) and
  `findings/*` and the ported files under the loading roots keep the
  `path:lines` evidence frozen at those
  shas. The only sync procedure the port implements is the
  `cursor/plugins` sha sync (conventions §5, Phase F §3: provenance
  frontmatter → upstream diff tool → conformance gate). If OMP later adds a
  `run`/`verify`/`loop` equivalent or changes `task` semantics, that is
  accepted drift, not a porting task.

## Headline

All Phase A questions (agent/skill/command discovery, formats, `task` tool,
extension API) are answered from `refs/omp-src` with path:line evidence.
Every API the port design depends on exists in stock OMP; no fork-only row
in conventions section 6.

## Results

### Discovery

| Item | Result | Evidence (path:lines, or transcript) |
|---|---|---|
| Agent search paths | `packages/coding-agent/src/task/discovery.ts:4-11` lists the roots: project `.omp/agents/*.md`, user `~/.omp/agent/agents/*.md`, `<ext>/agents/*.md` per OMP extension root, Claude marketplace plugin `agents/`, then bundled. Only the nearest project dir and first user dir are used (`:94-97`); cross-harness roots like `.claude/agents` are intentionally skipped (`:13-16`). | `refs/omp-src/packages/coding-agent/src/task/discovery.ts:4-16,94-97` |
| Agent file extension | Only `.md` files; non-files/symlinks skipped; unreadable dir treated as empty | `task/discovery.ts:43-60` |
| Skill search paths | Provider layout is non-recursive `<skills-root>/<name>/SKILL.md`; roots: nearest `.omp/skills` per ancestor dir, `~/.omp/agent/skills`, then provider-specific dirs | `docs/skills.md:27-33` |
| Skill providers + precedence | `native` (100, `.omp` project/user), `omp-plugins` (90), `claude` (80), then `claude-plugins` / `agents` / `codex` (all 70), `opencode` (55), `github` (30), `omp-managed` (5); dedup by skill name, first wins | `docs/skills.md:85-98` |
| Command search paths | `commands/*.md` under each config dir; native provider scans only `.md` files | `docs/config-usage.md:268-269`; `task/commands.ts:66-68,70-74`; `discovery/builtin.ts:340-358` |
| Command precedence | `.omp` > `.pi` > `.claude` (project before user), then bundled (`init.md` is the only bundled command) | `task/commands.ts:66-63,101-106` |
| Commands: files only? | Yes; file discovery is independent of extension code. Extensions may *additionally* register commands via `pi.registerCommand`; never required | `task/commands.ts:70-74`; `extensibility/extensions/types.ts:1363-1370`; example `examples/extensions/api-demo.ts:75-78` |

### Formats

| Item | Result | Evidence (path:lines, or transcript) |
|---|---|---|
| Agent frontmatter required | `name` and `description` (both strings, non-empty); missing either fails the file and it is skipped | `discovery/helpers.ts:257-263` |
| Agent frontmatter optional | `tools` (CSV or list; `yield` auto-appended), `spawns` (`*`, CSV, or list; inferred `*` when `tools` has `task`), `model` (selector(s)), `output` (opaque schema), `thinkingLevel`/`thinking`, `readSummarize`, `blocking`, `prewalk` (bool or model pattern), `advisor` (bool or pattern), `autoloadSkills` | `discovery/helpers.ts:236-251,265-334` |
| Bundled agent values | `scout` (`tools: read, grep, glob, web_search`, `model: "@smol"`, `thinking-level: medium`, `read-summarize: false`), `designer` (`model: "@designer"`), `reviewer` (`tools` incl. `lsp`, `spawns: scout`, `model: "@slow"`), `security-reviewer` (`tools: read, grep, glob, lsp, ast_grep`), `librarian` (`tools` incl. `bash`, `model: "@smol"`, `thinking-level: minimal`), `task` (`spawns: "*"`, `model: "@task"`), `sonic` (`model: "@smol"`, `thinkingLevel: Medium`) | `task/agents.ts:45-76` |
| Skill frontmatter (plugin-packaged) | CLOSED to six fields `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`; unknown key rejects the skill; `name` must equal the directory name; `description` required, max 1024; `compatibility` max 500 | `discovery/agent-plugin-format.ts:124-161` |
| Skill frontmatter (provider-scanned) | `name`/`description`/`globs`/`alwaysApply`/`hide`/`disable-model-invocation` parsed; extra keys kept as unknown metadata; `name` defaults to dir name; `enabled: false` skips the skill | `capability/skill.ts:12-32,58-68`; `discovery/helpers.ts:394-419` |
| Command file layout | One `.md` per command directly in `commands/` (not a subdir layout); frontmatter `name`/`description` parsed, body = instructions; `$@` expands to the task input | `discovery/builtin.ts:344-355`; `task/commands.ts:83-97,118-125` |

### The `task` tool

| Item | Result | Evidence (path:lines, or transcript) |
|---|---|---|
| Input schema | Four wire shapes, model sees exactly one: flat with/without `isolated`, batch with/without `isolated`. Flat: `name?`, `agent` (default `task`), `task` (required), `effort?` (`lo|med|hi`), `outputSchema?`, `schemaMode?` (`permissive|strict`), `isolated?`. Batch: `context` + `tasks[]` of the same item shape. `"+": "delete"` rejects unknown fields | `task/types.ts:114-130,150-177,195-257` |
| Batching | `task.batch` default `true` gives the `{context, tasks[]}` shape; `context` is shared background prepended to every assignment; one subagent per item; concurrency via `task.maxConcurrency` semaphore | `task/types.ts:280-305`; `task/index.ts:590-598,632-634`; `docs/task-agent-discovery.md:76-85` |
| Roles | Bundled: `scout`, `designer`, `reviewer`, `security-reviewer`, `librarian`, `task`, `sonic`. `task` spawns any agent (`spawns: "*"`); `sonic` is low-reasoning (`@smol`, `thinkingLevel: Medium`); `scout`/`librarian` are read-only research (`readSummarize` off); `reviewer` may spawn `scout`; `security-reviewer` is read-only evidence | `task/agents.ts:45-76,135-143`; `docs/task-agent-discovery.md:111-119` |
| Role aliases | `model` entries like `@task`/`@smol`/`@slow`/`@review` resolve through `modelRoles.<role>` in `~/.omp/agent/config.yml`; `task.agentModelOverrides` (default `{}`) wins over frontmatter, then parent's active model | `docs/task-agent-discovery.md:49-74,201-209`; `config/settings-schema.ts:471,5111-5113` |
| Effort levels | Per-spawn `effort` (`lo|med|hi`) only exposed when `task.enableEffort` (default `false`); maps to the model's lowest/middle/highest supported effort, clamped to `task.maxEffort` (default `max`); task-item effort overrides the agent's `thinkingLevel` | `task/types.ts:111-112,140-141`; `config/settings-schema.ts:4968-4970,5092-5095`; `docs/task-agent-discovery.md:43` |
| Request budgets | Soft per-agent budget: `scout: 100`, `sonic: 100`, `default: 200`; `task.softRequestBudget` (default 200) can only lower it; crossing injects a wrap-up notice; 1.5x stops the turn and forces one final `yield`; +5 requests grace, then hard abort | `task/executor.ts:95-131`; `config/settings-schema.ts:5061-5064` |
| Isolated worktrees | `isolated: true` (per item; top-level in flat form) runs the subagent on a snapshot; applied only when `task.isolation.mode` is not `none` (default `none`); backends `apfs|btrfs|zfs|reflink|overlayfs|projfs|block-clone|rcopy`; needs a git checkout | `task/types.ts:286-305`; `config/settings-schema.ts:4835-4849`; `task/worktree.ts:59-61` |
| Changes returned | `mergeMode` `patch` writes `<agentId>.patch` into the artifacts dir and applies it when `task.isolation.apply` is on; `branch` commits onto a branch and merges when `task.isolation.merge` is on; nested patches apply only when the parent outcome allows | `task/isolation-runner.ts:149-152,313-315,340-347,467-497`; `task/structured-subagent.ts:296-302,315-318,598-604,625-637` |

### Extension API

| Item | Result | Evidence (path:lines, or transcript) |
|---|---|---|
| `registerCommand` | `registerCommand(name, {description?, getArgumentCompletions?, handler})` — commands register as `/pstack:<name>` per conventions section 2 | `extensibility/extensions/types.ts:1363-1370`; impl `extensions/loader.ts:197-210` |
| `registerTool` | `registerTool(ToolDefinition)`; `ToolDefinition` carries `name`, `label`, `description`, params schema, handler; `loadMode` defaults to `discoverable` at adapter boundaries | `extensions/types.ts:1299,614-615`; `extensions/loader.ts:180-195`; `tools/essential-tools.ts:9-12` |
| `registerShortcut` | `registerShortcut(KeyId, {description?, handler(ctx)})` | `extensions/types.ts:1373-1379`; `extensions/loader.ts:212-221`; example `examples/extensions/plan-mode.ts:293-296` |
| `registerFlag` | `registerFlag(name, {description?, type: "boolean"|"string", default?})` | `extensions/types.ts:1382-1386`; `extensions/loader.ts:222-225`; example `examples/extensions/plan-mode.ts:216-219` |
| `on()` / lifecycle events | `ExtensionEvent` union covers `resources_discover`, `session_start`, `session_before_switch`, `session_switch`, `session_before_branch`, `session_branch`, `session_before_compact`, `session.compacting`, `session_compact`, `session_shutdown`, `session_before_tree`, `session_tree`, `context`, `before_provider_request`, `after_provider_response`, `before_agent_start`, `agent_start`, `agent_end`, `session_stop`, `turn_start`, `turn_end`, `message_*`, `tool_execution_*`, `auto_compaction_*`, `auto_retry_*`, `retry_fallback_*`, `ttsr_triggered`, `todo_reminder`, `goal_updated`, `credential_disabled`, `input`, `tool_approval_*`, `tool_call`, `tool_result`, `user_bash`, `user_python`, `mcp_notification` | `extensions/types.ts:1067-1103,1236-1292` |
| `session_start` | Fired on initial session load; runtime-initialized then emitted once per session; also re-runs on cold revival | `extensibility/shared-events.ts:27-30`; `modes/runtime-init.ts:36-40,147`; `task/persisted-revive.ts:175-179`; `task/executor.ts:3434` |
| Message injection | `pi.sendMessage(message, {triggerTurn?, deliverAs?: "steer"|"followUp"|"nextTurn"})`; `pi.sendUserMessage(content, {deliverAs?: "steer"|"followUp"})`; hooks inject via `before_agent_start` returning `{message}` (persisted, visible in TUI) | `extensions/types.ts:1426-1435`; `extensions/loader.ts:259-271`; `hooks/types.ts:421-424,473-475,526-529` |
| Model-control: stock | `setModel(model)` returns false without an API key; `get/setThinkingLevel`; `registerProvider`/`unregisterProvider` (documented, with `usage` + `fetchDynamicModels` support); `getServiceTiers`/`setServiceTier`; `ctx.models` (`list`/`current`/`resolve` via role aliases) | `extensions/types.ts:1456,1459,1462,1465`; `extensions/compact-handler.ts:25-39`; `extensions/runner.ts:672-677`; `docs/extensions.md:125-130,134-174`; `extensions/model-api.ts:19-35` |
| Model-control: internal? | None of the above is internal by the conventions section 6 test: all appear in docs or bundled examples (`examples/extensions/api-demo.ts`, `plan-mode.ts`, `hello.ts`, `autoresearch/index.ts:121-126,228-248`) | transcript |

## What did not work

| Item | Failure | Exact error |
|---|---|---|
| (none) | No API in the design was unconfirmed; every question above has a `path:lines` answer | — |

## Questions raised

(none open)

## Done-when checklist

- [x] All pins recorded (OMP version + sha; `cursor/plugins` sha; pstack `plugin.json` version if present) — verified against `UPSTREAM.md:1-7` and `findings/phase-a.md:4-5`
- [x] Every discovery, format, `task`, and extension-API question answered with `path:lines` — tables above
- [x] `stock vs fork` table has no empty fallback rows — filled in `01-conventions.md` section 6; every row is stock, so the blocker rule does not fire
- [x] Matrix has no blank actions — filled at `findings/matrix.md`; 70 `ADAPT`, 0 `NATIVE` (reversed 2026-08-31: every component, incl. the six `Task`-dispatch skills, carries Cursor/Claude-only primitives → no component ships verbatim); `0` `PORT`/`REPLACE`/`DEFER`/`DROP`; verified `grep -c` of blank Action cells → no matches
- [x] Sanity-check agent loads — `scripts/sanity-poteto-agent.ts` runs `discoverAgents` from `task/discovery.ts` against `.omp/agents/poteto-agent.md`; all 9 agents discovered
- [ ] Human review complete (checkpoint 1) — pending
