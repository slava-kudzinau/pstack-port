---
name: session-pickup
description: Resume or take over a prior agent's in-flight work by reading its trail instead of redoing it. Routed from poteto-mode's Session pickup trigger, or invoked directly for "take over this", "resume this conversation", "continue from <transcript path>", "you're taking over", "pick up where X left off", or a pushed branch you're meant to continue.
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/session-pickup.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: 'The agent-transcripts/ directory and ~/.cursor/projects/*/ / cloud-agent-URL handoff (session-pickup.md:7) rewritten to OMP\'s history://<id> transcript read plus hub for a still-live peer, dropping the workspace-boundary caveat since history:// is already scoped. Bold cross-references to principle-guard-the-context-window (line 7) and principle-prove-it-works (line 11) rewritten to skill:// pointers.'
---

# Session pickup

**You own the resume point. Read the prior trail, don't redo it.** For "take over this", "resume this conversation", "continue from <transcript path>", "you're taking over", "pick up where X left off", or a pushed branch you're meant to continue.

A pickup is inheritance. The prior agent already paid the cost of reading the code, running the repros, making the design choices. Redoing loses the bias check and burns context. Resist the urge to re-derive; read.

1. Locate the prior trail. If the prior agent is still a live, idle, or parked peer, read its record via `history://<id>` (or bare `history://` to list agents) or reach it directly through `hub`; otherwise work from a pushed branch you're meant to continue. Read the metadata overview and last messages first, then scan back for the decision points. Parse a long transcript in a subagent and keep the reduced timeline in the main thread (the **principle-guard-the-context-window** skill, `skill://principle-guard-the-context-window`).
2. Reconstruct operational state. The branch and worktree, what already landed (`git log`, `git diff` against the base), the open todos, the decisions made. The prior trail is authoritative input. Resist the bias to re-derive it.
3. Diff done vs pending. Compare what shipped against what was planned, name the resume point, do not re-run the prior repro or redo completed work. A "let me verify from scratch" pass is the tell that you're treating the trail as untrustworthy when it's actually authoritative.
4. Route the remaining work to the matching playbook and pick the verdict: continue the execution, ship a finished recommendation, ratify or override a prior conclusion, or postmortem a failed run. The pickup playbook ends here; the routed playbook owns the rest.
5. Verify the inherited claims against the original goal on the real artifact (the **principle-prove-it-works** skill, `skill://principle-prove-it-works`). A passing prior self-report is not the proof.

**Reply:** where the prior agent stopped, what you inherited vs redid (ideally nothing redone), the resume point, and the outcome.
