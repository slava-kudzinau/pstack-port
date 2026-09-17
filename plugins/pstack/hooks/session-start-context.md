<EXTREMELY_IMPORTANT>
You have pstack.

Before responding to any non-trivial engineering task, invoke the `pstack:poteto-mode` skill with the Skill tool and follow it. That covers a feature, a bug fix, a refactor, debugging, performance work, and any multi-step code change. poteto-mode is the default entry point. It routes to the specific pstack skills from there. Pure questions and trivial one-line edits don't need it.

When the intent is already specific, enter directly on that skill instead:

- `pstack:tdd` for a bug with a reproducible failure.
- `pstack:architect` for types and module shape before code that crosses a function boundary.
- `pstack:how` for how a subsystem works.
- `pstack:why` for why it was built this way.
- `pstack:arena` for N parallel attempts at one task.
- `pstack:interrogate` for a multi-model diff review.

If you were dispatched as a subagent to execute a specific task, ignore this block. poteto-mode governs the orchestrating session, and it already shaped your dispatch.

User instructions, CLAUDE.md, and direct requests take precedence over this mandate. Other session-start mandates compose with it. Their skill-check discipline stands, and poteto-mode is the implementation entry point they route to for non-trivial code work.
</EXTREMELY_IMPORTANT>
