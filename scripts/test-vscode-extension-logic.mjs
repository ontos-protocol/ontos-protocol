import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseOntosDocument, walkNodes } from "@ontos-protocol/parser";
import {
  buildNodeIndex,
  createTransientNodePack,
  nodeInfoAtLine
} from "../extensions/vscode/src/extensionLogic.js";

const sample = `@ontos 1.0
@title Extension logic

- Root @id(root)
  status: active
  // keep this comment with root
  - Child without id
    verify:
      - Run checks.
    - Grandchild @id(grandchild)
      body: Done.
`;

const root = nodeInfoAtLine(sample, 3);
assert.equal(root.node.id, "root");
assert.deepEqual(root.path, ["Root"]);

const commentLine = nodeInfoAtLine(sample, 5);
assert.equal(commentLine.node.id, "root", "comment line should stay inside root node");

const childTitle = nodeInfoAtLine(sample, 6);
assert.equal(childTitle.node.title, "Child without id");
assert.equal(childTitle.node.id, undefined);
assert.deepEqual(childTitle.path, ["Root", "Child without id"]);

const nestedFieldItem = nodeInfoAtLine(sample, 8);
assert.equal(nestedFieldItem.node.title, "Child without id", "nested list field should not become a node");

const grandchild = nodeInfoAtLine(sample, 9);
assert.equal(grandchild.node.id, "grandchild");
assert.deepEqual(grandchild.path, ["Root", "Child without id", "Grandchild"]);

const ast = parseOntosDocument(sample, { includeDiagnostics: false });
const pack = createTransientNodePack(ast, childTitle, "context");
assert.equal(pack.kind, "context");
assert.equal(pack.nodeId, "<no-id:line-7>");
assert.ok(pack.fields.note.includes("Add a stable ID"));
assert.ok(pack.text.includes("- Child without id"));

for (const fixture of [
  "examples/project-state.ontos",
  "examples/ai-handoff.ontos",
  "examples/review-pack.ontos"
]) {
  const source = readFileSync(fixture, "utf8");
  const index = buildNodeIndex(source);
  let expectedNodes = 0;
  walkNodes(parseOntosDocument(source, { includeDiagnostics: false }), () => {
    expectedNodes += 1;
  });
  assert.equal(index.nodes.length, expectedNodes, `${fixture} node index should match AST node count`);
  for (const item of index.nodes) {
    assert.ok(item.text.trimStart().startsWith("- "), `${fixture}:${item.line + 1} node text should start with a node marker`);
    assert.ok(item.path.length > 0, `${fixture}:${item.line + 1} node should have a path`);
  }
}

console.log("VS Code extension logic tests ok");
