# Release Issue: .ontos Protocol 1.0.0

Use this as the tracking issue body for the `v1.0.0` release.

## Owners

- [ ] Copy final approvals from `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.
- [ ] Release owner:
- [ ] Protocol specification owner:
- [ ] Parser and CLI owner:
- [ ] Viewer owner:
- [ ] Documentation owner:
- [ ] Release operations owner:
- [ ] Security contact:
- [ ] npm publishing owner:
- [ ] GitHub repository administrator:
- [ ] Website deployment owner:
- [ ] Launch-week triage owner:

## Dates

- [ ] Confirm dates in `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.
- [ ] Release freeze date:
- [ ] Documentation freeze date:
- [ ] Public launch date:

## Local Gate

- [ ] `npm ci`
- [ ] `npm run release:check`
- [ ] Public-boundary scan has zero findings.
- [ ] `git status --short` has no unintended changes.

## Repository

- [ ] Create repository `ontos-protocol/ontos-protocol`.
- [ ] Push `main`.
- [ ] Apply topics from `config/repository-settings.json`.
- [ ] Apply labels from `.github/labels.yml`.
- [ ] Enable discussions.
- [ ] Create launch project board from `config/github-project-board.json`.
- [ ] Apply branch protection from `.github/branch-protection-main.json`.
- [ ] Upload social preview image.

## Packages

- [ ] Publish `@ontos-protocol/schema@1.0.0`.
- [ ] Publish `@ontos-protocol/parser@1.0.0`.
- [ ] Publish `@ontos-protocol/viewer@1.0.0`.
- [ ] Publish `@ontos-protocol/cli@1.0.0`.
- [ ] Run `npm run postpublish:smoke`.
- [ ] Record npm publish timestamps.

## VS Code Extension

- [ ] Run `npm run release:vscode-vsix`.
- [ ] Publish `.release/ontos-protocol-vscode-1.0.0.vsix` to Open VSX.
- [ ] Publish the same VSIX to Visual Studio Marketplace, if approved.
- [ ] Confirm Cursor can install `.ontos Protocol` from Open VSX.
- [ ] Confirm VS Code can install `.ontos Protocol` from Marketplace or VSIX.
- [ ] Record extension URLs in `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.

## Docs And Demo

- [ ] Deploy documentation site.
- [ ] Confirm deployed canonical URL.
- [ ] Confirm hosted viewer demo opens `examples/project-state.ontos`.
- [ ] Confirm docs links point to the public repository.
- [ ] Confirm `.ontos Protocol` public naming is consistent.

## GitHub Release

- [ ] Create tag `v1.0.0`.
- [ ] Publish GitHub release with `docs/RELEASE_NOTES_1.0.0.md`.
- [ ] Link spec, schema, examples, docs, packages, security policy, and changelog.
- [ ] Run `npm run release:archives`.
- [ ] Run `npm run validate:release-archives`.
- [ ] Run `npm run release:commands`.
- [ ] Run `npm run validate:external-commands`.
- [ ] Run `npm run release:verify-commands`.
- [ ] Run `npm run validate:release-verify-commands`.
- [ ] Run `npm run project:commands`.
- [ ] Run `npm run validate:project-commands`.
- [ ] Run `npm run launch:content`.
- [ ] Run `npm run validate:launch-content`.
- [ ] Attach viewer and docs build archives if used.
- [ ] Attach `.release/ontos-protocol-vscode-1.0.0.vsix`.
- [ ] Attach `.release/ontos-protocol-60s-demo.mp4` if demo video is uploaded.
- [ ] Attach `.release/external-release-commands.sh` if command pack is archived.
- [ ] Attach `.release/SHA256SUMS` if archives are uploaded.

## Launch Content

- [ ] Approve launch article.
- [ ] Approve `.release/launch-content-pack/`.
- [ ] Approve Hacker News post.
- [ ] Approve Product Hunt copy if used.
- [ ] Approve Reddit post.
- [ ] Approve LinkedIn post.
- [ ] Approve 60-second demo script.

## Public Switch

- [ ] Make repository public.
- [ ] Publish launch article.
- [ ] Share GitHub link.
- [ ] Share demo video if available.
- [ ] Share to relevant AI coding, developer tooling, and structured notes communities.

## Launch Response

- [ ] Start launch-week triage watch.
- [ ] Run `.release/external-release-verification.sh`.
- [ ] Record external verification output.
- [ ] Label every issue.
- [ ] Reply to reproducible install failures first.
- [ ] Pin known issues if they affect install, docs, or viewer demo.
- [ ] Move compatibility design questions into RFC discussion.
- [ ] Avoid unreviewed syntax, AST, or compatibility changes during launch week.

## Completion

- [ ] Repository is public.
- [ ] npm packages are published and installable.
- [ ] Docs site is live.
- [ ] Demo viewer is live.
- [ ] GitHub release is live.
- [ ] Launch content is published.
- [ ] First 24-hour monitoring record is complete.
