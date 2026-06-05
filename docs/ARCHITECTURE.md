# .ontos Protocol Architecture

Updated: 2026-06-05

`.ontos Protocol` should be built around a small stable core and many optional
surfaces.

## Core Flow

```text
.ontos text
  -> parser
  -> AST
  -> validator
  -> tools
      -> serializer
      -> exporters
      -> viewer
      -> AI packs
      -> editor integrations
```

## Source Of Truth

The `.ontos` text file is always the source of truth.

Tools may render, inspect, validate, or transform it, but they should not require
a private database or hidden state.

## Core Packages

### parser

Responsibilities:

- parse text into AST
- preserve source locations
- report syntax errors
- serialize AST back to text
- provide stable node lookup helpers

### validator

Responsibilities:

- detect duplicate IDs
- detect invalid references
- detect indentation problems
- detect reserved field misuse
- provide warnings for missing recommended fields

### cli

Responsibilities:

- expose parser and validator
- export common formats
- import Markdown
- generate AI packs
- support automation and CI

### viewer

Responsibilities:

- render collapsible tree
- support search and focus
- expose copy and export actions
- make the format visually obvious

### extensions

Responsibilities:

- integrate `.ontos` with daily editing environments
- surface validation warnings
- offer preview and export commands

## AST Contract

The AST should be the durable integration contract.

Initial shape:

```json
{
  "version": "0.1",
  "metadata": {
    "title": "Desktop agent app design",
    "type": "app-design",
    "updated": "2026-06-05"
  },
  "nodes": [
    {
      "id": "page-settings",
      "title": "Settings page",
      "tags": ["page"],
      "fields": {
        "purpose": "Manage settings.",
        "verify": ["Open #settings."]
      },
      "children": []
    }
  ]
}
```

## Compatibility Rules

- Parser changes must be tested against official fixtures.
- Exporter changes must be snapshot tested.
- Format changes require an RFC.
- AST breaking changes require a version bump.
- Unknown fields should remain valid unless explicitly reserved.

## AI Integration Boundary

AI tools should operate on selected nodes and fields.

The preferred flow:

```text
select node -> generate context pack -> AI edits project -> update selected
fields -> validate -> summarize changed node IDs
```

This keeps `.ontos` focused as a context layer, not a general AI agent platform.

## Application Boundary

Applications may consume, edit, and generate `.ontos` files, but each app should
be treated as one implementation surface.

Do not place protocol-only packages under app-specific namespaces. Do not make
the parser, validator, CLI, schema, examples, or viewer depend on any specific
application runtime.
