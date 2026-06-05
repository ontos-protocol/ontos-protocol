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
  "docs",
  "examples",
  "extensions",
  "packages",
  "scripts",
  "spec",
  "tests",
  "website"
];

const excludedPaths = new Set(["scripts/secret-scan.mjs"]);
const tokenPrefix = ["s", "k", "-"].join("");

const secretPatterns = [
  { label: "GitHub token", pattern: /ghp_[A-Za-z0-9_]{36,}/u },
  { label: "GitHub fine-grained token", pattern: /github_pat_[A-Za-z0-9_]{40,}/u },
  { label: "npm token", pattern: /npm_[A-Za-z0-9]{36,}/u },
  { label: "cloud access key", pattern: /AKIA[0-9A-Z]{16}/u },
  { label: "API key", pattern: new RegExp(`${tokenPrefix}[A-Za-z0-9]{20,}`, "u") }
];

const findings = [];

for (const file of filesToScan()) {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const rule of secretPatterns) {
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

console.log("secret scan ok");

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
    "website/dist",
    "extensions/vscode/dist",
    "extensions/obsidian/dist",
    "extensions/obsidian/vault/.obsidian"
  ].some((part) => path.includes(part));
}
