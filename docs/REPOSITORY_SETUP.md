# Repository Setup

This runbook defines the public GitHub repository settings for the first
`.ontos Protocol` open-source release.

## Repository Identity

Name:

```text
ontos-protocol
```

Description:

```text
AI-native structured text protocol for project context
```

Topics:

```text
ai
protocol
text-format
markdown
outline
developer-tools
plain-text
project-management
structured-text
cli
```

Homepage:

```text
https://ontos-protocol.github.io/ontos-protocol/
```

## Visibility

- Create the repository as private while preparing the release.
- Confirm `npm run release:check` passes before switching to public.
- Switch to public only after package publish, docs, and launch content are
  ready for the same release window.

## Default Branch

Default branch:

```text
main
```

Branch protection for `main`:

- require pull request before merging
- require at least one approving review
- require status checks to pass before merging
- require the `CI` workflow
- require conversation resolution before merging
- block force pushes
- block branch deletion
- require linear history if the maintainer workflow uses squash merges

## Merge Policy

Allowed merge methods:

- squash merge for ordinary pull requests
- merge commit for release branches only if maintainers need a preserved branch
  history

Commit message guidance:

- Use concise imperative summaries.
- Mention affected surface, such as `parser`, `cli`, `spec`, `viewer`, `docs`,
  or `release`.
- Link RFCs for format, AST, compatibility, or governance changes.

## Labels

Create labels from `.github/labels.yml`.

Repository settings are recorded in `config/repository-settings.json`.
Branch protection is recorded in `.github/branch-protection-main.json`.

Required labels:

- `bug`
- `documentation`
- `enhancement`
- `compatibility`
- `conformance`
- `security`
- `dependencies`
- `rfc`
- `good first issue`
- `help wanted`
- `release`

## Discussions

Enable GitHub Discussions with these categories:

- Announcements
- General
- Ideas
- Q&A
- Show and tell
- RFC discussion

Use issues for actionable bugs and implementation work. Use discussions for
questions, design tradeoffs, and adoption stories.

Discussion category forms:

- `.github/DISCUSSION_TEMPLATE/announcements.yml`
- `.github/DISCUSSION_TEMPLATE/general.yml`
- `.github/DISCUSSION_TEMPLATE/ideas.yml`
- `.github/DISCUSSION_TEMPLATE/q-a.yml`
- `.github/DISCUSSION_TEMPLATE/show-and-tell.yml`
- `.github/DISCUSSION_TEMPLATE/rfc-discussion.yml`

The form filenames must match the GitHub category slugs configured on the
public repository.

## Issue Forms

Issue templates:

- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/compatibility.md`
- `.github/ISSUE_TEMPLATE/documentation.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/rfc.md`
- `.github/ISSUE_TEMPLATE/release.yml`

Blank issues are disabled for the first formal release. Security reports,
usage questions, and release-process questions route through explicit contact
links or templates.

The release issue form mirrors:

- `docs/RELEASE_ISSUE_1.0.0.md`
- `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`
- `docs/RELEASE_OWNER_ASSIGNMENT.md`

## Security

- Enable private vulnerability reporting.
- Point security reports to `SECURITY.md`.
- Keep dependency alerts enabled.
- Keep Dependabot alerts enabled if available for the repository plan.
- Keep `.github/dependabot.yml` enabled for npm and GitHub Actions updates.
- Keep `.github/workflows/codeql.yml` enabled for JavaScript CodeQL analysis.
- Use the `dependencies` label for dependency update and lockfile review PRs.

## Release Settings

Before publishing `v1.0.0`:

- confirm `CHANGELOG.md` includes `1.0.0`
- confirm `docs/RELEASE_NOTES_1.0.0.md` matches shipped packages
- confirm `npm run release:check` passes on `main`
- create signed tag `v1.0.0` if signing is available
- attach links to docs, examples, spec, schema, and npm packages

## Social Preview

Social preview should show:

- `.ontos Protocol`
- plain-text project context
- `ontosfmt`
- `@ontos-protocol/*`

Do not use unrelated product names, app screenshots, or private project
context in the social preview.

## Repository Project Board

Create a launch board with columns:

- Backlog
- Ready
- In progress
- In review
- Blocked
- Done

Suggested views:

- 1.0 release gate
- Docs and examples
- Parser and CLI
- Viewer and editor integrations
- Launch response

Project board configuration is recorded in
`config/github-project-board.json`.

Generate the command pack:

```bash
npm run project:commands
npm run validate:project-commands
```

Output:

```text
.release/github-project-board-commands.sh
```

The command pack creates the project, status and area fields, and initial draft
items. Configure the suggested project views in the GitHub UI if the CLI does
not expose view creation for the installed version.

## Public Switch Checklist

- `npm run release:check` passes.
- Forbidden public terms scan returns no matches.
- Packages are published or ready to publish in the same release window.
- Documentation site or GitHub Pages build is ready.
- Release notes and changelog are final.
- Issue templates and pull request template are present.
- Maintainers are ready to triage launch feedback.
