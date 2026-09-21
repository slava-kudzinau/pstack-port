---
name: runtime-forensics
description: Diagnose a live symptom (leak, idle-cpu spin, glitch) by instrumenting the running process, not by theorizing from source. Routed from poteto-mode's Runtime forensics trigger, or invoked directly for "why is X leaking at runtime", "why is this idle but busy", "there's an intermittent glitch in Y".
disable-model-invocation: true
---

# Runtime forensics

**You own the diagnosis. Instrument the live process, don't theorize from source.** The deliverable is a cited diagnosis, not a fix.

1. Capture the live signal on the matching surface: `bash` for a CLI or TUI process, `browser` for a web or Electron UI, `debug` for a running process. A CPU profile for a spinning process, a heap snapshot for a leak, a CDP trace via `browser` for a visual glitch. A real artifact, not a guess.
2. Reduce the artifact to the smoking gun: the function on the hot path, the retainer chain from the leaked object to a GC root, the loop firing without input. Parse large artifacts in a subagent (the **principle-guard-the-context-window** skill, `skill://principle-guard-the-context-window`), keep the reduced finding in the main thread.
3. Prove the mechanism before believing it. Inject instrumentation via the `browser` tool's evaluate on a web surface, or the `debug` tool's evaluate on any other running process, to confirm the hypothesis cheaply without reloading.
4. Map the finding back to source: file, symbol, the line that allocates or schedules.
5. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the signal captured, the reduced finding, how you proved the mechanism, the source location, artifact paths. No fix unless asked. Hand back to the **bug-fix** skill (`skill://bug-fix`) or the **perf-issue** skill (`skill://perf-issue`) once the cause is known.
