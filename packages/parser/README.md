# @ontos-protocol/parser

Reference parser, serializer, formatter, and validator for `.ontos Protocol`.

## Public API

```js
import {
  parseOntosDocument,
  serializeOntosDocument,
  formatOntosDocument,
  validateOntosDocument,
  createStableNodeId,
  findNodeById,
  getNodePath,
  getNodeText,
  walkNodes,
  collectReferences
} from "@ontos-protocol/parser";
```

## Example

```js
const ast = parseOntosDocument(text);
const diagnostics = validateOntosDocument(ast);
const formatted = serializeOntosDocument(ast);
```

The parser targets `.ontos Format 1.0` and the AST shape documented in
`spec/ontos-ast-schema-1.0.json`.

## API Reference

### `parseOntosDocument(text, options)`

Parses `.ontos` text into the canonical AST.

Options:

- `includeDiagnostics`: include diagnostics on the AST. Defaults to `true`.
- `preserveComments`: preserve comments in `ast.comments`. Defaults to `false`.
- `maxInputBytes`: maximum UTF-8 input size. Defaults to `5 MiB`.
- `maxDepth`: maximum node nesting depth. Defaults to `100`.
- `mode`: `tolerant` or `strict`. Defaults to `tolerant`.

Tolerant mode returns an AST with diagnostics when possible. Strict mode throws
`OntosParseError` if any error diagnostic is produced; the error includes both
`diagnostics` and the partial `ast`.

### `validateOntosDocument(astOrText, options)`

Returns diagnostics. The function accepts either source text or an AST.

### `serializeOntosDocument(ast, options)`

Serializes an AST to canonical `.ontos` text.

Options:

- `finalNewline`: write a final newline. Defaults to `true`.

### `formatOntosDocument(text, options)`

Parses and serializes a document in canonical form.

### Node Helpers

- `findNode(ast, selector)`
- `findNodeById(ast, nodeId)`
- `getNodePath(ast, nodeId)`
- `getNodeText(ast, nodeId)`
- `walkNodes(ast, visitor)`
- `collectReferences(ast)`
- `createStableNodeId(title, options)`

`createStableNodeId` turns human titles into deterministic node IDs and can
avoid collisions:

```js
createStableNodeId("Release Gate", {
  existingIds: ["release-gate"]
});
// "release-gate-2"
```

## Field Values

Single-line fields parse as strings.

List fields parse as arrays.

Multiline text fields parse as rich fields:

```json
{
  "kind": "text",
  "value": "Line one\nLine two"
}
```

Code fields parse as rich fields:

```json
{
  "kind": "code",
  "language": "js",
  "value": "console.log(\"hello\");"
}
```

## Compatibility

This package follows `.ontos Format 1.0` and the repository compatibility
policy. See the root `CHANGELOG.md` for release notes.
