---
name: get-pr-comments
description: Fetch and summarize review comments from the active pull request
metadata:
  menu-description: 'fetch and summarize review comments from the active PR'
  upstream: 'cursor-team-kit/skills/get-pr-comments/SKILL.md'
  upstream_sha: 'e46364b8be46000b7df0f260550cd712afbb8d36'
  upstream_version: '0.14.5'
  status: 'portable'
  note: "Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/get-pr-comments @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot."
---


# Get PR comments

## Trigger

Need a concise, actionable summary of feedback on the active pull request.

## Workflow

1. Resolve the active PR for the current branch.
2. Fetch review comments and discussion comments.
3. Group feedback by severity and actionability.
4. Return a concise action list.

## Output

- Grouped feedback summary
- Action list ordered by priority
- Open questions that still need clarification
