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

const config = JSON.parse(readFileSync("config/github-project-board.json", "utf8"));

assert.ok(config.title.length > 0, "project board title is required");
assert.ok(config.owner.length > 0, "project board owner is required");
assert.ok(config.statusField.options.length >= 6, "status field needs launch columns");
assert.ok(config.areaField.options.length >= 5, "area field needs suggested views");
assert.ok(config.draftItems.length >= 5, "project board needs launch draft items");

const commands = [
  section("0. Verify Project Scope"),
  "gh project list --owner " + quoteShell(config.owner) + " --limit 1 >/dev/null",
  section("1. Create or Select Project"),
  "PROJECT_NUMBER=$(gh project list --owner " + quoteShell(config.owner) + " --format json --jq " + quoteShell(`.projects[] | select(.title == ${JSON.stringify(config.title)}) | .number`) + " | head -n 1)",
  'if [ -z "${PROJECT_NUMBER}" ]; then',
  "  PROJECT_NUMBER=$(gh project create --owner " + quoteShell(config.owner) + " --title " + quoteShell(config.title) + " --format json --jq .number)",
  "  echo \"Created project number: $PROJECT_NUMBER\"",
  "else",
  "  echo \"Selected existing project number: $PROJECT_NUMBER\"",
  "fi",
  "",
  section("2. Create Fields"),
  fieldCommand(
    config.statusField.name,
    "gh",
    "project",
    "field-create",
    "$PROJECT_NUMBER",
    "--owner",
    config.owner,
    "--name",
    config.statusField.name,
    "--data-type",
    "SINGLE_SELECT",
    "--single-select-options",
    config.statusField.options.join(",")
  ),
  fieldCommand(
    config.areaField.name,
    "gh",
    "project",
    "field-create",
    "$PROJECT_NUMBER",
    "--owner",
    config.owner,
    "--name",
    config.areaField.name,
    "--data-type",
    "SINGLE_SELECT",
    "--single-select-options",
    config.areaField.options.join(",")
  ),
  fieldCommand(
    "Evidence URL",
    "gh",
    "project",
    "field-create",
    "$PROJECT_NUMBER",
    "--owner",
    config.owner,
    "--name",
    "Evidence URL",
    "--data-type",
    "TEXT"
  ),
  section("3. Create Draft Items"),
  ...config.draftItems.map((item) => itemCommand(item)),
  section("4. Manual View Setup"),
  ...config.suggestedViews.map((view) => `echo "Create project view manually: ${view}"`),
  "",
  "echo 'GitHub project board command pack completed; configure views and field values in the GitHub UI if needed.'"
];

const script = [
  "#!/usr/bin/env bash",
  "set -euo pipefail",
  "",
  "# Generated GitHub project board command plan for .ontos Protocol 1.0.0.",
  "# Requires gh auth with the project scope.",
  "",
  ...commands
].join("\n");

if (shouldCheck) {
  for (const required of [
    "gh project list --owner ontos-protocol --limit 1 >/dev/null",
    "Selected existing project number: $PROJECT_NUMBER",
    "gh project create --owner ontos-protocol --title '.ontos Protocol 1.0 Launch'",
    "gh project field-create $PROJECT_NUMBER --owner ontos-protocol --name 'Launch Status' --data-type SINGLE_SELECT",
    "Backlog,Ready,In progress,In review,Blocked,Done",
    "gh project field-create $PROJECT_NUMBER --owner ontos-protocol --name Area --data-type SINGLE_SELECT",
    "1.0 release gate,Docs and examples,Parser and CLI,Viewer and editor integrations,Launch response",
    "gh project item-create $PROJECT_NUMBER --owner ontos-protocol",
    "Create project view manually: Launch response"
  ]) {
    assert.ok(script.includes(required), `project board commands missing ${required}`);
  }
  assert.equal((script.match(/gh project item-create \$PROJECT_NUMBER/gu) ?? []).length, config.draftItems.length);
  console.log("github project board commands ok");
}

if (shouldWrite) {
  assert.ok(outputPath, "--write requires an output path");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${script}\n`, "utf8");
  console.log(`github project board commands written to ${outputPath}`);
} else if (!shouldCheck) {
  console.log(script);
}

function command(...parts) {
  return `${parts.map(quoteShell).join(" ")}\n`;
}

function section(title) {
  return `\n# ${title}`;
}

function fieldCommand(name, ...createParts) {
  const jq = `.fields[] | select(.name == ${JSON.stringify(name)}) | .id`;
  return [
    `if gh project field-list $PROJECT_NUMBER --owner ${quoteShell(config.owner)} --format json --jq ${quoteShell(jq)} | grep -q .; then`,
    `  echo ${quoteShell(`Field exists: ${name}`)}`,
    "else",
    `  ${command(...createParts).trimEnd()}`,
    "fi",
    ""
  ].join("\n");
}

function itemCommand(item) {
  const jq = `.items[] | select((.content.title // .title // "") == ${JSON.stringify(item.title)}) | .id`;
  return [
    `if gh project item-list $PROJECT_NUMBER --owner ${quoteShell(config.owner)} --format json --limit 100 --jq ${quoteShell(jq)} | grep -q .; then`,
    `  echo ${quoteShell(`Draft item exists: ${item.title}`)}`,
    "else",
    `  ${command(
      "gh",
      "project",
      "item-create",
      "$PROJECT_NUMBER",
      "--owner",
      config.owner,
      "--title",
      item.title,
      "--body",
      `Area: ${item.area}\n\n${item.body}`
    ).trimEnd()}`,
    "fi",
    ""
  ].join("\n");
}

function quoteShell(value) {
  const text = String(value);
  if (text === "$PROJECT_NUMBER") {
    return text;
  }
  if (/^[A-Za-z0-9_./:=@+-]+$/u.test(text)) {
    return text;
  }
  return `'${text.replaceAll("'", "'\\''")}'`;
}
