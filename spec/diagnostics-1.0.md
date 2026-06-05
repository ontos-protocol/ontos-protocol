# .ontos Diagnostics 1.0

Updated: 2026-06-05

This document defines diagnostic codes for `.ontos Format 1.0`.

Diagnostics are used by validators, CLIs, editor integrations, CI systems, and
conformance tests.

## Diagnostic Shape

Diagnostics MUST include:

- `code`
- `severity`
- `message`

Diagnostics SHOULD include:

- source range
- node ID when available
- field name when available
- suggested fix when safe

Severity values:

- `error`
- `warning`
- `info`

## Error Codes

### `ONTOS1001` Missing Required Header

Severity: error.

The document is missing `@ontos` or `@title`.

### `ONTOS1002` Unsupported Format Version

Severity: error.

The `@ontos` version is not supported by the parser.

### `ONTOS1003` Duplicate Header

Severity: warning.

A metadata header appears more than once.

### `ONTOS1004` Invalid Header Key

Severity: error.

A header does not match header grammar.

### `ONTOS1101` Invalid Indentation

Severity: error.

Indentation does not follow the required two-space nesting model.

### `ONTOS1102` Tab Indentation

Severity: error.

Tabs are not allowed for indentation in `.ontos Format 1.0`.

### `ONTOS1201` Empty Node Title

Severity: error.

A node marker exists without a title.

### `ONTOS1202` Invalid Node ID

Severity: error.

Node IDs must match:

```text
^[a-z][a-z0-9-]*$
```

### `ONTOS1203` Duplicate Node ID

Severity: error.

Two or more nodes use the same ID.

### `ONTOS1204` Invalid Tag

Severity: error.

Tags must match:

```text
^[a-z][a-z0-9-]*$
```

### `ONTOS1205` Missing Required Node ID

Severity: error.

A validation profile requires node IDs and a node does not define one.

### `ONTOS1301` Invalid Field Key

Severity: error.

Field keys must follow the field naming rules.

### `ONTOS1302` Duplicate Field

Severity: warning.

A field appears more than once in the same node.

### `ONTOS1303` Reserved Field Misuse

Severity: error.

A reserved or standard field is used with invalid semantics.

### `ONTOS1304` Invalid Multiline Field

Severity: error or warning.

A `field: |` text block is malformed, empty, or not indented at least two
spaces beyond the field line.

### `ONTOS1305` Invalid Code Field

Severity: error.

A fenced code field is malformed, not indented at least two spaces beyond the
field line, or missing its closing fence.

### `ONTOS1401` Broken Node Reference

Severity: error.

A `[[node-id]]` reference points to a missing node.

### `ONTOS1402` Broken Field Reference

Severity: error.

A `[[node-id.field]]` reference points to a missing node or missing field.

### `ONTOS1403` Invalid File Reference

Severity: warning.

A file reference is malformed or unsafe for the current environment.

### `ONTOS1501` Non-Canonical Formatting

Severity: info.

The file is valid but not formatted according to canonical formatting rules.

### `ONTOS1601` Missing Recommended Field

Severity: warning.

A document profile recommends a field that is missing from a node.

### `ONTOS1602` Unknown Document Type

Severity: warning.

The `@type` value is not known by the validator.

### `ONTOS1603` Deprecated Field

Severity: warning.

A field is accepted but deprecated by the active validation policy.

### `ONTOS1701` Unsafe Export Content

Severity: warning.

Content requires escaping or special handling during HTML, XML, or Markdown
export.

### `ONTOS1801` Input Too Large

Severity: error.

The input exceeds the implementation's configured maximum input size.

### `ONTOS1802` Maximum Depth Exceeded

Severity: error.

The document exceeds the implementation's configured maximum node nesting
depth.

## CLI Mapping

`ontosfmt validate` MUST exit:

- `0` when no errors are present
- `1` when one or more errors are present
- `2` when the CLI command itself fails

Warnings alone SHOULD NOT produce a non-zero exit code unless strict mode is
enabled.

## Conformance Requirements

Conformance fixtures SHOULD include:

- valid documents with no diagnostics
- valid documents with warnings
- invalid documents with expected error codes
- diagnostics with source locations
