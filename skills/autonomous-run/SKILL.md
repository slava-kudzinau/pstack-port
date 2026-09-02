---
name: autonomous-run
description: Drive a long task to completion without stopping, against a checkable exit predicate you state up front. Routed from poteto-mode's Autonomous run trigger, or invoked directly for "run this until it's done, I'm going to bed", "keep going until every PR merges", "loop on this until the repro is fixed".
disable-model-invocation: true
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/autonomous-run.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
---

# Autonomous run

**You own the exit condition. Define done, then drive to it without stopping.** For "going to bed" / "run until done" / "keep going until X is true".

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N PRs merged, pixel-diff zero). A vague goal stalls; a predicate lets you stop.
2. Pick the wake mechanism. An event to watch (CI, a merge, a ref advancing) gets a watcher subagent, dispatched via the `task` tool, that reports back over `hub` when the event fires; block on it with `hub`'s `wait`, with a long time-based heartbeat as fallback. No event gets a fixed-interval heartbeat sized to when the result is worth re-checking — keep iterating and re-checking the predicate on that interval, not a named loop command.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits if it advanced, discards changes that didn't help. Belt-and-suspenders that "might help" gets reverted, not left to ride.
   Sequence the work via `skill://principle-sequence-verifiable-units`, verifying each unit before the next instead of batching checks at the end.
4. Mid-run discoveries are yours. Address broken skills, related bugs, flaky verifiers, review noise, tooling failures, orphaned follow-ups, and fixable drift yourself via `skill://poteto-mode`. Put out-of-band fixes in their own PR. Do not park reversible work for the human or use the `ask` tool. Surface only irreversible actions, genuine product or preference calls no experiment can settle, or a real dead end. Keep the predicate as the main drive, and return to it after each side fix.
5. Checkpoint every iteration via `skill://show-me-your-work`, a row for what changed and whether the predicate moved. A run with no trail can't be audited or resumed.
6. Stop when the predicate is met. A plateau is not a stop, so keep going and pivot your approach to push past it. Surface a genuine dead end rather than spinning, and never relax the predicate to declare victory.

**Reply:** the exit condition, iterations run, what landed, what was discarded, final predicate state.
