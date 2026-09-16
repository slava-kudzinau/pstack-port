#!/usr/bin/env bun
// Scans every file under skills/, agents/, and commands/ for skill:// and
// agent:// pointers and verifies each target exists in-tree: skills/<name>/,
// agents/<name>.md, commands/<name>.md, or a real subpath inside a skill
// directory; an agent:// target may also name a bundled OMP agent role
// (refs/omp-src/packages/coding-agent/src/task/agents.ts:45-76).
//
// Companion assets must be addressed by pointer, never by path. OMP announces the
// skill directory only for an interactive `/skill:<name>` invocation
// (refs/omp-src/packages/coding-agent/src/prompts/skills/user-invocation.md);
// `skill://<name>` serves the raw bytes with no base directory, and a missing
// asset returns an explicit error with no fallback search
// (refs/omp-src/docs/skills.md:194,201). So a backticked `references/foo.md`, a
// `./sources/foo.md`, a `../SKILL.md`, and every markdown link target all resolve
// against the reader's working directory and miss. The form that resolves is
// `skill://<name>/<relative-path>` (refs/omp-src/docs/skills.md:169-170).
//
// Usage: bun scripts/orphan-scan.ts

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");
const SCAN = ["skills", "agents", "commands"];
const BUNDLED = ["scout", "designer", "reviewer", "security-reviewer", "librarian", "task", "sonic"];

function files(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(join(plugin, dir), { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...files(full));
    else if (e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

// `<source>` and `*` name a family of assets, not one file, so a pointer at a
// family is legal while nothing on disk matches its text.
const family = (p: string) => p.includes("<") || p.includes("*");
const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;
const failures = new Set<string>();
const pointerSites: string[] = [];
const assetPaths: string[] = [];

for (const file of SCAN.flatMap(files)) {
  const text = readFileSync(join(plugin, file), "utf-8");

  for (const m of text.matchAll(/(skill|agent):\/\/([A-Za-z_][A-Za-z0-9_-]*)(\/[^\s`|)\]]*)?/g)) {
    const [, kind, target, sub] = m;
    const site = `${file}:${lineOf(text, m.index)}`;
    pointerSites.push(`${kind}://${target}${sub ?? ""}`);
    if (sub !== undefined) assetPaths.push(`${target}${sub}`);
    if (kind === "agent") {
      if (!existsSync(join(plugin, "agents", `${target}.md`)) && !BUNDLED.includes(target))
        failures.add(`ORPHAN ${kind}://${target} (${site})`);
      continue;
    }
    const skillDir = join(plugin, "skills", target);
    if (!existsSync(join(skillDir, "SKILL.md"))) {
      failures.add(`ORPHAN skill://${target} (${site})`);
      continue;
    }
    if (sub === undefined || family(sub)) continue;
    const asset = sub.replace(/#.*$/, "").replace(/\/$/, "");
    if (!existsSync(join(skillDir, asset)))
      failures.add(`MISSING ASSET skill://${target}${sub} (${site})`);
  }

  // The relative-path rule needs a skill directory to resolve against. Files
  // under agents/ and commands/ address assets through pointers only, so their
  // cwd-relative text is out of scope rather than assumed to name an asset.
  const skill = file.startsWith("skills/") ? file.split("/")[1] : null;
  if (skill === null) continue;
  const skillDir = resolve(plugin, "skills", skill);
  const fromDir = resolve(join(plugin, file), "..");

  const candidates: Array<[string, number]> = [];
  for (const m of text.matchAll(/`([^`\s]+)`/g)) candidates.push([m[1], m.index]);
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) candidates.push([m[1], m.index]);

  for (const [token, index] of candidates) {
    const path = token.replace(/#.*$/, "");
    if (path === "" || path.includes("://") || family(path) || !path.includes("/") && !path.endsWith(".md")) continue;
    if (path.startsWith("~") || path.startsWith("/")) continue;
    // A bare `SKILL.md` in an entry file names the format everyone's skill uses,
    // not this skill's own file; only a companion's bare name points at a sibling.
    if (!path.includes("/") && file === join("skills", skill, "SKILL.md")) continue;
    const hit = resolve(fromDir, path);
    if (!hit.startsWith(skillDir + sep) && hit !== skillDir) continue;
    if (!existsSync(hit)) continue;
    const want = `skill://${skill}/${relative(skillDir, hit)}`;
    failures.add(`RELATIVE PATH ${file}:${lineOf(text, index)} \`${token}\` resolves from the reader's cwd; write \`${want}\``);
  }
}

const distinct = [...new Set(pointerSites)];
if (failures.size > 0) {
  for (const f of [...failures].sort()) console.error(f);
  console.error(`orphan scan: ${failures.size} failures (${distinct.length} distinct pointers)`);
  process.exit(1);
}
console.log(`orphan scan: clean (${distinct.length} distinct pointers, ${new Set(assetPaths).size} asset paths)`);
