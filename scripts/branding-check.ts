#!/usr/bin/env bun
// Branding check (pstack-omp-plan/01-conventions.md §1).
//
// Fails if any banned Cursor/Claude/Anthropic string appears in shipped
// content (skills/, agents/, commands/), outside CREDITS.md. `upstream/`
// is a read-only vendored snapshot and is intentionally exempt.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["skills", "agents", "commands"];
const EXEMPT_FILES: Record<string, true> = { "CREDITS.md": true };

// Case-insensitive tokens, matched as substrings (mirrors ref-port's denylist shape).
const BANNED = ["claude", "anthropic", "sonnet", "opus", "haiku", ".claude/", "subagent_type", "claude.md"];

function listFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) out.push(...listFiles(full));
		else out.push(full);
	}
	return out;
}

function scan(path: string, text: string): string[] {
	const hits: string[] = [];
	text.split("\n").forEach((line, i) => {
		const lowerLine = line.toLowerCase();
		for (const token of BANNED) {
			if (lowerLine.includes(token)) hits.push(`${path}:${i + 1}: "${token}"`);
		}
	});
	return hits;
}

function main() {
	const hits: string[] = [];
	for (const dir of SCAN_DIRS) {
		const full = join(repo, dir);
		try {
			statSync(full);
		} catch {
			continue;
		}
		for (const file of listFiles(full)) {
			const rel = relative(repo, file);
			if (EXEMPT_FILES[relative(full, file)]) continue;
			hits.push(...scan(rel, readFileSync(file, "utf-8")));
		}
	}
	if (hits.length) {
		console.error("FAIL: banned strings found:");
		for (const h of hits) console.error(`  ${h}`);
		process.exit(1);
	}
	console.log(`branding check: clean (${SCAN_DIRS.join(", ")})`);
}

main();
