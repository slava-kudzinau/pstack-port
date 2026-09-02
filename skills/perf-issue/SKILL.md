---
name: perf-issue
description: Trace a measured slowness and improve it against a baseline. Routed from poteto-mode's Perf issue trigger, or invoked directly for a measured slowdown to fix against a captured trace.
disable-model-invocation: true
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/perf-issue.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: 'control-cli/control-ui baseline-trace step rewritten to bash/browser/debug (perf-issue.md:5); how/architect/sequence-verifiable-units/Opening a PR/Hillclimb playbook mentions rewritten as skill:// references (perf-issue.md:6,16,17,20,22); gpt-5.6-sol-max model slug deleted, replaced with a configured model role reached via the task tool (perf-issue.md:16).'
---

# Perf issue

**You own the measurement story. Plan, review, verify the numbers.** Tie every fix to a measurement, don't read source instead of measuring.

1. Capture a baseline trace with the tool matching the surface: `bash` for a CLI or TUI, `browser` for a web or Electron UI, `debug` for a running process.
2. `skill://how` to ground hypotheses; don't claim a perf ceiling without running it first.
   Most fixes come from eight strategy families. Use them as hypothesis generators, not a checklist. A family earns an attempt only when the trace shows the signal it names, and a focused fix for the dominant cost beats applying all eight.
   - **Elimination.** The cheapest work is work that doesn't run. Before optimizing the hot path, ask whether it needs to exist: a computation nobody consumes, a feature gate that's always off for this user, a sync that redundantly mirrors state, a legacy path kept "just in case". The trace shows what's slow, never that it's deletable, so this family needs the `skill://how` pass, not the profiler. Deleting the work beats every other family when it applies.
   - **Divide and conquer.** The dominant cost scales with input size. Split the work so each piece touches less (chunk, shard, prune the search space) or so independent pieces run in parallel.
   - **Caching.** The same computation or fetch repeats on identical inputs. Store and reuse the result; name what invalidates it before claiming the win.
   - **Indirection.** The hot path does expensive work a cheaper intermediate could absorb: an index instead of a scan, a queue that shifts work off the interactive thread, a handle that lets a cheaper implementation swap in. Add the hop only when it removes more from the critical path than it adds; a layer that sits on the hot path without removing work is pure cost.
   - **Batching.** Many small operations each pay a fixed overhead (RPC, query, syscall, draw call). Coalesce them to pay the overhead once per batch.
   - **Redundancy.** The wait hangs on one slow instance or attempt. Duplicate the work (replicas, hedged requests, speculative execution) and take the fastest result. This trades extra load for lower tail latency, so the trace has to show the wait dominates and the system has headroom; duplication without that tradeoff only adds load.
   - **Lazy evaluation.** Cost lands on results that are never used or not needed yet (eager init on the boot path, rendering offscreen items). Defer the work until first use.
   - **Scheduling.** The work must happen, but not during the interactive moment. Move it to where nobody is waiting: idle callbacks, a background warmup after boot, precompute before the user arrives, cleanup after the frame commits. Distinct from Lazy (later-when-needed): Scheduling often runs the work *earlier* than the hot moment, or in its shadow. The win is perceived latency, so measure the interactive path, not total work done.
3. Plan the fix from the trace. If it crosses a function boundary, `skill://architect` first. Delegate implementation to a subagent via the `task` tool using your configured perf-issue model role; review the diff. Capture a post-fix trace.
   Apply `skill://principle-sequence-verifiable-units`, verifying each attempt before trying the next.
4. Parse and compare the artifacts (JSON to sqlite, diff). "Inconclusive" or wrong-surface is not a pass; flag it.
5. Cite the measurement in the PR.
6. Run `skill://opening-a-pr`.

For sustained improvement against a metric rather than a one-off fix, use `skill://hillclimb`.

**Reply:** baseline number, post-fix number, delta, artifact path.
