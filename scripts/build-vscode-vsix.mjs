import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const extensionDir = "extensions/vscode";
const releaseDir = ".release";
const manifestPath = join(extensionDir, "package.json");
const version = JSON.parse(readFileSync(manifestPath, "utf8")).version;
const outputName = `ontos-protocol-vscode-${version}.vsix`;

export function buildVsCodeVsix(options = {}) {
  const { updateChecksums = true } = options;
  assert.ok(existsSync(manifestPath), "missing VS Code extension package.json");

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.name, "ontos-protocol-vscode", "VS Code extension package name must stay stable");
  assert.equal(manifest.publisher, "ontos-protocol", "VS Code extension publisher must be ontos-protocol");
  assert.equal(manifest.version, version, `VS Code extension version must be ${version}`);
  assert.ok(manifest.main === "./dist/extension.js", "VS Code extension must package the bundled dist entrypoint");

  execFileSync(process.execPath, ["scripts/build-vscode-extension.mjs"], {
    cwd: resolve("."),
    stdio: "inherit"
  });

  const bundlePath = join(extensionDir, "dist/extension.js");
  assert.ok(existsSync(bundlePath), "missing VS Code extension dist/extension.js after build");

  mkdirSync(releaseDir, { recursive: true });
  const outputPath = join(releaseDir, outputName);
  rmSync(outputPath, { force: true });

  const vsceBin = resolve("node_modules/.bin/vsce");
  assert.ok(existsSync(vsceBin), "missing local vsce binary; run npm install");
  execFileSync(vsceBin, ["package", "--no-dependencies", "--out", resolve(outputPath)], {
    cwd: resolve(extensionDir),
    stdio: "inherit"
  });

  assert.ok(existsSync(outputPath), `VSIX was not created at ${outputPath}`);
  const bytes = readFileSync(outputPath);
  assert.ok(bytes.subarray(0, 2).equals(Buffer.from("PK")), "VSIX output should be a zip archive");

  if (updateChecksums) {
    upsertChecksum(outputName, bytes);
  }

  console.log(`VS Code VSIX built: ${outputPath}`);
  return {
    name: outputName,
    path: outputPath
  };
}

function upsertChecksum(name, bytes) {
  const checksumPath = join(releaseDir, "SHA256SUMS");
  const digest = createHash("sha256").update(bytes).digest("hex");
  const existing = existsSync(checksumPath) ? readFileSync(checksumPath, "utf8") : "";
  const lines = existing
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line && !line.endsWith(`  ${name}`));
  lines.push(`${digest}  ${name}`);
  writeFileSync(checksumPath, `${lines.join("\n")}\n`, "utf8");
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  buildVsCodeVsix();
}

export const vscodeVsixArtifact = {
  name: outputName,
  path: join(releaseDir, outputName),
  basename: basename(outputName)
};
