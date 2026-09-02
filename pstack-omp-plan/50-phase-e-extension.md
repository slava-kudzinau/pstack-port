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

**Partly revisited.** Phases A-D covered model configuration, budgets, and
isolation with files alone:

- Model configuration: `~/.omp/agent/pstack-models.md` (plain text, skills read directly)
- Budgets/effort: OMP's `task.enableEffort` + `task.maxEffort` settings
- Isolation: OMP's `task.isolation.mode` setting

The automatic-injection case this file deferred did arrive. Every skill a
`skill://` pointer targets now carries `disable-model-invocation: true`, so the
system prompt listing shows one of them. A session needs an injected reason to
read `skill://poteto-mode`, and files cannot supply that. Shipped:

- `package.json` declares `omp.extensions`, resolved by
  `extensibility/extensions/loader.ts:518-536`
- `extensions/pstack-autofire.ts` injects `hooks/session-start-context.md` once
  per branch on `before_agent_start`
- `scripts/autofire-check.ts` proves it loads, fires once, and stays quiet on
  re-entry

Auto mode stays off. The mandate names the entry pointer and the six direct-entry
playbooks. It inlines no skill body.
