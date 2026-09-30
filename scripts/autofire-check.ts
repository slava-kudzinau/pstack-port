#!/usr/bin/env bun
// Proves the session-start injector loads, fires once, and stays quiet on a
// branch that already carries the mandate, and that the command bridge registers
// every /pstack:<name> through the same loader a live session uses.
//
// This matters because almost every skill in this package hides itself from the
// system prompt listing. Without the injector the model has no reason to read
// `skill://poteto-mode`, and the plugin is reachable only through an explicit
// slash command.
// loadExtensions binds a factory into an Extension whose handlers map is keyed by
// event name (refs/omp-src/packages/coding-agent/src/extensibility/extensions/types.ts:1739-1743).
// before_agent_start may return one custom message (types.ts:1263, :1141-1142).
// ctx.sessionManager is read-only (:471) and getBranch() returns the current path
// (refs/omp-src/packages/coding-agent/src/session/session-manager.ts:2563).

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadExtensions } from "../refs/omp-src/packages/coding-agent/src/extensibility/extensions/loader.ts";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(repo, "plugin");
const entry = join(plugin, "extensions", "pstack-autofire.ts");
const bridgeEntry = join(plugin, "extensions", "pstack-commands.ts");
const MANDATE_TYPE = "com.pstack.poteto-mode.mandate";

const { extensions, errors } = await loadExtensions([entry, bridgeEntry], plugin);
const failed: string[] = [];
for (const e of errors) failed.push(`load error ${e.path}: ${e.error}`);

const handler = extensions[0]?.handlers.get("before_agent_start")?.[0];
if (handler === undefined) failed.push("no before_agent_start handler registered");

if (failed.length === 0) {
	const notices: string[] = [];
	const ctx = {
		sessionManager: { getBranch: () => [] },
		ui: { notify: (message: string) => notices.push(message) },
	};
	const event = { type: "before_agent_start", prompt: "hi", systemPrompt: [] };

	const injected = await handler(event, ctx);
	const content = injected?.message?.content ?? "";
	if (injected?.message?.customType !== MANDATE_TYPE) failed.push("first call returned no mandate customType");
	if (!content.includes("<EXTREMELY_IMPORTANT>")) failed.push("mandate text lost its opening tag");
	if (!content.includes("skill://poteto-mode")) failed.push("mandate text lost its entry pointer");

	const onBranch = {
		...ctx,
		sessionManager: { getBranch: () => [{ type: "custom", customType: MANDATE_TYPE }] },
	};
	if ((await handler(event, onBranch)) !== undefined) failed.push("mandate re-injected on a branch that already carries it");
	if (notices.length > 0) failed.push(`unexpected notify: ${notices.join("; ")}`);
}

// The manifest list, not a directory scan, binds extensions: a file present on
// disk but absent from package.json loads in no session
// (refs/omp-src/packages/coding-agent/src/extensibility/extensions/loader.ts:518-530).
const pkg: unknown = JSON.parse(readFileSync(join(plugin, "package.json"), "utf-8"));
const omp = typeof pkg === "object" && pkg !== null && "omp" in pkg ? pkg.omp : undefined;
const declared = typeof omp === "object" && omp !== null && "extensions" in omp && Array.isArray(omp.extensions) ? omp.extensions : [];
for (const rel of ["./extensions/pstack-autofire.ts", "./extensions/pstack-commands.ts"])
	if (!declared.includes(rel)) failed.push(`package.json does not declare ${rel}`);

const bridge = extensions.find((e) => String(e.path).endsWith("pstack-commands.ts"));
if (!bridge) failed.push("pstack-commands extension did not load");
else {
	const templates = readdirSync(join(plugin, "command-templates")).filter((f) => f.endsWith(".md"));
	if (bridge.commands.size === 0) failed.push("command bridge registered no commands");
	for (const t of templates) {
		const name = `pstack:${t.replace(/\.md$/, "")}`;
		const cmd = bridge.commands.get(name);
		if (!cmd) failed.push(`${name} not registered`);
		else if (typeof cmd.handler !== "function") failed.push(`${name} has no handler`);
		else if (!cmd.description) failed.push(`${name} has no description`);
	}
	const expected = new Set(templates.map((t) => `pstack:${t.replace(/\.md$/, "")}`));
	for (const name of bridge.commands.keys()) if (!expected.has(name)) failed.push(`registered ${name} has no template`);
	const how = bridge.commands.get("pstack:how");
	if (how?.description !== "Explain how a subsystem or flow works.") failed.push(`pstack:how description drifted: ${JSON.stringify(how?.description)}`);
}

if (failed.length > 0) {
	for (const f of failed) console.error(`FAIL ${f}`);
	process.exit(1);
}
console.log("autofire check: injects once, silent on re-entry");
