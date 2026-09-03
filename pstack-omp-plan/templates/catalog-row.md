# Provenance catalog row

Every shipped artifact (`plugin/skills/**`, `plugin/commands/*.md`,
`plugin/agents/*.md`, `plugin/hooks/*.md`) gets one row in the `## Catalog`
table of `PROVENANCE.md` at the repo root; `bun scripts/provenance.ts
--check` fails without it. Provenance never returns to shipped frontmatter:
every shipped byte reaches the model on each `skill://` read.

| Cell | Meaning |
|---|---|
| `Path` | Package-root-relative, `skills/how/SKILL.md`. Sorted ascending. |
| `Upstream` | Repo-root-resolvable path (`upstream/pstack/skills/how/SKILL.md`, `refs/cursor-plugins/cursor-team-kit/skills/deslop/SKILL.md`, `refs/ref-port/plugins/pstack/hooks/session-start-context.md`) or `none`. |
| `Sync` | 8-char pin the row was authored against; full shas in `UPSTREAM.md` (`upstream_sha`, `cursor_plugins_sha`, `ref_port_sha`). |
| `Status` | `portable`, `adapted`, `omp-native`, `new`. `Upstream: none` requires `new`. |

## `status` values

| Value | Meaning | On upstream sync |
|---|---|---|
| `portable` | copied, wording unchanged | patch proposed, agent reviews |
| `adapted` | runtime parts rewritten for OMP | human review, every time |
| `omp-native` | uses an OMP feature | human review |
| `new` | ours, no upstream link | ignored by diff |

## Rules

- Changing a `portable` file's wording flips its row to `adapted`.
- Never edit files under `upstream/pstack/`. Read-only snapshot.
- Bump `Sync` on every row touched during a sync; full shas live only in
  `UPSTREAM.md`.
- Rows are appended by `bun scripts/provenance.ts --migrate`, which derives
  them from remaining frontmatter or the path convention and never
  overwrites an existing row; correct a derivation by editing the row after.
