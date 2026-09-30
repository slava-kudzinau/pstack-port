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
import { renderCommand } from "../plugin/extensions/pstack-commands.ts";

const catalogPaths = new Set((parseCatalog() ?? []).map((r) => r.path));

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");
const skillsDir = join(plugin, "skills");
const templatesDir = join(plugin, "command-templates");
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
check("command templates directory exists", () => existsSync(templatesDir));
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
const commands = readdirSync(templatesDir).filter(f => f.endsWith(".md"));
for (const cmd of commands) {
	const content = readFileSync(join(templatesDir, cmd), "utf-8");
	const name = cmd.replace(/\.md$/, "");
	check(`${cmd} has description`, () => content.includes("description:"));
	check(`/pstack:${name} routes to existing skill`, () => existsSync(join(skillsDir, name, "SKILL.md")));
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
const scanDirs = ["skills", "agents", "command-templates"];
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

// Test 7: command expansion semantics (mirrors core template expansion; fixtures are literal)
console.log("\n7. Command expansion");
check("$@ expands to the joined args", () => renderCommand("Run it for: $@", "fix the flaky test") === "Run it for: fix the flaky test");
check("quoted runs collapse to one arg", () => renderCommand("Body: $@", '"two words" next') === "Body: two words next");
check("positional $N expands", () => renderCommand("Do $1 then $2", "a b") === "Do a then b");
check("args append when the template has no placeholder", () => renderCommand("Read the skill.", "extra arg") === "Read the skill.\n\nextra arg");
check("empty args leave the prose intact", () => renderCommand("Run it for: $@", "") === "Run it for: ");
check("templates carry no handlebars", () =>
	commands.every((c) => !/\{\{/.test(readFileSync(join(templatesDir, c), "utf-8"))));

console.log(`\nResult: ${pass} passed, ${fail} failed`);
if (fail > 0) {
	console.log("\nFailures:");
	for (const f of failures) console.log(`  - ${f}`);
	process.exit(1);
}
