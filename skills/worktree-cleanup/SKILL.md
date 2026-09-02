---
name: worktree-cleanup
description: Reclaim local disk by pruning merged or abandoned git worktrees and stale iOS simulators, safety-gated against deleting anything in use or holding uncommitted work. Routed from poteto-mode's Worktree and simulator cleanup trigger, or invoked directly for "what's using my disk", "clean up worktrees", "prune safe-to-prune worktrees", "free up space", "delete old simulators".
disable-model-invocation: true
metadata:
  upstream: 'pstack/skills/poteto-mode/playbooks/worktree-cleanup.md'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'adapted'
  note: "worktree-cleanup.md:10 the `~/Library/Application Support/Cursor` state-deletion target rewritten to OMP's `~/.omp/agent`, keeping the state.vscdb.backup/snapshots reasoning as prose about the equivalent bloat pattern; worktree-cleanup.md:5-7 parenthetical bare-name principle mentions (principle-build-the-lever, principle-encode-lessons-in-structure, principle-prove-it-works, principle-guard-the-context-window) rewritten as skill:// pointers, since disable-model-invocation hides bare mentions from OMP's auto-discovered listing. local fix: step 1's `scripts/worktree-audit.sh` is now ported into this skill directory from upstream `pstack/skills/poteto-mode/scripts/worktree-audit.sh`, so the step 1 path resolves. The port retargets its transcript scan to OMP's prompt-history database at `~/.omp/agent/history.db`. That recency signal reads prompt rows and prompt text, weaker than Cursor's full transcript scan, so the step 2 and 3 gates carry the in-use verdict."
---

# Worktree and simulator cleanup

**You own the disk and the safety gate.** Prune merged or abandoned git worktrees and stale iOS simulators to reclaim space. Deletion is irreversible, so every step guards against deleting something in use or holding uncommitted work.

1. Snapshot and audit. Record `df -h /`, then run `scripts/worktree-audit.sh` (`skill://principle-build-the-lever`). It reads paths from `git worktree list`, never hand-typed, since a hand-typed `myrepo-worktrees/x` misses one that lives at `.cursor/worktrees/myrepo/x` (`skill://principle-encode-lessons-in-structure`). It classifies each worktree by size, age, merge state, uncommitted work, PR state, and the newest chat that touched it, then suggests a bucket. The transcript scan is slow, so background it.
2. The bucket is advice, not permission. The pinned and active chats are the real artifact (`skill://principle-prove-it-works`). Get that set from the user or sidebar and cross-check every candidate. The lever has marked `safe` a worktree the user had pinned, so the pinned set wins.
3. Verify usage before deleting. For every `verify-recent-chat` row, or anything you doubt, fan subagents out to read the transcripts and report whether the chat is pinned or ongoing and which worktrees it touches (`skill://principle-guard-the-context-window`, transcripts are bulk). A pinned chat spawns arena and repro trees into sibling worktrees via background subagents, and those are in use even when their names never hit the sidebar.
4. Pause on irreversible loss. `wip:N` is N tracked uncommitted edits. Show the diff and get a decision first, since removing a clean worktree is recoverable from its branch but uncommitted work is gone. `scratch:N` is untracked throwaway, safe to drop, but name the files. Per Autonomy, clean and merged and not-in-use proceeds; `wip` and in-use pause.
5. Prune the confirmed set. Per path, `git worktree remove --force <path>`; if the dir survives on ignored build artifacts, `rm -rf` it, then `git worktree prune`. Branch refs survive, so no commits are lost. Confirm with `df -h /` and re-list.
6. Simulators and other reclaimers. Simulators are usually the next-biggest win. `xcrun simctl --set testing delete all` (XCTestDevices clones), `xcrun simctl delete unavailable`, and `xcrun simctl runtime list` then `runtime delete <id>` for old runtimes. More when needed: Xcode `DerivedData` and `iOS DeviceSupport`; `~/.omp/agent` (state and snapshot directories that balloon per project root you have opened); package caches (pnpm, uv, brew, yarn). Clear only caches the user has not said to keep.

This is the one playbook that deletes user state with no code review to catch a slip, so the gates above are the review.

**Reply:** `df -h /` before and after with space reclaimed, the worktrees pruned, and a one-line reason for each held back (in-use by which chat, or uncommitted work).
