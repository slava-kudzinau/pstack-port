import { expect, it, describe } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { DEFAULTS, REPO_ROOT, deny, formatReport, frontmatter, generate, isLeaf, loadTables, rewrite, substitute } from "./apply.mjs";

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

describe("substitution", () => {
  it("counts each rule against the text as the previous rule left it", () => {
    const sites = new Map([
      ["skills/arena/SKILL.md", skill("arena", "Use the `Task` tool and the Task tool. Ask once with AskQuestion. Write to .cursor/skills/a.md and .cursor/rules/b.mdc and .cursor/hooks\n")],
      ["skills/swarm/SKILL.md", skill("swarm", "The Task tool again.\n")],
    ]);
    const { counts } = substitute(sites, tables.substitutions);
    expect(counts.map((count) => count.hits)).toEqual([1, 2, 1, 1, 1]);
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
      { path: "skills/orchestrate/SKILL.md", line: 5, token: "skill://", hint: tables.denylist[8].hint, origin: "added" },
      { path: "skills/orchestrate/SKILL.md", line: 6, token: "control-cli", hint: tables.denylist[0].hint, origin: "carried" },
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
      { path: "skills/poteto-mode/playbooks/orchestrate.md", line: 1, token: "OMP", hint: tables.denylist[9].hint, origin: "added" },
    ]);
  });

  it("sorts hits by path then line then token so reruns are byte-identical", () => {
    const out = through({
      "skills/swarm/SKILL.md": skill("swarm", ".cursor/hooks\n"),
      "skills/arena/SKILL.md": skill("arena", "Cursor cloud agent\n.goal line .cursor/hooks\n"),
    });
    expect(deny(out, tables.denylist).map((hit) => `${hit.path}:${hit.line}[${hit.token}]`)).toEqual([
      "skills/arena/SKILL.md:4[Cursor cloud agent]",
      "skills/arena/SKILL.md:5[.cursor/]",
      "skills/swarm/SKILL.md:4[.cursor/]",
    ]);
  });
});

describe("the snapshot at the pinned sha", () => {
  it("scans 104 files and reports 10, 3, 6, 16, 7 in build-rule order", () => {
    expect(ground.report.scanned).toBe(104);
    expect(ground.report.counts.map((count) => count.hits)).toEqual([10, 3, 6, 16, 7]);
  });

  it("strips the key from 44 files and stamps exactly the 21 leaves", () => {
    expect(ground.report.stripped).toBe(44);
    expect(ground.report.stamped).toBe(21);
    expect(ground.report.leafGlob).toBe(21);
    expect(ground.report.stampedPaths).toHaveLength(21);
    expect(ground.report.anomalies).toEqual([]);
  });

  it("halts on 33 carried hits in 17 files plus the one prose hide-key mention", () => {
    expect(ground.report.carried).toMatchObject({ hits: 33, files: 17 });
    expect(ground.report.added).toMatchObject({ hits: 1, files: 1 });
    expect(ground.report.hits.filter((hit) => hit.token === "disable-model-invocation")).toEqual([
      { path: "skills/automate-me/SKILL.md", line: 72, token: "disable-model-invocation", hint: tables.denylist[7].hint, origin: "added" },
    ]);
  });

  it("keeps the Claude-native dispatch tokens the tree is meant to carry", () => {
    const merged = [...ground.tree.values()].join("");
    expect((merged.match(/subagent_type/g) || []).length).toBe(14);
    expect((merged.match(/`Agent`/g) || []).length).toBe(10);
    expect(merged).not.toContain("`Task`");
    expect(merged).not.toContain("skill://");
    expect(merged).not.toContain("\r");
  });

  it("surfaces the files outside the scan set that carry deny hits", () => {
    expect(ground.report.unscannedHits.map((hit) => `${hit.path}:${hit.line}[${hit.token}]`)).toEqual([
      "skills/poteto-mode/scripts/check-plan.mjs:20[/goal]",
      "skills/poteto-mode/scripts/worktree-audit.sh:25[.cursor/]",
      "skills/poteto-mode/scripts/worktree-audit.sh:27[.cursor/]",
    ]);
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
    });
    const { report } = await generate({ snapshotDir: dir, tableDir: TABLES });
    expect(report.hits.map((hit) => `${hit.path}:${hit.line}[${hit.token}]`)).toEqual([
      "skills/poteto-mode/SKILL.md:4[control-cli]",
      "skills/poteto-mode/SKILL.md:4[skill://]",
    ]);
    expect(formatReport(report)).toContain("deny total hits 2 files 1");
  });
});
