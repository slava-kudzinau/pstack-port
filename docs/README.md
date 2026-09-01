# pstack for Oh My Pi

A collection of skills, agents, and commands that route coding work through specialized workflows. Ported from [pstack](https://github.com/reachingforthejack/pstack) to run on [Oh My Pi](https://github.com/agent-optimizer/omp).

## What it does

When you give pstack a task, it routes to the right workflow:

- **Bug fix** — reproduce, root-cause, fix, verify. No half-measures.
- **Feature** — design first with architect, then implement with verification.
- **Review** — parallel multi-perspective review with interrogate.
- **Exploration** — how does this work? why was it built this way?
- **Parallel work** — swarm for coverage, arena for competing designs.

The routing happens through the **poteto-mode** skill, which matches your request to the right playbook. Invoke it with `/pstack:poteto-mode` or let it load automatically if you configured auto-mode.

## What it is not

- Not a model. pstack works with any model you configure.
- Not a fork of OMP. Runs on stock Oh My Pi 18.0.11+.
- Not a replacement for your judgment. It amplifies it.

## Quick start

Clone the repo, then register it as an extension by adding its path to `extensions:` in `~/.omp/agent/config.yml`:

```yaml
extensions:
  - ~/pstack-omp
```

Restart OMP. Configure your models with `/pstack:setup-pstack`, then start with `/pstack:poteto-mode`.

See [install.md](install.md) for the full steps and [config.md](config.md) for model configuration.

## Structure

```
pstack/
├── skills/          # 74 skill directories, each with SKILL.md
├── agents/          # 2 custom agents (poteto-agent, comment-sicko)
├── commands/        # 31 /pstack:* commands
├── docs/            # These docs
├── scripts/         # Conformance suite, branding check
└── findings/        # Port decision records
```

Each skill is self-contained. Read the SKILL.md in any directory to understand what it does. Skills reference each other via `skill://` links, which OMP resolves automatically.

## Commands

See [commands.md](commands.md) for the full list. The essential ones:

| Command | What it does |
|---|---|
| `/pstack:poteto-mode` | Load the routing skill — your entry point |
| `/pstack:setup-pstack` | Configure which models each role uses |
| `/pstack:architect` | Design before implementing |
| `/pstack:swarm` | Parallel workers for coverage or races |
| `/pstack:interrogate` | Multi-perspective adversarial review |
| `/pstack:how` | How does this code work? |
| `/pstack:why` | Why was this built this way? |

## Model configuration

pstack uses OMP's role system. Configure which models each role uses via `~/.omp/agent/pstack-models.md`. The [setup-pstack](skills/setup-pstack/SKILL.md) skill walks you through it.

See [config.md](config.md) for the full configuration reference.

## Verification

Run the conformance suite to check the port:

```bash
bun scripts/conformance.ts
```

This validates structure, frontmatter, cross-references, and branding compliance.

## Upstream sync

pstack is maintained upstream at [reachingforthejack/pstack](https://github.com/reachingforthejack/pstack). To sync changes:

```bash
bun scripts/fetch-upstream.ts <sha>
bun scripts/classify-diff.ts
```

See [findings/matrix.md](findings/matrix.md) for the classification of each component.

## License

See [LICENSE](LICENSE) and [CREDITS.md](CREDITS.md).
