import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const requiredFiles = [
  "docs/RELEASE_ISSUE_1.0.0.md",
  "docs/POST_LAUNCH_MONITORING.md",
  "docs/DEMO_VIDEO_60S.md",
  "scripts/post-publish-smoke.mjs",
  "docs/LAUNCH_RUNBOOK.md",
  "docs/NPM_PUBLISHING.md",
  "docs/LAUNCH_CONTENT.md",
  "docs/EXTERNAL_RELEASE_PLAN_1.0.0.md",
  "scripts/launch-content-pack.mjs"
];

for (const file of requiredFiles) {
  assert.ok(readFileSync(file, "utf8").length > 0, `${file} must not be empty`);
}

const releaseIssue = readFileSync("docs/RELEASE_ISSUE_1.0.0.md", "utf8");
for (const required of [
  "Release owner",
  "npm publishing owner",
  "GitHub repository administrator",
  "Website deployment owner",
  "Launch-week triage owner",
  "npm run release:check",
  "npm run launch:content",
  "npm run validate:launch-content",
  "npm run postpublish:smoke",
  "Make repository public",
  "First 24-hour monitoring record"
]) {
  assert.ok(releaseIssue.includes(required), `release issue template missing ${required}`);
}

const monitoring = readFileSync("docs/POST_LAUNCH_MONITORING.md", "utf8");
for (const required of [
  "GitHub issues",
  "GitHub discussions",
  "npm install reports",
  "docs site availability",
  "viewer demo availability",
  "External Release Verification",
  ".release/external-release-verification.sh",
  "npm run release:verify-commands",
  "npm run validate:release-verify-commands",
  "Triage Order",
  "Known Issues Template",
  "First Week",
  "First Month"
]) {
  assert.ok(monitoring.includes(required), `post-launch monitoring doc missing ${required}`);
}

const demo = readFileSync("docs/DEMO_VIDEO_60S.md", "utf8");
for (const required of [
  "0-5s",
  "15-25s",
  "38-50s",
  "npm install -g @ontos-protocol/cli",
  ".release/ontos-protocol-60s-demo.mp4",
  "npm run demo:video",
  "npm run validate:demo-video",
  "silent captioned MP4",
  "Avoid unrelated product names or private project context"
]) {
  assert.ok(demo.includes(required), `demo video script missing ${required}`);
}

const postPublish = readFileSync("scripts/post-publish-smoke.mjs", "utf8");
for (const required of [
  "\"npm\"",
  "\"view\"",
  "\"install\"",
  "npx",
  "ontosfmt",
  "post-publish smoke ok"
]) {
  assert.ok(postPublish.includes(required), `post-publish smoke script missing ${required}`);
}

const launchRunbook = readFileSync("docs/LAUNCH_RUNBOOK.md", "utf8");
for (const required of [
  "docs/RELEASE_ISSUE_1.0.0.md",
  "docs/POST_LAUNCH_MONITORING.md",
  "docs/DEMO_VIDEO_60S.md",
  ".release/ontos-protocol-60s-demo.mp4",
  ".release/external-release-commands.sh",
  ".release/external-release-verification.sh",
  ".release/launch-content-pack/",
  "npm run release:commands",
  "npm run launch:content",
  "npm run postpublish:smoke"
]) {
  assert.ok(launchRunbook.includes(required), `launch runbook missing ${required}`);
}

console.log("launch operations materials ok");
