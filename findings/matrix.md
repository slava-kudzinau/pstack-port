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
| authoring-a-skill | playbook | rules | markdown skill | ADAPT | B | `upstream/pstack/skills/poteto-mode/SKILL.md:5` routes to Cursor's built-in `create-skill`; no OMP equivalent, so rewrite the step around `skill://` + `manage_skill`/`learn` tools |
| autonomous-run | playbook | rules | markdown skill | ADAPT | B | Cursor `/loop` and `AskQuestion` don't exist in OMP (`autonomous-run.md:6,9`); replace with `task` batch + `hub` wait and `ask` |
| autopilot-full | playbook | rules | markdown skill | ADAPT | B | One Cursor cloud agent per PR, `/goal`, `gt`, `control-cli`/`control-ui` (`autopilot-full.md:5-10`); rewrite to OMP `task` `isolated`/`apply`/`merge` + `hub` jobs |
| autopilot-stack | playbook | rules | markdown skill | ADAPT | B | Same cloud-agent/`/goal`/Graphite machinery (`autopilot-stack.md:5-7`); OMP `task` batch + `isolated` covers the parallel-build shape |
| babysit | playbook | rules | markdown skill | ADAPT | B | Built on Cursor's built-in babysit + `drive` (`babysit.md:3`); rewrite to OMP `task` `isolated` + `hub` jobs and `gh` via `bash` |
| bug-fix | playbook | rules | markdown skill | ADAPT | B | References `control-cli`/`control-ui`, `Task` tool, `gpt-5.6-sol-max` slug (`bug-fix.md:7-9`); rewrite to OMP tool names and role aliases |
| eval | playbook | rules | markdown skill | ADAPT | B | Skill-eval loop names Claude tool names and `claude-*` slugs (`eval/SKILL.md`); rewrite to `task` + `completion`-style flow; keep methodology |
| feature | playbook | rules | markdown skill | ADAPT | B | `feature.md` routes via `Task` subagents + `run_in_background`; rewrite to `task` batch form |
| hillclimb | playbook | rules | markdown skill | ADAPT | B | Metric-loop playbook binds Cursor `run_in_background` + `claude-*` slugs; rewrite to `task` batch + `modelRoles` |
| investigation | playbook | rules | markdown skill | ADAPT | B | `investigation.md` dispatches `subagent_type: scout`-style probes; OMP ships `scout`/`sonic` natively (`task/discovery.ts:4-11`) |
| multi-phase-plan | playbook | rules | markdown skill | ADAPT | B | `multi-phase-plan.md:7,15,35,43,71` names `subagent_type: poteto-agent`, `control-ui/cli`, `/goal`; rewrite to OMP `task` + `ask` |
| opening-a-pr | playbook | rules | markdown skill | ADAPT | B | `opening-a-pr.md:5,19` uses `Task` worktree semantics + `control-*`; OMP `task` `isolated`/`apply`/`merge` replaces the worktree choreography |
| orchestrate | playbook | rules | markdown skill | ADAPT | B | `orchestrate.md:19,32,97` is a Cursor cloud-agent orchestration loop (`environment: "cloud"`, Cursor dashboard, `AskQuestion`); rewrite to OMP `task` batch + `hub` |
| pause-safely | playbook | rules | markdown skill | ADAPT | B | `pause-safely.md:3` speaks "restart Cursor" and Cursor compaction; rewrite to OMP compaction + `hub` lifecycle |
| perf-issue | playbook | rules | markdown skill | ADAPT | B | Baseline-measurement playbook binds `Task` + `claude-*` roles; rewrite to `task` batch |
| prototype | playbook | rules | markdown skill | ADAPT | B | Prototype playbook's `AskUserQuestion`/`Agent` tool flow (`poteto-mode/SKILL.md:20`) has no OMP twin; rewrite to `task` + `ask` |
| refactoring | playbook | rules | markdown skill | ADAPT | B | `refactoring.md` delegates via `Task` tool; rewrite to `task` |
| runtime-forensics | playbook | rules | markdown skill | ADAPT | B | Live-instrumentation playbook names `Task` + Claude tool names; rewrite to OMP `debug`/`bash` + `task` |
| session-pickup | playbook | rules | markdown skill | ADAPT | B | `session-pickup.md` resumes from transcript/cloud-agent URL; OMP has `history://` + `hub` — rewrite the plumbing, keep the steps |
| shipping | playbook | rules | markdown skill | ADAPT | B | `shipping.md:7` arms Graphite merge-when-ready with `control-ui`/`control-cli`; rewrite to `task` batch over `bash`+`gh`/`gt` |
| trace-forensics | playbook | rules | markdown skill | ADAPT | B | Post-hoc artifact diagnosis names `Task` subagents; rewrite tool refs to `task` |
| visual-parity | playbook | rules | markdown skill | ADAPT | B | Pixel-parity flow uses Cursor `verify`/`control-ui`; rewrite to OMP `browser` tool driving the real surface |
| worktree-cleanup | playbook | rules | markdown skill | ADAPT | B | `worktree-cleanup.md:10` deletes `~/Library/Application Support/Cursor` state; rewrite paths for OMP (`~/.omp/agent`), keep `git worktree` steps |
| principle-boundary-discipline | principle | rules | markdown skill | ADAPT | B | Body names Claude tool names and `claude-*` slugs (as in `poteto-mode/SKILL.md` pointers); port text, rewrite tool refs |
| principle-build-the-lever | principle | rules | markdown skill | ADAPT | B | "Build the tool that does it" prose cites `Agent`/`Task` delegation; rewrite to OMP `task` |
| principle-encode-lessons-in-structure | principle | rules | markdown skill | ADAPT | B | Encodes rules as "a lint, metadata flag, runtime check" written for the Claude `Skill` tool; rewrite to OMP `learn`/`manage_skill` (`docs/skills.md:49-66`) |
| principle-exhaust-the-design-space | principle | rules | markdown skill | ADAPT | B | "Build 2-3 competing prototypes" routes through `Task xN`; OMP does fan-out natively via `task` batch (`task/types.ts:167-176`) |
| principle-experience-first | principle | rules | markdown skill | ADAPT | B | Prose is stable; `run`/`verify`/`loop` references must be rewritten (`poteto-mode/SKILL.md:13,30`) |
| principle-fix-root-causes | principle | rules | markdown skill | ADAPT | B | Debugging flow names `Task` subagents and Claude tool names; rewrite to `task`/`bash` |
| principle-foundational-thinking | principle | rules | markdown skill | ADAPT | B | Same: tool-name and model-slug references rewritten; methodology text kept |
| principle-guard-the-context-window | principle | rules | markdown skill | ADAPT | B | "Route bulk to subagents" is exactly OMP's `task` design; rewrite to `task` batch + `local://` handoffs (`docs/task-agent-discovery.md:76-85`) |
| principle-laziness-protocol | principle | rules | markdown skill | ADAPT | B | Body addresses "codemod, script, generator" via Claude `Agent` delegates; rewrite to `ast_edit`/`bash`/`task` |
| principle-make-operations-idempotent | principle | rules | markdown skill | ADAPT | B | Crash/retry design cites Claude tool names; rewrite refs, keep invariants |
| principle-migrate-callers-then-delete-legacy-apis | principle | rules | markdown skill | ADAPT | B | "Migrate callers and delete" cites `Task` delegates; rewrite to `task` |
| principle-minimize-reader-load | principle | rules | markdown skill | ADAPT | B | Review-shaping text cites `Agent`/`Skill` tools; rewrite to OMP tool names |
| principle-model-the-domain | principle | rules | markdown skill | ADAPT | B | State-machine guidance cites Claude tools; rewrite refs, keep domain advice |
| principle-never-block-on-the-human | principle | rules | markdown skill | ADAPT | B | Explicitly built on `AskUserQuestion` (`poteto-mode/SKILL.md:20`); OMP `ask` replaces it 1:1, rest copies |
| principle-outcome-oriented-execution | principle | rules | markdown skill | ADAPT | B | "Don't preserve throwaway compatibility" written around Claude `Task` orchestration; rewrite to `task` |
| principle-prove-it-works | principle | rules | markdown skill | ADAPT | B | "Verify against real artifact, not proxy" maps to OMP `verify`-less world; rewrite to `task`/`browser`/`bash` verification |
| principle-redesign-from-first-principles | principle | rules | markdown skill | ADAPT | B | References `Task` delegates; rewrite to `task`, keep rule |
| principle-separate-before-serializing-shared-state | principle | rules | markdown skill | ADAPT | B | Cites `Task` worktrees and cloud agents; OMP `task` `isolated` per spawn (`task/types.ts:146-147`) replaces it |
| principle-sequence-verifiable-units | principle | rules | markdown skill | ADAPT | B | `Task`/`Skill` tool refs; rewrite to `task` + `skill://` |
| principle-subtract-before-you-add | principle | rules | markdown skill | ADAPT | B | Claude-tool refs in "remove dead weight" steps; rewrite |
| principle-type-system-discipline | principle | rules | markdown skill | ADAPT | B | "Brand semantic primitives" text cites Claude tool names; rewrite |
| architect | skill | Task | task + scout fan-out | ADAPT | B | Keep the design-sketch methodology; swap only the plumbing: `Task`/`Agent` tool → `task` dispatch (`task/types.ts:114-130`), `subagent_type`/`claude-*` slugs → `agent: "scout"`/`"@smol"` (`task/agents.ts:45-76`, `task/discovery.ts:4-16`) |
| arena | skill | Task xN | task.batch | ADAPT | B | Keep the bakeoff/graft methodology; one batch `task` call (`{context, tasks[]}`, `task/types.ts:167-176`) replaces N `Task` spawns; `run_in_background` and `subagent_type` dropped |
| automate-me | skill | rules | markdown skill | ADAPT | B | Entire flow is Cursor `create-skill` + `.cursor/skills` + `AskQuestion` (`automate-me/SKILL.md:11,17,44,67,109`); rewrite to OMP skill layout + `ask`; OMP has no `run`/`verify` built-in for the "drives your app" step |
| blast-radius | skill | rules | markdown skill | ADAPT | B | `blast-radius/SKILL.md` runs "the tool that proves it" via `Task` + `run_in_background`; rewrite to `task` subagents over `bash`/`ast_edit` |
| bro | skill | rules | markdown skill | ADAPT | B | Delegation to a `Task` child (`poteto-mode` routing) must become a `task` dispatch; prose style rule kept |
| create-verification-skill | skill | rules | markdown skill | ADAPT | B | Builds `SKILL.md` via Claude `Skill`/`Task` tooling (`create-verification-skill/SKILL.md`); rewrite to OMP `learn`/`manage_skill` (`docs/skills.md:49-66`, `docs/tools/manage_skill.md:23-29`) |
| figure-it-out | skill | rules | markdown skill | ADAPT | B | "Runs a hypothesis loop, logs via show-me-your-work" uses `Task` delegates + `run_in_background`; rewrite to `task` batch |
| how | skill | Task xN | task + scout fan-out | ADAPT | B | Keep the walkthrough method; dispatch becomes `task` items (`agent: "scout"` for read-only probes, `task/agents.ts:45-76`); Cursor subagent roster names deleted, not translated |
| interrogate | skill | Task xN | task.batch | ADAPT | B | Keep the interrogation protocol; N reviewers = one batch `task` call (`task/types.ts:167-176`); `isolated`/`apply`/`merge` are per-item settings (`config/settings-schema.ts:4835-4849`), not skill content |
| maintain-verification-skill | skill | rules | markdown skill | ADAPT | B | Parallel source readers on `Task`/`Task` tool; rewrite to `task` batch; OMP `read` caps large dirs (`docs/tools/read.md`), keep the "one PR" rule |
| make-bot-ui | skill | rules | markdown skill | ADAPT | B | `make-bot-ui/SKILL.md` drives Cursor `run`/`verify`/`loop` primitives that OMP lacks (`poteto-mode/SKILL.md:13`); rewrite to OMP `browser`/`bash` verification flow |
| no-comments | skill | rules | markdown skill | ADAPT | B | Spawns `subagent_type: "Comment Sicko"` (`no-comments/SKILL.md:19`); OMP spawns via `agent: "comment-sicko"` in the `task` tool |
| poteto-mode | skill | rules | OMP skill + routing prompt | ADAPT | B | The router itself: `subagent_type: "poteto-agent"`, `Task` tool, `run_in_background`, `claude-*` slugs all banned/absent (`poteto-mode/SKILL.md:20,89-91,136-140`); rewrite to OMP `task`/`ask`/`skill://`, drop `claude-*` model slugs (conventions §1) |
| recall | skill | rules | markdown skill | ADAPT | B | Rebuilds context from transcripts via `Task` subagents; OMP has `history://` + `memory://` (`docs/tools/recall.md`) — rewrite to OMP URLs |
| reflect | skill | rules | markdown skill | ADAPT | B | Three parallel reviewers on `subagent_type: generalPurpose` (`reflect/SKILL.md:37,41-49`); OMP `task` batch with `agent: scout`-style roles replaces it (`task/agents.ts:45-76`) |
| setup-pstack | skill | rules | markdown skill | ADAPT | B | Writes `~/.claude/pstack-models.md` with `claude-*` slugs (`setup-pstack/SKILL.md:14,22,42-56`); rewrite to `~/.omp/agent/pstack-models.md` + OMP role aliases (`docs/task-agent-discovery.md:49-74`) |
| show-me-your-work | skill | rules | markdown skill | ADAPT | B | TSV trail via `log.sh` + `run_in_background`; the trail concept survives, tool refs rewritten to `task`/`bash` |
| swarm | skill | Task xN | task.batch | ADAPT | B | Keep the roster semantics but re-express as one `task` batch — `context` + `tasks[]` (`task/types.ts:167-176`); drop `subagent_type`, `run_in_background`, `claude-*` slugs per `findings/translation-notes.md` rules 1/2/5/6 |
| tdd | skill | rules | markdown skill | ADAPT | B | Delegation to code-writing subagents uses Claude `Task`; OMP `task` replaces it, `isolated: true` for `task` role (`task/discovery.ts:43-60` for `.md` discovery) |
| teach | skill | rules | markdown skill | ADAPT | B | Runs `how` + `write` and delegates to `Task` subagents; rewrite to OMP `task` dispatch |
| technical-writing | skill | rules | markdown skill | ADAPT | B | References Claude `Skill` tool and `claude-*` slugs (`poteto-mode/SKILL.md:91`); rewrite to `skill://` and OMP roles |
| typescript-best-practices | skill | rules | markdown skill | ADAPT | B | Delegates `Task` subagents to run `tsc`/`tsdoc`; rewrite to `task` subagents over `bash` |
| unslop | skill | rules | markdown skill | ADAPT | B | "Cleanup-afterward pass measured to fail" text references `Agent` tool and Claude tool names (`poteto-mode/SKILL.md:13,91`); rewrite to OMP `task`/`bash` |
| why | skill | Task xN | task + scout fan-out | ADAPT | B | Keep the cited-read methodology; `AskQuestion` → `ask` (rule 3), `Task` fan-out → `task` batch over evidence sources (`task/types.ts:111-112,167-176`); MCP/`resources_discover` steps rewritten to `read`/`web_search`/`bash` |
| comment-sicko | agent | agent | .omp/agents/*.md | ADAPT | B | Upstream `agents/comment-sicko.md` carries Cursor frontmatter (`subagent_type`, `run_in_background`, `claude-*` model slug, per `README.md:192`); OMP agent files need `name`+`description` only, `model: "@smol"`-style roles (`task/discovery.ts:43-60`, `task/agents.ts:45-76`) |
| poteto-agent | agent | agent | .omp/agents/*.md | ADAPT | B | `agents/poteto-agent.md:1-5` has `name`/`description` plus Cursor-only `is_background: true` and `subagent_type` refs; OMP spawns with `task` tool `{agent: "poteto-agent"}`, no `subagent_type` (`docs/task-agent-discovery.md:51-85`) |
