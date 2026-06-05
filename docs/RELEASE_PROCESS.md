# Release Process

Updated: 2026-06-05

This document defines the release process for `.ontos Protocol`.

## Release Version

The first formal open-source release is:

```text
v1.0.0
```

It includes:

- `.ontos Format 1.0`
- `ontosfmt 1.0.0`
- `@ontos-protocol/parser`
- `@ontos-protocol/schema`
- `@ontos-protocol/cli`
- `@ontos-protocol/viewer`

## Release Phases

### 1. Planning

- confirm release owner
- confirm release date
- confirm release scope
- confirm freeze dates
- confirm package list
- confirm docs site URL
- confirm launch content owners
- confirm security owner

### 2. Implementation

- complete spec
- complete parser
- complete validator
- complete formatter
- complete exporters
- complete importers
- complete CLI
- complete AI packs
- complete viewer
- complete editor integrations
- complete examples
- complete docs

### 3. Freeze

- freeze spec
- freeze AST schema
- freeze standard fields
- freeze CLI command names
- freeze package names
- freeze public naming
- freeze launch copy

### 4. Verification

- run full CI
- run conformance tests
- run package dry run
- run install smoke tests
- run docs build
- run security scan
- run public-boundary scan
- validate examples
- export examples
- inspect package contents

### 5. Release

- create release branch if used
- tag `v1.0.0`
- publish npm packages
- publish GitHub release
- deploy docs site
- deploy viewer demo
- publish launch article
- announce release

### 6. Post-Release

- monitor issues
- monitor package install reports
- monitor docs reports
- triage launch feedback
- publish patch if required
- document known issues
- plan next compatible release

## Required Commands

Release checks should be represented by scripts:

```bash
npm run build
npm run test
npm run lint
npm run typecheck
npm run format
npm run validate:json
npm run validate:links
npm run validate:ast
npm run validate:ast-consumers
npm run validate:examples
npm run validate:conformance
npm run test:fuzz
npm run test:path
npm run test:cross-platform-cli
npm run test:vscode-local-install
npm run test:ordering
npm run test:performance
npm run test:viewer-browser
npm run test:screen-reader
npm run test:coverage
npm run validate:website
npm run validate:accessibility
npm run validate:visual-regression
npm run validate:release-artifacts
npm run release:archives
npm run demo:video
npm run release:commands
npm run release:verify-commands
npm run project:commands
npm run community:commands
npm run validate:release-archives
npm run validate:demo-video
npm run validate:external-commands
npm run validate:release-verify-commands
npm run validate:project-commands
npm run validate:community-commands
npm run validate:external-release
npm run validate:launch-ops
npm run validate:security-automation
npm run validate:community-readiness
npm run validate:github-community
npm run validate:release-approval
npm run validate:extensions-package
npm run validate:runtime-compat
npm run validate:viewer-app
npm run validate:deployment
npm run package:smoke
npm run publish:dry-run
npm run release:check
```

## Package Publishing Rules

Before publishing:

- package names must match `@ontos-protocol/*`
- versions must match release target
- packages must include license metadata
- packages must include repository metadata
- packages must exclude private files
- package dry run must pass
- install smoke test must pass

## Release Notes

Release notes must include:

- what `.ontos Protocol` is
- what is included in 1.0.0
- install instructions
- quickstart
- compatibility statement
- known limitations
- links to spec
- links to docs
- links to examples
- links to security policy
