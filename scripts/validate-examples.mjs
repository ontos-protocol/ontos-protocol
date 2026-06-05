import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const snapshot = JSON.parse(readFileSync("tests/snapshots/examples/summary.json", "utf8"));
const examples = readdirSync("examples")
  .filter((file) => file.endsWith(".ontos"))
  .sort()
  .map((file) => join("examples", file));

if (examples.length === 0) {
  throw new Error("No official examples found.");
}

for (const file of examples) {
  const name = file.split("/").at(-1);
  const expected = snapshot.examples[name];
  if (!expected) {
    throw new Error(`${name} is missing from example snapshot summary.`);
  }
  const validation = run(["packages/cli/src/index.js", "validate", file]);
  assertHash(`${name} validation`, validation, expected.validation);
  for (const target of ["md", "html", "json", "opml"]) {
    const output = run(["packages/cli/src/index.js", "export", file, "--to", target]);
    if (output.trim().length === 0) {
      throw new Error(`${file} exported empty ${target} output.`);
    }
    if (target === "json") {
      JSON.parse(output);
    }
    assertHash(`${name} ${target} export`, output, expected.exports[target]);
  }
}

for (const name of Object.keys(snapshot.examples)) {
  if (!examples.some((file) => file.endsWith(name))) {
    throw new Error(`${name} is present in snapshots but missing from examples.`);
  }
}

console.log(`validated ${examples.length} official examples`);

function run(args) {
  return execFileSync(process.execPath, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function assertHash(label, value, expected) {
  const actual = createHash("sha256").update(value).digest("hex");
  if (actual !== expected) {
    throw new Error(`${label} snapshot changed: expected ${expected}, got ${actual}.`);
  }
}
