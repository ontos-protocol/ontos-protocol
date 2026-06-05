import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const roots = [
  "README.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "docs",
  "examples",
  "extensions",
  "packages",
  "spec",
  "tests",
  "website/README.md"
];

const findings = [];
const markdownFiles = roots.flatMap((root) => collect(root)).sort();

for (const file of markdownFiles) {
  const text = readFileSync(file, "utf8");
  for (const link of markdownLinks(text)) {
    const target = normalizeTarget(link.target);
    if (!target || shouldSkip(target)) {
      continue;
    }
    const [targetPath] = target.split("#");
    if (!targetPath) {
      continue;
    }
    const absolute = targetPath.startsWith("/")
      ? targetPath
      : resolve(dirname(file), decodeURIComponent(targetPath));
    if (!statSync(absolute, { throwIfNoEntry: false })) {
      findings.push(`${file}:${link.line}: missing link target ${target}`);
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(`doc links ok (${markdownFiles.length} Markdown files)`);

function collect(path) {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) {
    return [];
  }
  if (stat.isFile()) {
    return path.endsWith(".md") ? [path] : [];
  }
  if (!stat.isDirectory() || shouldSkipPath(path)) {
    return [];
  }
  return readdirSync(path).flatMap((entry) => collect(join(path, entry)));
}

function shouldSkipPath(path) {
  return [
    "node_modules",
    ".git",
    "website/dist",
    "extensions/obsidian/dist",
    "extensions/obsidian/vault/.obsidian"
  ].some((part) => path.includes(part));
}

function markdownLinks(text) {
  const links = [];
  const pattern = /!?\[[^\]\n]*\]\(([^)\n]+)\)/gu;
  for (const match of text.matchAll(pattern)) {
    links.push({
      target: match[1],
      line: text.slice(0, match.index).split("\n").length
    });
  }
  return links;
}

function normalizeTarget(target) {
  return target
    .trim()
    .replace(/^<|>$/g, "")
    .replace(/\s+"[^"]*"$/u, "")
    .replace(/\s+'[^']*'$/u, "");
}

function shouldSkip(target) {
  return /^(?:https?:|mailto:|#)/u.test(target);
}
