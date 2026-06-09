import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import { join } from "node:path";

const requiredSourcePaths = [
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "docs/RELEASE_NOTES_1.0.0.md",
  "docs/RELEASE_ARTIFACTS_1.0.0.md",
  "docs/RUNTIME_TARGETS.md",
  "spec/ontos-format-1.0.md",
  "spec/ontos-ast-schema-1.0.json",
  "spec/conformance/README.md",
  "examples/project-state.ontos",
  "packages/parser/package.json",
  "packages/schema/package.json",
  "packages/cli/package.json",
  "packages/viewer/package.json",
  "apps/viewer/package.json",
  "extensions/vscode/package.json",
  "extensions/obsidian/manifest.json",
  "website/README.md",
  "scripts/external-release-commands.mjs",
  "scripts/external-release-verification.mjs",
  "scripts/build-vscode-vsix.mjs",
  "scripts/github-project-board-commands.mjs",
  "scripts/community-starter-commands.mjs",
  "scripts/launch-content-pack.mjs",
  "docs/VSCODE_PUBLISHING.md",
  "config/github-project-board.json",
  ".github/workflows/ci.yml"
];

const requiredBuildPaths = [
  "website/dist/index.html",
  "apps/viewer/dist/index.html",
  "apps/viewer/dist/app.js",
  "apps/viewer/dist/app.js.map",
  "extensions/vscode/dist/extension.js",
  "extensions/vscode/dist/extension.js.map",
  "extensions/obsidian/dist/main.js",
  "extensions/obsidian/dist/main.js.map",
  "extensions/obsidian/dist/manifest.json"
];

const vscodeManifest = JSON.parse(readFileSync("extensions/vscode/package.json", "utf8"));
const vscodeVsixPath = `.release/ontos-protocol-vscode-${vscodeManifest.version}.vsix`;

const requiredReleasePaths = [
  ".release/external-release-commands.sh",
  ".release/external-release-verification.sh",
  ".release/github-project-board-commands.sh",
  ".release/community-starter-issues.sh",
  vscodeVsixPath,
  ".release/launch-content-pack/README.md",
  ".release/launch-content-pack/launch-article.md",
  ".release/launch-content-pack/x-thread.md",
  ".release/launch-content-pack/hacker-news.md",
  ".release/launch-content-pack/product-hunt.md",
  ".release/launch-content-pack/reddit.md",
  ".release/launch-content-pack/linkedin.md",
  ".release/launch-content-pack/metadata.json"
];

const forbiddenSourcePatterns = [
  /(^|\/)node_modules\//u,
  /(^|\/)dist\//u,
  /(^|\/)\.env(?:\.|$)/u,
  /(^|\/)\.DS_Store$/u,
  /\.pem$/u,
  /\.key$/u,
  /\.tgz$/u,
  /\.vsix$/u,
  /extensions\/obsidian\/vault\/\.obsidian\/plugins\//u
];

for (const path of requiredSourcePaths) {
  assert.ok(existsSync(path), `missing required source artifact: ${path}`);
}

for (const path of requiredBuildPaths) {
  assert.ok(existsSync(path), `missing required build artifact: ${path}; run npm run build first`);
}

for (const path of requiredReleasePaths) {
  assert.ok(existsSync(path), `missing required generated release artifact: ${path}; run npm run release:commands first`);
}

const sourceFiles = collectSourceFiles(".");
for (const file of sourceFiles) {
  for (const pattern of forbiddenSourcePatterns) {
    assert.equal(pattern.test(file), false, `source archive candidate contains forbidden file: ${file}`);
  }
}

const releaseNotes = readFileSync("docs/RELEASE_NOTES_1.0.0.md", "utf8");
for (const token of [
  "docs/COMPATIBILITY_POLICY.md",
  "docs/RUNTIME_TARGETS.md",
  "spec/ontos-format-1.0.md",
  "examples/",
  "apps/viewer/"
]) {
  assert.ok(releaseNotes.includes(token), `release notes should link ${token}`);
}

const releaseArtifacts = readFileSync("docs/RELEASE_ARTIFACTS_1.0.0.md", "utf8");
for (const token of [
  "Source Archive",
  "Build Artifacts",
  "Launch Media",
  "External Command Pack",
  "External Verification Command Pack",
  "GitHub Project Board Command Pack",
  "Community Issue Command Pack",
  "Launch Content Pack",
  "VS Code Extension VSIX",
  "Checksums",
  "Release Links",
  ".release/ontos-protocol-vscode-1.0.0.vsix",
  ".release/ontos-protocol-60s-demo.mp4",
  ".release/external-release-commands.sh",
  ".release/external-release-verification.sh",
  ".release/github-project-board-commands.sh",
  ".release/community-starter-issues.sh",
  ".release/launch-content-pack/",
  "apps/viewer/dist/"
]) {
  assert.ok(releaseArtifacts.includes(token), `release artifact guide should include ${token}`);
}

const externalCommands = readFileSync(".release/external-release-commands.sh", "utf8");
for (const token of [
  "gh repo create ontos-protocol/ontos-protocol",
  "npm run launch:content",
  "npm run validate:launch-content",
  "npm publish --access public -w @ontos-protocol/cli",
  "npm run release:vscode-vsix",
  `ovsx@1.0.0 publish ${vscodeVsixPath}`,
  `@vscode/vsce@3.9.2 publish --packagePath ${vscodeVsixPath}`,
  "gh release upload v1.0.0",
  vscodeVsixPath,
  "bash .release/github-project-board-commands.sh",
  "gh repo edit ontos-protocol/ontos-protocol --visibility public"
]) {
  assert.ok(externalCommands.includes(token), `external command pack should include ${token}`);
}

const communityCommands = readFileSync(".release/community-starter-issues.sh", "utf8");
assert.equal((communityCommands.match(/gh issue create --repo ontos-protocol\/ontos-protocol/gu) ?? []).length, 9);
assert.equal((communityCommands.match(/--label 'good first issue'/gu) ?? []).length, 4);
assert.equal((communityCommands.match(/--label 'help wanted'/gu) ?? []).length, 5);

const launchContentMetadata = JSON.parse(readFileSync(".release/launch-content-pack/metadata.json", "utf8"));
assert.equal(launchContentMetadata.project, ".ontos Protocol");
assert.equal(launchContentMetadata.cli, "ontosfmt");
assert.equal(launchContentMetadata.packageScope, "@ontos-protocol");
assert.ok(launchContentMetadata.generatedFiles.includes("launch-article.md"));
assert.ok(launchContentMetadata.generatedFiles.includes("hacker-news.md"));
assert.ok(readFileSync(".release/launch-content-pack/submission-checklist.md", "utf8").includes("Record each published URL"));

const verificationCommands = readFileSync(".release/external-release-verification.sh", "utf8");
for (const token of [
  "gh repo view ontos-protocol/ontos-protocol --json",
  "gh release view v1.0.0 --repo ontos-protocol/ontos-protocol",
  "gh project list --owner ontos-protocol --format json",
  "npm run postpublish:smoke",
  "curl -fsSI https://ontos-protocol.github.io/ontos-protocol/",
  "gh issue list --repo ontos-protocol/ontos-protocol --label 'good first issue'",
  "public-boundary rg command should exit 1 with no output"
]) {
  assert.ok(verificationCommands.includes(token), `external verification command pack should include ${token}`);
}

const projectCommands = readFileSync(".release/github-project-board-commands.sh", "utf8");
for (const token of [
  "gh project list --owner ontos-protocol --limit 1 >/dev/null",
  "gh project create --owner ontos-protocol --title '.ontos Protocol 1.0 Launch'",
  "gh project field-create $PROJECT_NUMBER --owner ontos-protocol --name 'Launch Status'",
  "Backlog,Ready,In progress,In review,Blocked,Done",
  "gh project item-create $PROJECT_NUMBER --owner ontos-protocol"
]) {
  assert.ok(projectCommands.includes(token), `project board command pack should include ${token}`);
}

const buildDigests = requiredBuildPaths.map((path) => ({
  path,
  sha256: sha256(readFileSync(path))
}));
assert.equal(buildDigests.length, requiredBuildPaths.length);

console.log(`release artifact validation ok sourceFiles=${sourceFiles.length} buildArtifacts=${buildDigests.length}`);

function collectSourceFiles(root) {
  const files = [];
  walk(root);
  return files.sort();

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      if (shouldSkipEntry(dir, entry)) {
        continue;
      }
      const path = join(dir, entry);
      const relative = path.replace(/^\.\//u, "");
      const stat = statSync(path);
      if (stat.isDirectory()) {
        walk(path);
      } else if (stat.isFile()) {
        files.push(relative);
      }
    }
  }
}

function shouldSkipEntry(dir, entry) {
  if (entry === ".git" || entry === ".release" || entry === "node_modules" || entry === "coverage" || entry === "dist" || entry === ".DS_Store") {
    return true;
  }
  const relative = join(dir, entry).replace(/^\.\//u, "");
  return relative === "extensions/obsidian/vault/.obsidian";
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
