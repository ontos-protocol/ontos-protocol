import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "extensions/vscode";
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

assertEqual(manifest.displayName, ".ontos Protocol", "displayName");
assertEqual(manifest.main, "./dist/extension.js", "main");
assertEqual(manifest.contributes.languages[0].id, "ontos", "language id");
assertEqual(manifest.contributes.languages[0].extensions[0], ".ontos", "language extension");
assertEqual(manifest.contributes.customEditors[0].viewType, "ontos.nativeViewer", "custom editor viewType");
assertEqual(manifest.contributes.customEditors[0].priority, "default", "custom editor priority");
assertEqual(manifest.configurationDefaults["workbench.editorAssociations"]["*.ontos"], "ontos.nativeViewer", "editor association");
assertEqual(manifest.contributes.configuration.properties["ontos.indentGuides"].default, true, "indent guides default");
assertEqual(manifest.contributes.configuration.properties["ontos.depthBands"].default, false, "depth bands default");
assertEqual(manifest.contributes.configuration.properties["ontos.textFolding"].default, false, "text folding default");
assertEqual(manifest.configurationDefaults["[ontos]"]["editor.guides.indentation"], true, "ontos indentation guides");
assertEqual(manifest.version, "1.0.3", "version");
assertEqual(manifest.configurationDefaults["[ontos]"]["editor.showFoldingControls"], "never", "ontos folding controls");
assertEqual(manifest.configurationDefaults["[ontos]"]["editor.folding"], false, "ontos text folding");
assertEqual(manifest.configurationDefaults["[ontos]"]["editor.foldingHighlight"], false, "ontos folding highlight");
assertEqual(manifest.configurationDefaults["[ontos]"]["editor.glyphMargin"], false, "ontos glyph margin");

execFileSync(process.execPath, ["scripts/build-vscode-extension.mjs"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

for (const path of [
  manifest.main,
  `${manifest.main}.map`,
  "src/extension.js",
  "src/nativeEditor.js",
  "src/openMode.js",
  "src/openModeLogic.js",
  "src/treeProvider.js",
  "src/webviewTree.js",
  "src/webviewPreview.js",
  manifest.contributes.languages[0].configuration,
  manifest.contributes.grammars[0].path,
  manifest.icon,
  "assets/screenshot.svg",
  "README.md"
]) {
  if (!existsSync(join(root, path))) {
    throw new Error(`VS Code extension is missing ${path}`);
  }
}

const commandIds = new Set(manifest.contributes.commands.map((command) => command.command));
const commandTitles = new Map(manifest.contributes.commands.map((command) => [command.command, command.title]));
for (const command of [
  "ontos.validate",
  "ontos.format",
  "ontos.exportMarkdown",
  "ontos.exportHtml",
  "ontos.exportJson",
  "ontos.exportOpml",
  "ontos.copyNodeId",
  "ontos.copyNodePath",
  "ontos.copyNodeText",
  "ontos.contextPack",
  "ontos.reviewPack",
  "ontos.handoffPack",
  "ontos.modifyBoundaryPack",
  "ontos.verificationPack",
  "ontos.preview",
  "ontos.convertMarkdown",
  "ontos.openAsText",
  "ontos.openAsTree",
  "ontos.openWorkspaceTree",
  "ontos.openInCursorPanel",
  "ontos.revealNode",
  "ontos.focusTree",
  "ontos.refreshTree"
]) {
  if (!commandIds.has(command)) {
    throw new Error(`VS Code extension is missing command ${command}`);
  }
}
assertEqual(commandTitles.get("ontos.preview"), ".ontos: Open Optional Side Preview", "preview command title");

const syntax = JSON.parse(readFileSync(join(root, "syntaxes/ontos.tmLanguage.json"), "utf8"));
if (syntax.scopeName !== "source.ontos" || syntax.patterns.length < 5) {
  throw new Error("VS Code syntax grammar is incomplete.");
}

const source = readFileSync(join(root, "src/extension.js"), "utf8");
for (const required of [
  "registerDocumentFormattingEditProvider",
  "registerDocumentSymbolProvider",
  "registerFoldingRangeProvider",
  "createDiagnosticCollection",
  "registerCustomEditorProvider",
  "openAsTextEditor",
  "migrateOpenOntosTextTabs",
  "promoteToTreeViewer",
  "resolveOntosUri",
  "openInCursorPanelOrTree",
  "glass.openFileInStableTab",
  "path: uri.fsPath",
  "isOntosDocument",
  "registerIndentDecorations",
  "createTextEditorDecorationType",
  "convertMarkdownToOntosResult",
  "resolveActiveNodeContext",
  "onDidChangeSelection",
  "nativeEditor.focusNode",
  "nodeInfoAtLine",
  "createTransientNodePack",
  "textFolding"
]) {
  if (!source.includes(required)) {
    throw new Error(`VS Code extension source is missing ${required}`);
  }
}

const nativeEditor = readFileSync(join(root, "src/nativeEditor.js"), "utf8");
for (const required of [
  "resolveCustomTextEditor",
  "openCustomDocument",
  "treeWebviewHtml",
  "enableScripts: true",
  "suppressTreePromotion",
  "onFocusNode",
  "message?.type === \"focus\"",
  "focusNode"
]) {
  if (!nativeEditor.includes(required)) {
    throw new Error(`VS Code custom editor source is missing ${required}`);
  }
}

const openMode = readFileSync(join(root, "src/openMode.js"), "utf8");
for (const required of [
  "vscode.openWith",
  "ontos.nativeViewer",
  "closeTextTabsForUri",
  "suppressTreePromotion",
  "migrateOpenOntosTextTabs",
  "TREE_TEXT_TAB_MIGRATION_VERSION",
  "shouldPromoteOntosTextTab"
]) {
  if (!openMode.includes(required)) {
    throw new Error(`VS Code open mode source is missing ${required}`);
  }
}

const webviewTree = readFileSync(join(root, "src/webviewTree.js"), "utf8");
for (const required of [
  "createViewerModel",
  "grid-template-columns: calc(var(--depth) * 18px) 20px minmax(0, 1fr) auto",
  "field-toggle",
  "Search nodes and fields",
  "setNodeOpen",
  "data-search-hit",
  "role=\"tree\""
]) {
  if (!webviewTree.includes(required)) {
    throw new Error(`VS Code webview tree source is missing ${required}`);
  }
}
for (const forbidden of ["<details", "<summary"]) {
  if (webviewTree.includes(forbidden)) {
    throw new Error(`VS Code webview tree should not include native ${forbidden} controls.`);
  }
}

const preview = readFileSync(join(root, "src/webviewPreview.js"), "utf8");
if (!preview.includes("createWebviewPanel") || !preview.includes("enableScripts: true")) {
  throw new Error("VS Code preview must be an interactive webview.");
}
if (!preview.includes("treeWebviewHtml")) {
  throw new Error("VS Code preview must use the shared webview tree renderer.");
}

const languageConfig = JSON.parse(readFileSync(join(root, "language-configuration.json"), "utf8"));
if ("folding" in languageConfig) {
  throw new Error("VS Code language configuration should not duplicate folding markers.");
}

const bundle = readFileSync(join(root, manifest.main), "utf8");
for (const forbidden of ["@ontos-protocol/parser", "@ontos-protocol/cli", "@ontos-protocol/viewer"]) {
  if (bundle.includes(forbidden)) {
    throw new Error(`VS Code extension bundle should not reference ${forbidden}`);
  }
}

const bundleSize = statSync(join(root, manifest.main)).size;
if (bundleSize > 900_000) {
  throw new Error(`VS Code extension bundle is unexpectedly large: ${bundleSize} bytes`);
}

console.log("VS Code extension smoke ok");

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${expected}, got ${actual}`);
  }
}
