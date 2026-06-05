# Release Scope

Updated: 2026-06-05

This document defines the scope of the first formal open-source release.

## In Scope

Protocol:

- `.ontos Format 1.0`
- AST schema
- field registry
- diagnostics model
- conformance fixtures

Packages:

- `@ontos-protocol/parser`
- `@ontos-protocol/schema`
- `@ontos-protocol/cli`
- `@ontos-protocol/viewer`

CLI:

- `ontosfmt`
- validate
- format
- parse
- export
- convert
- inspect
- list
- stats
- pack
- doctor

Formats:

- `.ontos`
- Markdown
- HTML
- JSON
- OPML

AI packs:

- Context Pack
- Review Pack
- Handoff Pack
- Modify Boundary Pack
- Verification Pack

Applications:

- browser viewer
- VS Code extension
- Obsidian plugin

Documentation:

- README
- quickstart
- format guide
- CLI guide
- parser API guide
- viewer guide
- AI workflow guide
- migration guide
- examples gallery
- governance docs
- compatibility policy
- release process

Operations:

- GitHub repository
- npm packages
- docs site
- viewer demo
- launch materials
- post-launch triage

## Out Of Scope

Not part of the first formal protocol release:

- hosted accounts
- cloud sync
- paid workspace
- realtime collaboration
- team permission system
- proprietary storage backend
- private service dependency
- document hosting platform

## Release Principle

The first formal release should be complete as a protocol and toolchain, while
remaining independent of any single hosted or application product.

