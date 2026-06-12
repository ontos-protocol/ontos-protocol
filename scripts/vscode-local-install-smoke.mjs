import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = "extensions/vscode";
const temp = mkdtempSync(join(tmpdir(), "ontos-vscode-install-"));

try {
  execFileSync(process.execPath, ["scripts/build-vscode-extension.mjs"], {
    cwd: resolve("."),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(manifest.main, "./dist/extension.js");
  assert.equal(manifest.version, "1.0.2");
  assert.equal(manifest.contributes.customEditors[0].viewType, "ontos.nativeViewer");
  assert.equal(manifest.configurationDefaults["workbench.editorAssociations"]["*.ontos"], "ontos.nativeViewer");
  assert.equal(manifest.configurationDefaults["[ontos]"]["editor.showFoldingControls"], "never");
  assert.equal(manifest.configurationDefaults["[ontos]"]["editor.folding"], false);

  const installDir = join(temp, `${manifest.publisher}.${manifest.name}-${manifest.version}`);
  mkdirSync(installDir, { recursive: true });
  for (const path of [
    "package.json",
    "README.md",
    "LICENSE",
    "language-configuration.json",
    "syntaxes",
    "assets",
    "dist"
  ]) {
    cpSync(join(root, path), join(installDir, path), { recursive: true });
  }

  for (const required of [
    "package.json",
    manifest.main,
    `${manifest.main}.map`,
    manifest.icon,
    "assets/screenshot.png",
    "assets/screenshot.svg",
    manifest.contributes.languages[0].configuration,
    manifest.contributes.grammars[0].path
  ]) {
    assert.ok(existsSync(join(installDir, required)), `local install layout is missing ${required}`);
  }

  const installedBundle = readFileSync(join(installDir, manifest.main), "utf8");
  assert.match(installedBundle, /ontos\.validate/u);
  assert.match(installedBundle, /ontos\.nativeViewer/u);
  assert.match(installedBundle, /resolveCustomTextEditor/u);
  assert.match(installedBundle, /openCustomDocument/u);
  assert.match(installedBundle, /registerCustomEditorProvider/u);
  assert.match(installedBundle, /suppressTreePromotion/u);
  assert.match(installedBundle, /migrateOpenOntosTextTabs/u);
  assert.match(installedBundle, /TREE_TEXT_TAB_MIGRATION_VERSION/u);
  assert.match(installedBundle, /field-toggle/u);
  assert.match(installedBundle, /Search nodes and fields/u);
  assert.match(installedBundle, /isOntosDocument/u);
  assert.match(installedBundle, /ontos\.openAsText/u);
  assert.match(installedBundle, /ontos\.reviewPack/u);
  assert.match(installedBundle, /ontos\.copyNodeText/u);
  assert.match(installedBundle, /ontos\.convertMarkdown/u);
  assert.match(installedBundle, /createTransientNodePack/u);
  assert.equal(installedBundle.includes("@ontos-protocol/parser"), false);
  assert.equal(installedBundle.includes("@ontos-protocol/cli"), false);
  assert.equal(installedBundle.includes("@ontos-protocol/viewer"), false);
  assert.equal(installedBundle.includes("fetch("), false);

  console.log("VS Code local install smoke ok");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
