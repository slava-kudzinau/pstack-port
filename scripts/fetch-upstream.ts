#!/usr/bin/env bun
// fetch-upstream.ts — vendor pstack/ at a given sha into upstream/pstack/
//
// Usage: bun scripts/fetch-upstream.ts <sha>
//
// Clones the pstack repo at the given sha into upstream/pstack/, overwriting
// any existing vendored snapshot. Does not touch your ported files.

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const upstreamDir = join(repo, "upstream", "pstack");
const UPSTREAM_REPO = "https://github.com/reachingforthejack/pstack.git";

if (process.argv.length < 3) {
	console.error("Usage: bun scripts/fetch-upstream.ts <sha>");
	console.error(`\nClone ${UPSTREAM_REPO} at <sha> into upstream/pstack/`);
	process.exit(1);
}

const sha = process.argv[2];

// Validate sha format
if (!/^[0-9a-f]{40}$/.test(sha)) {
	console.error(`Invalid sha: ${sha}`);
	console.error("Expected a 40-character hex git SHA");
	process.exit(1);
}

console.log(`Fetching ${UPSTREAM_REPO} at ${sha}`);

// Remove existing snapshot if present
if (existsSync(upstreamDir)) {
	console.log(`Removing existing upstream/pstack/`);
	rmSync(upstreamDir, { recursive: true });
}

// Clone at the given sha
mkdirSync(upstreamDir, { recursive: true });
try {
	execSync(`git clone --depth 1 ${UPSTREAM_REPO} ${upstreamDir}`, { stdio: "inherit" });
	execSync(`cd ${upstreamDir} && git fetch --depth 1 origin ${sha} && git checkout ${sha}`, { stdio: "inherit" });
} catch (e) {
	console.error(`Failed to fetch ${sha}. Make sure the sha exists in the repo.`);
	rmSync(upstreamDir, { recursive: true });
	process.exit(1);
}

// Verify
const actualSha = execSync(`cd ${upstreamDir} && git rev-parse HEAD`, { encoding: "utf-8" }).trim();
if (actualSha !== sha) {
	console.error(`SHA mismatch: expected ${sha}, got ${actualSha}`);
	process.exit(1);
}

console.log(`\nVendored ${UPSTREAM_REPO} at ${sha}`);
console.log(`Next: bun scripts/classify-diff.ts`);
