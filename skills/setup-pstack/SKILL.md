---
name: setup-pstack
description: Configure which models pstack uses per role. Detects your available model roles and writes a config file that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", or changing pstack's model choices.
metadata:
  upstream: 'pstack/skills/setup-pstack/SKILL.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: "Target file moved from `~/.cursor/rules/pstack-models.mdc` (with Cursor's `alwaysApply: true` rule frontmatter, SKILL.md:8,30) to a plain `~/.omp/agent/pstack-models.md` that pstack skills `read` directly on demand — OMP's task tool sets only `agent`, never a worker model, so model routing is config/agent-frontmatter driven, not a value this file's readers pass into a spawn call (task-agent-discovery.md). The four literal per-model-family slug examples (SKILL.md:39-56) are replaced with generic `@<role>`-shaped placeholders — real OMP role aliases resolve through `modelRoles.<role>` in `~/.omp/agent/config.yml` (models.md). `AskQuestion` (:22) rewritten to the `ask` tool. `inherit-parent`/`auto` (:14,22) rewritten to `@default`, OMP's built-in default-model role alias (models.md: \"`*` selects `@default`\"). `/create-verification-skill` (:68) rewritten to `skill://create-verification-skill`."
---

# Setup pstack

Write `~/.omp/agent/pstack-models.md`, a config file that sets pstack's model role per role label. The skills read it and fall back to their inline defaults when a line is absent, so this is an override layer, not a requirement.

## Steps

### 1. Detect available models

Enumerate the model selectors and role aliases available in this session (`omp models` lists every configured model; `/model` shows the same grouped by provider; `~/.omp/agent/config.yml`'s `modelRoles` lists configured `@role` aliases). That is the dependable source. If you cannot detect any, ask the user to paste the selectors they have access to. Never write a real selector you have not confirmed is available. `@default` is always valid even though it isn't a detected selector — it resolves to the session's own default model.

### 2. Load current state

The default role-to-model mapping is the shape shown in step 5 below. If `~/.omp/agent/pstack-models.md` already exists, read it and treat its values as the current choices. Otherwise start from those defaults.

### 3. Map and confirm

Show every role with its current model, marking any real selector not in the detected set as needing a choice. Ask whether to accept as-is or change specific roles, offering the detected models plus `@default` (this role runs on the session's default model, which is how a user without a preference stays on their normal model) as the options. Prefer the `ask` tool over free text. For panel roles (how critics, arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real selector written must be in the detected set; `@default` always passes. If a chosen real selector is not available, stop and ask again. A config pointing at a model the user cannot use breaks every delegation that reads it.

### 5. Write the config

Write `~/.omp/agent/pstack-models.md` with one line per role, using the same labels poteto-mode uses. Overwrite the whole file so re-runs stay idempotent. Shape:

```
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `@default` as a value: the role runs on the session's default model. Alias entries in a panel list still count toward its fan-out.
feature, refactoring: @<fast-role>
bug-fix: @<precise-role>
perf-issue: @<precise-role>
hillclimb: @<precise-role>
judgment and prose: @<judgment-role>
hardest tasks: @<judgment-role>
how explorer: @<fast-role>
how explainer: @<judgment-role>
how critics: @<judgment-role>, @<precise-role>, @<fast-role>, @<panel-role>
why investigators: @<fast-role>
why synthesizer: @<judgment-role>
reflect tooling: @<precise-role>
reflect judgment, divergent, synthesizer: @<judgment-role>
arena runners: @<judgment-role>, @<precise-role>, @<fast-role>, @<panel-role>
arena cross-judge pool: @<judgment-role>, @<precise-role>, @<fast-role>, @<panel-role>
swarm workers: @<fast-role>
architect runners: @<judgment-role>, @<precise-role>, @<fast-role>, @<panel-role>
interrogate reviewers: @<judgment-role>, @<precise-role>, @<fast-role>, @<panel-role>
```

Each `@<...-role>` is a placeholder: substitute the user's actual configured `@role` alias (or a concrete `provider/modelId` selector) detected in step 1.

### 6. Confirm

Tell the user the config was written and that it applies to new sessions. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with `skill://create-verification-skill`." On yes, invoke `skill://create-verification-skill`. On no, move on without pushing.
