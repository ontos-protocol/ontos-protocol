# Launch Runbook

This runbook coordinates the public `.ontos Protocol 1.0.0` release.

## Launch Principle

Ship when the protocol, packages, docs, examples, release notes, and public
message are ready together. Do not announce a release while package publishing,
docs deployment, or public naming is inconsistent.

## Required Owners

Assign one named person for each role before launch day:

- release owner
- specification owner
- parser and CLI owner
- viewer owner
- documentation owner
- release operations owner
- security owner
- launch-week triage owner

## T-7 Days

- Confirm repository name is `ontos-protocol`.
- Confirm README title is `# .ontos Protocol`.
- Confirm package names use `@ontos-protocol`.
- Confirm CLI command is `ontosfmt`.
- Confirm no public file uses retired names or unrelated product context.
- Confirm release notes cover shipped packages.
- Confirm launch content uses one consistent message.
- Confirm issue labels and templates are ready.
- Confirm maintainer availability for launch week.

## T-2 Days

Run:

```bash
npm run release:check
```

Then verify:

- docs build output exists in `website/dist`
- Obsidian build output exists in `extensions/obsidian/dist`
- package dry run passes
- package smoke test passes
- public-boundary scan passes
- secret scan passes
- documentation link check passes
- examples validate and export

Freeze:

- spec
- AST schema
- package names
- CLI command names
- launch article
- release notes

## T-1 Day

- Open the release tracking issue using `docs/RELEASE_ISSUE_1.0.0.md`.
- Fill the final approval packet in `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.
- Generate external launch commands with `npm run release:commands`.
- Generate external verification commands with `npm run release:verify-commands`.
- Generate GitHub project board commands with `npm run project:commands`.
- Generate community starter issue commands with `npm run community:commands`.
- Generate launch content pack with `npm run launch:content`.
- Prepare GitHub release draft for `v1.0.0`.
- Prepare npm publishing session.
- Prepare docs deployment.
- Prepare launch article.
- Confirm Visual Studio Marketplace publisher access and `vsce` token.
- Build and review the 60-second demo from `docs/DEMO_VIDEO_60S.md`.
- Prepare announcement posts from `docs/LAUNCH_CONTENT.md`.
- Prepare known-issues section, even if empty.
- Prepare first-day monitoring from `docs/POST_LAUNCH_MONITORING.md`.
- Confirm rollback and patch release criteria.

## Launch Day Sequence

External execution follows `docs/EXTERNAL_RELEASE_PLAN_1.0.0.md`: publish npm
packages, deploy docs site, publish the demo, publish the release, and then
switch the repository to public.

1. Run `npm run release:check`.
2. Review `.release/external-release-commands.sh`.
3. Review `.release/github-project-board-commands.sh`.
4. Review `.release/launch-content-pack/`.
5. Create or update the public repository.
6. Create the GitHub project board if ready.
7. Confirm branch protection for `main`.
8. Publish npm packages using `docs/NPM_PUBLISHING.md`.
9. Run `npm run postpublish:smoke`.
10. Deploy documentation site.
11. Verify docs and viewer demo URLs.
12. Publish `.release/ontos-protocol-vscode-1.0.0.vsix` to Visual Studio Marketplace.
13. Record the Marketplace URL in `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.
14. Tag `v1.0.0`.
15. Publish GitHub release.
16. Attach or link `.release/ontos-protocol-60s-demo.mp4`.
17. Publish launch article.
18. Share announcement posts.
19. Create starter issues from `.release/community-starter-issues.sh` if ready.
20. Run `.release/external-release-verification.sh`.
21. Start launch-week triage watch.
22. Record first-day monitoring in the release issue.
23. Run `npm run validate:release-approval-final`.

## GitHub Release Checklist

The `v1.0.0` GitHub release must include:

- release summary
- package install instructions
- quickstart command
- compatibility statement
- known limitations
- links to spec, schema, examples, docs, security policy, and changelog
- npm package links

## Launch Response

During the first 24 hours:

- label every issue
- acknowledge reproducible bugs
- move compatibility questions to RFC discussion when needed
- pin known issues if they affect installs or docs
- avoid unreviewed syntax or AST changes
- keep public responses factual and specific

## Pause Criteria

Pause announcements if:

- `ontosfmt` cannot install
- package versions are inconsistent
- Visual Studio Marketplace publishing has not produced a public extension URL
- docs deploy shows outdated content
- public naming is inconsistent
- security or private-information risk appears
- official examples fail in a clean checkout

## Completion Criteria

Launch is complete when:

- repository is public
- packages are published
- docs site is live
- Visual Studio Marketplace extension page is live
- GitHub release is published
- launch content is published
- post-publish install smoke passes
- launch-week triage owner is actively monitoring feedback
