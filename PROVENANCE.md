# Provenance changelog

Migration and sync notes for every ported artifact, one `## <path>` section
each, plus the `## Catalog` state table below. All of it lives outside the
shipped trees so OMP never pays these tokens at runtime: the provenance
fields (`upstream`, `upstream_sha`, `upstream_version`, `status`) are gone
from shipped frontmatter, where every `skill://` read served them to the
model and OMP consumed none of them. The table is the machine state
(`bun scripts/provenance.ts --check` audits it, `--migrate` appends rows,
`scripts/classify-diff.ts` and `scripts/generate-report.ts` read it).

Append a section per artifact on each upstream sync. Never rewrite an old
section; add a newer one below it. Flip an artifact's `Status` by editing
its table row, never by restating a claim in a section.

## Catalog

One row per shipped artifact (`skills/**`, `commands/*.md`, `agents/*.md`,
`hooks/*.md`), package-root-relative, sorted. `Upstream` is repo-root
resolvable or `none`. `Sync` is the 8-char pin the row was authored
against; full shas live in UPSTREAM.md. `Status` is one of
portable / adapted / omp-native / new. This table is machine state:
existing rows are never overwritten by the migrate mode, and
`bun scripts/provenance.ts --check` audits it. Sections below are
append-only history. Provenance never returns to shipped frontmatter.

| Path | Upstream | Sync | Status |
|---|---|---|---|
| agents/comment-sicko.md | upstream/pstack/agents/comment-sicko.md | efa2a531 | adapted |
| agents/poteto-agent.md | upstream/pstack/agents/poteto-agent.md | efa2a531 | adapted |
| commands/pstack:architect.md | none | efa2a531 | new |
| commands/pstack:arena.md | none | efa2a531 | new |
| commands/pstack:automate-me.md | none | efa2a531 | new |
| commands/pstack:blast-radius.md | none | efa2a531 | new |
| commands/pstack:bro.md | none | efa2a531 | new |
| commands/pstack:create-verification-skill.md | none | efa2a531 | new |
| commands/pstack:de-slop.md | none | e46364b8 | new |
| commands/pstack:figure-it-out.md | none | efa2a531 | new |
| commands/pstack:fix-ci.md | none | e46364b8 | new |
| commands/pstack:fix-merge-conflicts.md | none | e46364b8 | new |
| commands/pstack:get-pr-comments.md | none | e46364b8 | new |
| commands/pstack:how.md | none | efa2a531 | new |
| commands/pstack:interrogate.md | none | efa2a531 | new |
| commands/pstack:maintain-verification-skill.md | none | efa2a531 | new |
| commands/pstack:make-pr-easy-to-review.md | none | e46364b8 | new |
| commands/pstack:no-comments.md | none | efa2a531 | new |
| commands/pstack:poteto-mode.md | none | efa2a531 | new |
| commands/pstack:recall.md | none | efa2a531 | new |
| commands/pstack:reflect.md | none | efa2a531 | new |
| commands/pstack:setup-pstack.md | none | efa2a531 | new |
| commands/pstack:show-me-your-work.md | none | efa2a531 | new |
| commands/pstack:swarm.md | none | efa2a531 | new |
| commands/pstack:tdd.md | none | efa2a531 | new |
| commands/pstack:teach.md | none | efa2a531 | new |
| commands/pstack:technical-writing.md | none | efa2a531 | new |
| commands/pstack:thermo-nuclear-code-quality-review.md | none | e46364b8 | new |
| commands/pstack:typescript-best-practices.md | none | efa2a531 | new |
| commands/pstack:unslop.md | none | efa2a531 | new |
| commands/pstack:what-did-i-get-done.md | none | e46364b8 | new |
| commands/pstack:why.md | none | efa2a531 | new |
| hooks/session-start-context.md | refs/ref-port/plugins/pstack/hooks/session-start-context.md | c2ade4bb | adapted |
| skills/architect/SKILL.md | upstream/pstack/skills/architect/SKILL.md | efa2a531 | adapted |
| skills/architect/references/design-red-flags.md | upstream/pstack/skills/architect/references/design-red-flags.md | efa2a531 | portable |
| skills/architect/references/rationale-template.md | upstream/pstack/skills/architect/references/rationale-template.md | efa2a531 | adapted |
| skills/architect/references/runner-prompt.md | upstream/pstack/skills/architect/references/runner-prompt.md | efa2a531 | adapted |
| skills/arena/SKILL.md | upstream/pstack/skills/arena/SKILL.md | efa2a531 | adapted |
| skills/authoring-a-skill/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/authoring-a-skill.md | efa2a531 | adapted |
| skills/automate-me/SKILL.md | upstream/pstack/skills/automate-me/SKILL.md | efa2a531 | adapted |
| skills/autonomous-run/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/autonomous-run.md | efa2a531 | adapted |
| skills/autopilot-full/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/autopilot-full.md | efa2a531 | adapted |
| skills/autopilot-stack/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/autopilot-stack.md | efa2a531 | adapted |
| skills/babysit/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/babysit.md | efa2a531 | adapted |
| skills/blast-radius/SKILL.md | upstream/pstack/skills/blast-radius/SKILL.md | efa2a531 | adapted |
| skills/bro/SKILL.md | upstream/pstack/skills/bro/SKILL.md | efa2a531 | portable |
| skills/bug-fix/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/bug-fix.md | efa2a531 | adapted |
| skills/create-verification-skill/SKILL.md | upstream/pstack/skills/create-verification-skill/SKILL.md | efa2a531 | adapted |
| skills/create-verification-skill/references/feature-map-example/README.md | upstream/pstack/skills/create-verification-skill/references/feature-map-example/README.md | efa2a531 | adapted |
| skills/create-verification-skill/references/feature-map-example/create-note.md | upstream/pstack/skills/create-verification-skill/references/feature-map-example/create-note.md | efa2a531 | portable |
| skills/create-verification-skill/references/feature-map-example/search.md | upstream/pstack/skills/create-verification-skill/references/feature-map-example/search.md | efa2a531 | portable |
| skills/de-slop/SKILL.md | refs/cursor-plugins/cursor-team-kit/skills/deslop/SKILL.md | e46364b8 | portable |
| skills/eval/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/eval.md | efa2a531 | adapted |
| skills/feature/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/feature.md | efa2a531 | adapted |
| skills/figure-it-out/SKILL.md | upstream/pstack/skills/figure-it-out/SKILL.md | efa2a531 | adapted |
| skills/fix-ci/SKILL.md | refs/cursor-plugins/cursor-team-kit/skills/fix-ci/SKILL.md | e46364b8 | portable |
| skills/fix-merge-conflicts/SKILL.md | refs/cursor-plugins/cursor-team-kit/skills/fix-merge-conflicts/SKILL.md | e46364b8 | portable |
| skills/get-pr-comments/SKILL.md | refs/cursor-plugins/cursor-team-kit/skills/get-pr-comments/SKILL.md | e46364b8 | portable |
| skills/hillclimb/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/hillclimb.md | efa2a531 | adapted |
| skills/how/SKILL.md | upstream/pstack/skills/how/SKILL.md | efa2a531 | adapted |
| skills/how/references/critic-prompt.md | upstream/pstack/skills/how/references/critic-prompt.md | efa2a531 | portable |
| skills/how/references/critique-rubric.md | upstream/pstack/skills/how/references/critique-rubric.md | efa2a531 | portable |
| skills/how/references/explainer-prompt.md | upstream/pstack/skills/how/references/explainer-prompt.md | efa2a531 | portable |
| skills/how/references/explorer-prompt.md | upstream/pstack/skills/how/references/explorer-prompt.md | efa2a531 | portable |
| skills/interrogate/SKILL.md | upstream/pstack/skills/interrogate/SKILL.md | efa2a531 | adapted |
| skills/interrogate/references/code-quality-review.md | upstream/pstack/skills/interrogate/references/code-quality-review.md | efa2a531 | portable |
| skills/interrogate/references/lead-judgment.md | upstream/pstack/skills/interrogate/references/lead-judgment.md | efa2a531 | portable |
| skills/interrogate/references/reviewer-prompt.md | upstream/pstack/skills/interrogate/references/reviewer-prompt.md | efa2a531 | portable |
| skills/interrogate/references/rubric.md | upstream/pstack/skills/interrogate/references/rubric.md | efa2a531 | portable |
| skills/investigation/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/investigation.md | efa2a531 | adapted |
| skills/maintain-verification-skill/SKILL.md | upstream/pstack/skills/maintain-verification-skill/SKILL.md | efa2a531 | adapted |
| skills/make-pr-easy-to-review/SKILL.md | refs/cursor-plugins/cursor-team-kit/skills/make-pr-easy-to-review/SKILL.md | e46364b8 | portable |
| skills/multi-phase-plan/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md | efa2a531 | adapted |
| skills/no-comments/SKILL.md | upstream/pstack/skills/no-comments/SKILL.md | efa2a531 | adapted |
| skills/opening-a-pr/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/opening-a-pr.md | efa2a531 | adapted |
| skills/orchestrate/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/orchestrate.md | efa2a531 | adapted |
| skills/pause-safely/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/pause-safely.md | efa2a531 | adapted |
| skills/perf-issue/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/perf-issue.md | efa2a531 | adapted |
| skills/poteto-mode/SKILL.md | upstream/pstack/skills/poteto-mode/SKILL.md | efa2a531 | adapted |
| skills/principle-boundary-discipline/SKILL.md | upstream/pstack/skills/principle-boundary-discipline/SKILL.md | efa2a531 | portable |
| skills/principle-build-the-lever/SKILL.md | upstream/pstack/skills/principle-build-the-lever/SKILL.md | efa2a531 | adapted |
| skills/principle-encode-lessons-in-structure/SKILL.md | upstream/pstack/skills/principle-encode-lessons-in-structure/SKILL.md | efa2a531 | portable |
| skills/principle-exhaust-the-design-space/SKILL.md | upstream/pstack/skills/principle-exhaust-the-design-space/SKILL.md | efa2a531 | portable |
| skills/principle-experience-first/SKILL.md | upstream/pstack/skills/principle-experience-first/SKILL.md | efa2a531 | portable |
| skills/principle-fix-root-causes/SKILL.md | upstream/pstack/skills/principle-fix-root-causes/SKILL.md | efa2a531 | portable |
| skills/principle-foundational-thinking/SKILL.md | upstream/pstack/skills/principle-foundational-thinking/SKILL.md | efa2a531 | portable |
| skills/principle-guard-the-context-window/SKILL.md | upstream/pstack/skills/principle-guard-the-context-window/SKILL.md | efa2a531 | portable |
| skills/principle-laziness-protocol/SKILL.md | upstream/pstack/skills/principle-laziness-protocol/SKILL.md | efa2a531 | portable |
| skills/principle-make-operations-idempotent/SKILL.md | upstream/pstack/skills/principle-make-operations-idempotent/SKILL.md | efa2a531 | portable |
| skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md | upstream/pstack/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md | efa2a531 | portable |
| skills/principle-minimize-reader-load/SKILL.md | upstream/pstack/skills/principle-minimize-reader-load/SKILL.md | efa2a531 | adapted |
| skills/principle-model-the-domain/SKILL.md | upstream/pstack/skills/principle-model-the-domain/SKILL.md | efa2a531 | portable |
| skills/principle-never-block-on-the-human/SKILL.md | upstream/pstack/skills/principle-never-block-on-the-human/SKILL.md | efa2a531 | portable |
| skills/principle-outcome-oriented-execution/SKILL.md | upstream/pstack/skills/principle-outcome-oriented-execution/SKILL.md | efa2a531 | portable |
| skills/principle-prove-it-works/SKILL.md | upstream/pstack/skills/principle-prove-it-works/SKILL.md | efa2a531 | adapted |
| skills/principle-redesign-from-first-principles/SKILL.md | upstream/pstack/skills/principle-redesign-from-first-principles/SKILL.md | efa2a531 | portable |
| skills/principle-separate-before-serializing-shared-state/SKILL.md | upstream/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md | efa2a531 | portable |
| skills/principle-sequence-verifiable-units/SKILL.md | upstream/pstack/skills/principle-sequence-verifiable-units/SKILL.md | efa2a531 | adapted |
| skills/principle-subtract-before-you-add/SKILL.md | upstream/pstack/skills/principle-subtract-before-you-add/SKILL.md | efa2a531 | portable |
| skills/principle-type-system-discipline/SKILL.md | upstream/pstack/skills/principle-type-system-discipline/SKILL.md | efa2a531 | adapted |
| skills/prototype/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/prototype.md | efa2a531 | adapted |
| skills/recall/SKILL.md | upstream/pstack/skills/recall/SKILL.md | efa2a531 | adapted |
| skills/refactoring/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/refactoring.md | efa2a531 | adapted |
| skills/reflect/SKILL.md | upstream/pstack/skills/reflect/SKILL.md | efa2a531 | adapted |
| skills/reflect/references/divergent-reviewer.md | upstream/pstack/skills/reflect/references/divergent-reviewer.md | efa2a531 | adapted |
| skills/reflect/references/judgment-reviewer.md | upstream/pstack/skills/reflect/references/judgment-reviewer.md | efa2a531 | adapted |
| skills/reflect/references/synthesizer.md | upstream/pstack/skills/reflect/references/synthesizer.md | efa2a531 | adapted |
| skills/reflect/references/tooling-reviewer.md | upstream/pstack/skills/reflect/references/tooling-reviewer.md | efa2a531 | adapted |
| skills/runtime-forensics/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/runtime-forensics.md | efa2a531 | adapted |
| skills/session-pickup/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/session-pickup.md | efa2a531 | adapted |
| skills/setup-pstack/SKILL.md | upstream/pstack/skills/setup-pstack/SKILL.md | efa2a531 | adapted |
| skills/shipping/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/shipping.md | efa2a531 | adapted |
| skills/show-me-your-work/SKILL.md | upstream/pstack/skills/show-me-your-work/SKILL.md | efa2a531 | adapted |
| skills/swarm/SKILL.md | upstream/pstack/skills/swarm/SKILL.md | efa2a531 | adapted |
| skills/tdd/SKILL.md | upstream/pstack/skills/tdd/SKILL.md | efa2a531 | portable |
| skills/teach/SKILL.md | upstream/pstack/skills/teach/SKILL.md | efa2a531 | adapted |
| skills/technical-writing/SKILL.md | upstream/pstack/skills/technical-writing/SKILL.md | efa2a531 | adapted |
| skills/thermo-nuclear-code-quality-review/SKILL.md | refs/ref-port/plugins/pstack/skills/thermo-nuclear-code-quality-review/SKILL.md | c2ade4bb | portable |
| skills/trace-forensics/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/trace-forensics.md | efa2a531 | adapted |
| skills/typescript-best-practices/SKILL.md | upstream/pstack/skills/typescript-best-practices/SKILL.md | efa2a531 | adapted |
| skills/unslop/SKILL.md | upstream/pstack/skills/unslop/SKILL.md | efa2a531 | portable |
| skills/visual-parity/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/visual-parity.md | efa2a531 | adapted |
| skills/what-did-i-get-done/SKILL.md | refs/cursor-plugins/cursor-team-kit/skills/what-did-i-get-done/SKILL.md | e46364b8 | portable |
| skills/why/SKILL.md | upstream/pstack/skills/why/SKILL.md | efa2a531 | adapted |
| skills/why/references/epistemics.md | upstream/pstack/skills/why/references/epistemics.md | efa2a531 | portable |
| skills/why/references/investigator-prompt.md | upstream/pstack/skills/why/references/investigator-prompt.md | efa2a531 | adapted |
| skills/why/references/source-playbook.md | upstream/pstack/skills/why/references/source-playbook.md | efa2a531 | adapted |
| skills/why/references/sources/code-archaeology.md | upstream/pstack/skills/why/references/sources/code-archaeology.md | efa2a531 | portable |
| skills/why/references/sources/databricks.md | upstream/pstack/skills/why/references/sources/databricks.md | efa2a531 | portable |
| skills/why/references/sources/datadog.md | upstream/pstack/skills/why/references/sources/datadog.md | efa2a531 | portable |
| skills/why/references/sources/incident-postmortem.md | upstream/pstack/skills/why/references/sources/incident-postmortem.md | efa2a531 | portable |
| skills/why/references/sources/linear.md | upstream/pstack/skills/why/references/sources/linear.md | efa2a531 | portable |
| skills/why/references/sources/notion.md | upstream/pstack/skills/why/references/sources/notion.md | efa2a531 | portable |
| skills/why/references/sources/sentry.md | upstream/pstack/skills/why/references/sources/sentry.md | efa2a531 | portable |
| skills/why/references/sources/slack.md | upstream/pstack/skills/why/references/sources/slack.md | efa2a531 | portable |
| skills/why/references/synthesizer-prompt.md | upstream/pstack/skills/why/references/synthesizer-prompt.md | efa2a531 | adapted |
| skills/worktree-cleanup/SKILL.md | upstream/pstack/skills/poteto-mode/playbooks/worktree-cleanup.md | efa2a531 | adapted |

## agents/comment-sicko.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Frontmatter is name+description only, same shape as upstream (the file never carried Cursor's per-call subagent-role field, a background-execution flag, or a model slug, so there was nothing to drop there). The Cursor slash-command reference to `/how`/`/why` (comment-sicko.md:26) rewritten to `skill://how`/`skill://why` pointers, matching the style in skills/poteto-mode/SKILL.md.

## agents/poteto-agent.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

dropped Cursor-only `is_background` (OMP's task tool delivers spawns in the background automatically); the upstream per-call subagent-type field is gone too, replaced by the task tool's `agent` field.

## commands/pstack:architect.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:arena.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:automate-me.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:blast-radius.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:bro.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:create-verification-skill.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:figure-it-out.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:how.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:interrogate.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:maintain-verification-skill.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:no-comments.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:poteto-mode.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream file — Cursor triggers poteto-mode from the skill's own frontmatter, with no separate command file. Shape follows the Codex prompt-stub pattern in refs/ref-port/tools/generate.mjs:106-108 (read once for this port), adapted for OMP's commands/*.md + $@ input expansion.

## commands/pstack:recall.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:reflect.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:setup-pstack.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:show-me-your-work.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:swarm.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:tdd.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:teach.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:technical-writing.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:typescript-best-practices.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:unslop.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## commands/pstack:why.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

no direct upstream command file — Cursor triggers skills from the skill's own frontmatter, no separate command file.

## skills/architect/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bold cross-skill mentions (how, why, arena, interrogate, and five principle skills) rewritten as `skill://` links (architect/SKILL.md:23,25,31,49,61,76-78). The literal architect-runner model slugs on line 33 deleted in favor of 'your configured model roles', per conventions §1. references/ carried over unchanged in path; runner-prompt.md and rationale-template.md ported alongside with their own cross-skill links rewritten.

## skills/architect/references/design-red-flags.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific content; copied unchanged aside from provenance frontmatter.

## skills/architect/references/rationale-template.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The cross-skill mention of arena (line 19, previously a relative markdown link) rewritten as a `skill://` link for consistency with the rest of the port. The self-referential link to architect's own Phase A section (line 7) is unchanged since it stays inside the same skill directory.

## skills/architect/references/runner-prompt.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bold principle-skill mentions rewritten as `skill://` links (six principle skills, plus the architect self-reference on line 5).

## skills/arena/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

N sequential Task spawns with run_in_background: true (SKILL.md:33) rewritten to one task batch call ({context, tasks[]}), per findings/matrix.md's arena row. Literal runner/cross-judge model slugs (SKILL.md:28,41) deleted in favor of 'your configured model roles', per conventions §1; the readonly judge subagent now names OMP's agent: "scout" role, its closest bundled read-only equivalent (task/agents.ts per findings/omp-format.md §1). ~/.cursor/rules/pstack-models.mdc rewritten to ~/.omp/agent/pstack-models.md, matching the setup-pstack matrix row's target path (findings/matrix.md:79) — that skill isn't ported in this batch, so the path is forward-referenced. Bold principle-skill mentions rewritten as skill:// links.

## skills/authoring-a-skill/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's built-in create-skill skill (authoring-a-skill.md:5, routed via poteto-mode/SKILL.md:5) rewritten to skill:// navigation plus OMP's manage_skill (list/inspect/validate) and learn (guided scaffolding) tools. encode-lessons-in-structure and opening-a-pr cross-references rewritten as skill:// pointers.

## skills/automate-me/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's built-in create-skill tool (SKILL.md:11,67,102,109) replaced with OMP's manage_skill/learn tools per the substitution contract. AskQuestion (SKILL.md:17,44) replaced with the ask tool. .cursor/skills/**/*-mode/SKILL.md and ~/.cursor/skills/*-mode/SKILL.md (SKILL.md:17,69) replaced with .omp/skills/<handle>-mode/SKILL.md and ~/.omp/agent/skills/<handle>-mode/SKILL.md, by analogy to the documented .omp/agents + ~/.omp/agent/agents split (findings/omp-format.md §1) — exact skill-root literal paths for project/user-personal skills aren't spelled out in findings/omp-format.md §2 beyond the non-recursive-layout fact, so this mapping is inferred by analogy, not independently verified. The upstream category-subdirectory placement option (.cursor/skills/<handle>/<handle>-mode/SKILL.md) dropped outright: OMP skill discovery is flat and non-recursive (findings/omp-format.md §2), so nested category directories aren't loadable. Cursor's agent-transcripts/ system-prompt directory and the ~/.cursor/projects/*/ workspace glob (SKILL.md:29) replaced with OMP's history:// internal URL scheme. 'Task xN' mining fan-out (SKILL.md:31) rewritten to a single task batch call.

## skills/autonomous-run/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's /loop (autonomous-run.md:6) rewritten to a watcher subagent dispatched via task, reporting back over hub with hub's wait as the block/heartbeat mechanism, replacing the named loop command with plain iterate-and-recheck language. AskQuestion (autonomous-run.md:9) rewritten to OMP's ask tool. sequence-verifiable-units, show-me-your-work, and poteto-mode cross-references rewritten as skill:// pointers.

## skills/autopilot-full/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor cloud agent owners (autopilot-full.md:2-6) rewritten to task spawns with isolated:true, one per task batch item; /goal (autopilot-full.md:5,10) rewritten to a standing per-turn brief, no named command; the 30-minute /loop audit cadence and cloud-sleeper wake chain (autopilot-full.md:10) rewritten to hub's wait with a 30-minute timeout, re-issued each tick; control-cli/control-ui (autopilot-full.md:8) rewritten to bash/browser/debug. Skill cross-references (orchestrate, prove-it-works, no-comments, babysit, show-me-your-work, swarm, shipping) rewritten as skill:// pointers; gt/gh stay literal as real external CLIs. Unresolved, left as generic prose rather than an invented OMP feature: the cursor-team-kit deslop skill and the ../references/bugbot-triage.md reference doc (autopilot-full.md:6) are both outside this port's vendored scope (conventions §5).

## skills/autopilot-stack/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor cloud agent owners (autopilot-stack.md:3,6) rewritten to task spawns with isolated:true, one per task batch item; /goal (autopilot-stack.md:3) rewritten to a standing per-turn brief, no named command; the 30-minute /loop audit cadence and cloud-sleeper wake chain (autopilot-stack.md:2) rewritten to hub's wait with a 30-minute timeout, re-issued each tick. Skill cross-references (autopilot-full, no-comments, babysit, show-me-your-work, swarm) rewritten as skill:// pointers; gt/gh stay literal as real external CLIs. Unresolved, left as generic prose rather than an invented OMP feature: the cursor-team-kit deslop skill and the ../references/bugbot-triage.md reference doc (autopilot-stack.md:1) are both outside this port's vendored scope (conventions §5).

## skills/babysit/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Disambiguation from a same-named built-in tool (babysit.md:3) reworded generically since it's OMP's own skill-precedence rule being invoked, not a Cursor product name. `playbooks/shipping.md` and bare `Shipping` mentions (babysit.md:3,5,18,23,25) rewritten to `skill://shipping`. "A cloud one plus a local one" (babysit.md:11) rewritten to a foreground-session-plus-background-`hub`-job example. Step 6's `scripts/watch-pr/watch-pr` script and its JSON verdict protocol plus Cursor's `/loop` (babysit.md:14-20) have no OMP equivalent and aren't ported; rewritten to `gh pr view`/`gh pr checks` polling via `bash`, a `hub` background job for the wait, and plain re-polling language, keeping the drive/background/threads-only/check mode split and the stack/queue stop rules. local fix: `../references/bugbot-triage.md` (babysit.md:22-23) is not part of this port, so both body citations are gone. Step 8 states the posture poteto-mode gives, verify each claim against the code on its own merits rather than a checklist. Step 9 offers a dismissal pattern as prose in its own PR instead of an entry in an absent rubric file.

## skills/blast-radius/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bold/backtick cross-skill mentions of how, why, arena, and unslop rewritten as skill:// links at first reference. No literal Task/run_in_background/model-slug tokens found in this file's actual body despite the matrix note's generic description (findings/matrix.md:67) — 'the tool that proves it' step (step 5) already reads as generic script/test language with no Cursor-specific tool name to substitute.

## skills/bro/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Upstream body has no Cursor-specific tool references, model slugs, or skill cross-references to rewrite; ported verbatim under the added provenance frontmatter.

## skills/bug-fix/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

control-cli/control-ui replaced with OMP's bash/browser/debug tools; the Cursor `Task` tool and its per-spawn subagent-role field replaced with the task tool's agent field; the literal model slugs deleted in favor of configured roles; Cursor's /loop rewritten as plain iteration language; all cross-references (how, why, architect, interrogate, tdd, sequence-verifiable-units, opening-a-pr) rewritten as skill:// pointers, since every target carries disable-model-invocation: true and is otherwise unreachable from the model listing.

## skills/create-verification-skill/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's `.cursor/skills/<name>/` project-skill path (create-verification-skill/SKILL.md:9,25,34) rewritten to OMP's flat project-root `skills/<name>/SKILL.md` layout (findings/omp-format.md §2). The `references/feature-map-example/` directory is ported unchanged alongside SKILL.md; it has no Cursor-isms to rewrite.

## skills/de-slop/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/deslop @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot.

## skills/eval/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The arena skill's Phase B/C mentions (eval.md:22-23) rewritten to `skill://arena`'s Phase B/C. Step 6's Cursor-specific transcript path (workspace `agent-transcripts/`, `~/.cursor/projects/*/`, eval.md:24) rewritten to OMP's `history://<id>` per candidate agent id, keeping the cross-session privacy guardrail.

## skills/feature/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bare skill mentions (`how`, `architect`, `interrogate`, `arena`, feature.md:5-6,12,16) and principle-skill mentions (`principle-model-the-domain`, `separate-before-serializing-shared-state`, `sequence-verifiable-units`, `Laziness Protocol`, feature.md:10,12,15) rewritten to `skill://` pointers. The `grok-4.6-fast-xhigh` model slug (feature.md:12) replaced with a generic configured-role phrase. `Comments per **Comments**` (feature.md:12) points at poteto-mode's own Comments section via `skill://poteto-mode`, since it isn't a separate skill. `Run **Opening a PR**` (feature.md:17) rewritten to `skill://opening-a-pr`.

## skills/figure-it-out/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bold cross-references to other pstack skills (poteto-mode, prove-it-works, never-block-on-the-human, foundational-thinking, architect, arena, laziness-protocol, separate-before-serializing-shared-state, sequence-verifiable-units, show-me-your-work, encode-lessons-in-structure — figure-it-out/SKILL.md:15,21,25,29,32-33,41,49,53) made addressable as skill:// URLs, since disable-model-invocation hides them from auto-discovery. No Cursor per-spawn dispatch fields, delegation tool names, model slugs, or background-flag constructs appear in the upstream body to rewrite.

## skills/fix-ci/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/fix-ci @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot.

## skills/fix-merge-conflicts/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/fix-merge-conflicts @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot.

## skills/get-pr-comments/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/get-pr-comments @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot.

## skills/hillclimb/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bold/bare skill and principle-skill mentions (`how`, `prove-it-works`, `build-the-lever`, `show-me-your-work`, `guard-the-context-window`, `separate-before-serializing-shared-state`, `sequence-verifiable-units`, `laziness-protocol`, hillclimb.md:5,7-9,12,16-17) rewritten to `skill://` pointers. The `Autonomous run playbook` cross-reference (hillclimb.md:16) rewritten to `skill://autonomous-run`. The `gpt-5.6-sol-max` model slug (hillclimb.md:12) replaced with a generic configured-role phrase. `Run **Opening a PR**` (hillclimb.md:19) rewritten to `skill://opening-a-pr`.

## skills/how/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Per-spawn dispatch fields naming the Cursor subagent-type and read-only flags (how/SKILL.md:47-49,66-68,78-80,115-117) rewritten to the `task` tool's `agent` field (`agent: "scout"` for read-only probes, `task/agents.ts:45-76`), dispatched as a single `task` batch call per fan-out step; the four literal vendor model slugs named as explorer/explainer/critic defaults deleted in favor of "your configured ... role" (conventions §1); unbolded "interrogate skill" mention (how/SKILL.md:126) made addressable as `skill://interrogate`. Upstream has no `disable-model-invocation`, so none is added here. `references/*.md` ported unchanged alongside SKILL.md; they only name generic Read/Grep/Glob tools, already OMP-native.

## skills/interrogate/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

N-reviewer `Task` spawn (SKILL.md:36) rewritten to one `task` batch call with `agent:"reviewer"` items; the upstream per-reviewer type field and the `readonly` flag, plus the literal vendor model-slug table (SKILL.md:38-48), dropped per conventions §1 (banned vendor slugs), replaced with generic configured-model-role language. The Cursor `~/.cursor/rules/pstack-models.mdc` config path (SKILL.md:36) has no confirmed OMP equivalent in this port — left as "your configured reviewer list" without naming a concrete OMP config path; flagging as unresolved rather than guessing one.

## skills/investigation/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bold cross-references to how/why/unslop/architect/babysit/bug-fix/feature rewritten as skill:// pointers so they resolve through OMP's discovery instead of dangling on a description match; the "(see Autonomy)" pointer now names the Autonomy section inside skill://poteto-mode explicitly.

## skills/maintain-verification-skill/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Two edits: the Cursor project-skill path `.cursor/skills/verify-*/` (SKILL.md:25) rewritten to OMP''s flat `skills/verify-*/` project skill root; the bold cross-reference to `/create-verification-skill` (SKILL.md:9,25) rewritten to `skill://create-verification-skill` per the cross-batch skill:// convention, since that skill is ported by a sibling batch in this wave. The "one read-only subagent per feature file" source wave (SKILL.md:29) is named as an explicit `task` batch call for clarity; the parallel-source-reader mechanism itself was already tool-agnostic prose, not a Cursor-specific construct.

## skills/make-pr-easy-to-review/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/make-pr-easy-to-review @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot.

## skills/multi-phase-plan/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The Cursor per-spawn agent-type field (`poteto-agent`) rewritten to the `task` tool's `agent` field; the `grok-4.6-fast-xhigh` slug deleted per the model-ID rule (rewritten as your configured model role); `control-ui`/`control-cli` from `cursor-team-kit` rewritten to the `bash`/`browser`/`debug` tools, and the Control skill section retitled Verification surface since OMP has no control-skill plugin concept. Dropped `/deslop` (no OMP substitute, see opening-a-pr's note) and the Bugbot/`../references/bugbot-triage.md` triage step (Bugbot is a Cursor product with no OMP or pstack-native equivalent and the reference file was never part of this port's matrix); replaced with a dispatch to OMP's own `reviewer`/`security-reviewer` agents. The agent store's docs/ (a Cursor cloud-agent working-directory concept with no verified OMP equivalent) generalized to the repo's own `docs/`. `/goal` (Cursor's persistent cross-turn goal arming for cloud agents) has no OMP equivalent; rewritten as restating the standing orders at every drain and resume. `git show origin/main:pstack/skills/...` re-read paths updated to the flat `skills/<name>/SKILL.md` layout; the `<control skill path>` re-read line dropped since there is no longer a control-skill file to pin. `node pstack/skills/poteto-mode/scripts/check-plan.mjs` kept as a bare `check-plan.mjs` invocation; the script itself is unported tooling, out of scope for this markdown-only phase. All other Cursor-isms (the `Task` tool, the AskQuestion analogue, bold cross-references) rewritten per the standard substitution table.

## skills/no-comments/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The upstream `Task` spawn with a named per-spawn type field (SKILL.md:19) rewritten to the `task` tool with `agent: "comment-sicko"` — that agent is ported by a sibling batch in this same wave (`agents/comment-sicko.md`), referenced here, not inlined. Bold cross-references to `principle-fix-root-causes` and `principle-redesign-from-first-principles` (SKILL.md:22) rewritten to `skill://` pointers. Inline `/how`, `/why`, `/architect` command mentions (SKILL.md:20-21) rewritten to `skill://how`, `skill://why`, `skill://architect` per the cross-batch skill:// convention. The self-referential "fail `/no-comments`" (SKILL.md:20) reworded to "fail this pass" since a skill linking `skill://` to itself is not a meaningful target.

## skills/opening-a-pr/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

`Task` worktree semantics (line 5) rewritten to the `task` tool's `isolated`/`apply`/`merge` options; `control-cli`/`control-ui` (line 19) rewritten to the `bash`/`browser`/`debug` tools; "cloud-agent PR tools default to draft" (line 25) generalized since OMP has no such built-in default. Dropped `/deslop` (lines 7, 29) — a `cursor-team-kit` skill this project never vendors, per pstack-omp-plan/TRANSLATION-NOTES.md; no OMP substitute exists, so the step is cut rather than invented. `/no-comments`, `/technical-writing`, `/unslop`, and `interrogate` rewritten to skill:// pointers.

## skills/orchestrate/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The Cursor cloud-agent orchestration loop rewritten to OMP's single `task` tool plus `hub`: `environment: "cloud"` (worker default) replaced by `task` `isolated: true`, cloud-agents-cannot-read-the-local-store replaced by the task tool's real share-no-context property, "Cursor dashboard" liveness probing replaced by `hub jobs`/`hub list`, "resume" replaced by `hub send` waking an idle/parked peer, and "AskQuestion state" replaced by the `ask` tool. `/goal`'s persistent cross-turn arming has no OMP equivalent (no fallback exists per the substitution contract) and is rewritten as restating the standing orders at every drain and resume; "a real terminal `/loop`" (Cursor's iteration command) rewritten as a plain monitored timer. "different model family" (verifier vs. worker) rewritten to "different agent or configured model role" per OMP's actual model-selection mechanism (`omp-format.md` Agents section). `control-ui`/`control-cli` from `cursor-team-kit` rewritten to the `bash`/`browser`/`debug` tools. The `orch` CLI (`scripts/orch/orch.ts`) is real pstack tooling, not a Cursor construct, but porting the script itself is out of scope for this markdown-only phase; its subcommands are kept as literal `orch <subcommand>` invocations with the `bun scripts/orch/orch.ts` path dropped. "the current agent's store (path in the system prompt)" — a Cursor cloud-agent working-directory concept with no verified OMP equivalent — generalized to a scratch directory in the repo.

## skills/pause-safely/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

"restart Cursor" generalized to a session-restart trigger; the Autonomous run, show-me-your-work, and Session pickup playbook mentions rewritten as skill:// pointers (pause-safely.md:3,8,10).

## skills/perf-issue/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

control-cli/control-ui baseline-trace step rewritten to bash/browser/debug (perf-issue.md:5); how/architect/sequence-verifiable-units/Opening a PR/Hillclimb playbook mentions rewritten as skill:// references (perf-issue.md:6,16,17,20,22); gpt-5.6-sol-max model slug deleted, replaced with a configured model role reached via the task tool (perf-issue.md:16).

## skills/poteto-mode/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

All 22 playbooks and 21 principle skills are now ported; every cross-reference uses skill:// pointers, since every target carries disable-model-invocation: true and is otherwise unreachable from the model listing. Dropped: Cursor skill-picker decorations (`mode`, `icon`, `color`) and the `reminder` field (no OMP consumer); the `cursor-team-kit` `control-cli`/`control-ui` tool pair and the `deslop` skill from the `cursor-team-kit` plugin (never vendored here, no OMP substitute — generalized to plain prose); `references/bugbot-triage.md` (not part of this port); Cursor's `/loop` and `/goal` (no OMP equivalents); literal vendor model slugs (OMP routes model choice through configured roles, not per-spawn slugs); the `~/.cursor/rules/pstack-models.mdc` target (moved to `~/.omp/agent/pstack-models.md`, read on demand by pstack skills). local fix: `typescript-best-practices` and `create-verification-skill` are named nowhere in this index on purpose. Neither is a principle or a playbook. Each is a leaf-only auxiliary reached by cross-pointer, `typescript-best-practices` from `skill://principle-type-system-discipline` as its TypeScript grounding and `create-verification-skill` from `skill://setup-pstack` and `skill://maintain-verification-skill` as the create half of the verification-skill lifecycle. Both also route through their own `/pstack:` commands.

## skills/principle-boundary-discipline/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Ported verbatim. The body names no Cursor tool, model slug, or cross-skill link to rewrite.

## skills/principle-build-the-lever/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Three relative markdown links to sibling principle skills rewritten to `skill://` URLs for OMP's flat skills/ layout (`../principle-laziness-protocol/SKILL.md` → `skill://principle-laziness-protocol`, `../principle-encode-lessons-in-structure/SKILL.md` → `skill://principle-encode-lessons-in-structure`, `../principle-prove-it-works/SKILL.md` → `skill://principle-prove-it-works`). Body otherwise unchanged.

## skills/principle-encode-lessons-in-structure/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Ported verbatim. The body names no Cursor tool, model slug, or cross-skill link to rewrite.

## skills/principle-exhaust-the-design-space/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Ported verbatim. The body names no Cursor tool, model slug, or cross-skill link to rewrite.

## skills/principle-experience-first/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool names, model slugs, or cross-skill bold references in the upstream body — copied verbatim aside from provenance frontmatter.

## skills/principle-fix-root-causes/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool names, model slugs, or cross-skill bold references in the upstream body — copied verbatim aside from provenance frontmatter.

## skills/principle-foundational-thinking/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool names, model slugs, or cross-skill bold references in the upstream body — copied verbatim aside from provenance frontmatter.

## skills/principle-guard-the-context-window/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool names, model slugs, or cross-skill bold references in the upstream body — copied verbatim aside from provenance frontmatter. "Route bulk to subagents" already reads as OMP's `task` design without edits.

## skills/principle-laziness-protocol/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Upstream body (principle-laziness-protocol/SKILL.md:1-18) is generic engineering prose with no Cursor-specific tool names, model slugs, or cross-references to rewrite; ported verbatim aside from the provenance frontmatter.

## skills/principle-make-operations-idempotent/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Upstream body (principle-make-operations-idempotent/SKILL.md:1-24) is generic engineering prose with no Cursor-specific tool names, model slugs, or cross-references to rewrite; ported verbatim aside from the provenance frontmatter.

## skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Upstream body (principle-migrate-callers-then-delete-legacy-apis/SKILL.md:1-22) is generic engineering prose with no Cursor-specific tool names, model slugs, or cross-references to rewrite; ported verbatim aside from the provenance frontmatter.

## skills/principle-minimize-reader-load/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The rest of the body (principle-minimize-reader-load/SKILL.md:1-23) has no other Cursor-specific tool names, model slugs, or content to rewrite; only line 13's cross-reference changed.

## skills/principle-model-the-domain/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Upstream body carries no literal Cursor tool names, model slugs, or cross-references to rewrite; ported verbatim aside from provenance frontmatter, keeping disable-model-invocation true as upstream set it.

## skills/principle-never-block-on-the-human/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Upstream body names no literal Cursor tool (its `AskQuestion` tie-in lives only in poteto-mode's own routing table, out of scope for this file); ported verbatim aside from provenance frontmatter, keeping disable-model-invocation true as upstream set it.

## skills/principle-outcome-oriented-execution/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Upstream body carries no literal Cursor tool names, model slugs, or cross-references to rewrite; ported verbatim aside from provenance frontmatter, keeping disable-model-invocation true as upstream set it.

## skills/principle-prove-it-works/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cross-reference to the show-me-your-work skill (final paragraph) rewritten from a bold mention to skill://show-me-your-work; no other Cursor-specific tool names or model slugs appear in the body.

## skills/principle-redesign-from-first-principles/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool references or cross-skill mentions in the upstream body; wording is unchanged, only OMP provenance frontmatter was added.

## skills/principle-separate-before-serializing-shared-state/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool references or cross-skill mentions in the upstream body; wording is unchanged, only OMP provenance frontmatter was added.

## skills/principle-sequence-verifiable-units/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor tool or model-slug references in the body. Closing cross-references to the prove-it-works and build-the-lever principle skills (SKILL.md, last line) rewritten from bare bold names to skill:// URLs, since disable-model-invocation:true hides both from auto-discovery.

## skills/principle-subtract-before-you-add/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool references or cross-skill mentions in the upstream body; wording is unchanged, only OMP provenance frontmatter was added.

## skills/principle-type-system-discipline/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor tool or model-slug references in the body. Cross-references to typescript-best-practices (SKILL.md:11), principle-boundary-discipline (:18), and principle-encode-lessons-in-structure (:21) rewritten from bare bold/backtick names to skill:// URLs, since disable-model-invocation:true hides all three from auto-discovery.

## skills/prototype/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Feature, architect, exhaust-the-design-space, and Laziness Protocol mentions rewritten as skill:// pointers (prototype.md:3,5,7,10,12); the control-skill screenshot-verification step rewritten to the browser tool (prototype.md:11).

## skills/recall/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl` transcript path (SKILL.md:15) rewritten to OMP's session-file layout, `~/.omp/agent/sessions/<encoded-cwd>/<timestamp>_<sessionId>.jsonl` (verified against `session.md` On-Disk Layout and `session-switching-and-recent-listing.md`). "Spawn parallel subagents" (:19) made explicit as one `task` tool batch call with `agent: "scout"` per item, since scout is OMP's read-only fast-search agent. Cross-references to the why/unslop/session-pickup/automate-me skills rewritten as `skill://` URLs.

## skills/refactoring/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

All bold cross-references (Feature, Bug fix, figure-it-out, how, architect, Opening a PR, and nine principle-* skills) rewritten as skill:// pointers (refactoring.md:3,5,7-14); the grok-4.6-fast-xhigh model slug deleted for a configured model role reached via the task tool, and the control-skill smoke-run step rewritten to bash/browser/debug (refactoring.md:11-12). local fix: the principle count is corrected from ten to nine. Upstream refactoring.md:7-14 and this body each carry nine distinct principle targets, the prove-it-works citation in step 6 repeating the one in step 1, so the note overcounted and no reference was lost in porting.

## skills/reflect/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Three `Task` calls with a per-call subagent-type field (SKILL.md:37,49) rewritten to one `task` tool batch call per stage, `agent: "task"` (full tool access; not the read-only `scout`), since OMP's task tool has no per-call `readonly` flag — model/tool grants come from agent frontmatter and config, not a spawn-time parameter (task-agent-discovery.md). Per-call literal model defaults dropped for generic configured-role language, matching poteto-mode.md's "never a literal model ID" convention — OMP's task tool sets only `agent`, never a worker model (task-agent-discovery.md). `~/.cursor/projects/*/agent-transcripts/` (:25) rewritten to OMP's session-file layout plus `history://<id>`. Cursor's built-in `create-skill` skill (:64-66) rewritten to pstack's own `skill://authoring-a-skill` playbook — OMP has no built-in skill-authoring wizard. The four `references/*.md` reviewer/synthesizer prompt templates are carried under `skills/reflect/references/` with the same `.cursor/skills/`/`Task`/`Read` substitutions, no added frontmatter (they're pasted verbatim into task prompts, not loaded as skills themselves).

## skills/runtime-forensics/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

"control skill" (runtime-forensics.md:5) rewritten to OMP's own tools per surface (bash for a CLI/TUI, browser for a web/Electron UI, debug for a running process); "CDP eval on the running process" (line 7) rewritten to the browser tool's evaluate for a web surface or the debug tool's evaluate for any other process; bold cross-references to guard-the-context-window (line 6) and Bug fix/Perf (line 11) rewritten to skill:// pointers.

## skills/session-pickup/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The agent-transcripts/ directory and ~/.cursor/projects/*/ / cloud-agent-URL handoff (session-pickup.md:7) rewritten to OMP's history://<id> transcript read plus hub for a still-live peer, dropping the workspace-boundary caveat since history:// is already scoped. Bold cross-references to principle-guard-the-context-window (line 7) and principle-prove-it-works (line 11) rewritten to skill:// pointers.

## skills/setup-pstack/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Target file moved from `~/.cursor/rules/pstack-models.mdc` (with Cursor's `alwaysApply: true` rule frontmatter, SKILL.md:8,30) to a plain `~/.omp/agent/pstack-models.md` that pstack skills `read` directly on demand — OMP's task tool sets only `agent`, never a worker model, so model routing is config/agent-frontmatter driven, not a value this file's readers pass into a spawn call (task-agent-discovery.md). The four literal per-model-family slug examples (SKILL.md:39-56) are replaced with generic `@<role>`-shaped placeholders — real OMP role aliases resolve through `modelRoles.<role>` in `~/.omp/agent/config.yml` (models.md). `AskQuestion` (:22) rewritten to the `ask` tool. `inherit-parent`/`auto` (:14,22) rewritten to `@default`, OMP's built-in default-model role alias (models.md: "`*` selects `@default`"). `/create-verification-skill` (:68) rewritten to `skill://create-verification-skill`.

## skills/shipping/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor cloud agent + control-ui/control-cli from cursor-team-kit (shipping.md:3,7) rewritten to a task tool batch, one isolated item per PR checked out at its own head, exercising bash/browser/debug per surface; /loop dynamic-mode watch (line 17) rewritten to plain re-checking language, dropping the loop-mode terminology that has no OMP equivalent. Bold cross-references to Babysit (lines 3,5) rewritten to skill:// pointers. gt/gh CLI invocations kept literal, per the substitution contract — they are real external CLIs, not Cursor-internal.

## skills/show-me-your-work/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's `~/.cursor/projects/*/agent-transcripts/` (SKILL.md:56) rewritten to OMP's session-file layout plus `history://<id>`. "Spawn a subagent" (:67) made explicit as the `task` tool. `references/decision-log-template.tsv` and `scripts/log.sh` are carried verbatim under `skills/show-me-your-work/` (referenced as `skill://show-me-your-work/...`, which `bash` auto-resolves to a filesystem path) — no frontmatter added, since a shebang/header must stay line 1 for the script and template to keep working.

## skills/swarm/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's `environment: "cloud"`/`"local"` split, `run_in_background`, the Cursor `generalPurpose` subagent field, and `cloud_base_branch` replaced with a single `task` batch call (`{context, tasks[]}`) and per-spawn `agent`/`isolated` fields — OMP subagents already share the caller's filesystem and deliver in the background automatically, so no cloud/local flag or base-branch parameter exists; a worker needing a non-default branch checks it out itself with `bash` inside its own `isolated` worktree. The `~/.cursor/rules/pstack-models.mdc` worker-model file and the `grok-4.6-fast-xhigh` slug replaced with the caller's configured model role (`@role` aliases resolve via `modelRoles.<role>` in `~/.omp/agent/config.yml`).

## skills/tdd/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No Cursor-specific tool names, model slugs, or cross-skill bold references in the upstream body — copied verbatim aside from provenance frontmatter.

## skills/teach/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

First mentions of the `how`, `why`, and `unslop` skills rewritten as explicit `skill://how`, `skill://why`, `skill://unslop` pointers, since all three carry `disable-model-invocation: true` and are hidden from auto-discovery — a bare name mention is a dead reference in OMP. Later backtick mentions of the same skills left as-is since the pointer is already established. No other Cursor-specific constructs in the body.

## skills/technical-writing/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

The bold mention of the `unslop` skill rewritten as an explicit `skill://unslop` pointer, since `unslop` carries `disable-model-invocation: true` and is hidden from auto-discovery — a bare name mention is a dead reference in OMP. The earlier backtick mention of `unslop`'s abstract-metaphor rule left as-is; the pointer is already established by then. No other Cursor-specific constructs in the body.

## skills/thermo-nuclear-code-quality-review/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/thermo-nuclear-code-quality-review @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot.

## skills/trace-forensics/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

No tool-name substitutions needed — the playbook already keeps tooling generic (a trace parser, sqlite, an editor). Bold cross-references to Runtime forensics (line 5), principle-guard-the-context-window (line 7), and Bug fix/Perf issue (line 12) rewritten to skill:// pointers.

## skills/typescript-best-practices/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Bold cross-references to the type-system-discipline and boundary-discipline principle skills (SKILL.md:8,22) rewritten as `skill://` pointers, matching the style in skills/poteto-mode/SKILL.md. The upstream `references/patterns.md` companion file (code examples for each rule) is out of scope for this batch (assignment targets SKILL.md only) and was not ported; the trailing pointer to it was dropped rather than left dangling.

## skills/unslop/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Body contains no Cursor tool names, subagent references, or model slugs to rewrite; ported verbatim aside from the added provenance frontmatter. Marked adapted (not portable) per the matrix's blanket ADAPT classification for this batch, though no wording changed.

## skills/visual-parity/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

visual-parity.md:4 the control skill replaced with OMP's `browser` tool, the surface that actually drives image-diff verification of a UI; visual-parity.md:8 Cursor's /loop rewritten as plain iteration language; visual-parity.md:7,9 bold cross-references to the separate-before-serializing-shared-state principle and to Opening a PR rewritten as skill:// pointers, since disable-model-invocation hides bare bold-name mentions from OMP's auto-discovered listing.

## skills/what-did-i-get-done/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Copied verbatim from the reference port (refs/ref-port/plugins/pstack/skills/what-did-i-get-done @ c2ade4b); cursor-team-kit component, not part of the pstack subtree, so it had no Phase A matrix row. The reference port's menu-description one-liner became our description; OMP has no menu-description slot.

## skills/why/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

Cursor's `Task` tool, its per-call subagent-role field, and readonly/Ask-mode dispatch (SKILL.md:118-121,165-167) rewritten to the `task` tool's `agent` field — `scout` for the read-only investigators (a real sandbox, not just a posture, since scout has no write access), `task` for the synthesizer, which needs write-capable tool access to spot-verify citations. Literal vendor model slugs deleted per conventions §1; replaced with "the caller's configured model role". The Cursor-specific MCP-enumeration mechanism ("list the available MCPs from the Cursor environment", "inspect the `mcps/` directory") rewritten to OMP's `mcp://` resource discovery plus `read`/`web_search`/`bash` fallbacks (SKILL.md:100,116). "Launch in a single message" rewritten to "one `task` batch call". Out of scope for this batch (assignment targets SKILL.md only): the upstream `references/*.md` companion files (`epistemics.md`, `investigator-prompt.md`, `source-playbook.md`, `sources/*.md`) were not ported; the Reference Files section below is left as an upstream-layout pointer, flagged inline as not-yet-present.

## skills/worktree-cleanup/SKILL.md

- sync: fd878692de15a3069c21c8f429eb0b9f2fe178fa (0.14.5)

worktree-cleanup.md:10 the `~/Library/Application Support/Cursor` state-deletion target rewritten to OMP's `~/.omp/agent`, keeping the state.vscdb.backup/snapshots reasoning as prose about the equivalent bloat pattern; worktree-cleanup.md:5-7 parenthetical bare-name principle mentions (principle-build-the-lever, principle-encode-lessons-in-structure, principle-prove-it-works, principle-guard-the-context-window) rewritten as skill:// pointers, since disable-model-invocation hides bare mentions from OMP's auto-discovered listing. local fix: step 1's `scripts/worktree-audit.sh` is now ported into this skill directory from upstream `pstack/skills/poteto-mode/scripts/worktree-audit.sh`, so the step 1 path resolves. The port retargets its transcript scan to OMP's prompt-history database at `~/.omp/agent/history.db`. That recency signal reads prompt rows and prompt text, weaker than Cursor's full transcript scan, so the step 2 and 3 gates carry the in-use verdict.

## skills/architect/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 renames only the first architect-runner default slug (fable-5 to fable-5-1); the port's line 33 reads 'your configured architect runner roles', so the rename has no port counterpart. Row pin flipped, file unchanged.

## skills/arena/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 renames the same slug in the Phase A runner list and Phase C cross-judge pool; both already read 'your configured model roles' phrasing. No port-side change.

## skills/autopilot-full/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

sync efa2a531: step 2 retitled 'and an early trail', opens with the canonical forge resolution ('gh' default, `origin pr` when `command -v origin` resolves the repo, never require `gt`), swaps gt registration for 'the first push, a ready PR', and carries upstream's new early-trail sentences; step 3 drops the gt-registration clause and makes the private stack a base-branch stack; step 4 gains upstream's new 'Regression lane against trunk.' (same load-bearing scenario at trunk and head; when trunk lacks the feature, gate the diff-added behavior plus the end state the user waits for); step 5 merges through the resolved forge. Upstream's cloud-agent, deslop, /goal and /loop artifacts stay out of the port's task/`isolated: true`/`hub` phrasing.

## skills/autopilot-stack/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

Whole playbook goes forge-neutral: header and description say base-branch stack; step 1 gains the canonical forge resolution plus the early-trail pair; step 6 becomes the base-branch chain (root is the only topology writer, append rebases the child onto the parent's exact tip, push with `--force-with-lease` only after an `ls-remote` check, never register through gt); step 7 gains the stable `git patch-id` rule deciding which verdicts survive a rewritten chain; step 8 delivers bottom-up in the resolved forge. Upstream deleted its 'division of labor the cloud environment forces' clause, so the port's adaptation of it went too.

## skills/babysit/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

Forge resolution folds into step 1's header ('declare the mode and resolve the forge'); step 4's gt-shaped bans generalize to base retarget/rebase/stack-wide submit; step 6 splits stop conditions per forge, Origin's `pr view`/`pr thread list`/`pr checks --watch` path beside the port's direct `gh pr view --json` polling and `hub` background job; `gt merge` in the authorization paragraph becomes `origin pr merge`; step 8 gains `origin pr thread reply --body-file` beside the fixed `gh api` path; step 9 and the Reply line go forge-neutral. The watcher-script sentences upstream reworded stay uncarried, the port having replaced that script with plain polling at the original port.

## skills/bug-fix/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 moves the step-3 solo-delegate default from sol to fable-5-1; the port's step 3 carries no inline default (bare 'Delegate implementation to a subagent via the task tool'), so the default's only port value carrier is the setup-pstack template, updated there. File unchanged.

## skills/hillclimb/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 moves the step-5 solo-delegate default sol to fable-5-1; the port names the config label ('your configured hillclimb model role'), whose value is carried by the setup-pstack template. File unchanged.

## skills/how/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 adds the hide flag (the port shipped it before upstream) and renames the explainer/critics defaults to fable-5-1; all model lines already read configured-role phrasing. No port-side change.

## skills/interrogate/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 renames Reviewer A's default slug; the port replaced the fixed-model table with configured-reviewer-list phrasing at the original port, so the rename has no counterpart. File unchanged.

## skills/multi-phase-plan/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

Verification paragraph and template Lane 1 gain the Regression lane against trunk; the perf gate becomes dual-sided (Metric names trunk+head comparability, Probe must produce the metric on both sides, Rule carries absolute budgets when the scenarios differ); the PR-mechanics checklist gains a 'Resolve the forge once.' item and a ready-PR creation line (`origin pr create --status open --base` / `gh pr create --base`, stack child targets its parent branch); the merge placeholder becomes the base-branch stack landed bottom-up. Checklist skeleton, check-plan.mjs reference, configured-role and verification-tool adaptations preserved.

## skills/opening-a-pr/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

Upstream's new Forge / Size and stacks / Readiness trio replaces the Graphite paragraphs: stacks become base-branch chains (root targets trunk, children rebase onto the parent's exact tip and target the parent branch), readiness is `--status open` on Origin or omitting `--draft` on gh with per-forge `pr ready`/`pr view`. The port keeps 'Some automated PR-creation flows default to draft' where upstream says cloud-agent PR tools.

## skills/perf-issue/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 moves the step-3 solo-delegate default sol to fable-5-1; the port names the config label ('your configured perf-issue model role'), value carried by the setup-pstack template. File unchanged.

## skills/poteto-mode/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

Three deltas applied: the hardest-tier sentence now routes both the judgment-needing and the precisely-specified hardest work to the configured judgment role (upstream collapsed both roles onto fable-5-1, so the port's judgment-vs-precise split there is gone and its 'the same fast role' antecedent rewritten); the Shipping routing line lands the contiguous verified run bottom-up through gh by default or Origin when its CLI is available; the Autopilot-stack line becomes one linear reviewed base-branch stack.

## skills/reflect/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 renames the judgment/divergent/synthesizer defaults to fable-5-1, which land on the port's existing 'your configured reflect-judgment role' phrasing; the Tooling line is untouched upstream. No port-side change.

## skills/setup-pstack/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

The template's bug-fix/perf-issue/hillclimb lines move from `@<precise-role>` to `@<judgment-role>`, upstream's only substantive config change (ten further renamed lines already emit judgment-role placeholders). Existing comment adaptations (`@default` semantics, no ~/.cursor path, no real selectors) kept verbatim.

## skills/shipping/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

Upstream removed Graphite entirely. Step 1 resolves the forge before the first PR operation, keeping the port's task-batch verification mechanics (one `isolated: true` item per PR, bash/browser/debug surfaces, verdicts posted via `gh pr comment`); step 3 becomes the recorded rule (verdict head SHA + base SHA + stable `git patch-id`, re-verify on patch change, re-run mergeability and CI when unchanged); steps 4-5 prepare only the bottom PR then land one PR at a time with `origin/gh pr merge --squash [--auto]`, arming only that PR; step 6 says `autoMergeRequest` proves nothing about the stack; step 7 recomputes after every merge; step 8 watches only the current frontier, keeping the port's direct `gh pr view --json` polling plus `hub` job and adding upstream's merge-proof semantics (nothing counts until `mergedAt` is non-null or `state` is `MERGED`; hard-fail only on `CLOSED` without `mergedAt`, a blocking `FAILURE`/`CANCELLED` after auto-merge is no longer pending, or `UNSTABLE`/`DIRTY` with no auto-merge pending). The description line follows the new meaning; the watcher script and /loop stay uncarried.

## skills/typescript-best-practices/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

New 'Schemas before guards' table row inserted at upstream's position (before 'No `as` casts'); the Branded-types row rewords to 'Validate once at the boundary'. Upstream's new `paths: ["**/*.ts", "**/*.tsx"]` frontmatter key is deliberately not carried: OMP's loader never reads a paths frontmatter key (zero references in refs/omp-src packages/coding-agent/src/extensibility/skills.ts, packages/utils/src/frontmatter.ts, and src/discovery/), and scripts/fix-frontmatter.ts hard-errors any unknown top-level key. references/patterns.md was never vendored, so upstream's growth there and its trailing pointer line stay out rather than dangling.

## skills/unslop/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

Upstream 0.14.6 added disable-model-invocation at column 0, which this port already shipped; the port copy is now byte-identical to upstream again. Row stays portable at the new pin.

## skills/why/SKILL.md

- sync: efa2a531985e0a8084d36ff3cf87233be8a9f34b (0.14.7)

0.14.6 adds the hide flag (already shipped here) and renames the synthesizer default, which lands on the port's 'the caller's configured model role' phrasing. The file's two lowercase English-word 'cursor' hits ('cursor location', 'precursor') are upstream's own prose, not runtime artifacts. No port-side change.

## skills/architect/SKILL.md

- local fix: 2026-09-16

Four companion paths in this file were addressed as working-directory-relative text. Three of them sat inside markdown link wrappers added on 2026-09-15, and the fourth was wrapped at the original port. `skill://architect/references/<file>` replaces all four. OMP announces a skill directory only for an interactive `/skill:<name>` invocation (`refs/omp-src/packages/coding-agent/src/prompts/skills/user-invocation.md`), and this skill is reached by `read skill://architect`, which serves raw bytes, so a relative path resolves against the reader's working directory and misses. Nothing reads a markdown link target in this runtime, so those wrappers were superseded rather than kept.

## skills/architect/references/rationale-template.md

- local fix: 2026-09-16

`[Phase A](../SKILL.md#phase-a-ground-the-problem)` pointed out of the references directory at the entry file. It reads `Phase A (`skill://architect`)` now. `[Shape](#shape)` was an anchor no reader can follow through a `skill://` read, so the sentence names the section in prose.

## skills/architect/references/runner-prompt.md

- local fix: 2026-09-16

The sibling pointer to the rationale template lost its link wrapper. Both halves of that link were working-directory-relative. One backticked pointer into the skill directory is the form a reader can open.

## skills/create-verification-skill/SKILL.md

- local fix: 2026-09-16

Step 3's example-directory mention becomes a pointer that `read` serves as a directory resource. The line naming `skills/verify-<app>/features/README.md` describes a layout in the reader's own repository, not an asset of this skill, and stays untouched.

## skills/create-verification-skill/references/feature-map-example/README.md

- local fix: 2026-09-16

The two Features bullets pointed at `./create-note.md` and `./search.md`. An agent that reads this index through a pointer cannot open the two entries it indexes, so both bullets carry `skill://` pointers at those files now.

## skills/how/SKILL.md

- local fix: 2026-09-16

Five prompt and rubric mentions became `skill://how/references/...` pointers. All four files under `references/` were already vendored, so the defect was the addressing form only.

## skills/interrogate/SKILL.md

- local fix: 2026-09-16

Four mentions became `skill://interrogate/references/...` pointers for the same reason as `how`. The four reference files were present.

## skills/worktree-cleanup/SKILL.md

- local fix: 2026-09-16

Step 1's audit-script mention becomes a pointer into this skill directory, where the ported script actually sits. A relative path resolved against the reader's working directory, which has no `scripts/` directory of its own.

## skills/why/SKILL.md

- local fix: 2026-09-16

Twelve working-directory-relative mentions became pointers into the skill directory. The six "not yet ported" clauses and the Reference Files preamble that announced this batch as `SKILL.md`-only went away with the assets now present, because each one promised a later phase that had already happened. The rewritten Reference Files section then explained why a relative path fails; that sentence was dropped the same day as a claim about OMP path resolution that nothing in `refs/omp-src` or `findings/` cites, and the section now states how to read an asset and nothing more.

## skills/why/references/

- vendored: 2026-09-16, copied from `upstream/pstack/skills/why/references/` at the pinned sha

Twelve assets ship with upstream's `why` and never reached this port. `skill://why/references/epistemics.md` returned `File not found`, and the skill text told the synthesizer to follow a confidence framework whose words were absent, then admitted the framework would arrive in a later phase. Nothing was authored here. The tree is a copy of the vendored snapshot, and `investigator-prompt.md`, `source-playbook.md`, and `synthesizer-prompt.md` carry the pointer rewrite on top of it. The last of those was broken twice over: its own instruction to the synthesizer addressed `references/epistemics.md` from the reader's working directory. `epistemics.md` and the eight `sources/*.md` category playbooks are byte-identical to upstream.
