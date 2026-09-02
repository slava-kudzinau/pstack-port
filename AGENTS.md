# pstack → OMP port

What this repo is: the port of pstack's Claude/Cursor skill+agent+command set
onto OMP 18.0.11. The shipped OMP package is `plugin/`, the one
path the config registers: OMP resolves its `skills/`, `agents/`, `commands/`,
and `hooks/` as siblings of that directory's `package.json`
(`refs/omp-src/docs/skills/authoring-extensions.md:99`), and the `extensions:`
entry in `~/.omp/agent/config.yml` makes it load from any working directory.
The porting workspace (plan docs, findings, scripts, vendored upstream) lives
around it at the repo root.

## Layout

```
pstack-port/
├── plugin/                # the shipped OMP package — the only dir registered
│   ├── package.json       # omp.extensions manifest slot
│   ├── skills/<name>/SKILL.md # non-recursive; only SKILL.md files load
│   ├── agents/*.md        # task agents (task/discovery.ts:4-16)
│   ├── commands/*.md      # slash commands, namespaced /pstack:<name>
│   ├── extensions/*.ts    # session-start mandate injector, wired by package.json
│   └── hooks/*.md         # mandate text injected at before_agent_start
├── upstream/pstack/       # vendored Cursor snapshot, pinned sha, read-only
├── scripts/               # branding-check.ts, verify-phase-b.ts
├── docs/                  # user-facing docs: install, commands, config
├── findings/              # one file per phase, the matrix, checkpoints
├── pstack-omp-plan/       # 00-README, 01-conventions, 02-context,
│                          # 10-phase-a-study, 98-questions, templates/
├── UPSTREAM.md            # pins: upstream snapshot @ fd878692 (0.14.5),
│                          # omp-src @ 65f79e76, ref-port @ c2ade4bb
└── refs/                  # gitignored reference clones: omp-src, ref-port,
                           # cursor-plugins. Never shipped, never committed.
```

## Hard rules (from pstack-omp-plan/01-conventions.md)

1. **Branding.** Shipped files (everything under `plugin/`) contain zero
   Claude/Anthropic branding: banned strings
   `claude`, `anthropic`, `sonnet`, `opus`, `haiku`, `.claude/`,
   `subagent_type`, `CLAUDE.md`, and `claude-*` model slugs, except in
   `CREDITS.md`. Kept names: `poteto-mode`, `comment-sicko`, `arena`,
   `swarm`, `interrogate`, `architect`, `unslop`, `de-slop`,
   `thermo-nuclear-code-quality-review`, `make-pr-easy-to-review`,
   `fix-ci`, `fix-merge-conflicts`, `get-pr-comments`,
   `what-did-i-get-done`, `teach`, `recall`, `reflect`, `babysit`,
   `autopilot-*`, `orchestrate`, `prototype`, `shipping`,
   `create-verification-skill`, `maintain-verification-skill`,
   `setup-pstack`, `typescript-best-practices`,
   `principle-*` — product names, not vendor branding.
   `scripts/branding-check.ts` enforces this; run it before any commit.
2. **Evidence rule.** Every OMP API claim cites `path:lines` from
   `refs/omp-src` (OMP 18.0.11 @
   `65f79e76fcc89b96632fe86a598f314bd7cfc725`). If an API is not
   there, it is unconfirmed: log it in `98-questions.md` and stop that
   thread. Do not guess signatures.
3. **Reference port.** `refs/ref-port` may be read **once per question**
   and only to see how a primitive was solved. It never overrides
   `refs/omp-src` or `upstream/pstack/`.
4. **Provenance frontmatter.** Every ported file starts with
   `upstream:` (path relative to the pinned tree), `upstream_sha:`
   (full 40-hex sha), `upstream_version:`, `status:`
   (`portable|adapted|omp-native|new`). Changing a `portable` file's
   wording flips it to `adapted`. Migration notes are **not** frontmatter:
   they live as `## <path>` sections in `PROVENANCE.md` (repo root) and are
   appended per sync via `scripts/extract-notes.ts` (idempotent; also the
   one-time migration that cut 102 `note:` fields). Frontmatter ships into
   every `skill://` read; notes are maintainer-only history.
5. **Skill frontmatter keys.** The tolerant OMP loader parses `name`,
   `description`, `license`, `compatibility`, `metadata`, `allowed-tools`, and
   the two hide keys at the top level. `name` must match the directory name.
   `de-slop` uses `name: de-slop` (source dir `de-slop`, `upstream:
   cursor-team-kit/skills/de-slop/SKILL.md`) — not a typo; do not "fix" it. The
   strict Agent Skills validator (`discovery/agent-plugin-format.ts:124-161`)
   runs only for roots carrying `plugin.json`, because classification keys on that
   file (`discovery/agent-plugin-format.ts:504-522`). This plugin ships
   `package.json`, not `plugin.json`, so OMP loads it through the `omp-plugins`
   provider and extra top-level keys survive.
6. **Hide flag.** Every skill a `skill://` pointer targets MUST carry
   `disable-model-invocation: true` at column 0, never under `metadata:`. OMP
   tests the top-level key with a strict comparison
   (`extensibility/skills.ts:113,260,298,399`), and `normalizeFrontmatterKeys`
   renames keys without lifting them out of `metadata`
   (`packages/utils/src/frontmatter.ts:21-43`). A nested or quoted copy is inert,
   so the skill renders into every system prompt. `scripts/skill-refs.ts` owns
   the rule, `scripts/fix-frontmatter.ts` applies it, and
   `scripts/validate-frontmatter.ts` enforces it.
7. **Agent schema.** `plugin/agents/*.md` need `name` + `description`
   (`discovery/helpers.ts:257-263`). Optional: `tools`, `spawns`,
   `model` (`"@task"`-style role aliases only, never vendor slugs),
   `output`, `thinkingLevel`, `readSummarize`, `blocking`, `prewalk`,
   `advisor`. `model`/`thinkingLevel`/`output` need the matching
   config keys in `config.yml`; `settings.json` does not gate them.

## OMP runtime facts (do not re-derive)

- OMP's subagent tool is **`task`**, not `Task`/`Agent`. No
  `subagent_type`, no `run_in_background`, no per-spawn
  `is_background`; the batch shape is `{context, tasks[]}` when
  `task.batch` (default true, `settings-schema.ts:4956-4958`);
  `effort` is per item, gated by `task.enableEffort` (default false,
  `:4968-4970`); `maxEffort` default `max` (`:5092-5095`).
- Bundled roles: `scout`, `designer`, `reviewer`, `security-reviewer`,
  `librarian`, `task` (default), `sonic` (`task/agents.ts:45-76`).
  `scout`/`sonic` budget 100, others 200; 1.5× budget → forced yield
  plus 5-request grace (`task/executor.ts:95-131`).
- Isolation: `task.isolation.mode` default `none`
  (`settings-schema.ts:4835-4849`); changes return as `patch`
  (`.patch` file) or `branch` (`task/isolation-runner.ts:149-152`).
- Extension APIs are all stock: `registerTool`, `registerCommand`,
  `registerShortcut`, `registerFlag`, `on(event, handler)` (30+
  events incl. `session_start`), `sendMessage`/`sendUserMessage`,
  `setModel`, `registerProvider` — all in
  `extensibility/extensions/types.ts:1236-1462` and
  `docs/extensions.md:126,134-174`.
- Skill roots: omp-managed (5) + native `.omp` (100) +
  `~/.omp/agent/managed-skills` (`discovery/builtin.ts:331-337`) +
  `.agent(s)/skills` (70) + `.codex/skills` (70) +
  `.claude/plugins/marketplaces` (70) +
  `.github/skills/<name>/SKILL.md` (30, `discovery/github.ts:325-329`).

## Current state (2026-08-31)

- Phase A study done: `findings/phase-a.md` holds all Discovery,
  Formats, task-tool, and Extension-API answers; conventions §6
  stock-vs-fork table filled — no fork-only rows, no blockers.
- `findings/matrix.md` fully classified: **zero `PORT` among the 61
  pstack-subtree components** (all ADAPT or NATIVE); the 7
  cursor-team-kit imports are PORT (6) / ADAPT (`thermo-nuclear`) with
  `e46364b` provenance; `make-bot-ui` is DROP (Cursor
  Routines/webhook primitives; de-scoped by user decision).
- Next: audit `findings/phase-c.md` against the matrix, move answered
  items in `98-questions.md` to Answered with evidence, commit
  everything, then the checkpoint-2 report.

## Verification

- Run `bun scripts/branding-check.ts` before any commit touching shipped files.
  It scans the `skills/`, `agents/`, `commands/`, `extensions/`, and `hooks/`
  trees under `plugin/`.
- Run `bun scripts/validate-frontmatter.ts` after editing any `SKILL.md`, then
  `bun scripts/hide-check.ts` to confirm the loader still reports the flag live.
- Run `bun scripts/autofire-check.ts` after touching `extensions/` or
  `hooks/`. A dead injector leaves the plugin reachable only by slash command.
- Never tick a "Done when" box in `pstack-omp-plan/` without re-running the checks.
- Do not port new components without evidence they exist under
  `upstream/pstack/` at `fd878692de15a3069c21c8f429eb0b9f2fe178fa` or
  `refs/cursor-plugins/cursor-team-kit/skills/` at the same sha. `UPSTREAM.md` is
  the pin of record.
