# Community Starter Issues

Use these issue seeds after the repository is public. They are prepared so
maintainers can create useful first issues quickly without inventing launch-week
work under pressure.

Generate the starter issue command pack:

```bash
npm run community:commands
npm run validate:community-commands
```

Output:

```text
.release/community-starter-issues.sh
```

Review the generated commands before running them. They create GitHub issues
from the seeds below and assume repository labels already exist.

## Good First Issue Seeds

### Clarify one example field

Labels: `good first issue`, `documentation`

Summary:

Improve one official example by clarifying a field description without changing
format behavior.

Acceptance:

- Pick one file in `examples/`.
- Keep the file valid with `ontosfmt validate`.
- Do not add new syntax.
- Run `npm run validate:examples`.

### Add a small valid conformance fixture

Labels: `good first issue`, `conformance`

Summary:

Add one focused valid fixture for a documented syntax edge case.

Acceptance:

- Add a file under `spec/conformance/valid/`.
- Explain the fixture in `spec/conformance/README.md`.
- Run `npm run validate:conformance`.
- Do not change parser behavior unless the fixture reveals a real bug.

### Improve a docs cross-link

Labels: `good first issue`, `documentation`

Summary:

Find one place where a guide should link to the format spec, CLI guide, or
examples.

Acceptance:

- Add one or two high-signal links.
- Run `npm run validate:links`.
- Keep link text descriptive.

### Add an adoption note for an existing workflow

Labels: `good first issue`, `documentation`

Summary:

Add a short note to `docs/ADOPTION_EXAMPLES.md` showing how one official example
can be used in a real project workflow.

Acceptance:

- Reference an existing example file.
- Keep the note concrete and reproducible.
- Run `npm run validate:links`.

## Help Wanted Issue Seeds

### Test the CLI on a real project document

Labels: `help wanted`, `compatibility`

Summary:

Try `ontosfmt` on a real project context file and report any confusing parser,
formatter, or export behavior.

Acceptance:

- Use public or sanitized content only.
- Include the command used.
- Include expected and actual behavior.
- Avoid requesting syntax changes without a concrete example.

### Add third-party conformance notes

Labels: `help wanted`, `conformance`

Summary:

Use `docs/CONFORMANCE_IMPLEMENTATION_GUIDE.md` to test a non-reference parser or
exporter, then report missing guidance.

Acceptance:

- Identify the implementation surface tested.
- List fixtures that passed or failed.
- Include diagnostic or AST differences when relevant.

### Draft an RFC for a compatibility question

Labels: `help wanted`, `rfc`, `compatibility`

Summary:

Turn a repeated compatibility question into a structured RFC draft using
`docs/RFC_PROCESS.md`.

Acceptance:

- Describe the current behavior.
- Include syntax and AST impact.
- Include migration impact.
- List open questions instead of proposing an immediate breaking change.

### Improve editor installation docs

Labels: `help wanted`, `documentation`

Summary:

Try the VS Code or Obsidian integration from a clean local setup and improve the
installation notes.

Acceptance:

- Use the checked-in extension or plugin source.
- Record the exact editor version.
- Keep instructions local-first.

### Add an adoption example from a public project

Labels: `help wanted`, `documentation`

Summary:

Add a small public-domain or self-authored adoption example showing `.ontos`
used for release state, handoff, review, or roadmap context.

Acceptance:

- Do not include private project content.
- Add the example under `examples/` only if it is broadly useful.
- Run `npm run validate:examples`.

## Triage Guidance

- Apply one primary label first.
- Ask for a minimal `.ontos` snippet when behavior is unclear.
- Move syntax or AST proposals to the RFC process.
- Close vague feature requests only after offering a concrete next step.
