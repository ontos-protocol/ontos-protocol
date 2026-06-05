import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = {
  starter: "docs/COMMUNITY_STARTER_ISSUES.md",
  adoption: "docs/ADOPTION_EXAMPLES.md",
  conformance: "docs/CONFORMANCE_IMPLEMENTATION_GUIDE.md",
  patch: "docs/PATCH_RELEASE_PLAYBOOK.md",
  contributing: "CONTRIBUTING.md",
  roadmap: "docs/ROADMAP.md",
  tasks: "docs/TASKS.md",
  releaseArtifacts: "docs/RELEASE_ARTIFACTS_1.0.0.md",
  launchRunbook: "docs/LAUNCH_RUNBOOK.md",
  packageJson: "package.json"
};

const content = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(path, "utf8")])
);

for (const label of [
  "good first issue",
  "help wanted",
  "documentation",
  "conformance",
  "compatibility",
  "rfc"
]) {
  assert.ok(content.starter.includes(label), `starter issues missing label ${label}`);
}

for (const required of [
  "npm run community:commands",
  "npm run validate:community-commands",
  ".release/community-starter-issues.sh"
]) {
  assert.ok(content.starter.includes(required), `starter issues doc missing ${required}`);
  assert.ok(content.releaseArtifacts.includes(required), `release artifacts missing ${required}`);
}

assert.ok(content.launchRunbook.includes(".release/community-starter-issues.sh"), "launch runbook missing community starter command pack");
assert.ok(content.packageJson.includes("\"community:commands\""), "package scripts missing community:commands");
assert.ok(content.packageJson.includes("\"validate:community-commands\""), "package scripts missing validate:community-commands");

for (const example of [
  "examples/project-state.ontos",
  "examples/ai-handoff.ontos",
  "examples/review-pack.ontos",
  "examples/product-spec.ontos",
  "examples/bug-fix.ontos",
  "examples/team-knowledge.ontos"
]) {
  assert.ok(content.adoption.includes(example), `adoption examples missing ${example}`);
}

for (const required of [
  "spec/conformance/valid/",
  "spec/conformance/invalid/",
  "spec/ontos-ast-schema-1.0.json",
  "spec/conformance/valid/ordering.ontos",
  "Compatibility Report Template"
]) {
  assert.ok(content.conformance.includes(required), `conformance guide missing ${required}`);
}

for (const required of [
  "Patch Scope",
  "Not allowed without RFC review",
  "npm run release:check",
  "postpublish:smoke",
  "1.0.x"
]) {
  assert.ok(content.patch.includes(required), `patch playbook missing ${required}`);
}

for (const required of [
  "Good First Contributions",
  "Larger Contributions",
  "npm run release:check"
]) {
  assert.ok(content.contributing.includes(required), `contributing guide missing ${required}`);
}

for (const required of [
  "1.x Maintenance",
  "Requires RFC"
]) {
  assert.ok(content.roadmap.includes(required), `roadmap missing ${required}`);
}

for (const required of [
  "Prepare community starter issue seeds",
  "Prepare community starter issue command pack",
  "Prepare adoption examples",
  "Prepare conformance guidance",
  "Prepare patch release playbook"
]) {
  assert.ok(content.tasks.includes(required), `task list missing ${required}`);
}

console.log("community readiness ok");
