#!/usr/bin/env bun
// fetch-upstream.ts — vendor pstack/ at a given sha into upstream/pstack/
//
// Usage: bun scripts/fetch-upstream.ts <sha>
//
// pstack has no standalone repo: it is the pstack/ subtree of cursor/plugins
// (see upstream/pstack/.cursor-plugin/plugin.json's own "repository" field).
// This vendors that subtree via git-archive from the local refs/cursor-plugins
// clone, the same mechanism AGENTS.md's Re-sync procedure (steps 1-2) uses
// for the Claude Code target. Does not touch your ported files.

import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const cursorPluginsDir = join(repo, "refs", "cursor-plugins");
const upstreamDir = join(repo, "upstream", "pstack");

if (process.argv.length < 3) {
	console.error("Usage: bun scripts/fetch-upstream.ts <sha>");
	console.error(`\nVendor pstack/ from ${cursorPluginsDir} at <sha> into upstream/pstack/`);
	process.exit(1);
}

const sha = process.argv[2];

if (!/^[0-9a-f]{40}$/.test(sha)) {
	console.error(`Invalid sha: ${sha}`);
	console.error("Expected a 40-character hex git SHA");
	process.exit(1);
}

if (!existsSync(cursorPluginsDir)) {
	console.error(`Missing ${cursorPluginsDir}.`);
	console.error("Clone https://github.com/cursor/plugins there first (it is gitignored, local-only, never shipped).");
	process.exit(1);
}

console.log(`Fetching origin in ${cursorPluginsDir}`);
execSync("git fetch origin", { cwd: cursorPluginsDir, stdio: "inherit" });

try {
	execSync(`git cat-file -e ${sha}^{commit}`, { cwd: cursorPluginsDir, stdio: "ignore" });
} catch {
	console.error(`Sha ${sha} not found in refs/cursor-plugins after fetch.`);
	process.exit(1);
}

if (existsSync(upstreamDir)) {
	console.log("Removing existing upstream/pstack/");
	rmSync(upstreamDir, { recursive: true });
}

console.log(`Vendoring pstack/ at ${sha}`);
execSync(`git archive ${sha} -- pstack | tar -x -C ${join(repo, "upstream")}`, {
	cwd: cursorPluginsDir,
	stdio: "inherit",
	shell: "/bin/bash",
});

if (!existsSync(upstreamDir)) {
	console.error(`Archive extracted but ${upstreamDir} is missing; check the sha carries a pstack/ subtree.`);
	process.exit(1);
}

console.log(`\nVendored pstack/ at ${sha} into upstream/pstack/`);
console.log("Next: update UPSTREAM.md from `git rev-parse` output, then bun scripts/classify-diff.ts");
