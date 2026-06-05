import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { JSDOM } from "jsdom";
import {
  createOntosViewer,
  createOntosViewerApp,
  createViewerModel,
  exportViewerDocument,
  focusViewerNode
} from "../packages/viewer/src/index.js";

const officialFiles = [
  ...readdirSync("examples")
    .filter((file) => file.endsWith(".ontos"))
    .map((file) => `examples/${file}`),
  ...readdirSync("spec/conformance/valid")
    .filter((file) => file.endsWith(".ontos"))
    .map((file) => `spec/conformance/valid/${file}`)
].sort();

for (const file of officialFiles) {
  const source = readFileSync(file, "utf8");
  const dom = new JSDOM("<!doctype html><main></main>", { pretendToBeVisual: true });
  const viewer = createOntosViewer(source, { document: dom.window.document });
  dom.window.document.querySelector("main").appendChild(viewer);
  const model = createViewerModel(source);

  assert.equal(viewer.querySelectorAll("[role='treeitem']").length, model.stats.nodes, `${file} node count mismatch`);
  assert.ok(viewer.querySelector("[role='tree']"), `${file} missing tree role`);
  assert.ok(viewer.querySelector("input[type='search'][aria-label]"), `${file} missing labeled search`);
  assert.ok(viewer.querySelector("button[data-export-target='json']"), `${file} missing JSON export`);
  assert.equal(viewer.querySelector(".ontos-viewer__error"), null, `${file} rendered an error state`);

  for (const details of viewer.querySelectorAll("details")) {
    assert.match(details.getAttribute("aria-expanded") ?? "", /^(true|false)$/u, `${file} missing expanded state`);
  }

  assert.match(exportViewerDocument(model, "md"), /^# /u, `${file} markdown export missing heading`);
  assert.doesNotThrow(() => JSON.parse(exportViewerDocument(model, "json")), `${file} JSON export is invalid`);
}

const largeSource = createLargeDocument(2200);
const largeDom = new JSDOM("<!doctype html><main></main>", { pretendToBeVisual: true });
const renderStart = performance.now();
const largeViewer = createOntosViewer(largeSource, { document: largeDom.window.document });
const renderMs = performance.now() - renderStart;
largeDom.window.document.querySelector("main").appendChild(largeViewer);

assert.equal(largeViewer.querySelectorAll("[role='treeitem']").length, 2200);
assert.ok(renderMs < 8000, `large viewer render exceeded 8000ms: ${renderMs.toFixed(1)}ms`);
assert.equal(focusViewerNode(largeViewer, "node-1200"), true);
assert.equal(largeViewer.querySelector("[data-node-id='node-1200']").dataset.focused, "true");

const firstSummary = largeViewer.querySelector("[data-node-id='node-0001'] > summary");
firstSummary.focus();
firstSummary.dispatchEvent(new largeDom.window.KeyboardEvent("keydown", { key: "End", bubbles: true }));
assert.equal(largeDom.window.document.activeElement.dataset.nodeSummary, "node-2200");
largeDom.window.document.activeElement.dispatchEvent(new largeDom.window.KeyboardEvent("keydown", { key: "Home", bubbles: true }));
assert.equal(largeDom.window.document.activeElement.dataset.nodeSummary, "node-0001");

const search = largeViewer.querySelector("input[type='search']");
search.value = "Node 1200";
search.dispatchEvent(new largeDom.window.Event("input", { bubbles: true }));
assert.equal(largeViewer.querySelector("[data-node-id='node-1200']").hidden, false);
assert.equal(largeViewer.querySelector("[data-node-id='node-0001']").hidden, true);

let exportDetail;
largeViewer.addEventListener("ontos-export", (event) => {
  exportDetail = event.detail;
});
largeViewer.querySelector("button[data-export-target='opml']").click();
assert.equal(exportDetail.target, "opml");
assert.match(exportDetail.content, /<opml version="2.0">/u);

const appDom = new JSDOM("<!doctype html><main></main>", { pretendToBeVisual: true });
const app = createOntosViewerApp({ document: appDom.window.document, initialSource: largeSource });
assert.ok(app.querySelector("input[type='file'][aria-label]"));
assert.ok(app.querySelector("[role='status']"));

console.log(
  [
    "viewer browser smoke ok",
    `files=${officialFiles.length}`,
    `largeRender=${renderMs.toFixed(1)}ms`
  ].join(" ")
);

function createLargeDocument(nodes) {
  const lines = ["@ontos 1.0", "@title Viewer browser smoke", "@type benchmark", ""];
  for (let index = 1; index <= nodes; index += 1) {
    const id = `node-${String(index).padStart(4, "0")}`;
    lines.push(`- Node ${index} @id(${id}) #viewer`);
    lines.push(`  purpose: Exercise browser rendering for ${id}.`);
    lines.push("  status: ready");
    lines.push(`  verify: [[${id}.purpose]]`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}
