# VS Code Extension Publishing

This runbook defines how to build, verify, and publish the `.ontos Protocol`
VS Code-compatible extension.

## Package Identity

- Extension package: `ontos-protocol-vscode`
- Display name: `.ontos Protocol`
- Publisher: `ontos-protocol`
- Version: read from `extensions/vscode/package.json`
- VSIX artifact: `.release/ontos-protocol-vscode-<version>.vsix`
- Source package: `extensions/vscode/package.json`

For extension-only patches, the extension version may move ahead of the npm
package version. The GitHub release tag must match the VSIX version.

## Build VSIX

Run from the monorepo root:

```bash
npm ci
npm run build
npm run release:vscode-vsix
```

Expected output for version `1.0.1`:

```text
.release/ontos-protocol-vscode-1.0.1.vsix
```

`npm run release:archives` also includes the VSIX in `.release/SHA256SUMS`.

Verify the VSIX exists and is checksummed:

```bash
test -f .release/ontos-protocol-vscode-1.0.1.vsix
npm run validate:release-archives
```

## Local Install

For VS Code:

```bash
code --install-extension .release/ontos-protocol-vscode-1.0.1.vsix
```

For Cursor, use the Extensions view command menu and install the same VSIX from
disk if Open VSX publishing has not completed yet.

Expected behavior after install:

- opening `examples/project-state.ontos` shows `.ontos Tree` by default
- `.ontos: Open as Text` opens source text without immediate tree promotion
- `.ontos: Open as Tree` returns to the custom editor
- `.ontos: Copy Context Pack` works from the tree tab focus, Node Tree
  selection, or text cursor

## Open VSX

Open VSX is the required distribution path for Cursor, VSCodium, and other
Open VSX clients.

Preconditions:

- namespace `ontos-protocol` exists in Open VSX
- namespace `ontos-protocol` is verified or a claim issue has been filed
- release owner has an Open VSX access token
- `npm run release:vscode-vsix` has produced the VSIX for the manifest version

Publish:

```bash
npx --yes ovsx@1.0.0 publish .release/ontos-protocol-vscode-1.0.1.vsix --skip-duplicate
```

Expected public URL after publication:

```text
https://open-vsx.org/extension/ontos-protocol/ontos-protocol-vscode
```

Verify in Cursor:

1. Open Extensions.
2. Search `.ontos Protocol`.
3. Install the extension.
4. Open a `.ontos` file.
5. Confirm the main editor tab is `.ontos Tree`.

Verify public metadata:

```bash
npm run verify:extension-marketplaces
```

## Visual Studio Marketplace

Marketplace publishing is recommended for the same extension version so stock
VS Code users can install without a VSIX file.

Preconditions:

- Azure DevOps publisher `ontos-protocol` exists
- release owner has a Marketplace personal access token configured for `vsce`
- the VSIX is the same file published to Open VSX

Publish:

```bash
npx --yes @vscode/vsce@3.9.2 publish --packagePath .release/ontos-protocol-vscode-1.0.1.vsix
```

Expected public URL after publication:

```text
https://marketplace.visualstudio.com/items?itemName=ontos-protocol.ontos-protocol-vscode
```

## Release Coordination

Publish order:

1. Run `npm run release:check`.
2. Publish npm packages using [npm Publishing Runbook](NPM_PUBLISHING.md).
3. Build `.release/ontos-protocol-vscode-<version>.vsix`.
4. Publish the VSIX to Open VSX.
5. Publish the same VSIX to Visual Studio Marketplace.
6. Attach the VSIX and `.release/SHA256SUMS` to the GitHub release.
7. Record public URLs in `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.

Do not mark release approval complete until VS Code and Cursor manual UX
evidence is recorded from `docs/VSCODE_EXTENSION_MANUAL_UX_CHECKLIST.md`.

## Rollback And Patch

If the extension has not been published yet:

- fix the issue
- rerun `npm run release:check`
- rebuild the VSIX

If Open VSX or Marketplace publication has already happened:

- do not silently replace the release artifact
- publish a patch version
- update `CHANGELOG.md`
- update release notes
- record the incident and patch link in the release issue

If private or sensitive data is discovered:

- remove or unpublish the affected extension version where the registry allows
- rotate any exposed credentials
- publish a corrected patch
- document the security response in the release issue
