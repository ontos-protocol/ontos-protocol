# Release Artifacts 1.0.0

This checklist defines the expected release artifacts for `.ontos Protocol`
1.0.0.

## Source Archive

The source archive must include:

- `README.md`
- `LICENSE`
- `CHANGELOG.md`
- `spec/ontos-format-1.0.md`
- `spec/ontos-ast-schema-1.0.json`
- `spec/conformance/`
- `docs/`
- `examples/`
- `packages/`
- `apps/viewer/`
- `extensions/vscode/`
- `extensions/obsidian/`
- `website/`
- `.github/`
- `docs/RUNTIME_TARGETS.md`

The source archive must not include local dependency folders, generated package
archives, local environment files, native secrets, or generated editor test
plugin folders.

## Build Artifacts

The release build command prepares these generated artifacts:

- `website/dist/index.html`
- `apps/viewer/dist/index.html`
- `extensions/obsidian/dist/main.js`

The hosted documentation site should be deployed from `website/dist/`.

The hosted viewer demo should be deployed from `apps/viewer/dist/` or attached
to the GitHub release as a static build archive.

Generate release archives with:

```bash
npm run release:archives
npm run validate:release-archives
```

Expected archive outputs:

- `.release/ontos-viewer-1.0.0.tar.gz`
- `.release/ontos-docs-1.0.0.tar.gz`
- `.release/ontos-protocol-vscode-1.0.0.vsix`
- `.release/SHA256SUMS`

`SHA256SUMS` must include the viewer archive, docs archive, and VS Code VSIX.

## VS Code Extension VSIX

Generate the release VSIX with:

```bash
npm run release:vscode-vsix
```

Expected VSIX output:

- `.release/ontos-protocol-vscode-1.0.0.vsix`

The same VSIX is used for:

- local install smoke checks
- Open VSX publishing
- Visual Studio Marketplace publishing
- GitHub Release attachment

Verify the local artifact with:

```bash
test -f .release/ontos-protocol-vscode-1.0.0.vsix
npm run validate:release-archives
```

## Launch Media

Generate the 60-second demo video with:

```bash
npm run demo:video
npm run validate:demo-video
```

Expected media output:

- `.release/ontos-protocol-60s-demo.mp4`

The demo video checksum is appended to `.release/SHA256SUMS`.

## External Command Pack

Generate the external command pack with:

```bash
npm run release:commands
npm run validate:external-commands
```

Expected command output:

- `.release/external-release-commands.sh`

The command pack contains the reviewed GitHub, npm, docs deployment, release
asset upload, and public switch commands for the 1.0.0 launch.

## External Verification Command Pack

Generate the external verification command pack with:

```bash
npm run release:verify-commands
npm run validate:release-verify-commands
```

Expected command output:

- `.release/external-release-verification.sh`

Run this command pack after external launch actions complete. It records
evidence for repository visibility, GitHub release assets, npm versions, docs
availability, starter issues, discussions, and public-boundary checks.

## GitHub Project Board Command Pack

Generate the GitHub project board command pack with:

```bash
npm run project:commands
npm run validate:project-commands
```

Expected command output:

- `.release/github-project-board-commands.sh`

The command pack creates the `.ontos Protocol 1.0 Launch` project, Launch Status and
Area fields, and launch tracking draft items. Suggested views are defined in
`config/github-project-board.json`.

## Community Issue Command Pack

Generate starter issue commands with:

```bash
npm run community:commands
npm run validate:community-commands
```

Expected command output:

- `.release/community-starter-issues.sh`

The community command pack creates the prepared `good first issue` and
`help wanted` issues after the repository is public and labels are configured.

## Launch Content Pack

Generate platform-ready launch copy with:

```bash
npm run launch:content
npm run validate:launch-content
```

Expected content output:

- `.release/launch-content-pack/README.md`
- `.release/launch-content-pack/launch-article.md`
- `.release/launch-content-pack/x-thread.md`
- `.release/launch-content-pack/hacker-news.md`
- `.release/launch-content-pack/product-hunt.md`
- `.release/launch-content-pack/reddit.md`
- `.release/launch-content-pack/linkedin.md`
- `.release/launch-content-pack/visual-assets.md`
- `.release/launch-content-pack/submission-checklist.md`
- `.release/launch-content-pack/metadata.json`

The content pack is generated from `docs/LAUNCH_CONTENT.md` and should be used
as the copy source for announcement posts, maintainer replies, and launch
article publication.

## Checksums

The 1.0.0 release does not distribute native binaries. Static build archives,
the VS Code VSIX, and launch media use SHA-256 checksums generated in
`.release/SHA256SUMS`.

## Release Links

GitHub release notes should link to:

- `README.md`
- `docs/FORMAT_GUIDE.md`
- `docs/AI_AGENT_WORKFLOWS.md`
- `docs/COMPATIBILITY_POLICY.md`
- `docs/RUNTIME_TARGETS.md`
- `docs/VSCODE_PUBLISHING.md`
- `spec/ontos-format-1.0.md`
- `spec/conformance/`
- `examples/`
- `apps/viewer/`
