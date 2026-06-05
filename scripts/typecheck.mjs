import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = [
  "extensions",
  "packages",
  "scripts",
  "website/src"
];

const files = roots
  .flatMap((root) => collect(root))
  .filter((file) => /\.(js|mjs)$/u.test(file))
  .sort();

for (const file of files) {
  execFileSync(process.execPath, ["--check", file], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

console.log(`typecheck ok (${files.length} JavaScript files)`);

function collect(path) {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) {
    return [];
  }
  if (stat.isFile()) {
    return [path];
  }
  if (!stat.isDirectory() || shouldSkip(path)) {
    return [];
  }
  return readdirSync(path).flatMap((entry) => collect(join(path, entry)));
}

function shouldSkip(path) {
  return [
    "node_modules",
    ".git",
    "website/dist",
    "extensions/vscode/dist",
    "extensions/obsidian/dist",
    "extensions/obsidian/vault/.obsidian"
  ].some((part) => path.includes(part));
}
