#!/usr/bin/env bun
// Frontmatter audit for every deliverable file (pstack-omp-plan/01-conventions.md
// rules 4/5). Mirrors refs/omp-src/packages/coding-agent/src/discovery/
// agent-plugin-format.ts:102-161 and docs/skills.md:27-33: skills load from
// <skills-root>/<skill-name>/SKILL.md only, the SKILL.md frontmatter schema
// is closed to six fields, `name` must equal the directory name, and
// `description` must span 1-1024 characters.
//
// Command files carry no directory name to match, so `name` is skipped there;
// a command with a missing or oversized `description` fails exactly as in
// capability/slash-command.ts:36-46. `disable-model-invocation` and `hide` are the
// two keys OMP reads at the top level with a strict boolean comparison
// (extensibility/skills.ts:113), so this audit requires them there and rejects a
// copy buried under `metadata:`. Repairs live in scripts/fix-frontmatter.ts.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { HIDE_KEYS, hasTopLevelHideFlag, referencedSkillNames } from "./skill-refs.ts";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");

const SKILL_FIELDS: Record<string, true> = {
	name: true,
	description: true,
	license: true,
	"allowed-tools": true,
	metadata: true,
	compatibility: true,
	"disable-model-invocation": true,
	hide: true,
};
const SKILL_NAME_CHARS_RE = /^[\p{L}\p{N}-]+$/u;

function validateSkillName(raw: unknown, dirName: string): string | null {
	if (typeof raw !== "string" || raw.trim().length === 0) return `missing required "name"`;
	const name = raw.trim().normalize("NFKC");
	if (Array.from(name).length > 64) return `"name" exceeds 64 characters`;
	if (name !== name.toLowerCase()) return `"name" must be lowercase`;
	if (name.startsWith("-") || name.endsWith("-")) return `"name" cannot start or end with a hyphen`;
	if (name.includes("--")) return `"name" cannot contain consecutive hyphens`;
	if (!SKILL_NAME_CHARS_RE.test(name)) return `invalid "name" ${JSON.stringify(name)}`;
	if (name !== dirName.normalize("NFKC")) {
		return `"name" ${JSON.stringify(name)} does not match directory ${JSON.stringify(dirName)}`;
	}
	return null;
}

function validateAgentSkillFrontmatter(fm: Record<string, unknown>, dirName: string): string | null {
	for (const key in fm) {
		if (!SKILL_FIELDS[key]) return `unexpected frontmatter field "${key}"`;
	}
	const nameViolation = validateSkillName(fm.name, dirName);
	if (nameViolation !== null) return nameViolation;
	const description = fm.description;
	if (typeof description !== "string" || description.trim().length === 0) {
		return `missing required "description"`;
	}
	if (description.length > 1024) return `"description" exceeds 1024 characters`;
	if (fm.license !== undefined && typeof fm.license !== "string") return `"license" must be a string`;
	if (fm.compatibility !== undefined) {
		if (typeof fm.compatibility !== "string") return `"compatibility" must be a string`;
		if (fm.compatibility.length > 500) return `"compatibility" exceeds 500 characters`;
	}
	const metadata = fm.metadata;
	if (metadata !== undefined) {
		if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
			return `"metadata" must be a map of string keys to string values`;
		}
		for (const key of Object.keys(metadata)) {
			if (typeof (metadata as Record<string, unknown>)[key] !== "string") {
				return `"metadata.${key}" must be a string`;
			}
		}
	}
	for (const key of Object.keys(HIDE_KEYS)) {
		if (typeof metadata === "object" && metadata !== null && key in metadata) {
			return `"metadata.${key}" is ignored by OMP, lift it to the top level`;
		}
		const value = fm[key];
		if (value !== undefined && (typeof value !== "string" || (value !== "true" && value !== "false"))) {
			return `"${key}" must be the bare boolean true or false`;
		}
	}

	if (fm["allowed-tools"] !== undefined && typeof fm["allowed-tools"] !== "string") {
		return `"allowed-tools" must be a string`;
	}
	return null;
}

type Frontmatter = Record<string, string | Record<string, string>>;

function parseFrontmatterBlock(content: string): { fm: Frontmatter; rest: string } | string {
	const lines = content.split("\n");
	if (lines[0] !== "---") return "file does not start with ---";
	const end = lines.indexOf("---", 1);
	if (end === -1) return "unterminated frontmatter block";
	const fm: Frontmatter = {};
	let currentKey: string | undefined;
	for (const line of lines.slice(1, end)) {
		if (line.trim() === "") continue;
		const topLevel = /^([A-Za-z][A-Za-z0-9_-]*):(.*)$/.exec(line);
		if (topLevel && !line.startsWith(" ")) {
			currentKey = topLevel[1];
			fm[topLevel[1]] = topLevel[2].trim() === "" ? {} : topLevel[2].trim();
			continue;
		}
		if (currentKey !== undefined && line.startsWith("  ")) {
			const nested = /^ {2}([A-Za-z][A-Za-z0-9_-]*):(.*)$/.exec(line);
			if (nested) {
				const bucket = fm[currentKey];
				if (typeof bucket === "object") bucket[nested[1]] = nested[2].trim();
			} else {
				currentKey = undefined;
			}
			continue;
		}
		return `unparseable frontmatter line ${JSON.stringify(line)}`;
	}
	return { fm, rest: lines.slice(end + 1).join("\n") };
}

function auditFile(rel: string, dirName: string, kind: "skill" | "command", mustHide: boolean): string | null {
	const content = readFileSync(join(plugin, rel), "utf-8");
	const block = parseFrontmatterBlock(content);
	if (typeof block === "string") return `${rel}: ${block}`;
	if (kind === "command") {
		// OMP derives command names from filenames; only display fields are parsed.
		const d = block.fm.description;
		if (typeof d !== "string" || d.length === 0) return `${rel}: missing required "description"`;
		if (d.length > 1024) return `${rel}: "description" exceeds 1024 characters`;
		if (typeof block.fm["allowed-tools"] === "string") return `${rel}: "allowed-tools" must be a string`;
		return null;
	}
	const violation = validateAgentSkillFrontmatter(block.fm, dirName);
	if (violation !== null) return `${rel}: ${violation}`;
	if (mustHide && !hasTopLevelHideFlag(content)) {
		return `${rel}: a skill:// pointer targets this skill but it carries no top-level hide flag`;
	}
	return null;
}

function main(fix: boolean): void {
	if (fix) {
		console.error("--fix does not rewrite anything in this script. Run: bun scripts/fix-frontmatter.ts");
		process.exit(1);
	}
	const referenced = referencedSkillNames(plugin);
	const skillFiles = readdirSync(join(plugin, "skills"), { withFileTypes: true })
		.filter((e) => e.isDirectory() && !e.name.startsWith("."))
		.map((e) => ({ rel: join("skills", e.name, "SKILL.md"), dir: e.name, kind: "skill" as const, mustHide: referenced.has(e.name) }));
	if (existsSync(join(plugin, "skills", "SKILL.md"))) {
		console.error("skills/SKILL.md: nested SKILL.md directly under skills/ is not discovered (docs/skills.md:27-33)");
	}
	const commandFiles = readdirSync(join(plugin, "commands"))
		.filter((f) => f.endsWith(".md"))
		.map((f) => ({ rel: join("commands", f), dir: basename(f, ".md"), kind: "command" as const, mustHide: false }));
	let failed = 0;
	for (const { rel, dir, kind, mustHide } of [...skillFiles, ...commandFiles]) {
		const violation = auditFile(rel, dir, kind, mustHide);
		if (violation !== null) {
			console.error(`FAIL ${violation}`);
			failed++;
		}
	}
	if (failed === 0) console.log(`frontmatter check: clean (${skillFiles.length} skills, ${commandFiles.length} commands)`);
	else process.exit(1);
}


main(process.argv[2] === "--fix");
