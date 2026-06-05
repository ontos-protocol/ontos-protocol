# .ontos Tests

This directory contains repository-level snapshots and test support files for
`.ontos Protocol`.

Most executable tests live beside the package they verify:

- `packages/parser/test/`
- `packages/schema/test/`
- `packages/cli/test/`
- `packages/viewer/test/`
- `scripts/*-smoke.mjs`

The public conformance suite lives in `spec/conformance/`.

## Required Checks

Run the complete release gate:

```bash
npm run release:check
```

Focused checks:

```bash
npm run test
npm run test:fuzz
npm run test:path
npm run test:performance
npm run test:viewer-browser
npm run test:coverage
npm run validate:conformance
```

## Coverage Target

The 1.0.0 release gate enforces source coverage for:

- `packages/parser/src`
- `packages/schema/src`
- `packages/cli/src`
- `packages/viewer/src`

Minimum targets:

```text
overall source coverage: >= 65%
per-file source coverage: >= 35%
```

The current threshold is intentionally modest because the release gate also
includes conformance fixtures, snapshot checks, fuzz smoke tests, path smoke
tests, package smoke tests, and browser-like viewer tests. Raising coverage
targets is compatible for future releases.
