#!/usr/bin/env bun
import { Glob } from "bun";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const DEFAULTS = Object.freeze({
  snapshot: "upstream/pstack",
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
  };
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

export async function generate({ snapshotDir, tableDir }) {
  const tables = await loadTables(tableDir);
  const scanned = await scanSnapshot(snapshotDir, tables.scan);
  const substituted = substitute(scanned, tables.substitutions);
  const rewritten = rewrite(substituted.sites, tables.rewrites);
  const frontmattered = frontmatter(rewritten.sites);
  const hits = deny(frontmattered.sites, tables.denylist);
  const unscanned = await scanUnscanned(snapshotDir, tables.scan, scanned);
  const unscannedHits = deny(unscanned, tables.denylist);
  return {
    tree: frontmattered.sites,
    report: {
      scanned: scanned.size,
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
      unscannedFiles: unscanned.size,
      unscannedHits,
      leafGlob: [...new Glob("principle-*/SKILL.md").scanSync({ cwd: `${snapshotDir}/skills` })].length,
    },
  };
}

export function formatReport(report) {
  const pad = 24;
  const lines = [`scan files ${report.scanned}`];
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
    else if (arg === "--snapshot" || arg === "--tables") flags.set(arg, argv[++i]);
    else throw new Error(`unknown argument ${arg}`);
  }
  if (!dry) {
    process.stderr.write("write mode is not built yet. it lands at unit C3 with both manifests. run --dry.\n");
    return 2;
  }
  const { report } = await generate({
    snapshotDir: flags.get("--snapshot") ?? join(REPO_ROOT, DEFAULTS.snapshot),
    tableDir: flags.get("--tables") ?? join(REPO_ROOT, DEFAULTS.tables),
  });
  process.stdout.write(formatReport(report));
  const fatal = report.hits.length + report.misses.length + report.anomalies.length;
  return fatal ? 1 : 0;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
