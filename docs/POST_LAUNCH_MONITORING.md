# Post-Launch Monitoring

Use this checklist during the first 24 hours and first week after publishing
`.ontos Protocol 1.0.0`.

## First 24 Hours

Check every two hours during the first launch day:

- GitHub issues
- GitHub discussions
- npm install reports
- docs site availability
- viewer demo availability
- package version consistency
- public naming consistency

## Install Verification

Run after packages are published:

```bash
npm run postpublish:smoke
```

Expected result:

```text
post-publish smoke ok
```

If install verification fails:

- capture the full command output
- check whether the failure is registry propagation, package metadata, or CLI runtime
- pin a known issue if users are affected
- publish a patch only after the root cause is reproduced

## External Release Verification

Generate the external release verification command pack after launch:

```bash
npm run release:verify-commands
npm run validate:release-verify-commands
```

Output:

```text
.release/external-release-verification.sh
```

Run the generated commands after the repository is public, packages are
published, docs are deployed, and the GitHub release exists. Record the command
output in the release issue and approval packet.

The verification pack checks:

- repository visibility and metadata
- branch protection
- GitHub release metadata and assets
- npm package versions and dist-tags
- post-publish install smoke
- documentation URL and default example availability
- starter issues and discussion categories
- final public-boundary scan

## Triage Order

1. Security or private-information reports.
2. Install failures.
3. Broken docs or demo URLs.
4. Parser or CLI correctness bugs.
5. Compatibility questions.
6. Documentation improvements.
7. Feature requests.

## Labels

Apply one primary label first:

- `security`
- `bug`
- `compatibility`
- `documentation`
- `enhancement`
- `rfc`
- `release`

Then add support labels when useful:

- `help wanted`
- `good first issue`
- `conformance`

## Response Rules

- Confirm reproducible bugs with commands or files.
- Ask for a minimal `.ontos` file when reports are unclear.
- Keep compatibility changes out of launch-week hotfixes unless the release is
  unusable without them.
- Do not promise syntax changes in issue comments.
- Move format changes to the RFC process.

## Known Issues Template

```markdown
## Known Issue

Impact:

Affected version:

Workaround:

Status:

Next update:
```

## First Week

- Confirm all high-priority issues are triaged.
- Add `good first issue` items for small docs or fixture improvements.
- Add `help wanted` only where external contribution is realistic.
- Publish clarification docs if repeated questions appear.
- Decide whether a patch release is needed.

## First Month

- Hold first RFC review if compatibility or syntax proposals appear.
- Prioritize roadmap based on real adoption feedback.
- Publish conformance guidance for third-party implementations.
- Prepare the next compatible release plan.
