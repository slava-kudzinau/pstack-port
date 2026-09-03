#!/usr/bin/env bun
// classify-diff.ts — compare shipped artifacts against the upstream snapshots
//
// Usage: bun scripts/classify-diff.ts
//
// Reads the `## Catalog` table in PROVENANCE.md (scripts/provenance.ts owns
// it; the provenance fields no longer live in shipped frontmatter) and
// compares each row against the snapshot file. Bodies are compared with
// frontmatter stripped on both sides: our side carries OMP frontmatter and
// upstream carries Cursor's, so a raw byte compare could never match and the
// `unchanged` bucket would be structurally dead. Classifies each row as
// unchanged, changed (portable), changed (adapted), removed, plus artifacts
// missing from the table (orphaned) and upstream skills never ported (new).

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCatalog, shippedArtifacts, stripFrontmatter } from "./provenance.ts";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");
const upstreamSkills = join(repo, "upstream", "pstack", "skills");

const results = {
	unchanged: [] as string[],
	portable: [] as string[],
	adapted: [] as string[],
	removed: [] as string[],
	orphaned: [] as string[],
	newInUpstream: [] as string[],
	conflicts: [] as string[],
};

const rows = parseCatalog();
if (rows === null) {
	console.error("no ## Catalog table in PROVENANCE.md; run bun scripts/provenance.ts --migrate");
	process.exit(1);
}

const body = (file: string): string => stripFrontmatter(readFileSync(file, "utf-8")).replace(/^\n+/, "").replace(/\s+$/, "");

const tabled = new Set(rows.map((r) => r.path));
for (const p of shippedArtifacts()) {
	if (!tabled.has(p)) results.orphaned.push(p);
}

for (const row of rows) {
	if (row.upstream === "none") continue;
	const upstreamFile = join(repo, row.upstream);
	if (!existsSync(upstreamFile)) {
		results.removed.push(row.path);
		continue;
	}
	if (body(join(plugin, row.path)) === body(upstreamFile)) {
		results.unchanged.push(row.path);
	} else if (row.status === "portable") {
		results.portable.push(row.path);
	} else if (row.status === "adapted") {
		results.adapted.push(row.path);
	} else {
		results.conflicts.push(row.path);
	}
}

if (existsSync(upstreamSkills)) {
	for (const entry of readdirSync(upstreamSkills, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (existsSync(join(upstreamSkills, entry.name, "SKILL.md")) && !existsSync(join(plugin, "skills", entry.name, "SKILL.md"))) {
			results.newInUpstream.push(`skills/${entry.name}/SKILL.md`);
		}
	}
}

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
	console.log("\nPortable files whose body no longer matches upstream (agent can review):");
	for (const f of results.portable) console.log(`  - ${f}`);
}

if (results.adapted.length > 0) {
	console.log("\nAdapted files (diverge from upstream by design; only actionable after a fetch-upstream moves the pin):");
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
	console.log("\nOrphaned (missing a catalog row):");
	for (const f of results.orphaned) console.log(`  - ${f}`);
}

console.log();
if (results.portable.length === 0 && results.adapted.length === 0 && results.removed.length === 0 && results.conflicts.length === 0 && results.orphaned.length === 0) {
	console.log("No changes detected. Port is in sync with upstream.");
} else {
	console.log("Next: review changes above, then run bun scripts/generate-report.ts");
}
