# RFC Process

Updated: 2026-06-05

RFCs are used for decisions that affect `.ontos Protocol` compatibility,
semantics, ecosystem expectations, or governance.

## When An RFC Is Required

An RFC is required for:

- syntax changes
- AST schema changes
- standard field additions
- standard field semantic changes
- diagnostics model changes
- version negotiation changes
- conformance fixture changes
- CLI command naming changes
- package naming changes
- compatibility policy changes
- governance changes

## When An RFC Is Not Required

An RFC is not required for:

- typo fixes
- documentation clarification
- examples
- templates
- bug fixes that preserve behavior
- viewer UI polish
- additional tests
- diagnostics wording improvements
- non-breaking CLI flags

## RFC Lifecycle

1. Draft
2. Discussion
3. Revision
4. Accepted
5. Implemented
6. Stabilized
7. Superseded or rejected if needed

## RFC Template

Every RFC should include:

- summary
- motivation
- detailed design
- syntax examples
- AST examples
- compatibility impact
- migration impact
- security impact
- alternatives considered
- open questions
- implementation plan
- conformance test plan

## Acceptance Criteria

An RFC can be accepted only when:

- compatibility impact is understood
- implementation work is scoped
- tests are defined
- documentation impact is defined
- migration impact is defined
- release timing is clear

## Decision Model

The specification owner owns final technical decisions for format and AST
compatibility. The release owner decides whether an accepted RFC can enter a
specific release.

