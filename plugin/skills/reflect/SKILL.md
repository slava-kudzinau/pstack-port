---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Before fanning out, find this conversation's session JSONL at `~/.omp/agent/sessions/<encoded-cwd>/<timestamp>_<sessionId>.jsonl`, under the encoded-cwd directory for the active workspace. Use `history://<id>` for the concise transcript of the current session or a parked subagent. Do not glob broadly across `~/.omp/agent/sessions/`. That crosses workspace boundaries and reads private sessions from unrelated projects.

Subagent transcripts sit next to their parent's session file (`<session>/<AgentId>.jsonl`, recursively for nested spawns). For each candidate, read the first entry and check that its text contains the conversation's opening user prompt. Take the matching session. If none matches, pass a tight digest of the session instead.

## 2. Spawn three reviewers in parallel

One `task` tool batch call (`{context, tasks[]}`), three items, `agent: "task"` on each. Not the read-only `scout` agent: reviewers need full tool access to look up the tickets, chat threads, and observability traces the transcript references (reachable via `read`, `web_search`, or `bash`), and `scout` strips it.

| Lens | Model role | Effort | Prompt template |
|---|---|---|---|
| Judgment | the `reflect judgment, divergent, synthesizer` line in `~/.omp/agent/pstack-models.md`, default your configured reflect-judgment role | `xhigh` | `skill://reflect/references/judgment-reviewer.md` |
| Tooling | the `reflect tooling` line in `~/.omp/agent/pstack-models.md`, default your configured reflect-tooling role | `xhigh` | `skill://reflect/references/tooling-reviewer.md` |
| Divergent | the `reflect judgment, divergent, synthesizer` line in `~/.omp/agent/pstack-models.md`, default your configured reflect-judgment role | `xhigh` | `skill://reflect/references/divergent-reviewer.md` |

Model choice is the caller's configured role (`skill://setup-pstack`); never a literal model ID in this skill's text. Pick each subagent's reasoning level and fast or standard speed for the job, per the Subagents section of the **poteto-mode** skill (`skill://poteto-mode`). Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in the task result.

## 3. Synthesize

One `task` call, `agent: "task"` with `effort: "xhigh"` (full tool access, same reasoning as step 2), using the `reflect judgment, divergent, synthesizer` line in `~/.omp/agent/pstack-models.md`, default your configured reflect-judgment role. It spot-verifies citations with that same full tool access. Pass `skill://reflect/references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See `skill://principle-encode-lessons-in-structure`.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

File each Backlog item to your team's devex or backlog tracker without waiting. Only the Accepted list waits for approval.

Never edit a skill under `~/.omp/plugins/`. Before approval, show its destination, `.omp/skills/<skill>/` or `~/.omp/agent/skills/<skill>/`. After approval, copy the skill folder there and edit the copy. Never open a PR or push.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to `skill://authoring-a-skill` and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to `skill://authoring-a-skill` and run its description-optimization loop.
- `new skill via authoring-a-skill: <kebab-name>`: hand creation to `skill://authoring-a-skill`. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
