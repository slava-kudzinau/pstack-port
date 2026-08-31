---
name: bug-fix
description: Reproduce a defect, root-cause it, and fix with runtime evidence. Routed from poteto-mode's Bug fix trigger, or invoked directly for "fix this bug", "why does X crash", "there's a race in Y".
upstream: pstack/skills/poteto-mode/playbooks/bug-fix.md
upstream_sha: fd878692de15a3069c21c8f429eb0b9f2fe178fa
upstream_version: 0.14.5
status: adapted
note: control-cli/control-ui replaced with OMP's bash/browser/debug tools; the Task tool and the gpt-5.6-sol-max slug replaced with the task tool's agent field and a configured model role; Cursor's /loop replaced with plain iteration language. Dropped skill:// pointers to architect/tdd/sequence-verifiable-units/opening-a-pr/how/why — not ported in this slice; steps inlined instead so nothing dangles.
---

# Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents, stay in the lead.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix; it does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Reproduce it yourself on the matching surface: `bash` for a CLI or TUI, `browser` for a web or Electron UI, `debug` for a running process. Don't hand the repro to the user. Ask the user only with a stated, specific reason the surface cannot reach the target, and only after driving it as far as it goes. Won't reproduce directly, force it: synthesize the trigger, tighten conditions, or instrument until it fires. A bug you can't reproduce, you can't prove fixed.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Confirm the surviving mechanism with runtime evidence before planning the fix; a design grounded on a plausible-but-unconfirmed cause can be wrong while the real cause sits one subsystem over.
3. Plan the fix. Delegate implementation to a subagent via the `task` tool with a specific scope; review the diff.
4. Verify on the same surface; the original repro now passes. "Inconclusive" or wrong-surface is not a pass; flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history; the diff tells the story.
6. Open the PR: small ordered commits, evidence in the description.

**Reply:** what was broken, root cause, fix, how you verified. Paste failing-then-passing repro output verbatim.
