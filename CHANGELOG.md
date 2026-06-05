# Changelog

All notable changes to `.ontos Protocol` are documented here.

The project follows semantic versioning for packages and the compatibility
policy documented in `docs/COMPATIBILITY_POLICY.md`.

## 1.0.0 - 2026-06-05

First stable open-source release.

### Added

- `.ontos Format 1.0` specification, field registry, diagnostics reference, and
  AST JSON Schema.
- Reference parser, serializer, formatter, validator, and JavaScript types.
- Parser strict and tolerant modes, stable node ID helper, invalid header
  diagnostics, invalid tag diagnostics, suggested fixes, and optional source
  locations.
- Multiline text fields and fenced code fields in parser, serializer, CLI
  exporters, viewer exporters, and conformance fixtures.
- `ontosfmt` CLI for validation, formatting, import, export, inspection, stats,
  schema output, diagnostics, and AI context packs.
- AI context packs with linked references, source references, sensitive field
  filtering, verification and modify-boundary pack kinds, and token budget
  metadata.
- Export options for Markdown front matter, table of contents, heading offsets,
  HTML search indexes, JSON diagnostics/source locations, and OPML selected
  fields.
- Markdown, HTML, JSON, OPML exporters.
- Markdown and OPML importers with deterministic `.ontos` output.
- Browser viewer package, standalone viewer app, and public documentation site
  source.
- VS Code and Obsidian integration source, including the VS Code release VSIX
  build path.
- Official examples, conformance fixtures, AST snapshots, exporter snapshots,
  importer snapshots, and package smoke tests.
- Public-boundary, secret, license, audit, lint, typecheck, format, build,
  package, coverage, browser viewer, accessibility, extension packaging, and
  publish dry-run release gates.

### Changed

- VS Code and Cursor `.ontos` files now open in the `.ontos Tree` custom editor
  by default instead of a plain text tab.
- Plain text remains available through `.ontos: Open as Text` or
  `ontos.defaultEditor: text`.

### Security

- Added public-boundary scan to prevent leaking unrelated project names or
  private context into public files.
- Added secret scan, dependency audit, and dependency license allowlist checks.
