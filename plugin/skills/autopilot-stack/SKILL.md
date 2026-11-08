---
name: autopilot-stack
description: Build and verify one linear base-branch stack with full autonomy, then hand the operator the reviewed chain to land. Routed from poteto-mode's Autopilot-stack trigger, or invoked directly for "autopilot-stack", "stack them, don't ship", "build the stack, I'll land it".
disable-model-invocation: true
---

# Autopilot-stack

Run `skill://autopilot-full`, but do not merge.

1. **In place of step 5, stop at verified.** Stop when each PR is verified and green at its current head, then hand the PRs to the operator. After the handoff, nobody pushes without the operator's go. Every loop tick prompt names this skill, so each tick sees the no-merge rule.
2. **Stack a PR only when it builds on another PR.** This is the one exception to step 3. Base the PR on the other PR's branch in place of trunk, per **Size and stacks** in `skill://opening-a-pr`. In place of step 2's rebase onto trunk, each PR rebases onto its parent PR's branch, and the stack root rebases onto trunk. A new head on the lower PR restacks the PRs above it, and a PR whose `git patch-id` the restack leaves unchanged keeps its verdict.

**Reply:** list each PR with its verdict, in place of what merged.
