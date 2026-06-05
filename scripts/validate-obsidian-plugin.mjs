import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = "extensions/obsidian";
const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

assertEqual(manifest.id, "ontos-protocol", "plugin id");
assertEqual(manifest.name, ".ontos Protocol", "plugin name");
assertEqual(manifest.version, "1.0.0", "plugin version");

for (const path of [
  "manifest.json",
  "package.json",
  "src/main.js",
  "styles.css",
  "README.md",
  "COMMUNITY_SUBMISSION.md",
  "assets/screenshot.svg",
  "vault/project-state.ontos"
]) {
  if (!existsSync(join(root, path))) {
    throw new Error(`Obsidian plugin is missing ${path}`);
  }
}

const source = readFileSync(join(root, "src/main.js"), "utf8");
for (const required of [
  "registerExtensions",
  "Preview current .ontos file",
  "Export current .ontos file to Markdown",
  "Copy node ID at cursor",
  "Copy node path at cursor",
  "resolveNodeReferences",
  "renderBacklinks",
  "PluginSettingTab"
]) {
  if (!source.includes(required)) {
    throw new Error(`Obsidian plugin source is missing ${required}`);
  }
}

execFileSync(process.execPath, ["scripts/build-obsidian-plugin.mjs"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

for (const path of [
  "dist/main.js",
  "dist/manifest.json",
  "dist/styles.css",
  "vault/.obsidian/plugins/ontos-protocol/main.js",
  "vault/.obsidian/plugins/ontos-protocol/manifest.json",
  "vault/.obsidian/plugins/ontos-protocol/styles.css"
]) {
  if (!existsSync(join(root, path))) {
    throw new Error(`Obsidian plugin build is missing ${path}`);
  }
}

console.log("Obsidian plugin smoke ok");

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${expected}, got ${actual}`);
  }
}
