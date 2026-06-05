# Threat Model

This document describes security and privacy assumptions for `.ontos Protocol
1.0.0`.

## Assets

Protected assets:

- user-authored `.ontos` document content
- local project paths referenced by documents
- package integrity
- parser and CLI availability
- generated HTML, OPML, JSON, and Markdown output
- public repository naming boundary

## Trust Boundaries

`.ontos` files may be untrusted input.

Tools must treat these as untrusted:

- downloaded `.ontos` files
- imported Markdown
- imported OPML
- copied examples from issues or discussions
- files opened in viewer or editor integrations

The core toolchain is local-first. The reference CLI and viewer do not require
accounts and do not upload document contents by default.

## Main Risks

### Parser Resource Exhaustion

Large files or deeply nested documents can consume CPU and memory.

Mitigations:

- parser supports `maxInputBytes`
- parser supports `maxDepth`
- diagnostics include `ONTOS1801` and `ONTOS1802`
- performance smoke test covers large documents

### Unsafe Export Output

Document content may include characters that are meaningful in HTML, XML, or
Markdown.

Mitigations:

- HTML exporter escapes HTML-sensitive text
- OPML exporter escapes XML-sensitive text
- tests cover HTML and OPML escaping
- unsafe export behavior is tracked by diagnostics policy

### Path Handling

Documents may include local file paths.

Mitigations:

- parser treats paths as text
- CLI export does not read linked files
- path smoke test covers paths with spaces and Unicode
- viewers should not fetch local paths without explicit user action

### Unexpected Network Access

Core workflows should not require network access.

Mitigations:

- viewer loads local document content
- package smoke can run without registry access after dependencies are installed
- docs state local-only behavior
- no telemetry is enabled by default

### Supply Chain

Runtime and development dependencies may introduce risk.

Mitigations:

- dependency audit runs in release gate
- license allowlist runs in release gate
- package dry run inspects package contents
- package smoke installs packed artifacts before release

### Public Boundary Leakage

Public files must not reveal unrelated product context or retired naming.

Mitigations:

- public-boundary scan runs in release gate
- naming policy defines allowed public names
- release runbook requires a final public-boundary scan

## Non-Goals

The 1.0.0 release does not provide:

- sandboxed execution of arbitrary user scripts
- permission system for hosted collaboration
- encrypted document storage
- remote sync security model
- automatic trust decisions for linked files

## Required Checks

Run before release:

```bash
npm run release:check
```

Security-relevant checks in the release gate include:

- public-boundary scan
- secret scan
- dependency audit
- license scan
- parser conformance
- fuzz smoke
- path smoke
- performance smoke
- viewer browser smoke
- accessibility static QA
- package smoke
- publish dry run
