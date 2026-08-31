# Configuration

pstack uses two configuration files:

1. **`~/.omp/agent/pstack-models.md`** — Model roles per skill (managed by `/pstack:setup-pstack`)
2. **`~/.omp/agent/config.yml`** — OMP settings (managed by OMP)

## Model configuration

The file `~/.omp/agent/pstack-models.md` maps roles to model selectors. One line per role:

```
# pstack model configuration. One line per role.
# Delete a line to fall back to the skill default.
# @default as a value: the role runs on the session's default model.
feature, refactoring: @default
bug-fix: @default
perf-issue: @default
hillclimb: @default
judgment and prose: @default
hardest tasks: @default
how explorer: @smol
how explainer: @default
how critics: @default, @smol
why investigators: @smol
why synthesizer: @default
reflect tooling: @default
reflect judgment, divergent, synthesizer: @default
arena runners: @default, @default
arena cross-judge pool: @default
swarm workers: @default
interrogate reviewers: @default, @default, @smol, @smol
```

### Role aliases

- `@default` — Resolves to your session's default model. Always valid.
- `@smol` — Resolves to OMP's smol role (cheap, fast). Use for read-only probes.
- Custom aliases — Define in `~/.omp/agent/config.yml` under `modelRoles`.

### Panel roles

Roles ending in a list spawn multiple parallel workers. The list length sets the count:

- `how critics` — 2-4 critics, each running on a different model family
- `why investigators` — One per evidence category (up to 7)
- `arena runners` — 2-3 candidates for design alternatives
- `arena cross-judge pool` — One value selected for the cross-judge scout
- `swarm workers` — Default model for each swarm worker
- `interrogate reviewers` — 4 reviewers by default, each on a different model

### Model selectors

Use any model selector available in your OMP configuration. Common patterns:

```
# Use your default model for everything
feature, refactoring: @default
bug-fix: @default

# Use specific models for judgment tasks
judgment and prose: openai/gpt-4o
hardest tasks: openai/gpt-4o

# Use cheap models for read-only probes
how explorer: @smol
why investigators: @smol
```

## OMP settings

These OMP settings affect pstack behavior:

### `task.enableEffort`

Controls whether per-spawn `effort` values are respected. Default: `false`.

When enabled, skills can set `effort: "lo"`, `"med"`, or `"hi"` on individual subagent spawns. This affects the reasoning depth of each spawned agent.

Recommended: enable for full pstack functionality.

```yaml
# ~/.omp/agent/config.yml
task:
  enableEffort: true
```

### `task.maxEffort`

Sets the ceiling for effort values. Default: `"max"`.

```yaml
# ~/.omp/agent/config.yml
task:
  maxEffort: "max"  # or "lo", "med", "hi"
```

### `task.softRequestBudget`

Soft per-subagent request budget. Default: 200 requests.

- `scout` and `sonic` agents cap at 100 requests regardless
- At 1.5x the budget, the agent is forced to yield

```yaml
# ~/.omp/agent/config.yml
task:
  softRequestBudget: 200  # 0 to disable
```

### `task.maxConcurrency`

Maximum number of concurrent subagents. Default: 32.

Affects swarm, arena, and interrogate which spawn multiple parallel workers.

```yaml
# ~/.omp/agent/config.yml
task:
  maxConcurrency: 32  # 0 for unlimited
```

### `task.isolation.mode`

Isolation backend for subagents that need their own worktree. Default: `"none"`.

- `"auto"` — Let OMP pick the best available backend
- `"apfs"` — macOS clonefile reflink
- `"btrfs"` — btrfs subvolume snapshot
- `"none"` — No isolation (workers share the working directory)

```yaml
# ~/.omp/agent/config.yml
task:
  isolation:
    mode: "auto"
```

## Auto mode

Auto-mode is not implemented in the file-based port. To load poteto-mode automatically at session start, you would need an OMP extension.

For now, invoke `/pstack:poteto-mode` at the start of each session.

## Verify configuration

Run the conformance suite to check your setup:

```bash
bun scripts/conformance.ts
```

Then test with a simple prompt:

```
/pstack:poteto-mode
what does this function do?
```

The agent should load poteto-mode, recognize this as a simple question, and answer directly without spawning subagents.

## Troubleshooting

### Skill references a model that doesn't exist

Skills fall back to inline defaults when a configured model is unavailable. Run `/pstack:setup-pstack` to reconfigure.

### Subagents not spawning

Check that `task.batch` is enabled (default: true) and `task.maxConcurrency` is set to a value greater than 0.

### Effort levels not working

Enable `task.enableEffort` in your OMP configuration. Without it, effort values are ignored.

### Workers writing to the same file

Enable isolation: set `task.isolation.mode` to `"auto"` or a specific backend. Workers with `isolated: true` get their own worktree.
