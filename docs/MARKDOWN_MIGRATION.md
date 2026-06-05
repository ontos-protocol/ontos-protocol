# Markdown Migration Guide

Markdown remains the right choice for articles, READMEs, notes, and narrative
documentation. Use `.ontos` when a document becomes living project context:
state, decisions, risks, verification steps, AI handoff, and release gates.

## Convert A Markdown File

```bash
ontosfmt convert README.md --to .ontos > README.ontos
```

Generate a migration report:

```bash
ontosfmt convert README.md --to .ontos --report > README.ontos
```

The `.ontos` document is written to stdout. The migration report is written to
stderr so CI scripts can capture it separately.

## Mapping Rules

- Markdown headings become `.ontos` nodes.
- Heading hierarchy becomes node hierarchy.
- Paragraphs become `body` fields.
- Bullet lists become `items` fields.
- Ordered lists become `ordered` fields and preserve numbering text.
- Code fences become `code_language` and `code` fields.
- Tables become `table` fields with original Markdown rows.
- Blockquotes become `quote` fields.
- Front matter becomes `@source-*` metadata headers.
- Inline links stay inside field text.
- Duplicate headings receive stable numeric ID suffixes.

## Project State Migration

Before:

```markdown
# Release

Status: active

## Risks

- Examples are incomplete.
- Release checks must pass.
```

After:

```text
@ontos 1.0
@title Release
@type project-state

- Release @id(release)
  status: active
  risk:
    - Examples are incomplete.
    - Release checks must pass.
  verify:
    - Run npm run release:check.
```

Recommended cleanup:

- Rename generic `body` fields to `purpose`, `current`, `risk`, or `verify`.
- Add stable node IDs to important decisions.
- Add `ai_boundary` for anything AI tools must not change.

## Product Spec Migration

Before:

```markdown
# Viewer

The viewer should show a tree, search, and export options.
```

After:

```text
@ontos 1.0
@title Viewer
@type product-spec

- Viewer @id(viewer)
  purpose: Show project context as a navigable tree.
  acceptance:
    - Tree navigation works.
    - Search matches nodes and fields.
    - Export buttons produce Markdown, HTML, JSON, and OPML.
```

Recommended cleanup:

- Convert requirements into `acceptance` lists.
- Move implementation cautions into `risk`.
- Move manual test steps into `verify`.

## AI Handoff Migration

Before:

```markdown
# Handoff

Continue from the release checklist. Do not leak private context.
```

After:

```text
@ontos 1.0
@title Handoff
@type ai-handoff

- Handoff @id(handoff)
  ai_task: Continue from the release checklist.
  ai_boundary: Use only public repository context.
  verify:
    - Run release checks before summarizing completion.
```

Recommended cleanup:

- Keep `ai_task` narrow and action-oriented.
- Put constraints in `ai_boundary`.
- Put proof requirements in `verify`.

## Review Checklist

After conversion:

```bash
ontosfmt validate README.ontos
ontosfmt format --write README.ontos
ontosfmt export README.ontos --to html
```

Then review:

- node titles are meaningful
- generated IDs are stable enough
- lists landed in useful fields
- important risks and verification steps are explicit
- AI boundaries do not include private or unrelated project context
