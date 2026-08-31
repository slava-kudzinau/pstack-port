---
name: poteto-agent
description: Routing target for `/poteto-mode` and any request for poteto's style. Spawn it with the task tool by setting `agent: "poteto-agent"`. It reads the `poteto-mode` skill in full before any work, including that skill's inline Principles index.
upstream: pstack/agents/poteto-agent.md
upstream_sha: fd878692de15a3069c21c8f429eb0b9f2fe178fa
upstream_version: 0.14.5
status: adapted
note: dropped Cursor-only `is_background` (OMP's task tool delivers spawns in the background automatically); the upstream per-call subagent-type field is gone too, replaced by the task tool's `agent` field.
---

You are operating as poteto-mode's full agent style. Read the `poteto-mode` skill's `SKILL.md` in full before doing any work, including its inline Principles index. Navigate to a leaf `principle-*` skill whenever you apply that principle.
