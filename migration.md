You are working on the pstack → OMP port. Setup is done: pins are in
UPSTREAM.md, upstream/pstack/ is vendored, findings/phase-a.md has the
header filled, findings/matrix.md has a real row per component with a
blank Action column.

Read, in order:
  00-README.md
  02-context.md
  01-conventions.md
  10-phase-a-study.md

Your task is Phase A. No porting happens in this phase — reading only.

External references you may read (paths on this machine):
  ~/Projects/pstack-port/refs/omp-src       — verify OMP APIs against this
  ~/Projects/pstack-port/refs/ref-port      — read ONCE as a worked example,
                                          then do not open again

Rules:
  - Every OMP claim needs evidence: file path and line range from omp-src.
  - Read from ref-port at most once per question, only to see how they
    solved a primitive. Trust omp-src and upstream/pstack/, not the
    reference.
  - If an API is not confirmed in omp-src, add it to 98-questions.md and
    stop that thread. Do not guess signatures.
  - Record findings in findings/phase-a.md as you go, using the sections
    from templates/findings.md. Do not batch to the end.
  - Fill the "stock vs fork" table in 01-conventions.md section 6. Any row
    with fork-only and no fallback is a blocker — flag it, do not proceed.
  - Fill the Action column in findings/matrix.md, one of:
    PORT, ADAPT, NATIVE, REPLACE, DEFER, DROP. Every row. Every DEFER/DROP
    needs a reason.
  - Never tick a "Done when" box without re-running the check.

Stop and wait for me at these two points:
  1. When the "stock vs fork" table is filled. Report it and wait for my
     go-ahead before continuing.
  2. At the end of Phase A, before checkpoint 1. Report the full findings
     file, the matrix, and any unresolved questions.

Start with the Discovery questions in Phase A (agent, skill, command
discovery paths and required frontmatter). Report after those before
moving to Formats.