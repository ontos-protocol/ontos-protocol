import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";
import {
  createOntosViewer,
  createViewerModel
} from "@ontos-protocol/viewer";

const snapshotPath = "tests/snapshots/viewer/dom-summary.json";
const fixturePaths = [
  ...readdirSync("examples")
    .filter((file) => file.endsWith(".ontos"))
    .map((file) => join("examples", file)),
  ...readdirSync("spec/conformance/valid")
    .filter((file) => file.endsWith(".ontos"))
    .map((file) => join("spec/conformance/valid", file))
].sort();

const actual = {
  version: 1,
  fixtures: fixturePaths.map(snapshotFixture)
};

if (process.env.UPDATE_VIEWER_SNAPSHOTS === "1") {
  mkdirSync(dirname(snapshotPath), { recursive: true });
  writeFileSync(snapshotPath, `${JSON.stringify(actual, null, 2)}\n`);
  console.log(`updated viewer DOM snapshot: ${snapshotPath}`);
  process.exit(0);
}

if (!existsSync(snapshotPath)) {
  throw new Error(`Missing viewer DOM snapshot. Run UPDATE_VIEWER_SNAPSHOTS=1 npm run validate:visual-regression.`);
}

const expected = JSON.parse(readFileSync(snapshotPath, "utf8"));
assert.deepEqual(actual, expected, "viewer DOM snapshot drifted");

console.log(`viewer visual regression ok: ${actual.fixtures.length} fixtures`);

function snapshotFixture(path) {
  const source = readFileSync(path, "utf8");
  const model = createViewerModel(source);
  const dom = new JSDOM("<!doctype html><main></main>", { pretendToBeVisual: true });
  const viewer = createOntosViewer(source, { document: dom.window.document });
  dom.window.document.querySelector("main").appendChild(viewer);

  const normalizedHtml = normalizeHtml(viewer.outerHTML);
  const exportTargets = [...viewer.querySelectorAll("[data-export-target]")]
    .map((element) => element.dataset.exportTarget)
    .sort();

  return {
    path,
    title: model.title,
    stats: model.stats,
    treeitems: viewer.querySelectorAll("[role='treeitem']").length,
    fieldSections: viewer.querySelectorAll("[data-field]").length,
    exportTargets,
    hasSearch: Boolean(viewer.querySelector("input[type='search'][aria-label]")),
    hasTree: Boolean(viewer.querySelector("[role='tree']")),
    hash: sha256(normalizedHtml)
  };
}

function normalizeHtml(value) {
  return value
    .replace(/>\s+</gu, "><")
    .replace(/\s+/gu, " ")
    .trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
