import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import {
  createOntosViewer,
  createOntosViewerApp,
  createViewerModel,
  exportViewerDocument,
  focusViewerNode,
  searchViewerModel
} from "../src/index.js";

const source = readFileSync("examples/project-state.ontos", "utf8");
const richSource = readFileSync("spec/conformance/valid/rich-fields.ontos", "utf8");
const model = createViewerModel(source);

assert.equal(model.title, "Project state example");
assert.equal(model.stats.nodes, 3);
assert.ok(model.stats.fields >= 7);
assert.ok(model.stats.references >= 1);
assert.equal(model.diagnostics.length, 0);

const releaseGate = searchViewerModel(model, "release gate");
assert.equal(releaseGate.length, 1);
assert.equal(releaseGate[0].id, "release-gate");
assert.deepEqual(releaseGate[0].path, ["Formal release", "Toolchain", "Release gate"]);

const boundary = searchViewerModel(model, "public naming");
assert.equal(boundary[0].id, "formal-release");

const reference = searchViewerModel(model, "formal-release");
assert.ok(reference.some((node) => node.id === "toolchain"));

assert.match(exportViewerDocument(model, "md"), /# Project state example/);
assert.match(exportViewerDocument(model, "html"), /<details open id="formal-release">/);
assert.equal(JSON.parse(exportViewerDocument(model, "json")).metadata.title, "Project state example");
assert.match(exportViewerDocument(model, "opml"), /<opml version="2.0">/);

const richModel = createViewerModel(richSource);
assert.equal(richModel.flatNodes[0].fields.snippet.kind, "code");
assert.match(exportViewerDocument(richModel, "md"), /```js/);
assert.match(exportViewerDocument(richModel, "html"), /<pre><code class="language-js">/);

const dom = new JSDOM("<!doctype html><main></main>", { pretendToBeVisual: true });
let copied = "";
Object.defineProperty(dom.window.navigator, "clipboard", {
  configurable: true,
  value: {
    writeText: async (value) => {
      copied = value;
    }
  }
});

const viewer = createOntosViewer(source, { document: dom.window.document });
dom.window.document.querySelector("main").appendChild(viewer);
const copyEvents = [];
viewer.addEventListener("ontos-copy", (event) => {
  copyEvents.push(event.detail);
});

assert.ok(viewer.querySelector("[data-node-id='release-gate']"));
assert.ok(viewer.querySelector(".ontos-viewer__references"));
assert.equal(focusViewerNode(viewer, "release-gate"), true);
assert.equal(viewer.querySelector("[data-node-id='release-gate']").dataset.focused, "true");
assert.equal(viewer.querySelector("[data-node-id='release-gate']").getAttribute("aria-expanded"), "true");

const search = viewer.querySelector("input[type='search']");
search.value = "release gate";
search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(viewer.querySelector("[data-node-id='release-gate']").hidden, false);
assert.equal(viewer.querySelector("[data-node-id='formal-release']").hidden, false);
search.value = "";
search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

const firstSummary = viewer.querySelector("[data-node-id='formal-release'] > summary");
firstSummary.focus();
firstSummary.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
assert.equal(dom.window.document.activeElement.dataset.nodeSummary, "toolchain");
dom.window.document.activeElement.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
assert.equal(dom.window.document.activeElement.dataset.nodeSummary, "release-gate");
dom.window.document.activeElement.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
assert.equal(dom.window.document.activeElement.dataset.nodeSummary, "toolchain");
dom.window.document.activeElement.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Home", bubbles: true }));
assert.equal(dom.window.document.activeElement.dataset.nodeSummary, "formal-release");

const toolchainSummary = viewer.querySelector("[data-node-id='toolchain'] > summary");
toolchainSummary.focus();
toolchainSummary.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
assert.equal(viewer.querySelector("[data-node-id='toolchain']").open, false);
assert.equal(viewer.querySelector("[data-node-id='toolchain']").getAttribute("aria-expanded"), "false");
toolchainSummary.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
assert.equal(viewer.querySelector("[data-node-id='toolchain']").open, true);
assert.equal(viewer.querySelector("[data-node-id='toolchain']").getAttribute("aria-expanded"), "true");

const copyId = viewer.querySelector("button[data-action='copy-id'][data-node-id='toolchain']");
copyId.click();
await flush(dom);
assert.equal(copied, "toolchain");
assert.equal(copyEvents.at(-1).action, "copy-id");

let exported;
viewer.addEventListener("ontos-export", (event) => {
  exported = event.detail;
});
viewer.querySelector("button[data-export-target='json']").click();
assert.equal(exported.target, "json");
assert.equal(JSON.parse(exported.content).metadata.title, "Project state example");

viewer.querySelector("button[data-action='copy-ai-boundary'][data-node-id='formal-release']").click();
await flush(dom);
assert.equal(copyEvents.at(-1).action, "copy-ai-boundary");
assert.match(copied, /unreleased project names/);

const empty = createOntosViewer(null, { document: dom.window.document });
assert.ok(empty.querySelector(".ontos-viewer__empty"));

const diagnostics = createOntosViewer("@ontos 2.0\n@title Bad\n\n- Root @id(root)\n", {
  document: dom.window.document
});
assert.ok(diagnostics.querySelector(".ontos-viewer__diagnostics"));
assert.match(diagnostics.textContent, /Unsupported/);

const warnings = createOntosViewer("@ontos 1.0\n@title One\n@title Two\n\n- Root @id(root)\n", {
  document: dom.window.document
});
assert.ok(warnings.querySelector(".ontos-viewer__diagnostics"));
assert.match(warnings.textContent, /warning/);

const app = createOntosViewerApp({ document: dom.window.document, initialSource: source });
assert.ok(app.querySelector("input[type='file']"));
assert.match(app.textContent, /Local file stays/);

console.log("viewer model and component ok");

function flush(dom) {
  return new Promise((resolve) => {
    dom.window.setTimeout(resolve, 0);
  });
}
