# User Workflows

Updated: 2026-06-05

This document defines required workflows for `.ontos Protocol 1.0.0`.

## 1. Author A Project Document

User creates a plain-text `.ontos` file:

```text
@ontos 1.0
@title Project state
@type project-state

- Current release @id(current-release)
  status: active
  verify:
    - Run tests.
```

Success:

- file is readable by humans
- file validates
- file can be formatted
- file can be committed to Git

## 2. Validate In CLI

User runs:

```bash
ontosfmt validate PROJECT_STATE.ontos
```

Success:

- valid files exit with code 0
- invalid files show source locations
- JSON output is available for automation

## 3. Format In CLI

User runs:

```bash
ontosfmt format --write PROJECT_STATE.ontos
```

Success:

- output is canonical
- running formatter again changes nothing
- Git diff remains readable

## 4. Export To Markdown

User runs:

```bash
ontosfmt export PROJECT_STATE.ontos --to md
```

Success:

- hierarchy becomes headings
- fields are readable
- code and lists are preserved

## 5. Export To HTML

User runs:

```bash
ontosfmt export PROJECT_STATE.ontos --to html
```

Success:

- output is standalone
- nodes are collapsible
- content is safely escaped

## 6. Import From Markdown

User runs:

```bash
ontosfmt convert README.md --to .ontos
```

Success:

- heading hierarchy becomes nodes
- paragraphs are preserved
- ambiguous conversion warnings are shown

## 7. Inspect A Node

User runs:

```bash
ontosfmt inspect APP_DESIGN.ontos --node page-settings
```

Success:

- selected node is displayed
- path is displayed
- fields are displayed
- descendants are optionally displayed

## 8. Generate AI Context

User runs:

```bash
ontosfmt pack APP_DESIGN.ontos --node page-settings --for context
```

Success:

- pack includes selected node
- pack includes relevant boundaries
- pack includes risks and verification
- pack excludes unrelated document sections

## 9. View In Browser

User opens official viewer and loads a `.ontos` file.

Success:

- tree renders
- nodes collapse and expand
- fields are searchable
- selected node can be copied
- exports are available

## 10. Use In Editor

User opens `.ontos` in VS Code or Obsidian.

VS Code and Cursor use three UI layers:

1. default main-tab `.ontos Tree` custom editor
2. optional Node Tree side view
3. optional side Web Preview

Success:

- `.ontos` opens in a node-first tree view by default where supported
- nodes collapse and expand without using the text gutter
- text editing remains available through Open as Text
- tree nodes can reveal the corresponding source line
- optional side node tree is available without becoming the default view
- optional side preview stays off unless requested
- node path, node text, and AI pack commands work from the tree tab focus,
  Node Tree selection, or text cursor
- node path and node text commands work before every node has a stable ID
- Markdown files can be converted to `.ontos` from the editor
- syntax is readable
- outline is available
- diagnostics are visible
- formatting and export commands are available where supported
