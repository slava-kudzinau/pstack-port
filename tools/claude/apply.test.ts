import { expect, it, describe } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  DEFAULTS,
  REPO_ROOT,
  deny,
  formatReport,
  frontmatter,
  frontmatterKeyCount,
  generate,
  isLeaf,
  loadTables,
  readUpstreamVersion,
  renderManifests,
  rewrite,
  scanSnapshot,
  substitute,
  writeTree,
} from "./apply.mjs";

const TABLES = join(REPO_ROOT, DEFAULTS.tables);
const tables = await loadTables(TABLES);
const SNAPSHOT = join(REPO_ROOT, DEFAULTS.snapshot);
const ground = await generate({ snapshotDir: SNAPSHOT, tableDir: TABLES });

function tree(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "claude-apply-"));
  for (const root of ["skills", "agents"]) mkdirSync(join(dir, root), { recursive: true });
  for (const [path, text] of Object.entries(files)) {
    const dest = join(dir, path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, text);
  }
  return dir;
}

const skill = (name: string, body: string) => `---\nname: ${name}\ndisable-model-invocation: true\n---\n${body}`;
const through = (files: Record<string, string>) =>
  frontmatter(substitute(new Map(Object.entries(files)), tables.substitutions).sites).sites;
const hint = (token: string) => {
  const entry = tables.denylist.find((candidate) => candidate.token === token);
  if (!entry) throw new Error(`no such deny token: ${token}`);
  return entry.hint;
};

describe("substitution", () => {
  it("counts each rule against the text as the previous rule left it", () => {
    const sites = new Map([
      ["skills/arena/SKILL.md", skill("arena", "Use the `Task` tool and the Task tool. Ask once with AskQuestion. Write to .cursor/skills/a.md and .cursor/hooks\n")],
      ["skills/swarm/SKILL.md", skill("swarm", "The Task tool again.\n")],
    ]);
    const { counts } = substitute(sites, tables.substitutions);
    expect(counts.map((count) => count.hits)).toEqual([1, 2, 1, 1, 0, 0, 0, 0, 0]);
  });

  it("renames the tool without touching the deny-gate survivors", () => {
    const sites = new Map([["skills/arena/SKILL.md", skill("arena", "the `Task` tool, the Task tool, AskQuestion\n")]]);
    const { sites: out } = substitute(sites, tables.substitutions);
    const text = out.get("skills/arena/SKILL.md") ?? "";
    expect(text).toContain("the `Agent` tool");
    expect(text).toContain("Agent tool");
    expect(text).toContain("AskUserQuestion");
    expect(deny(out, tables.denylist).filter((hit) => hit.token === "AskQuestion")).toHaveLength(0);
  });
});

describe("rewrite", () => {
  it("reports a miss when no sentence in the snapshot matches", () => {
    const sites = new Map([["skills/shipping/SKILL.md", skill("shipping", "unrelated prose\n")]]);
    const { sites: out, misses } = rewrite(sites, [{ source: "Drive the control-cli surface here.", replacement: "Drive the run built-in here." }]);
    expect(misses).toEqual([{ source: "Drive the control-cli surface here." }]);
    expect(out.get("skills/shipping/SKILL.md")).toContain("unrelated prose");
  });

  it("replaces every occurrence of the exact source sentence", () => {
    const source = "Use control-ui to confirm the render.";
    const sites = new Map([
      ["skills/poteto-mode/SKILL.md", skill("poteto-mode", `${source} Then ${source}\n`)],
      ["skills/shipping/SKILL.md", skill("shipping", "no mention\n")],
    ]);
    const { sites: out, applied } = rewrite(sites, [{ source, replacement: "Use the browser tool to confirm the render." }]);
    expect(applied).toEqual([{ source, count: 2 }]);
    expect(out.get("skills/poteto-mode/SKILL.md")).not.toContain("control-ui");
    expect(deny(out, tables.denylist).filter((hit) => hit.token === "control-ui")).toHaveLength(0);
  });
});

describe("model-slug placeholder normalization", () => {
  const entryFor = (needle: string) => {
    const entry = tables.rewrites.find((candidate) => candidate.source.includes(needle));
    if (!entry) throw new Error(`no ledger entry contains: ${needle}`);
    return entry;
  };

  it("substitute-then-rewrite erases the pinned default slug with no placeholder surviving", () => {
    const body = skill("architect", "Use your configured architect runners (defaults `claude-fable-5-1-thinking-max`, `gpt-5.6-sol-max`, `grok-4.6-fast-xhigh`, `claude-opus-5-thinking-xhigh`).\n");
    const sites = new Map([["skills/architect/SKILL.md", body]]);
    const { sites: substituted } = substitute(sites, tables.substitutions);
    const { sites: rewritten, misses } = rewrite(substituted, [entryFor("architect runners (defaults")]);
    const text = rewritten.get("skills/architect/SKILL.md") ?? "";
    expect(misses).toEqual([]);
    expect(text).toBe(skill("architect", "Use your configured architect runners (defaults: the models you configure per role).\n"));
    expect(text).not.toContain("PSTACK-MODEL-SLUG");
    expect(text).not.toContain("claude-fable-5-1-thinking-max");
  });

  it("survives a simulated upstream slug rename with a one-line substitution-pattern edit, not a ledger edit", () => {
    const body = skill("bug-fix", "Delegate implementation to a subagent using your configured bug-fix model (default `claude-fable-5-9-future-max`) with a specific scope; review the diff.\n");
    const sites = new Map([["skills/bug-fix/SKILL.md", body]]);
    const patched = tables.substitutions.map((rule) =>
      rule.id === "model-slug-1" ? { ...rule, pattern: "claude-fable-5-9-future-max" } : rule,
    );
    const { sites: substituted } = substitute(sites, patched);
    const { sites: rewritten, misses } = rewrite(substituted, [entryFor("configured bug-fix model")]);
    const text = rewritten.get("skills/bug-fix/SKILL.md") ?? "";
    expect(misses).toEqual([]);
    expect(text).toBe(skill("bug-fix", "Delegate implementation to a subagent using your configured bug-fix model with a specific scope; review the diff.\n"));
  });
});

describe("frontmatter", () => {
  it("strips the column-zero key and keeps the prose mention", () => {
    const sites = new Map([[
      "skills/automate-me/SKILL.md",
      "---\nname: automate-me\ndisable-model-invocation: true\n---\nKeep `disable-model-invocation: true` by default.\n",
    ]]);
    const { sites: out, stripped, anomalies } = frontmatter(sites);
    expect(stripped).toBe(1);
    expect(anomalies).toEqual([]);
    const text = out.get("skills/automate-me/SKILL.md") ?? "";
    expect(text).toBe("---\nname: automate-me\n---\nKeep `disable-model-invocation: true` by default.\n");
  });

  it("stamps only the principle leaves, inside the frontmatter", () => {
    const sites = new Map([
      ["skills/principle-laziness-protocol/SKILL.md", skill("laziness", "body\n")],
      ["skills/principle-prove-it-works/SKILL.md", skill("prove", "body\n")],
      ["skills/tdd/SKILL.md", skill("tdd", "body\n")],
    ]);
    const { sites: out, stripped, stamped, stampedPaths } = frontmatter(sites);
    expect(isLeaf("skills/principle-laziness-protocol/SKILL.md")).toBeTrue();
    expect(isLeaf("skills/tdd/SKILL.md")).toBeFalse();
    expect(stripped).toBe(3);
    expect(stamped).toBe(2);
    expect(stampedPaths).toEqual(["skills/principle-laziness-protocol/SKILL.md", "skills/principle-prove-it-works/SKILL.md"]);
    expect(out.get("skills/principle-laziness-protocol/SKILL.md")).toBe(
      "---\nname: laziness\nuser-invocable: false\n---\nbody\n",
    );
    expect(out.get("skills/tdd/SKILL.md")).not.toContain("user-invocable");
  });

  it("leaves a body without frontmatter byte-identical and still denies it", () => {
    const body = "Read .cursor/rules/imports and drive /goal here.\n";
    const sites = new Map([["skills/poteto-mode/playbooks/shipping.md", body]]);
    const { sites: out, stripped, anomalies } = frontmatter(sites);
    expect(stripped).toBe(0);
    expect(anomalies).toEqual([]);
    expect(out.get("skills/poteto-mode/playbooks/shipping.md")).toBe(body);
    expect(deny(out, tables.denylist).map((hit) => hit.token)).toEqual([".cursor/", "/goal"]);
  });

  it("flags frontmatter that never closes", () => {
    const sites = new Map([["skills/how/SKILL.md", "---\nname: how\ndisable-model-invocation: true\n"]]);
    const { anomalies, stripped } = frontmatter(sites);
    expect(anomalies).toEqual([{ path: "skills/how/SKILL.md", reason: "frontmatter never closes" }]);
    expect(stripped).toBe(0);
  });
});

describe("denylist", () => {
  it("names the file, the line, and the hint for every survivor", () => {
    const out = through({ "skills/orchestrate/SKILL.md": skill("orchestrate", "liveness\nread skill://how for the shape\nthe control-cli surface is gone\n") });
    expect(deny(out, tables.denylist)).toEqual([
      { path: "skills/orchestrate/SKILL.md", line: 5, token: "skill://", hint: hint("skill://"), origin: "added" },
      { path: "skills/orchestrate/SKILL.md", line: 6, token: "control-cli", hint: hint("control-cli"), origin: "carried" },
    ]);
  });

  it("counts two survivors on one line as two hits under their own tokens", () => {
    const out = through({ "skills/poteto-mode/SKILL.md": skill("poteto-mode", "drive control-cli and control-ui both\n") });
    expect(deny(out, tables.denylist).map((hit) => `${hit.line}:${hit.token}`)).toEqual(["4:control-cli", "4:control-ui"]);
  });

  it("matches OMP as a word so the forge stop-state literal is not a hit", () => {
    const sites = new Map([
      ["skills/poteto-mode/playbooks/babysit.md", "Stop at `COMPLETE`. A rearm sees `ADVANCE` then `COMPLETE` again.\n"],
      ["skills/poteto-mode/playbooks/orchestrate.md", "Nothing from OMP carries into this tree.\n"],
    ]);
    expect(deny(sites, tables.denylist)).toEqual([
      { path: "skills/poteto-mode/playbooks/orchestrate.md", line: 1, token: "OMP", hint: hint("OMP"), origin: "added" },
    ]);
  });

  it("sorts hits by path then line then token so reruns are byte-identical", () => {
    const out = through({
      "skills/swarm/SKILL.md": skill("swarm", ".cursor/hooks\n"),
      "skills/arena/SKILL.md": skill("arena", "Cursor cloud agent\n.goal line .cursor/hooks\n"),
    });
    expect(deny(out, tables.denylist).map((hit) => `${hit.path}:${hit.line}[${hit.token}]`)).toEqual([
      "skills/arena/SKILL.md:4[Cursor]",
      "skills/arena/SKILL.md:5[.cursor/]",
      "skills/swarm/SKILL.md:4[.cursor/]",
    ]);
  });
});

describe("the snapshot at the pinned sha", () => {
  it("scans 124 files and reports 10, 3, 6, 16, 2, 30, 12, 23, 10 in build-rule order", () => {
    expect(ground.report.scanned).toBe(124);
    expect(ground.report.counts.map((count) => count.hits)).toEqual([10, 3, 6, 16, 2, 30, 12, 23, 10]);
  });

  it("strips the key from 44 files and stamps exactly the 21 leaves", () => {
    expect(ground.report.stripped).toBe(44);
    expect(ground.report.stamped).toBe(21);
    expect(ground.report.leafGlob).toBe(21);
    expect(ground.report.stampedPaths).toHaveLength(21);
    expect(ground.report.anomalies).toEqual([]);
  });

  it("closes every survivor through the rewrite ledger", () => {
    expect(ground.report.rewriteEntries).toBe(125);
    expect(ground.report.rewriteApplied).toBe(136);
    expect(ground.report.misses).toEqual([]);
    expect(ground.report.carried).toMatchObject({ hits: 0, files: 0 });
    expect(ground.report.added).toMatchObject({ hits: 0, files: 0 });
    expect(ground.report.hits).toEqual([]);
  });

  it("keeps the Claude-native dispatch tokens the tree is meant to carry", () => {
    const merged = [...ground.tree.values()].join("");
    expect((merged.match(/subagent_type/g) || []).length).toBe(14);
    expect((merged.match(/`Agent`/g) || []).length).toBe(10);
    expect(merged).not.toContain("`Task`");
    const bareTask = [...merged.matchAll(/\bTask\b/g)];
    expect(bareTask).toHaveLength(1);
    expect(/<Task as a verb phrase>/.test(merged)).toBeTrue();
    expect(merged).not.toContain("skill://");
    expect(merged).not.toContain("\r");
  });

  it("carries every script the prose points at, so nothing sits outside the scan set", () => {
    expect(ground.report.unscannedFiles).toBe(0);
    expect(ground.report.unscannedHits).toEqual([]);
  });

  it("renders byte-identical reports across runs", async () => {
    const again = await generate({ snapshotDir: join(REPO_ROOT, DEFAULTS.snapshot), tableDir: TABLES });
    expect(formatReport(again.report)).toBe(formatReport(ground.report));
  });
});

describe("a poisoned fixture halts the report", () => {
  it("lists the planted tokens as hits and renders them in the report", async () => {
    const dir = tree({
      "skills/poteto-mode/SKILL.md": skill("poteto-mode", "drive control-cli and skill://how\n"),
      "agents/poteto-agent.md": "---\nname: poteto-agent\ndescription: poteto's style\n---\nbody\n",
      "skills/poteto-mode/scripts/watch-pr/watch-pr": "#!/usr/bin/env bun\n",
    });
    const { report } = await generate({ snapshotDir: dir, tableDir: TABLES });
    expect(report.hits.map((hit) => `${hit.path}:${hit.line}[${hit.token}]`)).toEqual([
      "skills/poteto-mode/SKILL.md:4[control-cli]",
      "skills/poteto-mode/SKILL.md:4[skill://]",
    ]);
    expect(formatReport(report)).toContain("deny total hits 2 files 1");
  });
});

describe("the rewrite ledger at the pin", () => {
  const SLUG_SHAPE = /\b(?:claude|grok|gpt)-[a-z0-9]+(?:[-.][a-z0-9]+)*\b/g;
  function phrases(line: string): string[] {
    const hits = [...line.matchAll(/[A-Za-z][A-Za-z0-9'’-]*/g)];
    const out: string[] = [];
    for (let i = 0; i + 3 < hits.length; i++) {
      if (hits[i + 3].index - hits[i].index > 60) continue;
      out.push(hits.slice(i, i + 4).map((m) => m[0]).join(" "));
    }
    return out;
  }
  const tally = (list: string[]) => {
    const map = new Map<string, number>();
    for (const phrase of list) map.set(phrase, (map.get(phrase) ?? 0) + 1);
    return map;
  };

  it("ships no vendor model slug, even one absent from the deny table", () => {
    const leaked: string[] = [];
    for (const [path, text] of ground.tree) for (const match of text.matchAll(SLUG_SHAPE)) leaked.push(`${path} ${match[0]}`);
    expect(leaked).toEqual([]);
  });

  it("keeps the hide key out of every generated frontmatter and stamps only the 21 leaves", () => {
    const kept: string[] = [];
    for (const [path, text] of ground.tree) {
      if (!text.startsWith("---\n")) continue;
      if (text.slice(4, text.indexOf("\n---", 4)).includes("disable-model-invocation")) kept.push(path);
    }
    expect(kept).toEqual([]);
    expect(ground.report.stampedPaths).toHaveLength(21);
    for (const path of ground.report.stampedPaths) expect(ground.tree.get(path)).toContain("user-invocable: false");
  });

  it("holds every entry single-line unless flagged as a script block, distinct from its source, and free of deny tokens", () => {
    const bad: string[] = [];
    for (const entry of tables.rewrites) {
      if (!entry.replacement || entry.source === entry.replacement) bad.push(entry.source.slice(0, 50));
      if (entry.kind !== "block" && (entry.source.includes("\n") || entry.replacement.includes("\n"))) bad.push(entry.source.slice(0, 50));
    }
    expect(bad).toEqual([]);
    expect(deny(new Map(tables.rewrites.map((entry, i) => [`entry-${i}`, entry.replacement])), tables.denylist)).toEqual([]);
  });

  it("never lets a replacement repeat a clause the untouched tail already states", async () => {
    const post = frontmatter((await substitute(await scanSnapshot(SNAPSHOT, tables.scan), tables.substitutions)).sites).sites;
    const repeated: string[] = [];
    for (const entry of tables.rewrites) {
      for (const [path, text] of post) {
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (!lines[i].includes(entry.source)) continue;
          const rendered = lines[i].split(entry.source).join(entry.replacement);
          const before = tally(phrases(lines[i]));
          const after = tally(phrases(rendered));
          for (const [phrase, n] of after) if (n >= 2 && n > (before.get(phrase) ?? 0)) repeated.push(`${path}:${i + 1} ${phrase}`);
        }
      }
    }
    expect(repeated).toEqual([]);
  });
});

describe("renderManifests", () => {
  it("renders both manifests exactly against the pinned upstream metadata", async () => {
    const upstream = JSON.parse(await Bun.file(join(SNAPSHOT, ".cursor-plugin/plugin.json")).text());
    const version = await readUpstreamVersion(REPO_ROOT);
    const agentPaths = [...ground.tree.keys()].filter((path) => path.startsWith("agents/") && path.endsWith(".md")).sort();
    const { plugin, marketplace } = renderManifests({ version }, upstream, agentPaths);
    expect(plugin).toEqual({
      name: "pstack",
      displayName: "pstack (Claude Code port)",
      version: "0.14.7",
      description: `${upstream.description} Generated by tools/claude/apply.mjs from upstream/pstack at the pin in UPSTREAM.md.`,
      author: { name: "Lauren Tan" },
      license: "MIT",
      logo: "assets/logo.png",
      keywords: upstream.keywords,
      skills: "./skills/",
      agents: ["./agents/comment-sicko.md", "./agents/poteto-agent.md"],
    });
    expect(marketplace).toEqual({
      name: "pstack-port",
      owner: { name: "pstack-port" },
      description: "Claude Code port of pstack, generated from the pinned snapshot in upstream/pstack.",
      plugins: [
        {
          name: "pstack",
          source: "./plugins/pstack",
          description: upstream.description,
          version: "0.14.7",
          author: { name: "Lauren Tan (original)" },
          license: "MIT",
          keywords: upstream.keywords,
        },
      ],
    });
  });
});

describe("the emitted tree at the pin", () => {
  it("carries zero disable-model-invocation keys and exactly 21 user-invocable keys", () => {
    expect(frontmatterKeyCount(ground.tree, "disable-model-invocation")).toEqual([]);
    expect(frontmatterKeyCount(ground.tree, "user-invocable")).toHaveLength(21);
  });

  it("contains no commands directory", () => {
    expect([...ground.tree.keys()].some((path) => path === "commands" || path.startsWith("commands/"))).toBeFalse();
  });
});

describe("write mode", () => {
  it("writes the stamped leaf to disk", () => {
    const { sites } = frontmatter(new Map([["skills/principle-laziness-protocol/SKILL.md", skill("laziness", "body\n")]]));
    const outputRoot = mkdtempSync(join(tmpdir(), "claude-write-"));
    writeTree(outputRoot, sites, {});
    const written = readFileSync(join(outputRoot, "skills/principle-laziness-protocol/SKILL.md"), "utf8");
    expect(written).toContain("user-invocable: false");
  });

  it("is idempotent, then prunes a file dropped from the tree", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "claude-write-"));
    const full = new Map([["skills/x/SKILL.md", "a\n"], ["skills/y/SKILL.md", "b\n"]]);
    const first = writeTree(outputRoot, full, {});
    expect(first).toEqual({ written: 2, unchanged: 0, pruned: 0 });
    const second = writeTree(outputRoot, full, {});
    expect(second).toEqual({ written: 0, unchanged: 2, pruned: 0 });
    const shrunk = new Map([["skills/x/SKILL.md", "a\n"]]);
    const third = writeTree(outputRoot, shrunk, {});
    expect(third).toEqual({ written: 0, unchanged: 1, pruned: 1 });
    expect(existsSync(join(outputRoot, "skills/y/SKILL.md"))).toBeFalse();
    expect(existsSync(join(outputRoot, "skills/y"))).toBeFalse();
  });

  it("preserves the executable bit from the snapshot source", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "claude-write-"));
    const map = new Map([["skills/poteto-mode/scripts/worktree-audit.sh", "#!/usr/bin/env bash\necho hi\n"]]);
    writeTree(outputRoot, map, { snapshotDir: SNAPSHOT });
    const mode = require("node:fs").statSync(join(outputRoot, "skills/poteto-mode/scripts/worktree-audit.sh")).mode;
    expect(mode & 0o111).not.toBe(0);
  });
});

describe("a poisoned fixture halts before any write", () => {
  it("exits nonzero and reports the hit without touching the output tree", () => {
    const dir = tree({
      "skills/poteto-mode/SKILL.md": skill("poteto-mode", "drive control-cli here\n"),
      "skills/poteto-mode/scripts/watch-pr/watch-pr": "#!/usr/bin/env bun\n",
    });
    const outRoot = mkdtempSync(join(tmpdir(), "claude-halt-"));
    const outputRoot = join(outRoot, "plugins/pstack");
    const marketplacePath = join(outRoot, ".claude-plugin/marketplace.json");
    const result = Bun.spawnSync(
      ["bun", "tools/claude/apply.mjs", "--snapshot", dir, "--tables", TABLES, "--output", outputRoot, "--marketplace", marketplacePath],
      { cwd: REPO_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    expect(result.stderr.toString()).toBe("");
    expect(result.exitCode).toBe(1);
    expect(result.stdout.toString()).toContain("control-cli");
    expect(existsSync(outputRoot)).toBeFalse();
    expect(existsSync(marketplacePath)).toBeFalse();
  });
});

describe("the emitted plan checker agrees with the emitted skeleton", () => {
  const skeletonMatch = /````markdown\n(.*)\n````/s.exec(
    ground.tree.get("skills/poteto-mode/playbooks/multi-phase-plan.md") ?? "",
  );
  if (!skeletonMatch) throw new Error("multi-phase-plan.md has no fenced skeleton to extract");
  const skeleton = skeletonMatch[1];
  const checker = join(REPO_ROOT, DEFAULTS.output, "skills/poteto-mode/scripts/check-plan.mjs");

  function run(text: string) {
    const dir = mkdtempSync(join(tmpdir(), "claude-checkplan-"));
    const file = join(dir, "plan.md");
    writeFileSync(file, `${text}\n`);
    return Bun.spawnSync(["node", checker, file], { stdout: "pipe", stderr: "pipe" });
  }

  it("accepts the skill's own skeleton, unmodified", () => {
    const result = run(skeleton);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("0 problems");
  });

  it("rejects the skeleton with the lane sentence removed", () => {
    const lanes = "Ten lanes on the worker model you configured under `swarm workers`, at the PR head, per the boot recipe.";
    expect(skeleton).toContain(lanes);
    const result = run(skeleton.replace(lanes, ""));
    expect(result.exitCode).toBe(1);
    expect(result.stdout.toString()).toContain("1 problems");
  });

  it("rejects the skeleton with the /loop marker removed", () => {
    expect(skeleton).toContain("/loop");
    const result = run(skeleton.replace("a real terminal `/loop`", "a real terminal command"));
    expect(result.exitCode).toBe(1);
    expect(result.stdout.toString()).toContain("1 problems");
  });
});

describe("C4 hooks and models policy", () => {
  const HOOKS = join(REPO_ROOT, DEFAULTS.output, "hooks");
  const mandate = readFileSync(join(HOOKS, "session-start-context.md"), "utf8");
  const modelsPolicy = JSON.parse(readFileSync(join(REPO_ROOT, DEFAULTS.output, "models.json"), "utf8"));

  it("run-hook.cmd's session-start leg prints the mandate file verbatim", () => {
    const result = Bun.spawnSync(["bash", join(HOOKS, "run-hook.cmd"), "session-start"], { cwd: HOOKS, stdout: "pipe", stderr: "pipe" });
    expect(result.stderr.toString()).toBe("");
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toBe(mandate);
  });

  it("the bare session-start script prints the same mandate", () => {
    const result = Bun.spawnSync(["bash", join(HOOKS, "session-start")], { cwd: HOOKS, stdout: "pipe", stderr: "pipe" });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toBe(mandate);
  });

  it("carries none of the ten dialect-guard tokens", () => {
    const banned = ["skill://", "OMP", "control-cli", "control-ui", "/goal", "the Task tool", "subagent_type", "Cursor", "cloud agent", ".cursor/"];
    for (const token of banned) expect(mandate).not.toContain(token);
  });

  it("the five hand-carried hook and policy files clear the denylist", () => {
    const files: Record<string, string> = {
      "hooks/hooks.json": readFileSync(join(HOOKS, "hooks.json"), "utf8"),
      "hooks/session-start": readFileSync(join(HOOKS, "session-start"), "utf8"),
      "hooks/run-hook.cmd": readFileSync(join(HOOKS, "run-hook.cmd"), "utf8"),
      "hooks/session-start-context.md": mandate,
      "models.json": JSON.stringify(modelsPolicy),
    };
    expect(deny(Object.entries(files), tables.denylist)).toEqual([]);
  });

  it("models.json covers every role setup-pstack's template names", () => {
    const setupPstack = ground.tree.get("skills/setup-pstack/SKILL.md") ?? "";
    const roleLines = [...setupPstack.matchAll(/^([a-z][a-z ,-]+): <detected-/gm)].map((m) => m[1]);
    expect(roleLines).toHaveLength(18);
    for (const role of roleLines) expect(modelsPolicy.roles).toHaveProperty(role);
    expect(Object.keys(modelsPolicy.roles)).toHaveLength(roleLines.length);
  });

  it("every models.json role is a non-empty array of non-empty strings", () => {
    for (const [role, values] of Object.entries(modelsPolicy.roles as Record<string, unknown>)) {
      expect(Array.isArray(values)).toBe(true);
      expect((values as unknown[]).length).toBeGreaterThan(0);
      for (const value of values as unknown[]) {
        expect(typeof value).toBe("string");
        expect((value as string).length).toBeGreaterThan(0);
      }
    }
  });
});
