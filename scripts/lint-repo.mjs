import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = [
  ".github",
  "config",
  "apps",
  "docs",
  "examples",
  "extensions",
  "packages",
  "scripts",
  "spec",
  "tests",
  "website/src",
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "LICENSE",
  "tsconfig.json",
  ".prettierrc.json",
  ".prettierignore",
  "package.json"
];

const findings = [];

for (const file of roots.flatMap((root) => collect(root))) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  if (!text.endsWith("\n")) {
    findings.push(`${file}: missing final newline`);
  }
  if (/\r/.test(text)) {
    findings.push(`${file}: contains CRLF or carriage returns`);
  }
  for (const [index, line] of lines.entries()) {
    if (/[ \t]+$/.test(line)) {
      findings.push(`${file}:${index + 1}: trailing whitespace`);
    }
    if (/\t/.test(line) && !allowsTabs(file)) {
      findings.push(`${file}:${index + 1}: tab character`);
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("repo lint ok");

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
  return readdirSync(path).flatMap((entry) => collect(join(path, entry)));
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

function isTextPath(path) {
  return /\.(css|html|js|json|md|mjs|opml|ontos|svg|txt|xml|yml|yaml)$/u.test(path);
}

function allowsTabs(path) {
  return path.endsWith(".svg") || path.includes("spec/conformance/invalid/");
}
