# FAQ

## Is `.ontos` a Markdown replacement?

No. Markdown remains excellent for articles, READMEs, notes, and documentation.
`.ontos` is for living project context that benefits from stable IDs, fields,
references, risks, verification steps, and AI boundaries.

## Why plain text?

Plain text is easy to diff, review, store in Git, copy into tools, and keep
local. `.ontos` adds structure without requiring a database or hosted service.

## What ships in 1.0.0?

The first stable release includes:

- `.ontos Format 1.0`
- AST schema
- parser
- serializer
- formatter
- validator
- `ontosfmt` CLI
- viewer package
- official examples
- conformance fixtures
- VS Code extension source
- Obsidian plugin source
- release checks

## What is the CLI called?

The CLI is `ontosfmt`.

## What are the npm packages?

- `@ontos-protocol/schema`
- `@ontos-protocol/parser`
- `@ontos-protocol/cli`
- `@ontos-protocol/viewer`

## Does the viewer upload documents?

No. The viewer is local-first and does not upload document contents by default.

## Can I use custom fields?

Yes. Tools should preserve unknown custom fields unless the user explicitly
requests a transformation that removes them.

## Are IDs required?

The base format allows nodes without IDs. IDs are recommended for documents
used with AI handoffs, references, review packs, or long-term project state.

## Does `#123` create a tag?

No. Tags must start with a lowercase ASCII letter, such as `#bug-fix` or
`#release`. Issue numbers and ticket references such as `#123` stay in the node
title as normal text. Other malformed tag-like tokens still produce diagnostics.

## What is stable in 1.x?

The compatibility policy covers accepted syntax, AST shape, formatter output,
diagnostic semantics, package names, and CLI command behavior.

## How should breaking changes happen?

Breaking syntax or AST changes require an RFC and a future major version.
