# pstack-port

[pstack](https://github.com/cursor/plugins/tree/main/pstack) ported to two agent
platforms: [Claude Code](https://claude.com/claude-code) and
[Oh My Pi](https://github.com/agent-optimizer/omp). pstack is a collection of
skills and playbooks that route coding work through specialized workflows,
design before implementing, parallel multi-model review, root-caused bug
fixes, no half-measures.

Both targets are generated or adapted from the same pinned upstream snapshot
(`UPSTREAM.md`), with every shipped file traced back to its source in
`PROVENANCE.md`.

## Two targets, one repo

| Target | Path | Docs |
| --- | --- | --- |
| Claude Code plugin | `plugins/pstack/` | [docs/claude-code.md](docs/claude-code.md) |
| Oh My Pi extension | `plugin/` | [docs/README.md](docs/README.md) |

The Claude Code target is generated from `upstream/pstack/` by
`tools/claude/apply.mjs`; the OMP target is hand-adapted. Neither depends on
the other. Pick the doc for the platform you're using; it has the install,
setup, and configuration steps.

## Repo layout

```
pstack-port/
├── plugins/pstack/   # Claude Code target, generated (do not hand-edit
│                     # skills/agents/manifests; hooks/ and models.json/
│                     # policy.json are hand-carried exceptions)
├── plugin/           # OMP target, hand-adapted
├── tools/claude/     # the Claude Code generator (apply.mjs) and its rules
├── upstream/         # vendored, pinned upstream snapshots, read-only
├── docs/             # per-target install and configuration docs
├── scripts/          # verification: provenance, branding, tree invariants
├── AGENTS.md         # conventions, hard rules, and the re-sync procedure
├── PROVENANCE.md      # per-file / per-glob ledger: every shipped artifact's
│                     # upstream source and sync status
└── UPSTREAM.md       # pinned upstream commit shas
```

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md) for the per-source
attribution (this repo vendors content from three upstream MIT projects:
pstack, cursor-team-kit, and superpowers).
