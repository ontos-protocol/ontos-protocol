import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { join } from "node:path";

const allowed = new Set([
  "0BSD",
  "Apache-2.0",
  "Artistic-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BlueOak-1.0.0",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MIT-0",
  "Python-2.0"
]);

const packageExceptions = new Map([
  ["@azu/style-format", "WTFPL"],
  ["spdx-exceptions", "CC-BY-3.0"]
]);

const packages = collectPackages("node_modules");
const findings = [];

for (const packageJson of packages) {
  const manifest = JSON.parse(readFileSync(packageJson, "utf8"));
  const license = normalizeLicense(manifest.license ?? manifest.licenses);
  if (!isAllowed(manifest.name ?? packageJson, license)) {
    findings.push(`${manifest.name ?? packageJson}: ${license || "missing license"}`);
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(`license scan ok (${packages.length} packages)`);

function collectPackages(root) {
  const results = [];
  const seen = new Set();

  function visit(dir) {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith(".")) {
        continue;
      }
      const path = join(dir, entry);
      const stat = statSync(path);
      if (!stat.isDirectory()) {
        continue;
      }
      if (entry.startsWith("@")) {
        visit(path);
        continue;
      }
      const manifest = join(path, "package.json");
      if (statSync(manifest, { throwIfNoEntry: false })?.isFile()) {
        const real = realpathSync(manifest);
        if (!seen.has(real)) {
          seen.add(real);
          results.push(manifest);
        }
      }
    }
  }

  visit(root);
  return results.sort();
}

function normalizeLicense(value) {
  if (typeof value === "string") {
    return value.replace(/[()]/g, "").trim();
  }
  if (Array.isArray(value) && value.length === 1) {
    return normalizeLicense(value[0]?.type ?? value[0]);
  }
  return "";
}

function isAllowed(name, license) {
  if (allowed.has(license)) {
    return true;
  }
  if (license.includes(" OR ")) {
    return license.split(/\s+OR\s+/u).some((part) => allowed.has(part.trim()));
  }
  if (name.startsWith("@vscode/vsce-sign") && license === "SEE LICENSE IN LICENSE.txt") {
    return true;
  }
  return packageExceptions.get(name) === license;
}
