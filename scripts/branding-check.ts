#!/usr/bin/env bun
// Branding check (pstack-omp-plan/01-conventions.md §1).
//
// Fails if any banned Cursor/Claude/Anthropic string appears in the shipped
// package under plugin/ (skills, agents, commands, extensions, hooks), outside
// CREDITS.md. `upstream/` is a read-only vendored snapshot and is intentionally
// exempt.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");
const SCAN_DIRS = ["skills", "agents", "commands", "extensions", "hooks"];

const BANNED = ["claude", "anthropic", "sonnet", "opus", "haiku", ".claude/", "subagent_type", "claude.md"];
const CASE_SENSITIVE = ["Cursor", "GPT", "Gemini", "Qwen"];

function scan(dir: string): string[] {
	const hits: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			hits.push(...scan(full));
			continue;
		}
		if (relative(repo, full).endsWith("CREDITS.md")) continue;
		for (const [i, line] of readFileSync(full, "utf-8").split("\n").entries()) {
			const lower = line.toLowerCase();
			for (const token of BANNED) {
				if (lower.includes(token)) hits.push(`${relative(repo, full)}:${i + 1}: "${token}"`);
			}
			for (const token of CASE_SENSITIVE) {
				if (line.includes(token)) hits.push(`${relative(repo, full)}:${i + 1}: "${token}" (case-sensitive)`);
			}
		}
	}
	return hits;
}

function main() {
	const hits = SCAN_DIRS.flatMap((dir) => scan(join(plugin, dir)));
	if (hits.length) {
		console.error("FAIL: banned strings found:");
		for (const h of hits) console.error(`  ${h}`);
		process.exit(1);
	}
	console.log(`branding check: clean (${SCAN_DIRS.join(", ")})`);
}

main();
