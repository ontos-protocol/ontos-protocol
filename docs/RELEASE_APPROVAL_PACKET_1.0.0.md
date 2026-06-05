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
- [ ] Package publish dry run passed.
- [ ] Release archives and `SHA256SUMS` were generated.
- [ ] External release command pack was generated and reviewed.
- [ ] External release verification command pack was generated and reviewed.
- [ ] GitHub project board command pack was generated and reviewed.
- [ ] Launch content pack was generated and reviewed.
- [ ] VS Code and Cursor manual UX checklist completed from `docs/VSCODE_EXTENSION_MANUAL_UX_CHECKLIST.md`.
- [ ] Release notes approved.
- [ ] Launch content approved.
- [ ] Maintainers ready for launch response.

## External Evidence

Record links or command output after external launch actions are complete:

- [ ] GitHub repository URL:
- [ ] Branch protection confirmation:
- [ ] npm package URLs:
- [ ] Git tag URL:
- [ ] GitHub release URL:
- [ ] Documentation site URL:
- [ ] Hosted viewer demo URL:
- [ ] Open VSX extension URL:
- [ ] Visual Studio Marketplace extension URL:
- [ ] Launch article URL:
- [ ] Demo video URL, if published:
- [ ] External command pack URL, if attached:
- [ ] GitHub project board URL:
- [ ] External verification output:
- [ ] Post-publish smoke output:
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
