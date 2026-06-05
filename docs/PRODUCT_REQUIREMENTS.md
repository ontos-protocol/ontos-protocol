# Product Requirements

Updated: 2026-06-05

This document defines what `.ontos Protocol 1.0.0` must deliver.

## Product Statement

`.ontos Protocol` is an AI-native structured text protocol for project context.
It helps humans and AI tools read, update, verify, and hand off project knowledge
through plain-text, node-first documents.

## Target Users

- developers using AI coding tools
- open-source maintainers
- product managers
- designers
- technical writers
- knowledge workers
- tool builders

## Core Jobs

- Write project context in plain text.
- Navigate long documents as a node tree.
- Give AI tools precise bounded context.
- Preserve implementation risks and verification steps.
- Convert existing Markdown into structured project context.
- Export `.ontos` to common formats.
- Validate files in CI.
- Use `.ontos` in editors.

## Required User Workflows

- author `.ontos` by hand
- parse `.ontos` to AST
- validate `.ontos`
- format `.ontos`
- inspect nodes
- export to Markdown
- export to HTML
- export to JSON
- export to OPML
- import from Markdown
- import from OPML
- view in browser
- use in VS Code
- use in Obsidian
- generate AI context packs
- generate review packs
- generate handoff packs

## Product Requirements

- Plain text files must remain readable without special software.
- Parser output must be deterministic.
- Formatter output must be deterministic.
- Validator diagnostics must include source locations.
- Exporters must be deterministic.
- Importers must warn on ambiguous conversion.
- CLI must support CI usage.
- Viewer must work locally.
- Core workflows must not require accounts.
- Core workflows must not require cloud services.
- Official examples must validate.
- Official examples must export.
- AI packs must be inspectable text or JSON.

## Acceptance Criteria

The release is acceptable when:

- `.ontos Format 1.0` is complete
- parser package is published
- CLI package is published
- official examples are included
- docs site is published
- conformance suite is included
- viewer is usable
- editor integrations are usable
- public-boundary scan passes

