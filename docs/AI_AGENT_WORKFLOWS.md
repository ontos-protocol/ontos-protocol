# AI Agent Workflows

Updated: 2026-06-05

This guide explains how to use `.ontos` files with AI coding and writing tools
without dumping an entire project document into every prompt.

## Core Pattern

1. Keep project state in one or more `.ontos` files.
2. Give important nodes stable IDs.
3. Store constraints in fields such as `locked`, `risk`, `boundary`,
   `acceptance`, and `verify`.
4. Generate a focused pack for the node that matches the task.
5. Ask the AI tool to work inside the pack boundary.
6. Validate the `.ontos` file after any writeback.

## Pack Commands

```bash
ontosfmt pack project-state.ontos --node release-gate --for context
ontosfmt pack project-state.ontos --node parser-package --for review --json
ontosfmt pack project-state.ontos --node cli-package --for handoff
ontosfmt pack project-state.ontos --node release-gate --for verification
ontosfmt pack project-state.ontos --node risky-change --for modify-boundary
ontosfmt pack project-state.ontos --node large-node --for context --token-budget 1200
```

Supported pack kinds:

- `context`
- `review`
- `handoff`
- `modify-boundary`
- `verification`

## Codex Workflow

Use a context pack when starting a focused implementation task:

```bash
ontosfmt pack project-state.ontos --node target-node --for context
```

Prompt:

```text
Use this .ontos context pack as the task boundary.
Work only on files, nodes, and behavior described in the pack.
Preserve locked fields.
Run the verification steps before reporting completion.
If the pack is missing context, ask for the specific node or reference needed.
```

Use a review pack when asking for code review:

```bash
ontosfmt pack project-state.ontos --node changed-area --for review --json
```

Prompt:

```text
Review against the acceptance, risk, and verify fields in this pack.
Lead with concrete findings.
Do not propose compatibility changes outside the selected node boundary.
```

## Cursor Workflow

Use `.ontos` as a planning file in the repository.

Recommended flow:

1. Open the `.ontos` file in the default `.ontos Tree` editor beside the
   relevant source files.
2. Select the target node in the tree tab or optional Node Tree side view.
3. Generate a context pack for the node being edited.
4. Ask Cursor to modify only the files listed in `frontend`, `backend`, `api`,
   `data`, or `source` fields.
5. Use Open as Text only when the `.ontos` source itself needs an edit or a
   formatting diff needs direct inspection.
6. Run `ontosfmt validate` after updating the project document.

Prompt:

```text
Use this .ontos pack as the source of truth.
Respect locked, boundary, risk, acceptance, and verify fields.
When you change code, summarize which .ontos node should be updated.
```

## VS Code / Cursor Extension Install

Use one of these paths before asking an AI agent to work from `.ontos` files:

1. Extension marketplace:
   Search for `.ontos Protocol` in Open VSX, Cursor, VSCodium, or Visual Studio
   Marketplace after the extension is published. The installed extension
   should open `.ontos` files in the `.ontos Tree` custom editor by default.

2. Local VSIX:

   ```bash
   code --install-extension .release/ontos-protocol-vscode-1.0.5.vsix
   ```

   In Cursor, install the same VSIX from the Extensions view command menu when
   marketplace publishing has not completed yet.

3. Monorepo development host:
   Open `extensions/vscode` in VS Code, run the extension with F5, then open
   `examples/project-state.ontos` in the Extension Development Host. This path
   is for maintainers and contributors validating extension changes.

After installation, open a `.ontos` file, select the target node in the tree,
run a pack command such as `.ontos: Copy Context Pack`, and give that pack to
the AI tool as the task boundary.

Maintainers should use [VS Code Extension Publishing](VSCODE_PUBLISHING.md) for
VSIX, Open VSX, and Visual Studio Marketplace release steps.

## Claude Code Workflow

Use handoff packs when moving work across sessions:

```bash
ontosfmt pack project-state.ontos --node handoff-node --for handoff
```

Prompt:

```text
Continue from this .ontos handoff pack.
First restate the node path, active constraints, and verification steps.
Then proceed with the smallest change that satisfies acceptance.
```

For larger documents, add a token budget:

```bash
ontosfmt pack project-state.ontos --node handoff-node --for handoff --token-budget 1600
```

## Generic Agent Workflow

Any agent can use this pattern:

```text
Input:
- one .ontos pack
- one requested task
- optional file snippets

Rules:
- Treat the pack node as the task boundary.
- Treat locked and boundary fields as hard constraints.
- Treat risk and verify fields as required review points.
- Do not infer unrelated project plans from missing context.
- Return changed files, changed nodes, and verification results.
```

## Prompt Templates

Implementation prompt:

```text
Task: <specific task>

Use the following .ontos context pack.
Only modify behavior covered by this node path.
Preserve locked fields and respect risk notes.
After editing, run or describe the verify steps.
```

Review prompt:

```text
Review this change using the .ontos review pack.
Find bugs, compatibility risks, missing tests, or boundary violations.
Order findings by severity.
```

Handoff prompt:

```text
Use this .ontos handoff pack to continue work.
Summarize current state, next action, blocked items, and validation needed.
```

Verification prompt:

```text
Use this .ontos verification pack.
Run each verify item or explain why it cannot be run.
Do not mark the task complete until verification is addressed.
```

Modify-boundary prompt:

```text
Use this .ontos modify-boundary pack.
List allowed files, disallowed files, accepted behavior changes, and explicit
non-goals before editing.
```

## Safety Boundaries

AI tools SHOULD treat these fields as hard boundaries:

- `locked`
- `boundary`
- `do_not_touch`
- `risk`
- `acceptance`
- `verify`

Pack generation excludes common sensitive fields by default:

- `secret`
- `secrets`
- `password`
- `token`
- `api_key`
- `credential`
- `credentials`
- `private`

Do not put secrets in `.ontos` files. The exclusion rule is a final safety net,
not a storage policy.

## Writeback Proposal Format

When an AI tool proposes changes to a `.ontos` document, use this structure:

```text
## Proposed .ontos Writeback

changed_node: node-id
change_type: add-field | update-field | add-node | update-node | remove-node
reason: short explanation

before:
  <old text or empty>

after:
  <new text>

validation:
  - ontosfmt validate file.ontos
  - ontosfmt format --check file.ontos
```

## Changed Node Summary

After writeback, summarize:

```text
changed_nodes:
  - node-id: what changed
unchanged_boundaries:
  - locked field preserved
  - risk field reviewed
verification:
  - command or manual check result
```

## Rejected Change Format

If a suggested update is rejected:

```text
rejected_change:
  node: node-id
  reason: boundary violation | insufficient context | compatibility risk
  safer_next_step: specific follow-up
```

## Validation After Writeback

Always run:

```bash
ontosfmt validate file.ontos
ontosfmt format --check file.ontos
```

For release or migration work, also run:

```bash
npm run release:check
```

## History Update Convention

When a document tracks change history, append concise history items:

```text
history:
  - 2026-06-05: Updated release gate after package smoke passed.
```

History entries SHOULD include:

- date
- changed node or workflow
- reason or verification result
