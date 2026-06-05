# .ontos Field Registry 1.0

Updated: 2026-06-05

This registry defines standard field names for `.ontos Format 1.0`.

Custom fields are allowed. Standard fields exist so humans, parsers, validators,
viewers, exporters, editor integrations, and AI tools can share expectations.

## Field Naming Rules

Field keys MUST:

- use lowercase ASCII letters, digits, and underscores
- start with a lowercase ASCII letter
- avoid whitespace
- avoid punctuation except `_`

Field keys SHOULD:

- be short
- be stable
- describe meaning rather than presentation

Field keys MUST NOT:

- start with `_`
- contain path separators
- duplicate another field in the same node unless the field explicitly supports
  repeated values

## Project Fields

### `purpose`

Meaning: why the node exists.

Recommended value: text.

Used by:

- readers
- AI context packs
- product specs
- implementation maps

### `user`

Meaning: what the user sees or experiences.

Recommended value: text or list.

### `current`

Meaning: current implementation, state, behavior, or known reality.

Recommended value: text or list.

### `frontend`

Meaning: frontend files, components, routes, or UI surfaces related to the node.

Recommended value: list.

### `style`

Meaning: styling, layout, visual system, or CSS-related notes.

Recommended value: text or list.

### `backend`

Meaning: backend files, services, modules, jobs, or server behavior related to
the node.

Recommended value: list.

### `api`

Meaning: APIs, endpoints, contracts, or integration interfaces.

Recommended value: list.

### `data`

Meaning: data sources, schemas, storage, persistence, or state models.

Recommended value: text or list.

### `locked`

Meaning: confirmed requirements that should not be changed without explicit
approval.

Recommended value: list.

AI tools MUST treat this as a boundary field when included in a context pack.

### `risk`

Meaning: known risks, fragile areas, or likely regression points.

Recommended value: list.

### `todo`

Meaning: work that remains to be done.

Recommended value: list.

### `verify`

Meaning: validation steps, tests, or manual checks.

Recommended value: list.

### `history`

Meaning: change notes or timeline entries.

Recommended value: list.

### `owner`

Meaning: person, team, or role responsible for the node.

Recommended value: text.

### `status`

Meaning: current workflow state.

Recommended values:

- `planned`
- `active`
- `blocked`
- `review`
- `done`
- `archived`

## AI Collaboration Fields

### `context`

Meaning: background needed by a human or AI tool.

Recommended value: text or list.

### `instruction`

Meaning: explicit instruction for a task or node.

Recommended value: text or list.

### `boundary`

Meaning: what may be changed and what must remain outside the task.

Recommended value: text or list.

### `do_not_touch`

Meaning: files, nodes, fields, behavior, or decisions that must not be modified.

Recommended value: list.

AI tools MUST treat this as a hard constraint when included in a pack.

### `acceptance`

Meaning: criteria that must be true before work is accepted.

Recommended value: list.

### `handoff`

Meaning: information needed for another person or AI session to continue.

Recommended value: text or list.

### `review`

Meaning: review findings, review instructions, or review status.

Recommended value: text or list.

## Field Profiles

### `app-design`

Recommended fields:

- `purpose`
- `user`
- `current`
- `frontend`
- `backend`
- `risk`
- `verify`
- `status`

### `project-state`

Recommended fields:

- `status`
- `current`
- `todo`
- `risk`
- `verify`
- `history`
- `handoff`

### `ai-handoff`

Recommended fields:

- `context`
- `instruction`
- `boundary`
- `do_not_touch`
- `acceptance`
- `verify`
- `handoff`

### `product-spec`

Recommended fields:

- `purpose`
- `user`
- `current`
- `acceptance`
- `risk`
- `verify`
- `status`

## Custom Fields

Custom fields are valid if they follow field naming rules.

Tools SHOULD preserve custom fields.

Tools SHOULD NOT drop custom fields during parse, format, serialize, export, or
import unless the user explicitly requests it.

