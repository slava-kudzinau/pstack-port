---
name: visual-parity
description: Pixel-exact UI equivalence, verified by image diff not by eye. Routed from poteto-mode's Visual parity trigger, or invoked directly for "make X match Y exactly", styling-system migrations, or porting a UI across frameworks.
disable-model-invocation: true
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/visual-parity.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
---

# Visual parity

**You own pixel-exact equivalence. The baseline is the spec; you do not touch it.** For "make X match Y exactly", styling-system migrations, porting a UI across frameworks. Equivalence is verified by image diff, not by eye.

1. Establish the baseline first, before any migration: a visual regression harness that screenshots the current component across its states, plus the target when matching two implementations. No baseline, no parity claim. A blocking prerequisite, not a follow-up.
2. Anti-shortcut clauses, stated and held: no harness modifications, no baseline tampering, no component restructuring to make a diff pass. If the baseline looks wrong, stop and ask, don't edit it.
3. Migrate one component at a time. Each is an independent artifact, so parallelize across worktrees, one owner per component (the **separate-before-serializing-shared-state** principle skill, `skill://principle-separate-before-serializing-shared-state`). Shared primitives migrate first as a blocking phase.
4. Verify each component against its baseline via image diff on the matching surface, using the `browser` tool. A nonzero diff is a fail; investigate the pixel delta, don't wave it through. Keep iterating per component until the diff is zero.
5. Run **Opening a PR** (`skill://opening-a-pr`) per component or per safe batch.

**Reply:** components migrated, the diff result for each, the baseline harness location, what's left.
