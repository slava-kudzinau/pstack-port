import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { main } from "./claude-check.ts";

const dirs: string[] = [];
afterEach(() => {
	for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const VALID_LEAF = "---\nname: principle-laziness-protocol\nuser-invocable: false\n---\nbody\n";
const VALID_SKILL = "---\nname: how\n---\nbody\n";
const VALID_PLUGIN_MANIFEST = JSON.stringify({ name: "pstack", version: "0.14.7", skills: "./skills/", agents: ["./agents/poteto-agent.md"] });
const VALID_MARKETPLACE = JSON.stringify({ name: "pstack-port", plugins: [{ name: "pstack", source: "./plugins/pstack" }] });

function fixture(overrides: Partial<{ leaf: string; skill: string; pluginManifest: string; marketplace: string; commandsDir: boolean }> = {}) {
	const root = mkdtempSync(join(tmpdir(), "claude-check-"));
	dirs.push(root);
	const pluginRoot = join(root, "plugins/pstack");
	mkdirSync(join(pluginRoot, "skills/principle-laziness-protocol"), { recursive: true });
	mkdirSync(join(pluginRoot, "skills/how"), { recursive: true });
	mkdirSync(join(pluginRoot, ".claude-plugin"), { recursive: true });
	mkdirSync(join(pluginRoot, "agents"), { recursive: true });
	if (overrides.commandsDir) mkdirSync(join(pluginRoot, "commands"), { recursive: true });
	writeFileSync(join(pluginRoot, "skills/principle-laziness-protocol/SKILL.md"), overrides.leaf ?? VALID_LEAF);
	writeFileSync(join(pluginRoot, "skills/how/SKILL.md"), overrides.skill ?? VALID_SKILL);
	writeFileSync(join(pluginRoot, "agents/poteto-agent.md"), "agent body\n");
	writeFileSync(join(pluginRoot, ".claude-plugin/plugin.json"), overrides.pluginManifest ?? VALID_PLUGIN_MANIFEST);
	const marketplacePath = join(root, ".claude-plugin/marketplace.json");
	mkdirSync(join(root, ".claude-plugin"), { recursive: true });
	writeFileSync(marketplacePath, overrides.marketplace ?? VALID_MARKETPLACE);
	return { pluginRoot, marketplacePath };
}

describe("claude-check", () => {
	it("passes a valid fixture tree", () => {
		const { pluginRoot, marketplacePath } = fixture();
		expect(main({ pluginRoot, marketplacePath })).toBe(0);
	});

	it("rejects a commands/ directory", () => {
		const { pluginRoot, marketplacePath } = fixture({ commandsDir: true });
		const errors: string[] = [];
		const spy = console.error;
		console.error = (msg: string) => errors.push(msg);
		try {
			expect(main({ pluginRoot, marketplacePath })).toBe(1);
		} finally {
			console.error = spy;
		}
		expect(errors.some((e) => e.includes("commands/"))).toBe(true);
	});

	it("rejects a surviving disable-model-invocation key", () => {
		const { pluginRoot, marketplacePath } = fixture({ skill: "---\nname: how\ndisable-model-invocation: true\n---\nbody\n" });
		const errors: string[] = [];
		const spy = console.error;
		console.error = (msg: string) => errors.push(msg);
		try {
			expect(main({ pluginRoot, marketplacePath })).toBe(1);
		} finally {
			console.error = spy;
		}
		expect(errors.some((e) => e.includes("skills/how/SKILL.md") && e.includes("disable-model-invocation"))).toBe(true);
	});

	it("rejects a principle leaf missing its user-invocable stamp", () => {
		const { pluginRoot, marketplacePath } = fixture({ leaf: "---\nname: principle-laziness-protocol\n---\nbody\n" });
		const errors: string[] = [];
		const spy = console.error;
		console.error = (msg: string) => errors.push(msg);
		try {
			expect(main({ pluginRoot, marketplacePath })).toBe(1);
		} finally {
			console.error = spy;
		}
		expect(errors.some((e) => e.includes("principle-laziness-protocol/SKILL.md") && e.includes("missing user-invocable stamp"))).toBe(true);
	});

	it("rejects a user-invocable stamp outside the principle-* leaves", () => {
		const { pluginRoot, marketplacePath } = fixture({ skill: "---\nname: how\nuser-invocable: false\n---\nbody\n" });
		const errors: string[] = [];
		const spy = console.error;
		console.error = (msg: string) => errors.push(msg);
		try {
			expect(main({ pluginRoot, marketplacePath })).toBe(1);
		} finally {
			console.error = spy;
		}
		expect(errors.some((e) => e.includes("skills/how/SKILL.md") && e.includes("outside the 21 principle-* leaves"))).toBe(true);
	});

	it("rejects a denylist token surviving in the tree", () => {
		const { pluginRoot, marketplacePath } = fixture({ skill: "---\nname: how\n---\nRead skill://how for details.\n" });
		const errors: string[] = [];
		const spy = console.error;
		console.error = (msg: string) => errors.push(msg);
		try {
			expect(main({ pluginRoot, marketplacePath })).toBe(1);
		} finally {
			console.error = spy;
		}
		expect(errors.some((e) => e.includes("skills/how/SKILL.md") && e.includes("denylist token"))).toBe(true);
	});

	it("rejects a plugin manifest with agents as a bare directory string", () => {
		const { pluginRoot, marketplacePath } = fixture({ pluginManifest: JSON.stringify({ name: "pstack", version: "0.14.7", skills: "./skills/", agents: "./agents/" }) });
		const errors: string[] = [];
		const spy = console.error;
		console.error = (msg: string) => errors.push(msg);
		try {
			expect(main({ pluginRoot, marketplacePath })).toBe(1);
		} finally {
			console.error = spy;
		}
		expect(errors.some((e) => e.includes("agents must be an array of file paths"))).toBe(true);
	});

	it("rejects an unparseable marketplace manifest", () => {
		const { pluginRoot, marketplacePath } = fixture({ marketplace: "{not json" });
		const errors: string[] = [];
		const spy = console.error;
		console.error = (msg: string) => errors.push(msg);
		try {
			expect(main({ pluginRoot, marketplacePath })).toBe(1);
		} finally {
			console.error = spy;
		}
		expect(errors.some((e) => e.includes("marketplace.json: invalid JSON"))).toBe(true);
	});
});
