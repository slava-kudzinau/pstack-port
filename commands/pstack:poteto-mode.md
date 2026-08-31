---
description: Route this task through poteto-mode.
metadata:
  upstream: 'none'
  upstream_sha: 'fd878692de15a3069c21c8f429eb0b9f2fe178fa'
  upstream_version: '0.14.5'
  status: 'new'
  note: 'no direct upstream file — Cursor triggers poteto-mode from the skill\'s own frontmatter, with no separate command file. Shape follows the Codex prompt-stub pattern in refs/ref-port/tools/generate.mjs:106-108 (read once for this port), adapted for OMP\'s commands/*.md + $@ input expansion.'
---

Invoke the `poteto-mode` skill and follow it for: $@
