---
name: get-pr-comments
description: Fetch and summarize review comments from the active pull request
disable-model-invocation: true
metadata:
  menu-description: 'fetch and summarize review comments from the active PR'
  upstream: 'cursor-team-kit/skills/get-pr-comments/SKILL.md'
  upstream_sha: 'e46364b8be46000b7df0f260550cd712afbb8d36'
  upstream_version: '0.14.5'
  status: 'portable'
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
