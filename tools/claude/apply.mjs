#!/usr/bin/env bun
import { Glob } from "bun";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const DEFAULTS = Object.freeze({
  snapshot: "upstream/pstack",
  teamKit: "upstream/cursor-team-kit",
  tables: "tools/claude",
  output: "plugins/pstack",
});

const KEY = "disable-model-invocation";
const STAMP = "user-invocable";

export function isLeaf(path) {
  return /^skills\/principle-[^/]+\/SKILL\.md$/.test(path);
}

function esc(text) {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

function patternOf(token, mode) {
  return mode === "word" ? new RegExp(`\\b${esc(token)}\\b`, "g") : new RegExp(esc(token), "g");
}

function byPath(a, b) {
  if (a.path < b.path) return -1;
  if (a.path > b.path) return 1;
  if (a.line !== b.line) return a.line - b.line;
  return a.token < b.token ? -1 : a.token > b.token ? 1 : 0;
}

async function readJson(path) {
  return JSON.parse(await Bun.file(path).text());
}

export async function loadTables(tableDir) {
  const table = await readJson(`${tableDir}/substitutions.json`);
  const ledger = await readJson(`${tableDir}/rewrites.json`);
  return {
    scan: table.scan,
    substitutions: table.substitutions,
    denylist: table.denylist,
    rewrites: ledger.rewrites,
    teamKit: table.teamKit,
  };
}

// Renames map keys under a second vendored component before it merges into
// the primary snapshot's file map. The only current use is deslop -> de-slop,
// matching the OMP port's own rename of this same cursor-team-kit skill.
export function renamePaths(sites, renames = {}) {
  const out = new Map();
  for (const [path, text] of sites) out.set(renames[path] ?? path, text);
  return out;
}

export async function scanSnapshot(snapshotDir, scan) {
  const paths = [];
  for (const root of scan.roots) {
    for (const ext of scan.extensions) {
      for (const rel of new Glob(`**/*.${ext}`).scanSync({ cwd: `${snapshotDir}/${root}` })) {
        paths.push(`${root}/${rel}`);
      }
    }
  }
  for (const path of scan.copy ?? []) paths.push(path);
  paths.sort();
  const sites = new Map();
  for (const path of paths) {
    sites.set(path, await Bun.file(`${snapshotDir}/${path}`).text());
  }
  return sites;
}

export async function scanUnscanned(snapshotDir, scan, scanned) {
  const paths = [];
  for (const root of scan.roots) {
    for (const rel of new Glob("**/*").scanSync({ cwd: `${snapshotDir}/${root}` })) {
      const path = `${root}/${rel}`;
      if (!scanned.has(path) && !path.endsWith("/")) paths.push(path);
    }
  }
  paths.sort();
  const files = new Map();
  for (const path of paths) {
    files.set(path, await Bun.file(`${snapshotDir}/${path}`).text());
  }
  return files;
}

export function substitute(sites, substitutions) {
  const out = new Map();
  const counts = substitutions.map((rule) => ({ id: rule.id, pattern: rule.pattern, hits: 0 }));
  for (const [path, text] of sites) {
    let current = text;
    substitutions.forEach((rule, i) => {
      const hits = (current.match(new RegExp(esc(rule.pattern), "g")) || []).length;
      counts[i].hits += hits;
      if (hits) current = current.split(rule.pattern).join(rule.replacement);
    });
    out.set(path, current);
  }
  return { sites: out, counts };
}

export function rewrite(sites, rewrites) {
  const out = new Map(sites);
  const applied = rewrites.map((entry) => ({ source: entry.source, count: 0 }));
  const misses = [];
  rewrites.forEach((entry, i) => {
    for (const [path, text] of out) {
      const count = (text.split(entry.source).length - 1);
      if (!count) continue;
      applied[i].count += count;
      out.set(path, text.split(entry.source).join(entry.replacement));
    }
    if (!applied[i].count) misses.push({ source: entry.source });
  });
  return { sites: out, applied, misses };
}

export function frontmatter(sites) {
  const out = new Map();
  const anomalies = [];
  const stampedPaths = [];
  let stripped = 0;
  let stamped = 0;
  for (const [path, text] of sites) {
    if (!path.endsWith(".md")) {
      out.set(path, text);
      continue;
    }
    if (text.includes("\r")) {
      anomalies.push({ path, reason: "carriage return" });
      out.set(path, text);
      continue;
    }
    const lines = text.split("\n");
    if (lines[0] !== "---") {
      out.set(path, text);
      continue;
    }
    const close = lines.indexOf("---", 1);
    if (close === -1) {
      anomalies.push({ path, reason: "frontmatter never closes" });
      out.set(path, text);
      continue;
    }
    const body = lines.slice(1, close);
    const kept = body.filter((line) => !new RegExp(`^${KEY}:`).test(line));
    stripped += body.length - kept.length;
    if (isLeaf(path)) {
      if (!kept.some((line) => new RegExp(`^${STAMP}:`).test(line))) {
        kept.push(`${STAMP}: false`);
        stamped++;
      }
      stampedPaths.push(path);
    }
    out.set(path, ["---", ...kept, ...lines.slice(close)].join("\n"));
  }
  return { sites: out, stripped, stamped, stampedPaths: stampedPaths.sort(), anomalies };
}

export function deny(sites, denylist) {
  const hits = [];
  for (const [path, text] of sites) {
    const lines = text.split("\n");
    for (const entry of denylist) {
      const re = patternOf(entry.token, entry.mode);
      lines.forEach((line, i) => {
        for (let n = (line.match(re) || []).length; n > 0; n--) {
          hits.push({ path, line: i + 1, token: entry.token, hint: entry.hint, origin: entry.origin });
        }
      });
    }
  }
  return hits.sort(byPath);
}

function tally(hits, origin) {
  const picked = hits.filter((hit) => hit.origin === origin);
  return { hits: picked.length, files: new Set(picked.map((hit) => hit.path)).size, picked };
}
export const SCOPES = Object.freeze(["skills", "agents", "assets", ".claude-plugin"]);

export async function readUpstreamVersion(root) {
  const text = await Bun.file(join(root, "UPSTREAM.md")).text();
  const match = /^upstream_version:\s*(\S+)/m.exec(text);
  if (!match) throw new Error(`no upstream_version line in ${join(root, "UPSTREAM.md")}`);
  return match[1];
}

function jsonOf(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function renderManifests(pin, upstream, agentPaths) {
  const plugin = {
    name: "pstack",
    displayName: "pstack (Claude Code port)",
    version: pin.version,
    description: `${upstream.description} Generated by tools/claude/apply.mjs from upstream/pstack at the pin in UPSTREAM.md.`,
    author: upstream.author,
    license: upstream.license,
    logo: upstream.logo,
    keywords: upstream.keywords,
    skills: "./skills/",
    agents: agentPaths.map((path) => `./${path}`),
  };
  const marketplace = {
    name: "pstack-port",
    owner: { name: "pstack-port" },
    description: "Claude Code port of pstack, generated from the pinned snapshot in upstream/pstack.",
    plugins: [
      {
        name: "pstack",
        source: "./plugins/pstack",
        description: upstream.description,
        version: pin.version,
        author: { name: `${upstream.author.name} (original)` },
        license: upstream.license,
        keywords: upstream.keywords,
      },
    ],
  };
  return { plugin, marketplace };
}

export function frontmatterKeyCount(tree, key) {
  const pattern = new RegExp(`^${key}:`);
  const hits = [];
  for (const [path, text] of tree) {
    const lines = text.split("\n");
    if (lines[0] !== "---") continue;
    const close = lines.indexOf("---", 1);
    if (close === -1) continue;
    lines.slice(1, close).forEach((line, i) => {
      if (pattern.test(line)) hits.push({ path, line: i + 2 });
    });
  }
  return hits;
}

function pruneDir(dir, keep) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += pruneDir(full, keep);
      if (readdirSync(full).length === 0) rmSync(full, { recursive: true });
    } else if (!keep.has(full)) {
      rmSync(full);
      count++;
    }
  }
  return count;
}

export function writeTree(outputRoot, tree, { snapshotDir, assets = [] } = {}) {
  const keep = new Set();
  let written = 0;
  let unchanged = 0;
  for (const [relPath, content] of tree) {
    const dest = join(outputRoot, relPath);
    keep.add(dest);
    mkdirSync(dirname(dest), { recursive: true });
    const changed = !existsSync(dest) || readFileSync(dest, "utf8") !== content;
    if (changed) {
      writeFileSync(dest, content);
      written++;
    } else {
      unchanged++;
    }
    const source = snapshotDir ? join(snapshotDir, relPath) : null;
    if (source && existsSync(source) && (statSync(source).mode & 0o111)) chmodSync(dest, 0o755);
  }
  for (const { from, to } of assets) {
    const dest = join(outputRoot, to);
    keep.add(dest);
    mkdirSync(dirname(dest), { recursive: true });
    const same = existsSync(dest) && Buffer.compare(readFileSync(from), readFileSync(dest)) === 0;
    if (!same) {
      copyFileSync(from, dest);
      written++;
    } else {
      unchanged++;
    }
  }
  let pruned = 0;
  for (const scope of SCOPES) {
    const dir = join(outputRoot, scope);
    if (existsSync(dir)) pruned += pruneDir(dir, keep);
  }
  return { written, unchanged, pruned };
}

export async function generate({ snapshotDir, tableDir, teamKitDir }) {
  const tables = await loadTables(tableDir);
  const scanned = await scanSnapshot(snapshotDir, tables.scan);
  const teamKitScanned = await scanSnapshot(teamKitDir, { roots: tables.teamKit.roots, extensions: tables.scan.extensions });
  const teamKitRenamed = renamePaths(teamKitScanned, tables.teamKit.renamePaths);
  const teamKitCollisions = [...teamKitRenamed.keys()].filter((path) => scanned.has(path));
  const merged = new Map([...scanned, ...teamKitRenamed]);
  const substituted = substitute(merged, tables.substitutions);
  const rewritten = rewrite(substituted.sites, tables.rewrites);
  const frontmattered = frontmatter(rewritten.sites);
  const hits = deny(frontmattered.sites, tables.denylist);
  const unscanned = await scanUnscanned(snapshotDir, tables.scan, scanned);
  const teamKitUnscanned = await scanUnscanned(teamKitDir, { roots: tables.teamKit.roots, extensions: tables.scan.extensions }, teamKitScanned);
  const allUnscanned = new Map([...unscanned, ...renamePaths(teamKitUnscanned, tables.teamKit.renamePaths)]);
  const unscannedHits = deny(allUnscanned, tables.denylist);
  return {
    tree: frontmattered.sites,
    report: {
      scanned: merged.size,
      teamKitScanned: teamKitRenamed.size,
      teamKitCollisions,
      counts: substituted.counts,
      rewriteEntries: tables.rewrites.length,
      rewriteApplied: rewritten.applied.reduce((n, entry) => n + entry.count, 0),
      misses: rewritten.misses,
      stripped: frontmattered.stripped,
      stamped: frontmattered.stamped,
      stampedPaths: frontmattered.stampedPaths,
      anomalies: frontmattered.anomalies,
      carried: tally(hits, "carried"),
      added: tally(hits, "added"),
      hits,
      unscannedFiles: allUnscanned.size,
      unscannedHits,
      leafGlob: [...new Glob("principle-*/SKILL.md").scanSync({ cwd: `${snapshotDir}/skills` })].length,
    },
  };
}

export function formatReport(report) {
  const pad = 24;
  const lines = [`scan files ${report.scanned} (team-kit ${report.teamKitScanned})`];
  for (const count of report.counts) {
    lines.push(`substitution ${count.id.padEnd(pad)}${count.hits}`);
  }
  lines.push(`rewrite entries ${report.rewriteEntries} applied ${report.rewriteApplied} missed ${report.misses.length}`);
  lines.push(`frontmatter stripped ${report.stripped}`);
  lines.push(`frontmatter stamped ${report.stamped}`);
  lines.push(`leaf glob ${report.leafGlob}`);
  lines.push(`deny carried hits ${report.carried.hits} files ${report.carried.files}`);
  lines.push(`deny added hits ${report.added.hits} files ${report.added.files}`);
  lines.push(`deny total hits ${report.hits.length} files ${new Set(report.hits.map((h) => h.path)).size}`);
  if (report.teamKitCollisions.length) lines.push(`team-kit path collisions ${report.teamKitCollisions.join(", ")}`);
  lines.push(`unscanned files ${report.unscannedFiles} deny hits ${report.unscannedHits.length} files ${new Set(report.unscannedHits.map((h) => h.path)).size}`);
  lines.push("");
  for (const hit of report.hits) lines.push(`hit ${hit.path}:${hit.line} [${hit.token}] ${hit.hint}`);
  if (report.misses.length) {
    lines.push("");
    for (const miss of report.misses) lines.push(`miss no sentence in the snapshot matches: ${miss.source}`);
  }
  if (report.anomalies.length) {
    lines.push("");
    for (const anomaly of report.anomalies) lines.push(`anomaly ${anomaly.path} ${anomaly.reason}`);
  }
  if (report.unscannedHits.length) {
    lines.push("");
    lines.push("unscanned deny hits. these files sit outside the scan set and need a carriage decision.");
    for (const hit of report.unscannedHits) lines.push(`unscanned ${hit.path}:${hit.line} [${hit.token}] ${hit.hint}`);
  }
  return `${lines.join("\n")}\n`;
}

async function main(argv) {
  const flags = new Map();
  let dry = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry") dry = true;
    else if (arg === "--snapshot" || arg === "--team-kit" || arg === "--tables" || arg === "--output" || arg === "--marketplace") flags.set(arg, argv[++i]);
    else throw new Error(`unknown argument ${arg}`);
  }
  const snapshotDir = flags.get("--snapshot") ?? join(REPO_ROOT, DEFAULTS.snapshot);
  const teamKitDir = flags.get("--team-kit") ?? join(REPO_ROOT, DEFAULTS.teamKit);
  const tableDir = flags.get("--tables") ?? join(REPO_ROOT, DEFAULTS.tables);
  const { tree, report } = await generate({ snapshotDir, tableDir, teamKitDir });
  process.stdout.write(formatReport(report));
  const fatal =
    report.hits.length + report.misses.length + report.anomalies.length + report.unscannedHits.length + report.teamKitCollisions.length;
  if (fatal) return 1;
  if (dry) return 0;

  if (report.stampedPaths.length !== report.leafGlob) {
    process.stderr.write(`fatal: stamp count ${report.stampedPaths.length} != leaf glob ${report.leafGlob}\n`);
    return 1;
  }
  const disableHits = frontmatterKeyCount(tree, KEY);
  if (disableHits.length !== 0) {
    process.stderr.write(`fatal: ${disableHits.length} ${KEY} keys survived emit\n`);
    return 1;
  }
  const stampHits = frontmatterKeyCount(tree, STAMP);
  if (stampHits.length !== report.leafGlob) {
    process.stderr.write(`fatal: ${STAMP} key count ${stampHits.length}, expected ${report.leafGlob}\n`);
    return 1;
  }

  const outputRoot = flags.get("--output") ?? join(REPO_ROOT, DEFAULTS.output);
  const upstreamVersion = await readUpstreamVersion(REPO_ROOT);
  const upstream = await readJson(join(snapshotDir, ".cursor-plugin/plugin.json"));
  const agentPaths = [...tree.keys()].filter((path) => path.startsWith("agents/") && path.endsWith(".md")).sort();
  const { plugin, marketplace } = renderManifests({ version: upstreamVersion }, upstream, agentPaths);
  tree.set(".claude-plugin/plugin.json", jsonOf(plugin));

  const { written, unchanged, pruned } = writeTree(outputRoot, tree, {
    snapshotDir,
    assets: [{ from: join(snapshotDir, "assets/logo.png"), to: "assets/logo.png" }],
  });
  if (existsSync(join(outputRoot, "commands"))) {
    process.stderr.write("fatal: emitted tree contains a commands/ directory\n");
    return 1;
  }
  const marketplacePath = flags.get("--marketplace") ?? join(REPO_ROOT, ".claude-plugin", "marketplace.json");
  mkdirSync(dirname(marketplacePath), { recursive: true });
  writeFileSync(marketplacePath, jsonOf(marketplace));

  process.stdout.write(`write files ${written} unchanged ${unchanged} pruned ${pruned}\n`);
  return 0;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
