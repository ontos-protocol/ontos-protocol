# Performance And Scale Limits

This document defines the first formal release performance expectations for
`.ontos Protocol 1.0.0`.

The goal is predictable local tooling for real project documents. The 1.0.0
release is not claiming unlimited document size or realtime collaboration
scale.

## Default Parser Guards

Reference parser defaults:

```text
maxInputBytes: 5 MiB
maxDepth: 100
```

These guards protect CLI, viewer, and editor integrations from accidentally
processing documents that are too large or too deeply nested for normal local
workflows.

When a guard is exceeded, the parser returns a diagnostic instead of silently
continuing:

- `ONTOS1801` for input size limit
- `ONTOS1802` for nesting depth limit

Tool builders may raise these limits for controlled environments, but public
tools should expose the choice clearly.

## Release Performance Budgets

The release gate measures representative local workloads.

Parser, validator, and formatter smoke budgets:

```text
document shape: 1,500 flat nodes with fields, lists, and references
parse: <= 5,000 ms
validate: <= 5,000 ms
format: <= 7,000 ms
reparse formatted output: <= 5,000 ms
```

Additional parser stress budgets:

```text
10,000 flat nodes: parse <= 15,000 ms
90-level nested document: parse <= 5,000 ms
250 nodes with large multiline text and code fields: parse <= 5,000 ms
500 duplicate node IDs: diagnostics <= 5,000 ms
```

Viewer browser smoke budget:

```text
document shape: 2,200 flat nodes with fields and references
render in jsdom browser-like environment: <= 8,000 ms
```

The viewer budget is intentionally generous so CI catches major regressions
without making the release process fragile on slower runners.

## Expected User Limits

Recommended document size for the 1.0.0 reference toolchain:

```text
routine documents: under 1,000 nodes
large project documents: 1,000 to 2,500 nodes
special-purpose benchmark documents: above 2,500 nodes
```

For very large repositories, prefer multiple linked `.ontos` files instead of
one huge file. This keeps Git diffs readable, makes AI context packs smaller,
and keeps editor integrations responsive.

## Large Document Strategy

Use stable IDs and references to split large knowledge spaces:

```text
project-state.ontos
product-spec.ontos
release-plan.ontos
team-knowledge.ontos
```

Then use fields such as:

```text
depends_on: [[release-gate]]
source: ./docs/architecture.md
related: ./team-knowledge.ontos#decision-records
```

This is the recommended 1.0.0 scale pattern.

## What Is Not A 1.0.0 Guarantee

The first formal release does not guarantee:

- 10,000-node viewer rendering as a supported interactive workflow
- realtime collaborative editing
- memory-bounded streaming parse APIs
- incremental AST updates
- indexed cross-file search
- browser rendering performance on every older device

Those are future compatibility-sensitive improvements and should go through
the RFC process if they affect public APIs or format behavior.

## Required Verification

Run:

```bash
npm run test:performance
npm run test:viewer-browser
npm run release:check
```

The release must not ship if these checks fail.
