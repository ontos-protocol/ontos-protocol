# .ontos Conformance Fixtures

Updated: 2026-06-05

This directory contains conformance fixtures for `.ontos Format 1.0`.

Conforming implementations should use these fixtures to verify parser,
validator, serializer, exporter, importer, and diagnostics behavior.

## Directory Layout

```text
spec/conformance/
├─ valid/
├─ invalid/
├─ ast/
├─ exports/
├─ format/
├─ imports/
└─ packs/
```

## Fixture Types

Valid fixtures:

- must parse successfully
- must produce no error diagnostics
- may produce warning or info diagnostics if documented

Invalid fixtures:

- must produce the expected diagnostic codes
- must include source locations where possible

AST fixtures:

- define expected canonical AST output for valid fixtures
- are used by parser and schema tests

Export fixtures:

- define expected output shape for supported exporters
- may be exact snapshots or documented structural expectations

Format fixtures:

- define canonical formatting and diff behavior

Import fixtures:

- define Markdown and OPML conversion expectations

Pack fixtures:

- define AI context, review, and handoff pack output

## Required Conformance Behavior

A conforming parser MUST:

- parse every valid fixture
- reject every invalid fixture with the expected error code
- produce AST output compatible with `spec/ontos-ast-schema-1.0.json`
- preserve node order
- preserve field order where the AST consumer requires it
- preserve custom fields

A conforming validator MUST:

- report diagnostic codes defined in `spec/diagnostics-1.0.md`
- include source locations when available
- distinguish errors from warnings

A conforming serializer SHOULD:

- produce canonical `.ontos` output
- round-trip valid fixtures without losing data
