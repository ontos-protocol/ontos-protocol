# Compatibility Policy

Updated: 2026-06-05

This policy defines what `.ontos Protocol` promises after the first formal
open-source release.

## Compatibility Surfaces

The project treats these as compatibility surfaces:

- `.ontos` syntax
- `.ontos Format 1.0`
- AST JSON Schema
- standard field registry
- diagnostics codes
- parser API
- serializer behavior
- formatter behavior
- validator behavior
- `ontosfmt` CLI commands
- exporter output structure
- importer migration behavior
- AI pack output structure
- conformance fixtures

## 1.x Compatibility Promise

During 1.x:

- valid `.ontos Format 1.0` files remain valid
- AST additions must be non-breaking
- parser APIs remain available
- CLI commands remain available
- diagnostics codes remain stable
- official examples remain valid
- conformance fixtures remain runnable
- package names remain stable

## Allowed 1.x Changes

Allowed without RFC:

- documentation improvements
- new examples
- new templates
- new warnings
- clearer diagnostic messages
- performance improvements
- accessibility improvements
- viewer UI improvements
- additive CLI flags
- additive package exports
- non-breaking schema additions

## Changes Requiring Compatibility Review

Review required:

- parser recovery behavior changes
- formatter output changes
- default exporter output changes
- new standard fields
- new diagnostic codes
- new AST optional properties
- changed importer heuristics
- changed AI pack ordering

## Changes Requiring RFC

RFC required:

- syntax changes
- removing syntax
- changing AST required properties
- changing standard field semantics
- changing CLI command names
- changing package names
- changing file extension
- changing version negotiation
- changing conformance expectations

## Breaking Changes

Breaking changes are reserved for a major release.

Examples:

- a valid 1.0 document becomes invalid
- AST consumers must change required fields
- CLI command behavior changes incompatibly
- formatter rewrites documents into incompatible syntax
- exporter removes documented output
- standard field meaning changes

## Deprecation Policy

Before removing behavior:

- document the deprecation
- add a warning where possible
- provide migration guidance
- keep behavior through at least one minor release unless security requires
  faster removal

## Conformance Policy

The conformance suite is part of the compatibility promise.

Any implementation claiming `.ontos Format 1.0` compatibility should be able to
run the official valid, invalid, AST, exporter, and diagnostics fixtures.

