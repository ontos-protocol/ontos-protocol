import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import {
  collectReferences,
  findNodeById,
  getNodePath,
  parseOntosDocument
} from "@ontos-protocol/parser";
import { astSchema } from "@ontos-protocol/schema";
import {
  createViewerModel,
  exportViewerDocument
} from "@ontos-protocol/viewer";
import {
  exportHtml,
  exportJson,
  exportMarkdown,
  exportOpml
} from "@ontos-protocol/cli/exporters";
import {
  createNodePack,
  exportPackMarkdown
} from "@ontos-protocol/cli/packs";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(astSchema);

const cases = [
  {
    name: "project-state",
    path: "examples/project-state.ontos",
    nodeId: "formal-release"
  },
  {
    name: "rich-fields",
    path: "spec/conformance/valid/rich-fields.ontos",
    nodeId: "rich-field-node"
  }
];

for (const fixture of cases) {
  const source = readFileSync(fixture.path, "utf8");
  const ast = parseOntosDocument(source, {
    includeDiagnostics: true,
    includeSourceLocations: true,
    preserveComments: true
  });
  assert.equal(ast.diagnostics, undefined, `${fixture.name} should not emit diagnostics`);
  assert.equal(validateAst(ast), true, `${fixture.name} AST should match the public schema`);

  const node = findNodeById(ast, fixture.nodeId);
  assert.ok(node, `${fixture.name} should expose node lookup by ID`);
  assert.ok(node.source?.start?.line, `${fixture.name} should expose source locations`);
  assert.ok(getNodePath(ast, fixture.nodeId).length > 0, `${fixture.name} should expose node paths`);

  const references = collectReferences(ast);
  assert.ok(Array.isArray(references), `${fixture.name} references should be collectable`);

  const model = createViewerModel(ast);
  assert.equal(model.ast, ast, `${fixture.name} viewer should preserve AST identity`);
  assert.ok(model.stats.nodes > 0, `${fixture.name} viewer model should count nodes`);
  assert.equal(model.flatNodes.length, model.stats.nodes, `${fixture.name} viewer flat node count should match`);
  assert.match(exportViewerDocument(model, "md"), /^# /u, `${fixture.name} viewer markdown export should render`);
  assert.doesNotThrow(
    () => JSON.parse(exportViewerDocument(model, "json")),
    `${fixture.name} viewer JSON export should parse`
  );

  const markdown = exportMarkdown(ast, { frontMatter: true, toc: true, headingOffset: 1 });
  assert.match(markdown, /Table of Contents/u, `${fixture.name} Markdown export should include TOC`);
  assert.match(markdown, new RegExp(`\\{#${fixture.nodeId}\\}`, "u"), `${fixture.name} Markdown export should preserve IDs`);

  const html = exportHtml(ast, { searchIndex: true });
  assert.match(html, /data-ontos-standalone="true"/u, `${fixture.name} HTML export should be standalone`);
  assert.match(html, /id="ontos-search-index"/u, `${fixture.name} HTML export should include search index`);

  const json = JSON.parse(exportJson(ast));
  assert.deepEqual(json, ast, `${fixture.name} JSON export should preserve AST`);

  const opml = exportOpml(ast, { fields: ["purpose", "status"] });
  assert.match(opml, /<opml version="2.0">/u, `${fixture.name} OPML export should render`);

  const pack = createNodePack(ast, fixture.nodeId, "context", { tokenBudget: 800 });
  assert.equal(pack.nodeId, fixture.nodeId, `${fixture.name} pack should target requested node`);
  assert.ok(Array.isArray(pack.path), `${fixture.name} pack should include path`);
  assert.match(exportPackMarkdown(pack), /^# \.ontos context pack/u, `${fixture.name} pack Markdown should render`);
}

const commentAst = parseOntosDocument(
  `@ontos 1.0
@title Commented compatibility fixture
@type conformance

// parser consumers may opt into comments
- Commented node @id(commented-node)
  purpose: Validate optional comments in AST consumers.
`,
  {
    includeDiagnostics: true,
    includeSourceLocations: true,
    preserveComments: true
  }
);
assert.equal(commentAst.comments.length, 1, "comment preservation should expose comments");
assert.equal(validateAst(commentAst), true, "commented AST should match the public schema");

console.log(`AST consumer compatibility ok: ${cases.length + 1} fixtures`);

function validateAst(ast) {
  if (!validate(ast)) {
    throw new Error(ajv.errorsText(validate.errors));
  }
  return true;
}
