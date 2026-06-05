# Governance

Updated: 2026-06-05

`.ontos Protocol` uses lightweight maintainer governance.

## Principles

- The protocol is open and implementation-independent.
- Compatibility matters more than novelty.
- Plain text readability is a core value.
- Local-first usage is a core value.
- Public decisions must be documented.
- Private context must not be required to understand public decisions.

## Decision Types

Routine decisions:

- documentation fixes
- examples
- tests
- viewer UI polish
- bug fixes

Maintainer review decisions:

- parser behavior
- formatter behavior
- exporter behavior
- CLI flags
- diagnostics additions

RFC decisions:

- syntax
- AST schema
- standard fields
- compatibility policy
- package naming
- command naming

## Conflict Resolution

When maintainers disagree:

1. write down the concrete decision
2. write down compatibility impact
3. write down user impact
4. compare alternatives
5. prefer the option that preserves existing valid files
6. escalate to RFC if needed

## Project Independence

The protocol should remain usable by any editor, app, CLI, AI tool, or workflow.
No official core package should depend on a specific application runtime.

