import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  formatOntosDocument,
  parseOntosDocument,
  serializeOntosDocument
} from "@ontos-protocol/parser";

const source = `@ontos 1.0
@title Stable ordering
@type conformance
@updated 2026-06-05
@lang en

- Root @id(root) #beta #alpha #beta
  zeta: field one
  alpha: field two
  middle:
    - second item
    - first item

  - Second child @id(second-child)
    purpose: stays first

  - First child @id(first-child)
    purpose: stays second
`;

const ast = parseOntosDocument(source, { includeDiagnostics: false });
assert.deepEqual(Object.keys(ast.metadata), ["title", "type", "updated", "lang"]);

const root = ast.nodes[0];
assert.deepEqual(root.tags, ["beta", "alpha"]);
assert.deepEqual(Object.keys(root.fields), ["zeta", "alpha", "middle"]);
assert.deepEqual(root.fields.middle, ["second item", "first item"]);
assert.deepEqual(root.children.map((node) => node.id), ["second-child", "first-child"]);

const serialized = serializeOntosDocument(ast);
assert.equal(serialized, formatOntosDocument(source));
assert.match(serialized, /#beta #alpha/u);
assert.ok(serialized.indexOf("zeta: field one") < serialized.indexOf("alpha: field two"));
assert.ok(serialized.indexOf("Second child") < serialized.indexOf("First child"));

const fields = execFileSync(
  process.execPath,
  ["packages/cli/src/index.js", "list", "fields", "spec/conformance/valid/ordering.ontos"],
  { encoding: "utf8" }
).trim().split("\n");
assert.deepEqual(fields, ["alpha", "middle", "purpose", "zeta"]);

console.log("ordering validation ok");
