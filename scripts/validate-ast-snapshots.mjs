import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { parseOntosDocument } from "@ontos-protocol/parser";

const schema = JSON.parse(readFileSync("spec/ontos-ast-schema-1.0.json", "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const examples = readdirSync("examples")
  .filter((file) => file.endsWith(".ontos"))
  .sort();

for (const example of examples) {
  const source = readFileSync(join("examples", example), "utf8");
  const actual = parseOntosDocument(source, { includeDiagnostics: false });
  const name = basename(example, ".ontos");
  const snapshotPath = join("tests/snapshots/ast", `${name}.ast.json`);
  const expected = JSON.parse(readFileSync(snapshotPath, "utf8"));
  assert.deepEqual(actual, expected, `${example} AST snapshot drifted`);
  if (!validate(actual)) {
    throw new Error(`${example} does not match AST schema: ${ajv.errorsText(validate.errors)}`);
  }
}

console.log(`validated ${examples.length} AST snapshots`);
