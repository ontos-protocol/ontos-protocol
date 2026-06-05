import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dependabot = readFileSync(".github/dependabot.yml", "utf8");
const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const codeql = readFileSync(".github/workflows/codeql.yml", "utf8");
const labels = readFileSync(".github/labels.yml", "utf8");
const dependencyPolicy = readFileSync("docs/DEPENDENCY_POLICY.md", "utf8");
const security = readFileSync("SECURITY.md", "utf8");
const repoSetup = readFileSync("docs/REPOSITORY_SETUP.md", "utf8");

for (const required of [
  "version: 2",
  "package-ecosystem: npm",
  "package-ecosystem: github-actions",
  "interval: weekly",
  "timezone: Asia/Shanghai",
  "- dependencies"
]) {
  assert.ok(dependabot.includes(required), `dependabot config missing ${required}`);
}

for (const required of [
  "Install system dependencies",
  "apt-get install -y ffmpeg"
]) {
  assert.ok(ci.includes(required), `CI workflow missing ${required}`);
}

for (const required of [
  "name: CodeQL",
  "pull_request:",
  "workflow_dispatch:",
  "branches:",
  "- main",
  "github.event.repository.private == false",
  "actions: read",
  "security-events: write",
  "contents: read",
  "github/codeql-action/init@v3",
  "languages: javascript-typescript",
  "github/codeql-action/analyze@v3"
]) {
  assert.ok(codeql.includes(required), `CodeQL workflow missing ${required}`);
}

assert.ok(labels.includes("name: dependencies"), "labels config missing dependencies label");

for (const required of [
  "Dependabot",
  "CodeQL",
  "dependency audit in CI",
  "lockfile review"
]) {
  assert.ok(dependencyPolicy.includes(required), `dependency policy missing ${required}`);
}

for (const required of [
  "CodeQL",
  "Dependabot",
  "private vulnerability reports"
]) {
  assert.ok(security.includes(required), `security policy missing ${required}`);
}

for (const required of [
  ".github/dependabot.yml",
  ".github/workflows/codeql.yml",
  "dependencies"
]) {
  assert.ok(repoSetup.includes(required), `repository setup missing ${required}`);
}

console.log("security automation ok");
