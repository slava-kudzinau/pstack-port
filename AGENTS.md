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
├── scripts/               # provenance.ts (catalog owner), classify-diff.ts,
│                          # branding/validate/hide/autofire checks
├── docs/                  # user-facing docs: install, commands, config
├── findings/              # one file per phase, the matrix, checkpoints
├── pstack-omp-plan/       # 00-README, 01-conventions, 02-context,
│                          # 10-phase-a-study, 98-questions, templates/
├── UPSTREAM.md            # pins: upstream snapshot @ efa2a531 (0.14.7),
│                          # cursor-plugins @ e46364b8, omp-src @ 65f79e76,
│                          # ref-port @ c2ade4bb
└── refs/                  # gitignored reference clones: omp-src,
                           # ref-port (= pstack-claude), cursor-plugins.
                           # Never shipped, never committed.
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
3. **Reference port.** `refs/ref-port` is
   `michael-denyer/pstack-claude`, the Claude Code port of pstack (pin in
   `UPSTREAM.md`). It may be read **once per question**
   and only to see how a primitive was solved. It never overrides
   `refs/omp-src` or `upstream/pstack/`.
4. **Provenance catalog.** Provenance never lives in shipped frontmatter:
   every `skill://` read ships those bytes to the model and the loader
   consumes none of them. The state is the `## Catalog` table in
   `PROVENANCE.md` (repo root): one row per shipped artifact, with `Path`
   (package-root-relative), `Upstream` (repo-root-resolvable path or
   `none`), `Sync` (8-char pin; full shas in `UPSTREAM.md`), and `Status`
   (`portable|adapted|omp-native|new`). Changing a `portable` file's
   wording flips its row to `adapted`. `scripts/provenance.ts --check`
   audits row/file parity and the invariants; `--migrate` appends rows for
   new artifacts and is idempotent (existing rows win). Migration notes
   are `## <path>` sections below the table, appended per sync, and never
   restate a row's claims.
5. **Skill frontmatter keys.** The tolerant OMP loader parses `name`,
   `description`, `license`, `compatibility`, `metadata`, `allowed-tools`, and
   the two hide keys at the top level. `name` must match the directory name.
   `de-slop` uses `name: de-slop` (our dir is `de-slop`, the upstream dir is
   `deslop`, and the catalog row carries that path) — not a typo; do not "fix"
   it. The
   strict Agent Skills validator (`discovery/agent-plugin-format.ts:124-161`)
   runs only for roots carrying `plugin.json`, because classification keys on that
   file (`discovery/agent-plugin-format.ts:504-522`). This plugin ships
   `package.json`, not `plugin.json`, so OMP loads it through the `omp-plugins`
   provider and extra top-level keys survive. This repo still rejects a
   non-empty `metadata:` block in shipped files (`scripts/validate-frontmatter.ts`);
   provenance belongs in the catalog.
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

## Current state (2026-09-16)

- Phases A through D are complete, and Phase F's file work is done through
  `findings/checkpoint-2.md`. Phase E was skipped; files alone covered everything it
  would have done. Phase F's live boxes stay open: the behavioral conformance suite
  and the clean-machine install.
- Upstream is synced to `efa2a531` (v0.14.7) from `fd878692` (v0.14.5);
  `findings/sync-0.14.7.md` holds the report. The substantive content
  landed at `23a56e2` (v0.14.6); the pinned commit's own delta is a
  `logo` line in `pstack/.cursor-plugin/plugin.json`.
- Catalog holds 137 artifacts, audited by `bun scripts/provenance.ts --check`.
- Owed: the 5 behavioral conformance prompts in
  `findings/conformance-live.md` (T3-T5 blank, plus baseline-model runs for
  T1-T2) and one clean-machine install worked from `docs/` alone.
- `WATCHDOG.yml` at the repo root is the shadow-advisor (watchdog) harness config for
  this session, supplied by the operator. It is not repo content and not an OMP
  artifact. Its one entry names a vendor model slug, so it stays gitignored: rule 1
  bans that slug in anything committed, and `scripts/branding-check.ts` scans only the
  trees under `plugin/`, so committing it would pass every check. Never track it.
- Next workstream: `pstack-omp-plan/70-claude-code-target.md` (units C1-C5),
  gated on the operator's explicit go.

## Verification

- Run `bun scripts/branding-check.ts` before any commit touching shipped files.
  It scans the `skills/`, `agents/`, `commands/`, `extensions/`, and `hooks/`
  trees under `plugin/`.
- Run `bun scripts/provenance.ts --check` before any commit: it audits the
  `## Catalog` table in `PROVENANCE.md` (row/file parity, status enum, upstream
  resolvability). New artifacts get rows via `bun scripts/provenance.ts --migrate`.
- Run `bun scripts/validate-frontmatter.ts` after editing any `SKILL.md` (it
  rejects non-empty `metadata:` blocks), then `bun scripts/hide-check.ts` to
  confirm the loader still reports the flag live.
- Run `bun scripts/autofire-check.ts` after touching `extensions/` or
  `hooks/`. A dead injector leaves the plugin reachable only by slash command.
- Run `bun scripts/orphan-scan.ts` after editing anything under `plugin/`.
  It resolves every `skill://<name>/<path>` asset pointer against disk and
  rejects cwd-relative companion paths. A token has to carry a `/` to count as a
  companion path, which is what keeps a bare `SKILL.md` mention from reading as a
  pointer at the file it sits in. Prove an asset resolves with this check, or with a
  selector read such as `skill://why/references/sources/slack.md:1-3`, never by
  dumping the whole file. OMP announces the skill directory only for an interactive
  `/skill:<name>` invocation
  (`refs/omp-src/packages/coding-agent/src/prompts/skills/user-invocation.md); a
  `skill://<name>` read serves raw bytes, so a relative path resolves against the
  reader's working directory and misses. Keep that kind of cite in repo docs: `refs/`
  is gitignored and never installed, so a shipped file must not point into it.
- Never tick a "Done when" box in `pstack-omp-plan/` without re-running the checks.
- Do not port new components without evidence they exist under
  `upstream/pstack/` at `efa2a531985e0a8084d36ff3cf87233be8a9f34b` or
  `refs/cursor-plugins/cursor-team-kit/skills/` at `cursor_plugins_sha`.
  `UPSTREAM.md` is the pin of record.

## Re-sync procedure

Steps verified by the 2026-09-02 sync to 0.14.7 (`efa2a531`).

1. `git -C refs/cursor-plugins fetch origin`, then list
   `git log --oneline <pin>..origin/main -- pstack/` and read every full
   diff before planning. Also check `cursor-team-kit/` against
   `cursor_plugins_sha`.
2. Verify `upstream/pstack/` is faithful to the old pin
   (`git archive <old> -- pstack | tar -x -C /tmp && diff -r`), then replace:
   `git archive <new> -- pstack | tar -x -C upstream` after deleting the old
   tree.
3. Update `UPSTREAM.md` from a `git rev-parse` output, never from memory.
   The Catalog `Sync` cell is the first **8** chars of the full sha; git's
   7-char abbreviation fails `--check`.
4. Triage every changed upstream file against its port file yourself before
   delegating: a model-slug rename landing on the port's configured-role
   phrasing is a port-side no-op. Delegate only real rewrites, batched by
   rewrite size, disjoint files, one shared conventions brief (role
   vocabulary, the canonical forge-resolution sentence, and the
   never-carried list: `paths:` frontmatter keys, `scripts/watch-pr`,
   `/loop`, the `Task` tool, model slugs). Delegates skip all checks and all
   git operations.
5. Flip Catalog pins on table rows only (pipe-anchored, `grep -F`; this
   box's grep treats `|` as alternation). Notes sections are append-only
   history: add a `## <path>` section with a `- sync: <full sha> (<version>)`
   bullet for every artifact whose upstream moved, including the no-ops with
   their reason.
6. Finish with every check above plus `bun scripts/classify-diff.ts`; expect
   `changed (portable): 0`.
