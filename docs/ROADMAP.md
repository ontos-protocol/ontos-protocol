# .ontos Protocol Roadmap

Updated: 2026-06-05

This roadmap is organized around the first formal open-source release. It does
not describe a reduced public preview path.

## 1.0.0 Formal Open Source Release

Goal: ship `.ontos Protocol` as a complete, trustworthy open text protocol and
toolchain.

Must ship:

- `.ontos Format 1.0` specification
- AST JSON Schema 1.0
- field registry 1.0
- diagnostics specification
- conformance fixtures
- `@ontos-protocol/parser`
- `@ontos-protocol/schema`
- `@ontos-protocol/cli`
- `@ontos-protocol/viewer`
- `ontosfmt` CLI
- parser
- serializer
- validator
- formatter
- Markdown exporter
- HTML exporter
- JSON exporter
- OPML exporter
- Markdown importer
- OPML importer
- AI Context Pack
- AI Review Pack
- AI Handoff Pack
- AI Modify Boundary Pack
- browser viewer
- VS Code extension
- Obsidian plugin
- official examples
- official templates
- documentation site
- governance docs
- security policy
- release process
- compatibility policy
- launch materials

## 1.0.0 Release Gates

The release is ready only when all gates pass:

- protocol gate
- parser gate
- validator gate
- formatter gate
- exporter gate
- importer gate
- CLI gate
- AI pack gate
- examples gate
- viewer gate
- editor extensions gate
- documentation gate
- testing gate
- security gate
- package publishing gate
- launch content gate

## 1.x Maintenance

Goal: keep the protocol stable while improving tools.

Allowed:

- bug fixes
- diagnostics improvements
- documentation improvements
- non-breaking CLI additions
- non-breaking viewer improvements
- additional examples
- additional templates
- additional exporter options

Requires compatibility review:

- parser behavior changes
- formatter output changes
- AST additions
- field registry additions
- new diagnostics

Requires RFC:

- syntax changes
- AST breaking changes
- field semantics changes
- compatibility policy changes
- removal of supported behavior

## 2.0 Future Track

Goal: reserve breaking protocol evolution for deliberate, RFC-backed work.

Potential areas:

- advanced block syntax
- richer reference semantics
- multi-file project graphs
- signed document metadata
- expanded editor writeback protocol
- additional official importers

