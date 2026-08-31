# Risks

| # | Risk | Handling |
|---|---|---|
| 1 | Model-control APIs need the `open-sdk` fork, not stock OMP | Answer in Phase A. If true, express model choice through agent roles + effort, treat direct model control as `DEFER`. |
| 2 | OMP extension API moves | Pin OMP version + sha in Phase A. Test against one version at a time. |
| 3 | Reference port is stale, and upstream `main` moves under us with no tags to anchor to | Pin to a full commit sha of `cursor/plugins`. Read reference once in Phase A as a worked example — trust `omp-src` and the pinned pstack snapshot, not the reference. |
| 4 | Prompt duplication between commands, skills, agents | Commands are thin wrappers. Agents read the same skill files as the main agent. Reviewed in Phase B. |
| 5 | Unbounded parallel cost or slowness | Phase D measures the local concurrency ceiling and sets per-skill widths from it. |
| 6 | Wording drift in `portable` files | Any wording change means marking the file `adapted`. Enforced by review. |
| 7 | Command name collision | Namespace `/pstack:<name>`. Short aliases off by default. |
| 8 | Scope creep — "port every Cursor thing" | Matrix has `DEFER` and `DROP`. Every row has one action, with a reason. |
| 9 | Claude branding leaks into shipped text | Branding check on every commit. |
| 10 | Auto mode injects too much at session start | Short hint only; full skill loads on invocation. Off by default. |
| 11 | Upstream licence forbids redistributing a derivative | Confirm licence in Phase A, before any porting. If unclear, stop and escalate. |
| 12 | Small local model makes silent, plausible errors | Mechanical checks (branding, frontmatter, upstream diff, conformance). Human review on every `adapted` file. |
| 13 | Auto-applied `portable` diffs on sync break references silently | Portable diffs are *proposed*, not auto-committed. Agent reviews each patch. |
| 14 | Conformance results reflect model weakness, not port bugs | Run suite on the local model **and** a stronger baseline. Local-only failures are model findings. |
