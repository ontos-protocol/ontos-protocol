import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { treeWebviewHtml } from "../extensions/vscode/src/webviewTree.js";

const source = `@ontos 1.0
@title Webview UX

- Root @id(root) #launch
  status: active
  purpose: This field is intentionally long so the custom editor has to render it as a collapsed field block instead of flattening the whole thing into a noisy gray row that makes first-open UX feel chaotic and unreadable.
  - Child @id(child)
    owner: release
  - Leaf
`;

const messages = [];
const html = treeWebviewHtml(source);
assert.equal(html.includes("<details"), false, "tree webview should not use native details disclosure controls");
assert.equal(html.includes("<summary"), false, "tree webview should not use native summary disclosure controls");
assert.match(html, /node-row/u, "tree webview should use the custom node row renderer");
assert.match(html, /field-toggle/u, "tree webview should include collapsed long-field controls");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  beforeParse(window) {
    window.acquireVsCodeApi = () => ({
      postMessage(message) {
        messages.push(message);
      }
    });
  }
});

dom.window.HTMLElement.prototype.scrollIntoView = () => {};
const { document } = dom.window;

const rows = [...document.querySelectorAll(".node-row")];
assert.equal(rows.length, 3, "all nodes should render as custom rows");
assert.equal(rows[0].getAttribute("aria-expanded"), "true", "root should be open by default");
assert.equal(rows[2].hasAttribute("aria-expanded"), false, "leaf rows should not expose aria-expanded");

const longField = document.querySelector(".field-row[data-long='true']");
assert.ok(longField, "long fields should render as collapsed field rows");
assert.equal(longField.querySelector(".field-full").hidden, true, "long field full text should start hidden");
longField.querySelector(".field-toggle").click();
assert.equal(longField.querySelector(".field-full").hidden, false, "long field should expand on demand");

document.getElementById("collapse").click();
for (const row of rows.filter((item) => item.hasAttribute("aria-expanded"))) {
  assert.equal(row.getAttribute("aria-expanded"), "false", "collapse should sync aria-expanded");
}

const firstToggle = document.querySelector(".toggle");
firstToggle.click();
assert.equal(rows[0].getAttribute("aria-expanded"), "true", "chevron click should reopen a collapsed root");
assert.equal(firstToggle.textContent, "▾", "chevron should sync with open state");

rows[0].click();
assert.equal(rows[0].dataset.focused, "true", "row click should select without toggling");
assert.equal(rows[0].getAttribute("aria-expanded"), "true", "row click should not toggle expansion");
assert.equal(messages.at(-1).type, "focus", "row click should notify focus");

document.getElementById("openText").click();
assert.equal(messages.at(-1).type, "openText", "toolbar Open as Text should request explicit text mode");

const search = document.getElementById("search");
search.value = "owner";
search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.match(document.getElementById("count").textContent, /matches/u, "search should update match count");
assert.ok(document.querySelector(".node-row[data-search-hit='true']"), "search should mark matching rows");

console.log("VS Code webview UI tests ok");
