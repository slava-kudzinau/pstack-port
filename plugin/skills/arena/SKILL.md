---
name: arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
disable-model-invocation: true
---

# Arena

Open a todolist with one entry per phase (Frame, Fan out, Cross-judge, Pick, Graft, Verify) before launching anything.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
3. Pick the runners. Use the `arena runners` line from `~/.omp/agent/pstack-models.md`, or its default one candidate each from your configured model roles, when the line is missing. An `auto` or `inherit-parent` entry in this line means the parent model, so omit `model` for it. When the task tool rejects a configured role, run that seat on its family's default and say so, or drop the seat when there is none. If dropped seats leave fewer than two runners, add runners until there are two, or one when the line has one entry. Run each added runner on a remaining runner's role, or omit `model` so it runs on the parent model when none remain, and say so. Spawn more runners when the arena covers multiple design directions. Use the same role N times when the work is generation-bound rather than judgment-sensitive. Pick each subagent's `effort` for the job, per the Subagents section of the **poteto-mode** skill (`skill://poteto-mode`).
4. Give each candidate its own output location (a git worktree where possible, otherwise `/tmp/arena-<slug>/candidate-<n>/`), per the **separate-before-serializing-shared-state** principle skill (`skill://principle-separate-before-serializing-shared-state`).

## Phase B: Fan out

Spawn all N subagents in one `task` batch call (`{context, tasks[]}`), each with the task, the path to the shared grounding, its own output path, its `model` from the `arena runners` line, and instructions to produce the artifact and a short rationale naming the alternatives it considered and what it rejected.

Set `effort: "hi"` for candidates producing design artifacts. Arena is judgment-heavy and the candidates need full reasoning depth. Each candidate has a 200-request budget (the default for non-scout agents).

If a candidate produces no output, proceed with N-1 and note the dropout.

## Phase C: Cross-judge

After all Phase B candidates complete, choose one model from the `arena cross-judge pool` line in `~/.omp/agent/pstack-models.md`, or its default of your configured model roles, when the line is missing. The judge is never from the parent's family, as Phase A step 3 defines families: try the pool entries from another family, in pool order. An `auto` or `inherit-parent` entry is the parent model, so it never judges. If no entry from another family runs, try the default roles from another family the same way. If none of those runs, skip the judge, pick the base alone in Phase D, and say so. If you do not know the parent's model, try the pool entries in order and say that the family check did not run. Spawn one read-only judge subagent (`agent: "scout"`) on that role with `effort: "med"`. The judge sees the rubric and the candidates by path label, scores each criterion, and recommends a base with rationale. It runs in parallel with your reading in Phase D. Don't spawn it while candidates are still writing. The judge has a 100-request budget (scout's default).

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel, and compare with the cross-judge when Phase C ran one. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous. Read both rationales before deciding.

Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API, per the Laziness Protocol (`skill://principle-laziness-protocol`).

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, per the **redesign-from-first-principles** principle skill (`skill://principle-redesign-from-first-principles`), so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. No graft is needed. If they wildly diverge, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

Verify the synthesized artifact like any other output, per the **prove-it-works** principle skill (`skill://principle-prove-it-works`). If verification finds a problem the arena missed, either Phase A was wrong (re-frame and re-run) or a candidate caught it and you missed the graft (go back to Phase E). Don't paper over it.

## Outputs

One synthesized artifact, with a short synthesis note alongside naming the base and why, the cross-judge's verdict or that Phase C skipped the judge, each graft with its source candidate, what was rejected and why, any convergence or dropouts, and the verification result.
