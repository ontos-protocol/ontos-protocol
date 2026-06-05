# .ontos Protocol 1.0.0 Release Notes

`.ontos Protocol` is a plain text protocol for AI-native project context.

This release includes the first stable format, reference parser, CLI, viewer,
examples, conformance fixtures, package checks, and editor integration sources.

## Highlights

- `.ontos` format 1.0 specification
- canonical AST schema
- reference parser and validator
- `ontosfmt` CLI
- Markdown, HTML, JSON, and OPML export
- Markdown and OPML import
- AI context, review, and handoff packs
- browser viewer package
- official examples gallery
- VS Code extension source and release VSIX
- Obsidian plugin source
- public release gate with package smoke checks and publish dry runs

## Install

```bash
npm install -g @ontos-protocol/cli
```

## Try

```bash
ontosfmt validate examples/project-state.ontos
ontosfmt export examples/project-state.ontos --to html
ontosfmt pack examples/ai-handoff.ontos --node handoff-root --for handoff
```

## Compatibility

This release targets:

- `.ontos Format 1.0`
- `ontosfmt 1.0.0`
- `@ontos-protocol/parser 1.0.0`
- `@ontos-protocol/schema 1.0.0`
- `@ontos-protocol/cli 1.0.0`
- `@ontos-protocol/viewer 1.0.0`

The compatibility policy is documented in `docs/COMPATIBILITY_POLICY.md`.

## Release Links

- README: `README.md`
- Format guide: `docs/FORMAT_GUIDE.md`
- AI agent workflows: `docs/AI_AGENT_WORKFLOWS.md`
- Compatibility policy: `docs/COMPATIBILITY_POLICY.md`
- Runtime targets: `docs/RUNTIME_TARGETS.md`
- Format specification: `spec/ontos-format-1.0.md`
- Conformance fixtures: `spec/conformance/`
- Examples: `examples/`
- Viewer app source: `apps/viewer/`

## Verification

The release gate is:

```bash
npm run release:check
```

It runs public surface scanning, secret scanning, dependency audit, license
scan, conformance tests, example validation, editor integration smoke checks,
website build, package install smoke tests, and npm publish dry runs.
