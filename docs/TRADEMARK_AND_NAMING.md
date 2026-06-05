# Trademark And Naming

Updated: 2026-06-05

This document defines public naming rules for `.ontos Protocol`.

## Approved Names

- `.ontos Protocol`
- `.ontos format`
- `.ontos file`
- `ontos-protocol`
- `ontosfmt`
- `@ontos-protocol/parser`
- `@ontos-protocol/schema`
- `@ontos-protocol/cli`
- `@ontos-protocol/viewer`

## Repository Naming

The public repository should be:

```text
ontos-protocol
```

Do not name the repository `.ontos`, because leading dot names can become hidden
directories after cloning and create avoidable tooling issues.

## CLI Naming

The CLI should be:

```text
ontosfmt
```

Do not publish a bare `ontos` command for this protocol project.

## Package Naming

Packages should use:

```text
@ontos-protocol/*
```

Avoid:

```text
ontos
ontos-cli
ontos-parser
@ontos/*
```

## Public Description

Preferred short description:

```text
AI-native structured text protocol for project context.
```

Preferred tagline:

```text
Markdown for articles. .ontos for AI-native project context.
```

