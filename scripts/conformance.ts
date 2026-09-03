#!/usr/bin/env bun
// Conformance suite for pstack-omp port.
//
// Run: bun scripts/conformance.ts
// Each test validates port structure, frontmatter, and cross-references.
// The behavioral tests (5 prompts) are documented but must be run manually
// against a real OMP session.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCatalog } from "./provenance.ts";

const catalogPaths = new Set((parseCatalog() ?? []).map((r) => r.path));

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");
const skillsDir = join(plugin, "skills");
const commandsDir = join(plugin, "commands");
const agentsDir = join(plugin, "agents");

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, fn: () => boolean | string) {
	const result = fn();
	if (result === true) {
		pass++;
		console.log(`  ✓ ${name}`);
	} else {
		fail++;
		failures.push(name);
		console.log(`  ✗ ${name}: ${result}`);
	}
}

console.log("Phase F: Conformance Suite\n");

// Test 1: Port structure
console.log("1. Port structure");
check("skills directory exists", () => existsSync(skillsDir));
check("commands directory exists", () => existsSync(commandsDir));
check("agents directory exists", () => existsSync(agentsDir));

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
	.filter(d => d.isDirectory())
	.map(d => d.name);
console.log(`   Found ${skillDirs.length} skill directories`);

// Test 2: Skill frontmatter
console.log("\n2. Skill frontmatter");
const requiredSkills = ["poteto-mode", "bug-fix", "architect", "swarm", "interrogate", "how", "why", "teach"];
for (const name of requiredSkills) {
	const path = join(skillsDir, name, "SKILL.md");
	check(`${name}/SKILL.md exists`, () => existsSync(path));
	if (existsSync(path)) {
		const content = readFileSync(path, "utf-8");
		const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
		if (fmMatch) {
			const fm = fmMatch[1];
			check(`${name} has name field`, () => fm.includes("name:"));
			check(`${name} has description`, () => fm.includes("description:"));
			check(`${name} has a catalog row`, () => catalogPaths.has(`skills/${name}/SKILL.md`));
		} else {
			check(`${name} has valid frontmatter`, () => false);
		}
	}
}

// Test 3: Command routing
console.log("\n3. Command routing");
const commands = readdirSync(commandsDir).filter(f => f.endsWith(".md"));
for (const cmd of commands) {
	const path = join(commandsDir, cmd);
	const content = readFileSync(path, "utf-8");
	check(`${cmd} has description`, () => content.includes("description:"));
}

// Test 4: Cross-references
console.log("\n4. Cross-references");
const potetoPath = join(skillsDir, "poteto-mode", "SKILL.md");
if (existsSync(potetoPath)) {
	const content = readFileSync(potetoPath, "utf-8");
	check("poteto-mode references bug-fix", () => content.includes("skill://bug-fix"));
	check("poteto-mode references architect", () => content.includes("skill://architect"));
	check("poteto-mode references swarm", () => content.includes("skill://swarm"));
	check("poteto-mode references interrogate", () => content.includes("skill://interrogate"));
}

// Test 5: No banned strings in shipped content
console.log("\n5. Branding check");
const scanDirs = ["skills", "agents", "commands"];
const banned = ["claude", "anthropic", "sonnet", "opus", "haiku", ".claude/", "subagent_type"];
let brandingChecked = 0;
for (const dir of scanDirs) {
	const fullPath = join(plugin, dir);
	if (existsSync(fullPath)) {
		const entries = readdirSync(fullPath, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isFile() && entry.name.endsWith(".md")) {
				brandingChecked++;
				const content = readFileSync(join(fullPath, entry.name), "utf-8");
				const lines = content.split("\n");
				for (const line of lines) {
					for (const word of banned) {
						if (line.toLowerCase().includes(word)) {
							check(`${entry.name} clean of "${word}"`, () => false);
							break;
						}
					}
				}
			}
		}
	}
}
check(`branding check scanned ${brandingChecked} files`, () => brandingChecked > 0);

// Test 6: Task tool usage in parallel skills
console.log("\n6. Task tool usage");
const parallelSkills = ["swarm", "arena", "interrogate", "architect"];
for (const name of parallelSkills) {
	const path = join(skillsDir, name, "SKILL.md");
	if (existsSync(path)) {
		const content = readFileSync(path, "utf-8");
		const hasBatch = content.includes("{context, tasks[]}") ||
			content.includes("task batch call") ||
			content.includes("task` batch") ||
			content.includes("skill://arena");
		check(`${name} uses task batch`, () => hasBatch);
	}
}

console.log(`\nResult: ${pass} passed, ${fail} failed`);
if (fail > 0) {
	console.log("\nFailures:");
	for (const f of failures) console.log(`  - ${f}`);
	process.exit(1);
}
