<EXTREMELY_IMPORTANT>
You have pstack.

Before responding to any non-trivial engineering task, load the `poteto-mode` skill by reading `skill://poteto-mode` and follow it. That covers a feature, a bug fix, a refactor, debugging, performance work, and any multi-step code change. poteto-mode is the default entry point. It routes to the specific pstack skills from there. Pure questions and trivial one-line edits don't need it.

When the intent is already specific, enter directly on that skill instead:

- `skill://tdd` for a bug with a reproducible failure.
- `skill://architect` for types and module shape before code that crosses a function boundary.
- `skill://how` for how a subsystem works.
- `skill://why` for why it was built this way.
- `skill://arena` for N parallel attempts at one task.
- `skill://interrogate` for a multi-model diff review.

If you were dispatched as a subagent to execute a specific task, ignore this block. poteto-mode governs the orchestrating session, and it already shaped your dispatch.

User instructions, context files, and direct requests take precedence over this mandate. Other session-start mandates compose with it. Their skill-check discipline stands, and poteto-mode is the implementation entry point they route to for non-trivial code work.
</EXTREMELY_IMPORTANT>
