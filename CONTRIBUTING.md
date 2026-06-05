# Contributing To .ontos Protocol

Thanks for considering contributing to `.ontos Protocol`.

The most valuable contributions are clarity, examples, parser tests,
conformance fixtures, real project feedback, and careful thinking about
compatibility.

## Project Principles

- Keep the format plain text.
- Keep the core small.
- Prefer readable files over clever syntax.
- Preserve Git-friendly diffs.
- Treat AI workflows as first-class, but never make the format unreadable to
  humans.
- Avoid cloud requirements in the core workflow.

## Good First Contributions

- Improve examples.
- Add parser fixtures.
- Improve documentation.
- Suggest standard fields.
- Test Markdown conversion on real files.
- Report confusing syntax.
- Improve launch messaging.

Prepared starter issue seeds live in
`docs/COMMUNITY_STARTER_ISSUES.md`.

## Larger Contributions

Before making large changes, open an issue or RFC-style discussion for:

- syntax changes
- AST schema changes
- standard field changes
- parser behavior changes
- compatibility-breaking changes
- new official integrations

## Development Workflow

Before opening a pull request, run:

```bash
npm run release:check
```

For focused changes, run the closest package or validation script first.

## License And Certificates

The project is MIT licensed.

New files do not need per-file license headers unless a directory-specific
README or future release policy says otherwise. The repository-level `LICENSE`
file applies to source, docs, examples, schemas, tests, and release scripts.

By contributing, you certify that you have the right to submit the contribution
under the project license. A separate Developer Certificate of Origin sign-off
is not required for the 1.0.0 release.

## Contribution Tone

Be direct, kind, and specific. The goal is to make long-lived AI project context
clearer for everyone.
