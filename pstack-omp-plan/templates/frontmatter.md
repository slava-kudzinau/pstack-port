# Provenance frontmatter

Copy this to the top of every file under `port/`. The local frontmatter check
fails if any required field is missing.

```yaml
---
upstream: pstack/skills/architect/SKILL.md
upstream_sha: 4a1c2f9e0b7d1c8e3a5b6d9f0a2c4e6b8d1f3a5c
upstream_version: 0.14.2         # from plugin.json if present, else short sha
status: portable
note: (optional) one line — why adapted or why native
---
```

## Fields

| Field | Required | Meaning |
|---|---|---|
| `upstream` | yes | Path inside `upstream/pstack/`. Use `none` for `status: new`. |
| `upstream_sha` | yes | Full sha of `cursor/plugins` this content came from. |
| `upstream_version` | yes | `pstack/.cursor-plugin/plugin.json` version if present, else short sha. Human label. |
| `status` | yes | `portable`, `adapted`, `omp-native`, or `new`. |
| `note` | no | One line: why adapted, why native. |

## `status` values

| Value | Meaning | On upstream sync |
|---|---|---|
| `portable` | copied, wording unchanged | patch proposed, agent reviews |
| `adapted` | runtime parts rewritten for OMP | human review, every time |
| `omp-native` | uses an OMP feature | human review |
| `new` | ours, no upstream link | ignored by diff |

## Rules

- Changing a `portable` file's wording flips it to `adapted`.
- Never edit files under `upstream/pstack/`. Read-only snapshot.
- Bump `upstream_sha` and `upstream_version` on every file touched during a
  sync.
