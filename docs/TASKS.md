# .ontos Protocol Formal Open Source Release Checklist

Updated: 2026-06-05

This checklist defines the complete work required to launch the first formal
open-source release of `.ontos Protocol`.

Target public repository:

```text
ontos-protocol
```

Public title:

```text
# .ontos Protocol
```

Release target:

```text
.ontos Protocol 1.0.0
.ontos Format 1.0
ontosfmt 1.0.0
@ontos-protocol/* 1.0.0
```

Naming:

```text
Protocol: .ontos Protocol
Extension: .ontos
Repository: ontos-protocol
CLI: ontosfmt
Package scope: @ontos-protocol
```

Release rule:

```text
The first public open-source version must be complete enough to be trusted,
implemented by others, used in real repositories, validated in CI, exported to
standard formats, and explained clearly without private context.
```

## 0. Release Governance

Goal: define what "ready to open source" means before implementation begins.

- [ ] Appoint release owner.
- [ ] Appoint protocol specification owner.
- [ ] Appoint parser and CLI owner.
- [ ] Appoint viewer owner.
- [ ] Appoint documentation owner.
- [ ] Appoint release operations owner.
- [x] Define final decision maker for format compatibility.
- [ ] Define issue triage owner for launch week.
- [ ] Define security contact owner.
- [ ] Define npm publishing owner.
- [ ] Define GitHub repository administrator.
- [ ] Define website deployment owner.
- [x] Define acceptance process for every release gate.
- [ ] Define release freeze date.
- [ ] Define documentation freeze date.
- [ ] Define public launch date.
- [x] Define post-launch response window.
- [x] Define launch rollback criteria.
- [x] Define emergency patch release process.
- [x] Define compatibility policy for 1.x releases.
- [x] Define what requires an RFC after 1.0.

Required artifacts:

- [x] `docs/RELEASE_GOVERNANCE.md`
- [x] `docs/COMPATIBILITY_POLICY.md`
- [x] `docs/RELEASE_PROCESS.md`
- [x] `docs/RFC_PROCESS.md`
- [x] `docs/MAINTAINERS.md`

Definition of done:

- Every launch decision has an owner.
- Every release gate has a written acceptance rule.
- The team can decide whether to ship without relying on memory or chat history.

## 1. Naming, Scope, And Public Boundary

Goal: make the public project understandable without leaking unrelated projects
or creating future naming collisions.

- [x] Confirm protocol name: `.ontos Protocol`.
- [x] Confirm public repository name: `ontos-protocol`.
- [x] Confirm README title: `# .ontos Protocol`.
- [x] Confirm file extension: `.ontos`.
- [x] Confirm CLI command: `ontosfmt`.
- [x] Confirm npm scope: `@ontos-protocol`.
- [x] Confirm package names:
  - [x] `@ontos-protocol/parser`
  - [x] `@ontos-protocol/cli`
  - [x] `@ontos-protocol/schema`
  - [x] `@ontos-protocol/viewer`
- [x] Confirm no published command uses bare `ontos`.
- [x] Confirm no package uses bare `ontos`.
- [x] Confirm no public text references private or unrelated projects.
- [x] Confirm `docs/NAMING.md` exists.
- [x] Add a naming check to CI.
- [x] Add forbidden public terms to a release scan list.
- [x] Add repository description:
  - [x] `AI-native structured text protocol for project context`
- [x] Add repository topics:
  - [x] `ai`
  - [x] `protocol`
  - [x] `text-format`
  - [x] `markdown`
  - [x] `outline`
  - [x] `developer-tools`
  - [x] `plain-text`
  - [x] `project-management`

Required artifacts:

- [x] `docs/NAMING.md`
- [x] `scripts/check-public-boundary.mjs`
- [x] `config/public-boundary-terms.txt`

Definition of done:

- A public reader sees only `.ontos Protocol`.
- The repository, CLI, npm scope, API names, and docs are consistent.
- The project is searchable and clone-friendly.

## 2. Repository Foundation

Goal: create a professional open-source monorepo that can support protocol,
packages, apps, tests, documentation, and release automation.

- [ ] Create public GitHub repository `ontos-protocol`.
- [ ] Confirm default branch name.
- [ ] Protect default branch.
- [ ] Require pull request reviews.
- [ ] Require CI before merge.
- [ ] Require signed or verified release commits if desired.
- [ ] Disable force-push to protected branches.
- [ ] Configure issue labels.
- [ ] Configure discussion categories.
- [ ] Configure GitHub project board.
- [ ] Configure repository topics.
- [ ] Configure repository description.
- [ ] Configure repository social preview image.
- [x] Add `.gitignore`.
- [x] Add `.editorconfig`.
- [x] Add `.gitattributes`.
- [x] Add root `package.json`.
- [x] Add workspace package manager configuration.
- [x] Decide package manager: `npm`.
  - Not selected for 1.0: `pnpm`, `yarn`.
- [x] Add lockfile.
- [x] Add TypeScript configuration.
- [x] Add lint configuration.
- [x] Add formatter configuration.
- [x] Add test configuration.
- [x] Add build configuration.
- [x] Add root scripts:
  - [x] `build`
  - [x] `test`
  - [x] `test:fuzz`
  - [x] `test:path`
  - [x] `test:cross-platform-cli`
  - [x] `test:vscode-local-install`
  - [x] `test:ordering`
  - [x] `test:performance`
  - [x] `test:viewer-browser`
  - [x] `test:screen-reader`
  - [x] `test:coverage`
  - [x] `lint`
  - [x] `format`
  - [x] `typecheck`
  - [x] `docs:build`
  - [x] `demo:video`
  - [x] `validate:links`
  - [x] `validate:assets`
  - [x] `validate:website`
  - [x] `validate:accessibility`
  - [x] `validate:ast`
  - [x] `validate:ast-consumers`
  - [x] `validate:examples`
  - [x] `validate:extensions-package`
  - [x] `validate:runtime-compat`
  - [x] `validate:viewer-app`
  - [x] `validate:deployment`
  - [x] `validate:visual-regression`
  - [x] `validate:release-artifacts`
  - [x] `release:archives`
  - [x] `validate:release-archives`
  - [x] `validate:demo-video`
  - [x] `release:commands`
  - [x] `release:verify-commands`
  - [x] `project:commands`
  - [x] `validate:external-commands`
  - [x] `validate:release-verify-commands`
  - [x] `validate:project-commands`
  - [x] `validate:external-release`
  - [x] `validate:launch-ops`
  - [x] `validate:security-automation`
  - [x] `validate:community-readiness`
  - [x] `validate:github-community`
  - [x] `community:commands`
  - [x] `validate:community-commands`
  - [x] `validate:release-approval`
  - [x] `release:check`
- [x] Create monorepo directories:
  - [x] `spec/`
  - [x] `docs/`
  - [x] `examples/`
  - [x] `packages/parser/`
  - [x] `packages/schema/`
  - [x] `packages/cli/`
  - [x] `packages/viewer/`
  - [x] `apps/viewer/`
  - [x] `extensions/vscode/`
  - [x] `extensions/obsidian/`
  - [x] `tests/fixtures/`
  - [x] `tests/snapshots/`
  - [x] `scripts/`
  - [x] `website/`
- [x] Add `README.md`.
- [x] Add `LICENSE`.
- [x] Add `CONTRIBUTING.md`.
- [x] Add `CODE_OF_CONDUCT.md`.
- [x] Add `SECURITY.md`.
- [x] Add `.github/pull_request_template.md`.
- [x] Add issue templates:
  - [x] bug report
  - [x] feature request
  - [x] RFC
  - [x] documentation issue
  - [x] compatibility issue
  - [x] release tracking issue
- [x] Add discussion templates:
  - [x] announcements
  - [x] general
  - [x] ideas
  - [x] Q&A
  - [x] show and tell
  - [x] RFC discussion
- [x] Add release owner assignment worksheet.
- [x] Add GitHub Actions:
  - [x] CI
  - [x] release check
  - [x] docs build
  - [x] package publish dry run
  - [x] security scan
  - [x] CodeQL
- [x] Add Dependabot configuration:
  - [x] npm dependencies
  - [x] GitHub Actions

Required artifacts:

- [x] Root monorepo package configuration.
- [x] GitHub Actions workflows.
- [x] Standard repository community files.
- [x] `docs/REPOSITORY_SETUP.md`
- [x] `config/repository-settings.json`
- [x] `config/github-project-board.json`
- [x] `.github/branch-protection-main.json`
- [x] `docs/EXTERNAL_RELEASE_PLAN_1.0.0.md`
- [x] `docs/RELEASE_ISSUE_1.0.0.md`
- [x] `docs/POST_LAUNCH_MONITORING.md`
- [x] `docs/DEMO_VIDEO_60S.md`
- [x] `docs/COMMUNITY_STARTER_ISSUES.md`
- [x] `docs/ADOPTION_EXAMPLES.md`
- [x] `docs/CONFORMANCE_IMPLEMENTATION_GUIDE.md`
- [x] `docs/PATCH_RELEASE_PLAYBOOK.md`
- [x] `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`
- [x] `docs/RELEASE_OWNER_ASSIGNMENT.md`
- [x] `.github/DISCUSSION_TEMPLATE/`
- [x] `.github/ISSUE_TEMPLATE/release.yml`
- [x] `scripts/validate-github-community.mjs`
- [x] `.github/dependabot.yml`
- [x] `.github/workflows/codeql.yml`
- [x] `scripts/validate-security-automation.mjs`
- [x] `scripts/build-demo-video.mjs`
- [x] `scripts/validate-demo-video.mjs`
- [x] `scripts/external-release-commands.mjs`
- [x] `scripts/external-release-verification.mjs`
- [x] `scripts/github-project-board-commands.mjs`
- [x] `scripts/community-starter-commands.mjs`

Definition of done:

- A contributor can clone the repository, install dependencies, run tests, build
  packages, and understand contribution rules.

## 3. Legal, License, And Governance

Goal: make the repository safe for broad open-source and commercial adoption.

- [x] Choose MIT license for core project.
- [x] Confirm copyright holder wording.
- [x] Confirm license applies to:
  - [x] spec
  - [x] parser
  - [x] CLI
  - [x] viewer
  - [x] examples
  - [x] docs
  - [x] schemas
  - [x] tests
- [x] Add license headers policy.
- [x] Add third-party dependency review process.
- [x] Add dependency license allowlist.
- [x] Add dependency license CI check.
- [x] Add contributor certificate statement if needed.
- [x] Add governance model.
- [x] Add maintainer nomination process.
- [x] Add RFC process.
- [x] Add release approval process.
- [x] Add security reporting policy.
- [x] Add trademark and naming policy.
- [x] Add compatibility promise.

Required artifacts:

- [x] `LICENSE`
- [x] `CHANGELOG.md`
- [x] `CODE_OF_CONDUCT.md`
- [x] `SECURITY.md`
- [x] `docs/GOVERNANCE.md`
- [x] `docs/TRADEMARK_AND_NAMING.md`
- [x] `docs/DEPENDENCY_POLICY.md`

Definition of done:

- A company, independent developer, or tool builder can adopt `.ontos` without
  unclear licensing or governance risk.

## 4. Product Requirements

Goal: define exactly what the first formal release must do for users.

- [x] Write formal product requirements.
- [x] Define primary audience:
  - [x] AI coding tool users
  - [x] open-source maintainers
  - [x] product and design teams
  - [x] tool builders
  - [x] knowledge workers using structured text
- [x] Define supported document categories:
  - [x] app design
  - [x] project state
  - [x] AI handoff
  - [x] product spec
  - [x] review pack
  - [x] bug fix plan
  - [x] release plan
  - [x] team knowledge
  - [x] research notes
- [x] Define required workflows:
  - [x] author `.ontos` by hand
  - [x] parse `.ontos` into AST
  - [x] validate `.ontos`
  - [x] format `.ontos`
  - [x] inspect nodes
  - [x] export to Markdown
  - [x] export to HTML
  - [x] export to JSON
  - [x] export to OPML
  - [x] import from Markdown
  - [x] render in browser viewer
  - [x] generate AI context pack
  - [x] generate AI review pack
  - [x] generate AI handoff pack
- [x] Define non-negotiable release qualities:
  - [x] plain-text readability
  - [x] deterministic parse output
  - [x] deterministic formatting
  - [x] clean Git diffs
  - [x] stable node IDs
  - [x] clear diagnostics
  - [x] no cloud dependency
  - [x] no account dependency
  - [x] no private service dependency
- [x] Define out-of-scope items for first formal release:
  - [x] hosted accounts
  - [x] cloud sync
  - [x] realtime collaboration
  - [x] permissions system
  - [x] paid hosted service

Required artifacts:

- [x] `docs/PRODUCT_REQUIREMENTS.md`
- [x] `docs/USER_WORKFLOWS.md`
- [x] `docs/RELEASE_SCOPE.md`

Definition of done:

- The first formal release has a written product contract.
- Every implementation task maps to a user workflow or release quality.

## 5. Formal Format Specification 1.0

Goal: publish a complete `.ontos Format 1.0` specification that independent
implementers can follow without reading the reference parser.

- [x] Rename or supersede draft spec with `spec/ontos-format-1.0.md`.
- [x] Define document encoding:
  - [x] UTF-8
  - [x] line ending handling
  - [x] final newline requirement
- [x] Define file extension:
  - [x] `.ontos`
- [x] Define media type recommendation.
- [x] Define file header grammar.
- [x] Define required headers:
  - [x] `@ontos`
  - [x] `@title`
- [x] Define optional headers:
  - [x] `@type`
  - [x] `@updated`
  - [x] `@id`
  - [x] `@schema`
  - [x] `@lang`
- [x] Define unknown header behavior.
- [x] Define node grammar.
- [x] Define node title grammar.
- [x] Define node ID grammar.
- [x] Define tag grammar.
- [x] Define indentation grammar.
- [x] Define tab behavior.
- [x] Define blank line behavior.
- [x] Define comment grammar.
- [x] Define field key grammar.
- [x] Define single-line field values.
- [x] Define multiline field values.
- [x] Define list field values.
- [x] Define code block field values.
- [x] Define literal text blocks.
- [x] Define escaping rules.
- [x] Define references:
  - [x] node references
  - [x] field references
  - [x] file references
  - [x] URL references
- [x] Define standard field registry.
- [x] Define AI field registry.
- [x] Define reserved fields.
- [x] Define custom field rules.
- [x] Define ordering rules.
- [x] Define canonical formatting.
- [x] Define canonical serialization.
- [x] Define parser recovery rules.
- [x] Define fatal errors.
- [x] Define warnings.
- [x] Define diagnostic object shape.
- [x] Define source location model.
- [x] Define AST model.
- [x] Define JSON Schema for AST.
- [x] Define compatibility rules.
- [x] Define version negotiation.
- [x] Define migration rules for future spec versions.
- [x] Define security considerations:
  - [x] HTML escaping
  - [x] path handling
  - [x] external references
  - [x] untrusted input
- [x] Define accessibility considerations for renderers.
- [x] Define internationalization considerations.
- [x] Add normative examples.
- [x] Add non-normative examples.
- [x] Add invalid syntax examples.
- [x] Add parser conformance cases.
- [x] Add exporter conformance cases.

Required artifacts:

- [x] `spec/ontos-format-1.0.md`
- [x] `spec/ontos-ast-schema-1.0.json`
- [x] `spec/field-registry-1.0.md`
- [x] `spec/diagnostics-1.0.md`
- [x] `spec/conformance/`

Definition of done:

- A third party can implement a parser, validator, and exporter from the spec.
- Every MUST, SHOULD, MAY statement is deliberate.
- Every official example validates against the spec.

## 6. AST Schema And Data Model

Goal: make the AST a stable integration contract across parser, CLI, viewer,
exporters, editor extensions, and AI tools.

- [x] Define root AST object.
- [x] Define metadata object.
- [x] Define node object.
- [x] Define field object or field value model.
- [x] Define source location object.
- [x] Define diagnostic object.
- [x] Define reference object.
- [x] Define tag representation.
- [x] Define ID representation.
- [x] Define text block representation.
- [x] Define list value representation.
- [x] Define code value representation.
- [x] Define unknown field representation.
- [x] Define comments retention behavior.
- [x] Define ordering preservation behavior.
- [x] Define serializer requirements.
- [x] Define round-trip expectations.
- [x] Write JSON Schema.
- [x] Add schema validation tests.
- [x] Add sample AST snapshots for every official example.
- [x] Add compatibility tests for AST consumers.

Required artifacts:

- [x] `packages/schema`
- [x] `packages/schema/src/ontos-ast.schema.json`
- [x] `packages/schema/src/index.d.ts`
- [x] `tests/snapshots/ast/`

Definition of done:

- AST output is deterministic, documented, schema-validated, and safe to depend
  on for external tools.

## 7. Reference Parser Package

Goal: publish the canonical parser package.

Package:

```text
@ontos-protocol/parser
```

Required public APIs:

- [x] `parseOntosDocument(text, options)`
- [x] `serializeOntosDocument(ast, options)`
- [x] `formatOntosDocument(text, options)`
- [x] `validateOntosDocument(astOrText, options)`
- [x] `findNode(ast, selector)`
- [x] `findNodeById(ast, nodeId)`
- [x] `getNodePath(ast, nodeId)`
- [x] `getNodeText(ast, nodeId)`
- [x] `walkNodes(ast, visitor)`
- [x] `collectReferences(ast)`

Parser implementation:

- [x] Implement tokenizer.
- [x] Implement header parser.
- [x] Implement indentation parser.
- [x] Implement node parser.
- [x] Implement ID parser.
- [x] Implement tag parser.
- [x] Implement field parser.
- [x] Implement multiline field parser.
- [x] Implement list field parser.
- [x] Implement code block parser.
- [x] Implement comment parser.
- [x] Implement reference parser.
- [x] Implement source location tracking.
- [x] Implement diagnostics.
- [x] Implement strict mode.
- [x] Implement tolerant mode.
- [x] Implement parser options.
- [x] Implement deterministic AST output.
- [x] Implement serializer.
- [x] Implement formatter.
- [x] Implement stable ID helper.
- [x] Implement duplicate ID detection hook.
- [x] Implement unknown field preservation.
- [x] Implement comments preservation option.
- [x] Implement stable ordering behavior where required.

Package quality:

- [x] TypeScript types.
- [x] ESM build.
- [x] CommonJS build decision documented; not required for 1.0 ESM packages.
- [x] Source maps for bundled artifacts.
- [x] Package exports map.
- [x] README.
- [x] API documentation.
- [x] Changelog.
- [x] License metadata.
- [x] npm package metadata.
- [x] Tree-shaking validation.
- [x] Browser compatibility validation.
- [x] Node LTS compatibility validation.

Definition of done:

- Parser parses every official valid fixture.
- Parser rejects every official invalid fixture with correct diagnostics.
- Parser serializes official fixtures deterministically.
- Parser package can be installed and used by a new project.

## 8. Validator And Diagnostics

Goal: provide production-grade validation with human-readable and
machine-readable diagnostics.

Validation rules:

- [x] Missing required header.
- [x] Unsupported protocol version.
- [x] Invalid header key.
- [x] Duplicate metadata key.
- [x] Invalid node indentation.
- [x] Tab indentation.
- [x] Empty node title.
- [x] Invalid node ID.
- [x] Duplicate node ID.
- [x] Missing required ID where profile requires ID.
- [x] Invalid tag.
- [x] Invalid field key.
- [x] Reserved field misuse.
- [x] Duplicate field where not allowed.
- [x] Invalid multiline field.
- [x] Invalid code field.
- [x] Broken node reference.
- [x] Broken field reference.
- [x] Invalid file reference.
- [x] Unsafe export content warning.
- [x] Missing recommended fields for document type.
- [x] Unknown document type warning.
- [x] Deprecated field warning.
- [x] Non-canonical formatting warning.

Diagnostic model:

- [x] Diagnostic code.
- [x] Severity:
  - [x] error
  - [x] warning
  - [x] info
- [x] Message.
- [x] File path.
- [x] Line.
- [x] Column.
- [x] End line.
- [x] End column.
- [x] Suggested fix where possible.
- [x] Related node ID where possible.
- [x] Related field name where possible.

Output formats:

- [x] pretty terminal output.
- [x] JSON output.
- [x] GitHub Actions annotation output.
- [x] editor diagnostic output.

Definition of done:

- Validation output is precise enough for CI, editor integrations, and humans.

## 9. Formatter And Canonical Serialization

Goal: make `.ontos` files stable in Git and consistent across teams.

- [x] Define canonical indentation.
- [x] Define canonical blank lines.
- [x] Define canonical header ordering.
- [x] Define canonical node line ordering.
- [x] Define canonical tag ordering policy.
- [x] Define canonical field ordering policy.
- [x] Define list formatting.
- [x] Define multiline field formatting.
- [x] Define code block formatting.
- [x] Define comments preservation.
- [x] Define wrap behavior.
- [x] Define final newline.
- [x] Implement formatter.
- [x] Implement check mode.
- [x] Implement write mode.
- [x] Implement diff mode.
- [x] Add formatter snapshot tests.
- [x] Add formatter idempotency tests.
- [x] Add GitHub Actions formatter check.

CLI commands:

- [x] `ontosfmt format file.ontos`
- [x] `ontosfmt format --check file.ontos`
- [x] `ontosfmt format --write file.ontos`
- [x] `ontosfmt format --diff file.ontos`

Definition of done:

- Running the formatter twice produces no further changes.
- Formatted files remain readable and Git-friendly.

## 10. Exporters

Goal: make `.ontos` portable to standard formats at release.

Markdown exporter:

- [x] Convert metadata to front matter or heading block.
- [x] Convert nodes to headings.
- [x] Preserve hierarchy.
- [x] Preserve node IDs.
- [x] Preserve tags.
- [x] Convert fields to labeled sections.
- [x] Preserve lists.
- [x] Preserve code blocks.
- [x] Preserve references.
- [x] Add table of contents option.
- [x] Add heading offset option.
- [x] Add snapshot tests.

HTML exporter:

- [x] Export native `<details>` tree.
- [x] Escape all user content.
- [x] Preserve node IDs as anchors.
- [x] Preserve tags as classes or attributes.
- [x] Render fields semantically.
- [x] Include minimal accessible CSS.
- [x] Add no-JavaScript mode.
- [x] Add optional search index.
- [x] Add standalone HTML option.
- [x] Add snapshot tests.

JSON exporter:

- [x] Export canonical AST.
- [x] Include schema version.
- [x] Include optional source locations.
- [x] Include optional diagnostics.
- [x] Add snapshot tests.

OPML exporter:

- [x] Convert node hierarchy to OPML outline.
- [x] Preserve node IDs.
- [x] Preserve selected fields.
- [x] Escape XML safely.
- [x] Add snapshot tests.

Definition of done:

- Every official example exports successfully to Markdown, HTML, JSON, and OPML.
- Exporters are deterministic and tested.

## 11. Importers And Migration

Goal: make adoption possible for teams with existing Markdown and outline
documents.

Markdown importer:

- [x] Parse headings.
- [x] Convert heading hierarchy to nodes.
- [x] Convert paragraphs to `body`.
- [x] Convert bullet lists to child nodes or field lists.
- [x] Preserve ordered lists.
- [x] Preserve code blocks.
- [x] Preserve tables where possible.
- [x] Preserve links.
- [x] Preserve blockquotes.
- [x] Preserve front matter.
- [x] Generate stable IDs.
- [x] Handle duplicate headings.
- [x] Add warnings for ambiguous conversions.
- [x] Add migration report.
- [x] Add import snapshots.

OPML importer:

- [x] Parse OPML outlines.
- [x] Convert outline text to node titles.
- [x] Preserve attributes where possible.
- [x] Generate stable IDs.
- [x] Add import snapshots.

Migration docs:

- [x] Markdown migration guide.
- [x] README migration guide.
- [x] Project state migration guide.
- [x] Product spec migration guide.
- [x] AI handoff migration guide.

Definition of done:

- Users can migrate existing Markdown into useful `.ontos` documents with clear
  warnings and no silent data loss.

## 12. CLI Package

Goal: publish a complete command-line tool for validation, formatting,
conversion, export, inspection, and AI context packaging.

Package:

```text
@ontos-protocol/cli
```

Executable:

```text
ontosfmt
```

Commands:

- [x] `ontosfmt --help`
- [x] `ontosfmt --version`
- [x] `ontosfmt parse <file>`
- [x] `ontosfmt validate <file>`
- [x] `ontosfmt format <file>`
- [x] `ontosfmt format --check <file>`
- [x] `ontosfmt export <file> --to md`
- [x] `ontosfmt export <file> --to html`
- [x] `ontosfmt export <file> --to json`
- [x] `ontosfmt export <file> --to opml`
- [x] `ontosfmt convert <file.md> --to .ontos`
- [x] `ontosfmt inspect <file> --node <id>`
- [x] `ontosfmt list nodes <file>`
- [x] `ontosfmt list fields <file>`
- [x] `ontosfmt stats <file>`
- [x] `ontosfmt pack <file> --node <id> --for context`
- [x] `ontosfmt pack <file> --node <id> --for review`
- [x] `ontosfmt pack <file> --node <id> --for handoff`
- [x] `ontosfmt schema`
- [x] `ontosfmt doctor`

CLI behavior:

- [x] Consistent exit codes.
- [x] Machine-readable JSON output.
- [x] Pretty terminal output.
- [x] Quiet mode.
- [x] Verbose mode.
- [x] Color control.
- [x] stdin support.
- [x] stdout support.
- [x] file write support.
- [x] overwrite protection.
- [x] glob support.
- [x] CI mode.
- [x] helpful error messages.
- [x] command examples in help text.

Package quality:

- [x] Node LTS support.
- [x] Windows shell support.
- [x] macOS support.
- [x] Linux support.
- [x] npm bin validation.
- [x] executable permission validation.
- [x] install smoke test.
- [x] package size check.

Definition of done:

- A user can install the CLI and perform every documented workflow without
  reading source code.

## 13. AI Context Packs

Goal: make `.ontos` directly useful for AI coding and project collaboration.

Pack types:

- [x] Context Pack.
- [x] Review Pack.
- [x] Handoff Pack.
- [x] Modify Boundary Pack.
- [x] Verification Pack.

Pack generation:

- [x] Select node by ID.
- [x] Include ancestor path.
- [x] Include selected descendants.
- [x] Include linked references.
- [x] Include selected fields.
- [x] Exclude forbidden fields.
- [x] Include `locked` fields.
- [x] Include `risk` fields.
- [x] Include `verify` fields.
- [x] Include `acceptance` fields.
- [x] Include source file references.
- [x] Include token budget option.
- [x] Include deterministic ordering.
- [x] Include pack metadata.

Pack formats:

- [x] Markdown.
- [x] JSON.
- [x] plain text.

AI writeback support:

- [x] Define patch proposal format.
- [x] Define changed node summary format.
- [x] Define rejected change format.
- [x] Define validation-after-writeback flow.
- [x] Define history update convention.

Documentation:

- [x] Codex workflow guide.
- [x] Cursor workflow guide.
- [x] Claude Code workflow guide.
- [x] Generic AI agent workflow guide.
- [x] Prompt templates.
- [x] Safety boundaries.

Definition of done:

- Users can generate precise AI context without dumping entire documents.
- Generated packs are deterministic, clear, and safe to inspect.

## 14. Official Examples And Templates

Goal: teach the protocol through realistic, high-quality examples.

Required examples:

- [x] `examples/app-design.ontos`
- [x] `examples/project-state.ontos`
- [x] `examples/ai-handoff.ontos`
- [x] `examples/bug-fix.ontos`
- [x] `examples/review-pack.ontos`
- [x] `examples/product-spec.ontos`
- [x] `examples/release-plan.ontos`
- [x] `examples/team-knowledge.ontos`
- [x] `examples/research-notes.ontos`
- [x] `examples/open-source-roadmap.ontos`

Each example must include:

- [x] metadata header.
- [x] stable node IDs.
- [x] at least three hierarchy levels.
- [x] tags.
- [x] standard fields.
- [x] AI collaboration fields.
- [x] references.
- [x] realistic risks.
- [x] verification steps.
- [x] history field where appropriate.
- [x] comments where appropriate.
- [x] export snapshots.
- [x] validation snapshot.
- [x] AI pack snapshot.

Template library:

- [x] app design template.
- [x] project state template.
- [x] AI handoff template.
- [x] bug fix template.
- [x] product spec template.
- [x] release checklist template.
- [x] team knowledge template.
- [x] research notes template.

Definition of done:

- A new user can copy an official example and use it for a real project.
- Every example validates and exports in CI.

## 15. Browser Viewer

Goal: ship a polished local-first viewer that makes the value of `.ontos`
obvious.

Core viewer:

- [x] Create viewer app.
- [x] Load local `.ontos` file.
- [x] Drag-and-drop file opening.
- [x] Parse using official parser.
- [x] Render collapsible tree.
- [x] Render metadata.
- [x] Render fields.
- [x] Render tags.
- [x] Render references.
- [x] Render diagnostics.
- [x] Expand all.
- [x] Collapse all.
- [x] Focus node.
- [x] Search node titles.
- [x] Search fields.
- [x] Search references.
- [x] Copy node text.
- [x] Copy node ID.
- [x] Copy node path.
- [x] Copy AI boundary.
- [x] Export Markdown.
- [x] Export HTML.
- [x] Export JSON.
- [x] Export OPML.
- [x] Show empty state.
- [x] Show parse error state.
- [x] Show validation warning state.
- [x] Show loading state.

Quality:

- [x] Responsive layout.
- [x] Keyboard navigation.
- [x] Accessible controls.
- [x] Screen reader labels.
- [x] High contrast support.
- [x] No data upload by default.
- [x] Clear local-only privacy note.
- [x] Visual regression tests.
- [x] Browser compatibility tests.
- [x] Performance test with large files.

Definition of done:

- Viewer can open and navigate every official example.
- Viewer works locally without an account or network dependency.

## 16. VS Code Extension

Goal: support developers where they already edit project files.

Extension features:

- [x] Register `.ontos` language.
- [x] Default tree custom editor.
- [x] Automatic text tab to tree editor switch.
- [x] Open as Text command.
- [x] Open as Tree command.
- [x] Optional side Node Tree view.
- [x] Syntax highlighting.
- [x] Folding rules.
- [x] Document symbols.
- [x] Outline tree.
- [x] Diagnostics from validator.
- [x] Format document command.
- [x] Validate document command.
- [x] Export command.
- [x] Copy node ID command.
- [x] Copy node path command.
- [x] Copy node text command.
- [x] Node path and text commands support nodes without `@id(...)`.
- [x] Generate context pack command.
- [x] Generate review, handoff, modify-boundary, and verification pack commands.
- [x] AI pack commands provide temporary packs for nodes without `@id(...)`.
- [x] Markdown to `.ontos` conversion command.
- [x] Optional interactive preview panel.
- [x] Configuration settings.

Release requirements:

- [x] Extension README.
- [x] Screenshots.
- [x] Marketplace metadata.
- [x] Icon.
- [x] License.
- [x] Smoke tests.
- [x] Packaging test.
- [x] Local install test.
- [x] VSIX build script.
- [ ] Open VSX publication evidence.
- [x] Visual Studio Marketplace publication evidence.

Definition of done:

- Developers open `.ontos` into a node-first tree by default, can jump to text
  editing when needed, and can validate, format, preview, export, and create AI
  packs in VS Code.

## 17. Obsidian Plugin

Goal: support structured knowledge workflows.

Plugin features:

- [x] Recognize `.ontos` files.
- [x] Edit as plain text.
- [x] Render collapsible preview.
- [x] Resolve `[[node-id]]` references.
- [x] Show backlinks where possible.
- [x] Export to Markdown.
- [x] Command palette actions.
- [x] Settings page.
- [x] Documentation.

Release requirements:

- [x] Plugin manifest.
- [x] Build pipeline.
- [x] Local vault test.
- [x] Example vault.
- [x] Screenshots.
- [x] Community plugin submission checklist.

Definition of done:

- Obsidian users can read and navigate `.ontos` files naturally.

## 18. Documentation Site

Goal: make the project understandable and usable without reading source code.

Required pages:

- [x] Home.
- [x] Quickstart.
- [x] Why `.ontos`.
- [x] Format guide.
- [x] Specification.
- [x] CLI guide.
- [x] Parser API guide.
- [x] Viewer guide.
- [x] AI workflow guide.
- [x] Markdown migration guide.
- [x] Examples gallery.
- [x] Templates.
- [x] VS Code guide.
- [x] Obsidian guide.
- [x] FAQ.
- [x] Governance.
- [x] Compatibility policy.
- [x] Security.
- [x] Release notes.

Site quality:

- [x] Search.
- [x] Mobile layout.
- [x] Accessible navigation.
- [x] Local documentation link check.
- [x] Copyable code blocks.
- [x] Versioned docs.
- [x] Canonical URLs.
- [x] SEO metadata.
- [x] Social preview image.
- [x] Analytics decision documented.
- [x] No private project references.
- [x] Deployment automation.

Definition of done:

- A user can understand and try `.ontos` within five minutes.
- A tool builder can find the spec and schema within two clicks.

## 19. Testing And Conformance

Goal: make the first formal release reliable enough for external
implementations.

Test suites:

- [x] parser valid fixtures.
- [x] parser invalid fixtures.
- [x] serializer snapshots.
- [x] formatter snapshots.
- [x] validator diagnostics.
- [x] Markdown exporter snapshots.
- [x] HTML exporter snapshots.
- [x] JSON exporter snapshots.
- [x] OPML exporter snapshots.
- [x] Markdown importer snapshots.
- [x] OPML importer snapshots.
- [x] AI pack snapshots.
- [x] CLI command tests.
- [x] viewer component tests.
- [x] viewer browser tests.
- [x] viewer visual regression tests.
- [x] AST consumer compatibility tests.
- [x] VS Code extension smoke tests.
- [x] Obsidian plugin smoke tests.
- [x] package install smoke tests.
- [x] cross-platform path tests.
- [x] large file performance tests.
- [x] fuzz tests for parser.
- [x] HTML escaping tests.
- [x] schema validation tests.
- [x] conformance suite tests.

Coverage:

- [x] Define coverage target.
- [x] Enforce coverage in CI.
- [x] Publish conformance fixtures.
- [x] Document how third-party implementations can run conformance tests.

Definition of done:

- The project has a public conformance suite.
- CI blocks regressions in parser, validator, exporter, CLI, and examples.

## 20. Security And Privacy

Goal: ensure the protocol toolchain is safe for untrusted files and local-first
usage.

Security checks:

- [x] Review parser for denial-of-service risks.
- [x] Add input size limits where appropriate.
- [x] Add recursion depth protection.
- [x] Escape HTML output.
- [x] Escape XML output.
- [x] Validate file path handling.
- [x] Avoid unsafe file overwrites.
- [x] Avoid unexpected network access.
- [x] Document local-only viewer behavior.
- [x] Review dependency supply chain.
- [x] Add dependency audit.
- [x] Add Dependabot configuration.
- [x] Add CodeQL workflow.
- [x] Add security automation validation.
- [x] Add secret scanning.
- [x] Add public-boundary scanning.
- [x] Add security disclosure instructions.
- [x] Add threat model.

Privacy checks:

- [x] No telemetry by default.
- [x] No document upload by default.
- [x] No account requirement.
- [x] No hosted service requirement.
- [x] Clear docs for any optional network behavior.

Definition of done:

- Users can safely run the toolchain on local project documents.
- Security and privacy expectations are documented.

## 21. Accessibility And Internationalization

Goal: make official tools usable by a broad audience.

Viewer accessibility:

- [x] Keyboard navigation.
- [x] Focus visible states.
- [x] ARIA labels.
- [x] Semantic tree controls.
- [x] Screen reader test.
- [x] Color contrast test.
- [x] Reduced motion support.

Documentation accessibility:

- [x] Heading structure.
- [x] Link text clarity.
- [x] Code block labels.
- [x] Image alt text.
- [x] Responsive typography.

Internationalization:

- [x] UTF-8 test fixtures.
- [x] CJK text fixtures.
- [x] RTL text fixture if supported.
- [x] Non-English tag and field value tests.
- [x] Documentation note on language handling.

Definition of done:

- `.ontos` works for non-English documents and official tools meet basic
  accessibility expectations.

## 22. Performance And Scale

Goal: ensure `.ontos` works for real project documents, not only small examples.

Benchmarks:

- [x] 100-node document.
- [x] 1,000-node document.
- [x] 10,000-node document.
- [x] deeply nested document.
- [x] large multiline fields.
- [x] large code fields.
- [x] many references.
- [x] many duplicate diagnostics.

Performance tasks:

- [x] Define parser performance budget.
- [x] Define formatter performance budget.
- [x] Define validator performance budget.
- [x] Define viewer render budget.
- [x] Add benchmark command.
- [x] Add benchmark fixtures.
- [x] Add CI performance smoke test.
- [x] Document expected limits.

Definition of done:

- Performance is measured, documented, and acceptable for large project files.

## 23. Release Packaging

Goal: publish complete, installable, verifiable artifacts.

npm packages:

- [x] `@ontos-protocol/parser`
- [x] `@ontos-protocol/schema`
- [x] `@ontos-protocol/cli`
- [x] `@ontos-protocol/viewer`

Package checks:

- [x] correct package names.
- [x] correct versions.
- [x] correct license.
- [x] correct repository URL.
- [x] correct exports map.
- [x] correct type declarations.
- [x] correct binary mapping for `ontosfmt`.
- [x] no private files included.
- [x] no missing runtime files.
- [x] package size acceptable.
- [x] install smoke test.
- [x] publish dry run.

GitHub release:

- [ ] tag `v1.0.0`.
- [x] release notes.
- [x] changelog.
- [x] checksums generated for static build archives.
- [x] source archive validation.
- [x] attach viewer build archive if applicable.
- [x] generate external release command pack.
- [x] generate external release verification command pack.
- [x] generate GitHub project board command pack.
- [x] link docs.
- [x] link examples.

Definition of done:

- Users can install released packages and reproduce documented workflows.

## 24. Website And Public Demo Release

Goal: launch with a credible public face.

Website:

- [ ] Deploy documentation site.
- [ ] Configure domain if available.
- [ ] Configure HTTPS.
- [ ] Configure redirects.
- [x] Configure sitemap.
- [x] Configure robots.
- [x] Configure social cards.
- [x] Add docs version selector.
- [x] Add examples gallery.
- [x] Add quickstart CTA.

Demo:

- [ ] Hosted viewer demo.
- [x] Sample `.ontos` document loaded by default.
- [x] Local-only behavior explained.
- [x] Export demo.
- [x] Search demo.
- [x] AI pack demo.

Definition of done:

- A visitor can understand the protocol, inspect an example, and try the viewer
  without setup.

## 25. Launch Content

Goal: explain the project clearly and make it easy to share.

Required assets:

- [x] README hero example.
- [x] 60-second demo video.
- [x] viewer screenshot.
- [x] CLI screenshot.
- [x] before and after Markdown comparison.
- [x] example `.ontos` file.
- [x] website landing page.
- [x] launch article.
- [x] GitHub release notes.
- [x] 60-second demo script.
- [x] X thread.
- [x] Hacker News post.
- [x] Product Hunt copy.
- [x] Reddit post.
- [x] LinkedIn post.
- [x] short maintainer FAQ.
- [x] generated launch content pack.
- [x] launch content pack validation.

Message rules:

- [x] Lead with `.ontos Protocol`.
- [x] Use `Markdown for articles. .ontos for AI-native project context.`
- [x] Avoid claiming universal Markdown replacement.
- [x] Avoid private project references.
- [x] Avoid vague AI hype.
- [x] Show real examples.
- [x] Show local-first workflow.
- [x] Show AI context pack workflow.
- [x] Generate platform-ready copy from one source document.

Definition of done:

- Launch content is accurate, repeatable, and aligned across channels.

## 26. Public Launch

Goal: publish the formal open-source release and manage incoming attention.

Pre-launch gate:

- [x] All CI checks pass.
- [x] All release artifacts built.
- [x] All packages publish dry-run successfully.
- [ ] Docs site deployed.
- [x] Public-boundary scan passes.
- [x] Security scan passes.
- [x] License scan passes.
- [x] All official examples validate.
- [x] All official examples export.
- [ ] Release notes approved.
- [ ] Launch content approved.

Launch steps:

- [ ] Make repository public.
- [x] Publish npm packages.
- [ ] Publish GitHub release `v1.0.0`.
- [ ] Publish docs site.
- [ ] Publish demo viewer.
- [ ] Publish launch article.
- [ ] Share GitHub link.
- [ ] Share demo video.
- [ ] Submit Hacker News post.
- [ ] Submit Product Hunt post if desired.
- [ ] Share to relevant AI coding communities.
- [ ] Share to developer tooling communities.
- [ ] Share to structured notes communities.
- [ ] Monitor issues.
- [ ] Monitor discussions.
- [ ] Monitor package install failures.
- [ ] Monitor docs errors.

Launch-day response:

- [ ] Triage bug reports.
- [ ] Label issues.
- [ ] Reply to high-signal feedback.
- [ ] Pin known issues.
- [ ] Publish clarifications if needed.
- [ ] Avoid unreviewed compatibility changes.

Definition of done:

- Public repository, packages, docs, examples, and demo are live and consistent.

## 27. Post-Launch Operations

Goal: convert launch feedback into a stable project, not a one-time announcement.

First 24 hours:

- [x] Prepare release approval packet.
- [ ] Triage all issues.
- [ ] Confirm install path works.
- [ ] Confirm docs links work.
- [ ] Confirm examples download correctly.
- [ ] Confirm viewer demo works.
- [x] Confirm npm packages install.
- [ ] Record top feedback themes.

First week:

- [ ] Fix critical bugs.
- [ ] Publish patch release if needed.
- [ ] Clarify spec ambiguities.
- [ ] Add missing docs.
- [x] Prepare community starter issue seeds.
- [x] Prepare community starter issue command pack.
- [ ] Add good first issues.
- [ ] Add help wanted issues.
- [ ] Review external PRs.
- [ ] Publish launch follow-up.

First month:

- [ ] Stabilize contribution flow.
- [ ] Hold first RFC review.
- [ ] Prioritize roadmap.
- [x] Prepare adoption examples.
- [x] Prepare conformance guidance.
- [x] Prepare patch release playbook.
- [ ] Publish adoption examples.
- [ ] Publish conformance guidance.
- [ ] Prepare next minor release.

Definition of done:

- Feedback is triaged, critical fixes are shipped, and contributors know where
  to help.

## 28. Final Release Gate

The first formal open-source release cannot ship until every item below is true.

- [x] Public naming is final:
  - [x] repository `ontos-protocol`
  - [x] title `.ontos Protocol`
  - [x] CLI `ontosfmt`
  - [x] packages `@ontos-protocol/*`
- [x] No private project references.
- [x] No forbidden names in public docs.
- [x] Format spec 1.0 complete.
- [x] AST schema 1.0 complete.
- [x] Parser package complete.
- [x] Validator complete.
- [x] Formatter complete.
- [x] Exporters complete.
- [x] Importers complete.
- [x] CLI complete.
- [x] AI packs complete.
- [x] Official examples complete.
- [x] Viewer complete.
- [x] VS Code extension complete.
- [x] Obsidian plugin complete.
- [x] Documentation site complete.
- [x] Governance docs complete.
- [x] Security docs complete.
- [x] Conformance tests complete.
- [x] CI complete.
- [x] Release packages dry-run complete.
- [ ] Website deployed.
- [ ] Demo deployed.
- [ ] Launch content approved.
- [ ] Maintainers ready for launch response.

Release decision:

```text
Ship only when the protocol, toolchain, documentation, examples, editor
integrations, release process, and public messaging are all ready together.
```
