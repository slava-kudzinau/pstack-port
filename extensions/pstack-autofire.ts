// Session-start mandate injector.
//
// Injects hooks/session-start-context.md once per branch, and re-injects after
// /clear or a compaction, which prunes the branch. Subagents spawned through
// `task` start blank and load no extensions of their own, so the mandate steers
// the orchestrating session only.
//
// Why this exists: every playbook and principle skill carries a top-level hide
// flag, so the system prompt listing shows almost none of them. Without this
// injector the model has no reason to ever read `skill://poteto-mode`, and the
// plugin is reachable only through /pstack:poteto-mode.
//
// API evidence. on("before_agent_start") takes a handler whose result may carry
// one custom message
// (refs/omp-src/packages/coding-agent/src/extensibility/extensions/types.ts:1263,
// result shape at :1141-1142). ctx.sessionManager is read-only
// (types.ts:471) and getBranch() returns the current path
// (refs/omp-src/packages/coding-agent/src/session/session-manager.ts:2563).
// Custom entries carry customType, the same shape the loader's own extensions
// use (refs/omp-src/packages/coding-agent/src/vibe/runtime.ts:749).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

const MANDATE_TYPE = "com.pstack.poteto-mode.mandate";

export default function pstackAutofire(pi: ExtensionAPI) {
	const sheet = join(dirname(fileURLToPath(import.meta.url)), "..", "hooks", "session-start-context.md");

	pi.on("before_agent_start", async (_event, ctx) => {
		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry.type === "custom" && entry.customType === MANDATE_TYPE) return;
		}
		if (!existsSync(sheet)) {
			ctx.ui.notify("pstack: session-start-context.md missing", "warning");
			return;
		}
		return {
			message: {
				customType: MANDATE_TYPE,
				content: readFileSync(sheet, "utf8"),
				attribution: "pstack",
			},
		};
	});
}
