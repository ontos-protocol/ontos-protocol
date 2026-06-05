# Release Owner Assignment

Updated: 2026-06-05

Use this worksheet before opening the public repository. It turns the release
roles in `docs/MAINTAINERS.md`, `docs/RELEASE_GOVERNANCE.md`, and
`docs/RELEASE_APPROVAL_PACKET_1.0.0.md` into named accountability.

Do not publish the first formal release until every required owner is assigned,
reachable, and available for the launch window.

## Required Owner Table

| Role | Person or handle | Backup | Required access | Launch-window response target | Evidence |
| --- | --- | --- | --- | --- | --- |
| Release owner | TBD | TBD | repository admin or maintainer | same business day | release issue assignment |
| Protocol specification owner | TBD | TBD | maintainer | same business day | spec approval comment |
| Parser and CLI owner | TBD | TBD | maintainer plus npm publish access if shared | same business day | package approval comment |
| Viewer owner | TBD | TBD | maintainer | same business day | viewer approval comment |
| Documentation owner | TBD | TBD | docs deployment access | same business day | docs approval comment |
| Release operations owner | TBD | TBD | repository admin plus release access | same business day | release runbook owner |
| Security contact owner | TBD | TBD | security advisory access | urgent reports acknowledged within 24 hours | security contact confirmation |
| npm publishing owner | TBD | TBD | npm publish access for `@ontos-protocol/*` | launch window | npm ownership confirmation |
| GitHub repository administrator | TBD | TBD | repository admin | launch window | settings screenshot or audit note |
| Website deployment owner | TBD | TBD | deployment provider access | launch window | deployment URL |
| Launch-week triage owner | TBD | TBD | issue triage or maintainer | first response within 24 hours | triage rota |

## Assignment Rules

- Every required role must have a primary owner.
- Release owner, npm publishing owner, and GitHub repository administrator may
  be the same person only if a backup is named.
- Security contact owner must be able to access private vulnerability reports.
- Website deployment owner must be able to redeploy docs and the hosted viewer
  demo during launch week.
- Launch-week triage owner must monitor issues and discussions during the first
  24 hours after public launch.
- No owner field should contain private project names, private roadmap items, or
  unrelated product context.

## Access Checklist

- [ ] Repository admin access confirmed.
- [ ] Branch protection settings access confirmed.
- [ ] GitHub release publishing access confirmed.
- [ ] npm organization membership confirmed.
- [ ] npm package publish rights confirmed.
- [ ] Documentation deployment access confirmed.
- [ ] Hosted viewer deployment access confirmed.
- [ ] Security advisory access confirmed.
- [ ] Discussions moderation access confirmed.
- [ ] Issue label and project board access confirmed.

## Launch Rota

| Window | Primary triage owner | Backup triage owner | Notes |
| --- | --- | --- | --- |
| Launch hour | TBD | TBD | watch install, docs, viewer demo, package errors |
| First 24 hours | TBD | TBD | label every issue and route compatibility questions |
| First week | TBD | TBD | maintain known issues and patch readiness |
| First month | TBD | TBD | collect RFC candidates and adoption feedback |

## Copy Into Release Issue

Paste the filled owner table into the issue created from
`.github/ISSUE_TEMPLATE/release.yml`, then copy final approval evidence into
`docs/RELEASE_APPROVAL_PACKET_1.0.0.md`.
