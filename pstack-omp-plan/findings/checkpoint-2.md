## Checkpoint 2 — Phase C complete

**Date:** 2026-08-31
**OMP version:** 18.0.11 @ c2ade4bba14fb4706857286afb5528bc2244bf44
**Upstream pstack:** cursor/plugins @ fd878692de15a3069c21c8f429eb0b9f2fe178fa
**cursor-team-kit:** @ e46364b8be46000b7df0f260550cd712afbb8d36

### Deliverables

| Kind | Count | Status |
|---|---|---|
| Skill dirs (`skills/*/SKILL.md`) | 74 | All pass frontmatter validator |
| Agent files (`agents/*.md`) | 2 | `poteto-agent`, `comment-sicko` — both discovered by OMP |
| Commands (`commands/*.md`) | 30 | All pass frontmatter validator |
| Total ported | 76 | 70 ADAPT + 6 PORT; `make-bot-ui` DROP |

### Checks (re-run at checkpoint time)

| Check | Result | Evidence |
|---|---|---|
| Frontmatter | Clean — 74 skills + 30 commands pass closed-schema validator | `scripts/validate-frontmatter.ts` |
| Orphan scan | Clean — 67 distinct `skill://`/`agent://` pointers, all resolve | `scripts/orphan-scan.ts` |
| Branding | Clean — no banned strings outside `note:` metadata | `scripts/branding-check.ts` |
| Phase B probes | Clean — agents discovered incl. `poteto-agent`, `comment-sicko` | `scripts/verify-phase-b.ts` |

### Open questions

None. All Phase A discovery, format, task-tool, and extension-API questions answered with `path:lines` evidence (see `98-questions.md`).

### Decisions made

- `make-bot-ui`: `DROP` — de-scoped per user decision 2026-08-31. Cursor Routines/webhook automation with no OMP equivalent; files deleted.
- `de-slop`: `name: de-slop` (not `deslop`) — source dir is `de-slop`, OMP requires `name` to match directory name (`agent-plugin-format.ts:110-111`).
- Provenance keys (`upstream`, `upstream_sha`, `upstream_version`, `status`, `note`) moved under `metadata:` — the only OMP-accepted container for custom keys.
- `what-did-i-get-done`: `PORT` — body is `git log` + `bash` only, no Cursor constructs. Audited clean in reference port (`CHANGES.md:222`).

### Scripts added

| Script | Purpose |
|---|---|
| `scripts/validate-frontmatter.ts` | Closed-schema frontmatter audit for skills + commands |
| `scripts/orphan-scan.ts` | `skill://`/`agent://` pointer verification |
| `scripts/branding-check.ts` | Banned-string sweep (expanded to include `Cursor`, `GPT`, `Gemini`, `Qwen`) |
