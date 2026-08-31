# Phase E — Extension (only if needed)

**Skip this phase if Phases A–D covered everything with files alone.** Add an
extension only for things files cannot do.

## What the extension is for

- reading and validating pstack config
- `/pstack:setup` command
- optional `session_start` routing hint
- any custom tool that Phase D proved necessary

## Keep it thin

```
src/
├── main.ts          # factory: register commands, tools, hooks
├── config.ts        # load + validate pstack config
├── commands/        # one file per handler
└── hooks/           # session_start etc.
```

`main.ts` is glue. Logic lives in modules.

## Model configuration

Try OMP's own agent roles and effort levels first. If that is enough, no
custom config is needed.

If not, add a thin backend-neutral config file. Sketch:

```yaml
# ~/.omp/agent/pstack.yaml
pstack:
  auto_mode: false          # true → inject a small routing hint at session start
  aliases: false            # true → also register /architect, /arena etc.
  roles:
    architect: reviewer     # OMP role name
    arena: reviewer
    swarm: task
    interrogate: reviewer
  effort:
    architect: hi
    arena: hi
    swarm: med
    interrogate: hi
  budgets:
    swarm: 40               # soft request budget
    arena: 80
```

The extension translates this into OMP runtime settings. Skill and agent files
never contain model IDs.

## Auto mode

Off by default. When on, `session_start` injects a **short** routing hint. It
must not inject the full `poteto-mode` skill — the skill loads only when
routing fires.

## Install

Document the real steps in `docs/install.md` (Phase F). No OMP registry
exists; a user clones and adds a path to `config.yml`. Confirm whether
`settings.json` is also required for your pinned OMP version.

## Output

- working extension loaded from a clean machine using the docs
- `docs/install.md`

## Done when

**Skipped.** Phases A-D covered everything with files alone. No extension needed:

- Model configuration: `~/.omp/agent/pstack-models.md` (plain text, skills read directly)
- Auto mode: invoke `/pstack:poteto-mode` manually; OMP `session_start` event available but not needed
- Budgets/effort: OMP's `task.enableEffort` + `task.maxEffort` settings
- Isolation: OMP's `task.isolation.mode` setting

If a future need arises (e.g. automatic skill injection at session start), revisit this phase.
