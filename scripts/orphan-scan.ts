#!/usr/bin/env bun
// Scans every file under skills/, agents/, and commands/ for skill:// and
// agent:// pointers and verifies each target exists in-tree (skills/<name>/,
// agents/<name>.md, commands/<name>.md) or names a bundled OMP agent role
// (task/agents.ts:45-76).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = ["skills", "agents", "commands"];
const BUNDLED = ["scout", "designer", "reviewer", "security-reviewer", "librarian", "task", "sonic"];

function files(dir: string): string[] {
	const out: string[] = [];
	for (const e of readdirSync(join(repo, dir), { withFileTypes: true })) {
		const full = join(dir, e.name);
		if (e.isDirectory()) out.push(...files(full));
		else if (e.name.endsWith(".md")) out.push(full);
	}
	return out;
}

const seen = new Map<string, number>();
for (const file of SCAN.flatMap(files)) {
	const text = readFileSync(join(repo, file), "utf-8");
	for (const m of text.matchAll(/(skill|agent):\/\/([A-Za-z][A-Za-z0-9_-]*)/g)) {
		const [, kind, target] = m;
		seen.set(`${kind}://${target}`, (seen.get(`${kind}://${target}`) ?? 0) + 1);
	}
}

const broken: string[] = [];
for (const [key, sites] of seen) {
	const [kind, target] = key.split("://");
	const ok =
		kind === "skill"
			? existsSync(join(repo, "skills", target, "SKILL.md"))
			: existsSync(join(repo, "agents", `${target}.md`)) || BUNDLED.includes(target);
	if (!ok) broken.push(`${key} (${sites} sites)`);
}
if (broken.length > 0) {
	for (const b of broken) console.error(`ORPHAN ${b}`);
	process.exit(1);
}
console.log(`orphan scan: clean (${seen.size} distinct pointers)`);
