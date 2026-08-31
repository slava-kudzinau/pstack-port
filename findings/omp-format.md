# OMP format — the format doc for this port

Pins: OMP 18.0.11 @ `65f79e76fcc89b96632fe86a598f314bd7cfc725` (can1357/oh-my-pi `origin/main`); upstream `cursor/plugins` @ `fd878692de15a3069c21c8f429eb0b9f2fe178fa` (live `main` tip, `git ls-remote`); reference port `pstack-claude` @ `c2ade4bba14fb4706857286afb5528bc2244bf44` (its own `upstream.json` still pins older component shas `4612556`/`e46364b…` → stale reference, per `10-phase-a-study.md:49-51`)

## 1. Agents

### Where OMP looks

Discovery order (`packages/coding-agent/src/task/discovery.ts:4-16`):

1. `<nearest project dir>/.omp/agents/*.md`
2. `~/.omp/agent/agents/*.md`
3. `<extension root>/agents/*.md` for each OMP extension
4. Claude-marketplace plugin `agents/` dirs
5. Bundled agents (`task/agents.ts:45-76`)

Only the nearest project dir and the first user dir are scanned (`discovery.ts:62-67,93-134`). Cross-harness roots like `.claude/agents` are deliberately skipped (`discovery.ts:13-16`). Only `.md` files; symlinks/non-files skipped; an unreadable dir is treated as empty (`discovery.ts:43-60`).

### Frontmatter

- **Required:** `name`, `description` (both non-empty strings) — missing either skips the file (`discovery/helpers.ts:257-263`).
- **Optional:** `tools` (CSV/list; `yield` auto-appended), `spawns` (`*`, CSV, list; inferred `*` when `tools` includes `task`), `model` (selector(s), `@role` aliases resolve via `modelRoles.<role>` in `~/.omp/agent/config.yml`; `task.agentModelOverrides` wins), `output` (opaque schema), `thinkingLevel`/`thinking`, `readSummarize`, `blocking`, `prewalk`, `advisor`, `autoloadSkills` (`helpers.ts:236-334`; `docs/task-agent-discovery.md:49-74`).
- **No** `subagent_type`, no `run_in_background`, no `claude-*` slugs: OMP spawns via the `task` tool's `agent` field and background jobs auto-deliver.

### Bundled roles

`scout`, `designer`, `reviewer`, `security-reviewer`, `librarian`, `task`, `sonic` (`task/agents.ts:45-76`). `task` spawns any agent (`spawns: "*"`); `scout`/`librarian` are read-only research; `reviewer` may spawn `scout`; `sonic`/`scout` carry 100-request budgets, `default` 200 (`task/executor.ts:95-131`).

## 2. Skills

Layout: non-recursive `<skills-root>/<skill-name>/SKILL.md` (`docs/skills.md:27-33`).

Providers + precedence (`docs/skills.md:85-98`): `native`/`.omp` roots (100) > `omp-plugins` (90) > `claude` (`~/.claude/skills`, `~/.agent/skills`, `~/.agents/skills`, `.claude/skills`…) (80) > `claude-plugins`/`agents`/`codex` (70) > `opencode` (55) > `github` (`<repo>/.github/skills/<name>/SKILL.md`, 30) > `omp-managed` (`~/.omp/agent/managed-skills`, 5). Dedup by skill name, first provider wins (`discovery/agents.ts:191-195`; `discovery/builtin.ts:331-337`; `discovery/github.ts:325-329`).

Frontmatter: **closed six fields** for plugin-packaged skills — `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`; any unknown key rejects the skill; `name` must equal the directory name; `description` ≤ 1024; `compatibility` ≤ 500 (`discovery/agent-plugin-format.ts:124-161`). Provider-scanned skills parse `name`/`description`/`globs`/`alwaysApply`/`hide`/`disable-model-invocation`; extra keys survive as opaque metadata (`capability/skill.ts:12-32,58-68`).

## 3. Commands

Files only: one `.md` per command directly in `commands/` — no subdir layout (`task/commands.ts:66-109`). Precedence `.omp` > `.pi` > `.claude` (project before user), then bundled `init.md`. `$@` in the body expands to the task input. Extensions MAY `registerCommand` additionally; never required (`extensions/types.ts:1363-1370`).

## 4. `task` tool

Four wire shapes, exactly one visible at a time (`task/types.ts:114-177`): flat with/without `isolated`, batch with/without `isolated`. Batch = `{context, tasks[]}` with one item per subagent; `context` is shared background prepended to each assignment. `task.batch` default `true` (`config/settings-schema.ts:4956-4958`). `task.enableEffort` default `false` (`:4968-4970`); `task.maxEffort` default `max` (`:5092-5095`); `task.isolation.mode` default `none` (`:4835-4849`).

Changes from isolated runs return as `patch` (written to `<agentId>.patch`, applied when `task.isolation.apply` is on) or `branch` (committed then merged when `task.isolation.merge` is on) (`task/isolation-runner.ts:149-152,340-347,486-497`).

## 5. Extension API (for Phase E)

- `registerTool(ToolDefinition)` — `extensions/types.ts:1299`
- `registerCommand(name, {description?, getArgumentCompletions?, handler})` — `:1363`
- `registerShortcut(KeyId, {description?, handler})` — `:1373`
- `registerFlag(name, {description?, type: "boolean"|"string", default?})` — `:1382`
- `on(event, handler)` — 30+ lifecycle events incl. `session_start` — `:1236-1292`
- `pi.sendMessage(msg, {triggerTurn?, deliverAs?})` / `pi.sendUserMessage` — `:1426-1435`
- `setModel`, `get/setThinkingLevel`, `registerProvider` (documented; `docs/extensions.md:126,134-174`)

All of the above are **stock** OMP: every one appears in docs or bundled examples, so conventions §6 has zero fork-only rows and the blocker rule never fires.

## 6. Conventions §6 — stock vs fork

All 19 rows of `pstack-omp-plan/01-conventions.md` §6, verified against `refs/omp-src` (all `Stock? = Yes`, `Fallback = n/a`; zero fork-only rows → no blocker):

| API | Stock? | Evidence (path:lines) | Fallback if fork-only |
|---|---|---|---|
| Agent discovery (`.omp/agents`, `~/.omp/agent/agents`, extension roots) | Yes | `packages/coding-agent/src/task/discovery.ts:43-60,94-134` | n/a |
| Skill discovery (`<root>/skills/<name>/SKILL.md`, non-recursive) | Yes | `docs/skills.md:27-33,85-98`; `src/discovery/helpers.ts:377-442` | n/a |
| Command discovery (`commands/*.md` under config dirs) | Yes | `docs/config-usage.md:268-269`; `src/discovery/builtin.ts:340-369` | n/a |
| Agent frontmatter parsing (`name`+`description` required) | Yes | `src/discovery/helpers.ts:257-263` | n/a |
| `task` tool (flat + batch schema, `context`/`tasks[]`) | Yes | `src/task/types.ts:114-177,195-278` | n/a |
| `task` per-spawn `effort` (`lo|med|hi`, `task.enableEffort` default off) | Yes | `src/task/types.ts:111-112`; `src/config/settings-schema.ts:4968-4970` | n/a |
| Request budgets (`SOFT_REQUEST_BUDGET`, `task.softRequestBudget`) | Yes | `src/task/executor.ts:95-131`; `src/config/settings-schema.ts:5061-5064` | n/a |
| Isolated worktrees + patch/branch return (`isolated`, `task.isolation.*`) | Yes | `src/task/structured-subagent.ts:296-302,315-318`; `src/task/isolation-runner.ts:149-152,340-347,486-497` | n/a |
| `pi.registerCommand` | Yes | `src/extensibility/extensions/types.ts:1363-1370`; example `examples/extensions/api-demo.ts:75-78` | n/a |
| `pi.registerTool` | Yes | `src/extensibility/extensions/types.ts:1299`; `src/extensibility/extensions/loader.ts:180-195` | n/a |
| `pi.registerShortcut` | Yes | `src/extensibility/extensions/types.ts:1373-1379`; example `examples/extensions/plan-mode.ts:293-296` | n/a |
| `pi.registerFlag` | Yes | `src/extensibility/extensions/types.ts:1382-1386`; example `examples/extensions/plan-mode.ts:216-219` | n/a |
| `pi.on("session_start")` / full event union | Yes | `src/extensibility/extensions/types.ts:1067-1103,1236-1292`; `src/extensibility/shared-events.ts:27-30` | n/a |
| Message injection (`pi.sendMessage` / `pi.sendUserMessage`) | Yes | `src/extensibility/extensions/types.ts:1426-1435`; `src/extensibility/extensions/loader.ts:259-271` | n/a |
| Model control (`setModel`, `get/setThinkingLevel`) | Yes | `src/extensibility/extensions/types.ts:1456-1462`; `src/extensibility/extensions/compact-handler.ts:35-39` | n/a |
| `pi.registerProvider` / `unregisterProvider` | Yes | `src/extensibility/extensions/runner.ts:672-677`; `docs/extensions.md:126,134-174` | n/a |
| Service tiers (`get/setServiceTier`) | Yes | `src/extensibility/extensions/types.ts:1465`; `docs/extensions.md:125,130` | n/a |
| File-write/delete fallback (`registerFileWriteFallback`/`Delete`) | Yes | `src/extensibility/extensions/types.ts:1331,1356`; `docs/extensions.md:421,494` | n/a |
| `skill://` internal URL resolution | Yes | `src/discovery/internal-urls/skill-protocol.ts:4-9`; `docs/skills.md:169-179` | n/a |
