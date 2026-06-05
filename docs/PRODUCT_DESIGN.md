# .ontos Protocol Product Design

Updated: 2026-06-05

## 1. Product Thesis

`.ontos Protocol` exists because AI has changed what project documents need to
do.

Classic documents are mostly written for humans to read. AI-era project
documents must also support precise machine operations:

- read this node
- update this field
- preserve this boundary
- check this risk
- generate this task pack
- hand this context to another agent

Markdown is still valuable, but it is page-first. `.ontos` is node-first.

Product thesis:

```text
The next durable project document is a plain-text, node-addressable, AI-readable
outline that humans can still edit by hand.
```

## 2. Category

`.ontos Protocol` should define a category before it competes with tools.

Category name:

```text
AI-native structured text
```

Practical category:

```text
Plain-text project memory for AI collaboration
```

Do not initially claim that `.ontos` replaces Markdown. The stronger first claim
is:

```text
Markdown for articles. .ontos for living AI project context.
```

## 3. Target Users

### 3.1 Initial Users

- AI coding tool users who need better project context.
- Solo builders and small teams with fast-changing product specs.
- Product managers and designers who maintain living design documents.
- Developers who want structured handoff across Codex, Cursor, Claude Code, and
  other agents.

### 3.2 Later Users

- Engineering teams maintaining knowledge bases.
- Open-source maintainers managing roadmaps and contributor handoffs.
- Research groups organizing evolving notes and experiments.
- Tool builders embedding `.ontos` as a context format.

## 4. Jobs To Be Done

When my project grows beyond a simple README, I want a document format that lets
me fold, search, reference, and update each part independently, so I can keep
context clear for myself and AI tools.

When I ask an AI agent to modify a project, I want it to know the exact boundary,
risk, task, and verification requirements, so it does not damage unrelated parts
of the work.

When I hand work to another AI session or teammate, I want to package only the
needed project nodes, so the next worker starts with accurate context instead of
a giant text dump.

## 5. Product Principles

1. Plain text first.
   Any `.ontos` file must be readable and editable without a special app.

2. Node first.
   The basic unit is a node, not a page, paragraph, or database row.

3. AI-readable by default.
   IDs, fields, references, and validation rules should make precise AI work
   easier.

4. Git-friendly.
   Files should diff cleanly and avoid machine-noise churn.

5. Local-first.
   The core toolchain should work offline and without an account.

6. Portable.
   Export paths to Markdown, HTML, OPML, and JSON must be treated as core
   features, not extras.

7. Small core, wide ecosystem.
   The format and parser should stay simple. Viewers, editors, and integrations
   can grow around the stable core.

## 6. Product System

### 6.1 .ontos Format

The `.ontos` file is the source of truth.

Core features:

- file header
- nested nodes
- stable node IDs
- tags
- fields
- multiline field values
- comments
- node references
- file references
- validation rules

### 6.2 .ontos AST

The AST is the integration contract.

Every serious tool should operate through the same structure:

- parser produces AST
- validator checks AST
- viewer renders AST
- CLI exports AST
- AI utilities select AST nodes
- editor writes AST back to text

### 6.3 ontosfmt CLI

The CLI is the first power-user interface.

Commands:

```bash
ontosfmt parse file.ontos
ontosfmt validate file.ontos
ontosfmt export file.ontos --to md
ontosfmt export file.ontos --to html
ontosfmt export file.ontos --to json
ontosfmt export file.ontos --to opml
ontosfmt convert README.md --to .ontos
ontosfmt pack file.ontos --node page-settings --for ai
```

### 6.4 .ontos Viewer

For evaluators and zero-install demos, the browser viewer is the first product
experience. It is the easiest way to inspect a `.ontos` file without installing
an editor extension, but it is read-oriented and is not the default developer
entry point.

Core experience:

- open a `.ontos` file
- see a collapsible tree
- search nodes and fields
- focus one node
- copy node path
- copy node text
- copy AI modification boundary
- export to common formats

The viewer should feel quiet, fast, and reliable. It should not look like a
heavy workspace, dashboard, or database product in the first formal release.

### 6.5 Editor Integrations

The editor integrations are the developer default. VS Code and Cursor should
open `.ontos` files in a node-first tree custom editor while preserving an
escape hatch to plain text source editing.

Relationship to the viewer: the browser viewer proves the protocol quickly for
read-only demos, while the editor extension is where developers should do
day-to-day navigation, source edits, validation, and AI pack generation.

VS Code:

- default tree custom editor for `.ontos` files
- Open as Text command for source edits
- optional side node tree
- syntax highlighting
- outline tree
- optional interactive preview panel
- validation diagnostics
- export commands
- node copy commands
- Markdown import command
- AI pack commands for context, review, handoff, modify-boundary, and
  verification

Obsidian:

- preview rendering
- node references
- Markdown export
- graph integration later

### 6.6 AI Utilities

AI utilities turn `.ontos` into a practical context layer.

Required utilities:

- extract node by ID
- extract node and ancestors
- extract node with linked references
- extract fields by allowlist
- generate context pack
- generate review pack
- generate handoff pack
- produce update patches for a node field

### 6.7 Application Boundary

Applications can use `.ontos` files as project memory and AI handoff format.

The protocol boundary:

- `.ontos Protocol` defines the text format, AST, validation, and portable
  tools.
- Any application may implement a rich experience for reading and writing
  `.ontos`.
- Tools must be able to adopt `.ontos` without installing or depending on a
  specific app.
- Protocol governance should happen in the `.ontos` repository, not inside the
  roadmap of any single application.

## 7. Core Workflows

### 7.1 Read A Living Spec

User opens `APP_DESIGN.ontos`, collapses everything, expands the current module,
and sees only purpose, current implementation, risks, todos, and verification.

### 7.2 Give AI A Safe Task

User selects a node and runs:

```bash
ontosfmt pack APP_DESIGN.ontos --node page-settings --for ai
```

The generated pack includes:

- node title and ID
- parent path
- relevant fields
- locked requirements
- risks
- acceptance criteria
- verification steps

### 7.3 Update Project State

After work is done, the user or AI updates:

- `status`
- `todo`
- `history`
- `verify`
- `handoff`

The document remains the persistent project memory.

### 7.4 Convert Existing Markdown

User runs:

```bash
ontosfmt convert README.md --to .ontos
```

The output is not perfect, but it gives a structured starting point.

### 7.5 Publish A Readable Page

User exports:

```bash
ontosfmt export SPEC.ontos --to html
```

The HTML output uses native collapsible sections and can be hosted anywhere.

## 8. Formal Release Scope

The first formal open-source release must include the complete protocol and
toolchain required for serious adoption:

- formal `.ontos Format 1.0` specification
- stable AST schema
- parser
- serializer
- validator
- formatter
- CLI
- Markdown export
- HTML export
- JSON export
- OPML export
- Markdown import
- OPML import
- AI Context Pack
- AI Review Pack
- AI Handoff Pack
- browser viewer
- VS Code extension
- Obsidian plugin
- official examples
- conformance tests
- public documentation site
- governance docs
- release process docs
- MIT license

## 9. Deferred Product Surfaces

These are not required for the first formal protocol release because they are
app or service surfaces, not protocol trust requirements:

- login
- cloud sync
- team permissions
- realtime collaboration
- database storage
- rich card editor
- hosted workspace
- complex dashboard
- AI agent platform

The first release must prove that `.ontos` is useful as an open protocol,
independent of any specific hosted or desktop product.

## 10. Standard Document Templates

The project should ship official templates:

- `app-design.ontos`
- `project-state.ontos`
- `ai-handoff.ontos`
- `bug-fix.ontos`
- `review-pack.ontos`
- `product-spec.ontos`
- `launch-plan.ontos`
- `team-knowledge.ontos`
- `research-notes.ontos`
- `open-source-roadmap.ontos`

## 11. AI Contract

`.ontos Protocol` should define a clear AI contract:

```text
AI may read selected nodes.
AI may update selected fields.
AI must preserve locked fields.
AI must respect do_not_touch boundaries.
AI must report changed node IDs.
AI must update history when requested.
AI must provide verification based on verify fields.
```

This contract is what makes `.ontos` more than an outline format.

## 12. Success Metrics

### 1.0 Success

- `.ontos Format 1.0` is stable and implementable by third parties.
- Parser and serializer round-trip official conformance fixtures safely.
- Validator reports precise diagnostics for invalid files.
- CLI validates, formats, converts, exports, inspects, and packages context.
- Viewer makes large project documents easier to navigate than Markdown.
- AI packs let users provide precise, bounded project context to AI tools.
- VS Code extension is useful.
- Obsidian plugin is useful.
- At least 10 real projects use `.ontos` for project context.
- At least 3 external contributors submit useful issues or PRs.
- Users can explain the value in one sentence.

The target user sentence:

```text
This is what I wanted Markdown to become for AI projects.
```
