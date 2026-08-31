---
name: opening-a-pr
description: Shared PR-opening routine invoked at the end of every other playbook — worktree hygiene, commit shaping, PR title and description conventions, readiness, and stack sizing.
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/opening-a-pr.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: "`Task` worktree semantics (line 5) rewritten to the `task` tool's `isolated`/`apply`/`merge` options; `control-cli`/`control-ui` (line 19) rewritten to the `bash`/`browser`/`debug` tools; \"cloud-agent PR tools default to draft\" (line 25) generalized since OMP has no such built-in default. Dropped `/deslop` (lines 7, 29) — a `cursor-team-kit` skill this project never vendors, per pstack-omp-plan/TRANSLATION-NOTES.md; no OMP substitute exists, so the step is cut rather than invented. `/no-comments`, `/technical-writing`, `/unslop`, and `interrogate` rewritten to skill:// pointers."
---

# Opening a PR

Invoked at the end of every other playbook.

**Worktree.** Work from a git worktree off main; subagents inherit it. Multiple `task` calls on the same branch each get their own worktree via `isolated: true` (with `apply`/`merge` controlling how the result lands), or `git fetch && git reset --hard origin/<branch>` between them when working directly in a shared checkout. Dirty branch with unrelated work: patch out, fresh worktree, apply. Snarled worktree: reset from main, redo minimally.

**Commits.** Commit liberally; rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit; new commit when separable.

**PRs.** Run skill://no-comments before review. Write every PR title, PR description, and commit body per skill://technical-writing, then apply skill://unslop. Apply every technical-writing layer except Diátaxis. Use one word for each action, keep articles, and avoid `-ing` when a plain verb works.

**Titles.** Use Conventional Commits in the form `type(scope): subject`. Use `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf` as the type. Use the changed area, such as `pstack` or `poteto-mode`, as the scope. Keep the subject short and imperative. Apply the same skill://technical-writing and skill://unslop pass as the body. Name a real symbol when one carries the change. For example, `fix(pstack): retarget opening-a-pr babysit trigger`. Do not add a trailing period.

**Descriptions.** Use these sections in order. Drop a section when it is empty.

- `## Why`. State the intent and why this approach fits.
- `## Scope`. State facts from the diff. Name real symbols and paths. Name both sides of a rename or retarget. State what is in and out when the boundary matters.
- `## Tradeoffs`. State real choices only. Skip this section when there are none.
- `## Blast Radius`. State who and what the change touches. Explain why the change is safe or risky. If main is red without the fix, name the continuing cost.
- `## Verification`. State how you ran each check and its rigor. Name the real path, such as `bash`, `browser`, `debug`, or the targeted tests. State the outcome of each check, not only the command name.

After these sections, attach videos or screenshots when they prove a claim. Do not use `## Summary` or `## Test plan` boilerplate. A commit body does not restate its subject.

**Size and stacks.** Prefer five narrow PRs to one large PR. Stack follow-ups with Graphite (`gt`), and keep the ordered stack visible to reviewers. Branch from main only for independent work. Rebase on `main` before substantial stack work.

**Readiness.** Open every PR ready, never as a draft. Some automated PR-creation flows default to draft, so set `draft: false` on every PR creation call. If a PR still opens as a draft, run the host's ready command, such as `gh pr ready <number>`. Run `gh pr view <number>` before you refer to PR status.

**Babysit.** Opening a PR does not start a skill://babysit pass. Post the URL and keep building. Finish the phase or stack first. Run a separate babysit pass only when the user asks for one after the whole stack exists. A babysit for each new PR stalls the build and spends checks on commits that later waves restart. Push back when feedback drifts from intent.

A subagent that opens a PR runs skill://interrogate and skill://no-comments. It returns the URL and does not babysit. Return to the parent.
