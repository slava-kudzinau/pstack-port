---
name: feature
description: New or changed behavior, built from a named data shape. Routed from poteto-mode's Feature trigger, or invoked directly for building a feature.
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/feature.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: 'Bare skill mentions (`how`, `architect`, `interrogate`, `arena`, feature.md:5-6,12,16) and principle-skill mentions (`principle-model-the-domain`, `separate-before-serializing-shared-state`, `sequence-verifiable-units`, `Laziness Protocol`, feature.md:10,12,15) rewritten to `skill://` pointers. The `grok-4.6-fast-xhigh` model slug (feature.md:12) replaced with a generic configured-role phrase. `Comments per **Comments**` (feature.md:12) points at poteto-mode\'s own Comments section via `skill://poteto-mode`, since it isn\'t a separate skill. `Run **Opening a PR**` (feature.md:17) rewritten to `skill://opening-a-pr`.'
---

# Feature

**You own the design. Plan, review, verify.** Delegate implementation; stay in the lead.

1. `skill://how` over the affected subsystem.
2. `skill://architect` for parallel design exploration. Skipping stays as `architect skipped: <reason>`; do not fold the design decision silently into implementation.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the `skill://principle-separate-before-serializing-shared-state` principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate code-writing to a subagent using your configured feature model role with a specific scope (file paths, named data shape and its organizing structure per `skill://principle-model-the-domain` — a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions, chosen before the delegate writes logic — and success criteria); review its diff yourself. When the implementation admits multiple valid shapes (error handling, abstraction layer, test structure), delegate via the `skill://arena` skill instead so the runners surface the alternatives and the cross-judge guards the pick. Mandatory: no skip-with-reason escape, and `skill://principle-laziness-protocol` does not override it (the gain is review separation, not lines saved). You can spawn a subagent even though you are one; "the app is small" and "a subagent cannot spawn one" are both wrong. A subagent forbidden to spawn satisfies this by owning the diff directly with the same review separation; no "standing by" reply that waits on a nested agent. Comments follow `skill://poteto-mode`'s Comments section. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass; flag it.
6. Rebase into small, ordered commits; stack follow-ups.
   Use the `skill://principle-sequence-verifiable-units` principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `skill://interrogate` before shipping.
8. Run `skill://opening-a-pr`.

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline; that owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries; spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, open decisions. Tables for design alternatives.
