#!/usr/bin/env bun
// Claude Code target tree invariants (pstack-omp-plan/70-claude-code-target.md,
// unit C5). Independent of tools/claude/apply.mjs's own --dry/write-mode gates:
// this script re-validates the shipped state on disk, so a hand-edit that
// skips regeneration still gets caught.
//
// Invariants:
//   - no commands/ directory (duplicate slash-menu rows, ref-port bug #22)
//   - zero disable-model-invocation keys anywhere in the tree
//   - user-invocable stamped on exactly the 21 principle-* leaves, nowhere else
//   - zero denylist hits across the whole tree (skills, agents, hooks, both manifests, models.json)
//   - both manifests parse as JSON with their required fields

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deny, frontmatterKeyCount, isLeaf } from "../tools/claude/apply.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEXT_EXTENSIONS = new Set([".md", ".json", ".ts", ".mjs", ".sh", ".cmd", ".tsv", ".lock", ""]);

function walk(dir: string, prefix: string): Map<string, string> {
	const out = new Map<string, string>();
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) { for (const [p, t] of walk(full, rel)) out.set(p, t); continue; }
		const dot = entry.name.lastIndexOf(".");
		const ext = dot === -1 ? "" : entry.name.slice(dot);
		if (!TEXT_EXTENSIONS.has(ext)) continue;
		out.set(rel, readFileSync(full, "utf-8"));
	}
	return out;
}

function main(opts: { pluginRoot?: string; marketplacePath?: string } = {}): number {
	const pluginRoot = opts.pluginRoot ?? join(repo, "plugins/pstack");
	const marketplacePath = opts.marketplacePath ?? join(repo, ".claude-plugin/marketplace.json");
	const violations: string[] = [];

	if (existsSync(join(pluginRoot, "commands"))) violations.push("plugins/pstack/commands/ exists; commands plus user-facing skills duplicate slash-menu rows (ref-port bug #22)");

	const tree = walk(pluginRoot, "");
	const skillPaths = [...tree.keys()].filter((p) => p.startsWith("skills/") && p.endsWith("SKILL.md"));

	const disableHits = frontmatterKeyCount(tree, "disable-model-invocation");
	for (const hit of disableHits) violations.push(`${hit.path}:${hit.line}: disable-model-invocation key survives; Claude Code has no such hide mechanism`);

	const stampHits = frontmatterKeyCount(tree, "user-invocable");
	const stampedPaths = new Set(stampHits.map((h) => h.path));
	const leafPaths = new Set(skillPaths.filter(isLeaf));
	for (const path of leafPaths) if (!stampedPaths.has(path)) violations.push(`${path}: principle leaf missing user-invocable stamp`);
	for (const path of stampedPaths) if (!leafPaths.has(path)) violations.push(`${path}: user-invocable stamp outside the 21 principle-* leaves`);

	const denylist = JSON.parse(readFileSync(join(repo, "tools/claude/substitutions.json"), "utf-8")).denylist;
	const scanned = new Map(tree);
	if (existsSync(marketplacePath)) scanned.set("../.claude-plugin/marketplace.json", readFileSync(marketplacePath, "utf-8"));
	for (const hit of deny(scanned, denylist)) violations.push(`${hit.path}:${hit.line}: denylist token "${hit.token}" (${hit.hint})`);

	const pluginManifestPath = join(pluginRoot, ".claude-plugin/plugin.json");
	try {
		const manifest = JSON.parse(readFileSync(pluginManifestPath, "utf-8"));
		if (typeof manifest.name !== "string" || !manifest.name) violations.push("plugins/pstack/.claude-plugin/plugin.json: missing name");
		if (typeof manifest.version !== "string" || !manifest.version) violations.push("plugins/pstack/.claude-plugin/plugin.json: missing version");
		if (!Array.isArray(manifest.agents) || manifest.agents.some((a: unknown) => typeof a !== "string")) violations.push("plugins/pstack/.claude-plugin/plugin.json: agents must be an array of file paths, not a directory string");
	} catch (e) {
		violations.push(`plugins/pstack/.claude-plugin/plugin.json: invalid JSON (${(e as Error).message})`);
	}

	try {
		const marketplace = JSON.parse(readFileSync(marketplacePath, "utf-8"));
		if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) violations.push(".claude-plugin/marketplace.json: plugins must be a non-empty array");
	} catch (e) {
		violations.push(`.claude-plugin/marketplace.json: invalid JSON (${(e as Error).message})`);
	}

	if (violations.length > 0) {
		console.error(`claude-check: ${violations.length} violations`);
		for (const v of violations) console.error(`  ${v}`);
		return 1;
	}
	console.log(`claude-check: clean (${skillPaths.length} skills, ${leafPaths.size} hidden leaves)`);
	return 0;
}

function parseArgv(argv: string[]): { pluginRoot?: string; marketplacePath?: string } {
	const opts: { pluginRoot?: string; marketplacePath?: string } = {};
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "--plugin-root") opts.pluginRoot = argv[++i];
		else if (argv[i] === "--marketplace") opts.marketplacePath = argv[++i];
		else throw new Error(`unknown argument ${argv[i]}`);
	}
	return opts;
}

if (import.meta.main) process.exit(main(parseArgv(process.argv.slice(2))));
export { main, walk };
