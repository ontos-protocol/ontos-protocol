import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";

const args = new Set(process.argv.slice(2));
const writeIndex = process.argv.indexOf("--write");
const shouldCheck = args.has("--check");
const shouldWrite = writeIndex !== -1;
const outputDir = shouldWrite ? process.argv[writeIndex + 1] : ".release/launch-content-pack";

const sourcePath = "docs/LAUNCH_CONTENT.md";
const source = readFileSync(sourcePath, "utf8");
const sections = {
  core: section("Core Message"),
  faq: section("Short Maintainer FAQ"),
  comparison: section("Before And After Markdown Comparison"),
  article: section("Launch Article Draft"),
  xThread: section("X Thread Draft"),
  hackerNews: section("Hacker News Post Draft"),
  productHunt: section("Product Hunt Copy"),
  visualAssets: section("Visual Assets"),
  reddit: section("Reddit Post Draft"),
  linkedin: section("LinkedIn Post Draft")
};

const files = buildFiles();

if (shouldCheck) {
  validateSource();
  validateFiles(files);
  validateOutputDirectory(files);
  console.log("launch content pack ok");
}

if (shouldWrite) {
  mkdirSync(outputDir, { recursive: true });
  for (const [file, body] of files) {
    writeFileSync(join(outputDir, file), `${body.trimEnd()}\n`, "utf8");
  }
  console.log(`launch content pack written to ${outputDir}`);
} else if (!shouldCheck) {
  for (const [file, body] of files) {
    console.log(`--- ${file} ---`);
    console.log(body.trimEnd());
  }
}

function buildFiles() {
  const fileMap = new Map([
    ["README.md", readme()],
    ["core-message.md", frontmatter("Core Message", "canonical", sections.core)],
    ["maintainer-faq.md", frontmatter("Maintainer FAQ", "support", sections.faq)],
    ["before-after-markdown.md", frontmatter("Before And After Markdown", "demo", sections.comparison)],
    ["launch-article.md", frontmatter("Launch Article", "article", sections.article)],
    ["x-thread.md", frontmatter("X Thread", "social", sections.xThread)],
    ["hacker-news.md", frontmatter("Hacker News", "community", sections.hackerNews)],
    ["product-hunt.md", frontmatter("Product Hunt", "directory", sections.productHunt)],
    ["reddit.md", frontmatter("Reddit", "community", sections.reddit)],
    ["linkedin.md", frontmatter("LinkedIn", "professional", sections.linkedin)],
    ["visual-assets.md", frontmatter("Visual Assets", "media", sections.visualAssets)],
    ["submission-checklist.md", submissionChecklist()],
    ["metadata.json", `${JSON.stringify(metadata(), null, 2)}\n`]
  ]);
  return [...fileMap.entries()];
}

function readme() {
  const fileList = [
    "core-message.md",
    "launch-article.md",
    "x-thread.md",
    "hacker-news.md",
    "product-hunt.md",
    "reddit.md",
    "linkedin.md",
    "maintainer-faq.md",
    "before-after-markdown.md",
    "visual-assets.md",
    "submission-checklist.md",
    "metadata.json"
  ];
  return [
    "# Launch Content Pack",
    "",
    "Generated from `docs/LAUNCH_CONTENT.md` for the `.ontos Protocol 1.0.0` public release.",
    "",
    "Use this directory as the copy source for external launch posts, release",
    "announcements, and maintainer replies. Review every post in context before",
    "publishing.",
    "",
    "## Files",
    "",
    ...fileList.map((file) => `- \`${file}\``),
    "",
    "## Regenerate",
    "",
    "```bash",
    "npm run launch:content",
    "npm run validate:launch-content",
    "```"
  ].join("\n");
}

function submissionChecklist() {
  return [
    "# Submission Checklist",
    "",
    "- [ ] Confirm repository URL is public.",
    "- [ ] Confirm docs URL is live.",
    "- [ ] Confirm hosted viewer demo is live.",
    "- [ ] Confirm `@ontos-protocol/cli@1.0.0` installs.",
    "- [ ] Confirm `.release/ontos-protocol-60s-demo.mp4` has been reviewed.",
    "- [ ] Use `.ontos Protocol` as the project name.",
    "- [ ] Use `ontosfmt` as the CLI name.",
    "- [ ] Use `ontos-protocol` as the repository name.",
    "- [ ] Keep the message local-first and Git-friendly.",
    "- [ ] Do not claim `.ontos` replaces Markdown for articles.",
    "- [ ] Do not include private context or unrelated product names.",
    "- [ ] Record each published URL in `docs/RELEASE_APPROVAL_PACKET_1.0.0.md`."
  ].join("\n");
}

function metadata() {
  return {
    project: ".ontos Protocol",
    version: "1.0.0",
    repository: "ontos-protocol/ontos-protocol",
    packageScope: "@ontos-protocol",
    cli: "ontosfmt",
    source: sourcePath,
    generatedFiles: filesWithoutMetadata(),
    canonicalMessage: "Markdown for articles. .ontos for AI-native project context.",
    docsUrl: "https://ontos-protocol.github.io/ontos-protocol/",
    npmPackage: "@ontos-protocol/cli",
    releaseTag: "v1.0.0"
  };
}

function filesWithoutMetadata() {
  return [
    "README.md",
    "core-message.md",
    "maintainer-faq.md",
    "before-after-markdown.md",
    "launch-article.md",
    "x-thread.md",
    "hacker-news.md",
    "product-hunt.md",
    "reddit.md",
    "linkedin.md",
    "visual-assets.md",
    "submission-checklist.md"
  ];
}

function frontmatter(title, channel, body) {
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    `channel: ${JSON.stringify(channel)}`,
    "source: \"docs/LAUNCH_CONTENT.md\"",
    "---",
    "",
    body.trim()
  ].join("\n");
}

function validateSource() {
  for (const [name, body] of Object.entries(sections)) {
    assert.ok(body.trim().length > 0, `missing launch content section: ${name}`);
  }

  assert.ok(sections.core.includes(".ontos Protocol"), "core message must use public project name");
  assert.ok(sections.core.includes("Markdown for articles. .ontos for AI-native project context."));
  assert.ok(sections.faq.includes("Markdown remains excellent"));
  assert.ok(sections.faq.includes("@ontos-protocol/parser"));
  assert.ok(sections.article.includes("npm install -g @ontos-protocol/cli"));
  assert.ok(sections.article.includes("ontosfmt validate examples/project-state.ontos"));
  assert.ok(sections.article.includes("ontosfmt pack examples/ai-handoff.ontos"));
  assert.ok(sections.comparison.includes("```markdown"));
  assert.ok(sections.comparison.includes("```text"));
  assert.ok(sections.comparison.includes("@ontos 1.0"));
  assert.equal(numberedItems(sections.xThread), 7, "X thread should contain 7 numbered posts");
  assert.ok(sections.hackerNews.includes("Show HN: .ontos Protocol"));
  assert.ok(titleLine(sections.hackerNews).length <= 80, "Hacker News title should be short");
  assert.ok(productHuntTagline(sections.productHunt).length <= 60, "Product Hunt tagline should be short");
  assert.ok(sections.reddit.includes(".ontos Protocol"));
  assert.ok(sections.linkedin.includes(".ontos Protocol"));

  for (const asset of [
    "website/src/assets/viewer-screenshot.svg",
    "website/src/assets/cli-screenshot.svg",
    "website/src/assets/social-preview.svg"
  ]) {
    assert.ok(sections.visualAssets.includes(asset), `visual asset section missing ${asset}`);
    assert.ok(existsSync(asset), `visual asset does not exist: ${asset}`);
  }
}

function validateFiles(fileEntries) {
  const expected = new Set([...filesWithoutMetadata(), "metadata.json"]);
  assert.equal(fileEntries.length, expected.size, "unexpected generated file count");
  for (const [file, body] of fileEntries) {
    assert.ok(expected.has(file), `unexpected launch content file: ${file}`);
    assert.ok(body.trim().length > 0, `${file} is empty`);
    assertPublicText(file, body);
  }

  const names = fileEntries.map(([file]) => file).sort();
  assert.deepEqual(names, [...expected].sort());

  const metadataFile = JSON.parse(fileEntries.find(([file]) => file === "metadata.json")[1]);
  assert.equal(metadataFile.project, ".ontos Protocol");
  assert.equal(metadataFile.cli, "ontosfmt");
  assert.equal(metadataFile.packageScope, "@ontos-protocol");
  assert.deepEqual(metadataFile.generatedFiles, filesWithoutMetadata());
}

function validateOutputDirectory(fileEntries) {
  if (!existsSync(outputDir)) {
    throw new Error(`missing launch content output directory: ${outputDir}; run npm run launch:content`);
  }

  for (const [file, body] of fileEntries) {
    const path = join(outputDir, file);
    assert.ok(existsSync(path), `missing generated launch content file: ${path}`);
    assert.equal(readFileSync(path, "utf8"), `${body.trimEnd()}\n`, `${path} is stale`);
  }
}

function section(title) {
  const lines = source.split(/\r?\n/u);
  const start = lines.findIndex((line) => line === `## ${title}`);
  assert.notEqual(start, -1, `missing section ${title}`);
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) {
      break;
    }
    body.push(line);
  }
  return body.join("\n").trim();
}

function numberedItems(markdown) {
  return markdown.split(/\r?\n/u).filter((line) => /^\d+\. /u.test(line)).length;
}

function titleLine(markdown) {
  const lines = markdown.split(/\r?\n/u);
  const index = lines.findIndex((line) => line === "Title:");
  assert.notEqual(index, -1, "missing Hacker News title marker");
  return lines[index + 2] ?? "";
}

function productHuntTagline(markdown) {
  const lines = markdown.split(/\r?\n/u);
  const index = lines.findIndex((line) => line === "Tagline:");
  assert.notEqual(index, -1, "missing Product Hunt tagline marker");
  return lines[index + 2] ?? "";
}

function assertPublicText(file, body) {
  const forbidden = [
    ["M", "VP"].join(""),
    "v" + "0.",
    "@ontos " + "0.1",
    ["dot", "ontos"].join(""),
    ["@dot", "ontos"].join(""),
    ["@ontos", "fmt"].join(""),
    ["O", "ntos"].join(""),
    ["desktop", " Agent"].join(""),
    ["another", " project"].join(""),
    ["另", "一个"].join(""),
    ["桌", "面"].join(""),
    ["Public", " Preview"].join(""),
    ["preview", " package"].join("")
  ];
  for (const term of forbidden) {
    assert.equal(body.includes(term), false, `${file} contains forbidden public-surface term`);
  }
}
