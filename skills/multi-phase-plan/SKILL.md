---
name: multi-phase-plan
description: Work that spans phases or stacked PRs. Routed from poteto-mode's Multi-phase or multi-PR plan trigger, or invoked directly when the change is bigger than one or two files with an obvious approach.
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/multi-phase-plan.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: "The Cursor per-spawn agent-type field (`poteto-agent`) rewritten to the `task` tool's `agent` field; the `grok-4.6-fast-xhigh` slug deleted per the model-ID rule (rewritten as your configured model role); `control-ui`/`control-cli` from `cursor-team-kit` rewritten to the `bash`/`browser`/`debug` tools, and the Control skill section retitled Verification surface since OMP has no control-skill plugin concept. Dropped `/deslop` (no OMP substitute, see opening-a-pr's note) and the Bugbot/`../references/bugbot-triage.md` triage step (Bugbot is a Cursor product with no OMP or pstack-native equivalent and the reference file was never part of this port's matrix); replaced with a dispatch to OMP's own `reviewer`/`security-reviewer` agents. The agent store's docs/ (a Cursor cloud-agent working-directory concept with no verified OMP equivalent) generalized to the repo's own `docs/`. `/goal` (Cursor's persistent cross-turn goal arming for cloud agents) has no OMP equivalent; rewritten as restating the standing orders at every drain and resume. `git show origin/main:pstack/skills/...` re-read paths updated to the flat `skills/<name>/SKILL.md` layout; the `<control skill path>` re-read line dropped since there is no longer a control-skill file to pin. `node pstack/skills/poteto-mode/scripts/check-plan.mjs` kept as a bare `check-plan.mjs` invocation; the script itself is unported tooling, out of scope for this markdown-only phase. All other Cursor-isms (the `Task` tool, the AskQuestion analogue, bold cross-references) rewritten per the standard substitution table."
---

# Multi-phase or multi-PR plan

**You own the plan, not the code. The plan is a checklist an owner runs box by box and the operator audits from the evidence.** For work that spans phases or stacked PRs. The plan is the deliverable. Do not implement.

1. When the change is one or two files with an obvious approach, skip the plan. Say so and stop.
2. Settle open questions by prototype before you write. For a question about layout, timing, behavior, or whether an API works, run skill://prototype. Keep the branch, the SHA, and the screenshots for Appendix A. Ask the operator only about a product or preference call that no run can settle. Give options (skill://principle-never-block-on-the-human).
3. Explore in subagents via the `task` tool with `agent: "poteto-agent"`, choosing the model per the Subagents section in skill://poteto-mode (skill://principle-guard-the-context-window). Each returns file pointers, conventions, test commands, and entry points. No inlined dumps.
4. Copy the skeleton below into the plan file and fill every placeholder. Unless the operator names a path, write the file under the repo's `docs/`. Keep every heading and every sub-block in the order shown. One section per PR. One PR is one change with its own evidence (skill://principle-sequence-verifiable-units). Name the execution playbook in **How to read this**. Pick between skill://autopilot-full and skill://autopilot-stack per the rule at the end of skill://autopilot-stack. A standing program takes skill://orchestrate.
5. Write under skill://technical-writing in full, then skill://unslop. The body is one Diátaxis mode, how-to. Appendices hold explanation and reference. Two rules apply verbatim. "i dont want any abstract metaphors" and "write like hemingway". Each heading states the task or the finding. No long dashes. No mid-sentence colons.
6. Run `check-plan.mjs <plan.md>` and fix every line it prints (skill://principle-encode-lessons-in-structure). It enforces the skeleton's shape, the verification rule in every verification block, and the punctuation rules.
7. Hand back. Post the plan path and the script's output, then stop. Execution starts on the operator's explicit go, under the execution playbook the plan names.

**Verification.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked (skill://principle-prove-it-works). That sentence is the verification rule. Every verification block opens with it. The live block is mandatory. Ten lanes on your configured model role at the PR head drive the real surface through its verification tool, per skill://swarm. Each lane is one box with a concrete scenario, the screenshot it saves, and its pass predicate. The perf block names the metric, the probe, the trunk baseline measured first, and the rule with the number that fails. A PR that changes an interaction is review-gated. The operator reviews it in chat with screenshots and a video before merge. A PR that changes no interaction writes `**Review gate.** None. <PR id> is not review-gated.` and no boxes under it.

**Verification surface.** Pick it by surface. Browser, Electron, and web UIs use the `browser` tool. CLIs and TUIs use the `bash` tool, or `debug` for a live process. Native mobile uses whatever simulator-driving skill the repo has. A PR that touches two surfaces gets lanes on both. A surface with no scripted verification path is a risk in Appendix C, and its live block still names how each lane drives it.

````markdown
# <Program> plan

<Under ten lines. What changes, for whom, the rule the program enforces, and the PR ids in order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `skill://<execution playbook>`. <Who merges, and which PR ids are the operator's items that stop at merge-ready.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on her explicit go.
- [ ] On her go, record this exact text as the standing orders and restate it at every spawn and every resume. "<The plan path, the PR ids in order, the verification rule, who merges, and the done condition.>"
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:skills/<execution playbook>/SKILL.md`
  - [ ] `git show origin/main:skills/swarm/SKILL.md`
  - [ ] `git show origin/main:skills/opening-a-pr/SKILL.md`
  - [ ] `git show origin/main:skills/<each other leaf skill the program uses>/SKILL.md`
- [ ] Arm the 30-minute audit tick: a monitored timer that re-checks and re-drains on a fixed cadence, never left to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk and the standing orders. Audit the operation against both and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then send the operator a status message, whether or not anything changed, with the queue table of PR, owner, state, and head SHA, the verdicts since the last tick, what merged, open operator gates, and blockers."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] <PR id> and <PR id> are independent and first. Both branch from `main`.
  - [ ] <PR id> after <PR id>.
- [ ] Hold the file boundaries. <PR id or class> touches only `<glob>`.
- [ ] Hold the review gate. <PR ids> change an interaction. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Open the PR ready, never draft, with `gh pr create` and `draft: false`, or with Graphite `gt` for a stack.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run skill://no-comments before review.
- [ ] Triage every automated review comment, dispatching the `reviewer` or `security-reviewer` agent via `task` for a dedicated pass when warranted.
- [ ] Rebase onto current trunk before skill://babysit and again before the merge-ready report.

### Verdict and merge, for every PR

- [ ] At the merge-ready head SHA, run the swarm per skill://swarm. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. One audit lane that reads the diff and the receipts and distrusts the PR body.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner. A new head gets a fresh swarm and a fresh verdict.
- [ ] <The merge or append rule from the execution playbook, with the patch-id rule from skill://shipping.>

### Boot recipe, for every live lane

Each live lane runs at the PR head in its own isolated environment. Drive through the `bash`, `browser`, or `debug` tool as the surface demands.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] <Start the backend and the surface. Wait for ready.>
- [ ] Deliver input only through the verification tool's commands. Name the read-only diagnostics.
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## <Task as a verb phrase> (<PR id>)

**Depends on.** <PR id, or None.>

**Files.**

- [ ] Edit `<path>`.
- [ ] Create `<path>`.
- [ ] Delete `<path>`.

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact log line or screen state.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `<command>`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on your configured model role at the PR head, per the boot recipe.

- [ ] Lane 1. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<slug>.png`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured.>
- [ ] Probe. <The command or procedure, run at trunk and at the head, interleaved.>
- [ ] Baseline. Record the trunk <value> first.
- [ ] Rule. <Head against trunk, with the number that fails.>

**Review gate.** The operator reviews before merge.

- [ ] Copy lane <n> screenshots into `<media path>/<pr-id>-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `<media path>/<pr-id>-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Automated review triage done (reviewer/security-reviewer agents, per PR mechanics).
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] <The owner squash-merges its own PR, or the root appends the PR to the Graphite stack and the operator lands it.>

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

<Each open question a prototype answered, with the branch, the SHA, and the artifact links. Each question that stays unproven.>

## Appendix B. Alternatives rejected

<Each approach weighed and why it lost.>

## Appendix C. Risks

<Each risk with the PR it lands in and what the owner watches.>

## Appendix D. Links and reading list

<Docs to read before editing. Which PRs get skill://how and skill://interrogate. The trail per skill://show-me-your-work.>
````

**Reply:** the plan path, the PR ids with their dependencies and the review-gated set, what the prototypes proved and what stays unproven, and the check script's output.
