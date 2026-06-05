# Dependency Policy

Updated: 2026-06-05

This policy defines how dependencies are selected and maintained.

## Principles

- Keep core dependencies small.
- Avoid unnecessary runtime dependencies.
- Prefer stable, widely used packages.
- Avoid packages with unclear licenses.
- Avoid packages that require network services for core functionality.
- Avoid dependencies that make `.ontos` files unreadable outside the toolchain.

## Allowed Licenses

Allowed by default:

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC

Needs review:

- MPL-2.0
- LGPL
- GPL
- AGPL
- custom licenses

## Runtime Dependencies

Runtime dependencies must be justified for:

- parser
- schema
- CLI
- viewer

The parser package should have the smallest possible dependency surface because
it is the core adoption path for other tools.

## Dependency Review

Before adding a dependency, check:

- license
- maintenance status
- package size
- transitive dependencies
- security history
- Node and browser compatibility
- release cadence

## Security

Required checks:

- dependency audit in CI
- lockfile review
- package publish dry run
- secret scan
- Dependabot weekly npm update review
- Dependabot weekly GitHub Actions update review
- CodeQL static analysis for JavaScript surfaces
- no unexpected postinstall scripts where possible

## Automation

The repository includes:

- `.github/dependabot.yml` for npm and GitHub Actions updates
- `.github/workflows/codeql.yml` for CodeQL analysis

Dependabot pull requests should be treated as ordinary dependency changes:
review package purpose, release notes, license impact, transitive dependency
changes, and lockfile diffs before merge.

CodeQL findings should be triaged before public release if they affect parser
input handling, CLI file operations, viewer rendering, HTML export, package
publishing, or extension workspace behavior.

## Removal

Dependencies should be removed when:

- they are unmaintained
- they introduce security risk
- they can be replaced with simple local code
- they significantly increase package size without clear value
