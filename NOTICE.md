# NOTICE

This repo ports upstream MIT-licensed work to Claude Code (`plugins/pstack/`) and
OMP (`plugin/`). All upstream copyright notices and license terms are preserved.

## Upstream sources

| Component | Upstream | Copyright | License | License file |
| --- | --- | --- | --- | --- |
| Everything under `plugins/pstack/skills/` and `plugin/skills/` not listed below | [cursor/plugins/pstack @ efa2a53](https://github.com/cursor/plugins/tree/efa2a531985e0a8084d36ff3cf87233be8a9f34b/pstack) | (c) 2026 Lauren Tan | MIT | [LICENSE](LICENSE) |
| `{plugins/pstack,plugin}/skills/de-slop/`, `.../fix-ci/`, `.../fix-merge-conflicts/`, `.../get-pr-comments/`, `.../make-pr-easy-to-review/`, `.../thermo-nuclear-code-quality-review/`, `.../what-did-i-get-done/` | [cursor/plugins/cursor-team-kit](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit), vendored at `upstream/cursor-team-kit/skills/` | (c) 2026 Cursor | MIT | [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) |
| `plugins/pstack/hooks/run-hook.cmd` (near-verbatim) | [anthropics/claude-plugins-official → superpowers](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/superpowers) (originally `obra/superpowers`) | (c) 2025 Jesse Vincent | MIT | [LICENSE-superpowers](LICENSE-superpowers) |

See `PROVENANCE.md` at repo root for the full per-file / per-glob ledger (upstream
path, sync pin, and portable/adapted/omp-native/new status for every shipped
artifact) and `UPSTREAM.md` for the pinned upstream commit shas.

## Modifications

Per the MIT license, modifications are permitted. Skill bodies are edited to
substitute Cursor-specific primitives with Claude Code and OMP equivalents;
`PROVENANCE.md`'s per-file rows and inline migration notes record what changed
per file. All upstream copyright notices in source files, where present, are
preserved (e.g. the attribution comment at the top of
`plugins/pstack/hooks/run-hook.cmd`).

Files authored for this port (not derived from any upstream source): the
generator (`tools/claude/`), `plugins/pstack/policy.json`,
`plugins/pstack/models.json`, `plugins/pstack/hooks/hooks.json`,
`plugins/pstack/hooks/session-start`,
`plugins/pstack/hooks/session-start-context.md`,
`.claude-plugin/marketplace.json`, this `NOTICE.md`, `LICENSE-cursor-team-kit`
and `LICENSE-superpowers` (copied verbatim from their respective upstreams),
and the `docs/`, `AGENTS.md`, `README.md` project documentation.
