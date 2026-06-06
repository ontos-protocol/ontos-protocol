import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const finalGate = process.argv.includes("--final");
const packetPath = process.env.ONTOS_RELEASE_APPROVAL_PACKET ?? "docs/RELEASE_APPROVAL_PACKET_1.0.0.md";
const packet = readFileSync(packetPath, "utf8");
const taskList = readFileSync("docs/TASKS.md", "utf8");
const governance = readFileSync("docs/RELEASE_GOVERNANCE.md", "utf8");
const releaseIssue = readFileSync("docs/RELEASE_ISSUE_1.0.0.md", "utf8");

for (const required of [
  "Release owner",
  "Protocol specification owner",
  "Parser and CLI owner",
  "Viewer owner",
  "Documentation owner",
  "Release operations owner",
  "Security contact owner",
  "npm publishing owner",
  "GitHub repository administrator",
  "Website deployment owner",
  "Launch-week triage owner"
]) {
  assert.ok(packet.includes(required), `approval packet missing owner field ${required}`);
  assert.ok(releaseIssue.includes(required.replace("Security contact owner", "Security contact")), `release issue missing corresponding field ${required}`);
}

for (const required of [
  "Release freeze date",
  "Documentation freeze date",
  "Public launch date"
]) {
  assert.ok(packet.includes(required), `approval packet missing date field ${required}`);
}

for (const required of [
  "npm run release:check",
  "Public-boundary scan",
  "Security scan",
  "License scan",
  "Package publish dry run",
  "Release archives",
  "External release command pack",
  "External release verification command pack",
  "GitHub project board command pack",
  "Launch content pack",
  "VS Code and Cursor manual UX checklist",
  "Release notes approved",
  "Launch content approved",
  "Maintainers ready for launch response"
]) {
  assert.ok(packet.includes(required), `approval packet missing gate ${required}`);
}

for (const required of [
  "GitHub repository URL",
  "Branch protection confirmation",
  "npm package URLs",
  "Git tag URL",
  "GitHub release URL",
  "Documentation site URL",
  "Hosted viewer demo URL",
  "Visual Studio Marketplace extension URL",
  "Launch article URL",
  "Post-publish smoke output",
  "External command pack URL",
  "GitHub project board URL",
  "External verification output",
  "First 24-hour monitoring record"
]) {
  assert.ok(packet.includes(required), `approval packet missing external evidence ${required}`);
}

for (const required of [
  "VS Code version",
  "Cursor version",
  "Extension artifact",
  "Manual UX checklist URL or issue comment",
  "Release owner signature",
  "Approval date"
]) {
  assert.ok(packet.includes(required), `approval packet missing manual UX evidence ${required}`);
}

for (const required of [
  "Release approval requires",
  "release notes approved",
  "launch content approved",
  "clean install smoke test"
]) {
  assert.ok(governance.includes(required), `release governance missing ${required}`);
}

for (const required of [
  "Prepare release approval packet",
  "Release notes approved",
  "Launch content approved",
  "Maintainers ready for launch response"
]) {
  assert.ok(taskList.includes(required), `task list missing approval reference ${required}`);
}

if (finalGate) {
  validateFinalPacket(packet);
}

console.log(finalGate ? "release approval final gate ok" : "release approval packet ok");

function validateFinalPacket(text) {
  for (const field of [
    "Release owner",
    "Protocol specification owner",
    "Parser and CLI owner",
    "Viewer owner",
    "Documentation owner",
    "Release operations owner",
    "Security contact owner",
    "npm publishing owner",
    "GitHub repository administrator",
    "Website deployment owner",
    "Launch-week triage owner",
    "Release freeze date",
    "Documentation freeze date",
    "Public launch date",
    "GitHub repository URL",
    "Branch protection confirmation",
    "npm package URLs",
    "Git tag URL",
    "GitHub release URL",
    "Documentation site URL",
    "Hosted viewer demo URL",
    "Visual Studio Marketplace extension URL",
    "Launch article URL",
    "GitHub project board URL",
    "External verification output",
    "Post-publish smoke output",
    "First 24-hour monitoring record",
    "VS Code version",
    "Cursor version",
    "Extension artifact",
    "Manual UX checklist URL or issue comment",
    "Release owner signature",
    "Approval date"
  ]) {
    requireCheckedValue(text, field);
  }

  for (const item of [
    "`npm run release:check` passed on the release commit.",
    "Public-boundary scan has zero findings.",
    "Security scan has zero findings.",
    "License scan passed.",
    "Package publish dry run passed.",
    "Release archives and `SHA256SUMS` were generated.",
    "External release command pack was generated and reviewed.",
    "External release verification command pack was generated and reviewed.",
    "GitHub project board command pack was generated and reviewed.",
    "Launch content pack was generated and reviewed.",
    "VS Code and Cursor manual UX checklist completed from `docs/VSCODE_EXTENSION_MANUAL_UX_CHECKLIST.md`.",
    "Release notes approved.",
    "Launch content approved.",
    "Maintainers ready for launch response."
  ]) {
    requireCheckedItem(text, item);
  }
}

function requireCheckedValue(text, label) {
  const match = text.match(new RegExp(`^- \\[[xX]\\] ${escapeRegex(label)}:\\s*(.+)$`, "mu"));
  assert.ok(match, `final approval missing checked value for ${label}`);
  assert.ok(!/^(TBD|N\/A|none|null|-|\[.*\])$/iu.test(match[1].trim()), `final approval has placeholder value for ${label}`);
}

function requireCheckedItem(text, label) {
  assert.ok(
    new RegExp(`^- \\[[xX]\\] ${escapeRegex(label)}(?:\\s+.+)?$`, "mu").test(text),
    `final approval missing checked gate ${label}`
  );
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}
