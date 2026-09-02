// Shared scan for the hide-flag invariant.
//
// Convention this repo follows: a skill reachable through a `skill://` pointer
// is an internal routing target, so it must carry a top-level hide flag and stay
// out of the system prompt listing. The model reaches it by reading the pointer,
// which works whether or not the listing shows it. A skill nobody points at stays
// visible so the model can discover it on its own.
//
// Both scripts/fix-frontmatter.ts and scripts/validate-frontmatter.ts read this
// scan, so the rule lives in one place.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** Top-level frontmatter keys OMP reads with a strict boolean comparison. */
export const HIDE_KEYS: Record<string, true> = {
	"disable-model-invocation": true,
	hide: true,
};

const REFERENCE = /skill:\/\/([a-z0-9][a-z0-9-]*)/g;

function markdownFiles(dir: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...markdownFiles(full));
		else if (entry.name.endsWith(".md")) found.push(full);
	}
	return found;
}

/** Skill names pointed at by `skill://` anywhere in shipped content. */
export function referencedSkillNames(repo: string): Set<string> {
	const names = new Set<string>();
	for (const dir of ["skills", "commands", "agents"]) {
		for (const file of markdownFiles(join(repo, dir))) {
			for (const match of readFileSync(file, "utf-8").matchAll(REFERENCE)) names.add(match[1]);
		}
	}
	return names;
}

/** True when a SKILL.md already carries a hide flag at column 0. */
export function hasTopLevelHideFlag(text: string): boolean {
	const end = text.indexOf("\n---", 3);
	const frontmatter = end === -1 ? text : text.slice(0, end);
	return Object.keys(HIDE_KEYS).some((key) => new RegExp(`^${key}: (?:true|false)$`, "m").test(frontmatter));
}
