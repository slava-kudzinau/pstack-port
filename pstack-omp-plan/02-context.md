# Context: what pstack is

Read before any phase. This describes the product to preserve.

Numbers below come from the draft brief. Confirm them against the pinned
upstream snapshot in Phase A and correct this file.

## What pstack is

An opinionated engineering methodology for a coding agent, shipped as skills
and agent definitions. It is not a tool collection. Its value is that it makes
the agent choose the right way of working for the task in front of it.

23 playbooks, 21 principles, supporting skills, two agents.

## The centre: poteto-mode

`poteto-mode` is a router, not one more skill. It is the default entry point.

```
user request
   → classify the task
   → pick a playbook
   → execute
   → delegate when appropriate
```

Task types include: investigation, bug fix, feature, performance, refactoring,
prototype, plus specialist skills (`architect`, `arena`, `swarm`,
`interrogate`, `tdd`) and the principles that are always in force.

If routing is wrong, nothing else matters. A perfect playbook fired at the
wrong moment is worse than useless.

## Core ideas to preserve

- **Routing before work.** Classify first, then act.
- **Fearless parallelism.** Independent work fans out to many agents. Serial
  `arena` / `swarm` / `interrogate` is a broken port.
- **One source of truth for methodology.** The main agent and `poteto-agent`
  read the same rules. No prompt duplication.
- **Proportionality.** Small questions get small answers. The methodology
  must not fire on a one-line lookup.

## What "correct" looks like

The five acceptance tests in `60-phase-f-ship.md` define correct behaviour.
Read that table now.

## What OMP already gives you

Confirmed later, but in short: a `task` tool with batching, background jobs,
isolated worktrees, effort levels, request budgets, and built-in roles
(`scout`, `sonic`, `reviewer`, `task`). Agents are plain markdown files.

So most pstack orchestration should map onto features that already exist. Do
not reproduce Cursor behaviour through prompt text where OMP has a real
feature.
