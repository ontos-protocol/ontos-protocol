# npm Publishing Runbook

This runbook defines how to publish `.ontos Protocol 1.0.0` packages.

## Packages

Publish these packages for `1.0.0`:

```text
@ontos-protocol/schema
@ontos-protocol/parser
@ontos-protocol/viewer
@ontos-protocol/cli
```

Publishing order:

1. `@ontos-protocol/schema`
2. `@ontos-protocol/parser`
3. `@ontos-protocol/viewer`
4. `@ontos-protocol/cli`

The CLI is last because it depends on schema and parser packages.

## Preconditions

- `npm run release:check` passes on the release commit.
- `package-lock.json` is committed and matches `package.json`.
- Package versions are exactly `1.0.0`.
- npm account has publish rights for `@ontos-protocol`.
- npm account has 2FA ready if required by the organization.
- Release notes and changelog are final.
- Public naming scan passes with zero findings.

## Dry Run

Run:

```bash
npm run publish:dry-run
```

Inspect the dry-run output for each package:

- package name
- package version
- file list
- unpacked size
- tarball size
- license
- repository metadata
- binary mapping for `@ontos-protocol/cli`

## Publish

Publish each workspace explicitly:

```bash
npm publish --access public -w @ontos-protocol/schema
npm publish --access public -w @ontos-protocol/parser
npm publish --access public -w @ontos-protocol/viewer
npm publish --access public -w @ontos-protocol/cli
```

Do not use `npm publish --workspaces` for the first stable release. Explicit
workspace publishing makes dependency order and failure handling clearer.

## Post-Publish Verification

Run:

```bash
npm run postpublish:smoke
```

This checks the published versions, installs all packages into a clean
directory, runs `ontosfmt --version`, runs `ontosfmt doctor`, and validates a
sample file.

Manual equivalent:

```bash
npm init -y
npm install @ontos-protocol/schema@1.0.0 @ontos-protocol/parser@1.0.0 @ontos-protocol/viewer@1.0.0 @ontos-protocol/cli@1.0.0
npx ontosfmt --version
npx ontosfmt doctor
```

Expected output:

```text
1.0.0
```

`ontosfmt doctor` must report:

```text
status ok
```

Then validate a sample file:

```bash
cat > sample.ontos <<'EOF'
@ontos 1.0
@title Publish Smoke

- Root @id(root)
  purpose: Verify published package install.
EOF

npx ontosfmt validate sample.ontos
```

Expected result:

```text
sample.ontos: ok
```

## Failure Handling

If publishing fails before any package is published:

- stop
- fix the issue
- rerun `npm run release:check`
- restart the publishing sequence

If publishing fails after one or more packages are published:

- do not unpublish unless there is a security or private-information issue
- document the partial state in the release issue
- fix the remaining package
- rerun the relevant package smoke check
- publish the missing package

If an already published package has a critical release bug:

- publish a patch version
- update `CHANGELOG.md`
- update release notes
- announce the patch clearly

## Dist Tags

The first stable release should publish to `latest`.

Verify:

```bash
npm view @ontos-protocol/cli dist-tags
```

Expected:

```text
latest: 1.0.0
```

## Release Record

Record these values in the release issue:

- package names
- published versions
- publish timestamps
- npm account used
- `npm run release:check` result
- post-publish install smoke result
