# Phase F — Ship

**Goal:** make the port safe to release and safe to update.

Three parts: conformance suite, user docs, upstream sync tool.

---

## 1. Conformance suite

Five tests. Each is a prompt, an expected route, and an expected shape of
work. Assert on **observable events** (which skill loaded, which agents
spawned, which tools ran, whether a report was produced). Never assert on
prose.

| # | Prompt | Expected |
|---|---|---|
| 1 | `there is a race in foo, reproduce and fix it` | poteto-mode → bug-fix: reproduce → root cause → fix → verify |
| 2 | `prices come from a remote and can change; add a shared cache the cart and order paths use` | poteto-mode → architect: ground callers + cache ownership → ≥2 whole-shape designs → implement → verify (no stale price after mutation, no concurrent-fetch stampede) |
| 3 | `review these 12 packages` | swarm → N workers → independent results → aggregation |
| 4 | `interrogate this PR` | multi-perspective review → findings → one report |
| 5 | `what does this function return?` | direct answer, no playbook, no subagent |

Test 5 is as important as the others.

- Test 2 grades two separate things and must not conflate them. The neutral
  prompt above tests *autonomous* routing: on the local model it routes to
  `feature`, not `architect` (see `findings/conformance-live.md` row 2). A
  hint-activated variant appends the architect trigger phrase to the same
  situation to test the `architect` playbook's *mechanics* on OMP: ground via
  `how`/scout, `arena` with ≥2 whole-shape sketches, synthesize, implement,
  verify. A hinted run grades mechanics only and never reticks the
  autonomous-routing result.

### Run on two models

Routing quality depends on the model. Run the suite on:

- **the local model** — the real target
- **one stronger baseline model** — to separate port defects from model limits

A test that fails locally but passes on the baseline is a *model finding*, not
a port defect. Record which is which. Do not "fix" the port to work around a
weak local model.

### Local CI checks

Cheap and mandatory on every commit:

- **Branding check** — banned strings outside `CREDITS.md` fail the build.
- **Frontmatter check** — every ported file has valid `upstream`,
  `upstream_sha`, `upstream_version`, `status`.

---

## 2. User docs

Under `docs/`:

- `docs/README.md` — what pstack is, one page.
- `docs/install.md` — clone, edit which files, restart.
- `docs/commands.md` — every `/pstack:*` command, one line each.
- `docs/config.md` — the config file from Phase E, with a working example.

A ported product without user docs is not shipped.

---

## 3. Upstream sync tool

Tool set:

```
scripts/
├── fetch-upstream.ts     # vendor pstack/ at a given sha into upstream/pstack/
├── classify-diff.ts      # compare loading roots vs upstream/ via frontmatter
└── generate-report.ts    # human-readable status
```

`cursor/plugins` has no tags, so **you** pick the sync sha. Suggested cadence:
review upstream commits on `pstack/` weekly; sync when a change matters to you
or when the diff gets uncomfortably large.

### Report

```
UPSTREAM STATUS

Cursor pstack: <new sha> (plugin.json v0.15.1)
Ported at:     <old sha> (plugin.json v0.14.2)

unchanged:            31 files
changed (portable):    9   → proposed patch attached, agent reviews
changed (adapted):     4   → human review required
new upstream:          2   → matrix decision needed
removed upstream:      1   → matrix decision needed
conflicts:             1
```

### Procedure

1. Pick a target sha. Run `fetch-upstream.ts <sha>`.
2. `classify-diff.ts` — read the report
3. **Portable diffs are *proposed*, not auto-applied.** Small model or not,
   an agent reviews each patch before commit. Upstream can rename a skill;
   silent auto-apply would break every reference.
4. Adapted files → human review. This is where OMP-specific translation
   lives; a machine cannot decide it.
5. New/removed upstream → add matrix rows with an action.
6. Run the conformance suite. **The suite is what makes the sync safe.** If
   it is red, do not ship.
7. Bump `UPSTREAM.md` (sha, version, date) and every touched file's `upstream_sha` and `upstream_version`.

## Done when

- [ ] All 5 conformance tests pass on the local model, and on the baseline — *requires live OMP session*
- [ ] Local-only failures labelled as model findings — *requires live OMP session*
- [x] Branding check and frontmatter check run on every commit — `bun scripts/branding-check.ts` and `bun scripts/conformance.ts`
- [x] `docs/` has README, install, commands, config
- [ ] A clean-machine install and one test run work from docs alone — *requires clean machine*
- [x] One full sync from one sha to the next completed successfully. `fd878692` (v0.14.5) to `efa2a531` (v0.14.7), report at `findings/sync-0.14.7.md`, green on all eight checks 2026-09-16
