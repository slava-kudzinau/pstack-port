// Command bridge. Registers every /pstack:<name> slash command from the
// bodies in ../command-templates/<name>.md.
//
// Why this exists: OMP derives a file command's slash name from its filename
// (refs/omp-src/packages/coding-agent/src/discovery/omp-plugins.ts:91-99), so the
// namespace used to live in the filename itself (`commands/pstack:how.md`).
// NTFS forbids ':' in filenames, so those files could never be checked out on
// Windows boxes. registerCommand takes the name as a string
// (refs/omp-src/packages/coding-agent/src/extensibility/extensions/types.ts:1362-1370,
// handler shape :1188-1193), so the namespace survives the rename, and
// sendUserMessage starts the turn with the expanded prompt (:1431-1435).
//
// Semantics mirror core file-command expansion, citation by citation: dispatch
// splits at the first space and hands the handler the raw argument string
// (refs/omp-src/packages/coding-agent/src/session/agent-session.ts:6190-6196);
// the quote-collapsing split, $@/$ARGUMENTS/$N substitution (non-recursive by
// design, so argument values are never re-scanned) and the no-placeholder
// append are mirrored below from
// refs/omp-src/.../utils/command-args.ts:1-32,41-73 and
// refs/omp-src/.../config/prompt-templates.ts:52-72; the menu description falls
// back from frontmatter to the first body line truncated at 60, mirrored from
// refs/omp-src/.../extensibility/slash-commands.ts:43-52. Whitespace-only
// divergence from core expansion is accepted. Templates must not carry
// `{{ }}` handlebars; scripts/conformance.ts enforces that, because this
// bridge renders bodies as plain text.
//
// Headless parity beyond the mirror: a file command ran its expansion as the
// caller's own turn, so `omp -p "/pstack:how ..."` printed the reply. The
// bridge's scheduled send is a separate turn print mode never emits
// (refs/omp-src/.../modes/print-mode.ts:114-126), so the handler holds
// dispatch until that turn settles; see the handler comment.

import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

const NAMESPACE = "pstack";

/** Headline inline-arg placeholder test, mirrored from prompt-templates.ts:52-61. */
const INLINE_ARG_PATTERN = /\$(?:ARGUMENTS|@(?:\[\d+(?::\d*)?\])?|\d+)/;

/** Substitution pattern mirrored from command-args.ts:45; global, as there. */
const SUBSTITUTE_PATTERN = /\$@\[(\d+)(?::(\d*)?)?\]|\$ARGUMENTS|\$@|\$(\d+)/g;

/** Split on whitespace, quoted runs collapse to one arg (command-args.ts:1-32). */
function parseCommandArgs(argsString: string): string[] {
	const args: string[] = [];
	let current = "";
	let inQuote: string | null = null;
	for (const char of argsString) {
		if (inQuote) {
			if (char === inQuote) inQuote = null;
			else current += char;
		} else if (char === '"' || char === "'") {
			inQuote = char;
		} else if (char === " " || char === "\t") {
			if (current) {
				args.push(current);
				current = "";
			}
		} else {
			current += char;
		}
	}
	if (current) args.push(current);
	return args;
}

/** Replace $N, $@, $ARGUMENTS, $@[start:len] on the template text only (command-args.ts:41-73). */
function substituteArgs(content: string, args: string[]): string {
	const allArgs = args.join(" ");
	return content.replace(SUBSTITUTE_PATTERN, (match, startRaw?: string, lengthRaw?: string, positionalNum?: string) => {
		if (positionalNum !== undefined) return args[Number.parseInt(positionalNum, 10) - 1] ?? "";
		if (startRaw !== undefined) {
			const start = Number.parseInt(startRaw, 10);
			if (!Number.isFinite(start) || start < 1) return "";
			const startIndex = start - 1;
			if (startIndex >= args.length) return "";
			const length = lengthRaw === undefined || lengthRaw === "" ? undefined : Number.parseInt(lengthRaw, 10);
			if (length === undefined) return args.slice(startIndex).join(" ");
			if (!Number.isFinite(length) || length <= 0) return "";
			return args.slice(startIndex, startIndex + length).join(" ");
		}
		return allArgs;
	});
}

/** Append the raw args when the template used no placeholder (prompt-templates.ts:63-72). */
function appendArgsFallback(rendered: string, argsText: string, usesPlaceholders: boolean): string {
	if (argsText.length === 0 || usesPlaceholders) return rendered;
	if (rendered.length === 0) return argsText;
	return `${rendered}\n\n${argsText}`;
}

/** Frontmatter head split; YAML-lite: flat or single/double-quoted scalars only. */
function splitHead(text: string): { frontmatter: string; body: string } {
	if (!text.startsWith("---\n")) return { frontmatter: "", body: text };
	const close = text.indexOf("\n---", 3);
	if (close === -1) return { frontmatter: "", body: text };
	return { frontmatter: text.slice(4, close), body: text.slice(close + 4).replace(/^\n+/, "") };
}

/** description: from the head, else the first body line at 60 chars (slash-commands.ts:43-52). */
function menuDescription(frontmatter: string, body: string): string {
	const raw = /^description:[ \t]*(.+?)[ \t]*$/m.exec(frontmatter)?.[1];
	if (raw !== undefined) {
		if (raw.length >= 2 && (raw.startsWith('"') && raw.endsWith('"') || raw.startsWith("'") && raw.endsWith("'")))
			return raw.slice(1, -1);
		return raw;
	}
	const firstLine = body.split("\n").find((line) => line.trim());
	if (!firstLine) return "";
	return firstLine.length > 60 ? `${firstLine.slice(0, 60)}...` : firstLine;
}

/** Expand one template against a raw argument string, as core would. Exported for conformance. */
export function renderCommand(template: string, argsString: string): string {
	const { frontmatter, body } = splitHead(template);
	const args = parseCommandArgs(argsString);
	return appendArgsFallback(substituteArgs(body, args), args.join(" "), INLINE_ARG_PATTERN.test(template));
}

/** Timer tick for the headless settle loop. */
function delay(ms: number): Promise<void> {
	const { promise, resolve } = Promise.withResolvers<void>();
	setTimeout(resolve, ms);
	return promise;
}

export default function pstackCommands(pi: ExtensionAPI) {
	const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "command-templates");
	for (const file of readdirSync(dir).sort()) {
		if (!file.endsWith(".md")) continue;
		const template = readFileSync(join(dir, file), "utf-8");
		const { frontmatter, body } = splitHead(template);
		pi.registerCommand(`${NAMESPACE}:${basename(file, ".md")}`, {
			description: menuDescription(frontmatter, body),
			handler: async (args, ctx) => {
				pi.sendUserMessage(renderCommand(template, args));
				// Headless -p and --mode json exit the moment the outer prompt
				// resolves: initializeExtensions is called there with no turn
				// tracker (refs/omp-src/packages/coding-agent/src/modes/print-mode.ts:114-126),
				// and the turn this send schedules would die unheard. Hold dispatch
				// until that turn settles; tui and rpc own it through their trackers
				// (modes/runtime-init.ts:72-80, modes/rpc/rpc-mode.ts:170-174). The
				// settle loop bounds the narrow gap between scheduling and streaming;
				// a send that never starts fails visibly instead of hanging the run.
				if (ctx.mode === "print" || ctx.mode === "json") {
					const deadline = Date.now() + 5000;
					while (ctx.isIdle() && Date.now() < deadline) await delay(15);
					if (!ctx.isIdle()) await ctx.waitForIdle();
				}
			},
		});
	}
}
