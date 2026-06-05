# Format Guide

This guide introduces the `.ontos` text format for authors.

For normative implementation details, see
[`spec/ontos-format-1.0.md`](../spec/ontos-format-1.0.md).

## Minimal Document

```text
@ontos 1.0
@title Project state

- Current release @id(current-release)
  status: active
  purpose: Track release readiness.
```

## Headers

Every file starts with headers:

```text
@ontos 1.0
@title Project state
@type release-plan
```

Required headers:

- `@ontos`
- `@title`

## Nodes

Nodes start with `- ` and can include stable IDs and tags:

```text
- Parser package @id(parser-package) #package
```

Use IDs for anything that may be referenced, reviewed, exported, or handed to
an AI tool.

Tags start with `#` and must use lowercase ASCII letters, digits, and hyphens:

```text
- Fix issue #123 @id(fix-issue) #bug-fix
```

In this example, `#bug-fix` is a tag and the all-numeric `#123` remains part of
the node title. Other malformed tag-like tokens still produce diagnostics so
authors can catch typos before publishing.

## Fields

Fields belong to the nearest node:

```text
- Parser package @id(parser-package)
  status: ready
  risk: Parser behavior changes must preserve valid fixtures.
```

## List Fields

Use list fields for checks, risks, tasks, or evidence:

```text
verify:
  - Run npm run release:check.
  - Confirm examples validate and export.
```

## Multiline Text Fields

Use `field: |` when a value needs line breaks:

```text
body: |
  This paragraph keeps its line break.
  This line is part of the same field value.
```

## Code Fields

Use a fenced code field when a node needs a command or snippet:

````text
snippet: ```bash
  npm run release:check
  ```
````

## References

Reference nodes or fields with double brackets:

```text
depends_on: [[parser-package]]
evidence: [[parser-package.verify]]
```

## Comments

Comments start with `//`:

```text
// This note is for maintainers and does not render in normal output.
```

## Formatting

Use `ontosfmt` to keep files stable in Git:

```bash
ontosfmt format --write project-state.ontos
```

Canonical formatting uses two-space indentation and a final newline.

Parsers can preserve comments when requested, but canonical serialization may
omit comments unless the caller explicitly preserves them for an editing
workflow.

Single-line field values are not automatically wrapped. Use multiline text
fields or code fields when line breaks are meaningful or when long content must
remain stable in review diffs.
