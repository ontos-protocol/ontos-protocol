import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";
import { buildVsCodeVsix } from "./build-vscode-vsix.mjs";

const version = "1.0.0";
const releaseDir = ".release";
const archives = [
  {
    name: `ontos-viewer-${version}.tar.gz`,
    cwd: "apps/viewer/dist",
    required: ["index.html", "app.js", "app.js.map", "styles.css", ".nojekyll"]
  },
  {
    name: `ontos-docs-${version}.tar.gz`,
    cwd: "website/dist",
    required: ["index.html", "app.js", "styles.css", "robots.txt", "sitemap.xml", ".nojekyll"]
  }
];

rmSync(releaseDir, { recursive: true, force: true });
mkdirSync(releaseDir, { recursive: true });

for (const archive of archives) {
  for (const required of archive.required) {
    assert.ok(existsSync(join(archive.cwd, required)), `${archive.cwd} is missing ${required}; run npm run build`);
  }
  execFileSync("tar", ["-czf", resolve(releaseDir, archive.name), "."], {
    cwd: archive.cwd,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

const vsix = buildVsCodeVsix({ updateChecksums: false });

const checksumLines = [];
for (const artifact of [...archives, vsix]) {
  const path = join(releaseDir, artifact.name);
  const digest = createHash("sha256").update(readFileSync(path)).digest("hex");
  checksumLines.push(`${digest}  ${artifact.name}`);
}
writeFileSync(join(releaseDir, "SHA256SUMS"), `${checksumLines.join("\n")}\n`, "utf8");

console.log(`release archives built in ${releaseDir}`);
