#!/usr/bin/env bun
// provenance.ts — owns the PROVENANCE.md catalog, the source of truth for
// upstream provenance of every shipped artifact.
//
// Usage: bun scripts/provenance.ts --check
//        bun scripts/provenance.ts --migrate [--dry]
//
// The provenance fields (upstream/upstream_sha/upstream_version/status) no
// longer live in shipped frontmatter: a `skill://` read serves the raw file,
// so those lines cost tokens on every model read, and OMP parses `metadata`
// as an opaque string map and consumes none of the values (the `skills`
// listing renders only name+description,
// refs/omp-src/packages/coding-agent/src/prompts/system/system-prompt.md:29-32).
// The state moved to a fixed-shape table under `## Catalog` in PROVENANCE.md
// (repo root, outside the shipped trees); the human migration notes stay in
// the append-only `## <path>` sections. `scripts/classify-diff.ts` and
// `scripts/generate-report.ts` read the table through `parseCatalog` here.
//
// Modes:
//   --check   Validate table/artifact parity and row invariants. Never writes.
//             Exit 1 on any violation. Run this before any commit (AGENTS.md
//             rule 4); scripts/validate-frontmatter.ts separately rejects any
//             non-empty `metadata:` block reappearing in shipped files.
//   --migrate One-time cutover, idempotent: derive a row for every shipped
//             artifact (from its `metadata:` frontmatter if it still has one,
//             else by path convention), upsert into the table — existing rows
//             always win — and delete the frontmatter blocks. --dry previews.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");
const catalogPath = join(repo, "PROVENANCE.md");

export const CATALOG_HEADING = "## Catalog";
export const CLAUDE_CATALOG_HEADING = "## Claude Code Catalog";
export const STATUSES = ["portable", "adapted", "omp-native", "new"] as const;
export type CatalogRow = { path: string; upstream: string; sync: string; status: string };

/** The Claude Code target's fixed glob rows: the four generator-owned
 *  directories plus the two it deliberately never writes. `--check` asserts
 *  every one of these paths is a row, and every row resolves to files. */
const CLAUDE_CATALOG_PATHS = [
	"plugins/pstack/.claude-plugin/*",
	"plugins/pstack/agents/**",
	"plugins/pstack/assets/*",
	"plugins/pstack/hooks/**",
	"plugins/pstack/models.json",
	"plugins/pstack/skills/**",
] as const;

// Snapshot roots, keyed by directory under the repo root; UPSTREAM.md holds
// the full sha each pin was authored against.
const PINS = [
	{ key: "upstream_sha", root: "upstream" },
	{ key: "cursor_plugins_sha", root: "refs/cursor-plugins" },
	{ key: "ref_port_sha", root: "refs/ref-port" },
] as const;

// Artifacts with no path convention; hooks have no frontmatter at all, so a
// declared upstream is impossible and the mapping lives here instead.
const OVERRIDES: Record<string, { root: string; rel: string }> = {
	"hooks/session-start-context.md": { root: "refs/ref-port", rel: "plugins/pstack/hooks/session-start-context.md" },
};

function pins(): Map<string, string> {
	const byRoot = new Map<string, string>();
	const text = readFileSync(join(repo, "UPSTREAM.md"), "utf-8");
	for (const { key, root } of PINS) {
		const m = new RegExp(`^${key}:\\s*([0-9a-f]{40})`, "m").exec(text);
		if (m) byRoot.set(root, m[1].slice(0, 8));
	}
	return byRoot;
}

/** Shipped artifact paths, package-root-relative, in stable migrate order. */
export function shippedArtifacts(): string[] {
	const out: string[] = [];
	const walk = (dir: string) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) walk(join(dir, entry.name));
			else if (entry.name.endsWith(".md")) out.push(relative(plugin, join(dir, entry.name)).split("\\").join("/"));
		}
	};
	walk(join(plugin, "skills"));
	for (const tree of ["commands", "agents", "hooks"]) {
		const dir = join(plugin, tree);
		if (existsSync(dir)) for (const f of readdirSync(dir).sort()) if (f.endsWith(".md")) out.push(`${tree}/${f}`);
	}
	return out;
}

export function stripFrontmatter(content: string): string {
	if (!content.startsWith("---\n")) return content;
	const end = content.indexOf("\n---\n", 3);
	return end === -1 ? content : content.slice(end + 5);
}

function bodyOf(file: string): string {
	return stripFrontmatter(readFileSync(file, "utf-8")).replace(/^\n+/, "").replace(/\s+$/, "");
}

/** The `metadata:` block inside a file's frontmatter head, or null. */
function metadataBlock(content: string): string | null {
	const close = content.indexOf("\n---", 3);
	if (!content.startsWith("---\n") || close === -1) return null;
	const m = /^metadata:\n(?:[ \t]+\S.*\n)+/m.exec(content.slice(0, close + 1));
	return m ? m[0] : null;
}

const PROVENANCE_KEY_RE = /^[ \t]*(upstream|upstream_sha|upstream_version|status|note|menu-description):/m;

/** The file's frontmatter head, closing delimiter included, or null if none. */
function headOf(content: string): string | null {
	if (!content.startsWith("---\n")) return null;
	const close = content.indexOf("\n---", 3);
	return close === -1 ? null : content.slice(0, close + 4);
}

/** Delete provenance key lines from a frontmatter head; drop the whole block
 *  when no other key survives it (references files carry flat provenance with
 *  no OMP keys at all). Idempotent: no provenance keys, no change. */
function stripProvenanceHead(content: string): { content: string; removed: boolean } {
	const head = headOf(content);
	if (head === null || !PROVENANCE_KEY_RE.test(head)) return { content, removed: false };
	const rest = content.slice(head.length).replace(/^\n/, "");
	const keys = head.split("\n").slice(1, -1).filter((l) => !PROVENANCE_KEY_RE.test(l));
	for (;;) {
		const i = keys.findIndex((l, j) => l === "metadata:" && !/^[ \t]+\S/.test(keys[j + 1] ?? ""));
		if (i === -1) break;
		keys.splice(i, 1);
	}
	if (keys.some((l) => /^[a-z][a-z_-]*:/.test(l))) return { content: ["---", ...keys, "---", ...rest.split("\n")].join("\n"), removed: true };
	return { content: rest.replace(/^\n+/, ""), removed: true };
}

function declared(content: string): { upstream: string; sha: string; status: string } | null {
	const block = metadataBlock(content);
	if (block === null) return null;
	const field = (name: string): string =>
		new RegExp(`^[ \\t]+${name}:\\s*'?([^'\\n]+?)'?\\s*$`, "m").exec(block)?.[1] ?? "";
	return { upstream: field("upstream"), sha: field("upstream_sha"), status: field("status") };
}

/** Convention lookup: first existing snapshot file this artifact was ported from. */
function resolved(rel: string): { upstream: string; root: string } | null {
	const override = OVERRIDES[rel];
	if (override) {
		const p = join(override.root, override.rel);
		return existsSync(join(repo, p)) ? { upstream: p, root: override.root } : null;
	}
	const candidates: string[] = [];
	if (rel.startsWith("skills/") || rel.startsWith("agents/")) candidates.push(join("upstream/pstack", rel));
	if (rel.startsWith("skills/")) candidates.push(join("refs/cursor-plugins/cursor-team-kit", rel));
	for (const c of candidates) {
		if (existsSync(join(repo, c))) return { upstream: c, root: c.startsWith("upstream/") ? "upstream" : "refs/cursor-plugins" };
	}
	return null;
}

function deriveRow(rel: string, content: string, shortByRoot: Map<string, string>, skillSync: Map<string, string>): { row?: CatalogRow; violation?: string } {
	const dec = declared(content);
	if (dec !== null) {
		if (dec.upstream === "" || dec.upstream === "none") {
			const root = dec.sha.slice(0, 8) === shortByRoot.get("refs/cursor-plugins") ? "refs/cursor-plugins" : "upstream";
			return { row: { path: rel, upstream: "none", sync: shortByRoot.get(root) ?? dec.sha.slice(0, 8), status: dec.status || "new" } };
		}
		const root = PINS.map((p) => p.root).find((r) => shortByRoot.get(r) === dec.sha.slice(0, 8));
		if (root === undefined) return { violation: `${rel}: declared sha ${dec.sha.slice(0, 8)} matches no UPSTREAM.md pin` };
		const upstream = join(root, dec.upstream);
		if (!existsSync(join(repo, upstream))) return { violation: `${rel}: declared upstream ${upstream} not found` };
		if (dec.status === "") return { violation: `${rel}: declared metadata has no status` };
		return { row: { path: rel, upstream, sync: dec.sha.slice(0, 8), status: dec.status } };
	}
	const res = resolved(rel);
	if (res === null) {
		const sync = rel.startsWith("commands/")
			? skillSync.get(rel.replace(/^commands\/pstack:/, "").replace(/\.md$/, "")) ?? shortByRoot.get("upstream") ?? ""
			: shortByRoot.get("upstream") ?? "";
		return { row: { path: rel, upstream: "none", sync, status: "new" } };
	}
	const status = bodyOf(join(plugin, rel)) === bodyOf(join(repo, res.upstream)) ? "portable" : "adapted";
	return { row: { path: rel, upstream: res.upstream, sync: shortByRoot.get(res.root) ?? "", status } };
}

function parseTableAt(heading: string): CatalogRow[] | null {
	if (!existsSync(catalogPath)) return null;
	const lines = readFileSync(catalogPath, "utf-8").split("\n");
	const start = lines.indexOf(heading);
	if (start === -1) return null;
	const rows: CatalogRow[] = [];
	for (let i = start + 1; i < lines.length; i++) {
		if (/^## /.test(lines[i])) break;
		if (!lines[i].startsWith("| ")) continue;
		const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
		if (cells.length !== 4 || cells[0] === "Path") continue;
		rows.push({ path: cells[0], upstream: cells[1], sync: cells[2], status: cells[3] });
	}
	return rows;
}

export function parseCatalog(): CatalogRow[] | null {
	return parseTableAt(CATALOG_HEADING);
}

function resolvesToFiles(globPath: string): boolean {
	const base = globPath.replace(/\/\*\*?$/, "");
	const full = join(repo, base);
	if (!existsSync(full)) return false;
	const stat = statSync(full);
	if (stat.isFile()) return base === globPath;
	return stat.isDirectory() && readdirSync(full).length > 0;
}

function checkClaudeCatalog(shortByRoot: Map<string, string>): string[] {
	const violations: string[] = [];
	const rows = parseTableAt(CLAUDE_CATALOG_HEADING);
	if (rows === null) { violations.push(`no "${CLAUDE_CATALOG_HEADING}" table in PROVENANCE.md`); return violations; }
	const shorts = new Set(shortByRoot.values());
	const byPath = new Map<string, CatalogRow>();
	for (const r of rows) {
		if (byPath.has(r.path)) violations.push(`${r.path}: duplicate Claude Code catalog row`);
		byPath.set(r.path, r);
		if (!STATUSES.includes(r.status as (typeof STATUSES)[number])) violations.push(`${r.path}: status "${r.status}" not in ${STATUSES.join("|")}`);
		if (!/^[0-9a-f]{8}$/.test(r.sync) || !shorts.has(r.sync)) violations.push(`${r.path}: sync "${r.sync}" matches no UPSTREAM.md pin`);
		if (r.upstream === "none") { if (r.status !== "new") violations.push(`${r.path}: upstream none requires status new`); }
		else if (!existsSync(join(repo, r.upstream))) violations.push(`${r.path}: upstream ${r.upstream} not found`);
		if (!resolvesToFiles(r.path)) violations.push(`${r.path}: resolves to no files on disk`);
	}
	for (const p of CLAUDE_CATALOG_PATHS) if (!byPath.has(p)) violations.push(`${p}: required Claude Code catalog row is missing`);
	for (const r of rows) if (!(CLAUDE_CATALOG_PATHS as readonly string[]).includes(r.path)) violations.push(`${r.path}: row for a path outside the fixed Claude Code catalog set`);
	for (let i = 1; i < rows.length; i++) if (rows[i - 1].path > rows[i].path) { violations.push("Claude Code catalog rows are not sorted by path"); break; }
	return violations;
}

function renderTable(rows: CatalogRow[]): string[] {
	const sorted = [...rows].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
	const lines = [
		CATALOG_HEADING,
		"",
		"One row per shipped artifact (`skills/**`, `commands/*.md`, `agents/*.md`,",
		"`hooks/*.md`), package-root-relative, sorted. `Upstream` is repo-root",
		"resolvable or `none`. `Sync` is the 8-char pin the row was authored",
		"against; full shas live in UPSTREAM.md. `Status` is one of",
		`${STATUSES.join(" / ")}. This table is machine state:`,
		"existing rows are never overwritten by the migrate mode, and",
		"`bun scripts/provenance.ts --check` audits it. Sections below are",
		"append-only history. Provenance never returns to shipped frontmatter.",
		"",
		"| Path | Upstream | Sync | Status |",
		"|---|---|---|---|",
	];
	for (const r of sorted) lines.push(`| ${r.path} | ${r.upstream} | ${r.sync} | ${r.status} |`);
	lines.push("");
	return lines;
}

function writeTable(rows: CatalogRow[]): void {
	const lines = readFileSync(catalogPath, "utf-8").split("\n");
	const start = lines.indexOf(CATALOG_HEADING);
	let region: [number, number];
	if (start !== -1) {
		let end = lines.length;
		for (let i = start + 1; i < lines.length; i++) if (/^## /.test(lines[i])) { end = i; break; }
		region = [start, end];
	} else {
		let first = lines.length;
		for (let i = 0; i < lines.length; i++) if (/^## /.test(lines[i])) { first = i; break; }
		region = [first, first];
	}
	writeFileSync(catalogPath, [...lines.slice(0, region[0]), ...renderTable(rows), ...lines.slice(region[1])].join("\n"));
}

function migrate(dry: boolean): number {
	const shortByRoot = pins();
	const existing = parseCatalog() ?? [];
	const byPath = new Map(existing.map((r) => [r.path, r]));
	const skillSync = new Map<string, string>();
	const violations: string[] = [];
	let added = 0, kept = 0, stripped = 0;
	for (const rel of shippedArtifacts()) {
		const file = join(plugin, rel);
		const raw = readFileSync(file, "utf-8");
		if (byPath.has(rel)) {
			kept++;
			const s = stripProvenanceHead(raw);
			if (s.removed) { stripped++; if (!dry) writeFileSync(file, s.content); }
			if (rel.startsWith("skills/")) { const r = byPath.get(rel)!; const root = r.upstream.startsWith("upstream/") ? "upstream" : "refs/cursor-plugins"; skillSync.set(rel.split("/")[1], shortByRoot.get(root) ?? ""); }
			continue;
		}
		const d = deriveRow(rel, raw, shortByRoot, skillSync);
		if (d.violation !== undefined || d.row === undefined) { violations.push(d.violation ?? `${rel}: derivation returned no row`); continue; }
		byPath.set(rel, d.row);
		if (rel.startsWith("skills/") && d.row.upstream !== "none") skillSync.set(rel.split("/")[1], d.row.sync);
		added++;
		const s = stripProvenanceHead(raw);
		if (s.removed) { stripped++; if (!dry) writeFileSync(file, s.content); }
	}
	if (!dry) writeTable([...byPath.values()]);
	console.log(`${dry ? "dry run: would" : "migrated:"} add ${added} rows, keep ${kept} rows, strip ${stripped} file heads`);
	if (violations.length > 0) {
		console.error("violations (files left untouched, no rows added):");
		for (const v of violations) console.error(`  ${v}`);
		return 1;
	}
	return 0;
}

function check(): number {
	const rows = parseCatalog();
	if (rows === null) { console.error("FAIL: no ## Catalog table in PROVENANCE.md"); return 1; }
	const shortByRoot = pins();
	const shorts = new Set(shortByRoot.values());
	const byPath = new Map<string, CatalogRow>();
	const violations: string[] = [];
	for (const r of rows) {
		if (byPath.has(r.path)) violations.push(`${r.path}: duplicate row`);
		byPath.set(r.path, r);
		if (!STATUSES.includes(r.status as (typeof STATUSES)[number])) violations.push(`${r.path}: status "${r.status}" not in ${STATUSES.join("|")}`);
		if (!/^[0-9a-f]{8}$/.test(r.sync) || !shorts.has(r.sync)) violations.push(`${r.path}: sync "${r.sync}" matches no UPSTREAM.md pin`);
		if (r.upstream === "none") { if (r.status !== "new") violations.push(`${r.path}: upstream none requires status new`); }
		else if (!existsSync(join(repo, r.upstream))) violations.push(`${r.path}: upstream ${r.upstream} not found`);
	}
	const paths = shippedArtifacts();
	for (const p of paths) if (!byPath.has(p)) violations.push(`${p}: shipped artifact has no row`);
	for (const r of rows) if (!paths.includes(r.path)) violations.push(`${r.path}: row for file that is not shipped`);
	for (let i = 1; i < rows.length; i++) if (rows[i - 1].path > rows[i].path) { violations.push("table rows are not sorted by path"); break; }
	for (const p of paths) {
		const head = headOf(readFileSync(join(plugin, p), "utf-8"));
		if (head !== null && PROVENANCE_KEY_RE.test(head)) violations.push(`${p}: provenance keys in frontmatter; the catalog table is their only home`);
	}
	const claudeViolations = checkClaudeCatalog(shortByRoot);
	violations.push(...claudeViolations);
	if (violations.length > 0) {
		console.error(`provenance check: ${violations.length} violations`);
		for (const v of violations) console.error(`  ${v}`);
		return 1;
	}
	console.log(`provenance check: clean (${rows.length} artifacts, ${CLAUDE_CATALOG_PATHS.length} Claude Code catalog rows)`);
	return 0;
}

if (import.meta.main) {
	const mode = process.argv[2];
	process.exit(mode === "--check" ? check() : mode === "--migrate" ? migrate(process.argv[3] === "--dry") : (console.error("usage: bun scripts/provenance.ts --check | --migrate [--dry]"), 2));
}
