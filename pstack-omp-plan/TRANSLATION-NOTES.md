# Translation notes (frozen — Phase A)

**Stale reference.** The reference port (`refs/ref-port`) pins `pstack` at
`4612556` (VERSION `0.9.15`, `refs/ref-port/VERSION:1`) and
`cursor-team-kit/skills` at `e46364b` (`refs/ref-port/tools/upstream.json`).
Our upstream pin is `cursor/plugins` @ `fd878692de15a3069c21c8f429eb0b9f2fe178fa`,
version `0.14.5` (`UPSTREAM.md:1-2`). Per `pstack-omp-plan/10-phase-a-study.md:49-51`
the reference is **stale** — trust `refs/omp-src` and `upstream/pstack/`, not
the reference, wherever they disagree.

## How the reference port solved the primitives

| Problem | Reference-port solution | Evidence |
|---|---|---|
| Cursor-isms in copied skill text | Mechanical substitution table (`Task`/`Task` tool → `Agent` tool, `AskQuestion` → `AskUserQuestion`, `.cursor/skills/` → `.claude/skills/`) applied with plain split/join rewrites | `refs/ref-port/tools/substitutions.json`; `refs/ref-port/tools/sync.mjs:29-41` |
| Tokens that need a human sentence, not a token swap | Denylist (`control-cli`, `control-ui`, `/goal`, `cursor.com`, `Cursor cloud agent`); any leftover hit fails the whole sync run | `refs/ref-port/tools/sync.mjs:43-51,157-161` |
| Upstream drift between syncs | Three-way compare: old-upstream+substitutions vs local vs new-upstream+substitutions; clean updates auto-written, port-edited files flagged for manual merge; pin advanced only on success | `refs/ref-port/tools/sync.mjs:66-108,114-170` |
| Facts copied into many files | `generate.mjs` stamps source-of-truth values (VERSION → 3 plugin manifests; skill frontmatter → Codex prompt stub + README table; `models.json` → every `## Models` section) and CI fails on a stale copy (`bun tools/generate.mjs && git diff --exit-code`) | `refs/ref-port/tools/generate.mjs:1-22,36-46,106-108` |
| Model slugs | No `claude-*` slug may survive in skill prose outside generator-owned regions | `refs/ref-port/tools/generate.mjs:197-238` |
| Agent dispatch | All reference skills target the CC `Agent`/`Task` tool with `subagent_type` + `run_in_background` (e.g. `refs/ref-port/plugins/pstack/skills/interrogate/SKILL.md`, `.../swarm/SKILL.md`) | read once per question; see `findings/matrix.md` rows |

## What carries over to the OMP port

1. **The sync machinery idea ports directly.** `sync.mjs` compares three
   trees and gates the pin on a denylist scan — nothing CC-specific in that
   design; only the substitution table contents must be re-authored for OMP
   (`task` tool with `{agent, task}` items, `ask`, `.omp/skills` +
   `<root>/SKILL.md` layout, `commands/*.md` files-only).
2. **The generator idea ports too.** OMP sources of truth differ
   (`omp --profile`/`PI_CODING_AGENT_DIR` roots, `omp.extensions` manifest
   in `package.json` — `refs/omp-src/docs/skills/authoring-extensions.md:83-105`),
   but "stamp facts from one file into every copy" is unchanged.
3. **The denylist must grow.** Every reference-port substitution target is
   itself Cursor/CC-only (`Agent` tool, `AskQuestion`, `.claude/skills/`,
   `claude-*` slugs); none of it loads in OMP. All 70 matrix components are
   `ADAPT` for exactly this reason (`findings/matrix.md:20-89`).

## What must be redone for OMP (do not trust the reference)

- Any instruction naming `Task`/`Agent` tool, `subagent_type`,
  `run_in_background`, `AskQuestion`, `control-cli`/`control-ui`, `/goal`,
  Cursor cloud agents, or `claude-*` slugs — rewrite against OMP's single
  `task` tool (`refs/omp-src/packages/coding-agent/src/task/types.ts:114-177`),
  `ask`, and the `.omp`-first discovery roots
  (`task/discovery.ts:4-16`).
- CC plugin manifests (`.claude-plugin/plugin.json`, `.codex-plugin`,
  `hooks/run-hook.cmd`) — OMP loads extensions from `omp.extensions`
  manifests, `index.ts`/`index.js`, or explicit `--extension` paths
  (`refs/omp-src/docs/skills/authoring-extensions.md:91-97`).
