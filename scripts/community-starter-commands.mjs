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
const source = readFileSync("docs/COMMUNITY_STARTER_ISSUES.md", "utf8");
const issues = parseIssues(source);

const commands = issues.flatMap((issue) => [
  section(issue.title),
  writeBody(issue),
  command(
    "gh",
    "issue",
    "create",
    "--repo",
    settings.repository,
    "--title",
    issue.title,
    ...issue.labels.flatMap((label) => ["--label", label]),
    "--body-file",
    `.release/community-issue-bodies/${slugify(issue.title)}.md`
  )
]);

const script = [
  "#!/usr/bin/env bash",
  "set -euo pipefail",
  "",
  "# Generated starter issue command plan for .ontos Protocol.",
  "# Run after the repository is public and labels are configured.",
  "",
  "mkdir -p .release/community-issue-bodies",
  "",
  ...commands
].join("\n");

if (shouldCheck) {
  assert.equal(issues.length, 9, "expected 9 community starter issues");
  assert.equal(issues.filter((issue) => issue.labels.includes("good first issue")).length, 4);
  assert.equal(issues.filter((issue) => issue.labels.includes("help wanted")).length, 5);
  for (const issue of issues) {
    assert.ok(issue.summary.length > 0, `${issue.title} missing summary`);
    assert.ok(issue.acceptance.length >= 3, `${issue.title} needs at least 3 acceptance checks`);
    assert.ok(script.includes(`gh issue create --repo ${settings.repository}`), "script missing gh issue create");
    assert.ok(script.includes(`--body-file .release/community-issue-bodies/${slugify(issue.title)}.md`));
  }
  for (const label of [
    "good first issue",
    "help wanted",
    "documentation",
    "conformance",
    "compatibility",
    "rfc"
  ]) {
    assert.ok(script.includes(`--label '${label}'`) || script.includes(`--label ${label}`), `script missing label ${label}`);
  }
  console.log("community starter commands ok");
}

if (shouldWrite) {
  assert.ok(outputPath, "--write requires an output path");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${script}\n`, "utf8");
  console.log(`community starter commands written to ${outputPath}`);
} else if (!shouldCheck) {
  console.log(script);
}

function parseIssues(markdown) {
  const lines = markdown.split(/\r?\n/u);
  const parsed = [];
  let currentGroup = "";
  let current = null;
  let mode = "";

  for (const line of lines) {
    const group = line.match(/^## (Good First Issue Seeds|Help Wanted Issue Seeds)$/u)?.[1];
    if (group) {
      currentGroup = group;
      current = null;
      mode = "";
      continue;
    }

    if (!currentGroup || line.startsWith("## ")) {
      current = null;
      mode = "";
      continue;
    }

    const title = line.match(/^### (.+)$/u)?.[1];
    if (title) {
      current = { title, group: currentGroup, labels: [], summary: "", acceptance: [] };
      parsed.push(current);
      mode = "";
      continue;
    }

    if (!current) {
      continue;
    }

    const labels = line.match(/^Labels: (.+)$/u)?.[1];
    if (labels) {
      current.labels = [...labels.matchAll(/`([^`]+)`/gu)].map((match) => match[1]);
      continue;
    }

    if (line === "Summary:") {
      mode = "summary";
      continue;
    }

    if (line === "Acceptance:") {
      mode = "acceptance";
      continue;
    }

    if (mode === "summary" && line.trim().length > 0) {
      current.summary = current.summary.length === 0 ? line : `${current.summary}\n${line}`;
      continue;
    }

    const acceptance = line.match(/^- (.+)$/u)?.[1];
    if (mode === "acceptance" && acceptance) {
      current.acceptance.push(acceptance);
    }
  }

  for (const issue of parsed) {
    assert.ok(issue.labels.length > 0, `${issue.title} missing labels`);
  }
  return parsed;
}

function writeBody(issue) {
  const body = [
    `cat > .release/community-issue-bodies/${slugify(issue.title)}.md <<'EOF'`,
    `Source: docs/COMMUNITY_STARTER_ISSUES.md`,
    `Group: ${issue.group}`,
    "",
    "## Summary",
    "",
    issue.summary,
    "",
    "## Acceptance",
    "",
    ...issue.acceptance.map((item) => `- [ ] ${item}`),
    "",
    "## Contributor Notes",
    "",
    "- Keep changes public and local-first.",
    "- Do not introduce new syntax unless an RFC is accepted.",
    "- Run the listed validation command before opening a pull request.",
    "EOF",
    ""
  ];
  return body.join("\n");
}

function command(...parts) {
  return `${parts.map(quoteShell).join(" ")}\n`;
}

function section(title) {
  return `\n# ${title}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

function quoteShell(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@+-]+$/u.test(text)) {
    return text;
  }
  return `'${text.replaceAll("'", "'\\''")}'`;
}
