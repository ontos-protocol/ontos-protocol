# .ontos Format 1.0

Updated: 2026-06-05

Status: stable

Related specifications:

- [AST Schema 1.0](ontos-ast-schema-1.0.json)
- [Field Registry 1.0](field-registry-1.0.md)
- [Diagnostics 1.0](diagnostics-1.0.md)
- [Conformance Fixtures](conformance/README.md)

## 1. Purpose

`.ontos` is a plain-text, node-first document format for living project context,
AI handoff, product specs, implementation maps, verification records, and team
knowledge.

The format is designed to be:

- readable as plain text
- stable in Git
- deterministic to parse and serialize
- safe for local-first tools
- precise enough for AI context selection

## 2. Normative Language

The words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are normative when written
in uppercase.

## 3. File Identity

File extension:

```text
.ontos
```

Recommended media type:

```text
text/ontos; version=1.0
```

Tools that cannot register or serve `text/ontos` MAY use:

```text
text/plain; charset=utf-8
```

## 4. Encoding And Lines

Documents MUST be UTF-8 encoded.

Parsers MUST accept these line endings:

- LF
- CRLF
- CR

Parsers MUST normalize all line endings to LF before parsing.

Serializers SHOULD write LF line endings.

Canonical serialized documents MUST end with a final newline unless the caller
explicitly disables it through an API option.

## 5. Minimal File

```text
@ontos 1.0
@title Example

- Root node
  purpose: Explain the document.
```

## 6. Grammar Summary

This grammar is descriptive for `.ontos Format 1.0`:

```text
document      = header-block blank* node-block*
header-block  = ontos-header title-header metadata-header*
ontos-header  = "@ontos" space version line-end
title-header  = "@title" space text line-end
metadata-header = "@" header-key [space text] line-end
node-block    = node-line field-or-child*
node-line     = indent "- " node-title id-token? tag-token* line-end
field-line    = indent field-key ":" [space field-value] line-end
list-item     = indent "- " text line-end
comment-line  = indent? "//" text line-end
blank         = whitespace* line-end
```

Implementations SHOULD follow the detailed rules below when the summary and a
section appear ambiguous.

## 7. Header

Header lines start with `@` and appear before the first node.

Required headers:

- `@ontos`
- `@title`

Required header example:

```text
@ontos 1.0
@title Project title
```

Optional standard headers:

- `@type`
- `@updated`
- `@id`
- `@schema`
- `@lang`

Header key grammar:

```text
^[a-z][a-z0-9-]*$
```

Unknown headers are valid. Parsers MUST preserve unknown headers in metadata
unless the caller explicitly requests a lossy transform.

Duplicate headers SHOULD produce a warning diagnostic.

`@ontos` value MUST be `1.0` for this version.

`@title` value MUST be non-empty after trimming surrounding whitespace.

## 8. Nodes

Nodes start with `- ` after indentation.

```text
- Settings page
```

Node titles MAY contain UTF-8 text.

Node title is the node line content after removing ID and tag tokens, then
trimming surrounding whitespace.

Empty node titles MUST produce an error diagnostic.

### Node IDs

Node IDs use:

```text
@id(node-id)
```

ID grammar:

```text
^[a-z][a-z0-9-]*$
```

Node IDs SHOULD be stable across edits.

Duplicate node IDs MUST produce an error diagnostic.

### Tags

Tags use `#tag-name` on node lines.

Tag grammar:

```text
^[a-z][a-z0-9-]*$
```

All-numeric tokens such as `#123` are ordinary title text and MUST NOT produce
tag diagnostics. Other malformed tag-like tokens MUST produce diagnostics.

Parsers MUST preserve tag order after de-duplicating repeated tags on the same
node.

## 9. Indentation

Two spaces define one nesting level.

```text
- Parent
  - Child
    - Grandchild
```

Tabs MUST NOT be used for indentation.

Indentation MUST be a multiple of two spaces.

A child node MUST be exactly one level deeper than its parent. A node that jumps
more than one level SHOULD produce an error diagnostic.

Blank lines are allowed between headers, nodes, fields, and child nodes.

## 10. Comments

Comments start with `//` after optional indentation.

```text
// This line is a comment.
```

Parsers MAY preserve comments when requested. Serializers MAY omit comments
unless preservation is requested.

Comments are not part of the semantic node tree.

## 11. Fields

Fields belong to the nearest owning node.

Field key grammar:

```text
^[a-z][a-z0-9_]*$
```

Unknown custom fields are valid.

Duplicate fields in the same node SHOULD produce a warning unless a future
field registry entry explicitly allows repetition.

### Single-Line Field

```text
purpose: Manage project context.
```

Single-line field values are trimmed strings.

### List Field

```text
verify:
  - Run tests.
  - Export HTML.
```

An empty field line followed by indented list items produces an array value.

### Multiline Text Field

```text
body: |
  First paragraph keeps line breaks.
  Second paragraph also stays in the value.
```

`field: |` starts a multiline text field.

Content lines MUST be indented at least two spaces beyond the field line.

The parser removes exactly one content indentation level from each non-empty
line.

Trailing blank lines in the text block SHOULD be removed during canonical
serialization.

AST representation:

```json
{
  "kind": "text",
  "value": "First paragraph keeps line breaks.\nSecond paragraph also stays in the value."
}
```

### Code Field

Use a fenced code field when the value should be rendered as code.

````text
snippet: ```js
  const message = ".ontos";
  console.log(message);
  ```
````

The opening fence appears after the field key.

The closing fence MUST appear on its own indented line.

Content lines MUST be indented at least two spaces beyond the field line.

AST representation:

```json
{
  "kind": "code",
  "language": "js",
  "value": "const message = \".ontos\";\nconsole.log(message);"
}
```

### Literal Text Blocks

In `.ontos Format 1.0`, literal prose blocks are represented by multiline text
fields using `field: |`.

## 12. References

References use double brackets.

Node reference:

```text
depends_on: [[release-gate]]
```

Field reference:

```text
source: [[release-gate.verify]]
```

File reference:

```text
source: ./docs/architecture.md
```

URL reference:

```text
source: https://example.com/spec
```

Parsers MUST collect bracket references from string, list, text, and code field
values.

Broken node or field bracket references MUST produce diagnostics.

File and URL references are field values. Parsers MUST NOT fetch them during
parse.

## 13. Escaping

`.ontos Format 1.0` does not define backslash escaping for structural tokens.

Authors SHOULD use multiline text fields or code fields when values need to
contain punctuation-heavy prose or code.

Exporters MUST escape content for the target format:

- HTML exporters escape `&`, `<`, `>`, and `"`
- XML and OPML exporters escape `&`, `<`, `>`, `"`, and `'`
- JSON exporters use standard JSON string escaping

## 14. Field Registry

Standard fields are defined in
[Field Registry 1.0](field-registry-1.0.md).

Custom fields are valid if their keys follow field key grammar.

Tools SHOULD preserve custom fields during parse, serialize, format, import,
export, and pack generation.

## 15. Ordering And Canonical Formatting

Canonical serialization MUST use this order:

1. `@ontos`
2. `@title`
3. remaining metadata headers in AST insertion order
4. blank line
5. nodes in AST order
6. fields in AST insertion order
7. child nodes in AST order

Canonical indentation is two spaces per level.

Canonical serializers SHOULD:

- preserve node order
- preserve field order
- preserve child order
- preserve custom fields
- write a final newline
- avoid wrapping field values unless the field is explicitly represented as a
  multiline text or code field

## 16. Parser Recovery

Parsers SHOULD recover from non-fatal errors and continue collecting nodes when
safe.

Reference APIs MAY expose:

- tolerant mode, which returns an AST with diagnostics when recovery is possible
- strict mode, which rejects documents with error diagnostics

Fatal errors:

- input exceeds configured size limit
- input is not provided as text to the parser API

Recoverable errors:

- invalid header syntax
- unsupported format version
- invalid indentation
- tab indentation
- invalid node ID
- duplicate node ID
- invalid tag
- invalid field key
- invalid multiline text field
- invalid code field
- broken reference

Warnings:

- duplicate header
- duplicate field
- empty multiline text field

## 17. Diagnostics

Diagnostic shape is defined in [Diagnostics 1.0](diagnostics-1.0.md).

Diagnostics SHOULD include:

- code
- severity
- message
- source range
- related node ID when available
- related field key when available
- suggested fix when safe

## 18. Source Locations

Source locations are one-based.

Line and column values MUST start at `1`.

The source range model is:

```json
{
  "start": { "line": 1, "column": 1 },
  "end": { "line": 1, "column": 10 }
}
```

Implementations MAY include byte or character offsets in addition to line and
column.

## 19. AST

The canonical AST schema is defined in
[AST Schema 1.0](ontos-ast-schema-1.0.json).

Parsers MUST produce deterministic AST output for the same input and options.

The AST root contains:

- `schemaVersion`
- `formatVersion`
- `metadata`
- `nodes`
- optional `diagnostics`
- optional `comments`

Each node contains:

- optional `id`
- `title`
- `tags`
- `fields`
- `children`

## 20. Version Negotiation

This specification defines `.ontos Format 1.0`.

Parsers that only support 1.0 MUST report an error when `@ontos` contains a
different version.

Future compatible 1.x additions SHOULD preserve existing parse and AST meaning.

Breaking changes require a future major version and an RFC.

## 21. Migration Rules

Future migrations SHOULD:

- preserve node IDs where possible
- preserve field keys where possible
- preserve user-authored order
- emit diagnostics for lossy transforms
- avoid changing document meaning silently

## 22. Security Considerations

Implementations MUST treat `.ontos` files as untrusted input.

Parsers SHOULD provide:

- maximum input size
- maximum node nesting depth
- deterministic recovery for invalid indentation

Exporters MUST escape HTML-sensitive characters before writing HTML.

Exporters MUST escape XML-sensitive characters before writing OPML or XML.

Tools MUST NOT fetch file or URL references during parse.

Viewers MUST NOT upload document contents by default.

## 23. Accessibility Considerations

Renderers SHOULD:

- expose node hierarchy with semantic tree or outline controls
- make keyboard navigation possible
- provide visible focus states
- preserve readable heading order in exported HTML
- include labels for search, export, and copy controls
- support high contrast preferences where practical
- avoid motion that ignores reduced-motion preferences

## 24. Internationalization

Documents MUST be UTF-8.

Node titles and field values MAY contain non-English text.

Field keys, tags, and node IDs are ASCII in `.ontos Format 1.0`.

Renderers SHOULD preserve text direction and Unicode content in field values.

## 25. Examples

### Valid Example

````text
@ontos 1.0
@title Release plan
@type release-plan
@updated 2026-06-05
@lang en

- Public release @id(public-release) #release
  purpose: Coordinate launch readiness.
  body: |
    The release ships only when local tooling,
    documentation, and conformance checks pass.
  verify:
    - Run npm run release:check.
    - Confirm package dry run passes.

  - Release gate @id(release-gate) #quality
    depends_on: [[public-release]]
    snippet: ```bash
      npm run release:check
      ```
````

### Invalid Example

```text
@ontos 1.0

 - Missing title and odd indentation @id(Bad_ID)
```

The invalid example should report diagnostics for missing `@title`, invalid
indentation, and invalid node ID.

## 26. Conformance

The official conformance fixtures live in [conformance/](conformance/).

Conforming implementations SHOULD:

- parse every valid fixture
- reject every invalid fixture with expected diagnostic codes
- produce AST compatible with the canonical schema
- preserve node order
- preserve field order
- preserve custom fields
- serialize deterministic output
- export deterministic Markdown, HTML, JSON, and OPML output where supported
