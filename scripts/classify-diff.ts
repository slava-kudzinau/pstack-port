#!/usr/bin/env bun
// classify-diff.ts — compare ported files vs upstream/ via frontmatter
//
// Usage: bun scripts/classify-diff.ts
//
// Reads every ported file's frontmatter (upstream: path, upstream_sha) and
// compares against the vendored snapshot in upstream/pstack/. Classifies each
// file as unchanged, changed (portable), changed (adapted), or orphaned.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repo, "skills");
const commandsDir = join(repo, "commands");
const agentsDir = join(repo, "agents");
const upstreamDir = join(repo, "upstream", "pstack");

const results = {
	unchanged: [] as string[],
	portable: [] as string[],
	adapted: [] as string[],
	removed: [] as string[],
	orphaned: [] as string[],
	newInUpstream: [] as string[],
	conflicts: [] as string[],
};

function parseFrontmatter(content: string): Record<string, string> | null {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;
	const fm: Record<string, string> = {};
	for (const line of match[1].split("\n")) {
		const idx = line.indexOf(":");
		if (idx > 0) {
			const key = line.slice(0, idx).trim();
			const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
			fm[key] = val;
		}
	}
	return fm;
}

function classify(file: string, content: string) {
	const fm = parseFrontmatter(content);
	if (!fm) {
		results.orphaned.push(file);
		return;
	}

	const upstreamPath = fm.upstream;
	const status = fm.status;

	if (!upstreamPath) {
		// New file, not from upstream
		return;
	}

	const upstreamFile = join(upstreamDir, upstreamPath);
	if (!existsSync(upstreamFile)) {
		// File was removed from upstream
		results.removed.push(file);
		return;
	}

	const upstreamContent = readFileSync(upstreamFile, "utf-8");
	if (content === upstreamContent) {
		results.unchanged.push(file);
	} else if (status === "portable") {
		results.portable.push(file);
	} else if (status === "adapted") {
		results.adapted.push(file);
	} else {
		// Check for conflicts (both sides changed differently)
		results.conflicts.push(file);
	}
}

// Scan all ported files
console.log("Scanning ported files...\n");

for (const dir of [skillsDir, commandsDir, agentsDir]) {
	if (!existsSync(dir)) continue;
	const entries = readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.isDirectory()) {
			const sk = join(dir, entry.name, "SKILL.md");
			if (existsSync(sk)) {
				classify(entry.name + "/SKILL.md", readFileSync(sk, "utf-8"));
			}
		} else if (entry.isFile() && entry.name.endsWith(".md")) {
			classify(entry.name, readFileSync(join(dir, entry.name), "utf-8"));
		}
	}
}

// Scan upstream for new files not yet ported
if (existsSync(upstreamDir)) {
	const upstreamSkills = join(upstreamDir, "skills");
	if (existsSync(upstreamSkills)) {
		const entries = readdirSync(upstreamSkills, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isDirectory()) {
				const sk = join(upstreamSkills, entry.name, "SKILL.md");
				if (existsSync(sk)) {
					const localPath = join(skillsDir, entry.name, "SKILL.md");
					if (!existsSync(localPath)) {
						results.newInUpstream.push(`skills/${entry.name}/SKILL.md`);
					}
				}
			}
		}
	}
}

// Print report
console.log("UPSTREAM STATUS");
console.log();
console.log(`unchanged:            ${results.unchanged.length} files`);
console.log(`changed (portable):   ${results.portable.length} files`);
console.log(`changed (adapted):    ${results.adapted.length} files`);
console.log(`new upstream:         ${results.newInUpstream.length} files`);
console.log(`removed upstream:     ${results.removed.length} files`);
console.log(`conflicts:            ${results.conflicts.length} files`);
console.log(`orphaned:             ${results.orphaned.length} files`);

if (results.portable.length > 0) {
	console.log("\nPortable changes (agent can review):");
	for (const f of results.portable) console.log(`  - ${f}`);
}

if (results.adapted.length > 0) {
	console.log("\nAdapted files (human review required):");
	for (const f of results.adapted) console.log(`  - ${f}`);
}

if (results.newInUpstream.length > 0) {
	console.log("\nNew in upstream (matrix decision needed):");
	for (const f of results.newInUpstream) console.log(`  - ${f}`);
}

if (results.removed.length > 0) {
	console.log("\nRemoved from upstream (matrix decision needed):");
	for (const f of results.removed) console.log(`  - ${f}`);
}

if (results.conflicts.length > 0) {
	console.log("\nConflicts (manual resolution needed):");
	for (const f of results.conflicts) console.log(`  - ${f}`);
}

if (results.orphaned.length > 0) {
	console.log("\nOrphaned (missing frontmatter):");
	for (const f of results.orphaned) console.log(`  - ${f}`);
}

console.log();
if (results.portable.length === 0 && results.adapted.length === 0 && results.conflicts.length === 0 && results.orphaned.length === 0) {
	console.log("No changes detected. Port is in sync with upstream.");
} else {
	console.log("Next: review changes above, then run bun scripts/generate-report.ts");
}
