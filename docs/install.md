# Install

## Prerequisites

- [Oh My Pi](https://github.com/agent-optimizer/omp) 18.0.11 or later
- [Bun](https://bun.sh) (for running the conformance suite and sync tools)
- Git

## Install

### 1. Clone the repo

```bash
git clone <repo-url> ~/.omp/agent/pstack
```

This places the skills, agents, and commands in OMP's native skill directory. OMP discovers them automatically on restart.

### 2. Configure models

Run the setup command to configure which models each role uses:

```bash
omp /pstack:setup-pstack
```

This walks you through mapping roles to your available models. The configuration is written to `~/.omp/agent/pstack-models.md`.

If you skip this step, pstack falls back to sensible defaults using OMP's built-in role aliases (`@default`, `@smol`, etc.).

### 3. Restart OMP

Close and reopen your OMP session. The skills, agents, and commands are now available.

## Verify

Run the conformance suite to check everything is working:

```bash
cd ~/.omp/agent/pstack
bun scripts/conformance.ts
```

All 74 tests should pass. If any fail, check the output for details.

## Configure

See [config.md](config.md) for the full configuration reference.

The main configuration file is `~/.omp/agent/pstack-models.md`. One line per role:

```
feature, refactoring: @default
bug-fix: @default
how explorer: @smol
interrogate reviewers: @default, @default, @smol, @smol
```

Use `@default` to run on your session's default model. Use `@smol` for cheap, fast tasks. List multiple values for panel roles (how critics, interrogate reviewers) to spawn multiple parallel workers.

## Uninstall

```bash
rm -rf ~/.omp/agent/pstack
```

Restart OMP. The skills and commands are gone.

## Troubleshooting

### Skills not loading

Check that the directory structure is correct:

```bash
ls ~/.omp/agent/pstack/skills/
```

Each skill should be a directory containing a `SKILL.md` file. If a skill is missing its SKILL.md, OMP won't load it.

Run the conformance suite to check frontmatter:

```bash
bun scripts/conformance.ts
```

### Commands not showing up

Check that the commands directory exists and contains `.md` files:

```bash
ls ~/.omp/agent/pstack/commands/
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
