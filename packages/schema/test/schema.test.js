import assert from "node:assert/strict";
import {
  astSchema,
  ONTOS_AST_SCHEMA_ID,
  ONTOS_AST_SCHEMA_VERSION,
  ONTOS_FORMAT_VERSION
} from "../src/index.js";

assert.equal(ONTOS_FORMAT_VERSION, "1.0");
assert.equal(ONTOS_AST_SCHEMA_VERSION, "1.0");
assert.equal(ONTOS_AST_SCHEMA_ID, "https://ontos-protocol.org/schema/ontos-ast-1.0.json");
assert.equal(astSchema.$id, ONTOS_AST_SCHEMA_ID);
assert.equal(astSchema.properties.schemaVersion.const, ONTOS_AST_SCHEMA_VERSION);
assert.equal(astSchema.properties.formatVersion.const, ONTOS_FORMAT_VERSION);
assert.ok(astSchema.$defs.node);
assert.ok(astSchema.$defs.diagnostic);

console.log("schema package ok");
