# .ontos Protocol Open Source Launch Plan

Updated: 2026-06-05

## 1. Open Source Position

`.ontos Protocol` should be open source by default.

The core value is the format and the local-first ecosystem around it. If the
format is not open, developers will not trust it as durable project memory.

Open-source promise:

```text
The `.ontos` format, parser, CLI, viewer, examples, documentation, and editor
integrations remain open source.
```

Future hosted services can exist, but they must not be required for the core
workflow.

## 2. License Recommendation

Recommended license: MIT.

Why:

- simple
- permissive
- familiar to developers
- easy for companies to adopt
- compatible with broad tooling ecosystems

Alternative if stronger copyleft is desired later: MPL-2.0.

Default decision for launch:

```text
MIT for all core repositories.
```

## 3. Repository Strategy

Public repository name:

```text
ontos-protocol
```

README title:

```text
# .ontos Protocol
```

Start as a monorepo:

```text
ontos-protocol/
├─ README.md
├─ LICENSE
├─ CONTRIBUTING.md
├─ spec/
├─ docs/
├─ examples/
├─ packages/
│  ├─ parser-js/
│  ├─ cli/
│  └─ shared/
├─ apps/
│  └─ viewer/
├─ extensions/
│  ├─ vscode/
│  └─ obsidian/
└─ tests/
```

Reason:

- easier early coordination
- shared fixtures
- one issue tracker
- one release story
- easier contributor onboarding

Split repositories only after the ecosystem grows.

## 4. Public Message

Primary tagline:

```text
Markdown for articles. .ontos for AI-native project context.
```

Short description:

```text
`.ontos` is a plain-text, node-first document format for living specs, project
state, and AI handoff.
```

Longer description:

```text
`.ontos` turns project documents into structured trees of nodes and fields, so
humans can fold and navigate them while AI agents can read, update, verify, and
handoff precise slices of context.
```

## 5. Audience-Specific Messaging

For developers:

```text
Give AI tools precise project context without dumping giant Markdown files.
```

For product managers:

```text
Keep living specs structured, navigable, and ready for AI-assisted updates.
```

For open-source maintainers:

```text
Turn roadmap, issue context, contributor handoff, and review rules into a
portable plain-text format.
```

For AI tool builders:

```text
Use `.ontos` as a structured context layer for agent workflows.
```

## 6. Differentiation

`.ontos Protocol` is not:

- a note-taking app
- a database
- a Notion clone
- a new Markdown skin
- a cloud workspace
- a proprietary AI memory system
- a single app-specific configuration format

`.ontos Protocol` is:

- a file format
- a parser contract
- a local-first toolchain
- a viewer
- an AI context packaging layer
- an editor integration target

Launch messaging for this repository should lead with the protocol, not any
single implementation.

## 7. Launch Assets

Required assets:

- [ ] logo
- [ ] README hero example
- [ ] 60-second demo video
- [ ] screenshot of viewer
- [ ] screenshot of VS Code `.ontos Tree` custom editor, if ready
- [ ] before / after Markdown comparison
- [ ] sample `.ontos` project file
- [ ] website landing page
- [ ] quickstart page
- [ ] migration page
- [ ] launch article

## 8. Content Plan

Article 1:

```text
Markdown Was Built For Pages. AI Projects Need Nodes.
```

Article 2:

```text
Introducing .ontos Protocol: Plain-Text Project Memory For AI Collaboration
```

Article 3:

```text
How To Give AI Coding Agents Safer Project Context
```

Article 4:

```text
From README.md To PROJECT_STATE.ontos
```

Article 5:

```text
Why AI Handoff Needs A File Format
```

## 9. Community Channels

Initial channels:

- GitHub Issues
- GitHub Discussions
- X / Twitter
- Hacker News
- Product Hunt
- Reddit communities for programming and Obsidian
- Discord communities for AI coding tools

Avoid starting too many official communities before there are maintainers.

## 10. Launch Sequence

### Phase A: Formal Build

Complete:

- spec
- parser
- CLI
- viewer
- examples
- docs

Use `.ontos` internally on its own project files.

### Phase B: Release Candidate

Complete:

- repository readiness
- package publish dry runs
- full conformance suite
- website deployment
- viewer demo
- official examples
- launch content
- public-boundary scan
- security scan
- release notes

Validate with trusted reviewers from:

- AI coding tool users
- developers with large Markdown project docs
- Obsidian users
- indie hackers

### Phase C: 1.0.0 Launch

Release:

- `.ontos Format 1.0` spec
- parser package
- CLI package
- viewer
- Markdown and OPML importers
- exporters
- AI packs
- VS Code extension
- Obsidian plugin
- documentation site
- launch article
- demo video

### Phase D: Post-Launch Operations

Operate:

- issue triage
- patch releases
- contributor onboarding
- RFC review
- adoption examples
- next release planning

## 11. Adoption Loops

`.ontos` should create practical sharing loops:

1. User converts messy Markdown into `.ontos`.
2. Viewer makes the improvement visually obvious.
3. User gives AI a node-specific context pack.
4. AI performs a safer task.
5. User shares the file or screenshot.
6. Another user copies the template.

The product should optimize for this loop.

## 12. Contributor Strategy

Good first contribution areas:

- examples
- docs
- field registry suggestions
- exporter improvements
- syntax highlighting
- viewer UI polish
- Markdown import edge cases
- validation rules

Harder contribution areas:

- parser correctness
- AST compatibility
- editor writeback
- AI pack semantics
- versioning policy

## 13. Governance

Use a lightweight RFC model.

RFC required for:

- syntax changes
- AST schema changes
- standard field additions
- compatibility-breaking changes
- new official exporters
- v1.0 stabilization

No RFC required for:

- examples
- docs fixes
- viewer UI improvements
- bug fixes
- test fixtures

## 14. Release Strategy

Version tracks:

- `1.0.0`: first formal open-source release
- `1.x`: compatible tool, docs, examples, diagnostics, and integration updates
- `2.0`: future breaking protocol evolution through RFCs only

Release principle:

```text
Ship only when the protocol, toolchain, docs, examples, tests, packages, and
launch materials are ready together. Never hide format changes inside tooling
updates.
```

## 15. The Launch Promise

The public promise should be modest and strong:

```text
.ontos will not replace every Markdown file.
It will make long-lived AI project context clearer, safer, and easier to hand off.
```
