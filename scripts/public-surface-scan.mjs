import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "LICENSE",
  "config",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".prettierrc.json",
  ".prettierignore",
  ".github",
  "apps",
  "docs",
  "examples",
  "extensions",
  "packages",
  "scripts",
  "spec",
  "tests",
  "website"
];

const excludedPaths = new Set(["scripts/public-surface-scan.mjs"]);
const legacyRepoName = ["dot", "ontos"].join("");
const wrongPackageScope = ["@ontos", "fmt"].join("");
const privateProduct = ["O", "ntos"].join("");
const privateChineseOther = ["另", "一个"].join("");
const privateChineseDesktop = ["桌", "面"].join("");

const forbidden = [
  { label: "prototype wording", pattern: new RegExp(["M", "VP"].join(""), "u") },
  { label: "pre-1.0 version wording", pattern: /v0\./u },
  { label: "old format version", pattern: /@ontos 0\.1/u },
  { label: "legacy repository name", pattern: new RegExp(legacyRepoName, "u") },
  { label: "legacy package scope", pattern: new RegExp(`@${legacyRepoName}`, "u") },
  { label: "wrong package namespace", pattern: new RegExp(wrongPackageScope, "u") },
  { label: "private product name", pattern: new RegExp(`\\b${privateProduct}\\b`, "u") },
  { label: "private product category", pattern: new RegExp(["desktop", " Agent"].join(""), "u") },
  { label: "private project reference", pattern: new RegExp(["another", " project"].join(""), "u") },
  { label: "private Chinese project reference", pattern: new RegExp(privateChineseOther, "u") },
  { label: "private Chinese product category", pattern: new RegExp(privateChineseDesktop, "u") },
  { label: "preview release wording", pattern: new RegExp(["Public", " Preview"].join(""), "u") },
  { label: "pre-release package wording", pattern: new RegExp(["preview", " package"].join(""), "u") }
];

const findings = [];

for (const file of filesToScan()) {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const rule of forbidden) {
      if (rule.pattern.test(line)) {
        findings.push(`${file}:${index + 1} ${rule.label}`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("public surface scan ok");

function filesToScan() {
  return roots.flatMap((root) => collect(root)).filter((file) => !excludedPaths.has(file));
}

function collect(path) {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) {
    return [];
  }
  if (stat.isFile()) {
    return isTextPath(path) ? [path] : [];
  }
  if (!stat.isDirectory() || shouldSkip(path)) {
    return [];
  }
  return readdirSync(path)
    .flatMap((entry) => collect(join(path, entry)));
}

function isTextPath(path) {
  return /\.(cjs|css|html|js|json|md|mjs|opml|ontos|svg|txt|yml|yaml)$/u.test(path);
}

function shouldSkip(path) {
  return [
    "node_modules",
    ".git",
    "apps/viewer/dist",
    "website/dist",
    "extensions/vscode/dist",
    "extensions/obsidian/dist",
    "extensions/obsidian/vault/.obsidian"
  ].some((part) => path.includes(part));
}
