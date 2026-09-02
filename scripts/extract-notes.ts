#!/usr/bin/env bun
// extract-notes.ts — move provenance `note:` fields out of shipped frontmatter
//
// Usage: bun scripts/extract-notes.ts [--dry]
//
// OMP strips frontmatter when injecting skills (extensibility/skills.ts:508),
// but every `skill://` read serves the raw file: the notes cost ~10k tokens
// per fan-out and carry zero runtime value. This codemod cuts each
// `note:` line from the frontmatter of every file under skills/, agents/,
// and commands/ and appends it as a fenced block under the file's
// repository-relative path in PROVENANCE.md. Idempotent: a second run finds
// no notes and appends nothing. A `metadata:` block left empty loses the key.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const changelogPath = join(repo, "PROVENANCE.md");
const dry = process.argv[2] === "--dry";

function shippedFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(repo, dir), { withFileTypes: true })) {
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...shippedFiles(rel));
    else if (entry.name.endsWith(".md")) out.push(rel);
  }
  return out;
}

/** Extract the note value (single-line, quoted or bare) and return cleaned content. */
function stripNote(content: string): { content: string; note: string } | null {
  const end = content.indexOf("\n---", 3);
  if (!content.startsWith("---\n") || end === -1) return null;
  const head = content.slice(0, end + 1);
  const rest = content.slice(end + 1);
  const m = /^([ \t]*)note:\s*(.+)\n/m.exec(head);
  if (!m) return null;
  let note = m[2].trim();
  if (
    (note.startsWith('"') && note.endsWith('"') && note.length > 1) ||
    (note.startsWith("'") && note.endsWith("'") && note.length > 1)
  ) {
    const q = note[0];
    note = note.slice(1, -1).replaceAll("\\" + q, q);
  }
  let cleaned = head.replace(m[0], "");
  const meta = /^metadata:\n(?![ \t]+\S)([ \t]+\S[\s\S]*?)?\n?/m.exec(cleaned);
  if (meta && !/^[ \t]+\S/m.exec(meta[1] ?? "")) {
    cleaned = cleaned.replace(meta[0], "");
  }
  return { content: cleaned + rest, note };
}

function appendEntry(rel: string, note: string, sha: string, version: string) {
  let doc = existsSync(changelogPath)
    ? readFileSync(changelogPath, "utf-8")
    : [
        "# Provenance changelog",
        "",
        "Migration and sync notes for every ported artifact, one `## <path>` section",
        "each. Lives outside the shipped trees so OMP never pays these tokens at",
        "runtime; the four provenance fields (`upstream`, `upstream_sha`,",
        "`upstream_version`, `status`) stay in each file's frontmatter because",
        "`scripts/classify-diff.ts` depends on them.",
        "",
        "Append a section per artifact on each upstream sync. Never rewrite an old",
        "section; add a newer one below it.",
        "",
      ].join("\n");
  if (doc.includes(`\n## ${rel}\n`) || doc.startsWith(`## ${rel}\n`)) {
    throw new Error(`${rel}: section already exists in PROVENANCE.md; merge by hand`);
  }
  doc = doc.replace(/\n*$/, "\n");
  const entry = ["", `## ${rel}`, "", `- sync: ${sha} (${version})`, "", note, ""].join("\n");
  writeFileSync(changelogPath, doc + entry);
}

function main() {
  const files = ["skills", "agents", "commands"].flatMap(shippedFiles).sort();
  let moved = 0;
  for (const rel of files) {
    const content = readFileSync(join(repo, rel), "utf-8");
    const stripped = stripNote(content);
    if (!stripped) continue;
    const sha = /upstream_sha:\s*'?([0-9a-f]{40})'?/.exec(content)?.[1] ?? "unknown";
    const version = /upstream_version:\s*'?([^'\n]+)'?/.exec(content)?.[1].trim() ?? "unknown";
    if (!dry) {
      appendEntry(rel, stripped.note, sha, version);
      writeFileSync(join(repo, rel), stripped.content);
    }
    moved++;
  }
  console.log(`${dry ? "dry run: " : ""}${moved} notes moved to PROVENANCE.md (${files.length} files scanned)`);
}

main();
