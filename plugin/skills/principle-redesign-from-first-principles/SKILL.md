---
name: principle-redesign-from-first-principles
description: Apply when integrating a new requirement into an existing design. Redesign as if the requirement had been a foundational assumption from day one, instead of bolting it on.
disable-model-invocation: true
metadata:
  upstream: 'pstack/skills/principle-redesign-from-first-principles/SKILL.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
---

# Redesign From First Principles

When integrating a change, don't bolt it onto the existing design. Redesign as if the requirement had been there from the start. The result should look like what we would have built if we'd known on day one.

- Read all affected files and understand the current design holistically
- Ask: "if we were writing this from scratch with this new requirement, what would we build?"
- Propagate the change through every reference: types, docs, examples, rationale sections
- Think about the redesign holistically, then deliver it incrementally

This is the method for preserving option value when integrating changes into an existing design.
