# Release Approval Packet 1.0.0

This packet is the final human approval document for `.ontos Protocol 1.0.0`.
Do not mark launch complete until every required approval and external evidence
item is filled.

## Required Owners

- [ ] Release owner:
- [ ] Protocol specification owner:
- [ ] Parser and CLI owner:
- [ ] Viewer owner:
- [ ] Documentation owner:
- [ ] Release operations owner:
- [ ] Security contact owner:
- [ ] npm publishing owner:
- [ ] GitHub repository administrator:
- [ ] Website deployment owner:
- [ ] Launch-week triage owner:

## Required Dates

- [ ] Release freeze date:
- [ ] Documentation freeze date:
- [ ] Public launch date:

## Approval Gates

- [ ] `npm run release:check` passed on the release commit.
- [ ] Public-boundary scan has zero findings.
- [ ] Security scan has zero findings.
- [ ] License scan passed.
- [x] Package publish dry run passed. Evidence: four-workspace npm publish dry run passed on 2026-06-07.
- [x] Release archives and `SHA256SUMS` were generated. Evidence: `npm run release:check` passed on 2026-06-07.
- [x] External release command pack was generated and reviewed. Evidence: `.release/external-release-commands.sh`.
- [x] External release verification command pack was generated and reviewed. Evidence: `.release/external-release-verification.sh`.
- [x] GitHub project board command pack was generated and reviewed. Evidence: `.release/github-project-board-commands.sh`.
- [x] Launch content pack was generated and reviewed. Evidence: `.release/launch-content-pack/`.
- [ ] VS Code and Cursor manual UX checklist completed from `docs/VSCODE_EXTENSION_MANUAL_UX_CHECKLIST.md`.
- [ ] Release notes approved.
- [ ] Launch content approved.
- [ ] Maintainers ready for launch response.

## External Evidence

Record links or command output after external launch actions are complete:

- [x] GitHub repository URL: https://github.com/ontos-protocol/ontos-protocol
- [ ] Branch protection confirmation: blocked while repository is private on the current GitHub plan; enable after public switch or plan upgrade.
- [x] npm package URLs:
  - https://www.npmjs.com/package/@ontos-protocol/schema/v/1.0.0
  - https://www.npmjs.com/package/@ontos-protocol/parser/v/1.0.0
  - https://www.npmjs.com/package/@ontos-protocol/viewer/v/1.0.0
  - https://www.npmjs.com/package/@ontos-protocol/cli/v/1.0.0
- [ ] Git tag URL:
- [ ] GitHub release URL:
- [ ] Documentation site URL:
- [ ] Hosted viewer demo URL:
- [ ] Open VSX extension URL:
- [x] Visual Studio Marketplace extension URL: https://marketplace.visualstudio.com/items?itemName=ontos-protocol.ontos-protocol-vscode
  Evidence: `vsce show ontos-protocol.ontos-protocol-vscode --json` returned `.ontos Protocol` version `1.0.0` on 2026-06-07; Marketplace item page returned HTTP 200 and VSIX SHA256 `6870ed152054670bd512713bf896cc956912ef57ba258e96b7492619c8dddaf1`.
- [ ] Launch article URL:
- [ ] Demo video URL, if published:
- [ ] External command pack URL, if attached:
- [x] GitHub project board URL: https://github.com/orgs/ontos-protocol/projects/1
- [ ] External verification output:
- [x] Post-publish smoke output: `npm run postpublish:smoke` passed on 2026-06-07 with `post-publish smoke ok`.
- [ ] First 24-hour monitoring record:

## Manual UX Evidence

Record final extension UX evidence before publishing:

- [ ] VS Code version:
- [ ] Cursor version:
- [ ] Extension artifact:
- [ ] Manual UX checklist URL or issue comment:
- [ ] Release owner signature:
- [ ] Approval date:

## Completion Rule

The release is complete only when:

- repository is public
- npm packages are published and installable
- docs site is live
- viewer demo is live
- GitHub release is live
- launch content is published
- launch-week triage owner is monitoring feedback
- no private project context appears in public surfaces
