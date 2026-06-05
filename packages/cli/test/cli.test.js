import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../src/index.js";

const valid = "spec/conformance/valid/project-state.ontos";
const invalid = "spec/conformance/invalid/duplicate-id.ontos";
const rich = "spec/conformance/valid/rich-fields.ontos";
const exportSnapshots = {
  md: "spec/conformance/exports/project-state.md",
  html: "spec/conformance/exports/project-state.html",
  json: "spec/conformance/exports/project-state.json",
  opml: "spec/conformance/exports/project-state.opml"
};
const importFixtures = {
  markdown: "spec/conformance/imports/project-brief.md",
  markdownSnapshot: "spec/conformance/imports/project-brief.from-md.ontos",
  complexMarkdown: "spec/conformance/imports/complex-markdown.md",
  complexMarkdownSnapshot: "spec/conformance/imports/complex-markdown.from-md.ontos",
  complexMarkdownReport: "spec/conformance/imports/complex-markdown.report.json",
  opml: "spec/conformance/imports/launch-outline.opml",
  opmlSnapshot: "spec/conformance/imports/launch-outline.from-opml.ontos"
};
const packSnapshots = {
  context: "spec/conformance/packs/current-release.context.md",
  review: "spec/conformance/packs/parser-package.review.json",
  handoff: "spec/conformance/packs/cli-package.handoff.md"
};
const formatFixtures = {
  unformatted: "spec/conformance/format/unformatted.ontos",
  formatted: "spec/conformance/format/formatted.ontos",
  diff: "spec/conformance/format/unformatted.diff"
};

function invoke(argv, options = {}) {
  let stdout = "";
  let stderr = "";
  const code = run(argv, {
    stdin: options.stdin,
    out: (value) => {
      stdout += value;
    },
    err: (value) => {
      stderr += value;
    }
  });
  return { code, stdout, stderr };
}

function snapshot(path) {
  return readFileSync(path, "utf8");
}

const dir = mkdtempSync(join(tmpdir(), "ontosfmt-"));

let result = invoke(["--help"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /ontosfmt 1\.0\.0/);

result = invoke(["--version"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, "1.0.0\n");

result = invoke(["validate", valid]);
assert.equal(result.code, 0);
assert.match(result.stdout, /ok/);

result = invoke(["validate", invalid, "--json"]);
assert.equal(result.code, 1);
assert.match(result.stdout, /ONTOS1203/);

const semantic = join(dir, "semantic.ontos");
writeFileSync(
  semantic,
  `@ontos 1.0
@title Semantic
@type product-spec

- Requirement
  purpose: Define behavior.
  old_field: <script>alert("x")</script>
`,
  "utf8"
);
result = invoke([
  "validate",
  semantic,
  "--json",
  "--strict-ids",
  "--recommended",
  "--check-formatting",
  "--deprecated-fields",
  "old_field:purpose"
]);
assert.equal(result.code, 1);
assert.ok(JSON.parse(result.stdout).some((diagnostic) => diagnostic.code === "ONTOS1205"));
assert.ok(JSON.parse(result.stdout).some((diagnostic) => diagnostic.code === "ONTOS1601"));
assert.ok(JSON.parse(result.stdout).some((diagnostic) => diagnostic.code === "ONTOS1603"));
assert.ok(JSON.parse(result.stdout).some((diagnostic) => diagnostic.code === "ONTOS1701"));

result = invoke(["parse", valid]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).metadata.title, "Project state example");

result = invoke(["format", "--check", valid]);
assert.equal(result.code, 0);
assert.match(result.stdout, /formatted/);

result = invoke(["format", formatFixtures.unformatted]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(formatFixtures.formatted));

result = invoke(["format", "--diff", formatFixtures.unformatted]);
assert.equal(result.code, 1);
assert.equal(result.stdout, snapshot(formatFixtures.diff));

for (const invalidFormatFixture of [
  "spec/conformance/invalid/invalid-header.ontos",
  "spec/conformance/invalid/invalid-tag.ontos",
  "spec/conformance/invalid/tab-indentation.ontos"
]) {
  result = invoke(["format", invalidFormatFixture]);
  assert.equal(result.code, 1);
  assert.match(result.stdout, /ONTOS/);
}

result = invoke(["format", "-", "--check"], { stdin: snapshot(formatFixtures.formatted) });
assert.equal(result.code, 0);
assert.match(result.stdout, /-: formatted/);

result = invoke(["format", "-", "--quiet"], { stdin: snapshot(formatFixtures.unformatted) });
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(formatFixtures.formatted));
assert.throws(
  () => invoke(["format", "-", "--write"], { stdin: snapshot(formatFixtures.unformatted) }),
  /Cannot write formatted stdin/
);

const writeTarget = join(dir, "write.ontos");
writeFileSync(writeTarget, snapshot(formatFixtures.unformatted), "utf8");
result = invoke(["format", "--write", writeTarget]);
assert.equal(result.code, 0);
assert.equal(readFileSync(writeTarget, "utf8"), snapshot(formatFixtures.formatted));
result = invoke(["format", "--check", writeTarget]);
assert.equal(result.code, 0);

const invalidWriteTarget = join(dir, "invalid-write.ontos");
const invalidWriteInput = snapshot("spec/conformance/invalid/invalid-header.ontos");
writeFileSync(invalidWriteTarget, invalidWriteInput, "utf8");
result = invoke(["format", "--write", invalidWriteTarget]);
assert.equal(result.code, 1);
assert.equal(readFileSync(invalidWriteTarget, "utf8"), invalidWriteInput);

const atomicValidTarget = join(dir, "atomic-valid.ontos");
const atomicInvalidTarget = join(dir, "atomic-invalid.ontos");
writeFileSync(atomicValidTarget, snapshot(formatFixtures.unformatted), "utf8");
writeFileSync(atomicInvalidTarget, invalidWriteInput, "utf8");
result = invoke(["format", "--write", atomicValidTarget, atomicInvalidTarget]);
assert.equal(result.code, 1);
assert.equal(readFileSync(atomicValidTarget, "utf8"), snapshot(formatFixtures.unformatted));
assert.equal(readFileSync(atomicInvalidTarget, "utf8"), invalidWriteInput);

const warningOnly = join(dir, "warning-only.ontos");
writeFileSync(
  warningOnly,
  `@ontos 1.0
@title Warning only
@type custom-type

- Root @id(root)
  purpose: Warnings do not block formatting.
`,
  "utf8"
);
result = invoke(["format", warningOnly]);
assert.equal(result.code, 0);
assert.match(result.stdout, /@type custom-type/);

const globDir = join(dir, "glob");
const globA = join(globDir, "a.ontos");
const globB = join(globDir, "b.ontos");
mkdirSync(globDir);
writeFileSync(globA, snapshot(formatFixtures.formatted), "utf8");
writeFileSync(globB, snapshot(formatFixtures.formatted), "utf8");
result = invoke(["validate", `${globDir}/*.ontos`, "--quiet"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, "");

result = invoke(["validate", invalid, "--ci"]);
assert.equal(result.code, 1);
assert.match(result.stdout, /::error file=spec\/conformance\/invalid\/duplicate-id\.ontos/);

result = invoke(["validate", invalid, "--color"]);
assert.equal(result.code, 1);
assert.match(result.stdout, /\u001b\[31merror\u001b\[0m/);

result = invoke(["validate", valid, "--verbose"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /1 file, 0 diagnostics/);

result = invoke(["export", valid, "--to", "md"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(exportSnapshots.md));

result = invoke(["export", valid, "--to", "md", "--front-matter", "--toc", "--heading-offset", "1"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /^---\ntitle: "Project state example"/);
assert.match(result.stdout, /## Project state example/);
assert.match(result.stdout, /## Table of Contents/);
assert.match(result.stdout, /- \[Current release\]\(#current-release\)/);

result = invoke(["export", valid, "--to", "html"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(exportSnapshots.html));

result = invoke(["export", valid, "--to", "html", "--search-index"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /id="ontos-search-index"/);
assert.match(result.stdout, /"current-release"/);

result = invoke(["export", valid, "--to", "json"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).formatVersion, "1.0");
assert.equal(result.stdout, snapshot(exportSnapshots.json));

result = invoke(["export", invalid, "--to", "json", "--include-diagnostics", "--include-source"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).diagnostics[0].code, "ONTOS1203");
assert.equal(JSON.parse(result.stdout).nodes[0].source.start.line, 4);

result = invoke(["export", valid, "--to", "opml"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(exportSnapshots.opml));

result = invoke(["export", valid, "--to", "opml", "--opml-fields", "purpose,status"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /_field_purpose="Track the formal open-source release\."/);
assert.match(result.stdout, /_field_status="active"/);

result = invoke(["export", rich, "--to", "md"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /```js/);
assert.match(result.stdout, /console\.log/);
assert.match(result.stdout, /\[\[rich-field-node\.purpose\]\]/);

result = invoke(["export", rich, "--to", "html"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /<pre><code class="language-js">/);
assert.match(result.stdout, /console\.log/);

result = invoke(["export", rich, "--to", "json"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).nodes[0].fields.snippet.kind, "code");

const escaping = join(dir, "escaping.ontos");
writeFileSync(
  escaping,
  `@ontos 1.0
@title Escape <Check> & "Quote" 'Apostrophe'

- Node <One> & "Two" 'Three' @id(node-one)
  purpose: Use <tag> & "quote" plus 'apostrophe'.
`,
  "utf8"
);
result = invoke(["export", escaping, "--to", "html"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /Escape &lt;Check&gt; &amp; &quot;Quote&quot; 'Apostrophe'/);
assert.match(result.stdout, /<summary>Node &lt;One&gt; &amp; &quot;Two&quot; 'Three'<\/summary>/);
assert.match(result.stdout, /Use &lt;tag&gt; &amp; &quot;quote&quot; plus 'apostrophe'\./);

result = invoke(["export", escaping, "--to", "opml"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /Escape &lt;Check&gt; &amp; &quot;Quote&quot; &apos;Apostrophe&apos;/);
assert.match(result.stdout, /Node &lt;One&gt; &amp; &quot;Two&quot; &apos;Three&apos;/);

result = invoke(["inspect", valid, "--node", "parser-package"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /Current release > Parser package/);

result = invoke(["list", "nodes", valid]);
assert.equal(result.code, 0);
assert.match(result.stdout, /parser-package\tParser package/);

result = invoke(["list", "fields", valid]);
assert.equal(result.code, 0);
assert.match(result.stdout, /purpose/);

result = invoke(["stats", valid]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).nodes, 3);

result = invoke(["pack", valid, "--node", "current-release", "--for", "context"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(packSnapshots.context));

result = invoke(["pack", valid, "--node", "parser-package", "--for", "review", "--json"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).kind, "review");
assert.equal(result.stdout, snapshot(packSnapshots.review));

result = invoke(["pack", rich, "--node", "rich-field-node", "--for", "verification", "--json"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).kind, "verification");
assert.equal(JSON.parse(result.stdout).linkedReferences[0].target, "rich-field-node.purpose");
assert.equal(JSON.parse(result.stdout).sourceReferences[0].target, "./docs/rich-fields.md");

result = invoke(["pack", valid, "--node", "current-release", "--for", "verification", "--token-budget", "10", "--json"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).tokenBudget.truncated, true);

const sensitive = join(dir, "sensitive.ontos");
writeFileSync(
  sensitive,
  `@ontos 1.0
@title Sensitive pack

- Sensitive node @id(sensitive-node)
  purpose: Confirm pack filtering.
  secret: do-not-export
  locked:
    - Preserve this boundary.
`,
  "utf8"
);
result = invoke(["pack", sensitive, "--node", "sensitive-node", "--for", "context", "--json"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).fields.secret, undefined);
assert.deepEqual(JSON.parse(result.stdout).fields.locked, ["Preserve this boundary."]);

result = invoke(["pack", valid, "--node", "cli-package", "--for", "handoff"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(packSnapshots.handoff));

result = invoke(["convert", importFixtures.markdown, "--to", ".ontos"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(importFixtures.markdownSnapshot));
result = invoke(["validate", importFixtures.markdownSnapshot]);
assert.equal(result.code, 0);

result = invoke(["convert", importFixtures.complexMarkdown, "--to", ".ontos", "--report"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(importFixtures.complexMarkdownSnapshot));
assert.equal(result.stderr, snapshot(importFixtures.complexMarkdownReport));
result = invoke(["validate", importFixtures.complexMarkdownSnapshot]);
assert.equal(result.code, 0);

result = invoke(["convert", importFixtures.opml, "--to", ".ontos"]);
assert.equal(result.code, 0);
assert.equal(result.stdout, snapshot(importFixtures.opmlSnapshot));
result = invoke(["validate", importFixtures.opmlSnapshot]);
assert.equal(result.code, 0);

result = invoke(["schema"]);
assert.equal(result.code, 0);
assert.equal(JSON.parse(result.stdout).title, ".ontos AST Schema 1.0");

result = invoke(["doctor"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /status ok/);

const markdown = join(dir, "README.md");
writeFileSync(markdown, "# Demo\n\nHello world.\n\n## Child\n\nMore text.\n", "utf8");
result = invoke(["convert", markdown, "--to", ".ontos"]);
assert.equal(result.code, 0);
assert.match(result.stdout, /@ontos 1.0/);
assert.match(result.stdout, /- Child @id\(child\)/);

console.log("cli smoke ok");
