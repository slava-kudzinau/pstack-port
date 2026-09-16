# Upstream sync report: 0.14.5 to 0.14.7

Pins come from `UPSTREAM.md`, and every count below is output a check printed at
this head on 2026-09-16. `bun scripts/classify-diff.ts` and
`bun scripts/generate-report.ts` regenerate the two status tables.

## Pin and version story

`UPSTREAM.md:1-3` pins pstack at `efa2a531985e0a8084d36ff3cf87233be8a9f34b`,
labelled v0.14.7, synced 2026-09-02. The prior pin was
`fd878692de15a3069c21c8f429eb0b9f2fe178fa`, v0.14.5. Nine commits sit between
them.

The content and the pin carry different versions. `pstack/.cursor-plugin/plugin.json`
reads v0.14.6 at `23a56e2` ("docs(pstack): port forge-neutral playbooks and Fable 5.1
defaults"), which holds every playbook rewrite this port consumed. It reads v0.14.7 at
`efa2a531`, whose only manifest change is one `"logo": "assets/logo.png"` line. So the
`- sync:` bullet's version cell describes the sha it names and says `(0.14.7)`, while
the prose around it legitimately says 0.14.6. Both readings are true, and "correcting"
either one to match the other would be wrong twice. `AGENTS.md:30,177` said 0.14.6 for
the pin and now says 0.14.7.

The vendored tree is faithful to the pin. `git -C refs/cursor-plugins archive
efa2a531… -- pstack | tar -x -C /tmp/vfy` followed by `diff -r /tmp/vfy/pstack
upstream/pstack` reported zero differing bytes.

## Upstream status

```
unchanged:            46 files
changed (portable):   0 files
changed (adapted):    61 files
new upstream:         1 files
removed upstream:     0 files
conflicts:            0 files
orphaned:             0 files
```

The one `new upstream` entry is `skills/make-bot-ui/SKILL.md`. It is already
classified DROP with a recorded reason (`pstack-omp-plan/98-questions.md:11-12`),
because its Cursor Routines and webhook primitives have no OMP counterpart. The tool
prints it whenever the port holds no copy, so the line belongs in this report until
upstream deletes the file.

## Matrix

| Action | Count |
|---|---|
| PORT | 6 |
| ADAPT | 70 |
| NATIVE | 0 |
| REPLACE | 0 |
| DEFER | 0 |
| DROP | 1 |
| **Total** | **77** |

These are the component rows of `findings/matrix.md`, and they match
`findings/checkpoint-2.md:55-58` exactly. `generate-report.ts` used to count these
actions as raw substrings across the whole file, which added one phantom per action
because `findings/matrix.md:9-14` spells every action in backticks inside the Actions
legend, and reported NATIVE 1 where the port has none.

## Catalog

| Status | Shipped files |
|---|---|
| portable | 46 |
| adapted | 61 |
| omp-native | 0 |
| new | 30 |
| **Total** | **137** |

`new` covers the 30 slash commands under `plugin/commands/`, which have no upstream
file to descend from. Rows come from `bun scripts/provenance.ts --migrate`, and
`--check` audits them.

## cursor-team-kit check

One commit sits after `cursor_plugins_sha` `e46364b8be46000b7df0f260550cd712afbb8d36`:
`c5b04a544585702f2525d1d199f61e28dde4184a` "Make plugin descriptions client-agnostic",
2026-08-11. It rewords `.cursor-plugin/plugin.json` and `marketplace.json` descriptions
plus the upstream root README across 21 files. It touches no file under
`cursor-team-kit/skills/`, so the six PORT imports and `thermo-nuclear-code-quality-review`
have no port-side counterpart. The team-kit pin stays where it is.

## Checks at this head

| Check | Result |
|---|---|
| `bun scripts/branding-check.ts` | clean (skills, agents, commands, extensions, hooks) |
| `bun scripts/validate-frontmatter.ts` | clean (74 skills, 30 commands) |
| `bun scripts/hide-check.ts` | 73 hidden, 1 visible |
| `bun scripts/autofire-check.ts` | injects once, silent on re-entry |
| `bun scripts/orphan-scan.ts` | clean, 101 distinct pointers, 35 asset paths |
| `bun scripts/conformance.ts` | 74 passed, 0 failed |
| `bun scripts/provenance.ts --check` | clean, 137 artifacts |
| `bun scripts/classify-diff.ts` | changed (portable): 0 |

The one skill still visible to every session is `investigation`. That is correct
rather than a defect: rule 6 of `AGENTS.md` requires the hide flag on any skill a
`skill://` pointer targets, and `grep` finds no such pointer at `investigation`, which
serves as the entry point a user or model can discover on its own.

## Fixed during this closeout

`why` shipped without its reference assets. `skill://why/references/epistemics.md`
returned `File not found`, and the skill text instructed the synthesizer to follow a
confidence framework whose words were absent, then disclosed that the framework would
arrive in a later phase that had already happened. Twelve assets are vendored from the
pinned snapshot. Nine are byte-identical and three carry the pointer rewrite.

Companion assets were addressed by path in 11 files across 42 sites. Backticked
`references/foo.md`, `./sources/foo.md`, `../SKILL.md`, and every markdown link target
all resolve against the reader's working directory, because OMP announces the skill
directory only for an interactive `/skill:<name>` invocation
(`refs/omp-src/packages/coding-agent/src/prompts/skills/user-invocation.md`) while
`skill://<name>` serves raw bytes. The rewrite goes through the guarded codemod, which
touches a mention only when the named file exists inside that skill directory, so an
unrelated token such as `skills/verify-<app>/features/README.md` stays alone.

`orphan-scan.ts` checked only the skill name inside a pointer, so no check ever
verified that an asset existed, and its regex required a pointer name to start with a
letter, letting `_`-prefixed names escape detection entirely. It now resolves every
subpath against disk and rejects cwd-relative companion paths. A planted fixture
exercised all five failure modes, and the tool exits 1 on each.

## Still owed

Five behavioral conformance prompts remain in `findings/conformance-live.md`. T1 and T2
pass on the local model, a baseline-model run is owed for both before any Phase F box
ticks, and T3 through T5 are blank. One clean-machine install worked from `docs/` alone
is outstanding.

The next upstream delta is not yet knowable. The last fetch was 2026-09-02, so
`git -C refs/cursor-plugins fetch origin` has to run before anything beyond
`efa2a531` can be seen.
