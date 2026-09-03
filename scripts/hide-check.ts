#!/usr/bin/env bun
// Proves the frontmatter hide flag actually hides, by running the pinned OMP
// loader the way the running session does. The loader picks the provider, so this
// measures the real install rather than a lane this script invents.
//
// `hide: true` keeps a skill reachable through `skill://<name>` while excluding it
// from the rendered system prompt listing
// (refs/omp-src/packages/coding-agent/src/extensibility/skills.ts:24-29). The
// loader derives it only from a top-level boolean compared with `=== true`
// (refs/omp-src/packages/coding-agent/src/extensibility/skills.ts:113,260,298,399).
// A demoted copy under `metadata:` never reaches that comparison
// (refs/omp-src/packages/utils/src/frontmatter.ts:21-43).
//
// With cwd inside this repo, the loader resolves the `extensions:` setting from
// the persisted config and reports provider `omp-plugins`, which is how this
// plugin loads in a live session
// (refs/omp-src/packages/coding-agent/src/discovery/omp-extension-roots.ts:296-320).

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSkills } from "../refs/omp-src/packages/coding-agent/src/extensibility/skills.ts";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const { skills, warnings } = await loadSkills({ cwd: repo });
const mine = skills.filter((s) => s.filePath.startsWith(repo + "/"));
const hidden = mine.filter((s) => s.hide);
const visible = mine.filter((s) => !s.hide);

for (const w of warnings) console.error(`warn ${w.skillPath}: ${w.message}`);
const provider = [...new Set(mine.map((s) => s.source))].join(", ");
console.log(`loaded ${mine.length} from this repo via ${provider}`);
console.log(`hidden ${hidden.length}, visible ${visible.length}`);
console.log(`visible: ${visible.map((s) => s.name).sort().join(", ")}`);

if (mine.length === 0) {
	console.error("FAIL: nothing loaded from this repo, so the extension registration is not active");
	process.exit(1);
}
if (hidden.length === 0) {
	console.error("FAIL: no skill reported hide=true, so the flag is inert");
	process.exit(1);
}
