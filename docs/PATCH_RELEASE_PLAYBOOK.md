# Patch Release Playbook

Use this playbook when a `1.0.x` patch is needed after launch.

## Patch Scope

Allowed in a patch release:

- parser bug fixes that preserve documented behavior
- CLI runtime fixes
- package metadata fixes
- documentation corrections
- viewer or editor integration fixes
- conformance fixture corrections that match the 1.0 spec

Not allowed without RFC review:

- syntax changes
- AST breaking changes
- renamed fields
- removed diagnostics
- changed package names
- changed CLI command names

## Triage

Before approving a patch:

- reproduce the bug
- confirm affected version
- identify workaround if any
- decide whether the issue blocks install, validation, docs, or security
- assign a patch owner

## Patch Steps

1. Create a patch branch.
2. Update affected code, docs, or fixtures.
3. Add a regression test.
4. Update `CHANGELOG.md`.
5. Update release notes or known issue notes.
6. Run `npm run release:check`.
7. Publish patch packages in dependency order if packages changed.
8. For VS Code-compatible extension patches, publish the same VSIX to both
   Open VSX and Visual Studio Marketplace.
9. Publish a GitHub patch release and attach the VSIX plus `SHA256SUMS`.
10. Reply to affected issues with verification steps.

## Extension Patch Matrix

When only `extensions/vscode` changes:

- bump `extensions/vscode/package.json`
- rebuild `.release/ontos-protocol-vscode-<version>.vsix`
- publish the VSIX to Visual Studio Marketplace
- publish the same VSIX to Open VSX
- create a GitHub release `v<version>` with the VSIX and checksums
- run `npm run verify:extension-marketplaces`

Do not publish npm packages for an extension-only patch unless parser, schema,
viewer, or CLI package contents changed.

## Patch Verification

Run:

```bash
npm run release:check
```

For extension marketplace verification, run:

```bash
npm run verify:extension-marketplaces
```

After publishing packages, run:

```bash
ONTOS_RELEASE_VERSION=1.0.x npm run postpublish:smoke
```

Replace `1.0.x` with the patch version.

## Patch Communication

Patch release notes must include:

- affected versions
- fixed behavior
- migration impact, if any
- workaround, if any
- verification command
