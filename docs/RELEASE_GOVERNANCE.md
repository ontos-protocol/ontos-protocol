# Release Governance

Updated: 2026-06-05

This document defines how `.ontos Protocol` reaches the first formal
open-source release and how release decisions are made.

## Release Target

```text
.ontos Protocol 1.0.0
.ontos Format 1.0
ontosfmt 1.0.0
@ontos-protocol/* 1.0.0
```

## Release Roles

Each formal release must have named owners before the release enters freeze.

Required roles:

- Release owner: owns the release calendar, release gate tracking, and final
  readiness review.
- Specification owner: owns `.ontos Format 1.0`, AST schema, field registry, and
  compatibility decisions.
- Parser owner: owns parser, serializer, formatter, validator, and conformance
  test behavior.
- CLI owner: owns `ontosfmt`, command behavior, exit codes, install path, and
  package release.
- Viewer owner: owns browser viewer quality, accessibility, local-first behavior,
  and demo readiness.
- Documentation owner: owns README, docs site, examples, quickstart, migration
  docs, and launch copy.
- Release operations owner: owns GitHub release, npm publish, website deploy,
  release notes, and rollback process.
- Security owner: owns security review, vulnerability intake, dependency review,
  and secret scanning.
- Triage owner: owns launch-week issue labeling, duplicates, known issues, and
  public responses.

## Decision Rights

The specification owner has final say on:

- format grammar
- AST schema
- standard field semantics
- diagnostics semantics
- compatibility policy
- conformance fixture expectations

The release owner has final say on:

- release freeze
- release readiness
- launch timing
- patch release approval
- rollback decision

The security owner can block release for:

- unsafe parser behavior
- unescaped exporter output
- unexpected network behavior
- dependency supply-chain risk
- exposed private information
- secret leakage

## Release Gates

The release cannot ship unless all gates pass:

- protocol gate
- parser gate
- validator gate
- formatter gate
- exporter gate
- importer gate
- CLI gate
- AI pack gate
- examples gate
- viewer gate
- editor extension gate
- documentation gate
- test and conformance gate
- security and privacy gate
- package publishing gate
- launch content gate

## Freeze Rules

Specification freeze:

- No grammar changes after freeze.
- No AST breaking changes after freeze.
- No standard field semantic changes after freeze.
- Clarifying text is allowed if it does not change behavior.

Code freeze:

- Only release-blocking fixes are allowed.
- No new features.
- No refactors without release owner approval.
- All fixes require tests.

Documentation freeze:

- Critical corrections allowed.
- Broken links allowed.
- Launch copy corrections allowed.
- New conceptual claims require review.

## Release Approval

Release approval requires:

- all CI checks passing
- all official examples validating
- all official examples exporting
- all packages passing publish dry run
- docs site deployed in final form
- public-boundary scan passing
- security scan passing
- release notes approved
- launch content approved
- at least one clean install smoke test

## Rollback Criteria

Rollback or pause launch if:

- packages install incorrectly
- CLI binary does not run
- parser corrupts official files
- exporter emits unsafe HTML
- docs site publishes private or incorrect information
- release package contains unintended files
- security issue is found during launch
- public naming is inconsistent across release artifacts

## Patch Release Rules

Patch releases may include:

- critical parser bug fixes
- critical CLI install fixes
- documentation corrections
- broken link fixes
- security fixes
- diagnostics fixes that do not change accepted syntax

Patch releases must not include:

- syntax changes
- AST breaking changes
- standard field semantic changes
- formatter behavior changes that rewrite user files unexpectedly

