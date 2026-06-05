# .ontos Protocol

`.ontos Protocol` is an AI-native outline text protocol for living project
documents.

中文定位：

```text
.ontos 是 AI 原生项目记忆的纯文本协议层。
```

Markdown is excellent for articles, READMEs, notes, and documentation pages.
`.ontos` is designed for project context that keeps changing: product specs,
implementation maps, task state, AI handoffs, review packs, and verification
rules.

The core idea is simple:

```text
.md = page-first text
.ontos = node-first text
```

## Why .ontos

AI-era documents are no longer only read by humans. They are also read,
summarized, updated, reviewed, and handed off by AI agents.

Long Markdown files often become waterfalls. Important constraints, risks,
tasks, and verification steps get mixed together. AI tools then have to infer
where one idea ends and another begins.

`.ontos` makes the document itself structured:

- Nodes are the first-class unit.
- Nodes can have stable IDs.
- Fields make project meaning explicit.
- AI can read or update one node without rewriting the whole file.
- Documents remain plain text, Git-friendly, and portable.

## Example

```text
@ontos 1.0
@title Example app design
@type app-design
@updated 2026-06-05

- Settings page @id(page-settings) #page
  purpose: Manage appearance, identity, modules, permissions, and security.
  frontend:
    - apps/desktop/src/App.tsx
    - apps/desktop/src/styles.css
  locked:
    - Do not move the settings entry out of the lower-left navigation.
  verify:
    - Open #settings.
    - Confirm the settings entry is still in the lower-left corner.

  - Appearance
    frontend: App.tsx section === "appearance"
    risk: Do not change theme assets during unrelated fixes.

  - Privacy and security
    backend:
      - lockState.js
      - apiToken.js
      - security.js
    risk: Do not bypass write lock or token authorization.
```

## Product Shape

`.ontos` is not just a file extension. The open-source protocol should ship as
a small ecosystem:

- `spec`: the formal `.ontos` format specification.
- `parser`: a reference parser and serializer.
- `cli`: validation, conversion, and export tools.
- `viewer`: a local browser viewer for collapsible reading.
- `apps/viewer`: a standalone static viewer app.
- `examples`: real project documents that demonstrate the format.
- `extensions`: VS Code and Obsidian integrations.

## Open a .ontos file in 60 seconds

1. Install VS Code or Cursor.
2. Install the `.ontos Protocol` extension from Open VSX or Visual Studio
   Marketplace.
3. Open [examples/project-state.ontos](examples/project-state.ontos).
4. Confirm the default main editor is `.ontos Tree`.
5. Click Edit on a node to change the source text.
6. Optional: set `ontos.defaultEditor` to `text` for plain-text-only opening.

For local VSIX installation and publishing details, see
[VS Code Extension Publishing](docs/VSCODE_PUBLISHING.md). For AI usage, see
[AI Agent Workflows](docs/AI_AGENT_WORKFLOWS.md).

## First Users

The first audience is deliberately narrow:

- Developers using Codex, Cursor, Claude Code, or similar AI coding tools.
- Indie builders managing fast-changing projects.
- Product and design teams maintaining living specs.
- Teams that need reliable AI handoff across people, tools, and sessions.

## Open Source Commitment

`.ontos Protocol` is planned as a fully open-source project.

Core format, parser, CLI, viewer, examples, docs, and editor integrations should
all remain open. Hosted services may exist later, but the local-first toolchain
must stay complete and useful without an account, cloud service, or private
backend.

Default license: MIT.

## Roadmap

See:

- [Product Design](docs/PRODUCT_DESIGN.md)
- [Task List](docs/TASKS.md)
- [Open Source Launch Plan](docs/OPEN_SOURCE_LAUNCH_PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Naming Rules](docs/NAMING.md)
- [Why .ontos](docs/WHY_ONTOS.md)
- [Format Guide](docs/FORMAT_GUIDE.md)
- [Product Requirements](docs/PRODUCT_REQUIREMENTS.md)
- [User Workflows](docs/USER_WORKFLOWS.md)
- [AI Agent Workflows](docs/AI_AGENT_WORKFLOWS.md)
- [Templates](docs/TEMPLATES.md)
- [FAQ](docs/FAQ.md)
- [Markdown Migration](docs/MARKDOWN_MIGRATION.md)
- [Release Scope](docs/RELEASE_SCOPE.md)
- [Release Governance](docs/RELEASE_GOVERNANCE.md)
- [Compatibility Policy](docs/COMPATIBILITY_POLICY.md)
- [Release Process](docs/RELEASE_PROCESS.md)
- [Launch Runbook](docs/LAUNCH_RUNBOOK.md)
- [npm Publishing Runbook](docs/NPM_PUBLISHING.md)
- [VS Code Extension Publishing](docs/VSCODE_PUBLISHING.md)
- [Static Deployment Runbook](docs/STATIC_DEPLOYMENT.md)
- [Runtime Targets](docs/RUNTIME_TARGETS.md)
- [Repository Setup](docs/REPOSITORY_SETUP.md)
- [Threat Model](docs/THREAT_MODEL.md)
- [Performance And Scale Limits](docs/PERFORMANCE_LIMITS.md)
- [Analytics Decision](docs/ANALYTICS_DECISION.md)
- [RFC Process](docs/RFC_PROCESS.md)
- [Governance](docs/GOVERNANCE.md)
- [Changelog](CHANGELOG.md)
- [Format Specification 1.0](spec/ontos-format-1.0.md)
- [AST Schema 1.0](spec/ontos-ast-schema-1.0.json)
- [Field Registry 1.0](spec/field-registry-1.0.md)
- [Diagnostics 1.0](spec/diagnostics-1.0.md)
- [Conformance Fixtures](spec/conformance/README.md)
- [Testing Notes](tests/README.md)

## Status

This repository is currently preparing the first formal open-source release.

The formal release target is:

```text
.ontos Protocol 1.0.0
.ontos Format 1.0
ontosfmt 1.0.0
@ontos-protocol/* 1.0.0
```

The release checklist is tracked in [Task List](docs/TASKS.md).
