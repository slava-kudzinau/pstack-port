---
name: what-did-i-get-done
description: Summarize authored commits over a user-specified time period into a concise update
disable-model-invocation: true
metadata:
  menu-description: 'summarize authored commits over a user-chosen period'
  upstream: 'cursor-team-kit/skills/what-did-i-get-done/SKILL.md'
  upstream_sha: 'e46364b8be46000b7df0f260550cd712afbb8d36'
  upstream_version: '0.14.5'
  status: 'portable'
  note: "Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/what-did-i-get-done @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot."
---


# What did I get done

## Trigger

Need a short, high-signal summary of work completed in a specific time range (for example: yesterday, last 3 days, or last week).

## Workflow

1. Resolve the requested time window into concrete dates.
2. Read commits authored by the current git user email within that range.
3. Exclude merge commits and uncommitted changes.
4. Synthesize the most important shipped changes into a concise status update.
5. Include the actual date range used in the final summary.

## Guardrails

- Be extremely concise and information-dense.
- Prioritize substantial behavior or architecture changes.
- Omit cosmetic-only changes (formatting, imports, minor renames).
- Do not infer intent or motivation. Describe changes functionally.

## Output

- One short summary suitable for a status update
- Real date range
- Optional 2-5 bullets for major changes only
