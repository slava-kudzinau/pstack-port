# Commands

All commands are namespaced under `/pstack:` to avoid collisions with OMP's built-in commands.

## Entry point

| Command | What it does |
|---|---|
| `/pstack:poteto-mode` | Load the routing skill — your entry point for all pstack workflows |

## Workflow

| Command | What it does |
|---|---|
| `/pstack:architect` | Design before implementing — sketch types, signatures, module structure |
| `/pstack:arena` | Spawn parallel candidates, pick the best, graft the rest |
| `/pstack:autonomous-run` | Drive a long task to completion without stopping |
| `/pstack:bug-fix` | Reproduce, root-cause, fix, verify a reported defect |
| `/pstack:figure-it-out` | Design a bespoke playbook for complex, non-standard work |
| `/pstack:hillclimb` | Sustained improvement of one metric against a target |
| `/pstack:orchestrate` | Run a whole project with one coordinator chat |
| `/pstack:perf-issue` | Trace and improve measured slowness against a baseline |
| `/pstack:prototype` | Throwaway sketch to make a design decision cheaply |
| `/pstack:refactoring` | Behavior-preserving change to structure or shape |
| `/pstack:runtime-forensics` | Diagnose a runtime symptom from live instrumentation |
| `/pstack:session-pickup` | Resume or take over a prior agent's in-flight work |
| `/pstack:shipping` | Verify and land a green stack with Graphite merge-when-ready |
| `/pstack:swarm` | Fan out parallel workers for coverage or races |
| `/pstack:trace-forensics` | Diagnose a captured profiling artifact |
| `/pstack:visual-parity` | Pixel-exact UI equivalence between two implementations |

## Review

| Command | What it does |
|---|---|
| `/pstack:interrogate` | Multi-perspective adversarial review from independent angles |
| `/pstack:thermo-nuclear-code-quality-review` | Deep maintainability review for abstraction quality and spaghetti |
| `/pstack:review` | Standard code review with quality checks |

## Research

| Command | What it does |
|---|---|
| `/pstack:how` | How does this code work? Explains subsystems and flows |
| `/pstack:why` | Why was this built this way? Traces historical decisions |
| `/pstack:teach` | Explain a body of work so a person actually understands it |
| `/pstack:recall` | Reconstruct recent working context from chat history |
| `/pstack:blast-radius` | Find what a change could break somewhere else |

## PR workflow

| Command | What it does |
|---|---|
| `/pstack:babysit` | Drive a PR to merge-ready: conflicts, review threads, CI |
| `/pstack:fix-ci` | Find failing PR checks, inspect logs, apply fixes |
| `/pstack:fix-merge-conflicts` | Resolve merge conflicts non-interactively |
| `/pstack:get-pr-comments` | Fetch and summarize review comments from the active PR |
| `/pstack:make-pr-easy-to-review` | Clean history, improve descriptions, add reviewer guidance |
| `/pstack:opening-a-pr` | Create a PR at the end of a workflow |
| `/pstack:what-did-i-get-done` | Summarize authored commits over a time period |

## Tools

| Command | What it does |
|---|---|
| `/pstack:setup-pstack` | Configure which models each role uses |
| `/pstack:create-verification-skill` | Generate a project-local verification skill |
| `/pstack:maintain-verification-skill` | Periodic pass to keep verification skills honest |
| `/pstack:tdd` | Test-driven development: write failing test, implement, confirm |
| `/pstack:show-me-your-work` | Keep a reviewable decision trail for autonomous work |
| `/pstack:reflect` | Spawn reviewers to extract learnings from recent work |
| `/pstack:automate-me` | Capture working style or preferences into a skill |

## Quality

| Command | What it does |
|---|---|
| `/pstack:de-slop` | Remove AI-generated slop from code and prose |
| `/pstack:unslop` | Cut AI tells from any writing |
| `/pstack:no-comments` | Spawn comment-sicko to delete unnecessary comments |
| `/pstack:technical-writing` | Layered technical writing: Diátaxis, Google style, STE rules |
| `/pstack:typescript-best-practices` | TypeScript best practices for code review |

## Utility

| Command | What it does |
|---|---|
| `/pstack:bro` | Restate the last message in plain human language |
| `/pstack:pause-safely` | Suspend in-flight work cleanly for later resume |
| `/pstack:worktree-cleanup` | Prune merged or abandoned git worktrees and stale simulators |

## How commands work

Each command routes to a skill. The skill contains the full workflow, with step-by-step instructions. When you invoke a command, OMP loads the corresponding skill and the agent follows its instructions.

Skills reference each other via `skill://` links. For example, architect spawns arena for parallel design candidates, which uses OMP's `task` tool with batch mode.

## Custom commands

To add a new command, create a file in the `commands/` directory:

```
commands/pstack:my-command.md
```

The file must have a `description:` field in its frontmatter. The body can route to an existing skill or contain inline instructions.
