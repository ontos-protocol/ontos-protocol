# Analytics Decision

`.ontos Protocol 1.0.0` does not include product analytics, telemetry, or
document-content tracking in the core toolchain or static website.

## Decision

Default analytics state:

```text
disabled
```

The static website, viewer package, parser, CLI, examples, and editor
integration sources must be useful without analytics.

## Rationale

- `.ontos` files often contain project context, implementation plans, risks,
  and review material.
- The first release should reinforce local-first trust.
- Adoption should not require accounts, hosted services, or tracking consent.
- Launch learning can come from public issues, discussions, package install
  reports, and direct maintainer feedback.

## Allowed Measurement

Allowed for the first release:

- GitHub stars, issues, discussions, and pull requests
- npm package download counts
- public launch post replies
- manually reviewed docs feedback

Not included in the repository:

- client-side analytics script
- document upload tracking
- viewer usage telemetry
- CLI command telemetry
- account-based tracking

## Future Changes

Any analytics proposal must be:

- opt-in
- documented
- reviewed for privacy impact
- kept separate from document contents
- approved through the RFC process if it affects core tools

