# Findings — Phase B: vertical slice

Pins: OMP 18.0.11 @ `65f79e76fcc89b96632fe86a598f314bd7cfc725`; upstream `cursor/plugins` @ `fd878692de15a3069c21c8f429eb0b9f2fe178fa` (v0.14.5).

## Slice ported

- `agents/poteto-agent.md` — adapted from `upstream/pstack/agents/poteto-agent.md`. Dropped `is_background`; the per-call subagent-type field is gone, replaced by the `task` tool's `agent` field.
- `skills/poteto-mode/SKILL.md` — skeleton, adapted from `upstream/pstack/skills/poteto-mode/SKILL.md`. Routes only to the Bug fix trigger; the other 21 playbooks and 21 principle skills are explicitly out of scope for this slice and not ported. Dropped Cursor skill-picker decorations (`mode`, `icon`, `color`, `reminder`) that have no OMP behavior (`capability/skill.ts:12-32` — extra frontmatter keys survive as inert opaque metadata, so keeping them would just be dead weight).
- `skills/bug-fix/SKILL.md` — adapted from `upstream/pstack/skills/poteto-mode/playbooks/bug-fix.md`. `control-cli`/`control-ui` → OMP's `bash`/`browser`/`debug` tools; `Task` tool + `gpt-5.6-sol-max` slug → the `task` tool's `agent` field + a configured model role (conventions §1 bans literal model IDs in skill text); Cursor's `/loop` → plain iteration language. Dropped `skill://` pointers to `architect`/`tdd`/`sequence-verifiable-units`/`opening-a-pr`/`how`/`why` — none are ported in this slice, so the steps are inlined instead of left as dangling references.
- `commands/pstack:poteto-mode.md` — `status: new`, `upstream: none`. Cursor has no separate command file; `/poteto-mode` fires from the skill's own frontmatter there. Shape follows the Codex prompt-stub pattern in `refs/ref-port/tools/generate.mjs:106-108` (read once for this port), adapted for OMP's `commands/*.md` + `$@` input expansion.
- `scripts/branding-check.ts` — new. Scans `skills/`, `agents/`, `commands/` for the conventions §1 denylist (`claude`, `anthropic`, `sonnet`, `opus`, `haiku`, `.claude/`, `subagent_type`, `claude.md`), case-insensitive, `CREDITS.md` exempt.
- `scripts/verify-phase-b.ts` — new. Direct proof that `poteto-agent` resolves through `discoverAgents`'s extension-root lane from a cwd with no `.omp/agents` of its own.
- Retired `.omp/agents/poteto-agent.md` and `scripts/sanity-poteto-agent.ts` — the Phase-A-only sanity-check copy under the project-local root. Superseded by the root `agents/poteto-agent.md`, which is the actual distributable layout (`01-conventions.md` §3). Its evidence is already recorded in `findings/phase-a.md`; keeping a script that now silently reports the agent missing (because the file moved) would be misleading.

## Format-doc correction found by this slice

`task/commands.ts:66-109` and `discovery/omp-plugins.ts:87-107` name commands flatly — `name: name.replace(/\.md$/, "")`, no namespace prefix, no subdirectory join. The `<plugin>:<command>` prefix seen in `discovery/claude-plugins.ts:303,321` is specific to the **Claude-marketplace plugin provider**, keyed off that plugin's manifest `name`; it does not apply to an OMP extension-package `commands/` directory loaded via `-e`/`extensions:`. So `01-conventions.md` §2's `/pstack:<name>` namespace is not automatic for our loading root — the command file itself must be named `pstack:<name>.md` (colon is a legal POSIX filename character; verified below). Recorded so Phase C doesn't rediscover this the hard way.

`docs/skills/authoring-extensions.md` and `discovery/omp-extension-roots.ts:279-339` also confirm no `package.json`/`omp.extensions`/entry point is required for `skills/`, `agents/`, `commands/` sibling discovery from a directory named via `-e`/`--extension`/`extensions:` — that manifest only matters for loading the directory as a JS extension module, a distinct concern deferred to Phase E per `01-conventions.md` §3.

## Probe 1 — bug fix (expect: routes through poteto-mode to Bug fix; reproduce → root cause → fix → verify)

Command: `omp --cwd /tmp/phaseb-probe -e <repo> -p "/pstack:poteto-mode there is a race in counter.js, reproduce and fix it" --auto-approve --no-session`

Fixture (`/tmp/phaseb-probe/counter.js`): three concurrent `slowIncrement()` calls with a classic read-await-write race; expected count 3, actually prints 1.

Transcript (verbatim):

> Fixed the race in `counter.js`.
>
> **What was broken.** Three concurrent `slowIncrement()` calls should leave `counter` at 3. It printed 1 on every run.
>
> **Root cause.** Non-atomic read-modify-write across an `await`. Each call captured `const current = counter` before yielding the event loop, then wrote `counter = current + 1` after. With all three yielding at the same point, all three read `0` first, then each wrote `1`. Last write wins. Instrumented runtime evidence, verbatim:
>
> ```
> #1 read counter=0
> #2 read counter=0
> #3 read counter=0
> #1 wrote counter=1 (from stale current=0)
> #2 wrote counter=1 (from stale current=0)
> #3 wrote counter=1 (from stale current=0)
> final counter: 1
> ```
>
> **Fix.** Move the read-modify-write to after the `await` and make it a single synchronous statement, `counter += 1`. Node is single-threaded, so with no `await` between the read and the write no other call can interleave.
>
> **How I verified.** Ran the original `node counter.js` ten times. Before, failing repro, five runs: `counter: 1` ×5. After the fix, ten runs: `counter: 3` ×10.
>
> **Principles applied.** Fix Root Causes shaped the fix — I traced the wrong output to the stale capture across the await and removed that, rather than guarding the symptom. Prove It Works shaped verification — I ran the real `counter.js`, not a proxy, before and after. Sequence Work into Verifiable Units shaped the order — failing repro first, then the one-line fix, then the passing repro.
>
> **Deviations from the playbook, stated honestly.** I skipped delegating the fix to a subagent — it is a one-line change and delegation is pure overhead here. I skipped staging commits and opening a PR — `/tmp/phaseb-probe` is not a git repository and has no remote.

**Result: pass.** The command resolved, routed through the skeleton's Bug fix trigger, and named exactly the three principles kept in the trimmed Principles section (Fix Root Causes, Prove It Works, Sequence Work into Verifiable Units) — proof the skill's actual text, not a memorized version, drove the reply. The stated deviations show it read the full playbook (it names the steps it skipped, not just the ones it did) rather than improvising.

## Probe 2 — plain question (expect: direct answer, no playbook, no subagent)

Command: `omp --cwd /tmp/phaseb-probe -e <repo> -p "what does the clamp function in util.js return?" --auto-approve --no-session`

Transcript (verbatim, 6.00s):

> `clamp(x, lo, hi)` returns `x` constrained to `[lo, hi]`: `lo` if `x < lo`, `hi` if `x > hi`, otherwise `x`. Implemented as `Math.min(Math.max(x, lo), hi)`.

**Result: pass.** No todolist, no playbook steps, no subagent dispatch — a direct read-and-answer in 6 seconds. No over-firing.

## Agent discovery proof (independent of the two probes)

`bun run scripts/verify-phase-b.ts` from `cwd=/tmp/phaseb-probe` (no `.omp/agents` of its own) with `extensionRoots: {explicit: [<repo>], mode: "merge"}`:

```
projectAgentsDir: null
discovered: poteto-agent, comment-sicko, scout, designer, reviewer, security-reviewer, librarian, task, sonic
poteto-agent found via extension root: true
systemPrompt first line: You are operating as poteto-mode's full agent style. Read the `poteto-mode` skill's `SKILL.md` in full before doing any work, including its inline Principles index. Navigate to a leaf `principle-*` skill whenever you apply that principle.
systemPrompt mentions is_background: false
```

`projectAgentsDir: null` proves `poteto-agent` came from the `agents/` extension-root lane, not a project `.omp/agents` fallback — `/tmp/phaseb-probe` has none. `comment-sicko` here is OMP's own bundled agent (used by the native `no-comments` skill), not part of this port.

## Done when

- [x] Both probes pass — see transcripts above
- [x] Branding check passes — `bun run scripts/branding-check.ts` → `branding check: clean (skills, agents, commands)`
- [x] Provenance frontmatter valid on every file — `agents/poteto-agent.md`, `skills/poteto-mode/SKILL.md`, `skills/bug-fix/SKILL.md` carry `upstream`/`upstream_sha`/`upstream_version`/`status`; `commands/pstack:poteto-mode.md` carries `upstream: none`/`upstream_sha`/`upstream_version`/`status: new`
- [x] `poteto-agent` reads the same skill files as the main agent, no duplicated prompt text — its body is one pointer sentence to `poteto-mode`'s `SKILL.md`, no copied prose
- [ ] Human review complete (checkpoint 2)
