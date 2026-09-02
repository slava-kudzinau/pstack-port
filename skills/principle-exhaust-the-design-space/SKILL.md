---
name: principle-exhaust-the-design-space
description: Apply when facing a novel UI interaction or architectural decision with no precedent in the codebase. Build 2-3 competing prototypes and compare side by side before committing.
disable-model-invocation: true
metadata:
  upstream: 'pstack/skills/principle-exhaust-the-design-space/SKILL.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: 'Ported verbatim. The body names no Cursor tool, model slug, or cross-skill link to rewrite.'
---

# Exhaust the Design Space

When a novel interaction or architectural decision has no established precedent, explore several concrete alternatives before implementation. Building the wrong thing costs more than exploring three options.

**The rule.** When the right answer is not obvious, build 2-3 competing prototypes or sketches. Compare them side by side. Only then commit. Design it twice is this rule by another name. A second flavor of the first shape does not count.

**When it applies:**
- Novel UI interactions (no prior art in the codebase)
- Architectural choices with multiple viable approaches
- Product design decisions where user experience depends on feel, not logic

**When it doesn't:**
- Mechanical implementation where the pattern is established
- Bug fixes or refactors with a clear target state
- Changes where constraints dictate a single viable approach
