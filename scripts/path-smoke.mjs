import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "ontos path smoke-"));

try {
  const nestedDir = join(tempDir, "folder with spaces", "样例");
  mkdirSync(nestedDir, { recursive: true });
  const file = join(nestedDir, "project state.ontos");
  writeFileSync(
    file,
    [
      "@ontos 1.0",
      "@title Path smoke",
      "",
      "- Root @id(root)",
      "  purpose: Validate paths with spaces and Unicode.",
      "  verify: [[root.purpose]]",
      ""
    ].join("\n"),
    "utf8"
  );

  run(["packages/cli/src/index.js", "validate", file]);
  run(["packages/cli/src/index.js", "format", "--check", file]);
  const json = run(["packages/cli/src/index.js", "export", file, "--to", "json"]);
  if (JSON.parse(json).metadata.title !== "Path smoke") {
    throw new Error("Path smoke JSON export did not preserve metadata.");
  }

  const markdown = run(["packages/cli/src/index.js", "export", file, "--to", "md"]);
  if (!markdown.includes("Path smoke")) {
    throw new Error("Path smoke Markdown export did not include title.");
  }

  run(["packages/cli/src/index.js", "validate", join(nestedDir, "*.ontos"), "--quiet"]);

  const output = readFileSync(file, "utf8");
  if (!output.endsWith("\n")) {
    throw new Error("Path smoke fixture lost final newline.");
  }

  console.log("path smoke ok");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

function run(args) {
  return execFileSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

