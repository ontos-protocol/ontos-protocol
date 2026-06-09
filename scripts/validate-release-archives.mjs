import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const releaseDir = ".release";
const vscodeManifest = JSON.parse(readFileSync("extensions/vscode/package.json", "utf8"));
const vscodeVsixName = `ontos-protocol-vscode-${vscodeManifest.version}.vsix`;
const expectedArchives = [
  {
    name: "ontos-viewer-1.0.0.tar.gz",
    required: ["index.html", "app.js", "app.js.map", "styles.css", ".nojekyll"]
  },
  {
    name: "ontos-docs-1.0.0.tar.gz",
    required: ["index.html", "app.js", "styles.css", "robots.txt", "sitemap.xml", ".nojekyll"]
  }
];
const expectedFiles = [
  ...expectedArchives.map((archive) => archive.name),
  vscodeVsixName
];

for (const name of expectedFiles) {
  assert.ok(existsSync(join(releaseDir, name)), `missing release artifact ${name}`);
}
assert.ok(existsSync(join(releaseDir, "SHA256SUMS")), "missing release checksum file");

const checksumText = readFileSync(join(releaseDir, "SHA256SUMS"), "utf8");
for (const name of expectedFiles) {
  const file = join(releaseDir, name);
  const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
  assert.ok(checksumText.includes(`${digest}  ${name}`), `checksum missing for ${name}`);
}

for (const archive of expectedArchives) {
  const file = join(releaseDir, archive.name);
  const temp = mkdtempSync(join(tmpdir(), "ontos-release-archive-"));
  try {
    execFileSync("tar", ["-xzf", file, "-C", temp], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    for (const required of archive.required) {
      assert.ok(existsSync(join(temp, required)), `${archive.name} is missing ${required}`);
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const vsixBytes = readFileSync(join(releaseDir, vscodeVsixName));
assert.ok(vsixBytes.subarray(0, 2).equals(Buffer.from("PK")), "VSIX should be a zip archive");

console.log("release archives ok");
