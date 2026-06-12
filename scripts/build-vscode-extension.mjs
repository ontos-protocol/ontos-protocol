import { build } from "esbuild";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = "extensions/vscode";
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await build({
  entryPoints: [join(root, "src/extension.js")],
  bundle: true,
  format: "esm",
  outfile: join(dist, "extension.js"),
  platform: "node",
  target: ["node20"],
  external: ["vscode"],
  sourcemap: true
});

const bundle = readFileSync(join(dist, "extension.js"), "utf8");
for (const required of [
  "ontos.validate",
  "ontos.preview",
  "ontos.nativeViewer",
  "ontos.openAsText",
  "ontos.reviewPack",
  "ontos.copyNodeText",
  "ontos.convertMarkdown",
  "createDiagnosticCollection",
  "registerDocumentFormattingEditProvider",
  "registerCustomEditorProvider",
  "resolveCustomTextEditor",
  "migrateOpenOntosTextTabs",
  "field-toggle",
  "Search nodes and fields"
]) {
  if (!bundle.includes(required)) {
    throw new Error(`VS Code extension bundle is missing ${required}.`);
  }
}

for (const forbidden of [
  "@ontos-protocol/parser",
  "@ontos-protocol/cli",
  "@ontos-protocol/viewer"
]) {
  if (bundle.includes(forbidden)) {
    throw new Error(`VS Code extension bundle still references ${forbidden}.`);
  }
}

console.log("VS Code extension build ok");
