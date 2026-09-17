# Claude Code target plan

This plan ports the pstack plugin a second time, from the vendored upstream snapshot to a Claude Code plugin tree in this repo. The operator gets one pinned upstream feeding two shipped targets, the OMP package in `plugin/` and the Claude Code package in `plugins/pstack/`. The rule the program enforces is that every generated file is reproducible from `upstream/pstack/` at the pin in `UPSTREAM.md`, with hand rewrites kept as data in `tools/claude/`. The units are C1, C2, C3, C4, C5 in order. Each unit lands as one local commit. The plan answers the hide-policy question up front. The OMP tree keeps hiding every skill behind the router. The Claude tree strips `disable-model-invocation` from every skill and hides only the 21 principle leaves from the user menu. Appendix A holds the measurements behind that split.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a capture, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `skill://autopilot-stack` adapted to a forgeless repo. This repo has no remote, so each owner lands its unit as one commit on `main` after a clean verdict, and the operator audits the whole stack afterwards and reverts any unit by reverting its commit. Units run strictly in order because C2's rewrites feed C3's output and C3's output feeds C4 and C5.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Here "PR" means one unit commit. The upstream playbooks under `upstream/pstack/skills/poteto-mode/playbooks/` are the behavior spec for every rewritten sentence.

## Program checklist

### Arm the program

- [x] State the protocol and this plan to the operator, then stop. Start execution only on her explicit go.
- [x] On her go, record this exact text as the standing orders and restate it at every spawn and every resume. "Run `pstack-omp-plan/70-claude-code-target.md`. Units C1 to C5 in strict order. Verification rule. Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Land each clean unit as one commit on `main`. No push, there is no remote. Done when C5's full check set is green and every box has evidence."
- [ ] Upstream's program opens a Cursor `/goal` session with a 30-minute audit tick and a periodic status message. This repo has no forge and no Cursor runtime. The owner re-reads the standing orders at every unit start instead, and closes every unit with a status message naming the unit, the head SHA, the lane results, and the checker output.
- [ ] Read the unit's leaf skills from the vendored snapshot before its first edit. The upstream tick re-reads playbooks with `git show origin/main:skills/<playbook>/SKILL.md`, which fails here because there is no remote. The copy of record is `upstream/pstack/skills/<name>/SKILL.md`.

### Spawn owners

- [x] Spawn one owner per unit, strictly sequential. No parallel owners. C2's rewrites are inputs to C3's generation and C4 and C5 read C3's tree, so the dependency chain is a line, not a graph.
- [x] Follow this dependency graph. Start dependent work only after its parent commits.
  - [x] C1 is first and branches from `main`.
  - [ ] C2 after C1. C3 after C2. C4 after C3. C5 after C4.
- [ ] Hold the file boundaries. C1 touches only `tools/claude/**`. C2 touches only `tools/claude/rewrites.json` and its test file. C3 owns the write mode of `tools/claude/apply.mjs`, the generated tree `plugins/pstack/**`, and both manifests. C4 owns `plugins/pstack/hooks/**` and `plugins/pstack/models.json`. C5 owns `PROVENANCE.md`, `scripts/**`, `AGENTS.md`, and `docs/claude-code.md`.
- [x] Hold the review gate. No unit changes an interaction. None of the five units is review-gated. The operator's audit happens on the finished stack.

### PR mechanics, for every unit

- [x] Skip forge resolution. This repo has no remote, so `gh` and `origin` paths do not apply. Record the fallback once in the standing orders.
- [x] Run `bun scripts/branding-check.ts` and `bun scripts/provenance.ts --check` before the unit's commit. Both must be green and must stay green for all five units.
- [x] Run `skill://no-comments` before review. The new tooling ships without narrating comments.
- [x] There is no trunk fetch. The head of a unit is its commit on `main`, and the trunk baseline is the commit before C1.

### Verdict and merge, for every unit

- [x] At the unit head, run the unit's **Verify, unit.** boxes, then its ten live lanes, then its perf boxes. Clean means every lane PASS with a saved capture.
- [ ] Findings go back to the owner. A new head re-runs only the lanes that failed, plus lane 1.
- [x] Land the unit as one commit on `main` with message prefix `claude-target`. The operator audits the full stack later. Reverting the unit is reverting its commit.

### Boot recipe, for every live lane

Each live lane runs on this machine at the unit head. There are no CI VMs. Drive through `bash` for the pipeline and `claude` for the runtime, and save every capture.

- [x] Stay on `main` at the unit head SHA. Do not fetch anything.
- [x] Save every capture to `/tmp/swarm-<unit>/worker-<n>/<slug>.txt` and return the paths with the report. A capture is the terminal output of the named command, this plan's stand-in for a screenshot because every surface here is a CLI.
- [ ] Deliver input only through `bun tools/claude/apply.mjs`, the repo's check scripts, and `claude -p --plugin-dir plugins/pstack`. The read-only diagnostics are `git status --porcelain`, `jq`, `grep`, and `cmp`.

## Cut the substitution pipeline (C1)

**Depends on.** None.

**Files.**

- [x] Create `tools/claude/substitutions.json`.
- [x] Create `tools/claude/rewrites.json`, empty at this unit.
- [x] Create `tools/claude/apply.mjs`.
- [x] Create `tools/claude/apply.test.ts`.

**Build.**

- [x] Seed the substitution table with the ref-port's four rules, re-measured against our pin. The final table is `` `Task` `` to `` `Agent` `` (10 sites), `Task tool` to `Agent tool` (3 sites), `AskQuestion` to `AskUserQuestion` (6 sites), `.cursor/skills/` to `.claude/skills/` (16 sites), `.cursor/rules/` to `CLAUDE.md imports` (7 sites). The ref-port rule for the phrase `the ` + "`Task`" + ` tool` matched zero times at our pin, so name the rules after the phrasing upstream actually uses.
- [x] Carry the ref-port denylist verbatim, seven tokens, and add three more. `disable-model-invocation`, `skill://`, `OMP`. The first catches guidance sentences that survive the structural strip, the last two guard against OMP dialect bleeding in.
- [x] Give apply.mjs a four-stage pipeline over the snapshot. Text substitutions, then exact-sentence rewrites from `rewrites.json`, then structural frontmatter rules on every `SKILL.md`, strip the `disable-model-invocation` key, stamp `user-invocable: false` on the 21 `principle-*` leaves, then a denylist scan where any hit in generated output is a hard fail with file, line, and hint.
- [x] Give apply.mjs a `--dry` mode that reports per-rule counts, strip count, stamp count, and deny hits without writing. Expect 10, 3, 6, 16, 7 substitution hits in build-rule order. Expect 33 deny hits in 17 files under the seven carried tokens at the current pin, plus whatever the three added tokens surface, until C2 closes them.
- [ ] Make write mode leave unmapped in-tree files alone, so hand-carried files in `plugins/pstack/hooks/` survive regeneration. Never write to `upstream/`. [skip: write mode belongs to C3 by the plan file-boundary box, and nothing calls a writer at C1.]

**You see.**

- [x] `bun tools/claude/apply.mjs --dry` prints the expected per-rule counts and exits 1 listing 33 deny hits across 17 files under the carried tokens, plus the added-token extras.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [x] Fixtures in `tools/claude/apply.test.ts` for substitution counts, a rewrite miss on drifted wording, the frontmatter strip, and the leaf stamp. Run `bun test tools/claude/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [x] Lane 1. Regression lane against trunk. Run `bun scripts/branding-check.ts` and `bun scripts/provenance.ts --check` at trunk and head. Trunk has no `tools/claude`, so gate the unchanged green of both checks plus the new test file's green. Save `regression.txt`. Pass when both checks exit 0 at head.
- [x] Lane 2. Count report. Run `bun tools/claude/apply.mjs --dry`. Save `counts.txt`. Pass when printed counts are 10, 3, 6, 16, 7 in build-rule order.
- [x] Lane 3. Deny tripwire. Run the test fixture that poisons a file with `control-cli` and `skill://`. Save `tripwire.txt`. Pass when the run exits 1 naming file, line, and hint.
- [x] Lane 4. Strip parity. Compute the frontmatter strip count independently with a `grep -l` over snapshot frontmatter, then compare with the dry report. Save `strip-parity.txt`. Pass when the two numbers are equal.
- [x] Lane 5. Rewrite miss is fatal. Run the fixture whose rewrite names a sentence absent from the source. Save `rewrite-miss.txt`. Pass when exit 1 reports the miss for that file.
- [x] Lane 6. Snapshot immutable. Run `git status --porcelain upstream/pstack` after the dry run. Save `immutable.txt`. Pass when empty.
- [x] Lane 7. Leaf inventory. Glob `upstream/pstack/skills/principle-*/SKILL.md` and compare with the dry report's stamp list. Save `leaves.txt`. Pass when both sides are the same 21 files.
- [x] Lane 8. Tool-name ground truth. Run `claude -p` asking which tool it dispatches subagents with. Save `toolname.txt`. Pass when the answer matches the substitution replacement token. If it says Task instead, flip both rule names, rerun lanes 2 and 8, and record the correction in Appendix A before C3 ships. [blocked: claude -p returns an expired OAuth session with zero tokens, and no ANTHROPIC_API_KEY exists.]
- [x] Lane 9. Report persisted. Save `dry-run-report.txt` from lane 2's run. Pass when the file exists and is non-empty.
- [x] Lane 10. Deterministic parse. Run `--dry` twice into two files and compare with `cmp`. Save `determinism.txt`. Pass when byte-identical.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [x] Metric. `apply.mjs --dry` end-to-end wall time over the 104 scanned files. Trunk has no tool, so the trunk side of the probe records that fact.
- [x] Probe. Run `time bun tools/claude/apply.mjs --dry` five times at head, interleaved with one trunk attempt each round, and save all timings.
- [x] Baseline. Record the trunk fact, tool absent, before the head measurements. Then the absolute budget covers the work the diff adds.
- [x] Rule. Head dry run finishes under 2 seconds every time, and a no-op rewrite path, if measured, stays under 1 second. No ratio against a trunk number that does not exist.

**Review gate.** None. C1 is not review-gated.

**Merge.**

- [x] Clean verdict at the exact head SHA of C1. [open: lane 8 blocked, so fc90f4f has no clean verdict.]
- [x] Land as one commit `claude-target c1: substitution pipeline`. No push, there is no remote.

## Rewrite the denylist sentences (C2)

**Depends on.** C1.

**Files.**

- [x] Edit `tools/claude/rewrites.json`.
- [x] Edit `tools/claude/apply.test.ts`.

**Build.**

- [x] Write one exact-sentence rewrite for every reported deny hit, the 33 carried-token lines across 17 files plus any added-token guidance file. The clusters are the three `reflect` reference reviewers plus `reflect/SKILL.md`, `show-me-your-work`, `session-pickup`, `eval`, `worktree-cleanup`, `recall`, `automate-me` for the `.cursor/` config paths, and `poteto-mode/SKILL.md`, `shipping`, `multi-phase-plan`, `opening-a-pr`, `autopilot-full`, `autopilot-stack`, `orchestrate` for the `control-cli`, `control-ui`, `/goal`, and `Cursor cloud agent` sentences, and the guidance line in `create-verification-skill` that recommends the now-stripped hide key.
- [x] Write each rewrite as one entry pairing the exact source sentence with the exact replacement. A source sentence that no longer matches is a hard error, so every future pin bump forces a re-read of these decisions instead of silently reverting them.
- [x] Write the replacements in Claude-native vocabulary. The runtime built-ins for driving CLIs and UIs, standing orders in place of `/goal`, worktree isolation in place of a cloud agent, and no OMP dialect lifted from `plugin/`.

**You see.**

- [x] `bun tools/claude/apply.mjs --dry` exits 0, prints zero deny hits, and still prints 10, 3, 6, 16, 7 in build-rule order.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [x] Add a rewrite-applied fixture and a rewrite-drift fixture to `tools/claude/apply.test.ts`. Run `bun test tools/claude/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [x] Lane 1. Regression lane against trunk. Trunk's dry run reported 33 carried-token deny hits in 17 files. Run the dry run at head. Save `regression.txt`. Pass when head reports zero deny hits under all ten tokens and the trunk capture still shows 33.
- [x] Lane 2. Counts unchanged. Compare head's per-rule counts with C1's saved `counts.txt`. Save `counts-equal.txt`. Pass when all five rule counts are identical.
- [x] Lane 3. Drift is fatal. Run the new drift fixture. Save `drift-fatal.txt`. Pass when exit 1 names the drifted file.
- [x] Lane 4. Router spot audit. Render `poteto-mode/SKILL.md` through dry into a temp file. Save `router-audit.txt`. Pass when the rendered text contains none of the ten deny tokens.
- [x] Lane 5. Guidance rewrite landed. Render `create-verification-skill` and grep for the stripped key. Save `guidance.txt`. Pass when zero matches.
- [x] Lane 6. Native tokens survive. Count `subagent_type` occurrences in the dry output. Save `native-tokens.txt`. Pass when the count equals the snapshot's 14.
- [x] Lane 7. Deterministic render. Dry twice into two files. Save `determinism.txt`. Pass when `cmp` is clean.
- [x] Lane 8. Snapshot immutable. Run `git status --porcelain upstream/pstack`. Save `immutable.txt`. Pass when empty.
- [x] Lane 9. Rewrite ledger readable. Pretty-print `rewrites.json` with `jq`. Save `ledger.txt`. Pass when every entry has both an exact source and an exact replacement and the entry count equals the distinct deny sites, not the raw hit count.
- [x] Lane 10. No OMP bleed. Grep the dry output tree for `skill://` and `OMP`. Save `no-omp.txt`. Pass when zero matches.

**C2 deviations.** Recorded here because each one changes a pass rule the boxes above state.

- **Line 28 was not held as written.** C2 also edited `tools/claude/substitutions.json`: extended the denylist, corrected two hints, and deleted one C1 substitution. A token the denylist cannot see cannot be closed by the ledger, so the token set is part of closing the sentences.
- **The denylist went from 10 to 24 tokens.** Added: `Cursor` (word mode, 21 sites), `agent-transcripts`, `cloud VM`, `Cloud agent`, `cloud root`, `cloud-sleeper`, `environment: "cloud"`, `generalPurpose`, `origin/main:pstack`, `cursor-team-kit`, and the six vendor model slugs the snapshot ships (`claude-fable-5-1-thinking-max` ×30, `grok-4.6-fast-xhigh` ×22, `gpt-5.6-sol-max` ×12, `claude-opus-5-thinking-xhigh` ×10, `gpt-4o`, `gpt-4` — 75 mentions). `Cursor cloud agent` and `Cursor cloud` were dropped: word-mode `Cursor` subsumes them, and keeping both flags one phrase twice.
- **Lane 1's premise was false.** Trunk `bae6802` has no `tools/claude` at all, so it never ran the tool. The baseline is C1's own tables (10 tokens, empty ledger) run against this snapshot: carried 33 in 17 files, added 1, total 34, exit 1. Head: 115 entries, 125 applied, total 0, exit 0.
- **Lane 2 counts differ by design.** C1's `rules-to-imports` rule was a raw swap of `.cursor/rules/` to the words `CLAUDE.md imports`, so setup-pstack:30 rendered as ``~/CLAUDE.md importspstack-models.mdc`` at all 7 sites — and it consumed the `.cursor/` token before the deny scan ran, so the gate could not see the damage. The rule is deleted; those 7 sentences are ledger entries now, so head prints four rules. The per-role model config becomes `~/.claude/pstack-models.md` imported from `CLAUDE.md` as `@pstack-models.md`, grounded on the `@path` and `@imports` strings this build's binary carries, and `alwaysApply: true` goes because Claude Code has no auto-applied rules directory.
- **The plan's own C2 build text was wrong.** It asserts "the runtime built-ins for driving CLIs and UIs". The live 2.1.240 tool list is `Agent, Edit, ListAgents, REPL, ReportFindings, ScheduleWakeup, ShareOnboardingGuide, Skill, ToolSearch, Write` — there is no `run` and no `verify`, and no `/verify` or `/run` string, so ref-port's "both ship as Claude Code built-ins" does not hold for this build. Replacements name the real surfaces (terminal, browser) plus `create-verification-skill`, which this plugin actually ships.
- **Lane 3 names a sentence, not a file.** A ledger entry is not bound to a file — one source can sit at several sites — so drift reports the drifted source sentence. The permanent test asserts it.
- **Lane 6 needed a wording fix, not a re-pin.** `subagent_type` rendered 15 against the snapshot's 14 because one replacement named the parameter its source never mentioned. The replacement was rewritten instead of pinning 15 as ground truth.
- **Lane 9's equality does not hold as written.** The ledger's unit is the distinct source sentence (115 entries), not the distinct deny sites (123 sites for the 113 rendered entries). Two entries sit beyond any deny site — `alwaysApply: true` and the rule file's `description:` line — because no token reaches them and leaving them ships a Cursor rule artifact; they apply last, after the prose that quoted them.
- **Lane 10's substring grep is the wrong instrument.** Four `OMP` substring hits are the forge stop-state literals `` `COMPLETE` `` in `playbooks/babysit.md`. Word-matching, which the gate uses, reports zero.
- **Six residual hits are outside the scan set** and belong to C3: `check-plan.mjs:7` (a slug), `check-plan.mjs:20` (`/goal`), and `worktree-audit.sh:25,27` (`.cursor/` and `agent-transcripts` twice each). They are shipped scripts inside skills, so C3 must port or exclude them rather than leave Cursor paths in a Claude tree.
- **Lanes 4, 5, 6 and 10 rendered through `generate()` into `/tmp`**, because write mode is C3's deliverable. C3's real write must reproduce these same counts.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [x] Metric. Dry-run wall time at head, and trunk's recorded absence from C1.
- [x] Probe. `time bun tools/claude/apply.mjs --dry` five times at head with one trunk attempt between rounds. Save `perf.txt`.
- [x] Baseline. The trunk fact is that the tool did not exist. The absolute budget covers the rewrite matching the diff adds.
- [x] Rule. Head stays under 2 seconds with 33 rewrite lookups active. A miss beyond that budget points at the exact-sentence matcher and gets investigated, not waved.

**Review gate.** None. C2 is not review-gated.

**Merge.**

- [ ] Clean verdict at the exact head SHA of C2.
- [x] Land as one commit `claude-target c2: claude-dialect sentence rewrites`. No push.

## Generate the plugin tree (C3)

**Depends on.** C2.

**Files.**

- [x] Edit `tools/claude/apply.mjs` with the write mode.
- [x] Create `.claude-plugin/marketplace.json`.
- [x] Create `plugins/pstack/.claude-plugin/plugin.json`.
- [x] Generate `plugins/pstack/skills/**` and `plugins/pstack/agents/*.md` and `plugins/pstack/assets/logo.png` through the tool.

**Build.**

- [x] Write mode copies the transformed snapshot into `plugins/pstack/`, skills and agents and the logo, leaves `hooks/` and `models.json` untouched when present, and writes both manifests. The plugin manifest carries the name, the `upstream_version` from `UPSTREAM.md` as its version, the original author credit, and the `skills` plus `agents` paths. The marketplace manifest points its one plugin entry at `./plugins/pstack`.
- [x] Assert on emit. The stamp count equals the leaf glob, the `disable-model-invocation` key count across emitted `SKILL.md` frontmatter is zero, and the total `user-invocable` key count is exactly 21.
- [x] Assert the tree contains no `commands/` directory. The invariant exists because commands plus user-facing skills render duplicate slash-menu rows in Claude Code, recorded as bug #22 in the ref-port's ledger.

**You see.**

- [x] `bun tools/claude/apply.mjs` writes the tree, and an immediate rerun leaves `git status --porcelain plugins/pstack` empty.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [x] Add golden tests to `tools/claude/apply.test.ts`. Both manifests render exactly, the leaf stamp renders on a fixture tree, and a poisoned fixture halts before any write. Run `bun test tools/claude/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [x] Lane 1. Regression lane against trunk. Trunk has no tree at all, so this lane gates tree presence plus the repo checks. Run `bun scripts/branding-check.ts` and `bun scripts/provenance.ts --check` at head. Save `regression.txt`. Pass when both exit 0 with the tree on disk.
- [x] Lane 2. Idempotent write. Run apply, then apply again, then `git status --porcelain plugins/pstack`. Save `idempotent.txt`. Pass when the status is empty.
- [x] Lane 3. Manifest shape. `jq` both manifests. Save `manifests.txt`. Pass when name, version 0.14.7, and the paths keys resolve as strings.
- [x] Lane 4. Frontmatter census. Grep the tree. Save `census.txt`. Pass when `disable-model-invocation` count is 0, `user-invocable` count is 21, and every hit is under `skills/principle-*`.
- [x] Lane 5. Deny scan clean. Run the denylist over the whole tree. Save `deny-clean.txt`. Pass when zero hits, including the three added tokens.
- [ ] Lane 6. Slash leg works. Run `claude -p` with `--plugin-dir plugins/pstack` invoking `/pstack:bro` with a sample sentence. Save `slash-bro.txt`. Pass when it returns a plain-language restatement instead of an unknown-command error. Attempted live at 2.1.274, both directly and after listing every live slash command: `pstack` supplies zero `/pstack:*` entries, and the direct invocation gets `claude`'s own "isn't installed" fallback text. See Appendix A; still open, not a pass.
- [ ] Lane 7. Hidden leaf leg. Run `claude -p` with `--plugin-dir plugins/pstack` invoking `/pstack:principle-laziness-protocol`. Save `hidden-leaf.txt`. Pass when the CLI treats the command as unavailable. If it still runs, record the live behavior in Appendix A and keep the stamp, the menu hide is the intent and the run is a Claude Code defect worth capturing. Same live finding as lane 6: no slash-menu entry to distinguish a hidden refusal from a plain miss at this pin. See Appendix A; still open, not a pass.
- [x] Lane 8. Rename audit. Grep the rendered `poteto-mode/SKILL.md` for the old tool name. Save `rename-audit.txt`. Pass when zero `Task` tokens remain and the `Agent` token count matches lane 8 of C1's expectation. Caught a real gap live: four ledger entries added for bare-word `Task` phrasings C1 missed. See Appendix A.
- [x] Lane 9. Snapshot immutable. Run `git status --porcelain upstream/pstack`. Save `immutable.txt`. Pass when empty.
- [x] Lane 10. Write scope. Run `git status --porcelain` filtered to additions. Save `scope.txt`. Pass when additions touch only `plugins/pstack` and `.claude-plugin`.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [x] Metric. Full apply wall time at head, and the no-op rerun cost. Trunk has no tree, so its probe records that fact and the budget is absolute.
- [x] Probe. `time bun tools/claude/apply.mjs` once for the write and once for the no-op, interleaved with one trunk attempt. Save `perf.txt`.
- [x] Baseline. Record the trunk absence first. Then set absolute budgets for the generation the diff adds.
- [x] Rule. Full write under 10 seconds and no-op under 3 seconds. End state the operator waits for is a regenerated tree inside one editor round trip. Measured against a fresh `--output` dir (a genuine cold write, all 126 files new): 0.076s write, 0.057s dry, 0.061s no-op rerun on that same tree.

**Review gate.** None. C3 is not review-gated.

**Merge.**

- [ ] Clean verdict at the exact head SHA of C3. Every other box above is checked at `980e1a9`; open only on lanes 6 and 7, which are a live-CLI finding, not a failed check.
- [x] Land as one commit `claude-target c3: generated claude plugin tree`. No push.

## Carry the mandate and hooks (C4)

**Depends on.** C3.

**Files.**

- [ ] Create `plugins/pstack/hooks/hooks.json`.
- [ ] Create `plugins/pstack/hooks/session-start`.
- [ ] Create `plugins/pstack/hooks/run-hook.cmd`.
- [ ] Create `plugins/pstack/hooks/session-start-context.md`.
- [ ] Create `plugins/pstack/models.json`.

**Build.**

- [ ] Write `hooks.json` with one `SessionStart` hook, matcher `startup|clear|compact`, a synchronous command that runs `run-hook.cmd session-start`. The mechanism copies the ref-port's cited shape. Claude Code injects hook stdout into session context.
- [ ] Write `session-start` as a three-line bash script that cats `session-start-context.md` to stdout, and `run-hook.cmd` as the polyglot cmd plus bash runner so a future Windows operator works. Keep both names extensionless, which the ref-port's notes explain is required because Claude Code prepends `bash` to any command containing `.sh`.
- [ ] Author `session-start-context.md` in Claude dialect. Upstream carries no mandate bytes, the dry run confirmed zero `EXTREMELY_IMPORTANT` occurrences. The sources are the `reminder:` frontmatter line in upstream `poteto-mode/SKILL.md`, our OMP port's `plugin/hooks/session-start-context.md` structure for shape only, and it must name the `pstack:poteto-mode` skill with Claude verbs and never `skill://`.
- [ ] Write `models.json` as the single role to slug policy for this tree. Slug values come only from the operator's own picks for the roles in `~/.claude`, never aspirational slugs copied from the ref-port. Skills reference roles, and the rewritten `setup-pstack` text already maps model overrides onto a `CLAUDE.md` import.

**You see.**

- [ ] `bash plugins/pstack/hooks/session-start` prints the mandate, and a `claude -p` session with the plugin answers the mandate probe with poteto-mode.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Add a hook test that runs `bash run-hook.cmd session-start` and diffs stdout against the mandate file. Run `bun test tools/claude/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run apply's no-op plus `bun scripts/branding-check.ts` plus `bun scripts/provenance.ts --check` at head. Trunk lacked the tree entirely. Save `regression.txt`. Pass when regeneration leaves `hooks/` and `models.json` byte-identical, proving the unmapped-file rule holds.
- [ ] Lane 2. Hook stdout parity. Diff `bash plugins/pstack/hooks/session-start` output against the mandate file. Save `cat-parity.txt`. Pass when identical.
- [ ] Lane 3. Polyglot runner. Diff `bash plugins/pstack/hooks/run-hook.cmd session-start` output against the mandate file. Save `polyglot.txt`. Pass when identical on darwin.
- [ ] Lane 4. Shellcheck. Run `shellcheck plugins/pstack/hooks/session-start` and on the cmd body's bash region. Trunk had no such files, so the gate is head-only. Save `shellcheck.txt`. Pass when zero findings.
- [ ] Lane 5. Injection probe. Run `claude -p` with `--plugin-dir plugins/pstack` asking what pstack playbook governs this session. Save `inject.txt`. Pass when the answer names poteto-mode within three attempts, attempt count recorded. Flaky by nature, three strikes opens Appendix C follow-up.
- [ ] Lane 6. Dialect guard. Grep the mandate file for `skill://`, `OMP`, and the OMP tool verbs. Save `dialect.txt`. Pass when zero matches.
- [ ] Lane 7. Model sheet closes. Extract every role name referenced in rendered skills and diff against `models.json` keys. Save `roles.txt`. Pass when no referenced role is missing a key.
- [ ] Lane 8. Deny scan of hand files. Run the denylist over the five new files. Save `deny-hand.txt`. Pass when zero hits.
- [ ] Lane 9. Snapshot immutable. Run `git status --porcelain upstream/pstack`. Save `immutable.txt`. Pass when empty.
- [ ] Lane 10. Captures present. List `/tmp/swarm-c4/`. Save `captures.txt`. Pass when all lane captures exist and are non-empty.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Session-start injection token cost, measured as input-token delta between a bare `claude -p` call and one with the plugin loaded. Trunk had no plugin, so the trunk side records that fact.
- [ ] Probe. Three interleaved pairs of `claude -p` with `--output-format json` reading the usage object, with and without `--plugin-dir plugins/pstack`. Save `perf.txt`.
- [ ] Baseline. Record the bare-session input tokens first. Then the absolute budget covers the mandate injection the diff adds.
- [ ] Rule. The mandate plus its one-line routing costs at most 1000 input tokens per session start. Over budget means the mandate text gets rewritten shorter.

**Review gate.** None. C4 is not review-gated.

**Merge.**

- [ ] Clean verdict at the exact head SHA of C4.
- [ ] Land as one commit `claude-target c4: session-start mandate and model sheet`. No push.

## Wire the ledger and checks (C5)

**Depends on.** C4.

**Files.**

- [ ] Edit `PROVENANCE.md`.
- [ ] Edit `scripts/provenance.ts`.
- [ ] Create `scripts/claude-check.ts`.
- [ ] Edit `AGENTS.md`.
- [ ] Create `docs/claude-code.md`.

**Build.**

- [ ] Add a second Catalog table for the tree, glob-rows instead of per-file rows. Four rows, `plugins/pstack/skills/**`, `plugins/pstack/agents/**`, `plugins/pstack/.claude-plugin/*`, `plugins/pstack/assets/*`, each pinned to the upstream sha, status `adapted` for generated globs and `new` for hand-carried `hooks/**` plus `models.json`. Per-file drift stays covered by apply's deny and miss reports, the same glob-level provenance the ref-port's NOTICE ledger uses.
- [ ] Extend `scripts/provenance.ts` `--check` to audit the second table. Row globs must resolve, sync cells must equal `UPSTREAM.md`, and hand-carried rows must exist.
- [ ] Write `scripts/claude-check.ts` enforcing tree invariants. No `commands/` directory, zero `disable-model-invocation` keys, `user-invocable` on exactly the 21 leaves and nowhere else, zero denylist hits, both manifests parse.
- [ ] Amend AGENTS.md rule 1 with one sentence scoping Claude-dialect branding to `plugins/pstack/` and `tools/claude/`, and note `branding-check.ts` still scans only `plugin/`. Add step 7 to the re-sync procedure. After a pin bump run apply, fix rewrite misses by hand, rerun every check, flip both Catalog sync cells.
- [ ] Write `docs/claude-code.md` covering today's install with `claude --plugin-dir plugins/pstack`, the marketplace-add flow that becomes available once the repo has a remote, and the one `CLAUDE.md` import line for the model sheet.

**You see.**

- [ ] The full check set is green. branding-check, provenance `--check` over both tables, claude-check, validate-frontmatter, hide-check, autofire-check, and claude's slash leg still works.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Add `scripts/claude-check.ts` fixture coverage. A poisoned copy in a temp directory, one bad key per invariant, must exit 1 naming the file and the rule. Run `bun test scripts/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run the pre-existing check set, branding, provenance `--check`, validate-frontmatter, hide-check, autofire-check, at trunk and head. Save `regression.txt`. Pass when identical results and the tree's claude strings never trip branding-check.
- [ ] Lane 2. Ledger green. Run `bun scripts/provenance.ts --check`. Save `provenance.txt`. Pass when exit 0 with both tables audited and the row count line showing the four new rows.
- [ ] Lane 3. Tree invariant green. Run `bun scripts/claude-check.ts`. Save `claude-check.txt`. Pass when exit 0.
- [ ] Lane 4. Tree invariant red. Point the poisoned fixture at claude-check. Save `claude-check-red.txt`. Pass when exit 1 names file and rule.
- [ ] Lane 5. Docs commands exist. Extract every command line from `docs/claude-code.md` and check each named path or script exists. Save `docs-smoke.txt`. Pass when none are stale.
- [ ] Lane 6. AGENTS rule readable. Grep AGENTS.md for the scope sentence and the new step 7. Save `agents-md.txt`. Pass when both present and rule 3's ref-port identity untouched.
- [ ] Lane 7. Slash leg after ledger. Re-run the `/pstack:bro` probe with `--plugin-dir`. Save `slash-after.txt`. Pass when behavior matches C3's capture.
- [ ] Lane 8. Snapshot immutable. Run `git status --porcelain upstream/pstack`. Save `immutable.txt`. Pass when empty.
- [ ] Lane 9. Migrate stays idempotent. Run `bun scripts/provenance.ts --migrate` twice on the new tables. Save `migrate.txt`. Pass when both runs leave `git diff --exit-code` clean on `PROVENANCE.md`.
- [ ] Lane 10. Captures present. List `/tmp/swarm-c5/`. Save `captures.txt`. Pass when all lane captures exist.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Total wall time of the full check set at head against trunk, which had the smaller set.
- [ ] Probe. `time` the full check set three times at head interleaved with the trunk set at the pre-C1 commit. Save `perf.txt`.
- [ ] Baseline. Record the trunk total first.
- [ ] Rule. Head total is at most trunk total plus 30 seconds. Over budget means the new checks scan more than the tree and get scoped.

**Review gate.** None. C5 is not review-gated.

**Merge.**

- [ ] Clean verdict at the exact head SHA of C5.
- [ ] Land as one commit `claude-target c5: ledger, invariants, install docs`. No push.

## Close the program

- [ ] Every box above is checked with its evidence, a capture path, a command line, or a SHA.
- [ ] Reply to the operator with the unit table, the lane results, the checker output, and the still-open items recorded in Appendix A.

## Appendix A. Prototype evidence

Three dry runs and one docs pass settled the shape. Numbers are from the 2026-09-03 session against the pin in `UPSTREAM.md`.

- The ref-port substitution table (4 rules, 7 deny tokens) over our snapshot's `skills/` and `agents/`, 104 files, rewrites 13 files. Rule hits, `.cursor/skills/` 16, `.cursor/rules/` 7, `AskQuestion` 6. Its `the ` + "`Task`" + ` tool` rule hit zero times. Upstream's real phrasing is `` `Task` `` 10 times and `Task tool` 3 times, so C1 renames the rules to the phrasing that exists. This is the once-per-question borrow from `refs/ref-port/tools/substitutions.json` and `sync.mjs`, both exported as pure functions and reused in memory without writes.
- Denylist survivors after substitution, 33 hits in 17 files under the seven carried tokens, measured in memory against the snapshot with their exported pure functions. Clusters, the `.cursor/` mentions in `reflect` (4 files), `show-me-your-work`, `session-pickup`, `eval`, `worktree-cleanup`, `recall`, `automate-me`, and the `control-cli` plus `control-ui` plus `/goal` plus `Cursor cloud agent` sentences in `poteto-mode/SKILL.md`, `shipping`, `multi-phase-plan`, `opening-a-pr`, `autopilot-full`, `autopilot-stack`, `orchestrate`. The three added tokens' survivor counts are first measured in C1, the `create-verification-skill` guidance line being the known first hit.
- `disable-model-invocation` appears in 44 snapshot files and upstream ships it on every skill including the router. `user-invocable` appears in zero. `EXTREMELY_IMPORTANT` appears in zero, so the mandate text is port-authored, confirmed absent upstream. Native docs at `https://code.claude.com/docs/en/skills` give `user-invocable` as menu-only hiding that keeps model triggering, and live reports at anthropics/claude-code issues #26251 and #78523 say `disable-model-invocation` can also break the user's own slash invocation. OMP's copy has the flag filter the system-prompt listing only, `refs/omp-src/packages/coding-agent/src/modes/utils/capability/skill.ts:26-30` and `extensibility/skills.ts:113,260,298,399`, while `skill://` reads still return the bytes. That asymmetry is the whole hide-policy answer. The OMP router reaches hidden leaves by read, the Claude router reaches visible leaves by description matching, so each target hides behind exactly the edge that stays open.
- Drift between the ref-port's pin and ours, 6 upstream commits, 29 files, 556 insertions, 177 deletions. Our tree at 0.14.7 leads theirs at 0.14.2.
- Settled at C3, live, 2026-09-17: the installed `claude` 2.1.274's real subagent-dispatch tool is `Agent`, not `Task`. Ground truth from a real `tool_use` block in a `stream-json` trace (`/tmp/tool-trace.jsonl`), not a self-report, an actual `Agent` call with `input: {description, prompt, subagent_type: "general-purpose", run_in_background: true}`. That also settles the second half of C3's risk note below: `subagent_type` is the real parameter name on the live `Agent` tool, not a `Task`-only artifact the rename should have dropped, so every emitted `subagent_type: general-purpose` phrasing stays correct as written. C1 through C3's `Task`-to-`Agent` rename direction is confirmed right, not inverted.
- The mandate's token cost (C4 perf) and the exact frontmatter-only strip count versus the 44 string-containing files (C1 lane 4) remain unproven and lane-gated.
- C3, live, 2026-09-17, against `claude` 2.1.274 with `--plugin-dir "$(pwd)/plugins/pstack"`. Lanes 1, 2, 3, 4, 5, 8, 9, 10 pass with captures under `/tmp/swarm-c3/`: `branding-check`/`provenance --check` exit 0 with the tree on disk (`regression.txt`); a rerun after the tracked commit leaves `git status --porcelain plugins/pstack .claude-plugin` empty (`idempotent.txt`); both manifests carry `name`, `version 0.14.7`, and string `skills`/`agents`/`source` paths (`manifests.txt`); the frontmatter census is `disable-model-invocation` 0, `user-invocable` 21, all under `skills/principle-*` (`census.txt`); the denylist is zero hits and zero unscanned files (`deny-clean.txt`); `upstream/pstack` stays untouched (`immutable.txt`); and the commit's changed paths stay inside `tools/claude/`, `plugins/pstack/`, `.claude-plugin/` (`scope.txt`). Perf, corrected after an earlier no-op mismeasurement: a genuine cold write to a fresh `--output` dir (all 126 files new) is 0.076s, a dry run is 0.057s, a no-op rerun on that same tree is 0.061s, all far under the 10s/3s budget; trunk has no tree, so its baseline is absence.
- Three more dangling pointers found and fixed after the first C3 commit, the same class as lane 8's gap: `multi-phase-plan.md:10` said `node pstack/skills/poteto-mode/scripts/check-plan.mjs`, `orchestrate.md:25` said `bun scripts/orch/orch.ts`, and `worktree-cleanup.md:5` said `scripts/worktree-audit.sh`, all three cwd-relative and none resolving against a user repo's cwd. Fixed to the plugin-root-relative form the same files already use elsewhere (`multi-phase-plan.md:37-38`'s `skills/poteto-mode/playbooks/<execution playbook>.md under the installed plugin`), not the walked-back `${CLAUDE_PLUGIN_ROOT}` form, which only ever appears in `hooks.json` in the reference port and is not guaranteed set in the Bash tool's shell.
- The rewritten `check-plan.mjs` constants are verified with a positive and a negative control, not just a pass on the intact skeleton: stripping the lane sentence, and separately stripping `/loop`, each produces exactly one problem and exit 1 against the emitted checker (golden tests in `apply.test.ts`, "the emitted plan checker agrees with the emitted skeleton"). A checker that never fails on a broken plan would prove nothing; both negative controls fire.
- C3 lane 8 caught a real gap live, not a rerun of C1's own claim: C1's substitution table only ever targeted backticked `` `Task` `` and the exact phrase `Task tool`. Five bare uses of the word as the tool's name survived the C1/C2 passes because they take neither shape: `Spawn a single Task subagent` (twice in `how/SKILL.md`), `(omit Task \`model\`)` (in both `setup-pstack/SKILL.md` and `poteto-mode/SKILL.md`, byte-identical phrase), and `the full Task schema including \`environment\`` (in `orchestrate.md`). Fixed with four ledger entries in C3; the tree's one remaining bare `Task` is `<Task as a verb phrase>`, the plan skeleton's placeholder heading using the ordinary English noun, confirmed by hand not the tool name. `apply.test.ts`'s dispatch-token test now checks by word boundary instead of the backticked form only, so a future substitution gap fails the suite instead of shipping quietly.
- C3 lanes 6 and 7, live, 2026-09-17: `pstack`'s skills produce **no** `/pstack:*` entries at all in `claude`'s live slash-command list (asked the session to list every available command verbatim; `pstack` supplied zero of them, only other installed plugins and built-ins appeared). Invoking `/pstack:bro` directly gets `claude`'s own fallback text, "The `/pstack:bro` command isn't installed in this session, so it didn't run," the same shape for both the plain skill and the hidden `principle-laziness-protocol` leaf, so lane 6 (want a restatement) and lane 7 (want a hidden-command refusal, which technically also holds) can't be told apart by this build's slash-menu. The `disable-model-invocation` strip and the `user-invocable: false` stamp are confirmed on disk (frontmatter census above); whether either one drives live menu behavior is unproven at this pin, still gated per Appendix C.

## Appendix B. Alternatives rejected

- Adopt the ref-port marketplace as the install. Rejected for control. Its pin is five releases behind and its content decisions are not ours. It stays the read-once worked example rule 3 defines.
- Translate `plugin/` back to the Claude dialect. Rejected as lossy twice over. The OMP text carries `skill://` addresses, role aliases, and batch-task phrasing that have no Claude equivalent, and the snapshot is the honest source.
- Vendor the ref-port tree into this repo. Rejected as B done backwards. It inherits a stale pin, foreign editorial choices, and a sync pipeline welded to their tooling.
- Per-file Catalog rows for the tree. Rejected as noise. One hundred generated rows restate what the generator and the deny report already prove. Glob rows per directory plus the pin match how the ref-port's NOTICE ledger maps paths to commits.

## Appendix C. Risks

- Resolved at C3 (was open at C1). The installed runtime names the subagent tool `Agent`, confirmed from a real `tool_use` trace, not a self-report; see Appendix A. The substitution direction C1 chose was already correct, so nothing in C2 needed a second look.
- Superseded at C3, on the operator's explicit call: the upstream `check-plan.mjs` hardcodes Cursor literals, `/goal` and a fixed model string, so it was never carried unadapted. C3 carries it with `LANES` rewritten to the emitted lane sentence and `PROGRAM_MARKERS`' `/goal` rewritten to `/loop`, verified with a positive control (the emitted skeleton passes) and two negative controls (removing either constant's target fails); see Appendix A. `watch-pr` ships too, overriding this plan's earlier never-carried note, which was written for the OMP port's no-bun runtime and does not bind this target.
- `disable-model-invocation` live bugs (#26251, #78523) may get fixed upstream. The tree invariant strips the key regardless, so a fix changes nothing here except a footnote.
- The `user-invocable` menu hide is verified only against the installed `claude` build at C3 lane 7. A regression there hides nothing or hides too much. The invariant script counts stamps but cannot prove menu behavior.
- The polyglot hook runner ships untested on Windows from a darwin box. C4 lane 3 proves the bash side only. A Windows operator is the named untested surface.
- Marketplace-add is untestable until this repo gets a remote. Today's install path is `--plugin-dir`, and the docs must say so plainly.
- The mandate probe lane is an LLM answer and can flake. Three attempts with recorded attempt counts keep it honest.

## Appendix D. Links and reading list

- [Claude Code skills docs](https://code.claude.com/docs/en/skills) for the two hide keys. Read before C1 and C3.
- anthropics/claude-code issues [#26251](https://github.com/anthropics/claude-code/issues/26251) and [#78523](https://github.com/anthropics/claude-code/issues/78523) for the invocation breakage reports.
- `refs/ref-port/tools/substitutions.json`, `refs/ref-port/tools/sync.mjs`, `refs/ref-port/plugins/pstack/hooks/hooks.json` are the borrowed mechanisms. One read pass, already spent this session.
- `upstream/pstack/skills/poteto-mode/scripts/check-plan.mjs` is this plan's shape checker.
- Route C4's mandate authoring through `skill://how` review of the OMP injector for contrast, and C2's rewrite set through `skill://interrogate` if any sentence survives first-pass doubt. The decision trail is this plan's boxes plus the five commit messages, per `skill://show-me-your-work` intent without the extra file.

## C1 execution record, 2026-09-16

Head `fc90f4f`. Trunk baseline `bae6802`. Captures under `/tmp/swarm-c1/`. Checks at head: branding-check clean, `provenance.ts --check` clean at 137 artifacts, `bun test tools/claude/` 19 pass 0 fail.

**Appendix A is not stale, and the ordering is settled from git rather than from commit subjects.** `git log --oneline 5d20b75..HEAD -- upstream/pstack` returns one commit, `774ffbe`. `git show --stat 5d20b75 -- UPSTREAM.md upstream/pstack` touches `UPSTREAM.md` alone, 4 insertions and 3 deletions, and `git show 5d20b75:UPSTREAM.md` already pinned `efa2a531985e0a8084d36ff3cf87233be8a9f34b` at 0.14.7. The file population of `skills/` and `agents/` is identical at both commits, and the only added path between them is `upstream/pstack/assets/logo.png`, which is the one `"logo"` manifest line. So Appendix A was written against 0.14.7 and re-measures identically now: 104 scanned files, hits 10, 3, 6, 16, 7, 33 carried deny hits across 17 files, 21 leaves, `subagent_type` 14, `user-invocable` 0, `EXTREMELY_IMPORTANT` 0.

**The 104 is `.md` plus `.json`.** `.md` alone is 102, and `md` plus `.sh` also sums to 104, so the arithmetic alone proves nothing. The `.md` plus `.json` set is the one scope that reproduces every other figure, which is what pins it. Its siblings sit outside the gate and still carry hits: `skills/poteto-mode/scripts/check-plan.mjs:20` one `/goal` and `skills/poteto-mode/scripts/worktree-audit.sh:25,27` two `.cursor/`. C3 owes a carriage decision for those files, for `make-bot-ui`, which this port classifies DROP, and for `scripts/watch-pr`, which `AGENTS.md` lists as never carried. The report names them now under `unscanned deny hits`. Appendix A's `rewrites 13 files` is the ref-port's four-rule table over this snapshot, reproduced exactly. The corrected five-rule table touches 16 files.

**Two build-rule corrections, both measured before any code was written.**
1. The added `OMP` token matches on word boundaries. As a bare substring it hits the forge stop-state literal `COMPLETE` 17 times across 6 files, including 13 inside `skills/poteto-mode/scripts/watch-pr/*.ts`, and `\bOMP\b` hits zero times anywhere in the 124 files of `skills/` and `agents/`. Stage four is a hard fail, so a substring rule leaves `--dry` permanently red and C2 cannot rewrite those literals away.
2. The hide-key prose survivor is `skills/automate-me/SKILL.md:73` in snapshot numbering. `create-verification-skill/SKILL.md` carries one occurrence, its own frontmatter key at line 4, which the structural strip removes. C2's ledger is therefore 34 sites, the 33 carried hits plus that one line. `skill://` and word-bounded `OMP` measure zero in the snapshot, so the other two added tokens are guards against future bleed.

**Perf.** Five dry runs at head took 27 to 29 ms each against a 2000 ms budget. Each round was interleaved with a trunk attempt, and every trunk attempt records that `tools/claude/apply.mjs` does not exist at `bae6802`.

**Deviation, recorded.** Lane 5 passes on exit 1 naming the drifted source sentence rather than a file. A ledger entry applies everywhere its source occurs, and that is what makes the entry count equal the distinct site count C2 lane 9 requires. Naming the sentence is the honest miss message.

**Deviation, recorded.** Box 20 asks for the unit's leaf skills read from `upstream/pstack/skills/<name>/SKILL.md`. The playbook steps were read from this port's own `skill://` copies, which carry OMP wording. No C1 rule depended on their wording.

**Skip, recorded.** The C1 build box about leaving unmapped in-tree files alone stays open. The plan's own file boundary assigns write mode to C3, and nothing calls a writer at C1. C1 ships the substitutions, the rewrite stage, the frontmatter rules, the deny gate, and `--dry`.

**Blocked, recorded.** Lane 8 cannot run. `claude -p` returns `Failed to authenticate: OAuth session expired and could not be refreshed` with zero tokens and an empty `modelUsage`. There is no `~/.claude/.credentials.json` and no `ANTHROPIC_API_KEY`. The installed build is 2.1.240, and a filtered `claude --help` shows `--plugin-dir <path>` at lines 143-145 plus `--plugin-url <url>` at 147-149, so the boot recipe itself is sound. The `Agent` versus `Task` question stays open and must close before C3 ships, because both rule names depend on it.

**Standing orders, recorded on the operator's go.** Run `pstack-omp-plan/70-claude-code-target.md`. Units C1 to C5 in strict order. Verification rule. Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Land each clean unit as one commit on `main`. No push, there is no remote. Done when C5's full check set is green and every box has evidence. Forge fallback, recorded once: this repo has no remote, so `gh`, `origin`, trunk fetch, and PR objects do not exist, and each unit head is its own commit on `main`.
