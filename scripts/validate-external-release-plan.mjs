import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const settings = JSON.parse(readFileSync("config/repository-settings.json", "utf8"));
const branchProtection = JSON.parse(readFileSync(".github/branch-protection-main.json", "utf8"));
const labels = parseLabels(readFileSync(".github/labels.yml", "utf8"));
const projectBoard = JSON.parse(readFileSync("config/github-project-board.json", "utf8"));
const plan = readFileSync("docs/EXTERNAL_RELEASE_PLAN_1.0.0.md", "utf8");
const repoSetup = readFileSync("docs/REPOSITORY_SETUP.md", "utf8");
const npmPublishing = readFileSync("docs/NPM_PUBLISHING.md", "utf8");
const launchRunbook = readFileSync("docs/LAUNCH_RUNBOOK.md", "utf8");
const deployWorkflow = readFileSync(settings.docsWorkflow, "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

assert.equal(settings.repository, "ontos-protocol/ontos-protocol");
assert.equal(settings.name, "ontos-protocol");
assert.equal(settings.defaultBranch, "main");
assert.equal(settings.releaseTag, "v1.0.0");
assert.equal(settings.npmWorkspaces.length, 4);

for (const topic of [
  "ai",
  "protocol",
  "text-format",
  "developer-tools",
  "plain-text",
  "structured-text",
  "cli"
]) {
  assert.ok(settings.topics.includes(topic), `repository settings missing topic ${topic}`);
  assert.ok(plan.includes(`--add-topic ${topic}`), `external release plan missing topic command ${topic}`);
  assert.ok(repoSetup.includes(topic), `repository setup docs missing topic ${topic}`);
}

for (const label of [
  "bug",
  "documentation",
  "enhancement",
  "compatibility",
  "conformance",
  "security",
  "dependencies",
  "rfc",
  "good first issue",
  "help wanted",
  "release"
]) {
  assert.ok(labels.has(label), `labels config missing ${label}`);
  assert.ok(plan.includes(`gh label create "${label}"`), `external release plan missing label command ${label}`);
}

for (const check of settings.requiredStatusChecks) {
  assert.ok(
    branchProtection.required_status_checks.contexts.includes(check),
    `branch protection missing status check ${check}`
  );
}
assert.equal(branchProtection.required_pull_request_reviews.required_approving_review_count, 1);
assert.equal(branchProtection.allow_force_pushes, false);
assert.equal(branchProtection.allow_deletions, false);
assert.equal(branchProtection.required_conversation_resolution, true);

for (const workspace of settings.npmWorkspaces) {
  assert.ok(plan.includes(`npm publish --access public -w ${workspace}`), `plan missing publish command for ${workspace}`);
  assert.ok(npmPublishing.includes(workspace), `npm publishing runbook missing ${workspace}`);
}

for (const required of [
  "npm run release:check",
  "npm run release:commands",
  "npm run release:verify-commands",
  "npm run project:commands",
  "npm run launch:content",
  "npm run release:vscode-vsix",
  "npm run validate:external-commands",
  "npm run validate:release-verify-commands",
  "npm run validate:project-commands",
  "npm run validate:launch-content",
  ".release/external-release-commands.sh",
  ".release/external-release-verification.sh",
  ".release/github-project-board-commands.sh",
  ".release/ontos-protocol-vscode-1.0.0.vsix",
  ".release/launch-content-pack/",
  "gh repo create ontos-protocol/ontos-protocol",
  "bash .release/github-project-board-commands.sh",
  "gh api --method PUT repos/ontos-protocol/ontos-protocol/branches/main/protection",
  "gh release create v1.0.0",
  "npm run demo:video",
  "npm run validate:demo-video",
  "npx --yes ovsx@1.0.0 publish .release/ontos-protocol-vscode-1.0.0.vsix",
  "npx --yes @vscode/vsce@3.9.2 publish --packagePath .release/ontos-protocol-vscode-1.0.0.vsix",
  ".release/ontos-protocol-60s-demo.mp4",
  "gh workflow run deploy-docs.yml",
  "gh repo edit ontos-protocol/ontos-protocol --visibility public"
]) {
  assert.ok(plan.includes(required), `external release plan missing ${required}`);
}

assert.equal(packageJson.scripts["release:commands"], "node scripts/external-release-commands.mjs --write .release/external-release-commands.sh");
assert.equal(packageJson.scripts["release:verify-commands"], "node scripts/external-release-verification.mjs --write .release/external-release-verification.sh");
assert.equal(packageJson.scripts["project:commands"], "node scripts/github-project-board-commands.mjs --write .release/github-project-board-commands.sh");
assert.equal(packageJson.scripts["launch:content"], "node scripts/launch-content-pack.mjs --write .release/launch-content-pack");
assert.equal(packageJson.scripts["validate:external-commands"], "node scripts/external-release-commands.mjs --check");
assert.equal(packageJson.scripts["validate:release-verify-commands"], "node scripts/external-release-verification.mjs --check");
assert.equal(packageJson.scripts["validate:project-commands"], "node scripts/github-project-board-commands.mjs --check");
assert.equal(packageJson.scripts["validate:launch-content"], "node scripts/launch-content-pack.mjs --check");

assert.equal(projectBoard.title, ".ontos Protocol 1.0 Launch");
assert.ok(projectBoard.statusField.options.includes("Blocked"), "project board missing Blocked status");
assert.ok(projectBoard.areaField.options.includes("Launch response"), "project board missing Launch response area");

for (const required of [
  "workflow_dispatch",
  "tags:",
  "npm run release:check",
  "actions/deploy-pages@v4"
]) {
  assert.ok(deployWorkflow.includes(required), `docs workflow missing ${required}`);
}

for (const required of [
  "release owner",
  "publish npm packages",
  "deploy docs site",
  "launch-week triage"
]) {
  assert.ok(launchRunbook.toLowerCase().includes(required), `launch runbook missing ${required}`);
}

console.log("external release plan ok");

function parseLabels(source) {
  const labels = new Map();
  let current;
  for (const line of source.split(/\r?\n/u)) {
    const name = line.match(/^- name: (.+)$/u)?.[1];
    if (name) {
      current = { name, color: "", description: "" };
      labels.set(name, current);
      continue;
    }
    if (!current) {
      continue;
    }
    const color = line.match(/^  color: ([0-9a-f]{6})$/iu)?.[1];
    if (color) {
      current.color = color;
    }
    const description = line.match(/^  description: (.+)$/u)?.[1];
    if (description) {
      current.description = description;
    }
  }
  for (const label of labels.values()) {
    assert.match(label.color, /^[0-9a-f]{6}$/iu, `label ${label.name} needs a color`);
    assert.ok(label.description.length > 0, `label ${label.name} needs a description`);
  }
  return labels;
}
