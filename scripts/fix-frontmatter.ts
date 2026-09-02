#!/usr/bin/env bun
// Rewrites every deliverable's frontmatter to pass scripts/validate-frontmatter.ts.
//
// The six closed-schema skill fields stay at column 0 (see
// refs/omp-src/packages/coding-agent/src/discovery/agent-plugin-format.ts:124-161).
// Any other top-level key moves under `metadata:`, the one key OMP keeps as free
// string metadata (refs/omp-src/docs/skills.md:52-60). Values are single-quoted so
// a value containing ": " still parses as a scalar rather than a mapping.
//
// `disable-model-invocation` and `hide` are exempt. They stay at column 0 as bare
// booleans, because OMP tests them with a strict top-level comparison (see
// refs/omp-src/packages/coding-agent/src/extensibility/skills.ts:113,260,298,399)
// and normalizeFrontmatterKeys only renames keys, it never lifts them out of
// `metadata` (refs/omp-src/packages/utils/src/frontmatter.ts:21-43). A demoted or
// quoted copy is unknown metadata to OMP, so the skill keeps rendering into the
// system prompt listing and the playbook bodies leak into every session.
// This script also injects the flag into any skill another shipped file points at
// with a `skill://` reference. scripts/skill-refs.ts owns that rule so the audit
// and the repair cannot drift apart.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HIDE_KEYS, referencedSkillNames } from "./skill-refs.ts";

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

function rewrite(path: string, mustHide: boolean): string | null {
	const lines = readFileSync(path, "utf-8").split("\n");
	if (lines[0] !== "---") return "no frontmatter";
	const end = lines.indexOf("---", 1);
	if (end === -1) return "unterminated frontmatter";
	const head: string[] = [];
	const hide: string[] = [];
	const keptMetadata: string[] = [];
	const demoted: string[] = [];
	let inMetadata = false;
	for (const line of lines.slice(1, end)) {
		if (line.trim() === "") continue;
		const nested = /^ {2}([A-Za-z][A-Za-z0-9_-]*):(.*)$/.exec(line);
		if (nested !== null && inMetadata) {
			if (HIDE_KEYS[nested[1]] === true)
				hide.push(`${nested[1]}: ${nested[2].trim().toLowerCase() === "false" ? "false" : "true"}`);
			else keptMetadata.push(`  ${nested[1]}: ${quote(nested[2])}`);
			continue;
		}
		const pair = /^([^ ][^:]*):(.*)$/.exec(line);
		if (pair === null) return `unparseable line ${JSON.stringify(line)}`;
		const key = pair[1];
		const value = pair[2].trim();
		if (value.startsWith("|") || value.startsWith(">")) return `block scalar on "${key}" is unsupported`;
		if (key === "metadata") {
			if (value !== "") return `inline "metadata" value is unsupported`;
			inMetadata = true;
			continue;
		}
		inMetadata = false;
		if (HIDE_KEYS[key] === true) hide.push(`${key}: ${value.toLowerCase() === "false" ? "false" : "true"}`);
		else if (KEPT[key] === true) head.push(line);
		else demoted.push(`  ${key}: ${quote(value)}`);
	}
	if (mustHide && hide.length === 0) hide.push("disable-model-invocation: true");

	const block = [...keptMetadata, ...demoted];
	const frontmatter = [...head, ...hide];
	if (block.length > 0) frontmatter.push("metadata:", ...block);
	writeFileSync(path, ["---", ...frontmatter, "---", ...lines.slice(end + 1)].join("\n"));
	return null;
}

const referenced = referencedSkillNames(repo);
const targets: { path: string; mustHide: boolean }[] = [
	...readdirSync(join(repo, "skills"), { withFileTypes: true })
		.filter((e) => e.isDirectory() && !e.name.startsWith("."))
		.map((e) => ({ path: join(repo, "skills", e.name, "SKILL.md"), mustHide: referenced.has(e.name) })),
	...readdirSync(join(repo, "commands"))
		.filter((f) => f.endsWith(".md"))
		.map((f) => ({ path: join(repo, "commands", f), mustHide: false })),
];
const broken: string[] = [];
for (const target of targets) {
	const err = rewrite(target.path, target.mustHide);
	if (err !== null) broken.push(`${target.path}: ${err}`);
}
if (broken.length > 0) {
	for (const b of broken) console.error(b);
	process.exit(1);
}
console.log(`rewrote ${targets.length} files`);
