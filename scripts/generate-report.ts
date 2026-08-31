#!/usr/bin/env bun
// generate-report.ts — human-readable upstream sync status
//
// Usage: bun scripts/generate-report.ts
//
// Reads UPSTREAM.md and the matrix to produce a markdown report suitable
// for committing alongside a sync.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const upstreamMd = join(repo, "UPSTREAM.md");

if (!existsSync(upstreamMd)) {
	console.error("UPSTREAM.md not found. Run bun scripts/fetch-upstream.ts <sha> first.");
	process.exit(1);
}

const content = readFileSync(upstreamMd, "utf-8");
const lines = content.split("\n");

let upstreamSha = "";
let upstreamVersion = "";
let syncedAt = "";

for (const line of lines) {
	if (line.startsWith("upstream_sha:")) upstreamSha = line.split(":")[1].trim();
	if (line.startsWith("upstream_version:")) upstreamVersion = line.split(":")[1].trim();
	if (line.startsWith("upstream_synced_at:")) syncedAt = line.split(":")[1].trim();
}

// Read matrix for counts
const matrixPath = join(repo, "findings", "matrix.md");
let matrixContent = "";
if (existsSync(matrixPath)) {
	matrixContent = readFileSync(matrixPath, "utf-8");
}

// Count statuses from matrix
const portable = (matrixContent.match(/PORT/g) || []).length;
const adapted = (matrixContent.match(/ADAPT/g) || []).length;
const native = (matrixContent.match(/NATIVE/g) || []).length;
const drop = (matrixContent.match(/DROP/g) || []).length;
const total = portable + adapted + native + drop;

console.log(`# Upstream Sync Report

**Generated:** ${new Date().toISOString().split("T")[0]}
**Upstream:** pstack @ ${upstreamSha} (v${upstreamVersion})
**Synced:** ${syncedAt}

## Matrix

| Status | Count |
|---|---|
| PORT | ${portable} |
| ADAPT | ${adapted} |
| NATIVE | ${native} |
| DROP | ${drop} |
| **Total** | **${total}** |

## Next steps

1. Review any PORT files for changes since ${upstreamSha}
2. Check ADAPT files for OMP-specific translations that need updating
3. Run \`bun scripts/conformance.ts\` to verify the port
4. Update UPSTREAM.md with the new sha and version
5. Commit with message: "sync: pstack @ ${upstreamSha}"
`);
