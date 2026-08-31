# Porting matrix

One row per upstream component. No blank cells. Filled in Phase A against the pinned `cursor/plugins` sha.

## Actions

| Action | Meaning |
|---|---|
| `PORT`    | copy as-is |
| `ADAPT`   | rewrite runtime parts for OMP |
| `NATIVE`  | use OMP feature instead |
| `REPLACE` | Cursor-specific; build an OMP equivalent |
| `DEFER`   | out of v1, with reason |
| `DROP`    | not porting, with reason |

## Table

| Component | Kind | Upstream primitive | OMP target | Action | Phase | Notes |
|---|---|---|---|---|---|---|
| poteto-mode | skill | native routing | OMP skill + routing prompt | PORT | B | product centre |
| principles (x21) | skill | rules | markdown skill | PORT | C | confirm count |
| playbooks (x22) | skill | rules | markdown skills | PORT | C | confirm count |
| tdd | skill | rules | markdown skill | PORT | C | |
| architect | skill | Task | `task` + `scout` fan-out | ADAPT | D | read-only inspection |
| arena | skill | Task xN | `task.batch` + isolated worktree | ADAPT | D | competing attempts |
| swarm | skill | Task xN | `task.batch` | NATIVE | D | shared context |
| interrogate | skill | Task xN | `task.batch` + `reviewer` | ADAPT | D | one report |
| how / why | skill | Task xN / MCP+Task | `task.batch` + `scout` / OMP MCP | ADAPT | D | |
| poteto-agent | agent | agent | `.omp/agents/*.md` | PORT | B | reads same rules |
| comment-sicko | agent | agent | `.omp/agents/*.md` | PORT | C | not a prompt in /no-comments |
| no-comments, unslop, technical-writing | skill | rules | markdown skills | PORT | C | |
| setup-pstack | command | Cursor rules | `/pstack:setup` + config | REPLACE | E | model roles |
| auto-fire | behaviour | — | `session_start`, opt-in | ADAPT | E | short hint only |
| Cursor MCP discovery | infra | Cursor | OMP MCP | ADAPT | D | |
| /loop | command | Cursor loop | async jobs? | DEFER | — | decide in A |
| Cursor automations | infra | Cursor | — | DEFER | — | |
| Cursor UI | infra | Cursor | OMP TUI or none | REPLACE | E | |
| cursor-team-kit deps | dep | external | — | DEFER | — | deslop, control-cli, control-ui |
| Benny | feature | Cursor | — | DEFER | — | |
