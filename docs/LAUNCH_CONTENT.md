# Launch Content

## Core Message

`.ontos Protocol` is a plain text protocol for AI-native project context.

Markdown for articles. .ontos for AI-native project context.

Use it when a project document needs stable nodes, explicit fields, AI handoff,
review boundaries, and verifiable release state without leaving plain text.

## Short Maintainer FAQ

### Is `.ontos` a Markdown replacement?

No. Markdown remains excellent for articles, READMEs, notes, and documentation.
`.ontos` is for living project context that benefits from stable IDs, fields,
references, and AI boundaries.

### Why use plain text?

Plain text is easy to diff, review, store in Git, copy into tools, and keep
local. The protocol adds structure without requiring a database or hosted
service.

### What ships in 1.0.0?

The first stable format, AST schema, parser, CLI, viewer package, official
examples, conformance fixtures, package checks, and editor integration sources.

### What is the CLI called?

`ontosfmt`.

### What are the npm packages?

`@ontos-protocol/parser`, `@ontos-protocol/schema`,
`@ontos-protocol/cli`, and `@ontos-protocol/viewer`.

## Before And After Markdown Comparison

Markdown:

```markdown
# Release

We need to finish examples, run checks, avoid leaking unrelated names, and make
sure AI has enough context for the next handoff.
```

`.ontos`:

```text
@ontos 1.0
@title Release

- Public release @id(public-release) #release
  status: active
  ai_task: Identify unchecked launch blockers.
  ai_boundary: Use only public repository context.
  verify:
    - Run npm run release:check.
    - Confirm examples validate and export.
```

## Launch Article Draft

# Markdown Was Built For Pages. AI Projects Need Nodes.

Most project documents start as a page. That works until the document becomes
an operating surface for AI tools: a spec, a release checklist, a handoff, a
review packet, and a task map all at once.

`.ontos Protocol` keeps the good parts of plain text while making project
context explicit. A document is made of nodes. Nodes can have stable IDs, tags,
fields, references, risks, verification steps, and AI boundaries.

The goal is not to replace Markdown. The goal is to make AI-era project context
portable, inspectable, and local-first.

The 1.0.0 release includes a format specification, parser, CLI, viewer,
examples, conformance fixtures, and release checks. The CLI can validate,
format, import, export, inspect nodes, and produce AI context packs.

Try it:

```bash
npm install -g @ontos-protocol/cli
ontosfmt validate examples/project-state.ontos
ontosfmt pack examples/ai-handoff.ontos --node handoff-root --for handoff
```

## X Thread Draft

1. `.ontos Protocol` is a plain text protocol for AI-native project context.
2. Markdown for articles. .ontos for AI-native project context.
3. Nodes have stable IDs, fields, tags, references, risks, verification steps, and AI boundaries.
4. The first release ships a spec, parser, CLI, viewer, examples, conformance fixtures, and package checks.
5. `ontosfmt validate file.ontos` checks documents.
6. `ontosfmt pack file.ontos --node node-id --for handoff` creates focused AI handoff context.
7. The project is MIT licensed and local-first.

## Hacker News Post Draft

Title:

Show HN: .ontos Protocol - plain text project context for AI tools

Body:

`.ontos Protocol` is a plain text format for living project context: specs,
release state, AI handoffs, review packs, and verification rules.

It keeps files Git-friendly while adding stable node IDs, explicit fields,
references, and AI boundaries. The first release includes a format spec,
parser, CLI, viewer, examples, and conformance fixtures.

Markdown remains great for articles. `.ontos` is for AI-native project context.

## Product Hunt Copy

Tagline:

Plain text project context for AI tools.

Description:

`.ontos Protocol` helps teams keep AI-readable project state in plain text:
stable nodes, fields, references, risks, verification steps, and handoff packs.
It ships with a parser, CLI, viewer, examples, and conformance checks.

## Visual Assets

Use these assets for launch posts, release notes, package READMEs, and social
cards:

- `website/src/assets/viewer-screenshot.svg`
- `website/src/assets/cli-screenshot.svg`
- `website/src/assets/social-preview.svg`
- `.release/ontos-protocol-60s-demo.mp4`

Rules:

- Keep `.ontos Protocol` as the visible project name.
- Keep `ontosfmt` as the CLI name.
- Do not include unrelated product names.
- Do not imply that `.ontos` replaces Markdown for articles.
- Build the launch demo with `npm run demo:video` and validate it with
  `npm run validate:demo-video` before posting.

## Reddit Post Draft

I built `.ontos Protocol`, a plain text protocol for AI-native project context.

It is meant for project files that need more structure than a long Markdown
page: stable nodes, fields, tags, references, risks, verification steps, and AI
handoff boundaries.

The first release includes a spec, parser, CLI, viewer, examples, and
conformance fixtures. It stays local-first and Git-friendly.

## LinkedIn Post Draft

Project documents are becoming collaboration surfaces for people and AI tools.

`.ontos Protocol` is a plain text protocol for that context: node-first,
Git-friendly, local-first, and explicit about risks, verification steps, and AI
boundaries.

The 1.0.0 release includes the format spec, parser, CLI, viewer, examples,
conformance fixtures, and release checks.
