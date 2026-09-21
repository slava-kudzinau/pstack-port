---
name: investigation
description: A read-only question. How does X work, why was Y built this way, are we sure. Routed from poteto-mode's Investigation trigger, or invoked directly for "how does X work", "why was Y built this way", "are we sure about Z".
disable-model-invocation: true
---

# Investigation

**You own the answer. Plan, route, write.**

Investigation requests are read-only. They produce a cited explanation or a recommendation, not a code change.

1. Route through skill://how. For motivation questions, also route through skill://why.
2. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only investigation`.
3. Produce the `how`-shaped output (Overview / Key Concepts / How It Works / Where Things Live / Gotchas), or a recommendation with a tradeoffs table if the request is a decision between alternatives.
4. Apply skill://unslop to the reply.

No PR, no skill://babysit, no skill://architect unless the investigation precedes a code change. If it does, hand back to the user and re-route to skill://bug-fix or skill://feature.

**Reply:** the investigation output. For "are we sure?" answers, include your real judgment with reasons. Push back if the premise is wrong (see the Autonomy section in skill://poteto-mode).
