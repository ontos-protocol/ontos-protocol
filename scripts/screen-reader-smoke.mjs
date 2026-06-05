import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import {
  createOntosViewer,
  createOntosViewerApp
} from "@ontos-protocol/viewer";

const websiteDocument = new JSDOM(readFileSync("website/dist/index.html", "utf8")).window.document;

assert.ok(websiteDocument.querySelector("main"), "website needs a main landmark");
assert.ok(websiteDocument.querySelector("nav[aria-label]"), "website navigation needs an accessible label");
assert.equal(websiteDocument.querySelectorAll("h1").length, 1, "website needs exactly one h1");

for (const button of websiteDocument.querySelectorAll("button")) {
  assert.ok(accessibleName(button), `button needs an accessible name: ${button.outerHTML}`);
}

for (const input of websiteDocument.querySelectorAll("input")) {
  assert.ok(accessibleName(input), `input needs an accessible name: ${input.outerHTML}`);
}

const viewerSource = readFileSync("spec/conformance/valid/project-state.ontos", "utf8");
const viewerDom = new JSDOM("<!doctype html><main></main>", { pretendToBeVisual: true });
const viewer = createOntosViewer(viewerSource, { document: viewerDom.window.document });
viewerDom.window.document.querySelector("main").appendChild(viewer);

const tree = viewer.querySelector("[role='tree']");
assert.ok(tree, "viewer needs a tree role");
const treeitems = [...viewer.querySelectorAll("[role='treeitem']")];
assert.ok(treeitems.length > 0, "viewer needs treeitems");
for (const treeitem of treeitems) {
  assert.ok(accessibleName(treeitem), "viewer treeitem needs readable text");
  assert.match(treeitem.getAttribute("aria-expanded") ?? "", /^(true|false)$/u);
}

for (const control of viewer.querySelectorAll("button, input")) {
  assert.ok(accessibleName(control), `viewer control needs an accessible name: ${control.outerHTML}`);
}

const appDom = new JSDOM("<!doctype html><main></main>", { pretendToBeVisual: true });
const app = createOntosViewerApp({ document: appDom.window.document, initialSource: viewerSource });
appDom.window.document.querySelector("main").appendChild(app);
assert.ok(app.querySelector("[role='status']"), "viewer app needs a status region");
assert.ok(app.querySelector("input[type='file'][aria-label]"), "viewer app file input needs an aria-label");

const errorViewer = createOntosViewer("@ontos 1.0\n@title Broken\n\n  - Missing parent\n", {
  document: appDom.window.document
});
assert.ok(errorViewer.querySelector("[role='alert']"), "viewer error state needs an alert region");

console.log("screen reader smoke ok");

function accessibleName(element) {
  const aria = element.getAttribute("aria-label")?.trim();
  if (aria) {
    return aria;
  }
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(/\s+/u)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent.trim() ?? "")
      .filter(Boolean)
      .join(" ");
  }
  if (element.id) {
    const label = element.ownerDocument.querySelector(`label[for="${cssEscape(element.id)}"]`);
    if (label?.textContent.trim()) {
      return label.textContent.trim();
    }
  }
  return element.textContent.trim();
}

function cssEscape(value) {
  return String(value).replace(/["\\]/gu, "\\$&");
}
