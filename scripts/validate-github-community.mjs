import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const settings = JSON.parse(read("config/repository-settings.json"));
const labels = read(".github/labels.yml");

const requiredLabels = [
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
];

for (const label of requiredLabels) {
  assert.match(labels, new RegExp(`name: ${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), `missing label ${label}`);
}

const discussionTemplateByCategory = {
  Announcements: ".github/DISCUSSION_TEMPLATE/announcements.yml",
  General: ".github/DISCUSSION_TEMPLATE/general.yml",
  Ideas: ".github/DISCUSSION_TEMPLATE/ideas.yml",
  "Q&A": ".github/DISCUSSION_TEMPLATE/q-a.yml",
  "Show and tell": ".github/DISCUSSION_TEMPLATE/show-and-tell.yml",
  "RFC discussion": ".github/DISCUSSION_TEMPLATE/rfc-discussion.yml"
};

for (const category of settings.discussionCategories) {
  const file = discussionTemplateByCategory[category];
  assert.ok(file, `no discussion template mapping for ${category}`);
  const body = read(file);
  assert.ok(body.includes("body:"), `${file} missing body`);
  assert.match(body, /- type: (input|textarea|dropdown|checkboxes)/, `${file} needs a non-markdown field`);
  assert.ok(body.includes("title:"), `${file} missing title`);
}

const releaseIssue = read(".github/ISSUE_TEMPLATE/release.yml");
for (const required of [
  "Release tracking issue",
  "Release owner",
  "Protocol specification owner",
  "Parser and CLI owner",
  "Viewer owner",
  "Documentation owner",
  "Release operations owner",
  "Security contact",
  "npm publishing owner",
  "GitHub repository administrator",
  "Website deployment owner",
  "Launch-week triage owner",
  "npm run release:check",
  "postpublish:smoke",
  "Documentation site is live",
  "Hosted viewer demo is live",
  "First 24-hour monitoring record"
]) {
  assert.ok(releaseIssue.includes(required), `release issue form missing ${required}`);
}

const issueConfig = read(".github/ISSUE_TEMPLATE/config.yml");
assert.ok(issueConfig.includes("blank_issues_enabled: false"), "blank issues should be disabled for launch");
assert.ok(issueConfig.includes("Security report"), "issue config missing security contact link");
assert.ok(issueConfig.includes("/discussions/categories/q-a"), "issue config missing Q&A discussion link");

const repositorySetup = read("docs/REPOSITORY_SETUP.md");
for (const required of [
  ".github/DISCUSSION_TEMPLATE/announcements.yml",
  ".github/DISCUSSION_TEMPLATE/q-a.yml",
  ".github/ISSUE_TEMPLATE/release.yml",
  "docs/RELEASE_OWNER_ASSIGNMENT.md"
]) {
  assert.ok(repositorySetup.includes(required), `repository setup missing ${required}`);
}

const ownerAssignment = read("docs/RELEASE_OWNER_ASSIGNMENT.md");
for (const required of [
  "Release Owner Assignment",
  "GitHub repository administrator",
  "Launch-week triage owner",
  "Access Checklist",
  "Launch Rota",
  "Copy Into Release Issue"
]) {
  assert.ok(ownerAssignment.includes(required), `owner assignment missing ${required}`);
}

console.log("github community templates ok");
