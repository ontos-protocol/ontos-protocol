import assert from "node:assert/strict";
import {
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { dirname } from "node:path";

const args = new Set(process.argv.slice(2));
const writeIndex = process.argv.indexOf("--write");
const shouldCheck = args.has("--check");
const shouldWrite = writeIndex !== -1;
const outputPath = shouldWrite ? process.argv[writeIndex + 1] : null;

const settings = JSON.parse(readFileSync("config/repository-settings.json", "utf8"));
const packages = settings.npmWorkspaces;

const commands = [
  section("1. Repository Visibility And Metadata"),
  command(
    "gh",
    "repo",
    "view",
    settings.repository,
    "--json",
    "nameWithOwner,visibility,description,homepageUrl,repositoryTopics,defaultBranchRef"
  ),
  command(
    "gh",
    "api",
    `repos/${settings.repository}/branches/${settings.defaultBranch}/protection`,
    "--jq",
    ".required_status_checks.contexts"
  ),
  section("2. GitHub Release And Assets"),
  command("gh", "release", "view", settings.releaseTag, "--repo", settings.repository, "--json", "tagName,name,isDraft,isPrerelease,url"),
  command("gh", "release", "view", settings.releaseTag, "--repo", settings.repository, "--json", "assets", "--jq", ".assets[].name"),
  command("gh", "release", "download", settings.releaseTag, "--repo", settings.repository, "--pattern", "SHA256SUMS", "--dir", ".release/verify-download"),
  command("test", "-s", ".release/verify-download/SHA256SUMS"),
  section("3. GitHub Project Board"),
  command(
    "gh",
    "project",
    "list",
    "--owner",
    "ontos-protocol",
    "--format",
    "json",
    "--jq",
    ".projects[] | select(.title == \".ontos Protocol 1.0 Launch\") | .title"
  ),
  section("4. npm Packages"),
  ...packages.flatMap((workspace) => [
    command("npm", "view", `${workspace}@1.0.0`, "version"),
    command("npm", "view", workspace, "dist-tags.latest")
  ]),
  command("npm", "run", "postpublish:smoke"),
  section("5. Documentation And Demo"),
  command("curl", "-fsSI", settings.homepage),
  command("curl", "-fsS", `${settings.homepage}sitemap.xml`, "-o", ".release/verify-sitemap.xml"),
  command("grep", "-q", settings.homepage, ".release/verify-sitemap.xml"),
  command("curl", "-fsS", `${settings.homepage}examples/project-state.ontos`, "-o", ".release/verify-project-state.ontos"),
  command("grep", "-q", "@ontos 1.0", ".release/verify-project-state.ontos"),
  section("5b. Extension Distribution"),
  command("npm", "run", "verify:extension-marketplaces"),
  section("6. Community Entry Points"),
  command("gh", "issue", "list", "--repo", settings.repository, "--label", "good first issue", "--limit", "20"),
  command("gh", "issue", "list", "--repo", settings.repository, "--label", "help wanted", "--limit", "20"),
  command(
    "gh",
    "api",
    "graphql",
    "-f",
    "owner=ontos-protocol",
    "-f",
    "name=ontos-protocol",
    "-f",
    "query=query($owner:String!, $name:String!) { repository(owner:$owner, name:$name) { hasDiscussionsEnabled discussionCategories(first:20) { nodes { name } } } }",
    "--jq",
    ".data.repository.discussionCategories.nodes[].name"
  ),
  section("7. Public Boundary Recheck"),
  publicBoundaryCheck()
];

const script = [
  "#!/usr/bin/env bash",
  "set -euo pipefail",
  "",
  "# Generated external release verification command plan for .ontos Protocol 1.0.0.",
  "# Run after repository visibility, npm publishing, docs deployment, and GitHub release are complete.",
  "",
  "mkdir -p .release/verify-download",
  "",
  ...commands,
  "",
  "# The public-boundary rg command should exit 1 with no output. Any match is a launch blocker.",
  "echo 'external release verification commands completed; review command output before closing the release issue'"
].join("\n");

if (shouldCheck) {
  for (const required of [
    "gh repo view ontos-protocol/ontos-protocol --json",
    "gh api repos/ontos-protocol/ontos-protocol/branches/main/protection",
    "gh release view v1.0.0 --repo ontos-protocol/ontos-protocol",
    "gh release download v1.0.0 --repo ontos-protocol/ontos-protocol --pattern SHA256SUMS",
    "gh project list --owner ontos-protocol --format json",
    "npm view @ontos-protocol/schema@1.0.0 version",
    "npm view @ontos-protocol/cli dist-tags.latest",
    "npm run postpublish:smoke",
    "curl -fsSI https://ontos-protocol.github.io/ontos-protocol/",
    "curl -fsS https://ontos-protocol.github.io/ontos-protocol/examples/project-state.ontos",
    "npm run verify:extension-marketplaces",
    "gh issue list --repo ontos-protocol/ontos-protocol --label 'good first issue'",
    "gh issue list --repo ontos-protocol/ontos-protocol --label 'help wanted'",
    "gh api graphql -f owner=ontos-protocol",
    "public-boundary scan ok"
  ]) {
    assert.ok(script.includes(required), `external release verification missing ${required}`);
  }
  console.log("external release verification commands ok");
}

if (shouldWrite) {
  assert.ok(outputPath, "--write requires an output path");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${script}\n`, "utf8");
  console.log(`external release verification commands written to ${outputPath}`);
} else if (!shouldCheck) {
  console.log(script);
}

function command(...parts) {
  return `${parts.map(quoteShell).join(" ")}\n`;
}

function section(title) {
  return `\n# ${title}`;
}

function publicBoundaryCheck() {
  const pattern = [
    ["M", "VP"].join(""),
    "v0\\.",
    "@ontos 0\\.1",
    ["dot", "ontos"].join(""),
    ["@dot", "ontos"].join(""),
    ["@ontos", "fmt"].join(""),
    ["\\bO", "ntos\\b"].join(""),
    ["desktop", " Agent"].join(""),
    ["another", " project"].join(""),
    ["另", "一个"].join(""),
    ["桌", "面"].join(""),
    ["Public", " Preview"].join(""),
    ["preview", " package"].join("")
  ].join("|");
  const commandText = command(
    "rg",
    "-n",
    pattern,
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
    "docs",
    "spec",
    "packages",
    "scripts",
    "config",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    "examples",
    "extensions",
    "tests",
    "website/src",
    "apps",
    ".github",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    ".prettierrc.json",
    ".prettierignore"
  ).trim();
  return [
    "if " + commandText,
    "then",
    "  echo 'public-boundary scan found forbidden terms'",
    "  exit 1",
    "else",
    "  status=$?",
    "  if [ \"$status\" -eq 1 ]; then",
    "    echo 'public-boundary scan ok'",
    "  else",
    "    exit \"$status\"",
    "  fi",
    "fi",
    ""
  ].join("\n");
}

function quoteShell(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@+-]+$/u.test(text)) {
    return text;
  }
  return `'${text.replaceAll("'", "'\\''")}'`;
}
