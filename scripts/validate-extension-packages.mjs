import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { validateOntosDocument } from "@ontos-protocol/parser";

const npmCache = mkdtempSync(join(tmpdir(), "ontos-npm-cache-"));

try {
  validateVsCodePackage();
  validateObsidianPackage();
  console.log("extension package smoke ok");
} finally {
  rmSync(npmCache, { recursive: true, force: true });
}

function validateVsCodePackage() {
  execFileSync(process.execPath, ["scripts/build-vscode-extension.mjs"], {
    cwd: resolve("."),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  const output = execFileSync("npm", ["pack", "./extensions/vscode", "--dry-run", "--json"], {
    cwd: resolve("."),
    env: { ...process.env, npm_config_cache: npmCache },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  const [pack] = JSON.parse(output);
  const files = new Set(pack.files.map((file) => file.path));

  for (const required of [
    "package.json",
    "README.md",
    "LICENSE",
    "dist/extension.js",
    "dist/extension.js.map",
    "language-configuration.json",
    "syntaxes/ontos.tmLanguage.json",
    "assets/icon.png",
    "assets/icon.svg",
    "assets/screenshot.png",
    "assets/screenshot.svg"
  ]) {
    if (!files.has(required)) {
      throw new Error(`VS Code package dry run is missing ${required}.`);
    }
  }

  for (const file of files) {
    if (file.startsWith("node_modules/") || file.endsWith(".log")) {
      throw new Error(`VS Code package dry run includes unwanted file ${file}.`);
    }
    if (file.startsWith("src/")) {
      throw new Error(`VS Code package dry run should not include source file ${file}.`);
    }
  }

  const manifest = JSON.parse(readFileSync("extensions/vscode/package.json", "utf8"));
  if (manifest.version !== "1.0.1" || manifest.publisher !== "ontos-protocol") {
    throw new Error("VS Code package metadata is not ready for release.");
  }
  if (manifest.main !== "./dist/extension.js") {
    throw new Error("VS Code package must use the bundled extension entrypoint.");
  }
  if (manifest.contributes.customEditors?.[0]?.viewType !== "ontos.nativeViewer") {
    throw new Error("VS Code package must declare the default .ontos tree custom editor.");
  }
  if (manifest.configurationDefaults?.["workbench.editorAssociations"]?.["*.ontos"] !== "ontos.nativeViewer") {
    throw new Error("VS Code package must associate .ontos files with the tree custom editor.");
  }
  if (
    manifest.configurationDefaults?.["[ontos]"]?.["editor.showFoldingControls"] !== "never" ||
    manifest.configurationDefaults?.["[ontos]"]?.["editor.folding"] !== false
  ) {
    throw new Error("VS Code package must suppress text-mode folding gutter controls for .ontos files.");
  }

  const bundle = readFileSync("extensions/vscode/dist/extension.js", "utf8");
  for (const required of [
    "registerCustomEditorProvider",
    "resolveCustomTextEditor",
    "openCustomDocument",
    "ontos.nativeViewer",
    "ontos.openAsText",
    "ontos.reviewPack",
    "ontos.copyNodeText",
    "ontos.convertMarkdown",
    "createTransientNodePack",
    "suppressTreePromotion",
    "isOntosDocument"
  ]) {
    if (!bundle.includes(required)) {
      throw new Error(`VS Code package bundle is missing ${required}.`);
    }
  }
  const bundleBytes = Buffer.byteLength(bundle, "utf8");
  if (bundleBytes > 900_000) {
    throw new Error(`VS Code extension bundle is unexpectedly large: ${bundleBytes} bytes.`);
  }
  console.log(`VS Code extension bundle bytes=${bundleBytes}`);
}

function validateObsidianPackage() {
  execFileSync(process.execPath, ["scripts/build-obsidian-plugin.mjs"], {
    cwd: resolve("."),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  for (const required of [
    "extensions/obsidian/dist/main.js",
    "extensions/obsidian/dist/main.js.map",
    "extensions/obsidian/dist/manifest.json",
    "extensions/obsidian/dist/styles.css",
    "extensions/obsidian/vault/.obsidian/plugins/ontos-protocol/main.js",
    "extensions/obsidian/vault/.obsidian/plugins/ontos-protocol/main.js.map",
    "extensions/obsidian/vault/.obsidian/plugins/ontos-protocol/manifest.json",
    "extensions/obsidian/vault/.obsidian/plugins/ontos-protocol/styles.css"
  ]) {
    if (!existsSync(required)) {
      throw new Error(`Obsidian package smoke is missing ${required}.`);
    }
  }

  const manifest = JSON.parse(readFileSync("extensions/obsidian/dist/manifest.json", "utf8"));
  if (manifest.id !== "ontos-protocol" || manifest.version !== "1.0.0") {
    throw new Error("Obsidian manifest metadata is not ready for release.");
  }

  const vaultExample = readFileSync("extensions/obsidian/vault/project-state.ontos", "utf8");
  const diagnostics = validateOntosDocument(vaultExample);
  if (diagnostics.length > 0) {
    throw new Error(`Obsidian example vault document has ${diagnostics.length} diagnostics.`);
  }
}
