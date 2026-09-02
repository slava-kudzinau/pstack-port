# Conventions

## 1. Branding

Shipped files must contain **no** Claude or Anthropic branding.

Banned strings anywhere except `CREDITS.md`:

```
claude, anthropic, sonnet, opus, haiku, .claude/, subagent_type, CLAUDE.md
```

Model IDs also stay out of skill and agent text. Model choice belongs in user
config.

Kept: `omp`, `pi`, `.omp/`, and OMP agent roles.

Kept even though they sound like brands: `poteto-mode`, `comment-sicko`,
`arena`, `swarm`, `interrogate`, `architect`. These are Cursor pstack product
names, not vendor branding.

A local check script enforces this on every commit.

## 2. Command namespace

Commands register as `/pstack:<name>`, for example `/pstack:architect`. Short
aliases (`/architect`) are off by default; can be enabled through user config.

## 3. Repository layout

```
pstack-omp/
├── plugin/                # the shipped OMP package — the only dir you register
│   ├── package.json       # omp.extensions manifest slot
│   ├── skills/            # ported skills at the loading roots
│   │   └── <name>/SKILL.md
│   ├── agents/*.md        # task agents (task/discovery.ts:4-11)
│   ├── commands/*.md      # slash commands (task/commands.ts:66-109)
│   ├── extensions/*.ts    # session-start mandate injector, wired by package.json
│   └── hooks/*.md         # mandate text the injector reads
├── upstream/pstack/       # vendored Cursor snapshot, pinned sha, read-only
├── scripts/               # branding check, upstream diff, conformance suite
├── docs/                  # user-facing docs
├── findings/              # one file per phase
├── pstack-omp-plan/       # this plan, templates/ inside
└── UPSTREAM.md            # sha, version, sync date
```

Manifest key for extensions: `omp.extensions` (not the legacy `pi.extensions`).

Register only `plugin/` in the config `extensions:` list. OMP discovers the
capability directories as siblings of the registered directory's `package.json`
(`refs/omp-src/docs/skills/authoring-extensions.md:99`; `discovery/omp-plugins.ts:46`).

## 4. Provenance frontmatter

Every ported file (under `plugin/skills/`, `plugin/agents/`, or
`plugin/commands/`) starts with this block. The template is in
`templates/frontmatter.md`. The upstream diff
tool depends on it.

```yaml
---
upstream: pstack/skills/architect/SKILL.md
upstream_sha: 4a1c2f9e0b7d1c8e3a5b6d9f0a2c4e6b8d1f3a5c
upstream_version: 0.14.2
status: portable | adapted | omp-native | new
---
```

- `portable` — copied, wording unchanged. Auto-diff produces a proposed patch
  on sync; agent still reviews.
- `adapted` — runtime parts rewritten for OMP. Human review on every sync.
- `omp-native` — uses an OMP feature; no upstream equivalent.
- `new` — ours, no upstream link.

Changing a `portable` file's wording means changing its status to `adapted`.

`note:` is not a frontmatter field. Migration and sync notes live as
`## <path>` sections in `PROVENANCE.md` at the repo root. Frontmatter ships
into every `skill://` read; notes are maintainer-only history. The branding
check keeps no note exemption: the file lives outside the scanned trees.

Every `SKILL.md` that a `skill://` pointer targets also carries
`disable-model-invocation: true` at column 0, above `metadata:`. OMP reads only
the top-level key and compares it with `=== true`
(`extensibility/skills.ts:113,260,298,399`), and frontmatter key normalization
renames keys without lifting them out of `metadata`
(`packages/utils/src/frontmatter.ts:21-43`). A copy nested under `metadata:` is
inert, and the skill renders into every system prompt. `scripts/skill-refs.ts`
defines which skills must carry the flag, `scripts/fix-frontmatter.ts` writes it,
and `scripts/validate-frontmatter.ts` fails the audit without it.
`scripts/hide-check.ts` proves the loader honors it.

## 5. Upstream tracking

`cursor/plugins` is a monorepo with a live `main` and **no releases or tags**.
Pin to a **commit sha** of the repo (the whole sha, not the short form), and
vendor only the `pstack/` subtree — the rest is other plugins.

Record in `UPSTREAM.md`:

- `upstream_sha` — full sha of `cursor/plugins` at sync time (required)
- `upstream_version` — `version` field of `pstack/.cursor-plugin/plugin.json`
  if the file has one, otherwise the short sha (human label)
- `upstream_synced_at` — ISO date

Same two fields appear in every ported file's frontmatter
(`templates/frontmatter.md`).

Version story: `pstack-omp 0.1.x pinned at cursor/plugins@<short-sha>`.

Do not vendor the whole `cursor/plugins` repo. Vendor `pstack/` only. If we
ever port `deslop` or the `control-*` skills, we vendor from the
`cursor-team-kit/` sibling directory as a separate pin.

## 6. Verifying OMP APIs

Local OMP source is the primary reference. Docs are secondary.

**Evidence rule.** A question moves from `98-questions.md` to answered only
with a file path and a line range. No path, no answer.

**Internal-API test.** If an API exists in source but not in docs or any
bundled example, treat it as internal. Log it and look for a supported
alternative.

**Pin the checkout.** Record the OMP commit sha alongside the version in
`findings/phase-a.md`. Without a sha, signatures go stale silently.

**Stock vs fork.** For every OMP API the design depends on:

| API | Stock OMP? | Evidence (path:lines) | Fallback if fork-only |
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

Filled in Phase A. Any row marked fork-only with no fallback is a blocker.
