# Claude Code target plan

This plan ports the pstack plugin a second time, from the vendored upstream snapshot to a Claude Code plugin tree in this repo. The operator gets one pinned upstream feeding two shipped targets, the OMP package in `plugin/` and the Claude Code package in `plugins/pstack/`. The rule the program enforces is that every generated file is reproducible from `upstream/pstack/` at the pin in `UPSTREAM.md`, with hand rewrites kept as data in `tools/claude/`. The units are C1, C2, C3, C4, C5 in order. Each unit lands as one local commit. The plan answers the hide-policy question up front. The OMP tree keeps hiding every skill behind the router. The Claude tree strips `disable-model-invocation` from every skill and hides only the 21 principle leaves from the user menu. Appendix A holds the measurements behind that split.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a capture, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `skill://autopilot-stack` adapted to a forgeless repo. This repo has no remote, so each owner lands its unit as one commit on `main` after a clean verdict, and the operator audits the whole stack afterwards and reverts any unit by reverting its commit. Units run strictly in order because C2's rewrites feed C3's output and C3's output feeds C4 and C5.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Here "PR" means one unit commit. The upstream playbooks under `upstream/pstack/skills/poteto-mode/playbooks/` are the behavior spec for every rewritten sentence.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on her explicit go.
- [ ] On her go, record this exact text as the standing orders and restate it at every spawn and every resume. "Run `pstack-omp-plan/70-claude-code-target.md`. Units C1 to C5 in strict order. Verification rule. Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Land each clean unit as one commit on `main`. No push, there is no remote. Done when C5's full check set is green and every box has evidence."
- [ ] Upstream's program opens a Cursor `/goal` session with a 30-minute audit tick and a periodic status message. This repo has no forge and no Cursor runtime. The owner re-reads the standing orders at every unit start instead, and closes every unit with a status message naming the unit, the head SHA, the lane results, and the checker output.
- [ ] Read the unit's leaf skills from the vendored snapshot before its first edit. The upstream tick re-reads playbooks with `git show origin/main:skills/<playbook>/SKILL.md`, which fails here because there is no remote. The copy of record is `upstream/pstack/skills/<name>/SKILL.md`.

### Spawn owners

- [ ] Spawn one owner per unit, strictly sequential. No parallel owners. C2's rewrites are inputs to C3's generation and C4 and C5 read C3's tree, so the dependency chain is a line, not a graph.
- [ ] Follow this dependency graph. Start dependent work only after its parent commits.
  - [ ] C1 is first and branches from `main`.
  - [ ] C2 after C1. C3 after C2. C4 after C3. C5 after C4.
- [ ] Hold the file boundaries. C1 touches only `tools/claude/**`. C2 touches only `tools/claude/rewrites.json` and its test file. C3 owns the write mode of `tools/claude/apply.mjs`, the generated tree `plugins/pstack/**`, and both manifests. C4 owns `plugins/pstack/hooks/**` and `plugins/pstack/models.json`. C5 owns `PROVENANCE.md`, `scripts/**`, `AGENTS.md`, and `docs/claude-code.md`.
- [ ] Hold the review gate. No unit changes an interaction. None of the five units is review-gated. The operator's audit happens on the finished stack.

### PR mechanics, for every unit

- [ ] Skip forge resolution. This repo has no remote, so `gh` and `origin` paths do not apply. Record the fallback once in the standing orders.
- [ ] Run `bun scripts/branding-check.ts` and `bun scripts/provenance.ts --check` before the unit's commit. Both must be green and must stay green for all five units.
- [ ] Run `skill://no-comments` before review. The new tooling ships without narrating comments.
- [ ] There is no trunk fetch. The head of a unit is its commit on `main`, and the trunk baseline is the commit before C1.

### Verdict and merge, for every unit

- [ ] At the unit head, run the unit's **Verify, unit.** boxes, then its ten live lanes, then its perf boxes. Clean means every lane PASS with a saved capture.
- [ ] Findings go back to the owner. A new head re-runs only the lanes that failed, plus lane 1.
- [ ] Land the unit as one commit on `main` with message prefix `claude-target`. The operator audits the full stack later. Reverting the unit is reverting its commit.

### Boot recipe, for every live lane

Each live lane runs on this machine at the unit head. There are no CI VMs. Drive through `bash` for the pipeline and `claude` for the runtime, and save every capture.

- [ ] Stay on `main` at the unit head SHA. Do not fetch anything.
- [ ] Save every capture to `/tmp/swarm-<unit>/worker-<n>/<slug>.txt` and return the paths with the report. A capture is the terminal output of the named command, this plan's stand-in for a screenshot because every surface here is a CLI.
- [ ] Deliver input only through `bun tools/claude/apply.mjs`, the repo's check scripts, and `claude -p --plugin-dir plugins/pstack`. The read-only diagnostics are `git status --porcelain`, `jq`, `grep`, and `cmp`.

## Cut the substitution pipeline (C1)

**Depends on.** None.

**Files.**

- [ ] Create `tools/claude/substitutions.json`.
- [ ] Create `tools/claude/rewrites.json`, empty at this unit.
- [ ] Create `tools/claude/apply.mjs`.
- [ ] Create `tools/claude/apply.test.ts`.

**Build.**

- [ ] Seed the substitution table with the ref-port's four rules, re-measured against our pin. The final table is `` `Task` `` to `` `Agent` `` (10 sites), `Task tool` to `Agent tool` (3 sites), `AskQuestion` to `AskUserQuestion` (6 sites), `.cursor/skills/` to `.claude/skills/` (16 sites), `.cursor/rules/` to `CLAUDE.md imports` (7 sites). The ref-port rule for the phrase `the ` + "`Task`" + ` tool` matched zero times at our pin, so name the rules after the phrasing upstream actually uses.
- [ ] Carry the ref-port denylist verbatim, seven tokens, and add three more. `disable-model-invocation`, `skill://`, `OMP`. The first catches guidance sentences that survive the structural strip, the last two guard against OMP dialect bleeding in.
- [ ] Give apply.mjs a four-stage pipeline over the snapshot. Text substitutions, then exact-sentence rewrites from `rewrites.json`, then structural frontmatter rules on every `SKILL.md`, strip the `disable-model-invocation` key, stamp `user-invocable: false` on the 21 `principle-*` leaves, then a denylist scan where any hit in generated output is a hard fail with file, line, and hint.
- [ ] Give apply.mjs a `--dry` mode that reports per-rule counts, strip count, stamp count, and deny hits without writing. Expect 10, 3, 6, 16, 7 substitution hits in build-rule order. Expect 33 deny hits in 17 files under the seven carried tokens at the current pin, plus whatever the three added tokens surface, until C2 closes them.
- [ ] Make write mode leave unmapped in-tree files alone, so hand-carried files in `plugins/pstack/hooks/` survive regeneration. Never write to `upstream/`.

**You see.**

- [ ] `bun tools/claude/apply.mjs --dry` prints the expected per-rule counts and exits 1 listing 33 deny hits across 17 files under the carried tokens, plus the added-token extras.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Fixtures in `tools/claude/apply.test.ts` for substitution counts, a rewrite miss on drifted wording, the frontmatter strip, and the leaf stamp. Run `bun test tools/claude/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run `bun scripts/branding-check.ts` and `bun scripts/provenance.ts --check` at trunk and head. Trunk has no `tools/claude`, so gate the unchanged green of both checks plus the new test file's green. Save `regression.txt`. Pass when both checks exit 0 at head.
- [ ] Lane 2. Count report. Run `bun tools/claude/apply.mjs --dry`. Save `counts.txt`. Pass when printed counts are 10, 3, 6, 16, 7 in build-rule order.
- [ ] Lane 3. Deny tripwire. Run the test fixture that poisons a file with `control-cli` and `skill://`. Save `tripwire.txt`. Pass when the run exits 1 naming file, line, and hint.
- [ ] Lane 4. Strip parity. Compute the frontmatter strip count independently with a `grep -l` over snapshot frontmatter, then compare with the dry report. Save `strip-parity.txt`. Pass when the two numbers are equal.
- [ ] Lane 5. Rewrite miss is fatal. Run the fixture whose rewrite names a sentence absent from the source. Save `rewrite-miss.txt`. Pass when exit 1 reports the miss for that file.
- [ ] Lane 6. Snapshot immutable. Run `git status --porcelain upstream/pstack` after the dry run. Save `immutable.txt`. Pass when empty.
- [ ] Lane 7. Leaf inventory. Glob `upstream/pstack/skills/principle-*/SKILL.md` and compare with the dry report's stamp list. Save `leaves.txt`. Pass when both sides are the same 21 files.
- [ ] Lane 8. Tool-name ground truth. Run `claude -p` asking which tool it dispatches subagents with. Save `toolname.txt`. Pass when the answer matches the substitution replacement token. If it says Task instead, flip both rule names, rerun lanes 2 and 8, and record the correction in Appendix A before C3 ships.
- [ ] Lane 9. Report persisted. Save `dry-run-report.txt` from lane 2's run. Pass when the file exists and is non-empty.
- [ ] Lane 10. Deterministic parse. Run `--dry` twice into two files and compare with `cmp`. Save `determinism.txt`. Pass when byte-identical.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. `apply.mjs --dry` end-to-end wall time over the 104 scanned files. Trunk has no tool, so the trunk side of the probe records that fact.
- [ ] Probe. Run `time bun tools/claude/apply.mjs --dry` five times at head, interleaved with one trunk attempt each round, and save all timings.
- [ ] Baseline. Record the trunk fact, tool absent, before the head measurements. Then the absolute budget covers the work the diff adds.
- [ ] Rule. Head dry run finishes under 2 seconds every time, and a no-op rewrite path, if measured, stays under 1 second. No ratio against a trunk number that does not exist.

**Review gate.** None. C1 is not review-gated.

**Merge.**

- [ ] Clean verdict at the exact head SHA of C1.
- [ ] Land as one commit `claude-target c1: substitution pipeline`. No push, there is no remote.

## Rewrite the denylist sentences (C2)

**Depends on.** C1.

**Files.**

- [ ] Edit `tools/claude/rewrites.json`.
- [ ] Edit `tools/claude/apply.test.ts`.

**Build.**

- [ ] Write one exact-sentence rewrite for every reported deny hit, the 33 carried-token lines across 17 files plus any added-token guidance file. The clusters are the three `reflect` reference reviewers plus `reflect/SKILL.md`, `show-me-your-work`, `session-pickup`, `eval`, `worktree-cleanup`, `recall`, `automate-me` for the `.cursor/` config paths, and `poteto-mode/SKILL.md`, `shipping`, `multi-phase-plan`, `opening-a-pr`, `autopilot-full`, `autopilot-stack`, `orchestrate` for the `control-cli`, `control-ui`, `/goal`, and `Cursor cloud agent` sentences, and the guidance line in `create-verification-skill` that recommends the now-stripped hide key.
- [ ] Write each rewrite as one entry pairing the exact source sentence with the exact replacement. A source sentence that no longer matches is a hard error, so every future pin bump forces a re-read of these decisions instead of silently reverting them.
- [ ] Write the replacements in Claude-native vocabulary. The runtime built-ins for driving CLIs and UIs, standing orders in place of `/goal`, worktree isolation in place of a cloud agent, and no OMP dialect lifted from `plugin/`.

**You see.**

- [ ] `bun tools/claude/apply.mjs --dry` exits 0, prints zero deny hits, and still prints 10, 3, 6, 16, 7 in build-rule order.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Add a rewrite-applied fixture and a rewrite-drift fixture to `tools/claude/apply.test.ts`. Run `bun test tools/claude/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk's dry run reported 33 carried-token deny hits in 17 files. Run the dry run at head. Save `regression.txt`. Pass when head reports zero deny hits under all ten tokens and the trunk capture still shows 33.
- [ ] Lane 2. Counts unchanged. Compare head's per-rule counts with C1's saved `counts.txt`. Save `counts-equal.txt`. Pass when all five rule counts are identical.
- [ ] Lane 3. Drift is fatal. Run the new drift fixture. Save `drift-fatal.txt`. Pass when exit 1 names the drifted file.
- [ ] Lane 4. Router spot audit. Render `poteto-mode/SKILL.md` through dry into a temp file. Save `router-audit.txt`. Pass when the rendered text contains none of the ten deny tokens.
- [ ] Lane 5. Guidance rewrite landed. Render `create-verification-skill` and grep for the stripped key. Save `guidance.txt`. Pass when zero matches.
- [ ] Lane 6. Native tokens survive. Count `subagent_type` occurrences in the dry output. Save `native-tokens.txt`. Pass when the count equals the snapshot's 14.
- [ ] Lane 7. Deterministic render. Dry twice into two files. Save `determinism.txt`. Pass when `cmp` is clean.
- [ ] Lane 8. Snapshot immutable. Run `git status --porcelain upstream/pstack`. Save `immutable.txt`. Pass when empty.
- [ ] Lane 9. Rewrite ledger readable. Pretty-print `rewrites.json` with `jq`. Save `ledger.txt`. Pass when every entry has both an exact source and an exact replacement and the entry count equals the distinct deny sites, not the raw hit count.
- [ ] Lane 10. No OMP bleed. Grep the dry output tree for `skill://` and `OMP`. Save `no-omp.txt`. Pass when zero matches.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Dry-run wall time at head, and trunk's recorded absence from C1.
- [ ] Probe. `time bun tools/claude/apply.mjs --dry` five times at head with one trunk attempt between rounds. Save `perf.txt`.
- [ ] Baseline. The trunk fact is that the tool did not exist. The absolute budget covers the rewrite matching the diff adds.
- [ ] Rule. Head stays under 2 seconds with 33 rewrite lookups active. A miss beyond that budget points at the exact-sentence matcher and gets investigated, not waved.

**Review gate.** None. C2 is not review-gated.

**Merge.**

- [ ] Clean verdict at the exact head SHA of C2.
- [ ] Land as one commit `claude-target c2: claude-dialect sentence rewrites`. No push.

## Generate the plugin tree (C3)

**Depends on.** C2.

**Files.**

- [ ] Edit `tools/claude/apply.mjs` with the write mode.
- [ ] Create `.claude-plugin/marketplace.json`.
- [ ] Create `plugins/pstack/.claude-plugin/plugin.json`.
- [ ] Generate `plugins/pstack/skills/**` and `plugins/pstack/agents/*.md` and `plugins/pstack/assets/logo.png` through the tool.

**Build.**

- [ ] Write mode copies the transformed snapshot into `plugins/pstack/`, skills and agents and the logo, leaves `hooks/` and `models.json` untouched when present, and writes both manifests. The plugin manifest carries the name, the `upstream_version` from `UPSTREAM.md` as its version, the original author credit, and the `skills` plus `agents` paths. The marketplace manifest points its one plugin entry at `./plugins/pstack`.
- [ ] Assert on emit. The stamp count equals the leaf glob, the `disable-model-invocation` key count across emitted `SKILL.md` frontmatter is zero, and the total `user-invocable` key count is exactly 21.
- [ ] Assert the tree contains no `commands/` directory. The invariant exists because commands plus user-facing skills render duplicate slash-menu rows in Claude Code, recorded as bug #22 in the ref-port's ledger.

**You see.**

- [ ] `bun tools/claude/apply.mjs` writes the tree, and an immediate rerun leaves `git status --porcelain plugins/pstack` empty.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Add golden tests to `tools/claude/apply.test.ts`. Both manifests render exactly, the leaf stamp renders on a fixture tree, and a poisoned fixture halts before any write. Run `bun test tools/claude/`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no tree at all, so this lane gates tree presence plus the repo checks. Run `bun scripts/branding-check.ts` and `bun scripts/provenance.ts --check` at head. Save `regression.txt`. Pass when both exit 0 with the tree on disk.
- [ ] Lane 2. Idempotent write. Run apply, then apply again, then `git status --porcelain plugins/pstack`. Save `idempotent.txt`. Pass when the status is empty.
- [ ] Lane 3. Manifest shape. `jq` both manifests. Save `manifests.txt`. Pass when name, version 0.14.7, and the paths keys resolve as strings.
- [ ] Lane 4. Frontmatter census. Grep the tree. Save `census.txt`. Pass when `disable-model-invocation` count is 0, `user-invocable` count is 21, and every hit is under `skills/principle-*`.
- [ ] Lane 5. Deny scan clean. Run the denylist over the whole tree. Save `deny-clean.txt`. Pass when zero hits, including the three added tokens.
- [ ] Lane 6. Slash leg works. Run `claude -p` with `--plugin-dir plugins/pstack` invoking `/pstack:bro` with a sample sentence. Save `slash-bro.txt`. Pass when it returns a plain-language restatement instead of an unknown-command error.
- [ ] Lane 7. Hidden leaf leg. Run `claude -p` with `--plugin-dir plugins/pstack` invoking `/pstack:principle-laziness-protocol`. Save `hidden-leaf.txt`. Pass when the CLI treats the command as unavailable. If it still runs, record the live behavior in Appendix A and keep the stamp, the menu hide is the intent and the run is a Claude Code defect worth capturing.
- [ ] Lane 8. Rename audit. Grep the rendered `poteto-mode/SKILL.md` for the old tool name. Save `rename-audit.txt`. Pass when zero `Task` tokens remain and the `Agent` token count matches lane 8 of C1's expectation.
- [ ] Lane 9. Snapshot immutable. Run `git status --porcelain upstream/pstack`. Save `immutable.txt`. Pass when empty.
- [ ] Lane 10. Write scope. Run `git status --porcelain` filtered to additions. Save `scope.txt`. Pass when additions touch only `plugins/pstack` and `.claude-plugin`.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Full apply wall time at head, and the no-op rerun cost. Trunk has no tree, so its probe records that fact and the budget is absolute.
- [ ] Probe. `time bun tools/claude/apply.mjs` once for the write and once for the no-op, interleaved with one trunk attempt. Save `perf.txt`.
- [ ] Baseline. Record the trunk absence first. Then set absolute budgets for the generation the diff adds.
- [ ] Rule. Full write under 10 seconds and no-op under 3 seconds. End state the operator waits for is a regenerated tree inside one editor round trip.

**Review gate.** None. C3 is not review-gated.

**Merge.**

- [ ] Clean verdict at the exact head SHA of C3.
- [ ] Land as one commit `claude-target c3: generated claude plugin tree`. No push.

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
- Unproven and lane-gated. Whether the installed `claude` names its subagent tool `Agent` or `Task` (C1 lane 8), whether `user-invocable: false` holds in the installed build (C3 lane 7), the mandate's token cost (C4 perf), and the exact frontmatter-only strip count versus the 44 string-containing files (C1 lane 4).

## Appendix B. Alternatives rejected

- Adopt the ref-port marketplace as the install. Rejected for control. Its pin is five releases behind and its content decisions are not ours. It stays the read-once worked example rule 3 defines.
- Translate `plugin/` back to the Claude dialect. Rejected as lossy twice over. The OMP text carries `skill://` addresses, role aliases, and batch-task phrasing that have no Claude equivalent, and the snapshot is the honest source.
- Vendor the ref-port tree into this repo. Rejected as B done backwards. It inherits a stale pin, foreign editorial choices, and a sync pipeline welded to their tooling.
- Per-file Catalog rows for the tree. Rejected as noise. One hundred generated rows restate what the generator and the deny report already prove. Glob rows per directory plus the pin match how the ref-port's NOTICE ledger maps paths to commits.

## Appendix C. Risks

- C1 owns the tool-name question. If the installed runtime names the subagent tool `Task`, the substitution names invert and every already-rewritten sentence in C2 that references the tool needs a second look. Watch the lane 8 capture.
- The upstream `check-plan.mjs` hardcodes Cursor literals, `/goal` and a fixed model string. Do not carry that script into `plugin/` without adapting its marker list, and keep it out of the shipped trees.
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
