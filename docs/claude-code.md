# pstack for Claude Code

The Claude Code build of pstack lives at `plugins/pstack/` in this repo,
generated from the pinned upstream snapshot by `tools/claude/apply.mjs`. It
is a separate target from the OMP package in `plugin/`; see `AGENTS.md`'s
"Re-sync procedure" for how it is built and verified.

## Install today: `--plugin-dir`

This repo has no remote yet, so the marketplace-add flow below is not
reachable. Load the plugin directly from the clone for every session:

```bash
claude --plugin-dir /path/to/pstack-port/plugins/pstack
```

Verify the plugin actually loaded before relying on it:

```bash
claude plugin validate /path/to/pstack-port/plugins/pstack
```

A clean run reports `Validation passed` (a `logo` field warning is expected
and harmless). If validation fails, the plugin silently loads zero skills;
`--plugin-dir` gives no other signal that anything is wrong.

## Install once this repo has a remote: marketplace-add

The repo root ships `.claude-plugin/marketplace.json`, pointing its one
plugin entry at `./plugins/pstack`. Once pushed somewhere Claude Code can
reach:

```bash
claude plugin marketplace add <owner>/<repo>
claude plugin install pstack@pstack-port
```

Or the interactive equivalents inside a running session, `/plugin marketplace add <owner>/<repo>` and `/plugin install pstack@pstack-port`, if your build exposes them as slash commands.

Until then, `--plugin-dir` is the only working install path. Don't attempt
the marketplace flow against a repo with no remote; it has nothing to fetch.

## What loads automatically

The plugin's `SessionStart` hook (`plugins/pstack/hooks/hooks.json`) fires on
`startup`, `clear`, and `compact`, and injects the poteto-mode dispatch
mandate into every new session. You don't need to invoke anything by hand
for routing to work: ask for a feature or a bug fix, and the model reaches
for `pstack:poteto-mode` on its own.

The 21 `principle-*` skills carry a `user-invocable: false` stamp, which
hides them from the `/pstack:*` slash menu (they exist to be read by
`poteto-mode`, not invoked directly). They still resolve if you type their
slash form; menu-hiding is a discovery hint, not an access control.

## Configure models: the `CLAUDE.md` import

pstack ships a shipped default role-to-model policy at
`plugins/pstack/models.json` — every role starts as `inherit-parent` (run on
whatever model your session is already using), because the plugin has no way
to know your available slugs at generation time.

Run the setup skill to replace that with real per-role choices:

```
/pstack:setup-pstack
```

This writes `~/.claude/pstack-models.md` and adds one import line to your
`~/.claude/CLAUDE.md`:

```
@pstack-models.md
```

Skills read `~/.claude/pstack-models.md` first and fall back to
`inherit-parent` for any role the file doesn't mention, so partial
configuration is safe. Re-run `/pstack:setup-pstack` any time to update it;
the rewrite is idempotent.

## Project instructions win on conflict

`poteto-mode` states this once, superpowers-style, and it covers every skill
it routes to: when your project's `CLAUDE.md` or `AGENTS.md` states a
preference that conflicts with a skill's default process, skip a step, use a
lighter version for small changes, always or never do X, the project
instruction wins. No config file is required for this. Writing "for this
repo, skip the architect arena for one-file changes" in plain prose in your
`CLAUDE.md` is enough.

## Configure flow policy: `pstack-policy.md`

Plain prose works, but a knob many invocations share is easier to keep
straight in a structured file than to restate in prose each time. `architect`
mandates a four-candidate arena sketch by default, useful for a real design
decision, wasted on a one-file mechanical change. `plugins/pstack/policy.json`
ships that mandate as the safe default (`architect depth: full`); a project
that wants to relax it authors its own override, same shape as the model
file:

```
# pstack flow policy. One line per knob. Delete a line to fall back to the
# skill default.
architect depth: scaled
```

Save it as `.claude/pstack-policy.md` in the repo (checked first, so it
travels with the project) or `~/.claude/pstack-policy.md` (checked second,
for a personal default across projects), and import it the same way as the
model file:

```
@pstack-policy.md
```

`architect` still classifies each invocation out loud and lets you override
the call in the moment, exactly as **poteto-mode**'s `Feature` playbook
already lets you skip `architect` outright with a reason; this knob only
changes what happens once `architect` actually runs. A `scaled` invocation
still produces a design package with a written rationale, never zero design,
only a single candidate instead of the four-way fan-out.

## Project-level skill overrides (unconfirmed, verify before relying on it)

A project that wants a fundamentally different skill, not just a lighter
`architect`, may be able to drop its own `.claude/skills/<name>/SKILL.md` in
the repo. Claude Code documents directory-scoped skill names for
disambiguating two *differently scoped* skills that share a base name; it is
not confirmed here whether a project-scoped skill of the same name actually
shadows this plugin's version rather than coexisting alongside it as a
separate entry. Treat this as a possibility to test in your own Claude Code
version, not a guaranteed escape hatch. Neither `pstack-models.md` nor
`pstack-policy.md` depends on it; they work regardless.

## Verify

Run the generator's own test suite after any local change to
`tools/claude/`:

```bash
bun test tools/claude/
```

Run the tree invariants directly against the shipped `plugins/pstack/`:

```bash
bun scripts/claude-check.ts
```

This is a from-disk check independent of `apply.mjs`: no `commands/`
directory, zero `disable-model-invocation` keys anywhere, `user-invocable`
stamped on exactly the 21 `principle-*` leaves and nowhere else, zero
denylist-token hits across skills/agents/hooks/manifests, and both
manifests (`plugins/pstack/.claude-plugin/plugin.json` and the root
`.claude-plugin/marketplace.json`) parse with their required fields.

Run the provenance ledger check (it audits both the OMP package's per-file
table and this target's seven glob rows in one pass):

```bash
bun scripts/provenance.ts --check
```

## Known gaps

- `shellcheck` has not verified `plugins/pstack/hooks/session-start` or the
  bash region of `run-hook.cmd` on this machine (the binary isn't installed
  here). Both are short, `set -euo pipefail` scripts; review them by eye if
  you touch them.
- The polyglot Windows leg of `run-hook.cmd` is untested; it has only run on
  darwin so far.
- Re-syncing upstream: see `AGENTS.md`'s "Re-sync procedure" step 7.
