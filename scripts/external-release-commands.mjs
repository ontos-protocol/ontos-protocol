import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { dirname } from "node:path";

const args = new Set(process.argv.slice(2));
const writeIndex = process.argv.indexOf("--write");
const shouldCheck = args.has("--check");
const shouldCheckTools = args.has("--check-tools");
const shouldWrite = writeIndex !== -1;
const outputPath = shouldWrite ? process.argv[writeIndex + 1] : null;

const settings = JSON.parse(readFileSync("config/repository-settings.json", "utf8"));
const labels = parseLabels(readFileSync(".github/labels.yml", "utf8"));
const packages = settings.npmWorkspaces;

const commands = [
  section("0. Tool And Local Gate Preflight"),
  command("gh", "auth", "status"),
  command("npm", "whoami"),
  command("npm", "ci"),
  command("npm", "run", "release:check"),
  command("npm", "run", "launch:content"),
  command("npm", "run", "validate:launch-content"),
  command("git", "status", "--short"),
  section("1. Repository Creation"),
  command(
    "gh",
    "repo",
    "create",
    settings.repository,
    "--private",
    "--description",
    settings.description,
    "--homepage",
    settings.homepage
  ),
  command("git", "remote", "add", "origin", `git@github.com:${settings.repository}.git`),
  command("git", "push", "-u", "origin", settings.defaultBranch),
  section("2. Repository Metadata"),
  command(
    "gh",
    "repo",
    "edit",
    settings.repository,
    "--enable-issues=true",
    "--enable-discussions=true",
    "--enable-projects=true",
    "--enable-wiki=false",
    "--default-branch",
    settings.defaultBranch,
    "--description",
    settings.description,
    "--homepage",
    settings.homepage,
    ...settings.topics.flatMap((topic) => ["--add-topic", topic])
  ),
  section("3. Labels"),
  ...labels.map((label) => command(
    "gh",
    "label",
    "create",
    label.name,
    "--repo",
    settings.repository,
    "--color",
    label.color,
    "--description",
    label.description,
    "--force"
  )),
  section("4. Project Board"),
  command("npm", "run", "project:commands"),
  command("bash", ".release/github-project-board-commands.sh"),
  section("5. Release Tracking Issue"),
  command(
    "gh",
    "issue",
    "create",
    "--repo",
    settings.repository,
    "--title",
    "Release: .ontos Protocol 1.0.0",
    "--label",
    "release",
    "--body-file",
    "docs/RELEASE_ISSUE_1.0.0.md"
  ),
  section("6. Security Automation"),
  command("gh", "workflow", "view", "CodeQL", "--repo", settings.repository),
  command(
    "gh",
    "api",
    `repos/${settings.repository}/dependabot/alerts`,
    "--paginate",
    "--jq",
    "length"
  ),
  section("7. Branch Protection"),
  command(
    "gh",
    "api",
    "--method",
    "PUT",
    `repos/${settings.repository}/branches/${settings.defaultBranch}/protection`,
    "--input",
    ".github/branch-protection-main.json"
  ),
  section("8. Package Publishing"),
  ...packages.map((workspace) => command("npm", "publish", "--access", "public", "-w", workspace)),
  command("npm", "run", "postpublish:smoke"),
  ...packages.map((workspace) => command("npm", "view", `${workspace}@1.0.0`, "version")),
  section("8b. VS Code Extension Publishing"),
  command("npm", "run", "release:vscode-vsix"),
  command("npx", "--yes", "ovsx@1.0.0", "publish", ".release/ontos-protocol-vscode-1.0.0.vsix", "--publisher", "ontos-protocol"),
  command("npx", "--yes", "@vscode/vsce@3.9.2", "publish", "--packagePath", ".release/ontos-protocol-vscode-1.0.0.vsix"),
  section("9. Tag And GitHub Release"),
  command("git", "tag", "-a", settings.releaseTag, "-m", ".ontos Protocol 1.0.0"),
  command("git", "push", "origin", settings.releaseTag),
  command(
    "gh",
    "release",
    "create",
    settings.releaseTag,
    "--repo",
    settings.repository,
    "--title",
    ".ontos Protocol 1.0.0",
    "--notes-file",
    "docs/RELEASE_NOTES_1.0.0.md"
  ),
  command("npm", "run", "release:archives"),
  command("npm", "run", "demo:video"),
  command("npm", "run", "validate:release-archives"),
  command("npm", "run", "validate:demo-video"),
  command(
    "gh",
    "release",
    "upload",
    settings.releaseTag,
    ".release/ontos-viewer-1.0.0.tar.gz",
    ".release/ontos-docs-1.0.0.tar.gz",
    ".release/ontos-protocol-vscode-1.0.0.vsix",
    ".release/ontos-protocol-60s-demo.mp4",
    ".release/external-release-commands.sh",
    ".release/SHA256SUMS",
    "--repo",
    settings.repository
  ),
  section("10. Docs And Demo Deployment"),
  command(
    "gh",
    "workflow",
    "run",
    "deploy-docs.yml",
    "--repo",
    settings.repository,
    "--ref",
    settings.releaseTag
  ),
  command("gh", "run", "list", "--repo", settings.repository, "--workflow", "deploy-docs.yml", "--limit", "3"),
  command("curl", "-I", settings.homepage),
  section("11. Public Switch"),
  command("gh", "repo", "edit", settings.repository, "--visibility", "public"),
  section("12. Launch Verification"),
  command("gh", "repo", "view", settings.repository, "--web"),
  command("gh", "release", "view", settings.releaseTag, "--repo", settings.repository, "--web"),
  command("npm", "view", "@ontos-protocol/cli", "dist-tags"),
  command("npm", "run", "postpublish:smoke")
];

const script = [
  "#!/usr/bin/env bash",
  "set -euo pipefail",
  "",
  "# Generated external release command plan for .ontos Protocol 1.0.0.",
  "# Review each command before executing. Some commands publish packages or change repository visibility.",
  "",
  ...commands
].join("\n");

if (shouldCheckTools) {
  checkTool("gh");
  checkTool("git");
  checkTool("npm");
  checkTool("curl");
  checkTool("ffmpeg");
  checkTool("ffprobe");
  console.log("external release tools ok");
}

if (shouldCheck) {
  for (const required of [
    "gh auth status",
    "npm ci",
    "npm run release:check",
    "npm run launch:content",
    "npm run validate:launch-content",
    "git status --short",
    "gh repo create ontos-protocol/ontos-protocol",
    "gh issue create --repo ontos-protocol/ontos-protocol",
    "gh label create bug --repo ontos-protocol/ontos-protocol",
    "npm run project:commands",
    "bash .release/github-project-board-commands.sh",
    "gh workflow view CodeQL --repo ontos-protocol/ontos-protocol",
    "gh api repos/ontos-protocol/ontos-protocol/dependabot/alerts",
    "gh api --method PUT repos/ontos-protocol/ontos-protocol/branches/main/protection",
    "npm publish --access public -w @ontos-protocol/schema",
    "npm publish --access public -w @ontos-protocol/parser",
    "npm publish --access public -w @ontos-protocol/viewer",
    "npm publish --access public -w @ontos-protocol/cli",
    "npm run release:vscode-vsix",
    "ovsx@1.0.0 publish .release/ontos-protocol-vscode-1.0.0.vsix",
    "@vscode/vsce@3.9.2 publish --packagePath .release/ontos-protocol-vscode-1.0.0.vsix",
    "npm run demo:video",
    "npm run validate:demo-video",
    "gh release upload v1.0.0",
    ".release/external-release-commands.sh",
    "gh workflow run deploy-docs.yml",
    "gh repo edit ontos-protocol/ontos-protocol --visibility public"
  ]) {
    assert.ok(script.includes(required), `external release commands missing ${required}`);
  }
  for (const invalid of [
    "'gh auth status'",
    "'npm ci'",
    "'npm run release:check'",
    "'git status --short'"
  ]) {
    assert.equal(script.includes(invalid), false, `external release commands include invalid shell line ${invalid}`);
  }
  assert.equal(labels.length >= 10, true, "expected release labels to be generated");
  console.log("external release commands ok");
}

if (shouldWrite) {
  assert.ok(outputPath, "--write requires an output path");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${script}\n`, "utf8");
  console.log(`external release commands written to ${outputPath}`);
} else if (!shouldCheck && !shouldCheckTools) {
  console.log(script);
}

function command(...parts) {
  return `${parts.map(quoteShell).join(" ")}\n`;
}

function section(title) {
  return `\n# ${title}`;
}

function quoteShell(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@+-]+$/u.test(text)) {
    return text;
  }
  return `'${text.replaceAll("'", "'\\''")}'`;
}

function parseLabels(source) {
  const parsed = [];
  let current;
  for (const line of source.split(/\r?\n/u)) {
    const name = line.match(/^- name: (.+)$/u)?.[1];
    if (name) {
      current = { name, color: "", description: "" };
      parsed.push(current);
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
  for (const label of parsed) {
    assert.ok(label.name.length > 0, "label is missing name");
    assert.match(label.color, /^[0-9a-f]{6}$/iu, `label ${label.name} missing color`);
    assert.ok(label.description.length > 0, `label ${label.name} missing description`);
  }
  return parsed;
}

function checkTool(tool) {
  try {
    execFileSync("sh", ["-lc", `command -v ${tool}`], { stdio: "ignore" });
  } catch {
    throw new Error(`required release tool is not available: ${tool}`);
  }
}
