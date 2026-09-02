---
name: de-slop
description: Remove AI-generated code slop and clean up code style
disable-model-invocation: true
metadata:
  menu-description: 'deslop a diff before commit'
  upstream: 'cursor-team-kit/skills/de-slop/SKILL.md'
  upstream_sha: 'e46364b8be46000b7df0f260550cd712afbb8d36'
  upstream_version: '0.14.5'
  status: 'portable'
---


# Remove AI code slop

Check the diff against main and remove AI-generated slop introduced in the branch.

## Focus Areas

- Extra comments that are unnecessary or inconsistent with local style
- Defensive checks or try/catch blocks that are abnormal for trusted code paths
- Casts to `any` used only to bypass type issues
- Deeply nested code that should be simplified with early returns
- Other patterns inconsistent with the file and surrounding codebase

## Guardrails

- Keep behavior unchanged unless fixing a clear bug.
- Prefer minimal, focused edits over broad rewrites.
- Keep the final summary concise (1-3 sentences).
