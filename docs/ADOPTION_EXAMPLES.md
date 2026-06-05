# Adoption Examples

These examples show where `.ontos Protocol` fits in real project workflows.

## Release State

Example: `examples/project-state.ontos`

Use when a repository needs a durable release snapshot with status, owners,
risks, verification steps, and AI handoff boundaries.

Useful commands:

```bash
ontosfmt validate examples/project-state.ontos
ontosfmt inspect examples/project-state.ontos
ontosfmt export examples/project-state.ontos --to md
```

## AI Handoff

Example: `examples/ai-handoff.ontos`

Use when one person or AI agent needs to pass a scoped task to another agent
without sending an entire chat history.

Useful command:

```bash
ontosfmt pack examples/ai-handoff.ontos --node handoff-root --for handoff
```

## Review Pack

Example: `examples/review-pack.ontos`

Use when reviewers need focused context: what changed, what to inspect, what not
to touch, and how to verify the result.

Useful command:

```bash
ontosfmt pack examples/review-pack.ontos --node review-root --for review
```

## Product Spec

Example: `examples/product-spec.ontos`

Use when a product requirement needs acceptance criteria, risks, constraints,
and implementation boundaries that stay stable in Git.

Useful command:

```bash
ontosfmt validate examples/product-spec.ontos --recommended
```

## Bug Fix

Example: `examples/bug-fix.ontos`

Use when a bug report needs reproduction steps, suspected causes, fix
boundaries, and verification steps in one structured file.

Useful command:

```bash
ontosfmt export examples/bug-fix.ontos --to html --search-index
```

## Team Knowledge

Example: `examples/team-knowledge.ontos`

Use when shared knowledge needs stable references and AI-readable fields without
becoming a database.

Useful command:

```bash
ontosfmt list nodes examples/team-knowledge.ontos
```

## Migration From Markdown

Start from `docs/MARKDOWN_MIGRATION.md` when a long Markdown document has become
release state, handoff state, or review state.

Recommended path:

1. Keep article-style content in Markdown.
2. Move living project state into `.ontos`.
3. Add stable IDs to nodes that other tools or people will reference.
4. Run `ontosfmt validate`.
5. Export to Markdown only when a reader needs a page view.
