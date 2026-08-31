# Open questions

Anything not confirmed against OMP source goes here. Move a row to
"Answered" only with a `path:lines` evidence pointer.

All paths below are relative to `refs/omp-src`.

## Unresolved

No open questions. All Phase A discovery, format, task-tool, and extension-API
questions answered with `path:lines` evidence. `make-bot-ui` resolved as `DROP`
(de-scoped, per user decision 2026-08-31; matrix row 74).

## Answered

| Question | Answer | Evidence (path:lines) |
|---|---|---|
| Where does OMP look for agents? | Project `.omp/agents/*.md`, then user `.omp/agents` (via `getConfigDirs`), then `agents/` inside every wired extension root, then Claude-marketplace plugin `agents/`, then bundled definitions; first name wins. | `packages/coding-agent/src/task/discovery.ts:5-11,64-67,93-119` |
| Where does OMP look for skills? | `<dir>/SKILL.md` children plus an optional `SKILL.md` sitting directly under a scanned dir; extension packages expose a `skills/` sub-directory like `tools/`/`commands/`. | `packages/coding-agent/src/discovery/helpers.ts:357-360,423,431`; `packages/coding-agent/src/discovery/omp-extension-roots.ts:7` |
| Where does OMP look for commands? | `commands/` under each discovery dir (builtin scanner), and as a standard extension sub-directory; plugin manifests can remap or disable it. | `packages/coding-agent/src/discovery/builtin.ts:345-346`; `packages/coding-agent/src/discovery/omp-extension-roots.ts:343`; `packages/coding-agent/src/discovery/claude-plugins.ts:126-132` |
| Agent frontmatter: required fields? | `name` and `description` are required — `parseAgentFields` returns `null` when either is missing. | `packages/coding-agent/src/discovery/helpers.ts:257-263` |
| Agent frontmatter: optional fields? | `tools` (empty array allowed; `yield` auto-appended), `spawns` (array/`"*"`/CSV; `task` tool infers `"*"`), `output`, `thinkingLevel`/`thinking`, `blocking`, `readSummarize`, `prewalk` (bool or pattern), `advisor` (bool or pattern), `autoloadSkills`. | `packages/coding-agent/src/discovery/helpers.ts:265-334` |
| Skill frontmatter and body layout? | Managed skills serialize a minimal `name`/`description` YAML block delimited by `---` fences, with a hard-capped markdown body. | `packages/coding-agent/src/autolearn/managed-skills.ts:72-81,19,166`; `packages/coding-agent/src/tools/manage-skill.ts:20` |
| Command file layout? | Slash commands are `<dir>/commands/*.md` per provider dir; names derive from the path relative to the commands dir. | `packages/coding-agent/src/discovery/builtin.ts:345-346`; `packages/coding-agent/src/discovery/claude.ts:278-288,557`; `packages/coding-agent/src/discovery/codex.ts:518` |
| `task` tool: full input schema? | Four wire shapes, one visible at a time: flat with/without `isolated`, batch with/without `isolated`. Flat: `name?`, `agent` (default `task`), `task` (required), `effort?` (`lo|med|hi`), `outputSchema?`, `schemaMode?` (`permissive|strict`), `isolated?`. Batch: `context` + `tasks[]` of the same item shape. | `packages/coding-agent/src/task/types.ts:114-177` |
| `task` tool: batching call shape? | One subagent per `tasks[]` item (batch form) or the single flat spawn; batch requires `tasks` + `context`; spawns run as AsyncJobManager jobs when `async.enabled`, else the tool blocks. | `packages/coding-agent/src/task/index.ts:500-505,274-279,524` |
| `task` tool: built-in role names? | Bundled agents: `scout`, `designer`, `reviewer`, `security-reviewer`, `librarian`, `task` (default general-purpose), `sonic` (low-reasoning). | `packages/coding-agent/src/task/agents.ts:45-76` |
| `task` tool: permissions model? | The `tools` frontmatter list gates the subagent; an explicit list always gets `yield` appended, and `spawns` controls which children it may spawn. | `packages/coding-agent/src/discovery/helpers.ts:257-334` |
| `task` tool: effort levels — per task or per agent? | Per task: `effort` is a per-call/per-item field validated against `"lo" | "med" | "hi"`, materialized only when sent; item value wins over flat. Gated by the `task.enableEffort` setting. | `packages/coding-agent/src/task/index.ts:220-223,281,302,292-303,596,618` |
| `task` tool: soft request budget defaults? | `SOFT_REQUEST_BUDGET`: `scout: 100`, `sonic: 100`, `default: 200`; `task.softRequestBudget` can only lower the bound (0 disables); crossing it injects a `[budget notice]`, 1.5x force-stops with `BUDGET_STOP_GRACE_REQUESTS = 5` grace. | `packages/coding-agent/src/task/executor.ts:96-107,119-122,126,128-131` |
| Isolated worktree: when triggered, how are changes returned? | Triggered by `isolated` (per-item wins over flat form); the run executes with `cwd` bound to the worktree, and the worktree is merged + cleaned after the run. | `packages/coding-agent/src/task/index.ts:274-279,292-303`; `packages/coding-agent/src/task/executor.ts:941-947,2588-2591,3275-3279` |
| `registerCommand` signature? | `registerCommand(name, { description?, getArgumentCompletions?, handler })`. | `packages/coding-agent/src/extensibility/extensions/types.ts:1363-1370` |
| `registerTool` signature? | `registerTool(tool: ToolDefinition)` — `{ name, label, description, parameters, hidden?, …, execute(), … }`. | `packages/coding-agent/src/extensibility/extensions/types.ts:612-668`; real use in `packages/coding-agent/src/sdk.ts:1024-1028` |
| `registerShortcut` signature? | `registerShortcut(shortcut: KeyId, { description?, handler(ctx) })`. | `packages/coding-agent/src/extensibility/extensions/types.ts:1373-1379`; `loader.ts:212-221` |
| `registerFlag` signature? | `registerFlag(name, { description?, type: "boolean" | "string", default? })`. | `packages/coding-agent/src/extensibility/extensions/types.ts:1382-1386`; impl `extensibility/extensions/loader.ts:222-230` |
| `on()` event registration? | `api.on(event, handler)` — wired through `createCustomToolsExtension`; events per `shared-events.ts`. | `packages/coding-agent/src/sdk.ts:1042-1053` |
| Full lifecycle event list? | Shared session events: `session_start`, `session_before_switch`, `session_switch`, `session_before_branch`, `session_branch`, compaction family; `resources_discover` fires post-`session_start` with `reason: "startup" | "reload"`. | `packages/coding-agent/src/extensibility/shared-events.ts:28-63` |
| Message injection API? | `sendMessage(message, { triggerTurn?, deliverAs?: "steer" | "followUp" | "nextTurn" })` and `sendUserMessage(content, { deliverAs? })`; `appendEntry(customType, data)` persists state without sending to the LLM. | `packages/coding-agent/src/extensibility/extensions/types.ts:1426-1438,1647-1652` |
| `what-did-i-get-done` should be `PORT` or `ADAPT`? It's a `git log` summary flow with no Cursor constructs. | `PORT` — body is `git log` + `bash` only, no Cursor tool names, model slugs, or `subagent_type` refs. Audited clean in the reference port (`CHANGES.md:222`). | `upstream/cursor-team-kit/skills/what-did-i-get-done/SKILL.md:1-12`; `refs/ref-port/CHANGES.md:222` |
