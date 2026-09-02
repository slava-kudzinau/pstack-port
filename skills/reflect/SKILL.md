---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
metadata:
  upstream: 'pstack/skills/reflect/SKILL.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: "Three `Task` calls with a per-call subagent-type field (SKILL.md:37,49) rewritten to one `task` tool batch call per stage, `agent: \"task\"` (full tool access; not the read-only `scout`), since OMP's task tool has no per-call `readonly` flag — model/tool grants come from agent frontmatter and config, not a spawn-time parameter (task-agent-discovery.md). Per-call literal model defaults dropped for generic configured-role language, matching poteto-mode.md's \"never a literal model ID\" convention — OMP's task tool sets only `agent`, never a worker model (task-agent-discovery.md). `~/.cursor/projects/*/agent-transcripts/` (:25) rewritten to OMP's session-file layout plus `history://<id>`. Cursor's built-in `create-skill` skill (:64-66) rewritten to pstack's own `skill://authoring-a-skill` playbook — OMP has no built-in skill-authoring wizard. The four `references/*.md` reviewer/synthesizer prompt templates are carried under `skills/reflect/references/` with the same `.cursor/skills/`/`Task`/`Read` substitutions, no added frontmatter (they're pasted verbatim into task prompts, not loaded as skills themselves)."
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

## When to invoke

- The user said "reflect" or "/reflect".
- A complex task (5+ tool calls) just landed cleanly and the recipe is worth keeping.
- The agent hit dead ends, found the working path, and the path generalizes.
- The user corrected the agent's approach mid-task.
- A non-trivial workflow emerged that isn't captured anywhere.

Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## Process

### 1. Locate the active transcript

The parent locates its own session before fanning out. Sessions persist as JSONL at `~/.omp/agent/sessions/<encoded-cwd>/<timestamp>_<sessionId>.jsonl`; use `history://<id>` for the concise transcript of the current session or a parked subagent. Do not glob broadly across `~/.omp/agent/sessions/`. That crosses workspace boundaries and reads private sessions from unrelated projects.

Subagent transcripts are stored next to their parent's session file (`<session>/<AgentId>.jsonl`, recursively for nested spawns).

For each candidate, read the first entry and check that its text contains the conversation's opening user prompt. Take the matching session. If no session resolves, write a tight digest of the session and pass that instead.

### 2. Spawn three reviewers in parallel

One `task` tool batch call (`{context, tasks[]}`), three items, `agent: "task"` on each — not the read-only `scout` agent, which strips the full tool access reviewers need for context lookups (tickets, chat threads, observability traces referenced in the transcript, reachable via `read`, `web_search`, or `bash`).

| Lens | Model role | Effort | Prompt template |
|---|---|---|---|
| Judgment | your configured reflect-judgment role | `hi` | `skill://reflect/references/judgment-reviewer.md` |
| Tooling | your configured reflect-tooling role | `med` | `skill://reflect/references/tooling-reviewer.md` |
| Divergent | your configured reflect-judgment role | `hi` | `skill://reflect/references/divergent-reviewer.md` |

Model choice is the caller's configured role (`skill://setup-pstack`); never a literal model ID in this skill's text. Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in the task result.

### 3. Synthesize

One `task` call, `agent: "task"` with `effort: "hi"` (full tool access, same reasoning as step 2), using your configured reflect-judgment role. The synthesizer's quality check includes spot-verifying citations, which needs that same full tool access. Use `skill://reflect/references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. The synthesizer returns a structured Accepted / Rejected / Backlog list.

### 4. Structural enforcement check

Sanity-check the synthesizer's Accepted list. For any item that would be enforced more reliably by a lint rule, script, metadata flag, or runtime check, move it from Accepted to Backlog. The synthesizer already applies this criterion; this is a final pass before edits land. See `skill://principle-encode-lessons-in-structure`.

### 5. Apply

Before applying any Accepted edit, present the synthesizer's full Accepted/Rejected/Backlog output to the user and wait for explicit approval. The user picks which subset to apply and may redirect routings. Skill changes affect every future agent in the org; do not auto-apply.

Backlog items file to whatever devex / backlog tracker your team uses automatically. Those are tracker submissions, not skill edits. Only the Accepted list waits for approval.

For each approved Accepted item, follow the Routing field exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to `skill://authoring-a-skill` and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to `skill://authoring-a-skill` and run its description-optimization loop.
- `new skill via authoring-a-skill: <kebab-name>`: hand creation to `skill://authoring-a-skill`. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done. Skip this step if it doesn't.

### 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
