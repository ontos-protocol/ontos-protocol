# Naming And Boundary Rules

Updated: 2026-06-05

This repository is for the `.ontos` text protocol.

The naming boundary must stay explicit so the protocol, CLI, packages, editor
integrations, and future products can grow without confusing users.

## 1. Canonical Names

Protocol name:

```text
.ontos Protocol
```

File format:

```text
.ontos format
```

File extension:

```text
.ontos
```

CLI command:

```text
ontosfmt
```

Suggested repository name:

```text
ontos-protocol
```

Suggested npm scope:

```text
@ontos-protocol
```

## 2. Rule Of Thumb

Use `.ontos` when talking about the protocol, text files, format, parser,
viewer, CLI, examples, and editor integrations.

Do not use bare product-style names for this open-source protocol project.
Prefer `.ontos Protocol`, `.ontos format`, `ontos-protocol`, `ontosfmt`, and
`@ontos-protocol/*`.

The public repository should be `ontos-protocol`, not `.ontos`, because leading
dot names can become hidden directories after cloning, are less search-friendly,
and can create avoidable tooling edge cases.

The CLI should be `ontosfmt`, not `ontos`, because the command is a protocol
tool for formatting, validation, conversion, export, and context packaging. The
name is short enough for terminal use while still clearly separate from app or
product names.

## 3. Correct Usage

Good:

```text
.ontos Protocol is an AI-native structured text protocol.
.ontos files can be parsed into an AST.
The ontosfmt CLI validates and exports .ontos files.
```

Avoid:

```text
The protocol is a branded app.
The app CLI validates .ontos files.
Install the bare protocol-name package.
```

## 4. Package Naming

Recommended package names:

```text
@ontos-protocol/parser
@ontos-protocol/cli
@ontos-protocol/viewer
@ontos-protocol/schema
```

Recommended public API names:

```text
parseOntosDocument
serializeOntosDocument
validateOntosDocument
formatOntosDocument
```

Avoid package and API names that blur the protocol, CLI, and product layers:

```text
ontos
ontos-cli
ontos-parser
parseOntos
serializeOntos
```

## 5. CLI Naming

The CLI should be:

```bash
ontosfmt validate file.ontos
ontosfmt export file.ontos --to md
ontosfmt pack file.ontos --node page-settings --for ai
```

Avoid:

```bash
ontos validate file.ontos
```

Reason: bare `ontos` is too close to the extension and protocol name. `ontosfmt`
is clearer for users and leaves room for future products or command-line tools.

## 6. Product Boundary

`.ontos Protocol` should be described as a standalone open protocol:

```text
.ontos Protocol is the open text protocol.
```

This allows:

- any tool to adopt `.ontos`
- protocol decisions to stay independent
- future apps, hosted services, and editor integrations to coexist without
  naming conflict
- package names and CLI commands to remain stable

## 7. Documentation Rule

Every public-facing document should describe `.ontos` as a standalone protocol.

Short version:

```text
.ontos Protocol is the open text protocol for AI-native project context.
```
