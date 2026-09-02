#!/usr/bin/env bun
// Proves the session-start injector loads, fires once, and stays quiet on a
// branch that already carries the mandate.
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

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadExtensions } from "../../refs/omp-src/packages/coding-agent/src/extensibility/extensions/loader.ts";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(repo, "extensions", "pstack-autofire.ts");
const MANDATE_TYPE = "com.pstack.poteto-mode.mandate";

const { extensions, errors } = await loadExtensions([entry], repo);
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

if (failed.length > 0) {
	for (const f of failed) console.error(`FAIL ${f}`);
	process.exit(1);
}
console.log("autofire check: injects once, silent on re-entry");
