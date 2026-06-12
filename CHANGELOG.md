# Changelog

All notable changes to `.ontos Protocol` are documented here.

The project follows semantic versioning for packages and the compatibility
policy documented in `docs/COMPATIBILITY_POLICY.md`.

## 1.0.3 - 2026-06-13

### Fixed

- Made `.ontos: Open as Tree` resolve explicit command arguments, active
  custom/text tabs, open `.ontos` documents, and single-file workspaces so
  Cursor/agent-triggered commands no longer no-op when the active editor is not
  the target document.
- Added `.ontos: Open Workspace File as Tree` and `.ontos: Open in Cursor Panel`
  for reliable Cursor command palette and right-panel workflows.
- Updated the Cursor panel path to use `path: uri.fsPath` with Cursor's private
  Glass command shape before falling back to the standard custom editor.

## 1.0.2 - 2026-06-12

### Fixed

- Added a Cursor/VS Code first-open migration so restored `.ontos` text tabs
  move back into the `.ontos Tree` custom editor when the user has not
  explicitly chosen text mode.
- Reworked the `.ontos Tree` custom editor for clearer first-open scanning,
  including custom disclosure controls, node metadata, search, and collapsed
  long-field blocks.
- Fixed tree expansion state so toolbar Expand/Collapse, chevrons, and
  `aria-expanded` stay synchronized.
- Replaced the optional side preview's native `<details>` disclosure UI with
  the same custom tree renderer used by the main editor.
- Disabled native text-editor folding ranges by default behind
  `ontos.textFolding` to avoid a competing left-edge folding surface.

### Changed

- Added external marketplace verification for the VS Code-compatible extension
  across Visual Studio Marketplace, Open VSX, and GitHub Releases.
- Updated extension patch release guidance so maintainers publish the same VSIX
  to Open VSX, Visual Studio Marketplace, and GitHub Releases.
- Recorded Open VSX publication and namespace verification evidence for the
  1.0 launch.

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
