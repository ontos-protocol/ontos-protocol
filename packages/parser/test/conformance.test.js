import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectReferences,
  createStableNodeId,
  findNodeById,
  formatOntosDocument,
  getNodePath,
  getNodeText,
  OntosParseError,
  parseOntosDocument,
  serializeOntosDocument,
  validateOntosDocument
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const conformance = join(root, "spec/conformance");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function parseJson(path) {
  return JSON.parse(read(path));
}

function errorCodes(astOrDiagnostics) {
  const diagnostics = Array.isArray(astOrDiagnostics)
    ? astOrDiagnostics
    : astOrDiagnostics.diagnostics ?? [];
  return diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => diagnostic.code);
}

const projectState = read("spec/conformance/valid/project-state.ontos");
const projectStateAst = parseOntosDocument(projectState, {
  includeDiagnostics: false
});
const expectedProjectStateAst = parseJson(
  "spec/conformance/ast/project-state.ast.json"
);

assert.deepEqual(projectStateAst, expectedProjectStateAst);
assert.deepEqual(validateOntosDocument(projectState), []);

const parserPackage = findNodeById(projectStateAst, "parser-package");
assert.equal(parserPackage?.title, "Parser package");
assert.deepEqual(getNodePath(projectStateAst, "parser-package"), [
  "Current release",
  "Parser package"
]);
assert.match(getNodeText(projectStateAst, "parser-package"), /Parser package/);

const serialized = serializeOntosDocument(projectStateAst);
assert.equal(
  parseOntosDocument(serialized, { includeDiagnostics: false }).metadata.title,
  "Project state example"
);
assert.equal(formatOntosDocument(projectState), serialized);

const aiHandoff = read("spec/conformance/valid/ai-handoff.ontos");
const aiHandoffAst = parseOntosDocument(aiHandoff);
assert.deepEqual(errorCodes(aiHandoffAst), []);
assert.equal(findNodeById(aiHandoffAst, "parser-task")?.title, "Parser task");
assert.deepEqual(collectReferences(aiHandoffAst), []);

const nestedAfterList = read("spec/conformance/valid/nested-after-list.ontos");
const nestedAfterListAst = parseOntosDocument(nestedAfterList);
assert.deepEqual(validateOntosDocument(nestedAfterList), []);
assert.deepEqual(getNodePath(nestedAfterListAst, "grandchild"), [
  "Root",
  "Child",
  "Grandchild"
]);
assert.equal(findNodeById(nestedAfterListAst, "root").fields.history.length, 1);

for (const fixture of readdirSync(join(conformance, "valid")).filter((file) => file.endsWith(".ontos"))) {
  assert.deepEqual(
    validateOntosDocument(read(`spec/conformance/valid/${fixture}`)),
    [],
    `${fixture} should validate`
  );
}

const internationalText = parseOntosDocument(
  read("spec/conformance/valid/international-text.ontos"),
  { includeDiagnostics: false }
);
assert.equal(internationalText.metadata.lang, "zh-Hans");
assert.equal(findNodeById(internationalText, "release-plan")?.title, "发布计划");
assert.match(findNodeById(internationalText, "release-plan")?.fields.purpose, /中文/);

const richFields = read("spec/conformance/valid/rich-fields.ontos");
const richFieldsAst = parseOntosDocument(richFields);
const richNode = findNodeById(richFieldsAst, "rich-field-node");
assert.equal(richNode.fields.body.kind, "text");
assert.match(richNode.fields.body.value, /First paragraph/);
assert.equal(richNode.fields.snippet.kind, "code");
assert.equal(richNode.fields.snippet.language, "js");
assert.match(richNode.fields.snippet.value, /console\.log/);
assert.ok(
  collectReferences(richFieldsAst).some((reference) => reference.target === "rich-field-node.purpose")
);
assert.equal(formatOntosDocument(richFields), richFields);

assert.equal(createStableNodeId("Release Gate"), "release-gate");
assert.equal(createStableNodeId("123 Release"), "node-123-release");
assert.equal(
  createStableNodeId("Release Gate", { existingIds: ["release-gate", "release-gate-2"] }),
  "release-gate-3"
);

const issueNumberTitle = parseOntosDocument(
  `@ontos 1.0
@title Issue numbers

- Fix issue #123 @id(fix-issue) #valid-tag
  purpose: Keep issue numbers in titles.
`,
  { includeDiagnostics: false }
);
const issueNode = findNodeById(issueNumberTitle, "fix-issue");
assert.equal(issueNode.title, "Fix issue #123");
assert.deepEqual(issueNode.tags, ["valid-tag"]);

const invalidAlphaTag = validateOntosDocument(
  `@ontos 1.0
@title Invalid alpha tag

- Fix tag @id(fix-tag) #bad_tag
  purpose: Exercise invalid tag diagnostics.
`
);
assert.ok(invalidAlphaTag.some((diagnostic) => diagnostic.code === "ONTOS1204"));

for (const fixture of ["invalid-header.ontos", "invalid-tag.ontos", "tab-indentation.ontos"]) {
  assert.throws(
    () => formatOntosDocument(read(`spec/conformance/invalid/${fixture}`)),
    (error) =>
      error instanceof OntosParseError &&
      error.diagnostics.some((diagnostic) => diagnostic.severity === "error"),
    `${fixture} should not be formatted`
  );
}

assert.match(
  formatOntosDocument(
    `@ontos 1.0
@title Warning only
@type custom-type

- Root @id(root)
  purpose: Warnings do not block formatting.
`
  ),
  /@type custom-type/
);

const tolerant = parseOntosDocument(read("spec/conformance/invalid/invalid-tag.ontos"), {
  mode: "tolerant"
});
assert.ok(tolerant.diagnostics.some((diagnostic) => diagnostic.code === "ONTOS1204"));
assert.throws(
  () => parseOntosDocument(read("spec/conformance/invalid/invalid-tag.ontos"), { mode: "strict" }),
  (error) =>
    error instanceof OntosParseError &&
    error.diagnostics.some((diagnostic) => diagnostic.code === "ONTOS1204") &&
    error.ast.nodes.length === 1
);

const oversized = parseOntosDocument("@ontos 1.0\n@title Oversized\n", {
  maxInputBytes: 8
});
assert.deepEqual(errorCodes(oversized), ["ONTOS1801"]);
assert.deepEqual(oversized.nodes, []);
assert.equal(oversized.diagnostics[0].suggestion.includes("maxInputBytes"), true);

const tooDeep = validateOntosDocument(
  "@ontos 1.0\n@title Depth\n\n- Root @id(root)\n  - Child @id(child)\n",
  { maxDepth: 0 }
);
assert.ok(
  tooDeep.some((diagnostic) => diagnostic.code === "ONTOS1802"),
  "maxDepth should report ONTOS1802"
);

const semanticDiagnostics = validateOntosDocument(
  `@ontos 1.0
@title Semantic checks
@type custom-type

- Root node
  _private: reserved
  source: file:///tmp/secret.txt
  body: <script>alert("x")</script>
  old_field: value
`,
  {
    requireNodeIds: true,
    checkRecommendedFields: true,
    checkFormatting: true,
    deprecatedFields: { old_field: "purpose" }
  }
);
for (const code of [
  "ONTOS1205",
  "ONTOS1303",
  "ONTOS1403",
  "ONTOS1501",
  "ONTOS1602",
  "ONTOS1603",
  "ONTOS1701"
]) {
  assert.ok(
    semanticDiagnostics.some((diagnostic) => diagnostic.code === code),
    `semantic diagnostics should include ${code}`
  );
}

const recommendedDiagnostics = validateOntosDocument(
  "@ontos 1.0\n@title Product\n@type product-spec\n\n- Requirement @id(requirement)\n  purpose: Define behavior.\n",
  { checkRecommendedFields: true }
);
assert.ok(recommendedDiagnostics.some((diagnostic) => diagnostic.code === "ONTOS1601"));

const expectedDiagnostics = parseJson(
  "spec/conformance/invalid/expected-diagnostics.json"
);

for (const [fixture, expected] of Object.entries(expectedDiagnostics)) {
  const input = read(`spec/conformance/invalid/${fixture}`);
  const diagnostics = validateOntosDocument(input);
  const codes = diagnostics.map((diagnostic) => diagnostic.code);
  for (const diagnostic of expected) {
    assert.ok(
      codes.includes(diagnostic.code),
      `${fixture} should include ${diagnostic.code}; got ${codes.join(", ")}`
    );
  }
}

console.log("parser conformance ok");
