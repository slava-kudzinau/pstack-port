# Install

## Prerequisites

- [Oh My Pi](https://github.com/agent-optimizer/omp) 18.0.11 or later
- [Bun](https://bun.sh) (for running the conformance suite and sync tools)
- Git

## Install

### 1. Clone the repo

Clone anywhere — the path doesn't matter, because you register the clone's `plugin/` sub-directory explicitly in step 2:

```bash
git clone <repo-url> ~/pstack-omp
```

### 2. Register the extension

Add the path of the clone's `plugin/` directory — the shipped OMP package — to the `extensions:` array in `~/.omp/agent/config.yml` (user scope, applies everywhere) or `.omp/config.yml` (project scope):

Which `config.yml` is authoritative depends on your environment. `OMP_CODING_AGENT_DIR` or `PI_CODING_AGENT_DIR` relocate the whole agent directory, and then the governing file is `$OMP_CODING_AGENT_DIR/config.yml` rather than `~/.omp/agent/config.yml`. Check before editing with `printenv OMP_CODING_AGENT_DIR`. A copy left at the default path is read by nobody, and a session that still loads a stale skill set usually means exactly that.

```yaml
# ~/.omp/agent/config.yml
extensions:
  - ~/pstack-omp/plugin
```

Tilde expands; a relative path resolves against your working directory. This one entry wires the package's `skills/`, `commands/`, and `agents/` sub-directories into OMP discovery (`task/discovery.ts:4-11`; `discovery/omp-plugins.ts:46`). It also activates `extensions/pstack-autofire.ts`, whose entry point comes from the `omp.extensions` field of `package.json` (`extensibility/extensions/loader.ts:494-536`). That extension injects `hooks/session-start-context.md` at `before_agent_start`, which matters because nearly every skill here hides itself from the system prompt listing.

If you already have an `extensions:` array, append the path to it. The array is scope-replaced, not merged: a project `.omp/config.yml` overrides the user `config.yml` entirely (`discovery/omp-extension-roots.ts:221-235`).

**Or register it via the CLI** instead of hand-editing YAML. `omp config set` writes to the user-global `~/.omp/agent/config.yml`, and array values are JSON:

```bash
omp config set extensions '["~/pstack-omp/plugin"]'
```

Two things to know:

- `config set` **overwrites the whole array, it does not append.** Read your current value and merge into one call: `omp config get extensions`, then `omp config set extensions '["<existing>","~/pstack-omp/plugin"]'`.
- Use an absolute or `~/…` path, never a bare relative one. At read time a value is tilde-expanded against your home (stable) or resolved against the launching session's working directory (`discovery/omp-extension-roots.ts:237-240`); a relative path would point at whatever project you next open OMP in.

Verify with `omp config get extensions`.

To try it for one session without editing config, pass the flag instead:

```bash
omp --extension ~/pstack-omp/plugin
```

### 3. Configure models (optional)

Run the setup command to map pstack's roles to your available models:

```bash
omp /pstack:setup-pstack
```

This writes `~/.omp/agent/pstack-models.md`. Skip it and pstack falls back to OMP's built-in role aliases (`@default`, `@smol`).

### 4. Restart OMP

Close and reopen your OMP session. The skills, agents, and commands are now available.

## Verify

Run the conformance suite to check everything is working:

```bash
cd ~/pstack-omp
bun scripts/conformance.ts
```

All 74 tests should pass. If any fail, check the output for details.

Then confirm the hide flag is live. Nearly every skill carries `disable-model-invocation: true`, so the loader should exclude them from the rendered listing while `skill://` still reaches them:

```bash
bun scripts/hide-check.ts
```

It prints the provider that loaded the package plus the hidden/visible split, and exits non-zero when no skill reports `hide=true`. That is the check which catches a flag that was demoted under `metadata:` and silently stopped working.

The session-start injector gets its own check, since a broken injector leaves the plugin reachable only by slash command:

```bash
bun scripts/autofire-check.ts
```

## Configure

See [config.md](config.md) for the full configuration reference.

The main configuration file is `~/.omp/agent/pstack-models.md`. One line per role:

```
feature, refactoring: @default
bug-fix: @default
how explorer: @smol
interrogate reviewers: @default, @default, @smol, @smol
```

Use `@default` to run on your session's default model. Use `@smol` for cheap, fast tasks. List multiple values for panel roles (interrogate reviewers, arena runners, why investigators) to spawn multiple parallel workers.

## Uninstall

Remove the path from the `extensions:` array in `~/.omp/agent/config.yml` (or `.omp/config.yml`), then restart OMP. Optionally delete the clone:

```bash
rm -rf ~/pstack-omp
```

## Troubleshooting

### Skills not loading

Check that the directory structure is correct:

```bash
ls ~/pstack-omp/plugin/skills/
```

Each skill should be a directory containing a `SKILL.md` file. If a skill is missing its SKILL.md, OMP won't load it.

Run the conformance suite to check frontmatter:

```bash
bun scripts/conformance.ts
```

### Commands not showing up

First confirm the clone path is listed under `extensions:` in `~/.omp/agent/config.yml`, then restart OMP. Then check that the commands directory contains `.md` files:

```bash
ls ~/pstack-omp/plugin/commands/
```

Each command file must have a `description:` field in its frontmatter.

### Model configuration errors

If a skill references a model that doesn't exist, it falls back to its inline default. Run `/pstack:setup-pstack` to reconfigure.

Check your OMP configuration:

```bash
cat ~/.omp/agent/config.yml | grep modelRoles
```

### Conformance suite fails

Run with Bun:

```bash
bun scripts/conformance.ts
```

If tests fail, check the output for which checks failed and fix accordingly. Common issues:

- Missing SKILL.md files — re-clone the repo
- Frontmatter errors — check for YAML syntax issues
- Branding check failures — this indicates a port issue, report it

## Next steps

- Read [commands.md](commands.md) for the full command reference
- Read [config.md](config.md) for model configuration details
- Start with `/pstack:poteto-mode` to begin using the routing skill
