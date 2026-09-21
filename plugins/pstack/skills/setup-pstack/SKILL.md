---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects your available models and writes an always-applied rule that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write `~/.claude/pstack-models.md`, imported from `CLAUDE.md` as `@pstack-models.md`, a memory file that sets pstack's model per role.

## Steps

### 1. Detect available models

Enumerate the model slugs you can pass to a `Agent` subagent in this session. That is the dependable source. If Claude Code's `/model` picker lists the models this account is entitled to, prefer it for completeness. If you cannot detect any, ask the user to paste the slugs they have access to. Never write a real slug you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

### 2. Load current state

The default role-to-model mapping is the rule shape shown in step 5 below. If `~/.claude/pstack-models.md`, imported from `CLAUDE.md` as `@pstack-models.md` already exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from those defaults.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Prefer AskUserQuestion over free text. Offer these four options with these exact labels, and name the current budget when the rule records one.

- `unlimited — keep max`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** Build the working table from the skill defaults, and on a re-run keep any role you changed by family, list, or alias (`inherit-parent`, `auto`). `unlimited` leaves every effort as in that table. `large`, `medium`, and `small` set the effort token of every real slug, panel entries included, to `xhigh`, `high`, or `medium`. The effort token is the last token, or the one before a trailing `fast`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. If the result is not a detected slug, use the same family's detected slug with the highest effort at or below the target, else mark the role as needing a choice. `inherit-parent` and `auto` do not change. So `small` takes every default real slug to its family's medium-effort variant, and `large` to its xhigh-effort variant. The mapping never invents a slug that detection did not list.

**(c) Show the roles and confirm.** Show every role with its model, marking any real slug not in the detected set as needing a choice. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` and `auto` (both mean: this role runs on the parent chat model, which is how Auto users stay on Auto) as the options. Prefer AskUserQuestion over free text. For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real slug written must be in the detected set. `inherit-parent` and `auto` always pass. If a chosen real slug is not available, stop and ask again.

### 5. Write the rule

Write `~/.claude/pstack-models.md` with a `# budget` line carrying the chosen label and its target effort and one line per role, imported from `CLAUDE.md` as `@pstack-models.md` so it reaches every new session, using the same labels poteto-mode uses. Overwrite the whole file so re-runs stay idempotent. Shape:

```
---
description: pstack per-role model choices (overrides what the skills say inline)
# imported from CLAUDE.md; Claude Code has no auto-applied rules directory
---
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit `model` from the call). Alias entries in a panel list still count toward its fan-out.
# budget: unlimited (max)
feature, refactoring: <detected-fast-code-slug>
bug-fix: <detected-fast-code-slug>
perf-issue: <detected-fast-code-slug>
hillclimb: <detected-fast-code-slug>
judgment and prose: <detected-judgment-slug>
hardest tasks: <detected-judgment-slug>
how explorer: <detected-fast-code-slug>
how explainer: <detected-judgment-slug>
why investigators: <detected-fast-code-slug>
why synthesizer: <detected-judgment-slug>
reflect tooling: <detected-tooling-slug>
reflect judgment, divergent, synthesizer: <detected-judgment-slug>
arena runners: <detected-judgment-slug>, <detected-tooling-slug>, <detected-fast-code-slug>, <detected-heavy-slug>
arena cross-judge pool: <detected-judgment-slug>, <detected-tooling-slug>, <detected-fast-code-slug>, <detected-heavy-slug>
swarm workers: <detected-fast-code-slug>
architect runners: <detected-judgment-slug>, <detected-tooling-slug>, <detected-fast-code-slug>, <detected-heavy-slug>
interrogate reviewers: <detected-judgment-slug>, <detected-tooling-slug>, <detected-fast-code-slug>, <detected-heavy-slug>
```

### 6. Confirm

Tell the user the rule was written and that it applies to new sessions. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill` (resolves wherever pstack is installed: workspace, user, or plugin). On no, move on without pushing.
