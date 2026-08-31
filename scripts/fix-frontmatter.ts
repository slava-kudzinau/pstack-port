#!/usr/bin/env bun
// Rewrites every deliverable's frontmatter to pass the audit in
// scripts/validate-frontmatter.ts: the six closed-schema keys (see
// refs/omp-src/packages/coding-agent/src/discovery/agent-plugin-format.ts:105-114)
// stay at column 0; every other top-level key — the provenance block from
// pstack-omp-plan/01-conventions.md rules 4/5 plus Cursor-only
// `disable-model-invocation`/`menu-description`/`note` keys — moves under
// `metadata:` with its value single-quoted so YAML still parses it (a value
// containing ": " would otherwise read as a mapping indicator).

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEPT: Record<string, true> = {
	name: true,
	description: true,
	license: true,
	compatibility: true,
	metadata: true,
	"allowed-tools": true,
};

function quote(value: string): string {
	const v = value.trim();
	if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v;
	return `'${v.replace(/'/g, "\\'")}'`;
}

function rewrite(path: string): string | null {
	const lines = readFileSync(path, "utf-8").split("\n");
	if (lines[0] !== "---") return "no frontmatter";
	const end = lines.indexOf("---", 1);
	if (end === -1) return "unterminated frontmatter";
	const kept: string[] = [];
	const moved: string[] = [];
	for (const line of lines.slice(1, end)) {
		if (line.trim() === "") continue;
		const pair = /^([^ ][^:]*): (.*)$/.exec(line) ?? /^([^ ][^:]*):$/.exec(line);
		if (pair === null) return `unparseable line ${JSON.stringify(line)}`;
		if (KEPT[pair[1]] === true) kept.push(line);
		else moved.push(`  ${pair[1]}: ${quote(pair[2] ?? "")}`);
	}
	if (moved.length > 0 && !kept.includes("metadata:")) kept.push("metadata:");
	const block = kept.at(-1) === "metadata:" ? [...kept, ...moved] : kept;
	writeFileSync(path, ["---", ...block, "---", ...lines.slice(end + 1)].join("\n"));
	return null;
}

const targets = [
	...readdirSync(join(repo, "skills"), { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => join(repo, "skills", e.name, "SKILL.md")),
	...readdirSync(join(repo, "commands"))
		.filter((f) => f.endsWith(".md"))
		.map((f) => join(repo, "commands", f)),
];
const broken: string[] = [];
for (const path of targets) {
	const err = rewrite(path);
	if (err !== null) broken.push(`${path}: ${err}`);
}
if (broken.length > 0) {
	for (const b of broken) console.error(b);
	process.exit(1);
}
console.log(`rewrote ${targets.length} files`);
