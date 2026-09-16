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
import { parseCatalog } from "./provenance.ts";

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

// The Actions legend spells every action in backticks, so a substring count over
// the file adds one phantom per action. Read the Action column of each Table row.
const counts: Record<string, number> = { PORT: 0, ADAPT: 0, NATIVE: 0, REPLACE: 0, DEFER: 0, DROP: 0 };
let total = 0;
for (const line of matrixContent.split("\n")) {
  const action = line.startsWith("|") ? (line.split("|")[5] ?? "").trim() : "";
  if (!(action in counts)) continue;
  counts[action]++;
  total++;
}

const catalog = parseCatalog() ?? [];
const catalogRows = ["portable", "adapted", "omp-native", "new"]
	.map((s) => `| ${s} | ${catalog.filter((r) => r.status === s).length} |`)
	.join("\n");

console.log(`# Upstream Sync Report

**Generated:** ${new Date().toISOString().split("T")[0]}
**Upstream:** pstack @ ${upstreamSha} (v${upstreamVersion})
**Synced:** ${syncedAt}

## Matrix

| Action | Count |
|---|---|
| PORT | ${counts.PORT} |
| ADAPT | ${counts.ADAPT} |
| NATIVE | ${counts.NATIVE} |
| REPLACE | ${counts.REPLACE} |
| DEFER | ${counts.DEFER} |
| DROP | ${counts.DROP} |
| **Total** | **${total}** |

## Catalog

| Status | Shipped files |
|---|---|
${catalogRows}
| **Total** | **${catalog.length}** |

## Next steps

1. Review any PORT files for changes since ${upstreamSha}
2. Check ADAPT files for OMP-specific translations that need updating
3. Run \`bun scripts/provenance.ts --check\` to audit the catalog, then \`bun scripts/conformance.ts\` to verify the port
4. Update UPSTREAM.md with the new sha and version
5. Commit with message: "sync: pstack @ ${upstreamSha}"
`);
