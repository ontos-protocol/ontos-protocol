# Conformance Implementation Guide

This guide is for third-party implementations of `.ontos Format 1.0`.

## Required Surfaces

A conforming implementation should document which surfaces it supports:

- parse valid fixtures
- reject invalid fixtures with diagnostics
- preserve AST fields required by `spec/ontos-ast-schema-1.0.json`
- preserve node, field, list, and child ordering where required
- serialize canonical formatting
- export supported formats
- import supported formats

## Fixture Sets

Use these directories:

- `spec/conformance/valid/`
- `spec/conformance/invalid/`
- `spec/conformance/format/`
- `spec/conformance/exports/`
- `spec/conformance/imports/`
- `spec/conformance/packs/`

Start with:

```bash
npm run validate:conformance
npm run validate:ast
npm run test:ordering
```

## AST Schema

Validate parser output against:

```text
spec/ontos-ast-schema-1.0.json
```

The AST schema is the integration contract for tools that do not use the
reference parser.

## Diagnostics

Diagnostics are documented in:

```text
spec/diagnostics-1.0.md
```

Third-party tools may add their own diagnostics, but format-level errors should
map to the documented diagnostic family where possible.

## Ordering

Implementations must preserve:

- metadata order after `@ontos` and `@title`
- node order
- field order
- list item order
- child node order
- tag order after de-duplication

The ordering fixture is:

```text
spec/conformance/valid/ordering.ontos
```

## Compatibility Report Template

```markdown
## Implementation

Name:
Version:
Supported surfaces:

## Fixtures

Valid fixtures:
Invalid fixtures:
Format fixtures:
Export fixtures:
Import fixtures:

## Differences

AST differences:
Diagnostic differences:
Formatting differences:

## Questions

Open compatibility questions:
```

## When To Open An RFC

Open an RFC discussion before proposing:

- syntax changes
- AST schema changes
- standard field semantic changes
- diagnostic model changes
- version negotiation changes
- compatibility policy changes
