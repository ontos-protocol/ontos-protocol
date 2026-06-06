# External Release Plan 1.0.0

This plan covers the external steps that cannot be completed by local release
checks alone.

## Inputs

- Repository: `ontos-protocol/ontos-protocol`
- Default branch: `main`
- Release tag: `v1.0.0`
- Docs URL: `https://ontos-protocol.github.io/ontos-protocol/`
- Required local gate: `npm run release:check`
- Required extension gate: Visual Studio Marketplace URL for `.ontos Protocol`

## Command Pack

Generate the external command pack before launch:

```bash
npm run release:commands
npm run release:verify-commands
npm run project:commands
npm run launch:content
npm run release:vscode-vsix
npm run validate:external-commands
npm run validate:release-verify-commands
npm run validate:project-commands
npm run validate:launch-content
```

Output:

```text
.release/external-release-commands.sh
.release/external-release-verification.sh
.release/github-project-board-commands.sh
.release/ontos-protocol-vscode-1.0.0.vsix
.release/launch-content-pack/
```

The generated script is an execution plan, not an automatic release bot. Review
each command before running it because later phases publish npm packages,
create GitHub releases, and switch repository visibility.

## 1. Repository Creation

Create the repository privately first:

```bash
gh repo create ontos-protocol/ontos-protocol --private --description "AI-native structured text protocol for project context" --homepage "https://ontos-protocol.github.io/ontos-protocol/"
git remote add origin git@github.com:ontos-protocol/ontos-protocol.git
git push -u origin main
```

Apply repository metadata:

```bash
gh repo edit ontos-protocol/ontos-protocol --enable-issues=true --enable-discussions=true --enable-projects=true --enable-wiki=false --default-branch main --description "AI-native structured text protocol for project context" --homepage "https://ontos-protocol.github.io/ontos-protocol/" --add-topic ai --add-topic protocol --add-topic text-format --add-topic markdown --add-topic outline --add-topic developer-tools --add-topic plain-text --add-topic project-management --add-topic structured-text --add-topic cli
```

## 2. Labels

Create or update labels from `.github/labels.yml`:

```bash
gh label create "bug" --color d73a4a --description "Something is broken or confusing." --force
gh label create "documentation" --color 0075ca --description "Documentation needs to be added, clarified, or corrected." --force
gh label create "enhancement" --color a2eeef --description "New capability or improvement." --force
gh label create "compatibility" --color fbca04 --description "Format, AST, parser, or tooling compatibility concern." --force
gh label create "conformance" --color c5def5 --description "Official fixtures, snapshots, or interoperability tests." --force
gh label create "security" --color b60205 --description "Security hardening, disclosure, or dependency risk." --force
gh label create "dependencies" --color 0366d6 --description "Dependency updates, lockfile maintenance, or supply-chain review." --force
gh label create "rfc" --color 5319e7 --description "Request for comments on a material project change." --force
gh label create "good first issue" --color 7057ff --description "Small, well-scoped issue for new contributors." --force
gh label create "help wanted" --color 008672 --description "Maintainers welcome external help." --force
gh label create "release" --color 1d76db --description "Release preparation, packaging, or operations." --force
```

## 3. Security Automation

Confirm GitHub security automation after the repository is pushed:

```bash
gh workflow view CodeQL --repo ontos-protocol/ontos-protocol
gh api repos/ontos-protocol/ontos-protocol/dependabot/alerts --paginate --jq 'length'
```

Expected:

- CodeQL workflow is visible.
- Dependabot alerts endpoint is accessible to repository administrators.
- Dependency update PRs use the `dependencies` label.

## 4. Project Board

Generate and run the project board command pack:

```bash
npm run project:commands
npm run validate:project-commands
bash .release/github-project-board-commands.sh
```

This creates `.ontos Protocol 1.0 Launch` with Launch Status and Area fields plus
initial launch tracking items. Configure views from `config/github-project-board.json`
in the GitHub UI if needed.

## 5. Branch Protection

Apply the checked-in branch protection template:

```bash
gh api --method PUT repos/ontos-protocol/ontos-protocol/branches/main/protection --input .github/branch-protection-main.json
```

## 6. Release Gate

Run the full local gate on the release commit:

```bash
npm ci
npm run release:check
git status --short
```

Expected: `release:check` passes and no unintended files are modified.

## 7. Package Publishing

Publish packages in dependency order:

```bash
npm publish --access public -w @ontos-protocol/schema
npm publish --access public -w @ontos-protocol/parser
npm publish --access public -w @ontos-protocol/viewer
npm publish --access public -w @ontos-protocol/cli
```

Verify:

```bash
npm view @ontos-protocol/cli version
npm view @ontos-protocol/cli dist-tags
```

## 8. VS Code Extension Publishing

Build the release VSIX:

```bash
npm run release:vscode-vsix
```

Publish to Open VSX for Cursor, VSCodium, and other Open VSX clients:

```bash
npx --yes ovsx@1.0.0 publish .release/ontos-protocol-vscode-1.0.0.vsix --publisher ontos-protocol
```

Publish the same VSIX to Visual Studio Marketplace when the Marketplace
publisher is ready. This is a hard gate for the public 1.0 switch:

```bash
npx --yes @vscode/vsce@3.9.2 publish --packagePath .release/ontos-protocol-vscode-1.0.0.vsix
```

Record the Visual Studio Marketplace URL in
`docs/RELEASE_APPROVAL_PACKET_1.0.0.md`. Open VSX may be published in the same
window, but it does not replace the Marketplace gate.

## 9. Tag And GitHub Release

Create the release tag after package publishing succeeds:

```bash
git tag -a v1.0.0 -m ".ontos Protocol 1.0.0"
git push origin v1.0.0
gh release create v1.0.0 --title ".ontos Protocol 1.0.0" --notes-file docs/RELEASE_NOTES_1.0.0.md
```

If signed tags are available, use `git tag -s` instead of `git tag -a`.

If attaching static build archives, build and upload them:

```bash
npm run release:archives
npm run demo:video
npm run release:commands
npm run validate:release-archives
npm run validate:demo-video
gh release upload v1.0.0 .release/ontos-viewer-1.0.0.tar.gz .release/ontos-docs-1.0.0.tar.gz .release/ontos-protocol-vscode-1.0.0.vsix .release/ontos-protocol-60s-demo.mp4 .release/external-release-commands.sh .release/SHA256SUMS
```

## 10. Docs And Demo

Run the docs deployment workflow:

```bash
gh workflow run deploy-docs.yml --repo ontos-protocol/ontos-protocol --ref v1.0.0
```

Verify:

- `https://ontos-protocol.github.io/ontos-protocol/` loads.
- The viewer demo opens `examples/project-state.ontos`.
- Docs links point to the public repository.
- The canonical URL matches the deployed URL.

## 10. Public Switch

Switch the repository to public only after packages, docs, demo, release notes,
and the Visual Studio Marketplace extension page are all live:

```bash
gh repo edit ontos-protocol/ontos-protocol --visibility public
```

## 11. Launch

Publish the prepared launch article and social posts from
`docs/LAUNCH_CONTENT.md`.

Track the first launch week with:

- GitHub issues
- GitHub discussions
- npm install reports
- docs and demo errors
- compatibility feedback

## 12. External Verification

After launch actions complete, run:

```bash
bash .release/external-release-verification.sh
```

Record the output in the release issue and
`docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.

Then run:

```bash
npm run validate:release-approval-final
```

Expected: the final approval packet has owners, dates, public URLs, Marketplace
evidence, post-publish smoke output, and first-day monitoring evidence filled.

## Rollback Rules

- If package publishing fails before any package is published, stop and rerun
  `npm run release:check` after fixing the issue.
- If one or more packages are already published, do not unpublish unless there
  is a security or private-information issue.
- If docs deployment fails, keep the repository private until deployment is
  fixed or publish with the GitHub release as the canonical entry point.
